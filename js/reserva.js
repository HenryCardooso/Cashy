(() => {
  "use strict";
  const storageKey = "cashy-reserva-emergencia-v1";
  const form = document.getElementById("reserveForm");
  if (!form) return;
  const expenses = document.getElementById("reserveExpenses");
  const months = document.getElementById("reserveMonths");
  const saved = document.getElementById("reserveSaved");
  const contribution = document.getElementById("reserveContribution");
  const status = document.getElementById("reserveStatus");
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  try {
    const previous = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (previous && Number.isFinite(Number(previous.expenses)) && Number.isFinite(Number(previous.saved)) && Number.isFinite(Number(previous.contribution))) {
      expenses.value = previous.expenses; months.value = ["3", "6", "9", "12"].includes(String(previous.months)) ? String(previous.months) : "6"; saved.value = previous.saved; contribution.value = previous.contribution;
    }
  } catch (_) { /* O cálculo continua disponível sem armazenamento local. */ }

  function render() {
    const monthlyExpenses = Number(expenses.value), coveredMonths = Number(months.value), amountSaved = Number(saved.value), monthlyContribution = Number(contribution.value);
    const validNumbers = [monthlyExpenses, amountSaved, monthlyContribution].every((value) => Number.isFinite(value) && value >= 0 && value <= 100000000) && [monthlyExpenses, amountSaved, monthlyContribution].every((value) => String(value).trim() !== "");
    const valid = validNumbers && monthlyExpenses > 0;
    const target = monthlyExpenses * coveredMonths, remaining = Math.max(0, target - amountSaved), percent = target > 0 ? Math.min(100, amountSaved / target * 100) : 0;
    document.getElementById("reserveTarget").textContent = money.format(target);
    document.getElementById("reserveFormula").textContent = money.format(monthlyExpenses) + " de despesas × " + coveredMonths + " meses";
    document.getElementById("reserveRemaining").textContent = money.format(remaining);
    document.getElementById("reservePercent").textContent = Math.round(percent) + "%";
    document.getElementById("reserveProgress").setAttribute("aria-valuenow", String(Math.round(percent)));
    document.getElementById("reserveProgressFill").style.width = percent + "%";
    const time = document.getElementById("reserveTime");
    if (!validNumbers) { time.textContent = "Confira os valores informados."; status.textContent = "Use valores entre zero e R$ 100.000.000."; status.dataset.state = "error"; }
    else if (monthlyExpenses <= 0) { time.textContent = "Informe despesas essenciais acima de zero para calcular um objetivo."; status.textContent = ""; status.dataset.state = ""; }
    else if (remaining === 0 && target > 0) { time.textContent = "O valor informado já alcança o objetivo estimado."; status.textContent = ""; status.dataset.state = ""; }
    else if (monthlyContribution > 0) { const totalMonths = Math.ceil(remaining / monthlyContribution); time.textContent = "Estimativa: " + totalMonths + (totalMonths === 1 ? " mês" : " meses") + " mantendo o aporte informado, sem considerar rendimentos ou mudanças nas despesas."; status.textContent = ""; status.dataset.state = ""; }
    else { time.textContent = remaining > 0 ? "Informe um aporte mensal para estimar o prazo." : "Informe despesas essenciais para calcular um objetivo."; status.textContent = ""; status.dataset.state = ""; }
    return { valid, expenses: monthlyExpenses, months: coveredMonths, saved: amountSaved, contribution: monthlyContribution };
  }

  form.addEventListener("input", render);
  form.addEventListener("change", render);
  form.addEventListener("submit", (event) => {
    event.preventDefault(); const state = render(); if (!state.valid) { if (state.expenses <= 0) { status.textContent = "Informe despesas essenciais acima de zero para calcular seu objetivo."; status.dataset.state = "error"; } status.focus(); return; }
    try { localStorage.setItem(storageKey, JSON.stringify(state)); status.textContent = "Planejamento salvo neste navegador."; status.dataset.state = "success"; }
    catch (_) { status.textContent = "Não foi possível salvar neste navegador, mas o cálculo continua disponível enquanto esta página estiver aberta."; status.dataset.state = "error"; }
  });
  render();
})();
