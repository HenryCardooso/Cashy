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
  try {
    const session = await CashyAPI.auth.me();
    loggedIn = Boolean(session.authenticated);
    if (loggedIn) {
      const state = await CashyAPI.education.get();
      completed = Array.isArray(state.completed) ? state.completed : [];
    } else {
      const saved = JSON.parse(localStorage.getItem("cashyAulas:visitante") || "{}");
      completed = Array.isArray(saved.completed) ? saved.completed : [];
    }
  } catch (error) {
    progressError = error.message;
    try {
      const saved = JSON.parse(localStorage.getItem("cashyAulas:visitante") || "{}");
      completed = Array.isArray(saved.completed) ? saved.completed : [];
    } catch (_) {}
  }

  const course = courses[index];
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
  course.topics.forEach(([name, text]) => {
    const card = document.createElement("article");
    card.className = "course-topic";
    const h = document.createElement("h2");
    h.textContent = name;
    const p = document.createElement("p");
    p.textContent = text;
    card.append(h, p);
    topics.append(card);
  });
  root.append(topics);

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
  quiz.append(form, actions);
  root.append(quiz);

  const completedAlready = () => completed.includes(course.id);
  let passed = false;
  check.addEventListener("click", () => {
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
    completeButton.disabled = !passed || completedAlready();
    status.textContent = completedAlready()
      ? "Este curso já está concluído. Você pode rever o conteúdo."
      : passed
        ? "Você acertou todas. Agora pode concluir o curso."
        : score + " de " + course.quiz.length + " corretas. Revise as explicações e tente novamente.";
  });

  form.addEventListener("change", () => {
    passed = false;
    completeButton.disabled = true;
    status.textContent = "Confira novamente suas respostas.";
  });

  completeButton.addEventListener("click", async () => {
    if (!passed || completedAlready()) return;
    completeButton.disabled = true;
    try {
      if (loggedIn) {
        await CashyAPI.education.complete(course.id);
      } else if (!progressError) {
        const progress = new Set(completed);
        progress.add(course.id);
        localStorage.setItem("cashyAulas:visitante", JSON.stringify({ completed: [...progress] }));
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