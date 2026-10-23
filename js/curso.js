(function () {
  "use strict";
  const courses = window.CASHY_CURSOS || [];
  const id = new URLSearchParams(location.search).get("id");
  const index = courses.findIndex((item) => item.id === id);
  const root = document.getElementById("courseContent");
  if (index < 0) {
    root.innerHTML = '<section class="course-heading"><span class="eyebrow">EDUCAÇÃO CASHY</span><h1>Curso não encontrado</h1><p>Escolha um curso na trilha para continuar aprendendo.</p><a class="lime-button" href="educacao.html#trilha">Voltar para a trilha</a></section>';
    return;
  }
  const email = (() => { try { for (const store of [localStorage, sessionStorage]) if (store.getItem("cashyLogado") === "true") return store.getItem("cashyEmail") || ""; } catch (_) {} return ""; })();
  const progressKey = "cashyAulas:" + (email || "visitante");
  const read = () => { try { const value = JSON.parse(localStorage.getItem(progressKey) || "{}"); return Array.isArray(value.completed) ? value.completed.filter((x) => courses.some((c) => c.id === x)) : []; } catch (_) { return []; } };
  const course = courses[index];
  const heading = document.createElement("section"); heading.className = "course-heading";
  const level = document.createElement("span"); level.className = "eyebrow"; level.textContent = course.level;
  const title = document.createElement("h1"); title.textContent = course.title;
  const description = document.createElement("p"); description.textContent = course.description;
  heading.append(level, title, description); root.append(heading);
  const topics = document.createElement("section"); topics.className = "course-topics"; topics.setAttribute("aria-label", "Conteúdo do curso");
  course.topics.forEach(([name, text]) => { const card = document.createElement("article"); card.className = "course-topic"; const h = document.createElement("h2"); h.textContent = name; const p = document.createElement("p"); p.textContent = text; card.append(h, p); topics.append(card); });
  root.append(topics);
  const quiz = document.createElement("section"); quiz.className = "course-quiz"; quiz.innerHTML = '<h2>Quiz · teste seus conhecimentos</h2>';
  const form = document.createElement("form");
  course.quiz.forEach((q, qi) => { const field = document.createElement("fieldset"); const legend = document.createElement("legend"); legend.textContent = (qi + 1) + ". " + q.question; field.append(legend); q.options.forEach((option, oi) => { const label = document.createElement("label"); const input = document.createElement("input"); input.type = "radio"; input.name = "q" + qi; input.value = String(oi); const span = document.createElement("span"); span.textContent = option; label.append(input, span); field.append(label); }); form.append(field); });
  const actions = document.createElement("div"); actions.className = "course-actions";
  const check = document.createElement("button"); check.className = "outline-button"; check.type = "button"; check.textContent = "Conferir respostas";
  const complete = document.createElement("button"); complete.className = "lime-button"; complete.type = "button"; complete.disabled = true; complete.textContent = "Marcar como concluído";
  const status = document.createElement("span"); status.className = "course-status"; status.setAttribute("role", "status");
  actions.append(check, complete, status); quiz.append(form, actions); root.append(quiz);
  const completedAlready = () => read().includes(course.id);
  let passed = false;
  check.addEventListener("click", () => {
    let score = 0, unanswered = false;
    form.querySelectorAll("fieldset").forEach((field, qi) => {
      field.querySelectorAll(".quiz-explanation").forEach((e) => e.remove());
      field.querySelectorAll("label").forEach((e) => e.classList.remove("correct", "incorrect"));
      const selected = field.querySelector("input:checked"); const q = course.quiz[qi];
      if (!selected) { unanswered = true; return; }
      field.querySelectorAll("label").forEach((label, oi) => { if (oi === q.answer) label.classList.add("correct"); if (oi === Number(selected.value) && oi !== q.answer) label.classList.add("incorrect"); });
      const note = document.createElement("p"); note.className = "quiz-explanation"; note.textContent = q.explanation; field.append(note);
      if (Number(selected.value) === q.answer) score++;
    });
    if (unanswered) { passed = false; complete.disabled = true; status.textContent = "Responda a todas as perguntas antes de conferir."; return; }
    passed = score === course.quiz.length; complete.disabled = !passed || completedAlready();
    status.textContent = completedAlready() ? "Este curso já está concluído. Você pode rever o conteúdo." : passed ? "Você acertou todas. Agora pode concluir o curso." : score + " de " + course.quiz.length + " corretas. Revise as explicações e tente novamente.";
  });
  form.addEventListener("change", () => { passed = false; complete.disabled = true; status.textContent = "Confira novamente suas respostas."; });
  complete.addEventListener("click", () => {
    if (!passed) return;
    try { const list = new Set(read()); list.add(course.id); localStorage.setItem(progressKey, JSON.stringify({ completed: [...list] })); complete.disabled = true; complete.textContent = "Curso concluído ✓"; status.textContent = "Progresso salvo neste navegador. Volte à trilha para ver seu avanço."; }
    catch (_) { status.textContent = "Não foi possível salvar seu progresso neste navegador."; }
  });
  if (completedAlready()) { complete.textContent = "Curso concluído ✓"; status.textContent = "Este curso já está concluído. Você pode rever o conteúdo."; }
  const navigation = document.createElement("nav"); navigation.className = "course-nav"; navigation.setAttribute("aria-label", "Navegar entre cursos");
  const prev = document.createElement("a"); prev.href = index > 0 ? "curso.html?id=" + encodeURIComponent(courses[index - 1].id) : "educacao.html#trilha"; prev.textContent = index > 0 ? "← Curso anterior" : "← Voltar à trilha";
  const next = document.createElement("a"); next.href = index < courses.length - 1 ? "curso.html?id=" + encodeURIComponent(courses[index + 1].id) : "educacao.html#trilha"; next.textContent = index < courses.length - 1 ? "Próximo curso →" : "Voltar à trilha →";
  navigation.append(prev, next); root.append(navigation);
})();
