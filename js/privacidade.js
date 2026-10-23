(function () {
  "use strict";
  const button = document.getElementById("deleteData");
  const status = document.getElementById("deleteStatus");
  function getEmail() {
    try { for (const store of [localStorage, sessionStorage]) if (store.getItem("cashyLogado") === "true") return store.getItem("cashyEmail") || ""; } catch (_) {}
    return "";
  }
  button.addEventListener("click", () => {
    const email = getEmail();
    const scope = email ? "a conta atual e os dados dela" : "o progresso e checklist de visitante deste navegador";
    if (!window.confirm("Apagar " + scope + " do Cashy neste navegador? Esta ação não pode ser desfeita.")) return;
    try {
      if (email) {
        for (const key of ["cashyMovimentacoes:" + email, "cashyMeta:" + email, "cashyAulas:" + email, "cashyChecklist:" + email]) localStorage.removeItem(key);
        const users = JSON.parse(localStorage.getItem("cashyUsuarios") || "{}");
        delete users[email];
        localStorage.setItem("cashyUsuarios", JSON.stringify(users));
        for (const store of [localStorage, sessionStorage]) for (const key of ["cashyLogado", "cashyEmail", "cashyNome"]) store.removeItem(key);
        status.textContent = "Os dados locais da conta foram apagados. Redirecionando para o início.";
        setTimeout(() => location.assign("index.html"), 1200);
      } else {
        for (const key of ["cashyAulas:visitante", "cashyChecklist:visitante"]) localStorage.removeItem(key);
        status.textContent = "Os dados do perfil visitante foram apagados deste navegador.";
      }
    } catch (_) { status.textContent = "O navegador não permitiu apagar todos os dados. Tente limpar os dados do site nas configurações do navegador."; }
  });
})();
