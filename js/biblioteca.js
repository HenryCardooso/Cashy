(function(){
 "use strict";
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
