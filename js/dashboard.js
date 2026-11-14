(async function () {
  "use strict";

  const chartDescription = document.getElementById("chartDescription");
  let user;
  let transactions;
  let goals;
  try {
    const session = await CashyAPI.auth.me();
    if (!session.authenticated) { location.replace("login.html"); return; }
    user = session.user;
    let education;
    let accountProfile;
    [transactions, goals, education, accountProfile] = await Promise.all([CashyAPI.transactions.list(), CashyAPI.goals.list(), CashyAPI.education.get(), CashyAPI.profile.get()]);
    window.cashEducation = education;
    window.cashProfile = accountProfile;
  } catch (error) {
    if (chartDescription) chartDescription.textContent = error.message;
    return;
  }

  const firstName = user.name.trim().split(/\s+/)[0] || "pessoa";
  const hour = new Date().getHours();
  document.getElementById("greeting").textContent = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  document.getElementById("userName").textContent = firstName;
  document.getElementById("welcomeName").textContent = firstName;
  const avatarIcons = { leaf: "🌱", sun: "☀️", spark: "✨", moon: "🌙", flower: "🌼", wave: "🌊" };
  const avatar = document.getElementById("avatar");
  avatar.textContent = avatarIcons[window.cashProfile?.avatar_key] || firstName.charAt(0).toUpperCase();
  avatar.dataset.color = window.cashProfile?.avatar_color || "green";

  function renderLearningOverview(education, accountProfile) {
    const courseData = window.CASHY_CURSOS || [];
    const completed = new Set(education.completed || []);
    const states = education.states || {};
    const active = Object.entries(states).filter(([id]) => !completed.has(id)).sort((a, b) => String(b[1].last_accessed_at).localeCompare(String(a[1].last_accessed_at)));
    const xp = Number(education.xp) || 0;
    const levels = [[0, "Aprendiz"], [50, "Explorador"], [150, "Organizador"], [300, "Planejador"], [600, "Conhecedor"]];
    document.getElementById("learningXp").textContent = xp + " XP";
    document.getElementById("learningLevel").textContent = [...levels].reverse().find(([min]) => xp >= min)?.[1] || "Aprendiz";
    document.getElementById("learningStreak").textContent = (Number(education.streak) || 0) + " dias de estudo";
    document.getElementById("learningSummary").textContent = completed.size + " de " + courseData.length + " cursos concluídos" + (active.length ? " · " + active.length + " em andamento" : "");
    const resume = document.getElementById("continueLesson");
    const currentId = active[0]?.[0] || courseData.find((course) => !completed.has(course.id))?.id;
    const current = courseData.find((course) => course.id === currentId);
    if (current) { resume.href = "curso.html?id=" + encodeURIComponent(current.id); resume.innerHTML = "Continuar " + current.title + ' <span aria-hidden="true">→</span>'; }
    else { resume.href = "educacao.html#trilha"; resume.innerHTML = 'Rever seus cursos <span aria-hidden="true">→</span>'; }
    const recommendation = courseData.find((course) => !completed.has(course.id) && course.id !== currentId) || (current ? current : null);
    const recommendationNode = document.getElementById("learningRecommendation");
    if (recommendation) {
      const label = document.createElement("span"); label.className = "eyebrow"; label.textContent = "PRÓXIMA SUGESTÃO";
      const link = document.createElement("a"); link.href = "curso.html?id=" + encodeURIComponent(recommendation.id); link.textContent = recommendation.title + " →";
      const description = document.createElement("p"); description.textContent = recommendation.description;
      recommendationNode.replaceChildren(label, link, description);
    } else recommendationNode.textContent = "Você concluiu a trilha. Releia um curso para rever os conceitos.";
    document.getElementById("learningReminder").hidden = !accountProfile.preferences?.learning_reminder;
    const recent = [
      ...(education.activity || []).map((entry) => ({ kind: "learning", ...entry, date: entry.created_at })),
      ...transactions.map((entry) => ({ kind: "money", type: entry.type, description: entry.description, amount: entry.amount, date: entry.date + "T12:00:00" }))
    ].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6);
    const items = recent.map((entry) => {
      const row = document.createElement("p");
      if (entry.kind === "money") row.textContent = (entry.type === "income" ? "Entrada registrada" : "Saída registrada") + " · " + entry.description + " · " + money(entry.amount);
      else { const course = courseData.find((item) => item.id === entry.course_id); const names = { topic_completed: "Etapa estudada", quiz_completed: "Quiz respondido", course_completed: "Curso concluído", course_opened: "Curso acessado" }; row.textContent = (names[entry.type] || "Atividade") + (course ? " · " + course.title : "") + (entry.points ? " · +" + entry.points + " XP" : ""); }
      return row;
    });
    const activityNode = document.getElementById("learningActivity");
    activityNode.replaceChildren(...(items.length ? items : [Object.assign(document.createElement("p"), { textContent: "Quando você estudar, suas atividades e XP aparecerão aqui." })]));
  }

  document.getElementById("logout").addEventListener("click", async function () {
    this.disabled = true;
    try { await CashyAPI.auth.logout(); }
    finally { location.replace("login.html"); }
  });

  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");
  menuToggle.addEventListener("click", () => {
    const open = sidebar.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
      menuToggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 760 && sidebar.classList.contains("open") && !sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
      sidebar.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });

  const money = (value) => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  renderLearningOverview(window.cashEducation || {}, window.cashProfile || {});
  const periodSelect = document.getElementById("periodo");
  const now = new Date();
  for (let offset = 0; offset < 6; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const value = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
    const option = document.createElement("option");
    option.value = value;
    option.textContent = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
    periodSelect.append(option);
  }

  function includeRecordedPeriods() {
    const known = new Set([...periodSelect.options].map((option) => option.value));
    transactions.forEach((entry) => {
      const value = String(entry.date).slice(0, 7);
      if (!/^\d{4}-\d{2}$/.test(value) || known.has(value)) return;
      const date = new Date(value + "-01T12:00:00");
      const option = document.createElement("option");
      option.value = value;
      option.textContent = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
      periodSelect.add(option);
      known.add(value);
    });
  }

  function selectedTransactions() {
    return transactions.filter((entry) => String(entry.date).slice(0, 7) === periodSelect.value);
  }

  const dialog = document.getElementById("dialogo");
  const dialogTitle = document.getElementById("dialogoTitulo");
  const dialogTag = document.getElementById("dialogoTag");
  const dialogContent = document.getElementById("dialogoConteudo");
  function openDialog(tag, title, content) {
    dialogTag.textContent = tag;
    dialogTitle.textContent = title;
    dialogContent.replaceChildren(content);
    dialog.showModal();
  }
  document.getElementById("fecharDialogo").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });

  function updateSummary() {
    includeRecordedPeriods();
    const entries = selectedTransactions();
    const incoming = entries.filter((item) => item.type === "income").reduce((total, item) => total + Number(item.amount), 0);
    const outgoing = entries.filter((item) => item.type === "expense").reduce((total, item) => total + Number(item.amount), 0);
    document.getElementById("resumoSaldo").textContent = money(incoming - outgoing);
    document.getElementById("resumoEntradas").textContent = money(incoming);
    document.getElementById("resumoSaidas").textContent = money(outgoing);
    document.getElementById("resumoMetas").textContent = money(goals.reduce((sum, goal) => sum + (Number(goal.saved) || 0), 0));
    const label = periodSelect.options[periodSelect.selectedIndex]?.textContent || "período escolhido";
    document.getElementById("rotuloEntradas").textContent = label;
    document.getElementById("rotuloSaidas").textContent = label;
    chartDescription.textContent = entries.length ? "Comparação das movimentações salvas na sua conta." : "Cadastre movimentações para montar o comparativo.";
    const chart = document.getElementById("chartEstado");
    if (!entries.length) {
      chart.replaceChildren(Object.assign(document.createElement("p"), { textContent: "Nenhuma movimentação cadastrada neste período." }));
      return;
    }
    const max = Math.max(incoming, outgoing, 1);
    chart.replaceChildren(...[["Entradas", incoming, "income"], ["Saídas", outgoing, "expense"]].map(([labelText, value, kind]) => {
      const row = document.createElement("div");
      row.className = "chart-bar-row";
      const name = document.createElement("span");
      name.textContent = labelText;
      const track = document.createElement("div");
      track.className = "chart-bar-track";
      const bar = document.createElement("span");
      bar.className = "chart-bar " + kind;
      bar.style.width = Math.max(value ? 2 : 0, value / max * 100) + "%";
      track.append(bar);
      const amount = document.createElement("strong");
      amount.textContent = money(value);
      row.append(name, track, amount);
      return row;
    }));
  }

  function formatDate(dateText) {
    return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateText + "T12:00:00"));
  }

  function createTransactionRow(entry, removable) {
    const row = document.createElement("div");
    row.className = "transaction-row";
    const icon = document.createElement("span");
    icon.className = "transaction-icon " + (entry.type === "income" ? "income" : "food");
    icon.textContent = entry.type === "income" ? "↙" : "↗";
    const info = document.createElement("div");
    info.className = "transaction-info";
    const title = document.createElement("strong");
    title.textContent = entry.description;
    const detail = document.createElement("small");
    detail.textContent = (entry.category || (entry.type === "income" ? "Entrada" : "Saída")) + " · " + formatDate(entry.date);
    info.append(title, detail);
    const amount = document.createElement("strong");
    amount.className = "amount " + (entry.type === "income" ? "positive" : "negative");
    amount.textContent = (entry.type === "income" ? "+ " : "− ") + money(entry.amount);
    row.append(icon, info, amount);
    if (removable) {
      const remove = document.createElement("button");
      remove.className = "remove-transaction";
      remove.type = "button";
      remove.dataset.transactionId = String(entry.id);
      remove.setAttribute("aria-label", "Excluir " + entry.description);
      remove.textContent = "Excluir";
      row.append(remove);
    }
    return row;
  }

  function renderTransactions() {
    const list = document.getElementById("transactionList");
    const entries = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
    if (!entries.length) {
      list.replaceChildren(Object.assign(document.createElement("p"), { className: "empty-transactions", textContent: "Você ainda não registrou movimentações." }));
      return;
    }
    list.replaceChildren(...entries.slice(0, 4).map((entry) => createTransactionRow(entry, false)));
  }

  function renderGoal() {
    const goal = goals[0];
    const art = document.getElementById("goalArt");
    const amountRow = document.getElementById("goalAmountRow");
    const button = document.getElementById("editarMeta");
    const goalList = document.getElementById("dashboardGoalList");
    goalList.replaceChildren();
    if (!goal) {
      art.hidden = true;
      amountRow.hidden = true;
      document.getElementById("goalName").textContent = "Você ainda não criou uma meta.";
      document.getElementById("goalDesc").textContent = "Quando quiser, registre um objetivo e quanto pretende guardar.";
      button.innerHTML = 'Criar minha primeira meta <span>→</span>';
      return;
    }
    if (goals.length > 1) {
      document.getElementById("goalName").textContent = "Metas em andamento";
      document.getElementById("goalDesc").textContent = "Acompanhe o valor guardado e o progresso de cada objetivo.";
      art.hidden = true;
      amountRow.hidden = true;
      goalList.replaceChildren(...goals.map((item) => {
        const savedValue = Number(item.saved) || 0, targetValue = Number(item.target) || 1;
        const percentValue = Math.min(100, Math.round(savedValue / targetValue * 100));
        const row = document.createElement("div"); row.className = "dashboard-goal-row";
        const title = document.createElement("strong"); title.textContent = item.name;
        const label = document.createElement("span"); label.textContent = percentValue >= 100 ? "Concluída · " + money(savedValue) : percentValue + "% · faltam " + money(Math.max(0, targetValue - savedValue));
        const track = document.createElement("div"); track.className = "dashboard-goal-track"; track.setAttribute("role", "progressbar"); track.setAttribute("aria-label", "Progresso de " + item.name); track.setAttribute("aria-valuemin", "0"); track.setAttribute("aria-valuemax", "100"); track.setAttribute("aria-valuenow", String(percentValue));
        const bar = document.createElement("span"); bar.style.width = percentValue + "%"; track.append(bar); row.append(title, label, track); return row;
      }));
      button.innerHTML = 'Ver minhas metas <span>→</span>';
      return;
    }
    const saved = Number(goal.saved) || 0;
    const target = Number(goal.target);
    const percent = Math.min(100, Math.round((saved / target) * 100));
    art.hidden = false;
    amountRow.hidden = false;
    document.getElementById("goalName").textContent = goal.name;
    document.getElementById("goalPercent").textContent = percent + "%";
    document.getElementById("goalRing").setAttribute("aria-valuenow", String(percent));
    document.getElementById("goalAmount").textContent = money(saved) + " / " + money(target);
    document.getElementById("goalRing").style.background = "conic-gradient(#31c973 " + percent + "%, #243029 " + percent + "% 100%)";
    let description = percent >= 100 ? "Objetivo alcançado." : "Faltam " + money(Math.max(0, target - saved)) + " para o valor que definiu.";
    if (percent < 100 && goal.due_date) {
      const due = new Date(goal.due_date + "T12:00:00"), today = new Date();
      const months = Math.max(1, (due.getFullYear() - today.getFullYear()) * 12 + due.getMonth() - today.getMonth());
      description += " Para chegar ao prazo, cerca de " + money(Math.max(0, target - saved) / months) + " por mês.";
    }
    document.getElementById("goalDesc").textContent = description;
    button.innerHTML = 'Editar minha meta <span>→</span>';
  }

  function openTransactionForm(existing) {
    const form = document.createElement("form");
    form.className = "dialog-form";
    form.innerHTML = '<label>O que foi?<input name="description" maxlength="60" placeholder="Ex.: mercado, salário" required></label><label>Tipo<select name="type"><option value="expense">Saída (gastei)</option><option value="income">Entrada (recebi)</option></select></label><label>Categoria<input name="category" maxlength="30" placeholder="Ex.: alimentação"></label><label>Valor (R$)<input name="amount" type="number" min="0.01" step="0.01" required></label><label>Data<input name="date" type="date" required></label><p class="dialog-status" aria-live="polite"></p><button type="submit">Salvar movimentação</button>';
    const today = new Date();
    form.elements.date.value = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    if (existing) Object.entries(existing).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const item = {
        id: existing ? existing.id : undefined,
        description: String(data.get("description")).trim(),
        type: String(data.get("type")),
        category: String(data.get("category")).trim(),
        amount: Number(data.get("amount")),
        date: String(data.get("date"))
      };
      if (!item.description || !item.date || !Number.isFinite(item.amount) || item.amount <= 0) {
        form.querySelector(".dialog-status").textContent = "Preencha a descrição, a data e um valor maior que zero.";
        return;
      }
      const saveButton = form.querySelector("button[type=submit]");
      saveButton.disabled = true;
      try {
        const saved = existing ? await CashyAPI.transactions.update(item) : await CashyAPI.transactions.create(item);
        transactions = existing ? transactions.map((entry) => entry.id === saved.id ? saved : entry) : [...transactions, saved];
        periodSelect.value = saved.date.slice(0, 7);
        updateSummary();
        renderTransactions();
        dialog.close();
      } catch (error) {
        form.querySelector(".dialog-status").textContent = error.message;
        saveButton.disabled = false;
      }
    });
    openDialog("MEU DINHEIRO", existing ? "Editar movimentação" : "Adicionar movimentação", form);
  }

  function openGoalForm(existing) {
    const form = document.createElement("form");
    form.className = "dialog-form";
    form.innerHTML = '<label>Nome da meta<input name="name" maxlength="45" required></label><label>Quanto já guardou (R$)<input name="saved" type="number" min="0" step="0.01" value="0" required></label><label>Quanto quer guardar (R$)<input name="target" type="number" min="0.01" step="0.01" required></label><label>Prazo desejado (opcional)<input name="due_date" type="date"></label><p class="dialog-status" aria-live="polite"></p><button type="submit">Salvar meta</button>';
    if (existing) {
      form.elements.name.value = existing.name;
      form.elements.saved.value = existing.saved;
      form.elements.target.value = existing.target;
      form.elements.due_date.value = existing.due_date || "";
    }
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const item = {
        id: existing ? existing.id : undefined,
        name: String(data.get("name")).trim(),
        saved: Number(data.get("saved")),
        target: Number(data.get("target")),
        due_date: String(data.get("due_date") || "")
      };
      if (!item.name || !Number.isFinite(item.saved) || !Number.isFinite(item.target) || item.target <= 0 || item.saved < 0) {
        form.querySelector(".dialog-status").textContent = "Confira os valores e tente novamente.";
        return;
      }
      const saveButton = form.querySelector("button[type=submit]");
      saveButton.disabled = true;
      try {
        const saved = existing ? await CashyAPI.goals.update(item) : await CashyAPI.goals.create(item);
        goals = existing ? goals.map((goal) => goal.id === saved.id ? saved : goal) : [...goals, saved];
        renderGoal();
        updateSummary();
        dialog.close();
      } catch (error) {
        form.querySelector(".dialog-status").textContent = error.message;
        saveButton.disabled = false;
      }
    });
    openDialog("SUA META", existing ? "Editar meta" : "Criar meta", form);
  }

  document.getElementById("verMovimentacoes").addEventListener("click", () => {
    const list = document.createElement("div");
    list.className = "all-transactions";
    const entries = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
    if (entries.length) entries.forEach((entry) => list.append(createTransactionRow(entry, true)));
    else list.append(Object.assign(document.createElement("p"), { className: "empty-transactions", textContent: "Você ainda não registrou movimentações." }));
    const note = document.createElement("p");
    note.className = "dialog-copy";
    note.textContent = "As movimentações ficam associadas à sua conta.";
    const content = document.createElement("div");
    content.append(list, note);
    openDialog("SEUS REGISTROS", "Movimentações", content);
  });

  dialogContent.addEventListener("click", async (event) => {
    const button = event.target.closest(".remove-transaction");
    if (!button || !button.dataset.transactionId) return;
    if (!window.confirm("Excluir esta movimentação?")) return;
    button.disabled = true;
    try {
      await CashyAPI.transactions.remove(button.dataset.transactionId);
      transactions = transactions.filter((entry) => String(entry.id) !== button.dataset.transactionId);
      renderTransactions();
      updateSummary();
      dialog.close();
      document.getElementById("verMovimentacoes").click();
    } catch (error) {
      button.disabled = false;
      const status = document.createElement("p");
      status.className = "dialog-status";
      status.setAttribute("role", "status");
      status.textContent = error.message;
      dialogContent.append(status);
    }
  });

  document.getElementById("adicionarMovimentacao").addEventListener("click", () => openTransactionForm(null));
  document.getElementById("editarMeta").addEventListener("click", () => {
    if (goals.length > 1) { location.href = "metas.html"; return; }
    openGoalForm(goals[0] || null);
  });
  document.getElementById("abrirAula").addEventListener("click", () => {
    const lesson = document.createElement("div");
    lesson.innerHTML = '<p class="dialog-copy">Investir é usar dinheiro para adquirir algo que pode gerar retorno no futuro. O resultado não é garantido: cada tipo tem regras, prazo e riscos próprios.</p><ul class="lesson-list"><li><strong>1. Primeiro, organize.</strong><br>Veja quanto entra, quanto sai e o que você consegue guardar.</li><li><strong>2. Conheça as opções.</strong><br>Entenda como funciona, quando pode resgatar e quais são os riscos.</li><li><strong>3. Compare as regras.</strong><br>Pesquise e tire dúvidas antes de decidir. Não existe uma escolha igual para todo mundo.</li></ul><p class="dialog-copy">Este conteúdo é educativo e não recomenda um investimento específico.</p><a class="insight-button" href="educacao.html#trilha">Abrir a trilha completa →</a>';
    openDialog("AULA RÁPIDA", "Investir, em palavras simples", lesson);
  });

  periodSelect.addEventListener("change", updateSummary);
  renderTransactions();
  renderGoal();
  updateSummary();
})().catch((error) => {
  const description = document.getElementById("chartDescription");
  if (description) description.textContent = error.message || "Não foi possível carregar sua conta.";
});
