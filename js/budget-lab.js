(function () {
  "use strict";

  const form = document.getElementById("budgetForm");
  if (!form) return;

  const storageKey = "cashy-orcamento-mensal-v1";
  const incomeInput = document.getElementById("budgetIncome");
  const nameInput = document.getElementById("budgetName");
  const amountInputs = [...form.querySelectorAll("[data-category]")];
  const labels = { essential: "Despesas essenciais", flexible: "Despesas flexíveis", debt: "Dívidas e parcelas", goals: "Reserva e objetivos" };
  const colors = { essential: "#68c792", flexible: "#8e85ed", debt: "#e8ae5c", goals: "#65a9df" };
  const status = document.getElementById("budgetStatus");
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  let history = readHistory();

  function readHistory() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (!Array.isArray(value)) return [];
      return value.filter((item) => item && typeof item.id === "string" && typeof item.createdAt === "string" && Number.isFinite(Number(item.income)) && Number.isFinite(Number(item.total)) && Number.isFinite(Number(item.balance)) && item.values && typeof item.values === "object")
        .map((item) => ({
          ...item,
          income: Number(item.income), total: Number(item.total), balance: Number(item.balance),
          name: typeof item.name === "string" ? item.name.slice(0, 40) : "",
          values: Object.fromEntries(Object.entries(item.values).filter(([key, amount]) => Object.hasOwn(labels, key) && Number.isFinite(Number(amount)) && Number(amount) >= 0).map(([key, amount]) => [key, Number(amount)]))
        }))
        .filter((item) => item.income >= 0 && item.income <= 100000000 && item.total >= 0 && item.balance === item.income - item.total).slice(0, 10);
    } catch (_) { return []; }
  }

  function currentValues() {
    const income = Number(incomeInput.value);
    const values = Object.fromEntries(amountInputs.map((input) => [input.dataset.category, Number(input.value)]));
    const total = Object.values(values).reduce((sum, value) => sum + value, 0);
    return { income, values, total, balance: income - total };
  }

  function setError(message) {
    status.textContent = message;
    status.dataset.state = "error";
    form.setAttribute("aria-invalid", "true");
  }

  function setValid() {
    status.textContent = "";
    status.dataset.state = "";
    form.removeAttribute("aria-invalid");
  }

  function render() {
    const state = currentValues();
    const validIncome = Number.isFinite(state.income) && state.income >= 0 && state.income <= 100000000;
    const validAmounts = Object.values(state.values).every((value) => Number.isFinite(value) && value >= 0 && value <= 100000000);
    if (!validIncome) setError("Informe uma renda mensal válida, entre zero e R$ 100.000.000.");
    else if (!validAmounts || !Number.isFinite(state.total)) setError("Confira os valores: cada categoria deve ter um valor válido e maior ou igual a zero.");
    else setValid();

    const balanceNode = document.getElementById("budgetBalance");
    balanceNode.textContent = currency.format(state.balance);
    balanceNode.dataset.state = state.balance < 0 ? "deficit" : "balanced";
    document.getElementById("budgetSummary").textContent = "Renda: " + currency.format(state.income) + " · Planejado: " + currency.format(state.total);

    const bars = document.getElementById("budgetBars");
    const nonzero = Object.entries(state.values).filter(([, value]) => value > 0);
    bars.replaceChildren(...nonzero.map(([key, value]) => {
      const share = state.income > 0 ? value / state.income * 100 : 0;
      const row = document.createElement("div"); row.className = "budget-bar-row";
      const head = document.createElement("div"); head.className = "budget-bar-head";
      const label = document.createElement("strong"); label.textContent = labels[key];
      const amount = document.createElement("span"); amount.textContent = currency.format(value) + (state.income > 0 ? " · " + share.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "% da renda" : "");
      const track = document.createElement("div"); track.className = "budget-bar-track"; track.setAttribute("role", "progressbar"); track.setAttribute("aria-label", labels[key] + " como parcela da renda mensal"); track.setAttribute("aria-valuemin", "0"); track.setAttribute("aria-valuemax", "100"); track.setAttribute("aria-valuenow", String(Math.min(100, Math.max(0, share))));
      const fill = document.createElement("span"); fill.style.width = Math.min(100, Math.max(0, share)) + "%"; fill.style.backgroundColor = colors[key];
      track.append(fill); head.append(label, amount); row.append(head, track); return row;
    }));

    const reflection = document.getElementById("budgetReflection");
    if (!state.income && !state.total) reflection.textContent = "Informe uma renda e alguns valores do mês para visualizar como seu plano se distribui.";
    else if (!state.income && state.total > 0) reflection.textContent = "Há compromissos planejados sem renda mensal informada. Se este cenário representa uma mudança de renda, considere quais informações ainda faltam para reorganizar o mês.";
    else if (state.balance < 0) reflection.textContent = "O plano prevê " + currency.format(Math.abs(state.balance)) + " a mais do que a renda informada. Revise estimativas, datas e compromissos; isso é um sinal para analisar o orçamento, não um julgamento sobre suas escolhas.";
    else if (state.balance > 0) reflection.textContent = "Restam " + currency.format(state.balance) + " sem destino definido. Você pode comparar esse valor com despesas que variam, compromissos futuros e objetivos que escolheu para si.";
    else reflection.textContent = "Os valores planejados equivalem à renda informada. Confira se o plano contempla despesas que variam ou aparecem em outros períodos.";
    return { ...state, valid: validIncome && validAmounts && Number.isFinite(state.total) };
  }

  function saveHistory() {
    try { localStorage.setItem(storageKey, JSON.stringify(history)); return true; }
    catch (_) { return false; }
  }

  function renderHistory() {
    const container = document.getElementById("budgetHistory");
    document.getElementById("clearBudgetHistory").hidden = history.length === 0;
    if (!history.length) {
      const empty = document.createElement("p"); empty.textContent = "Nenhum plano salvo ainda.";
      container.replaceChildren(empty); return;
    }
    container.replaceChildren(...history.map((record, index) => {
      const card = document.createElement("article"); card.className = "budget-history-item";
      const heading = document.createElement("div"); heading.className = "budget-history-title";
      const title = document.createElement("strong"); title.textContent = record.name || "Plano " + (history.length - index);
      const date = document.createElement("time"); date.dateTime = record.createdAt;
      const parsed = new Date(record.createdAt); date.textContent = Number.isNaN(parsed.getTime()) ? "Data indisponível" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
      const summary = document.createElement("span"); summary.textContent = "Renda " + currency.format(record.income) + " · Planejado " + currency.format(record.total) + " · Saldo " + currency.format(record.balance);
      const details = document.createElement("p");
      details.textContent = Object.entries(record.values).filter(([, amount]) => amount > 0).map(([key, amount]) => labels[key] + ": " + currency.format(amount)).join(" · ") || "Sem valores distribuídos entre categorias";
      const remove = document.createElement("button"); remove.type = "button"; remove.className = "budget-remove"; remove.textContent = "Remover"; remove.setAttribute("aria-label", "Remover " + title.textContent); remove.dataset.removeBudget = record.id;
      heading.append(title, date); card.append(heading, summary, details, remove); return card;
    }));
  }

  form.addEventListener("input", render);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const state = render();
    if (!state.valid) { status.focus(); return; }
    if (state.income <= 0 && state.total <= 0) { setError("Informe uma renda mensal ou valores para analisar um cenário."); status.focus(); return; }
    const planName = nameInput.value.trim().slice(0, 40);
    history.unshift({ id: window.crypto?.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2), createdAt: new Date().toISOString(), name: planName, income: state.income, total: state.total, balance: state.balance, values: state.values });
    history = history.slice(0, 10);
    if (!saveHistory()) { history.shift(); setError("O navegador não conseguiu guardar este plano. Verifique o espaço disponível ou as permissões de armazenamento."); status.focus(); return; }
    renderHistory();
    status.textContent = state.balance < 0 ? "Plano salvo. Ele mostra um valor planejado acima da renda; use a comparação para revisar o cenário." : "Plano salvo neste navegador. Você pode comparar este resumo depois.";
    status.dataset.state = state.balance < 0 ? "warning" : "success";
  });

  document.getElementById("budgetHistory").addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-budget]");
    if (!button) return;
    const previous = history;
    history = history.filter((item) => item.id !== button.dataset.removeBudget);
    if (!saveHistory()) { history = previous; status.textContent = "Não foi possível atualizar o histórico neste navegador."; status.dataset.state = "error"; }
    renderHistory();
  });
  document.getElementById("clearBudgetHistory").addEventListener("click", () => {
    const previous = history;
    history = [];
    try { localStorage.removeItem(storageKey); }
    catch (_) { history = previous; status.textContent = "Não foi possível limpar o histórico neste navegador."; status.dataset.state = "error"; renderHistory(); return; }
    renderHistory();
    status.textContent = "Histórico removido deste navegador.";
    status.dataset.state = "success";
  });

  render();
  renderHistory();
})();
