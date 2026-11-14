(function(){
 "use strict";
 const money=(value)=>Number(value).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  const resultValues = {};
  function calculateScenario(form, output) {
    const values = new FormData(form);
    const initial = Number(values.get("initial")); const contribution = Number(values.get("monthly"));
    const termInput = Number(values.get("term")); const years = values.get("unit") === "years";
    const months = years ? termInput * 12 : termInput; const annualRate = Number(values.get("rate")) / 100;
    if (![initial, contribution, termInput, annualRate].every(Number.isFinite) || initial < 0 || contribution < 0 || termInput < 1 || annualRate < 0) return;
    if (months > 600) { output.textContent = "Para esta simulação, use um prazo de até 50 anos."; return; }
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
    const totalContributions = initial + contribution * months;
    const estimatedBalance = monthlyRate === 0 ? totalContributions : initial * Math.pow(1 + monthlyRate, months) + contribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    if (!Number.isFinite(estimatedBalance) || !Number.isFinite(totalContributions)) { output.textContent = "Os valores ultrapassam o limite desta simulação. Reduza o valor, a taxa ou o prazo."; return; }
    const label = String(values.get("label") || "Sem rótulo");
    const result = { label, initial, contribution, months, annualRate, contributions: totalContributions, balance: estimatedBalance, difference: estimatedBalance - totalContributions };
    resultValues[form.dataset.scenario] = result;
    output.textContent = [
      "Saldo hipotético ao final: " + money(result.balance),
      "Total informado (valor inicial + aportes): " + money(result.contributions),
      "Diferença matemática entre saldo e total informado: " + money(result.difference),
      "Cálculo para " + months + " meses, com taxa anual hipotética de " + (annualRate * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + "%. Não é previsão nem garantia."
    ].join("\n");
    renderComparison();
  }
  function renderComparison() {
    const entries = Object.entries(resultValues);
    const panel = document.getElementById("comparisonPanel");
    panel.hidden = entries.length < 2;
    if (entries.length < 2) return;
    const content = document.getElementById("comparisonContent"); content.replaceChildren();
    entries.forEach(([key, item]) => {
      const row = document.createElement("div"); row.className = "comparison-row";
      const label = document.createElement("span"); label.textContent = "Cenário " + key + " · " + item.label;
      const value = document.createElement("strong"); value.textContent = money(item.balance);
      row.append(label, value); content.append(row);
    });
    const note = document.createElement("p"); note.className = "simulator-note"; note.textContent = "A comparação usa somente os valores e taxas hipotéticas informados. O nome do cenário não altera a conta."; content.append(note);
  }
  ["A", "B"].forEach((key) => {
    const form = document.getElementById("scenario" + key);
    const termField = form.elements.term, unitField = form.elements.unit;
    unitField.addEventListener("change", () => { termField.max = unitField.value === "years" ? "50" : "600"; });
    form.addEventListener("submit", (event) => { event.preventDefault(); calculateScenario(form, document.getElementById("result" + key)); });
    form.addEventListener("input", () => { delete resultValues[key]; document.getElementById("result" + key).textContent = ""; renderComparison(); });
    form.addEventListener("change", () => { delete resultValues[key]; document.getElementById("result" + key).textContent = ""; renderComparison(); });
  });


})();
