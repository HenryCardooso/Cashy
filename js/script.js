(function () {
  "use strict";

  /* ---------- MENU MOBILE ---------- */

  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("nav");

  function definirMenu(aberto) {
    nav.classList.toggle("open", aberto);
    menuBtn.setAttribute("aria-expanded", String(aberto));
    menuBtn.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    menuBtn.textContent = aberto ? "✕" : "☰";
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      definirMenu(!nav.classList.contains("open"));
    });

    // Fecha o menu ao clicar em qualquer link
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        definirMenu(false);
      }
    });

    // Fecha com a tecla Esc
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        definirMenu(false);
        menuBtn.focus();
      }
    });

    // Se a tela for ampliada, garante que o menu volte ao normal
    window.addEventListener("resize", function () {
      if (window.innerWidth > 680 && nav.classList.contains("open")) {
        definirMenu(false);
      }
    });
  }

  /* ---------- SESSÃO (simulada com localStorage) ---------- */

  // "Manter conectado" -> localStorage | sem marcar -> sessionStorage
  function obterSessao() {
    try {
      const armazenamentos = [localStorage, sessionStorage];

      for (const armazenamento of armazenamentos) {
        if (armazenamento.getItem("cashyLogado") === "true") {
          return armazenamento.getItem("cashyEmail") || "";
        }
      }
    } catch (erro) {
      // armazenamento indisponível (modo privado, bloqueio etc.)
    }
    return null;
  }

  function encerrarSessao() {
    try {
      [localStorage, sessionStorage].forEach(function (armazenamento) {
        armazenamento.removeItem("cashyLogado");
        armazenamento.removeItem("cashyEmail");
        armazenamento.removeItem("cashyNome");
      });
    } catch (erro) {
      // ignora
    }
    renderizarAutenticacao();
  }

  function criarLink(texto, href, classes) {
    const link = document.createElement("a");
    link.href = href;
    link.className = classes;
    link.textContent = texto;
    return link;
  }

  function preencher(container) {
    if (!container) return;

    container.replaceChildren();

    const email = obterSessao();

    if (email === null) {
      container.append(
        criarLink("Entrar", "login.html", "btn btn-outline"),
        criarLink("Começar agora", "login.html?modo=cadastro", "btn btn-green")
      );
      return;
    }

    // textContent evita injeção de HTML (XSS) com o e-mail digitado
    const painel = criarLink("Abrir meu painel", "dashboard.html", "btn btn-green");

    const sair = document.createElement("button");
    sair.type = "button";
    sair.className = "btn btn-outline";
    sair.textContent = "Sair";
    sair.addEventListener("click", encerrarSessao);

    container.append(painel, sair);
  }

  function renderizarAutenticacao() {
    preencher(document.getElementById("headerActions"));
    preencher(document.getElementById("navAuth"));
  }

  renderizarAutenticacao();
})();
