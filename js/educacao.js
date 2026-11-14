(async function () {
  "use strict";

  const lessons = window.CASHY_CURSOS || [];
  let session = { authenticated: false };
  let educationState = { completed: [], checklist: [], states: {}, activity: [], xp: 0, streak: 0, weekly_topics: 0 };
  try {
    session = await CashyAPI.auth.me();
    if (session.authenticated) educationState = await CashyAPI.education.get();
  } catch (_) {}
  const loggedIn = Boolean(session.authenticated);
  const progressKey = "cashyAulas:visitante";
  const checklistKey = "cashyChecklist:visitante";
  if (!loggedIn) { try { educationState = Object.assign(educationState, JSON.parse(localStorage.getItem(progressKey) || "{}")); } catch (_) {} }
  educationState.states ||= {};
  educationState.activity ||= [];

  const accountLink = document.getElementById("contaLink");
  accountLink.href = loggedIn ? "dashboard.html" : "login.html";
  accountLink.textContent = loggedIn ? "Minha conta" : "Entrar";
  document.getElementById("progressNote").textContent = loggedIn
    ? "Seu progresso fica salvo no banco de dados da sua conta."
    : "Sem login, o progresso fica salvo somente neste navegador.";

  function readProgress() {
    if (loggedIn) return Array.isArray(educationState.completed) ? educationState.completed.filter((id) => lessons.some((lesson) => lesson.id === id)) : [];
    try {
      const data = JSON.parse(localStorage.getItem(progressKey) || "{}");
      return data && Array.isArray(data.completed) ? data.completed.filter((id) => lessons.some((lesson) => lesson.id === id)) : [];
    } catch (_) { return []; }
  }
  async function saveProgress(completed) {
    if (loggedIn) {
      const current = new Set(readProgress());
      for (const id of completed) {
        if (!current.has(id)) await CashyAPI.education.complete(id);
      }
      educationState.completed = [...new Set([...current, ...completed])];
      return true;
    }
    try { localStorage.setItem(progressKey, JSON.stringify({ completed })); return true; }
    catch (_) { return false; }
  }
  function updateProgress() {
    const completed = readProgress();
    const percent = Math.round((completed.length / lessons.length) * 100);
    document.getElementById("progressCount").textContent = completed.length + " de " + lessons.length + " cursos concluídos";
    document.getElementById("progressPercent").textContent = percent + "%";
    document.getElementById("progressBar").style.width = percent + "%";
    document.querySelector('.progress-track[role="progressbar"]').setAttribute("aria-valuenow", String(percent));
    document.querySelectorAll(".lesson-card").forEach((card) => {
      const done = completed.includes(card.dataset.lessonId);
      card.classList.toggle("completed", done);
      let badge = card.querySelector(".completion-note");
      if (done && !badge) { badge = document.createElement("span"); badge.className = "completion-note"; badge.setAttribute("role", "status"); badge.textContent = "Curso concluído"; card.querySelector(".lesson-content").append(badge); }
      if (!done && badge) badge.remove();
      const state = educationState.states?.[card.dataset.lessonId];
      const detail = card.querySelector(".lesson-stage-progress");
      if (detail) detail.textContent = done ? "Curso concluído" : state ? (state.completed_topics || []).length + " de " + (lessons.find((lesson) => lesson.id === card.dataset.lessonId)?.topics.length || 0) + " etapas concluídas" : "Ainda não iniciado";
    });
    renderLearningRewards(completed);
  }
  function renderLearningRewards(completed) {
    const activities = educationState.activity || [];
    if (!loggedIn) {
      const dates = new Set(activities.filter((item) => ["topic_completed", "quiz_completed", "course_completed"].includes(item.type)).map((item) => new Date(item.created_at).toLocaleDateString("sv-SE")));
      const today = new Date(); const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      let cursor = dates.has(current.toLocaleDateString("sv-SE")) ? current : new Date(current.getTime() - 86400000); let streak = 0;
      while (dates.has(cursor.toLocaleDateString("sv-SE"))) { streak++; cursor = new Date(cursor.getTime() - 86400000); }
      educationState.streak = streak;
    }
    const topicCount = Object.values(educationState.states || {}).reduce((total, state) => total + (state.completed_topics || []).length, 0);
    const xp = Number(educationState.xp) || 0;
    const levels = [[0, "Aprendiz"], [50, "Explorador"], [150, "Organizador"], [300, "Planejador"], [600, "Conhecedor"]];
    document.getElementById("educationXp").textContent = xp + " XP";
    document.getElementById("educationLevel").textContent = [...levels].reverse().find(([minimum]) => xp >= minimum)?.[1] || "Aprendiz";
    document.getElementById("educationStreak").textContent = (Number(educationState.streak) || 0) + " " + ((Number(educationState.streak) || 0) === 1 ? "dia" : "dias");
    let weekly = Number(educationState.weekly_topics) || 0;
    if (!loggedIn) {
      const now = new Date(); const day = (now.getDay() + 6) % 7; const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      weekly = activities.filter((item) => item.type === "topic_completed" && new Date(item.created_at) >= monday).length;
    }
    document.getElementById("weeklyChallengeProgress").textContent = Math.min(weekly, 3) + " de 3 etapas concluídas";
    document.getElementById("weeklyChallengeBar").style.width = Math.min(100, weekly / 3 * 100) + "%";
    document.querySelector(".weekly-challenge [role=progressbar]").setAttribute("aria-valuenow", String(Math.min(weekly, 3)));
    const badgeData = [
      [topicCount >= 1, "Primeira etapa", "Conclua uma etapa de aula"],
      [topicCount >= 5, "Curioso", "Estude cinco etapas"],
      [completed.length >= 1, "Curso concluído", "Finalize seu primeiro curso"],
      [(Number(educationState.streak) || 0) >= 3, "Ritmo constante", "Estude em três dias seguidos"]
    ];
    const badges = document.getElementById("educationBadges");
    badges.replaceChildren(...badgeData.map(([earned, title, description]) => { const item = document.createElement("span"); item.className = "education-badge" + (earned ? " earned" : ""); item.textContent = (earned ? "✦ " : "○ ") + title; item.title = description; return item; }));
  }
  const grid = document.getElementById("lessonGrid");
  lessons.forEach((lesson, index) => {
    const card = document.createElement("article"); card.className = "lesson-card"; card.dataset.lessonId = lesson.id; card.dataset.level = lesson.level.split("/")[1].trim();
    const art = document.createElement("div"); art.className = "lesson-art";
    const icon = document.createElement("span"); icon.textContent = ["◉", "⌁", "⌕", "◎"][index % 4]; art.append(icon);
    const content = document.createElement("div"); content.className = "lesson-content";
    const level = document.createElement("span"); level.className = "lesson-level"; level.textContent = lesson.level;
    const title = document.createElement("h3"); title.textContent = lesson.title;
    const description = document.createElement("p"); description.textContent = lesson.description;
    const stage = document.createElement("small"); stage.className = "lesson-stage-progress";
    if (index > 0) { const prerequisite = document.createElement("p"); prerequisite.className = "course-prerequisite"; prerequisite.textContent = "Sequência sugerida: estude antes “" + lessons[index - 1].title + "”."; content.append(level, title, description, prerequisite); }
    else content.append(level, title, description);
    content.append(stage);
    const meta = document.createElement("div"); meta.className = "lesson-meta";
    const reading = document.createElement("span"); reading.textContent = "Aula · leitura e quiz";
    const button = document.createElement("a"); button.className = "course-link"; button.textContent = educationState.states?.[lesson.id] ? "Continuar curso →" : "Abrir curso →"; button.href = "curso.html?id=" + encodeURIComponent(lesson.id);
    meta.append(reading, button); content.append(meta); card.append(art, content); grid.append(card);
  });
  updateProgress();
  document.getElementById("levelFilter").addEventListener("change", (event) => {
    const selected = event.target.value;
    document.querySelectorAll(".lesson-card").forEach((card) => { card.hidden = selected !== "todos" && card.dataset.level !== selected; });
  });

})();
