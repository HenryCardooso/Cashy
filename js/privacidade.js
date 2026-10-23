(async function () {
  "use strict";
  const button = document.getElementById("deleteData");
  const status = document.getElementById("deleteStatus");
  let user = null;

  try {
    const session = await CashyAPI.auth.me();
    user = session.authenticated ? session.user : null;
  } catch (error) {
    status.textContent = error.message || "Não foi possível consultar a conta.";
    button.disabled = true;
    return;
  }

  button.textContent = user ? "Apagar minha conta e todos os dados" : "Apagar dados de visitante deste navegador";
  button.addEventListener("click", async () => {
    const scope = user
      ? "sua conta e todos os dados guardados no banco, incluindo movimentações, metas e progresso dos cursos"
      : "o progresso e checklist de visitante guardados neste navegador";
    if (!window.confirm("Apagar " + scope + "? Esta ação não pode ser desfeita.")) return;
    button.disabled = true;

    if (user) {
      try {
        await CashyAPI.account.remove();
        for (const key of ["cashyAulas:visitante", "cashyChecklist:visitante"]) localStorage.removeItem(key);
        status.textContent = "Sua conta e seus dados foram apagados. Redirecionando para o início.";
        setTimeout(() => location.assign("index.html"), 1200);
      } catch (error) {
        status.textContent = error.message || "Não foi possível apagar a conta.";
        button.disabled = false;
      }
      return;
    }

    try {
      for (const key of ["cashyAulas:visitante", "cashyChecklist:visitante"]) localStorage.removeItem(key);
      status.textContent = "O progresso de visitante foi apagado deste navegador.";
    } catch (_) {
      status.textContent = "O navegador não permitiu apagar os dados.";
    } finally {
      button.disabled = false;
    }
  });
})();