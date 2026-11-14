(async function () {
  "use strict";
  const courses = window.CASHY_CURSOS || [];
  const id = new URLSearchParams(location.search).get("id");
  const index = courses.findIndex((item) => item.id === id);
  const root = document.getElementById("courseContent");
  if (index < 0) {
    root.innerHTML = '<section class="course-heading"><span class="eyebrow">EDUCAÇÃO CASHY</span><h1>Curso não encontrado</h1><p>Escolha um curso na trilha para continuar aprendendo.</p><a class="lime-button" href="educacao.html#trilha">Voltar para a trilha</a></section>';
    return;
  }

  let loggedIn = false;
  let completed = [];
  let progressError = "";
  let educationState = { states: {}, activity: [], xp: 0, streak: 0 };
  try {
    const session = await CashyAPI.auth.me();
    loggedIn = Boolean(session.authenticated);
    if (loggedIn) {
      educationState = await CashyAPI.education.get();
      completed = Array.isArray(educationState.completed) ? educationState.completed : [];
      await CashyAPI.education.open(id);
    } else {
      const saved = JSON.parse(localStorage.getItem("cashyAulas:visitante") || "{}");
      completed = Array.isArray(saved.completed) ? saved.completed : [];
      educationState = Object.assign(educationState, saved);
      educationState.states ||= {};
      educationState.states[id] ||= { last_topic_index: 0, completed_topics: [], quiz_history: [] };
      educationState.states[id].last_accessed_at = new Date().toISOString();
      localStorage.setItem("cashyAulas:visitante", JSON.stringify({ ...saved, ...educationState }));
    }
  } catch (error) {
    progressError = error.message;
    try {
      const saved = JSON.parse(localStorage.getItem("cashyAulas:visitante") || "{}");
      completed = Array.isArray(saved.completed) ? saved.completed : [];
      educationState = Object.assign(educationState, saved);
    } catch (_) {}
  }

  const course = courses[index];
  educationState.states ||= {};
  educationState.states[course.id] ||= { last_topic_index: 0, completed_topics: [], quiz_history: [] };
  const heading = document.createElement("section");
  heading.className = "course-heading";
  const level = document.createElement("span");
  level.className = "eyebrow";
  level.textContent = course.level;
  const title = document.createElement("h1");
  title.textContent = course.title;
  const description = document.createElement("p");
  description.textContent = course.description;
  const illustration = document.createElement("img");
  illustration.className = "course-heading-art";
  illustration.src = "images/ilustracao-curso.svg";
  illustration.alt = "";
  illustration.setAttribute("aria-hidden", "true");
  heading.append(level, title, description, illustration);
  root.append(heading);

  const topics = document.createElement("section");
  topics.className = "course-topics";
  topics.setAttribute("aria-label", "Conteúdo do curso");
  course.topics.forEach(([name, text], topicIndex) => {
    const card = document.createElement("article");
    card.className = "course-topic";
    const h = document.createElement("h2");
    h.textContent = name;
    const p = document.createElement("p");
    p.textContent = text;
    const progress = educationState.states?.[course.id] || { last_topic_index: 0, completed_topics: [] };
    const completeTopic = document.createElement("button"); completeTopic.type = "button"; completeTopic.className = "topic-complete"; completeTopic.dataset.topicIndex = String(topicIndex);
    const topicDone = (progress.completed_topics || []).includes(topicIndex);
    completeTopic.textContent = topicDone ? "Etapa concluída ✓" : "Marcar etapa como concluída";
    completeTopic.setAttribute("aria-pressed", String(topicDone));
    completeTopic.addEventListener("click", async () => {
      const wasCompleted = (educationState.states?.[course.id]?.completed_topics || []).includes(topicIndex);
      completeTopic.disabled = true;
      try {
        let savedTopics;
        if (loggedIn) {
          const result = await CashyAPI.education.saveTopic(course.id, topicIndex); savedTopics = result.completed_topics;
          educationState.xp = (await CashyAPI.education.get()).xp;
        } else {
          const current = educationState.states[course.id];
          current.completed_topics = [...new Set([...(current.completed_topics || []), topicIndex])]; current.last_topic_index = topicIndex; current.last_accessed_at = new Date().toISOString();
          educationState.xp = Number(educationState.xp || 0) + (wasCompleted ? 0 : 5);
          educationState.activity ||= []; if (!wasCompleted) educationState.activity.unshift({ type: "topic_completed", course_id: course.id, points: 5, created_at: new Date().toISOString() });
          localStorage.setItem("cashyAulas:visitante", JSON.stringify({ ...educationState, completed })); savedTopics = current.completed_topics;
        }
        educationState.states[course.id] ||= {}; educationState.states[course.id].completed_topics = savedTopics; educationState.states[course.id].last_topic_index = topicIndex;
        completeTopic.textContent = "Etapa concluída ✓"; completeTopic.setAttribute("aria-pressed", "true");
        status.textContent = wasCompleted ? "Essa etapa já estava concluída." : "Etapa salva. Você ganhou 5 XP de aprendizagem.";
      } catch (error) { status.textContent = error.message || "Não foi possível salvar esta etapa."; }
      finally { completeTopic.disabled = false; }
    });
    card.append(h, p, completeTopic);
    topics.append(card);
  });
  root.append(topics);
  const courseState = educationState.states[course.id];
  const lastTopicIndex = Number(courseState.last_topic_index || 0);
  const resumeTopicIndex = (courseState.completed_topics || []).includes(lastTopicIndex) ? Math.min(lastTopicIndex + 1, course.topics.length - 1) : lastTopicIndex;
  if (resumeTopicIndex > 0 && topics.children[resumeTopicIndex]) setTimeout(() => topics.children[resumeTopicIndex].scrollIntoView({ block: "start", behavior: "smooth" }), 120);

  const quiz = document.createElement("section");
  quiz.className = "course-quiz";
  quiz.innerHTML = '<h2>Quiz · teste seus conhecimentos</h2>';
  const form = document.createElement("form");
  course.quiz.forEach((q, qi) => {
    const field = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = (qi + 1) + ". " + q.question;
    field.append(legend);
    q.options.forEach((option, oi) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "q" + qi;
      input.value = String(oi);
      const span = document.createElement("span");
      span.textContent = option;
      label.append(input, span);
      field.append(label);
    });
    form.append(field);
  });

  const historyPanel = document.createElement("details");
  historyPanel.className = "quiz-history";
  historyPanel.innerHTML = "<summary>Rever tentativas anteriores</summary>";
  const historyContent = document.createElement("div"); historyPanel.append(historyContent);
  const savedAttempts = educationState.states[course.id]?.quiz_history || [];
  function renderQuizHistory() {
    historyContent.replaceChildren(...savedAttempts.slice().reverse().map((attempt, attemptIndex) => {
      const section = document.createElement("section");
      const heading = document.createElement("strong"); heading.textContent = "Tentativa " + (savedAttempts.length - attemptIndex) + " · " + attempt.score + " de " + attempt.total;
      section.append(heading);
      course.quiz.forEach((question, qi) => {
        const answer = document.createElement("p");
        const selected = Number(attempt.answers?.[qi]);
        answer.textContent = (qi + 1) + ". " + question.question + " — Sua resposta: " + (question.options[selected] || "sem resposta") + (selected === question.answer ? " ✓" : " · correta: " + question.options[question.answer]);
        section.append(answer);
      });
      return section;
    }));
    if (!savedAttempts.length) historyContent.textContent = "Suas tentativas serão salvas aqui quando você conferir o quiz.";
  }
  renderQuizHistory();

  const actions = document.createElement("div");
  actions.className = "course-actions";
  const check = document.createElement("button");
  check.className = "outline-button";
  check.type = "button";
  check.textContent = "Conferir respostas";
  const completeButton = document.createElement("button");
  completeButton.className = "lime-button";
  completeButton.type = "button";
  completeButton.disabled = true;
  completeButton.textContent = "Marcar como concluído";
  const status = document.createElement("span");
  status.className = "course-status";
  status.setAttribute("role", "status");
  actions.append(check, completeButton, status);
  quiz.append(form, historyPanel, actions);
  root.append(quiz);

  const completedAlready = () => completed.includes(course.id);
  let passed = false;
  let savingQuiz = false;
  check.addEventListener("click", async () => {
    let score = 0;
    let unanswered = false;
    form.querySelectorAll("fieldset").forEach((field, qi) => {
      field.querySelectorAll(".quiz-explanation").forEach((element) => element.remove());
      field.querySelectorAll("label").forEach((element) => element.classList.remove("correct", "incorrect"));
      const selected = field.querySelector("input:checked");
      const question = course.quiz[qi];
      if (!selected) { unanswered = true; return; }
      field.querySelectorAll("label").forEach((label, oi) => {
        if (oi === question.answer) label.classList.add("correct");
        if (oi === Number(selected.value) && oi !== question.answer) label.classList.add("incorrect");
      });
      const note = document.createElement("p");
      note.className = "quiz-explanation";
      note.textContent = question.explanation;
      field.append(note);
      if (Number(selected.value) === question.answer) score++;
    });
    if (unanswered) {
      passed = false;
      completeButton.disabled = true;
      status.textContent = "Responda a todas as perguntas antes de conferir.";
      return;
    }
    passed = score === course.quiz.length;
    completeButton.disabled = true;
    check.disabled = true;
    savingQuiz = true;
    const answers = [...form.querySelectorAll("fieldset")].map((field) => Number(field.querySelector("input:checked")?.value ?? -1));
    const attempt = { answers, score, total: course.quiz.length, created_at: new Date().toISOString() };
    try {
      if (loggedIn) {
        await CashyAPI.education.saveQuiz(course.id, answers, score, course.quiz.length);
        educationState = await CashyAPI.education.get();
      } else if (!progressError) {
        const firstQuiz = !educationState.states[course.id].quiz_history.length;
        educationState.states[course.id].quiz_history.push(attempt);
        educationState.activity ||= [];
        if (firstQuiz) { educationState.xp = Number(educationState.xp || 0) + 10; educationState.activity.unshift({ type: "quiz_completed", course_id: course.id, points: 10, created_at: attempt.created_at }); }
        localStorage.setItem("cashyAulas:visitante", JSON.stringify({ ...educationState, completed }));
      } else throw new Error(progressError);
      const nextHistory = educationState.states?.[course.id]?.quiz_history || [];
      savedAttempts.splice(0, savedAttempts.length, ...nextHistory);
      renderQuizHistory();
      completeButton.disabled = !passed || completedAlready();
      status.textContent = completedAlready()
        ? "Quiz salvo. Este curso já está concluído; você pode rever suas respostas."
        : passed
          ? "Você acertou todas. Quiz salvo; agora pode concluir o curso."
          : score + " de " + course.quiz.length + " corretas. Suas respostas foram salvas; revise as explicações e tente novamente.";
    } catch (error) {
      passed = false;
      completeButton.disabled = true;
      status.textContent = "Não foi possível salvar suas respostas: " + (error.message || "tente novamente.");
    } finally { check.disabled = false; savingQuiz = false; }
  });

  form.addEventListener("change", () => {
    passed = false;
    completeButton.disabled = true;
    status.textContent = "Confira novamente suas respostas.";
  });

  completeButton.addEventListener("click", async () => {
    if (!passed || savingQuiz || completedAlready()) return;
    completeButton.disabled = true;
    try {
      if (loggedIn) {
        await CashyAPI.education.complete(course.id);
      } else if (!progressError) {
        const progress = new Set(completed);
        progress.add(course.id);
        const alreadyAwarded = educationState.completed_rewards?.includes(course.id);
        educationState.completed_rewards ||= [];
        if (!alreadyAwarded) { educationState.completed_rewards.push(course.id); educationState.xp = Number(educationState.xp || 0) + 20; educationState.activity ||= []; educationState.activity.unshift({ type: "course_completed", course_id: course.id, points: 20, created_at: new Date().toISOString() }); }
        localStorage.setItem("cashyAulas:visitante", JSON.stringify({ ...educationState, completed: [...progress] }));
      } else {
        throw new Error(progressError);
      }
      completed = [...new Set([...completed, course.id])];
      completeButton.textContent = "Curso concluído ✓";
      status.textContent = loggedIn
        ? "Conclusão salva no banco de dados da sua conta."
        : "Progresso salvo neste navegador. Volte à trilha para ver seu avanço.";
    } catch (error) {
      completeButton.disabled = false;
      status.textContent = error.message || "Não foi possível salvar seu progresso.";
    }
  });

  if (completedAlready()) {
    completeButton.textContent = "Curso concluído ✓";
    status.textContent = "Este curso já está concluído. Você pode rever o conteúdo.";
  } else if (progressError) {
    status.textContent = "Não foi possível carregar o progresso da conta: " + progressError;
  }

  const navigation = document.createElement("nav");
  navigation.className = "course-nav";
  navigation.setAttribute("aria-label", "Navegar entre cursos");
  const previous = document.createElement("a");
  previous.href = index > 0 ? "curso.html?id=" + encodeURIComponent(courses[index - 1].id) : "educacao.html#trilha";
  previous.textContent = index > 0 ? "← Curso anterior" : "← Voltar à trilha";
  const next = document.createElement("a");
  next.href = index < courses.length - 1 ? "curso.html?id=" + encodeURIComponent(courses[index + 1].id) : "educacao.html#trilha";
  next.textContent = index < courses.length - 1 ? "Próximo curso →" : "Voltar à trilha →";
  navigation.append(previous, next);
  root.append(navigation);
})().catch((error) => {
  const root = document.getElementById("courseContent");
  if (root) root.prepend(Object.assign(document.createElement("p"), { role: "status", textContent: error.message || "Não foi possível carregar o curso." }));
});
