(function () {
  "use strict";
  const sessionKeys = ["cashyLogado", "cashyEmail", "cashyNome"];
  function getSession() {
    try {
      for (const storage of [localStorage, sessionStorage]) {
        if (storage.getItem("cashyLogado") === "true") return {
          name: storage.getItem("cashyNome") || (storage.getItem("cashyEmail") || "pessoa").split("@")[0],
          email: storage.getItem("cashyEmail") || ""
        };
      }
    } catch (_) {}
    return null;
  }
  const user = getSession();
  if (!user) { location.replace("login.html"); return; }
  const firstName = user.name.trim().split(/\s+/)[0] || "pessoa";
  const hour = new Date().getHours();
  document.getElementById("greeting").textContent = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  document.getElementById("userName").textContent = firstName;
  document.getElementById("welcomeName").textContent = firstName;
  document.getElementById("avatar").textContent = firstName.charAt(0).toUpperCase();

  document.getElementById("logout").addEventListener("click", function () {
    try { [localStorage, sessionStorage].forEach((storage) => sessionKeys.forEach((key) => storage.removeItem(key))); } catch (_) {}
    location.replace("login.html");
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
      sidebar.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false"); menuToggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 760 && sidebar.classList.contains("open") && !sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
      sidebar.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false");
    }
  });
  document.querySelectorAll('.sidebar nav a[href^="#"]').forEach((link) => link.addEventListener("click", () => {
    document.querySelectorAll(".sidebar nav a").forEach((item) => item.classList.remove("selected"));
    link.classList.add("selected");
    if (window.innerWidth <= 760) { sidebar.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false"); }
  }));

  const money = (value) => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const periodSelect = document.getElementById("periodo");
  const now = new Date();
  for (let offset = 0; offset < 6; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const value = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
    const option = document.createElement("option"); option.value = value;
    option.textContent = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
    periodSelect.append(option);
  }
  const transactionKey = "cashyMovimentacoes:" + (user.email || "demo");
  const goalStorageKey = "cashyMeta:" + (user.email || "demo");
  function readTransactions() {
    try {
      const parsed = JSON.parse(localStorage.getItem(transactionKey) || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => item && item.id && item.date && Number.isFinite(Number(item.amount))) : [];
    } catch (_) { return []; }
  }
  function includeRecordedPeriods() {
    const known = new Set([...periodSelect.options].map((option) => option.value));
    readTransactions().forEach((entry) => {
      const value = String(entry.date).slice(0, 7);
      if (!/^\d{4}-\d{2}$/.test(value) || known.has(value)) return;
      const date = new Date(value + "-01T12:00:00"); const option = document.createElement("option");
      option.value = value; option.textContent = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date); periodSelect.add(option); known.add(value);
    });
  }
  function selectedTransactions() {
    return readTransactions().filter((entry) => String(entry.date).slice(0, 7) === periodSelect.value);
  }
  function readGoal() {
    try {
      const value = JSON.parse(localStorage.getItem(goalStorageKey) || "[]");
      const goals = Array.isArray(value) ? value : value && value.name ? [{ ...value, id: "goal-migrated" }] : [];
      return goals.filter((goal) => goal && typeof goal.name === "string" && Number(goal.target) > 0).map((goal, index) => ({ ...goal, id: goal.id || "goal-migrated-" + index }));
    } catch (_) { return []; }
  }
  function updateSummary() {
    includeRecordedPeriods();
    const entries = selectedTransactions();
    const incoming = entries.filter((item) => item.type === "income").reduce((total, item) => total + Number(item.amount), 0);
    const outgoing = entries.filter((item) => item.type === "expense").reduce((total, item) => total + Number(item.amount), 0);
    const goals = readGoal();
    document.getElementById("resumoSaldo").textContent = money(incoming - outgoing);
    document.getElementById("resumoEntradas").textContent = money(incoming);
    document.getElementById("resumoSaidas").textContent = money(outgoing);
    document.getElementById("resumoMetas").textContent = money(goals.reduce((sum, goal) => sum + (Number(goal.saved) || 0), 0));
    const selectedLabel = periodSelect.options[periodSelect.selectedIndex]?.textContent || "período escolhido";
    document.getElementById("rotuloEntradas").textContent = selectedLabel;
    document.getElementById("rotuloSaidas").textContent = selectedLabel;
    const chartDescription = document.getElementById("chartDescription");
    const chart = document.getElementById("chartEstado");
    chartDescription.textContent = entries.length ? "Comparação dos valores que você registrou neste período." : "Cadastre movimentações para montar o comparativo.";
    if (!entries.length) { chart.replaceChildren(Object.assign(document.createElement("p"), { textContent: "Nenhuma movimentação cadastrada neste período." })); return; }
    const max = Math.max(incoming, outgoing, 1);
    chart.replaceChildren(...[["Entradas", incoming, "income"], ["Saídas", outgoing, "expense"]].map(([label, value, kind]) => {
      const row = document.createElement("div"); row.className = "chart-bar-row";
      const name = document.createElement("span"); name.textContent = label;
      const track = document.createElement("div"); track.className = "chart-bar-track";
      const bar = document.createElement("span"); bar.className = "chart-bar " + kind; bar.style.width = Math.max(value ? 2 : 0, value / max * 100) + "%"; track.append(bar);
      const amount = document.createElement("strong"); amount.textContent = money(value);
      row.append(name, track, amount); return row;
    }));
  }
  periodSelect.addEventListener("change", updateSummary);

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

  const transactionList = document.getElementById("transactionList");
  function formatDate(dateText) {
    const date = new Date(dateText + "T12:00:00");
    return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" }).format(date);
  }
  function createTransactionRow(entry, removable) {
    const row = document.createElement("div"); row.className = "transaction-row";
    const icon = document.createElement("span"); icon.className = "transaction-icon " + (entry.type === "income" ? "income" : "food"); icon.textContent = entry.type === "income" ? "↙" : "↗";
    const info = document.createElement("div"); info.className = "transaction-info";
    const title = document.createElement("strong"); title.textContent = entry.description;
    const detail = document.createElement("small"); detail.textContent = (entry.category || (entry.type === "income" ? "Entrada" : "Saída")) + " · " + formatDate(entry.date);
    info.append(title, detail);
    const amount = document.createElement("strong"); amount.className = "amount " + (entry.type === "income" ? "positive" : "negative"); amount.textContent = (entry.type === "income" ? "+ " : "− ") + money(entry.amount);
    row.append(icon, info, amount);
    if (removable) {
      const remove = document.createElement("button"); remove.className = "remove-transaction"; remove.type = "button"; remove.dataset.transactionId = entry.id; remove.setAttribute("aria-label", "Excluir " + entry.description); remove.textContent = "Excluir"; row.append(remove);
    }
    return row;
  }
  function renderTransactions() {
    const entries = readTransactions().sort((a, b) => b.date.localeCompare(a.date));
    if (!entries.length) {
      const empty = document.createElement("p"); empty.className = "empty-transactions"; empty.textContent = "Você ainda não registrou movimentações.";
      transactionList.replaceChildren(empty); return;
    }
    transactionList.replaceChildren(...entries.slice(0, 4).map((entry) => createTransactionRow(entry, false)));
  }
  renderTransactions();
  updateSummary();

  document.getElementById("adicionarMovimentacao").addEventListener("click", () => {
    const form = document.createElement("form"); form.className = "dialog-form";
    form.innerHTML = '<label>O que foi?<input name="description" maxlength="60" placeholder="Ex.: mercado, salário" required></label><label>Tipo<select name="type"><option value="expense">Saída (gastei)</option><option value="income">Entrada (recebi)</option></select></label><label>Categoria<input name="category" maxlength="30" placeholder="Ex.: alimentação"></label><label>Valor (R$)<input name="amount" type="number" min="0.01" step="0.01" required></label><label>Data<input name="date" type="date" required></label><p class="dialog-status" aria-live="polite"></p><button type="submit">Salvar movimentação</button>';
    const currentDate = new Date();
    form.elements.date.value = [currentDate.getFullYear(), String(currentDate.getMonth() + 1).padStart(2, "0"), String(currentDate.getDate()).padStart(2, "0")].join("-");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const entry = { id: window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : String(Date.now()), description: String(data.get("description")).trim(), type: String(data.get("type")), category: String(data.get("category")).trim(), amount: Number(data.get("amount")), date: String(data.get("date")) };
      if (!entry.description || !entry.date || !Number.isFinite(entry.amount) || entry.amount <= 0) { form.querySelector(".dialog-status").textContent = "Preencha a descrição, a data e um valor maior que zero."; return; }
      try {
        const entries = readTransactions(); entries.push(entry); localStorage.setItem(transactionKey, JSON.stringify(entries));
        const monthKey = entry.date.slice(0, 7);
        if (![...periodSelect.options].some((option) => option.value === monthKey)) {
          const monthDate = new Date(monthKey + "-01T12:00:00"); const option = document.createElement("option");
          option.value = monthKey; option.textContent = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(monthDate); periodSelect.add(option);
        }
        periodSelect.value = monthKey; renderTransactions(); updateSummary(); dialog.close();
      } catch (_) { form.querySelector(".dialog-status").textContent = "Não foi possível salvar neste navegador."; }
    });
    openDialog("MEU DINHEIRO", "Adicionar movimentação", form);
  });

  document.getElementById("verMovimentacoes").addEventListener("click", () => {
    const list = document.createElement("div"); list.className = "all-transactions";
    const entries = readTransactions().sort((a, b) => b.date.localeCompare(a.date));
    if (entries.length) entries.forEach((entry) => list.append(createTransactionRow(entry, true)));
    else { const empty = document.createElement("p"); empty.className = "empty-transactions"; empty.textContent = "Você ainda não registrou movimentações."; list.append(empty); }
    const note = document.createElement("p"); note.className = "dialog-copy"; note.textContent = "Os registros são armazenados apenas neste navegador.";
    const content = document.createElement("div"); content.append(list, note);
    openDialog("SEUS REGISTROS", "Movimentações", content);
  });
  dialogContent.addEventListener("click", (event) => {
    const button = event.target.closest(".remove-transaction");
    if (!button) return;
    if (!window.confirm("Excluir esta movimentação?")) return;
    try {
      const remaining = readTransactions().filter((entry) => entry.id !== button.dataset.transactionId);
      localStorage.setItem(transactionKey, JSON.stringify(remaining));
      renderTransactions(); updateSummary(); dialog.close();
      document.getElementById("verMovimentacoes").click();
    } catch (_) { const status = document.createElement("p"); status.className = "dialog-status"; status.setAttribute("role", "status"); status.textContent = "Não foi possível excluir o registro neste navegador."; dialogContent.append(status); }
  });

  function renderGoal() {
    const goals = readGoal(); const goal = goals[0];
    const art = document.getElementById("goalArt");
    const amountRow = document.getElementById("goalAmountRow");
    const button = document.getElementById("editarMeta");
    if (!goal) {
      art.hidden = true; amountRow.hidden = true;
      document.getElementById("goalName").textContent = "Você ainda não criou uma meta.";
      document.getElementById("goalDesc").textContent = "Quando quiser, registre um objetivo e quanto pretende guardar.";
      button.innerHTML = 'Criar minha primeira meta <span>→</span>';
      return;
    }
    if (goals.length > 1) { document.getElementById("goalName").textContent = goals.length + " metas cadastradas"; document.getElementById("goalDesc").textContent = "Acompanhe o progresso de cada objetivo na página Minhas metas."; art.hidden = true; amountRow.hidden = true; button.innerHTML = 'Ver minhas metas <span>→</span>'; return; }
    const saved = Number(goal.saved) || 0; const target = Number(goal.target);
    const percent = Math.min(100, Math.round((saved / target) * 100));
    art.hidden = false; amountRow.hidden = false;
    document.getElementById("goalName").textContent = goal.name;
    document.getElementById("goalPercent").textContent = percent + "%"; document.getElementById("goalRing").setAttribute("aria-valuenow", String(percent));
    document.getElementById("goalAmount").textContent = money(saved) + " / " + money(target);
    document.getElementById("goalRing").style.background = `conic-gradient(#31c973 ${percent}%, #243029 ${percent}% 100%)`;
    document.getElementById("goalDesc").textContent = percent >= 100 ? "Você chegou ao valor que definiu." : "Faltam " + money(Math.max(0, target - saved)) + " para o valor que definiu.";
    button.innerHTML = 'Editar minha meta <span>→</span>';
  }
  renderGoal();
  updateSummary();
  document.getElementById("editarMeta").addEventListener("click", () => {
    const goals = readGoal(); const goal = goals[0];
    if (goals.length > 1) { location.href = "metas.html"; return; }
    const form = document.createElement("form"); form.className = "dialog-form";
    form.innerHTML = '<label>Nome da meta<input name="name" maxlength="45" required></label><label>Quanto já guardou (R$)<input name="saved" type="number" min="0" step="0.01" required></label><label>Quanto quer guardar (R$)<input name="target" type="number" min="0.01" step="0.01" required></label><p class="dialog-status" aria-live="polite"></p><button type="submit">Salvar meta</button>';
    if (goal) { form.elements.name.value = goal.name; form.elements.saved.value = goal.saved; form.elements.target.value = goal.target; }
    else { form.elements.saved.value = ""; }
    form.addEventListener("submit", (event) => {
      event.preventDefault(); const data = new FormData(form);
      const next = { id: goal?.id || ((crypto.randomUUID && crypto.randomUUID()) || String(Date.now())), name: String(data.get("name")).trim(), saved: Number(data.get("saved")), target: Number(data.get("target")) };
      if (!next.name || !Number.isFinite(next.saved) || !Number.isFinite(next.target) || next.target <= 0 || next.saved < 0) { form.querySelector(".dialog-status").textContent = "Confira os valores e tente novamente."; return; }
      try { localStorage.setItem(goalStorageKey, JSON.stringify(goal ? goals.map((item) => item.id === goal.id ? next : item) : [...goals, next])); }
      catch (_) { form.querySelector(".dialog-status").textContent = "Não foi possível salvar neste navegador."; return; }
      renderGoal(); updateSummary(); dialog.close();
    });
    openDialog("SUA META", goal ? "Editar meta" : "Criar meta", form);
  });

  document.getElementById("abrirAula").addEventListener("click", () => {
    const lesson = document.createElement("div");
    lesson.innerHTML = '<p class="dialog-copy">Investir é usar dinheiro para adquirir algo que pode gerar retorno no futuro. O resultado não é garantido: cada tipo tem regras, prazo e riscos próprios.</p><ul class="lesson-list"><li><strong>1. Primeiro, organize.</strong><br>Veja quanto entra, quanto sai e o que você consegue guardar.</li><li><strong>2. Conheça as opções.</strong><br>Entenda como funciona, quando pode resgatar e quais são os riscos.</li><li><strong>3. Decida sem pressa.</strong><br>Pesquise e tire dúvidas antes de aplicar. Não existe uma escolha igual para todo mundo.</li></ul><p class="dialog-copy">Este conteúdo é educativo e não recomenda um investimento específico.</p><a class="insight-button" href="educacao.html#trilha">Abrir a trilha completa →</a>';
    openDialog("AULA RÁPIDA", "Investir, em palavras simples", lesson);
  });
})();
