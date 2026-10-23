(function () {
  "use strict";

  const lessons = window.CASHY_CURSOS || [];

  const terms = [
    ["CDI", "Taxa de referência ligada a empréstimos de curtíssimo prazo entre instituições financeiras. É usada como referência em alguns investimentos.", "Exemplo: uma oferta pode dizer que acompanha um percentual do CDI; isso descreve uma regra, não garante ganho nem define sozinho o resultado líquido."],
    ["Selic", "Taxa básica de juros da economia brasileira, definida pelo Comitê de Política Monetária do Banco Central. Influencia outras taxas da economia.", "Exemplo: mudanças na Selic podem influenciar o custo do crédito e as condições de investimentos, mas cada produto reage conforme suas regras."],
    ["IPCA", "Índice calculado pelo IBGE que acompanha a variação de preços de uma cesta de produtos e serviços consumidos por famílias no Brasil.", "Exemplo: se vários preços acompanhados pelo índice sobem, o dinheiro pode comprar menos ao longo do tempo."],
    ["Liquidez", "Facilidade e prazo para transformar um investimento em dinheiro, de acordo com as regras de resgate.", "Exemplo: dois produtos podem ter retornos hipotéticos parecidos, mas um permitir resgate mais rápido que o outro."],
    ["Rentabilidade", "Variação do valor de um investimento ao longo de um período. O resultado passado não garante o resultado futuro.", "Exemplo: comparar a variação de um investimento em dois períodos ajuda a descrever o passado, sem prever o próximo período."],
    ["Diversificação", "Distribuição dos recursos entre diferentes investimentos. Pode reduzir a concentração, mas não elimina riscos.", "Exemplo: dividir recursos entre setores diferentes pode reduzir a dependência de uma única empresa, mas ainda pode haver perdas."],
    ["Risco", "Possibilidade de o resultado ser diferente do esperado, incluindo oscilações, perdas ou dificuldade de resgate.", "Exemplo: um investimento pode oscilar de preço ou o emissor pode enfrentar dificuldades para cumprir suas obrigações."],
    ["Juros compostos", "Cálculo em que os juros acumulados também passam a fazer parte da base para os juros seguintes.", "Exemplo: em uma conta hipotética, os juros de um período são somados ao saldo antes de calcular os juros do período seguinte."],
    ["Inflação", "Aumento generalizado dos preços ao longo do tempo, que reduz o poder de compra do dinheiro.", "Exemplo: se o preço de itens do cotidiano aumenta, a mesma quantia pode comprar menos do que comprava antes."],
    ["Dividendos", "Parte dos resultados que uma empresa ou fundo pode distribuir aos investidores, conforme regras e decisões próprias. Não há garantia de pagamento.", "Exemplo: uma empresa pode distribuir parte de seus resultados em um período e não distribuir em outro."],
    ["Renda fixa", "Categoria em que a remuneração segue regras definidas na aplicação. Ainda pode haver riscos, prazos e condições de resgate.", "Exemplo: um título pode indicar uma taxa ou acompanhar um indicador, mas ainda ter prazo, emissor e condições de venda."],
    ["Fundo de investimento", "Veículo que reúne recursos de investidores e os aplica em uma carteira conforme regras e objetivos definidos.", "Exemplo: ao comprar cotas, a pessoa participa do fundo conforme o regulamento; composição, taxas e resgate variam."],
    ["Ação", "Uma unidade que representa parte do capital de uma empresa. Seu preço pode subir ou cair.", "Exemplo: quem compra uma ação passa a ter uma pequena participação na empresa e fica exposto à variação de preço."],
    ["FII", "Fundo de Investimento Imobiliário, que aplica recursos em ativos ligados ao mercado imobiliário, conforme seu regulamento.", "Exemplo: um FII pode investir em imóveis ou títulos ligados ao setor; preço das cotas e distribuições podem variar."],
    ["Retorno líquido", "Resultado após descontar custos e impostos aplicáveis. As regras variam conforme o investimento e a situação.", "Exemplo: para comparar opções, considere o resultado depois dos custos previstos, não apenas a taxa anunciada."],
    ["Emissor", "Instituição ou entidade responsável por emitir um título e assumir as obrigações descritas em suas condições.", "Exemplo: antes de estudar um título, procure identificar quem deverá pagar os valores previstos e em quais condições."],
    ["Volatilidade", "Medida de quanto o preço ou retorno de um ativo oscila ao longo do tempo. Oscilação não indica, por si só, a direção futura.", "Exemplo: um preço que sobe e desce bastante em períodos curtos tem maior oscilação observada nesse intervalo."],
    ["Vencimento", "Data ou prazo em que terminam as condições previstas para determinado título, conforme suas regras.", "Exemplo: se o dinheiro pode ser necessário antes do vencimento, confira se existe saída antecipada e quais condições se aplicam."],
    ["Marcação a mercado", "Atualização do valor de um ativo conforme preços e condições atuais de negociação. O valor antes do vencimento pode oscilar.", "Exemplo: um título pode valer mais ou menos no mercado hoje do que o valor estimado para mantê-lo até o vencimento."]
  ];

  function currentEmail() {
    try {
      for (const store of [localStorage, sessionStorage]) if (store.getItem("cashyLogado") === "true") return store.getItem("cashyEmail") || "";
    } catch (_) {}
    return "";
  }
  const email = currentEmail();
  const progressKey = "cashyAulas:" + (email || "visitante");
  const accountLink = document.getElementById("contaLink");
  accountLink.href = email ? "dashboard.html" : "login.html";
  accountLink.textContent = email ? "Minha conta" : "Entrar";
  document.getElementById("progressNote").textContent = email ? "Seu progresso fica salvo nesta conta, neste navegador." : "Sem login, o progresso fica salvo neste navegador como visitante; com login, fica separado por conta.";

  function readProgress() {
    try {
      const data = JSON.parse(localStorage.getItem(progressKey) || "{}");
      return data && Array.isArray(data.completed) ? data.completed.filter((id) => lessons.some((lesson) => lesson.id === id)) : [];
    } catch (_) { return []; }
  }
  function saveProgress(completed) {
    try { localStorage.setItem(progressKey, JSON.stringify({ completed })); return true; }
    catch (_) { return false; }
  }
  function updateProgress() {
    const completed = readProgress();
    const percent = Math.round((completed.length / lessons.length) * 100);
    document.getElementById("progressCount").textContent = completed.length + " de " + lessons.length + " cursos concluídos";
    document.getElementById("progressPercent").textContent = percent + "%";
    document.getElementById("progressBar").style.width = percent + "%";
    document.querySelector(".progress-track").setAttribute("aria-valuenow", String(percent));
    document.querySelectorAll(".lesson-card").forEach((card) => {
      const done = completed.includes(card.dataset.lessonId);
      card.classList.toggle("completed", done);
      let badge = card.querySelector(".completion-note");
      if (done && !badge) { badge = document.createElement("span"); badge.className = "completion-note"; badge.setAttribute("role", "status"); badge.textContent = "Curso concluído"; card.querySelector(".lesson-content").append(badge); }
      if (!done && badge) badge.remove();
    });
  }
  const grid = document.getElementById("lessonGrid");
  lessons.forEach((lesson, index) => {
    const card = document.createElement("article"); card.className = "lesson-card"; card.dataset.lessonId = lesson.id; card.dataset.level = lesson.level.split("/")[1].trim();
    const art = document.createElement("div"); art.className = "lesson-art";
    const icon = document.createElement("span"); icon.textContent = ["◉", "⌁", "⌕", "◎"][index % 4]; art.append(icon);
    const content = document.createElement("div"); content.className = "lesson-content";
    const level = document.createElement("span"); level.className = "lesson-level"; level.textContent = lesson.level;
    const title = document.createElement("h3"); title.textContent = lesson.title;
    const description = document.createElement("p"); description.textContent = lesson.description;
    if (index > 0) { const prerequisite = document.createElement("p"); prerequisite.className = "course-prerequisite"; prerequisite.textContent = "Sequência sugerida: estude antes “" + lessons[index - 1].title + "”."; content.append(level, title, description, prerequisite); }
    else content.append(level, title, description);
    const meta = document.createElement("div"); meta.className = "lesson-meta";
    const reading = document.createElement("span"); reading.textContent = "Aula · leitura e quiz";
    const button = document.createElement("a"); button.className = "course-link"; button.textContent = "Abrir curso →"; button.href = "curso.html?id=" + encodeURIComponent(lesson.id);
    meta.append(reading, button); content.append(meta); card.append(art, content); grid.append(card);
  });
  updateProgress();
  document.getElementById("levelFilter").addEventListener("change", (event) => {
    const selected = event.target.value;
    document.querySelectorAll(".lesson-card").forEach((card) => { card.hidden = selected !== "todos" && card.dataset.level !== selected; });
  });

  const checklist = document.getElementById("investmentChecklist");
  const checklistStatus = document.getElementById("checklistStatus");
  const checklistKey = "cashyChecklist:" + (email || "visitante");
  const checklistItems = [...checklist.querySelectorAll('input[name="check"]')];
  try {
    const saved = JSON.parse(localStorage.getItem(checklistKey) || "[]");
    if (Array.isArray(saved)) checklistItems.forEach((item, index) => { item.checked = saved[index] === true; });
  } catch (_) {}
  function updateChecklist(save) {
    const reviewed = checklistItems.filter((item) => item.checked).length;
    checklistStatus.textContent = reviewed + " de " + checklistItems.length + " itens revisados" + (reviewed === checklistItems.length ? ". As respostas ajudam a identificar dúvidas; não atestam que um investimento seja adequado." : ". Use os itens desmarcados para orientar seus estudos.");
    if (save) { try { localStorage.setItem(checklistKey, JSON.stringify(checklistItems.map((item) => item.checked))); } catch (_) {} }
  }
  checklist.addEventListener("change", () => updateChecklist(true));
  checklist.addEventListener("reset", (event) => { event.preventDefault(); checklistItems.forEach((item) => { item.checked = false; }); try { localStorage.removeItem(checklistKey); } catch (_) {} updateChecklist(false); });
  updateChecklist(false);

  const practiceAnswers = {
    1: { answer: "b", correct: "Isso. Pressão para agir e promessa de ganhos altos sem risco são sinais para interromper e verificar. Consulte informações oficiais e não decida só com base em uma publicação." , retry: "Reveja a promessa e a pressão para agir. Popularidade ou urgência não comprovam que uma oferta seja confiável." },
    2: { answer: "a", correct: "Isso. Prazo, liquidez, riscos e custos ajudam a entender se uma opção atende às necessidades consideradas. A taxa sozinha não conta a história toda.", retry: "Pense em quando Luiza pode precisar do dinheiro e nas regras para acessar ou retirar os recursos." },
    3: { answer: "c", correct: "Isso. O saldo é uma estimativa matemática que depende das hipóteses inseridas; taxas e condições reais podem variar e o resultado não é garantido.", retry: "Uma simulação não consulta o futuro nem dados de mercado; ela calcula com base nos valores e hipóteses informados." }
  };
  document.querySelectorAll("[data-practice]").forEach((button) => button.addEventListener("click", () => {
    const id = button.dataset.practice, selected = document.querySelector('input[name="practice' + id + '"]:checked');
    const output = document.getElementById("practiceFeedback" + id);
    if (!selected) { output.textContent = "Escolha uma opção para conferir a explicação."; output.classList.remove("is-correct"); return; }
    const result = practiceAnswers[id], correct = selected.value === result.answer;
    output.textContent = correct ? result.correct : result.retry;
    output.classList.toggle("is-correct", correct);
  }));

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
    const label = String(values.get("label") || "Sem rótulo");
    const result = { label, initial, contribution, months, annualRate, contributions: totalContributions, balance: estimatedBalance, difference: estimatedBalance - totalContributions };
    resultValues[form.dataset.scenario] = result;
    output.textContent = "Saldo hipotético: " + money(result.balance) + " · Total informado: " + money(result.contributions) + " · Diferença matemática: " + money(result.difference) + ". Resultado baseado nas hipóteses, não é previsão.";
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

  const termGrid = document.getElementById("termGrid");
  terms.forEach(([term, definition, example]) => {
    const card = document.createElement("article"); card.className = "term-card"; card.dataset.search = (term + " " + definition + " " + example).toLocaleLowerCase("pt-BR");
    const heading = document.createElement("h3"); heading.textContent = term;
    const paragraph = document.createElement("p"); paragraph.textContent = definition;
    const exampleText = document.createElement("p"); exampleText.className = "term-example"; exampleText.textContent = example;
    card.append(heading, paragraph, exampleText); termGrid.append(card);
  });
  const search = document.getElementById("termSearch");
  function normalize(text) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim(); }
  search.addEventListener("input", () => {
    const query = normalize(search.value); let visible = 0;
    document.querySelectorAll(".term-card").forEach((card) => {
      const show = normalize(card.dataset.search).includes(query); card.hidden = !show; if (show) visible += 1;
    });
    document.getElementById("searchCount").textContent = query ? visible + (visible === 1 ? " termo encontrado." : " termos encontrados.") : "";
  });
})();
