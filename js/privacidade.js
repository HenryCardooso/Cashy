(async function () {
  "use strict";
  const button = document.getElementById("deleteData");
  const status = document.getElementById("deleteStatus");
  const exportButton = document.getElementById("exportData");
  const exportStatus = document.getElementById("exportStatus");
  const localDataKeys = [
    "cashyAulas:visitante",
    "cashyChecklist:visitante",
    "cashyPracticeChallenge:v1",
    "cashy-orcamento-mensal-v1",
    "cashy-reserva-emergencia-v1",
    "cashyTema",
    "cashyTour:v1:complete",
    "cashyTour:v1:seen"
  ];
  const sessionDataKeys = ["cashyTour:v1"];
  let user = null;
  let sessionData = null;
  function readLocalData() {
    const localData = {};
    localDataKeys.forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) return;
        try { localData[key] = JSON.parse(raw); } catch (_) { localData[key] = raw; }
      } catch (_) {}
    });
    sessionDataKeys.forEach((key) => {
      try {
        const raw = sessionStorage.getItem(key);
        if (raw === null) return;
        try { localData[key] = JSON.parse(raw); } catch (_) { localData[key] = raw; }
      } catch (_) {}
    });
    return localData;
  }
  function clearLocalData() {
    let complete = true;
    localDataKeys.forEach((key) => {
      try { localStorage.removeItem(key); } catch (_) { complete = false; }
    });
    sessionDataKeys.forEach((key) => {
      try { sessionStorage.removeItem(key); } catch (_) { complete = false; }
    });
    return complete;
  }

  try {
    sessionData = await CashyAPI.auth.me();
    user = sessionData.authenticated ? sessionData.user : null;
  } catch (error) {
    status.textContent = error.message || "Não foi possível consultar a conta.";
    button.disabled = true;
    exportButton.disabled = true;
    exportStatus.textContent = error.message || "Não foi possível consultar os dados.";
    return;
  }

  button.textContent = user ? "Apagar minha conta e os dados do Cashy" : "Apagar dados locais do Cashy neste navegador";
  exportButton.textContent = user ? "Baixar meus dados da conta" : "Baixar dados deste navegador";
  exportButton.addEventListener("click", async () => {
    exportButton.disabled = true;
    exportStatus.textContent = "Preparando o arquivo…";
    try {
      let data;
      if (user) {
        const [transactions, goals, profile, education] = await Promise.all([
          CashyAPI.transactions.list(), CashyAPI.goals.list(), CashyAPI.profile.get(), CashyAPI.education.get()
        ]);
        data = { exportedAt: new Date().toISOString(), account: { id: user.id, name: user.name, email: user.email }, transactions, goals, profile, education, localData: readLocalData() };
      } else {
        data = { exportedAt: new Date().toISOString(), scope: "Dados de visitante neste navegador", localData: readLocalData() };
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = "cashy-meus-dados-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      exportStatus.textContent = "Arquivo JSON preparado no seu dispositivo.";
    } catch (error) {
      exportStatus.textContent = error.message || "Não foi possível preparar o arquivo. Tente novamente.";
    } finally {
      exportButton.disabled = false;
    }
  });
  button.addEventListener("click", async () => {
    const scope = user
      ? "sua conta, os dados associados no banco e os dados locais do Cashy neste navegador"
      : "os dados locais e preferências do Cashy neste navegador";
    if (!window.confirm("Apagar " + scope + "? Esta ação não pode ser desfeita.")) return;
    button.disabled = true;

    if (user) {
      try {
        const password = window.prompt("Digite sua senha atual para confirmar a exclusão da conta.");
        if (password === null) { button.disabled = false; return; }
        await CashyAPI.account.remove(password);
        const localDataCleared = clearLocalData();
        status.textContent = localDataCleared
          ? "Sua conta e os dados do Cashy neste navegador foram apagados. Redirecionando para o início."
          : "Sua conta foi apagada. O navegador impediu apagar alguns dados locais do Cashy; limpe os dados do site nas configurações do navegador.";
        setTimeout(() => location.assign("index.html"), 1200);
      } catch (error) {
        status.textContent = error.message || "Não foi possível apagar a conta.";
        button.disabled = false;
      }
      return;
    }

    try {
      status.textContent = clearLocalData()
        ? "Os dados locais e as preferências do Cashy foram apagados deste navegador."
        : "O navegador impediu apagar alguns dados locais; limpe os dados do site nas configurações do navegador.";
    } catch (_) {
      status.textContent = "O navegador não permitiu apagar os dados.";
    } finally {
      button.disabled = false;
    }
  });
})();
