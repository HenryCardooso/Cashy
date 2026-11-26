(function () {
  "use strict";

  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("nav");

  function definirMenu(aberto) {
    nav.classList.toggle("open", aberto);
    menuBtn.setAttribute("aria-expanded", String(aberto));
    menuBtn.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    menuBtn.textContent = aberto ? "✕" : "☰";
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => definirMenu(!nav.classList.contains("open")));
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) definirMenu(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        definirMenu(false);
        menuBtn.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 680 && nav.classList.contains("open")) definirMenu(false);
    });
  }

  function criarLink(texto, href, classes) {
    const link = document.createElement("a");
    link.href = href;
    link.className = classes;
    link.textContent = texto;
    return link;
  }

  function preencher(container, user) {
    if (!container) return;
    container.replaceChildren();
    if (!user) {
      container.append(
        criarLink("Entrar", "login.html", "btn btn-outline"),
        criarLink("Começar agora", "login.html?modo=cadastro", "btn btn-green")
      );
      return;
    }
    container.append(criarLink("Abrir meu painel", "dashboard.html", "btn btn-green"));
    const sair = document.createElement("button");
    sair.type = "button";
    sair.className = "btn btn-outline";
    sair.textContent = "Sair";
    sair.addEventListener("click", async () => {
      sair.disabled = true;
      try {
        await CashyAPI.auth.logout();
        renderizarAutenticacao(null);
      } catch (error) {
        sair.disabled = false;
        sair.title = error.message;
      }
    });
    container.append(sair);
  }

  function renderizarAutenticacao(user) {
    const authenticated = Boolean(user);
    document.body.classList.toggle("authenticated-home", authenticated);
    document.body.classList.remove("home-auth-loading");
    document.querySelectorAll("[data-guest-home]").forEach((section) => { section.hidden = authenticated; });
    document.querySelectorAll("[data-home-guest]").forEach((link) => { link.hidden = authenticated; });
    document.querySelectorAll("[data-home-member]").forEach((link) => { link.hidden = !authenticated; });
    const memberHome = document.getElementById("memberHome");
    if (memberHome) memberHome.hidden = !authenticated;
    const firstName = document.getElementById("memberFirstName");
    if (firstName) firstName.textContent = user && user.name ? user.name.trim().split(/\s+/)[0] : "pessoa";
    const homeActions = [
      ["homePrimaryAction", authenticated ? "dashboard.html" : "login.html?modo=cadastro", authenticated ? "Abrir meu painel →" : "Criar minha conta →"]
    ];
    homeActions.forEach(([id, href, label]) => { const link = document.getElementById(id); if (link) { link.href = href; link.textContent = label; } });
    window.dispatchEvent(new CustomEvent("cashy:auth-state", { detail: { authenticated: Boolean(user) } }));
    preencher(document.getElementById("headerActions"), user);
    preencher(document.getElementById("navAuth"), user);
  }

  CashyAPI.auth.me()
    .then((result) => renderizarAutenticacao(result.authenticated ? result.user : null))
    .catch(() => renderizarAutenticacao(null));
})();
