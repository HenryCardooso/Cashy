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
  let mode = "login";

  function showMessage(text, type) {
    message.textContent = text;
    message.className = "message " + (type || "");
  }

  function setMode(next) {
    mode = next;
    const registering = mode === "register";
    document.getElementById("cancelarReset").hidden = true;
    [nameField, emailField, passwordField, confirmField].forEach((field) => field.removeAttribute("aria-invalid"));
    passwordField.value = "";
    confirmField.value = "";
    passwordField.type = "password";
    const passwordToggle = document.getElementById("mostrarSenha");
    passwordToggle.textContent = "Mostrar";
    passwordToggle.setAttribute("aria-label", "Mostrar senha");
    passwordToggle.setAttribute("aria-pressed", "false");
    tabs.forEach((tab, index) => {
      const active = index === (registering ? 1 : 0);
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    const formTabs = tabs[0].closest(".form-tabs");
    formTabs.hidden = false;
    form.setAttribute("role", "tabpanel");
    form.setAttribute("aria-labelledby", registering ? "abaCadastro" : "abaEntrar");
    registerOnly.forEach((field) => { field.hidden = !registering; });
    confirmGroup.hidden = !registering;
    nameField.required = registering;
    confirmField.required = registering;
    nameField.setAttribute("aria-required", String(registering));
    confirmField.setAttribute("aria-required", String(registering));
    title.textContent = registering ? "Crie sua conta" : "Bem-vindo de volta";
    description.textContent = registering ? "Seus dados ficarão disponíveis quando você entrar em outro dispositivo." : "Entre na sua conta e aprenda sobre dinheiro no seu ritmo.";
    submitButton.innerHTML = registering ? 'Criar minha conta <span aria-hidden="true">→</span>' : 'Entrar <span aria-hidden="true">→</span>';
    document.getElementById("esqueciSenha").hidden = registering;
    passwordField.autocomplete = registering ? "new-password" : "current-password";
    document.getElementById("confirmarLabel").textContent = "Confirme sua senha";
    showMessage("", "");
  }

  async function checkSession() {
    try {
      const result = await CashyAPI.auth.me();
      if (result.authenticated) location.replace("dashboard.html");
    } catch (error) {
      showMessage(error.message, "erro");
    }
  }
  checkSession();

  tabs[0].addEventListener("click", () => setMode("login"));
  tabs[1].addEventListener("click", () => setMode("register"));
  tabs.forEach((tab, index) => tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
    tabs[next].focus();
    tabs[next].click();
  }));
  if (new URLSearchParams(location.search).get("modo") === "cadastro") setMode("register");

  document.getElementById("mostrarSenha").addEventListener("click", function () {
    const show = passwordField.type === "password";
    passwordField.type = show ? "text" : "password";
    this.textContent = show ? "Ocultar" : "Mostrar";
    this.setAttribute("aria-label", show ? "Ocultar senha" : "Mostrar senha");
    this.setAttribute("aria-pressed", String(show));
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    [nameField, emailField, passwordField, confirmField].forEach((field) => field.removeAttribute("aria-invalid"));
    const email = emailField.value.trim().toLowerCase();
    const password = passwordField.value;
    if (mode === "register" && nameField.value.trim().length < 2) {
      nameField.setAttribute("aria-invalid", "true");
      showMessage("Informe seu nome (pelo menos 2 caracteres).", "erro");
      nameField.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailField.setAttribute("aria-invalid", "true");
      showMessage("Digite um e-mail válido.", "erro");
      emailField.focus();
      return;
    }
    if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
      passwordField.setAttribute("aria-invalid", "true");
      showMessage("A senha deve ter entre 8 e 72 caracteres.", "erro");
      passwordField.focus();
      return;
    }
    if (mode === "register" && password !== confirmField.value) {
      confirmField.setAttribute("aria-invalid", "true");
      showMessage("As senhas não são iguais.", "erro");
      confirmField.focus();
      return;
    }

    submitButton.disabled = true;
    try {
      const result = mode === "register"
        ? await CashyAPI.auth.register({ name: nameField.value.trim(), email, password, remember: remember.checked })
        : await CashyAPI.auth.login({ email, password, remember: remember.checked });
      showMessage(mode === "register" ? "Conta criada! Abrindo seu painel…" : "Login realizado! Abrindo seu painel…", "sucesso");
      setTimeout(() => location.assign("dashboard.html"), 350);
    } catch (error) {
      if (error.code === "email_exists") {
        emailField.setAttribute("aria-invalid", "true");
        emailField.focus();
      } else if (error.code === "invalid_credentials") {
        emailField.setAttribute("aria-invalid", "true");
        passwordField.setAttribute("aria-invalid", "true");
        passwordField.focus();
      }
      showMessage(error.message, "erro");
    } finally {
      submitButton.disabled = false;
    }
  });

  document.getElementById("esqueciSenha").addEventListener("click", (event) => {
    event.preventDefault();
    showMessage("A recuperação por e-mail ainda não está configurada. Procure o administrador do site para redefinir a senha.", "");
  });
  [emailField, passwordField, nameField, confirmField].forEach((field) => field.addEventListener("input", () => {
    field.removeAttribute("aria-invalid");
    showMessage("", "");
  }));
})();