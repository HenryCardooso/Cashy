(() => {
  "use strict";
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
  const attach = (formId, resultId, callback) => {
    const form = document.getElementById(formId), result = document.getElementById(resultId);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (form.dataset.busy === "true") return;
      if (!form.reportValidity()) return;
      const data = Object.fromEntries(new FormData(form).entries());
      const values = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, Number(value)]));
      if (Object.values(values).some((value) => !Number.isFinite(value) || value < 0)) { result.textContent = "Confira os valores informados e tente novamente."; return; }
      const button = form.querySelector('[type="submit"]');
      form.dataset.busy = "true";
      result.setAttribute("aria-busy", "true");
      button.disabled = true;
      button.dataset.loading = "true";
      requestAnimationFrame(() => {
        result.replaceChildren(callback(values));
        result.removeAttribute("aria-busy");
        form.dataset.busy = "false";
        button.disabled = false;
        delete button.dataset.loading;
      });
    });
  };
  const output = (title, text) => { const box = document.createElement("div"); const strong = document.createElement("strong"); strong.textContent = title; const p = document.createElement("p"); p.textContent = text; box.append(strong, p); return box; };
  attach("interestForm", "interestResult", ({ principal, rate, months }) => {
    const monthlyRate = rate / 100, simple = principal * (1 + monthlyRate * months), compound = principal * Math.pow(1 + monthlyRate, months);
    const box = document.createElement("div"); box.className = "result-pair";
    box.append(output("Juros simples · total " + money.format(simple), "Juros no período: " + money.format(simple - principal) + ". Fórmula: capital × (1 + taxa × meses)."), output("Juros compostos · total " + money.format(compound), "Juros no período: " + money.format(compound - principal) + ". Fórmula: capital × (1 + taxa) elevado ao número de meses."));
    return box;
  });
  attach("inflationForm", "inflationResult", ({ amount, rate, years }) => {
    const multiplier = Math.pow(1 + rate / 100, years), futureCost = amount * multiplier, purchasingPower = amount / multiplier;
    return output("Estimativa com essa hipótese", "Uma compra de " + money.format(amount) + " hoje custaria cerca de " + money.format(futureCost) + " em " + number.format(years) + " anos. Se o valor guardado continuasse em " + money.format(amount) + ", seu poder de compra equivaleria a aproximadamente " + money.format(purchasingPower) + " de hoje.");
  });
  attach("installmentForm", "installmentResult", ({ cash, count, installment }) => {
    const total = count * installment, difference = total - cash, pct = cash > 0 ? difference / cash * 100 : 0;
    const title = difference > 0 ? "Parcelado custa " + money.format(difference) + " a mais" : difference < 0 ? "Parcelado fica " + money.format(Math.abs(difference)) + " abaixo do valor à vista" : "Os totais nominais são iguais";
    return output(title, number.format(count) + " parcelas de " + money.format(installment) + " somam " + money.format(total) + ". Diferença relativa ao preço à vista: " + number.format(pct) + "%. Compare também prazos, tarifas e seu orçamento mensal.");
  });
  attach("debtForm", "debtResult", ({ principal, rate, payment, months }) => {
    let balance = principal, totalPaid = 0, interestTotal = 0, paidOffAt = null;
    for (let month = 1; month <= months; month++) {
      const interest = balance * rate / 100; interestTotal += interest;
      const due = balance + interest; const actualPayment = Math.min(payment, due); totalPaid += actualPayment; balance = Math.max(0, due - actualPayment);
      if (balance === 0) { paidOffAt = month; break; }
    }
    let explanation = paidOffAt ? "Com essas hipóteses, o saldo seria quitado no mês " + paidOffAt + "." : payment <= principal * rate / 100 ? "O pagamento inicial não supera os juros do primeiro mês; o saldo pode crescer." : "O saldo restante após esse período seria " + money.format(balance) + ".";
    explanation += " Juros calculados no período: " + money.format(interestTotal) + "; pagamentos simulados: " + money.format(totalPaid) + ". A conta aplica juros ao saldo antes de descontar cada pagamento.";
    return output("Saldo após a simulação: " + money.format(balance), explanation);
  });
})();
