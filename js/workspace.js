(async function () {
  "use strict";

  const page = document.body.dataset.page;
  let user;
  let transactions;
  let goals;
  try {
    const session = await CashyAPI.auth.me();
    if (!session.authenticated) { location.replace("login.html"); return; }
    user = session.user;
    [transactions, goals] = await Promise.all([CashyAPI.transactions.list(), CashyAPI.goals.list()]);
  } catch (error) {
    const target = document.getElementById(page === "metas" ? "goalStatus" : "movementDescription");
    if (target) target.textContent = error.message;
    return;
  }

  const firstName = user.name.trim().split(/\s+/)[0] || "pessoa";
  document.getElementById("userName").textContent = firstName;
  document.getElementById("avatar").textContent = firstName.charAt(0).toUpperCase();
  document.getElementById("logout").addEventListener("click", async function () {
    this.disabled = true;
    try { await CashyAPI.auth.logout(); }
    finally { location.replace("login.html"); }
  });

  const sidebar = document.getElementById("sidebar");
  const menu = document.getElementById("menuToggle");
  menu.addEventListener("click", () => {
    const open = sidebar.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-label", "Abrir menu");
      menu.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 760 && sidebar.classList.contains("open") && !sidebar.contains(event.target) && !menu.contains(event.target)) {
      sidebar.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
    }
  });

  const money = (value) => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const period = document.getElementById("periodo");
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

  if (page === "movimentacoes") {
    const listNode = document.getElementById("transactionList");
    const query = document.getElementById("movementSearch");
    const typeFilter = document.getElementById("movementType");
    const now = new Date();
    for (let offset = 0; offset < 12; offset++) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const key = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
      const option = document.createElement("option");
      option.value = key;
      option.textContent = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
      period.append(option);
    }
    const formatDate = (value) => new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value + "T12:00:00"));

    function row(entry) {
      const el = document.createElement("div");
      el.className = "transaction-row";
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
      const actions = document.createElement("span");
      actions.className = "row-actions";
      [["Editar", "edit"], ["Excluir", "delete"]].forEach(([label, action]) => {
        const button = document.createElement("button");
        button.className = "remove-transaction";
        button.type = "button";
        button.dataset.id = String(entry.id);
        button.dataset.action = action;
        button.textContent = label;
        button.setAttribute("aria-label", label + " " + entry.description);
        actions.append(button);
      });
      el.append(icon, info, amount, actions);
      return el;
    }

    function render() {
      const all = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
      all.forEach((entry) => {
        const key = String(entry.date).slice(0, 7);
        if (key && ![...period.options].some((option) => option.value === key)) {
          const date = new Date(key + "-01T12:00:00");
          const option = document.createElement("option");
          option.value = key;
          option.textContent = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
          period.add(option);
        }
      });
      const selected = all.filter((entry) => String(entry.date).slice(0, 7) === period.value);
      const shown = selected.filter((entry) =>
        (typeFilter.value === "all" || entry.type === typeFilter.value) &&
        (entry.description + " " + (entry.category || "")).toLocaleLowerCase("pt-BR").includes(query.value.trim().toLocaleLowerCase("pt-BR"))
      );
      const incoming = selected.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + Number(entry.amount), 0);
      const outgoing = selected.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + Number(entry.amount), 0);
      const label = period.options[period.selectedIndex]?.textContent || "período escolhido";
      document.getElementById("resumoEntradas").textContent = money(incoming);
      document.getElementById("resumoSaidas").textContent = money(outgoing);
      document.getElementById("resumoSaldo").textContent = money(incoming - outgoing);
      document.getElementById("rotuloEntradas").textContent = label;
      document.getElementById("rotuloSaidas").textContent = label;
      document.getElementById("movementDescription").textContent = shown.length
        ? shown.length + (shown.length === 1 ? " registro exibido" : " registros exibidos") + " · totais do período completo."
        : "Nenhum registro encontrado com esses filtros.";
      listNode.replaceChildren(...(shown.length
        ? shown.map(row)
        : [Object.assign(document.createElement("p"), { className: "empty-transactions", textContent: selected.length ? "Tente ajustar a busca ou os filtros." : "Nenhum registro neste período." })]));
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
          form.querySelector(".dialog-status").textContent = "Confira a descrição, a data e o valor.";
          return;
        }
        const button = form.querySelector("button[type=submit]");
        button.disabled = true;
        try {
          const saved = existing ? await CashyAPI.transactions.update(item) : await CashyAPI.transactions.create(item);
          transactions = existing ? transactions.map((entry) => entry.id === saved.id ? saved : entry) : [...transactions, saved];
          period.value = saved.date.slice(0, 7);
          render();
          dialog.close();
        } catch (error) {
          form.querySelector(".dialog-status").textContent = error.message;
          button.disabled = false;
        }
      });
      openDialog("MEU DINHEIRO", existing ? "Editar movimentação" : "Adicionar movimentação", form);
    }

    period.addEventListener("change", render);
    query.addEventListener("input", render);
    typeFilter.addEventListener("change", render);
    render();
    document.getElementById("adicionarMovimentacao").addEventListener("click", () => openTransactionForm(null));
    listNode.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-id]");
      if (!button) return;
      const entry = transactions.find((item) => String(item.id) === button.dataset.id);
      if (button.dataset.action === "edit" && entry) { openTransactionForm(entry); return; }
      if (!entry || !window.confirm("Excluir esta movimentação?")) return;
      button.disabled = true;
      try {
        await CashyAPI.transactions.remove(entry.id);
        transactions = transactions.filter((item) => item.id !== entry.id);
        render();
      } catch (error) {
        button.disabled = false;
        document.getElementById("movementDescription").textContent = error.message;
      }
    });
    document.getElementById("exportMovements").addEventListener("click", () => {
      const rows = [["Data", "Descrição", "Tipo", "Categoria", "Valor (R$)"], ...[...transactions].sort((a, b) => a.date.localeCompare(b.date)).map((item) => [item.date, item.description, item.type === "income" ? "Entrada" : "Saída", item.category || "", Number(item.amount).toFixed(2)])];
      const csvCell = (cell) => {
        let value = String(cell ?? "");
        if (/^[\s\uFEFF]*[=+\-@]/u.test(value)) value = "'" + value;
        return '"' + value.replaceAll('"', '""') + '"';
      };
      const csv = "\uFEFF" + rows.map((rowData) => rowData.map(csvCell).join(";")).join("\r\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "cashy-movimentacoes.csv";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  if (page === "metas") {
    const list = document.getElementById("goalsList");
    function renderGoals() {
      if (!goals.length) {
        list.innerHTML = '<p class="empty-transactions">Você ainda não criou uma meta. Adicione uma para acompanhar seu objetivo.</p>';
        return;
      }
      list.replaceChildren(...goals.map((goal) => {
        const saved = Number(goal.saved) || 0;
        const target = Number(goal.target);
        const percent = Math.min(100, Math.round(saved / target * 100));
        const card = document.createElement("article");
        card.className = "goal-item";
        card.innerHTML = '<div class="goal-item-head"><div><h3></h3><p></p></div><span class="goal-item-percent"></span></div><div class="goal-item-track" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span></span></div><div class="goal-item-footer"><span></span><div><button type="button" class="remove-transaction" data-goal-action="edit">Editar</button> <button type="button" class="remove-transaction" data-goal-action="delete">Excluir</button></div></div>';
        card.querySelector("h3").textContent = goal.name;
        card.querySelector("p").textContent = percent >= 100 ? "Objetivo alcançado" : "Faltam " + money(Math.max(0, target - saved));
        card.querySelector(".goal-item-percent").textContent = percent + "%";
        card.querySelector("[role=progressbar]").setAttribute("aria-valuenow", String(percent));
        card.querySelector(".goal-item-track span").style.width = percent + "%";
        card.querySelector(".goal-item-footer>span").textContent = money(saved) + " / " + money(target);
        card.querySelectorAll("button").forEach((button) => {
          button.dataset.goalId = String(goal.id);
          button.setAttribute("aria-label", button.textContent + " meta " + goal.name);
        });
        return card;
      }));
    }

    function openGoalForm(existing) {
      const form = document.createElement("form");
      form.className = "dialog-form";
      form.innerHTML = '<label>Nome da meta<input name="name" maxlength="45" required></label><label>Quanto já guardou (R$)<input name="saved" type="number" min="0" step="0.01" value="0" required></label><label>Quanto quer guardar (R$)<input name="target" type="number" min="0.01" step="0.01" required></label><p class="dialog-status" aria-live="polite"></p><button type="submit">Salvar meta</button>';
      if (existing) {
        form.elements.name.value = existing.name;
        form.elements.saved.value = existing.saved;
        form.elements.target.value = existing.target;
      }
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const item = {
          id: existing ? existing.id : undefined,
          name: String(data.get("name")).trim(),
          saved: Number(data.get("saved")),
          target: Number(data.get("target"))
        };
        if (!item.name || !Number.isFinite(item.saved) || item.saved < 0 || !Number.isFinite(item.target) || item.target <= 0) {
          form.querySelector(".dialog-status").textContent = "Confira o nome e os valores da meta.";
          return;
        }
        const button = form.querySelector("button[type=submit]");
        button.disabled = true;
        try {
          const saved = existing ? await CashyAPI.goals.update(item) : await CashyAPI.goals.create(item);
          goals = existing ? goals.map((goal) => goal.id === saved.id ? saved : goal) : [...goals, saved];
          document.getElementById("goalStatus").textContent = "Meta salva na sua conta.";
          renderGoals();
          dialog.close();
        } catch (error) {
          form.querySelector(".dialog-status").textContent = error.message;
          button.disabled = false;
        }
      });
      openDialog("SUA META", existing ? "Editar meta" : "Criar meta", form);
    }

    renderGoals();
    document.getElementById("editarMeta").addEventListener("click", () => openGoalForm(null));
    list.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-goal-action]");
      if (!button) return;
      const goal = goals.find((item) => String(item.id) === button.dataset.goalId);
      if (!goal) return;
      if (button.dataset.goalAction === "edit") { openGoalForm(goal); return; }
      if (!window.confirm("Excluir a meta “" + goal.name + "”?")) return;
      button.disabled = true;
      try {
        await CashyAPI.goals.remove(goal.id);
        goals = goals.filter((item) => item.id !== goal.id);
        document.getElementById("goalStatus").textContent = "Meta excluída da sua conta.";
        renderGoals();
      } catch (error) {
        button.disabled = false;
        document.getElementById("goalStatus").textContent = error.message;
      }
    });
  }
})().catch((error) => {
  const status = document.getElementById("goalStatus") || document.getElementById("movementDescription");
  if (status) status.textContent = error.message || "Não foi possível carregar sua conta.";
});