(function () {
  "use strict";
  const form = document.getElementById("formLogin");
  const emailField = document.getElementById("email");
  const passwordField = document.getElementById("senha");
  const nameField = document.getElementById("nome");
  const confirmField = document.getElementById("confirmarSenha");
  const remember = document.getElementById("lembrar");
  const message = document.getElementById("mensagem");
  const title = document.getElementById("formTitulo");
  const description = document.getElementById("formDescricao");
  const submitButton = document.getElementById("botaoEnviar");
  const tabs = [document.getElementById("abaEntrar"), document.getElementById("abaCadastro")];
  const registerOnly = document.querySelectorAll(".cadastro-only");
  const confirmGroup = document.querySelector(".cadastro-or-reset");
  const rememberGroup = remember.closest(".remember");
  let mode = "login";

  function sessionExists() {
    try { return [localStorage, sessionStorage].some((s) => s.getItem("cashyLogado") === "true"); }
    catch (_) { return false; }
  }
  if (sessionExists()) { location.replace("dashboard.html"); return; }

  function showMessage(text, type) {
    message.textContent = text;
    message.className = "message " + (type || "");
  }
  function setMode(next) {
    mode = next;
    const registering = mode === "register";
    const resetting = mode === "reset";
    tabs[0].closest(".form-tabs").hidden = resetting;
    document.getElementById("cancelarReset").hidden = !resetting;
    [nameField, emailField, passwordField, confirmField].forEach((field) => field.removeAttribute("aria-invalid"));
    passwordField.value = ""; confirmField.value = ""; passwordField.type = "password";
    const passwordToggle = document.getElementById("mostrarSenha");
    passwordToggle.textContent = "Mostrar"; passwordToggle.setAttribute("aria-label", "Mostrar senha"); passwordToggle.setAttribute("aria-pressed", "false");
    tabs.forEach((tab, index) => {
      const active = !resetting && index === (registering ? 1 : 0);
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    const loginForm = document.getElementById("formLogin");
    if (resetting) { loginForm.removeAttribute("role"); loginForm.setAttribute("aria-labelledby", "formTitulo"); }
    else { loginForm.setAttribute("role", "tabpanel"); loginForm.setAttribute("aria-labelledby", registering ? "abaCadastro" : "abaEntrar"); }
    registerOnly.forEach((field) => { field.hidden = !registering; });
    confirmGroup.hidden = !registering && !resetting;
    nameField.required = registering;
    confirmField.required = registering || resetting;
    nameField.setAttribute("aria-required", String(registering));
    confirmField.setAttribute("aria-required", String(registering || resetting));
    rememberGroup.hidden = resetting;
    title.textContent = resetting ? "Redefina sua senha" : registering ? "Crie sua conta" : "Bem-vindo de volta";
    description.textContent = resetting ? "A redefinição será salva somente neste navegador." : registering ? "Comece a cuidar melhor do seu dinheiro." : "Entre na sua conta e aprenda sobre dinheiro no seu ritmo.";
    submitButton.innerHTML = resetting ? 'Salvar nova senha <span aria-hidden="true">→</span>' : registering ? 'Criar minha conta <span aria-hidden="true">→</span>' : 'Entrar <span aria-hidden="true">→</span>';
    document.getElementById("esqueciSenha").hidden = registering || resetting;
    passwordField.autocomplete = registering || resetting ? "new-password" : "current-password";
    document.getElementById("confirmarLabel").textContent = resetting ? "Confirme a nova senha" : "Confirme sua senha";
    showMessage("", "");
  }
  tabs[0].addEventListener("click", () => setMode("login"));
  tabs[1].addEventListener("click", () => setMode("register"));
  document.getElementById("cancelarReset").addEventListener("click", () => setMode("login"));
  tabs.forEach((tab, index) => tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
    tabs[next].focus(); tabs[next].click();
  }));
  if (new URLSearchParams(location.search).get("modo") === "cadastro") setMode("register");
  document.getElementById("mostrarSenha").addEventListener("click", function () {
    const show = passwordField.type === "password";
    passwordField.type = show ? "text" : "password";
    this.textContent = show ? "Ocultar" : "Mostrar";
    this.setAttribute("aria-label", show ? "Ocultar senha" : "Mostrar senha");
    this.setAttribute("aria-pressed", String(show));
  });

  async function hashPassword(password) {
    if (!window.crypto || !crypto.subtle) throw new Error("secure-context");
    const bytes = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  function readUsers() {
    try { return JSON.parse(localStorage.getItem("cashyUsuarios") || "{}"); }
    catch (_) { return {}; }
  }
  function saveSession(user) {
    const storage = remember.checked ? localStorage : sessionStorage;
    const other = remember.checked ? sessionStorage : localStorage;
    other.removeItem("cashyLogado"); other.removeItem("cashyEmail"); other.removeItem("cashyNome");
    storage.setItem("cashyLogado", "true");
    storage.setItem("cashyEmail", user.email);
    storage.setItem("cashyNome", user.name || user.email.split("@")[0]);
  }
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    [nameField, emailField, passwordField, confirmField].forEach((field) => field.removeAttribute("aria-invalid"));
    const email = emailField.value.trim().toLowerCase();
    const password = passwordField.value;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (mode === "register" && nameField.value.trim().length < 2) { nameField.setAttribute("aria-invalid", "true"); showMessage("Informe seu nome (pelo menos 2 caracteres).", "erro"); nameField.focus(); return; }
    if (!emailValid) { emailField.setAttribute("aria-invalid", "true"); showMessage("Digite um e-mail válido.", "erro"); emailField.focus(); return; }
    if (password.length < 8) { passwordField.setAttribute("aria-invalid", "true"); showMessage("A senha deve ter pelo menos 8 caracteres.", "erro"); passwordField.focus(); return; }
    if ((mode === "register" || mode === "reset") && password !== confirmField.value) { confirmField.setAttribute("aria-invalid", "true"); showMessage("As senhas não são iguais.", "erro"); confirmField.focus(); return; }

    submitButton.disabled = true;
    try {
      const users = readUsers();
      if (mode === "register") {
        if (users[email]) { emailField.setAttribute("aria-invalid", "true"); emailField.focus(); showMessage("Este e-mail já tem uma conta. Entre ou use outro e-mail.", "erro"); return; }
        users[email] = { name: nameField.value.trim(), passwordHash: await hashPassword(password) };
        localStorage.setItem("cashyUsuarios", JSON.stringify(users));
        saveSession({ email, name: users[email].name });
        showMessage("Conta criada! Abrindo seu painel…", "sucesso");
      } else if (mode === "reset") {
        if (!users[email]) { emailField.setAttribute("aria-invalid", "true"); emailField.focus(); showMessage("Não encontramos uma conta com esse e-mail neste navegador.", "erro"); return; }
        users[email].passwordHash = await hashPassword(password);
        localStorage.setItem("cashyUsuarios", JSON.stringify(users));
        saveSession({ email, name: users[email].name });
        showMessage("Senha atualizada neste navegador. Abrindo seu painel…", "sucesso");
      } else {
        const user = users[email];
        if (!user || user.passwordHash !== await hashPassword(password)) { emailField.setAttribute("aria-invalid", "true"); passwordField.setAttribute("aria-invalid", "true"); passwordField.focus(); showMessage("E-mail ou senha incorretos. Confira seus dados ou crie uma conta.", "erro"); return; }
        saveSession({ email, name: user.name });
        showMessage("Login realizado! Abrindo seu painel…", "sucesso");
      }
      setTimeout(() => location.assign("dashboard.html"), 450);
    } catch (error) {
      showMessage(error.message === "secure-context" ? "Para criar conta com segurança, abra o projeto em localhost ou HTTPS." : "Não foi possível acessar o armazenamento do navegador.", "erro");
    } finally { submitButton.disabled = false; }
  });
  document.getElementById("esqueciSenha").addEventListener("click", (event) => {
    event.preventDefault();
    setMode("reset");
    showMessage("Recuperação local: sem envio de e-mail ou verificação de identidade.", "");
  });
  [emailField, passwordField, nameField, confirmField].forEach((field) => field.addEventListener("input", () => { field.removeAttribute("aria-invalid"); showMessage("", ""); }));
})();
