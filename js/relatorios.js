(async () => {
  "use strict";
  const monthInput = document.getElementById("reportMonth"), status = document.getElementById("reportStatus");
  const view = document.getElementById("reportView"), signIn = document.getElementById("reportSignIn");
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  let transactions = [], goals = [];
  const comparison = document.createElement("section");
  comparison.className = "report-comparison";
  comparison.setAttribute("aria-live", "polite");
  comparison.setAttribute("aria-label", "Comparação com o mês anterior");
  document.getElementById("reportSummary").after(comparison);
  const now = new Date(); monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const menuToggle = document.getElementById("menuToggle"), sidebar = document.getElementById("sidebar");
  menuToggle.addEventListener("click", () => { const open = !sidebar.classList.contains("open"); sidebar.classList.toggle("open", open); menuToggle.setAttribute("aria-expanded", String(open)); menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu"); });

  try {
    const session = await CashyAPI.auth.me();
    if (!session.authenticated) { status.hidden = true; signIn.hidden = false; return; }
    document.getElementById("reportUser").textContent = session.user.name;
    document.getElementById("reportAvatar").textContent = session.user.name.trim().charAt(0).toUpperCase() || "C";
    [transactions, goals] = await Promise.all([CashyAPI.transactions.list(), CashyAPI.goals.list()]);
    render(); view.hidden = false; status.hidden = true;
  } catch (error) { status.textContent = error.message || "Não foi possível carregar os relatórios. Tente novamente."; status.dataset.state = "error"; return; }

  function monthLabel(key) { const [year, month] = key.split("-").map(Number); return new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(year, month - 1, 1)).replace(".", ""); }
  function totals(key) {
    const entries = transactions.filter((item) => String(item.date || "").slice(0, 7) === key);
    return { entries, income: entries.filter((item) => item.type === "income").reduce((sum, item) => sum + Number(item.amount || 0), 0), expenses: entries.filter((item) => item.type === "expense").reduce((sum, item) => sum + Number(item.amount || 0), 0) };
  }
  function renderSummary(data) {
    const categories = [
      ["Receitas", money.format(data.income), "Entradas que você registrou"],
      ["Despesas", money.format(data.expenses), "Saídas que você registrou"],
      ["Saldo do mês", money.format(data.income - data.expenses), "Receitas menos despesas registradas"],
      ["Comprometimento", data.income > 0 ? new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(data.expenses / data.income * 100) + "%" : "—", data.income > 0 ? "Despesas registradas em relação às receitas" : "Sem receitas registradas para calcular a proporção"]
    ];
    document.getElementById("reportSummary").replaceChildren(...categories.map(([title, value, help]) => { const card = document.createElement("article"); card.className = "report-metric"; const label = document.createElement("span"); label.textContent = title; const strong = document.createElement("strong"); strong.textContent = value; const small = document.createElement("small"); small.textContent = help; card.append(label, strong, small); return card; }));
  }
  function renderComparison(key) {
    const [year, month] = key.split("-").map(Number);
    const previousDate = new Date(year, month - 2, 1);
    const previousKey = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, "0")}`;
    const current = totals(key), previous = totals(previousKey);
    const metrics = [
      ["Despesas", current.expenses, previous.expenses, "Você gastou"],
      ["Receitas", current.income, previous.income, "Suas receitas"],
      ["Saldo", current.income - current.expenses, previous.income - previous.expenses, "Seu saldo"]
    ];
    const heading = document.createElement("h2"); heading.textContent = `Comparação com ${monthLabel(previousKey)}`;
    const list = document.createElement("div"); list.className = "report-comparison-grid";
    metrics.forEach(([label, value, prior, prefix]) => {
      const item = document.createElement("article"); item.className = "report-comparison-item";
      const name = document.createElement("span"); name.textContent = label;
      const detail = document.createElement("strong");
      const note = document.createElement("small");
      if (prior === 0) {
        detail.textContent = value === 0 ? "Sem variação" : "Sem base anterior";
        note.textContent = value === 0 ? "Sem registros nos dois meses." : `Mês anterior: ${money.format(prior)}.`;
      } else {
        const change = ((value - prior) / Math.abs(prior)) * 100;
        const amount = `${Math.abs(change).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
        detail.textContent = change > 0 ? `${amount} a mais` : change < 0 ? `${amount} a menos` : "Sem variação";
        item.dataset.direction = change > 0 ? "up" : change < 0 ? "down" : "same";
        note.textContent = `${prefix} ${money.format(value)}; mês anterior: ${money.format(prior)}.`;
      }
      item.append(name, detail, note); list.append(item);
    });
    comparison.replaceChildren(heading, list);
  }
  function renderTrend(key) {
    const [year, month] = key.split("-").map(Number); const first = new Date(year, month - 1 - 5, 1);
    const keys = Array.from({ length: 6 }, (_, i) => { const d = new Date(first.getFullYear(), first.getMonth() + i, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; });
    const history = keys.map((item) => ({ key: item, ...totals(item) })); const max = Math.max(1, ...history.flatMap((item) => [item.income, item.expenses]));
    const trend = document.getElementById("reportTrend");
    trend.replaceChildren(...history.map((item) => { const column = document.createElement("div"); column.className = "trend-month"; column.setAttribute("role", "listitem"); column.setAttribute("aria-label", `${monthLabel(item.key)}: receitas ${money.format(item.income)}, despesas ${money.format(item.expenses)}`); const bars = document.createElement("div"); bars.className = "trend-bars"; [[item.income, "trend-income"], [item.expenses, "trend-expense"]].forEach(([value, cls]) => { const bar = document.createElement("span"); bar.className = cls; bar.style.height = Math.max(value > 0 ? 3 : 0, value / max * 100) + "%"; bar.title = money.format(value); bars.append(bar); }); const label = document.createElement("small"); label.textContent = monthLabel(item.key); column.append(bars, label); return column; }));
  }
  function renderCategories(data) {
    const sums = new Map(); data.entries.filter((item) => item.type === "expense").forEach((item) => { const label = String(item.category || "Sem categoria").trim() || "Sem categoria"; sums.set(label, (sums.get(label) || 0) + Number(item.amount || 0)); });
    const rows = [...sums].sort((a, b) => b[1] - a[1]); const container = document.getElementById("reportCategories");
    if (!rows.length) { container.textContent = "Nenhuma despesa registrada neste mês."; }
    else { container.replaceChildren(...rows.slice(0, 8).map(([label, amount]) => { const row = document.createElement("div"); row.className = "report-category-row"; const head = document.createElement("div"); head.className = "report-category-head"; const name = document.createElement("strong"); name.textContent = label; const total = document.createElement("span"); total.textContent = money.format(amount); head.append(name, total); const track = document.createElement("div"); track.className = "report-category-track"; const fill = document.createElement("span"); fill.style.width = data.expenses > 0 ? Math.min(100, amount / data.expenses * 100) + "%" : "0%"; track.append(fill); row.append(head, track); return row; })); }
    document.getElementById("reportCommitment").textContent = data.income > 0 ? "Despesas registradas equivalem a " + new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(data.expenses / data.income * 100) + "% das receitas registradas neste mês. A proporção descreve os lançamentos; não inclui valores que você deixou de registrar." : "Registre entradas para comparar despesas e receitas deste mês.";
  }
  function renderGoals() {
    const container = document.getElementById("reportGoals");
    if (!goals.length) { container.textContent = "Você ainda não cadastrou metas."; return; }
    container.replaceChildren(...goals.map((goal) => { const row = document.createElement("div"); row.className = "report-goal-row"; const head = document.createElement("div"); head.className = "report-category-head"; const name = document.createElement("strong"); name.textContent = goal.name; const amount = document.createElement("span"); amount.textContent = money.format(Number(goal.saved)) + " / " + money.format(Number(goal.target)); head.append(name, amount); const track = document.createElement("div"); track.className = "report-category-track"; track.setAttribute("role", "progressbar"); track.setAttribute("aria-label", "Progresso de " + goal.name); track.setAttribute("aria-valuemin", "0"); track.setAttribute("aria-valuemax", "100"); const pct = Number(goal.target) > 0 ? Math.min(100, Number(goal.saved) / Number(goal.target) * 100) : 0; track.setAttribute("aria-valuenow", String(Math.round(pct))); const fill = document.createElement("span"); fill.style.width = pct + "%"; track.append(fill); row.append(head, track); return row; }));
  }
  function render() { const key = monthInput.value; if (!/^\d{4}-\d{2}$/.test(key)) return; const data = totals(key); renderSummary(data); renderComparison(key); renderTrend(key); renderCategories(data); renderGoals(); }
  monthInput.addEventListener("change", render);
  document.getElementById("exportReport").addEventListener("click", () => {
    const key = monthInput.value, data = totals(key), rows = [["Indicador", "Valor"], ["Mês", key], ["Receitas", data.income.toFixed(2)], ["Despesas", data.expenses.toFixed(2)], ["Saldo registrado", (data.income - data.expenses).toFixed(2)], ["Categoria", "Valor (R$)"], ...[...new Map(data.entries.filter((item) => item.type === "expense").map((item) => [String(item.category || "Sem categoria"), 0])).keys()].map((name) => [name, data.entries.filter((item) => item.type === "expense" && String(item.category || "Sem categoria") === name).reduce((sum, item) => sum + Number(item.amount || 0), 0).toFixed(2)])];
    const csv = "\uFEFF" + rows.map((row) => row.map((value) => '"' + String(value).replaceAll('"', '""') + '"').join(";")).join("\r\n"); const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `cashy-relatorio-${key}.csv`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();
