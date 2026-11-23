(() => {
  "use strict";
  const form = document.getElementById("diagnosticForm");
  const panel = document.getElementById("diagnosticResults");
  const output = document.getElementById("diagnosticSuggestions");
  const suggestions = {
    tracking: ["Organize seus registros", "Comece observando entradas e saídas e depois ajuste seu orçamento com valores que você conhece.", "planejamento.html"],
    budget: ["Monte um plano para o mês", "A oficina permite distribuir valores por categoria e revisar o que ficou sem destino.", "planejamento.html"],
    debt: ["Entenda crédito e dívidas", "Estude fatura, encargos, custo total, renegociação e comparação de parcelas.", "curso.html?id=orcamento-credito-dividas"],
    reserve: ["Planeje uma reserva", "Estime um objetivo a partir de despesas essenciais e escolha um prazo ajustável.", "reserva.html"],
    goals: ["Defina um objetivo acompanhável", "Crie uma meta com um valor e um prazo que façam sentido para sua realidade.", "metas.html"],
    interest: ["Explore juros e inflação", "Compare cálculos hipotéticos e veja como taxas alteram valores ao longo do tempo.", "calculadoras.html"]
  };
  form.addEventListener("submit", (event) => {
    event.preventDefault(); if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form).entries());
    const picks = [];
    if (Number(values.tracking) < 2) picks.push("tracking");
    if (Number(values.budget) < 2) picks.push("budget");
    if (Number(values.debt) < 2 || values.concepts === "1") picks.push("debt");
    if (Number(values.reserve) < 2) picks.push("reserve");
    if (Number(values.goals) < 2) picks.push("goals");
    if (values.concepts === "0" || values.concepts === "2") picks.push("interest");
    const unique = [...new Set(picks)].slice(0, 4);
    if (!unique.length) unique.push("interest", "budget");
    output.replaceChildren(...unique.map((key) => {
      const [title, text, href] = suggestions[key]; const card = document.createElement("article"); card.className = "diagnostic-suggestion";
      const heading = document.createElement("h3"); heading.textContent = title; const description = document.createElement("p"); description.textContent = text;
      const link = document.createElement("a"); link.href = href; link.textContent = key === "debt" ? "Estudar este curso →" : "Conhecer a ferramenta →";
      card.append(heading, description, link); return card;
    }));
    panel.hidden = false; panel.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  });
})();
