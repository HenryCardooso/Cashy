(async function(){
 "use strict";
 let session={authenticated:false}, educationState={checklist:[]};
 try{session=await CashyAPI.auth.me();if(session.authenticated)educationState=await CashyAPI.education.get()}catch(_){}
 const loggedIn=Boolean(session.authenticated);const checklistKey="cashyChecklist:visitante";
  const checklist = document.getElementById("investmentChecklist");
  const checklistStatus = document.getElementById("checklistStatus");
  const checklistItems = [...checklist.querySelectorAll('input[name="check"]')];
  if (loggedIn && Array.isArray(educationState.checklist)) {
    checklistItems.forEach((item, index) => { item.checked = educationState.checklist[index] === true; });
  } else if (!loggedIn) {
    try {
      const saved = JSON.parse(localStorage.getItem(checklistKey) || "[]");
      if (Array.isArray(saved)) checklistItems.forEach((item, index) => { item.checked = saved[index] === true; });
    } catch (_) {}
  }
  async function persistChecklist() {
    const values = checklistItems.map((item) => item.checked);
    if (loggedIn) {
      await CashyAPI.education.saveChecklist(values);
      educationState.checklist = values;
    } else {
      localStorage.setItem(checklistKey, JSON.stringify(values));
    }
  }
  function updateChecklist(save) {
    const reviewed = checklistItems.filter((item) => item.checked).length;
    checklistStatus.textContent = reviewed + " de " + checklistItems.length + " itens revisados" +
      (reviewed === checklistItems.length
        ? ". As respostas ajudam a identificar dúvidas; não atestam que um investimento seja adequado."
        : ". Use os itens desmarcados para orientar seus estudos.");
    if (save) {
      persistChecklist().catch(() => {
        checklistStatus.textContent = "Não foi possível salvar o checklist. Confira a conexão com o servidor.";
      });
    }
  }
  checklist.addEventListener("change", () => updateChecklist(true));
  checklist.addEventListener("reset", (event) => {
    event.preventDefault();
    checklistItems.forEach((item) => { item.checked = false; });
    if (loggedIn) {
      persistChecklist().catch(() => {
        checklistStatus.textContent = "Não foi possível atualizar o checklist. Confira a conexão com o servidor.";
      });
    } else {
      try { localStorage.removeItem(checklistKey); } catch (_) {}
    }
    updateChecklist(false);
  });
  updateChecklist(false);

  const challengeList = document.getElementById("challengeList");
  if (challengeList) {
    const challengeKey = "cashyPracticeChallenge:v1";
    const mondayKey = () => { const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (date.getDay() + 6) % 7); return date.toLocaleDateString("sv-SE"); };
    const boxes = [...challengeList.querySelectorAll('input[type="checkbox"]')];
    let saved = {};
    try { const parsed = JSON.parse(localStorage.getItem(challengeKey) || "{}"); if (parsed && parsed.week === mondayKey() && Array.isArray(parsed.completed)) saved = new Set(parsed.completed); else saved = new Set(); } catch (_) { saved = new Set(); }
    boxes.forEach((box) => { box.checked = saved.has(box.value); });
    function renderChallenge(persist) {
      const count = boxes.filter((box) => box.checked).length;
      const progress = document.getElementById("challengeCount"), bar = document.getElementById("challengeBar"), track = bar.closest('[role="progressbar"]');
      progress.textContent = count + " de " + boxes.length + " atividades concluídas"; track.setAttribute("aria-valuenow", String(count)); bar.style.width = count / boxes.length * 100 + "%";
      if (count === boxes.length) document.getElementById("challengeStatus").textContent = "Desafio concluído. Você praticou passos de organização e aprendizagem no seu ritmo.";
      else document.getElementById("challengeStatus").textContent = count ? "Boa sequência. Continue apenas com os passos que fizerem sentido para sua rotina." : "Você pode concluir uma atividade por vez; não há prazo ou nota.";
      if (persist) { try { localStorage.setItem(challengeKey, JSON.stringify({ week: mondayKey(), completed: boxes.filter((box) => box.checked).map((box) => box.value) })); } catch (_) { document.getElementById("challengeStatus").textContent = "Não foi possível salvar o progresso neste navegador."; } }
    }
    challengeList.addEventListener("change", () => renderChallenge(true));
    document.getElementById("resetChallenge").addEventListener("click", () => { boxes.forEach((box) => { box.checked = false; }); renderChallenge(true); });
    renderChallenge(false);
  }

  const practiceAnswers = {
    1: { answer: "b", correct: "Isso. Pressão para agir e promessa de ganhos altos sem risco são sinais para interromper e verificar. Consulte informações oficiais e não decida só com base em uma publicação." , retry: "Reveja a promessa e a pressão para agir. Popularidade ou urgência não comprovam que uma oferta seja confiável." },
    2: { answer: "a", correct: "Isso. Prazo, liquidez, riscos e custos ajudam a entender se uma opção atende às necessidades consideradas. A taxa sozinha não conta a história toda.", retry: "Pense em quando Luiza pode precisar do dinheiro e nas regras para acessar ou retirar os recursos." },
    3: { answer: "c", correct: "Isso. O saldo é uma estimativa matemática que depende das hipóteses inseridas; taxas e condições reais podem variar e o resultado não é garantido.", retry: "Uma simulação não consulta o futuro nem dados de mercado; ela calcula com base nos valores e hipóteses informados." }
  };
  document.querySelectorAll("[data-practice]").forEach((button) => button.addEventListener("click", () => {
    const id = button.dataset.practice, selected = document.querySelector('input[name="practice' + id + '"]:checked');
    const output = document.getElementById("practiceFeedback" + id);
    if (!selected) { output.textContent = "Escolha uma opção para conferir a explicação."; output.classList.remove("is-correct"); return; }
    const result = practiceAnswers[id], correct = selected.value === result.answer;
    output.textContent = correct ? result.correct : result.retry;
    output.classList.toggle("is-correct", correct);
  }));


})();
