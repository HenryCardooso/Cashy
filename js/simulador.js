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
    const totalContributions = initial + contribution * months;
    const estimatedBalance = window.CashyMath.futureValueWithMonthlyContributions(initial, contribution, annualRate, months);
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

  const portfolioForm = document.getElementById("portfolioForm");
  if (portfolioForm) {
    const portfolioResult = document.getElementById("portfolioResult");
    portfolioForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!portfolioForm.reportValidity()) return;
      const fields = Object.fromEntries(new FormData(portfolioForm).entries());
      const months = Number(fields.months);
      const classes = [
        ["Renda fixa · exercício", Number(fields.fixedAmount), Number(fields.fixedRate)],
        ["Fundos · exercício", Number(fields.fundAmount), Number(fields.fundRate)],
        ["Ações · exercício", Number(fields.equityAmount), Number(fields.equityRate)],
      ];
      if (!Number.isFinite(months) || months < 1 || months > 600 || classes.some(([, amount, rate]) => !Number.isFinite(amount) || amount < 0 || !Number.isFinite(rate) || rate < -100)) {
        portfolioResult.textContent = "Confira os valores. A taxa hipotética precisa ser igual ou superior a -100% ao ano.";
        return;
      }
      const invested = classes.reduce((total, [, amount]) => total + amount, 0);
      if (invested <= 0) { portfolioResult.textContent = "Informe algum valor para montar o exercício."; return; }
      const result = classes.map(([name, amount, annualRate]) => {
        return { name, amount, annualRate, projected: window.CashyMath.futureValueAnnual(amount, annualRate / 100, months), allocation: amount / invested * 100 };
      });
      const totalProjected = result.reduce((total, row) => total + row.projected, 0);
      const summary = document.createElement("p"); summary.className = "portfolio-total";
      summary.textContent = "Total informado: " + money(invested) + " · saldo hipotético bruto: " + money(totalProjected) + " · diferença matemática: " + money(totalProjected - invested);
      const table = document.createElement("table"); table.className = "portfolio-table";
      const caption = document.createElement("caption"); caption.textContent = "Distribuição e projeção por classe para " + months + " meses.";
      const head = document.createElement("thead"); const headRow = document.createElement("tr");
      ["Classe", "Alocação inicial", "Taxa hipotética", "Saldo bruto hipotético"].forEach((text) => { const cell = document.createElement("th"); cell.scope = "col"; cell.textContent = text; headRow.append(cell); });
      head.append(headRow); const body = document.createElement("tbody");
      result.forEach((row) => {
        const tr = document.createElement("tr");
        [row.name, money(row.amount) + " · " + numberFormat(row.allocation) + "%", numberFormat(row.annualRate) + "% a.a.", money(row.projected)].forEach((text, index) => { const cell = document.createElement(index === 0 ? "th" : "td"); if (index === 0) cell.scope = "row"; cell.textContent = text; tr.append(cell); });
        body.append(tr);
      });
      table.append(caption, head, body);
      const note = document.createElement("p"); note.className = "portfolio-method"; note.textContent = "Cálculo composto com taxa anual constante e conversão para taxa mensal equivalente. Não é previsão, oferta ou recomendação.";
      portfolioResult.replaceChildren(summary, table, note);
    });
  }

  function numberFormat(value) { return Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }


})();
