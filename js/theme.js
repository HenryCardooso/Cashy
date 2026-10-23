(function () {
  "use strict";
  const root = document.documentElement;
  const storageKey = "cashyTema";
  let theme = root.dataset.theme || "dark";
  function apply(next) {
    theme = next === "light" ? "light" : "dark";
    root.dataset.theme = theme;
    try { localStorage.setItem(storageKey, theme); } catch (_) {}
    const button = document.getElementById("themeToggle");
    if (button) {
      const light = theme === "light";
      button.innerHTML = '<span aria-hidden="true">' + (light ? "☾" : "☼") + "</span>";
      button.setAttribute("aria-label", light ? "Ativar modo escuro" : "Ativar modo claro");
      button.title = light ? "Ativar modo escuro" : "Ativar modo claro";
      button.setAttribute("aria-pressed", String(light));
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f4f7f3" : "#080b09");
  }
  function init() {
    const button = document.createElement("button");
    button.id = "themeToggle"; button.className = "theme-toggle"; button.type = "button";
    button.addEventListener("click", () => apply(theme === "dark" ? "light" : "dark"));
    const profile = document.querySelector(".topbar .profile");
    const educationHeader = document.querySelector(".edu-header");
    const accountLink = educationHeader?.querySelector(".account-link");
    const homeActions = document.querySelector(".header-actions");
    const legalHeader = document.querySelector(".legal-header");
    const loginContainer = document.querySelector(".login-container");
    if (profile) profile.prepend(button);
    else if (accountLink) educationHeader.insertBefore(button, accountLink);
    else if (educationHeader) educationHeader.append(button);
    else if (homeActions) homeActions.append(button);
    else if (legalHeader) legalHeader.append(button);
    else if (loginContainer) loginContainer.append(button);
    else { button.classList.add("theme-floating"); document.body.append(button); }
    apply(theme);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
