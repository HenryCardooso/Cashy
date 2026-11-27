(() => {
  "use strict";

  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const percent = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

  function valuesFrom(form) {
    return Object.fromEntries([...form.querySelectorAll("input[name]")].map((input) => [input.name, input.value]));
  }

  function number(values, key) {
    const raw = values[key];
    if (raw === "" || raw == null) return 0;
    return Number(raw);
  }

  function show(result, heading, detail, state = "success") {
    result.dataset.state = state;
    const title = document.createElement("strong");
    title.textContent = heading;
    const description = document.createElement("span");
    description.textContent = detail;
    result.replaceChildren(title, description);
  }

  function runProfit(values, result) {
    const revenue = number(values, "revenue");
    const variable = number(values, "variableCosts");
    const fixed = number(values, "fixedCosts");
    const profit = revenue - variable - fixed;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    show(result, `${profit < 0 ? "Prejuízo operacional estimado" : "Lucro operacional estimado"}: ${money.format(profit)}`,
      `Faturamento: ${money.format(revenue)} · custos totais: ${money.format(variable + fixed)} · margem estimada: ${percent.format(margin)}%.`);
  }

  function runCashflow(values, result) {
    const opening = number(values, "opening");
    const inflows = number(values, "inflows");
    const outflows = number(values, "outflows");
    const net = inflows - outflows;
    const closing = opening + net;
    show(result, `Saldo final estimado: ${money.format(closing)}`,
      `Fluxo líquido: ${money.format(net)} · saldo inicial: ${money.format(opening)}.${closing < 0 ? " O resultado indica necessidade de caixa adicional no período." : ""}`,
      closing < 0 ? "error" : "success");
  }

  function runBreakeven(values, result) {
    const fixed = number(values, "fixedCosts");
    const ticket = number(values, "ticket");
    const variable = number(values, "variableCost");
    const contribution = ticket - variable;
    if (ticket <= 0 || contribution <= 0) {
      show(result, "Não foi possível calcular", "O preço médio precisa ser maior que zero e superar o custo variável por venda.", "error");
      return;
    }
    const units = fixed === 0 ? 0 : Math.ceil(fixed / contribution);
    const revenue = units * ticket;
    show(result, `${units} ${units === 1 ? "venda" : "vendas"} para cobrir os custos fixos`,
      `Faturamento aproximado no ponto de equilíbrio: ${money.format(revenue)}. Margem de contribuição por venda: ${money.format(contribution)}.`);
  }

  function runRoi(values, result) {
    const investment = number(values, "investment");
    const gain = number(values, "gain");
    if (investment <= 0) {
      show(result, "Informe um investimento maior que zero", "O ROI precisa de uma base de investimento para calcular a porcentagem.", "error");
      return;
    }
    const roi = (gain / investment) * 100;
    show(result, `ROI estimado: ${percent.format(roi)}%`,
      `Ganho líquido: ${money.format(gain)} para ${money.format(investment)} investidos. Resultado abaixo de zero representa perda no período analisado.`, roi < 0 ? "error" : "success");
  }

  function runCac(values, result) {
    const spend = number(values, "acquisitionSpend");
    const customers = number(values, "newCustomers");
    if (customers <= 0 || !Number.isInteger(customers)) {
      show(result, "Informe uma quantidade válida de clientes", "Use um número inteiro maior que zero para o período analisado.", "error");
      return;
    }
    show(result, `CAC estimado: ${money.format(spend / customers)} por cliente`,
      `${money.format(spend)} em aquisição ÷ ${customers} ${customers === 1 ? "novo cliente" : "novos clientes"}.`);
  }

  function runLtv(values, result) {
    const ticket = number(values, "ticket");
    const frequency = number(values, "frequency");
    const retention = number(values, "retention");
    const margin = number(values, "margin");
    const cac = number(values, "cac");
    if (margin > 100) {
      show(result, "Confira a margem bruta", "Informe uma margem entre 0% e 100%.", "error");
      return;
    }
    const lifetimeRevenue = ticket * frequency * retention;
    const ltv = lifetimeRevenue * margin / 100;
    const detail = cac > 0
      ? `Receita estimada no relacionamento: ${money.format(lifetimeRevenue)} · LTV pela margem bruta: ${money.format(ltv)} · relação LTV/CAC: ${percent.format(ltv / cac)}×.`
      : `Receita estimada no relacionamento: ${money.format(lifetimeRevenue)} · margem bruta aplicada: ${percent.format(margin)}%.`;
    show(result, `LTV estimado pela margem bruta: ${money.format(ltv)}`, detail);
  }

  const calculations = { profit: runProfit, cashflow: runCashflow, breakeven: runBreakeven, roi: runRoi, cac: runCac, ltv: runLtv };
  document.querySelectorAll(".company-form").forEach((form) => {
    const runCalculation = calculations[form.dataset.calculation];
    const result = document.querySelector(`[data-result="${form.dataset.calculation}"]`);
    if (!runCalculation || !result) return;
    const calculate = () => {
      const invalidInput = [...form.querySelectorAll("input")].find((input) => !input.checkValidity());
      if (invalidInput) {
        invalidInput.reportValidity();
        return;
      }
      const values = valuesFrom(form);
      if (Object.values(values).some((value) => value !== "" && !Number.isFinite(Number(value)))) {
        show(result, "Confira os valores", "Use somente números válidos nos campos.", "error");
        return;
      }
      runCalculation(values, result);
    };
    form.querySelector("button")?.addEventListener("click", calculate);
    form.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && event.target.matches("input")) {
        event.preventDefault();
        calculate();
      }
    });
  });
})();
