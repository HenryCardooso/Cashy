(function () {
  "use strict";

  window.CashyChatAnswers = [
    {
      id: "comecar",
      title: "Por onde começar",
      keywords: ["por onde comeco", "como comecar a investir", "primeiro investimento", "sou iniciante", "comecar a investir"],
      answer: "Comece entendendo sua vida financeira: anote receitas, despesas, dívidas e objetivos. Depois estude prazo, liquidez e riscos antes de comparar produtos. Não é preciso escolher um investimento só porque alguém recomendou. Leia as condições oficiais e, se algo não estiver claro, procure a instituição responsável.",
      related: ["orcamento", "objetivos", "reserva"]
    },
    {
      id: "investir",
      title: "O que é investir",
      keywords: ["o que e investir", "o que significa investir", "investimento", "investir dinheiro", "aplicar dinheiro"],
      answer: "Investir é aplicar dinheiro em um ativo ou produto financeiro esperando algum resultado futuro. Esse resultado não é garantido: cada opção tem regras, prazo, custos, possibilidade de oscilação e riscos diferentes. Estudar essas características ajuda a entender o que se está contratando.",
      related: ["poupar", "risco", "retorno"]
    },
    {
      id: "poupar",
      title: "Poupar ou investir",
      keywords: ["diferenca entre poupar e investir", "poupar ou investir", "guardar dinheiro", "economizar dinheiro"],
      answer: "Poupar é separar uma parte do dinheiro em vez de gastá-la. Investir é escolher onde aplicar o valor poupado, considerando objetivos e características do produto. Uma pessoa pode poupar primeiro e depois decidir como investir; são etapas relacionadas, mas não iguais.",
      related: ["orcamento", "objetivos", "reserva"]
    },
    {
      id: "orcamento",
      title: "Organizar o orçamento",
      keywords: ["como organizar meu dinheiro", "orcamento pessoal", "receitas e despesas", "controlar gastos", "anotar gastos"],
      answer: "Um começo simples é registrar por algumas semanas quanto entra e quanto sai, separando despesas essenciais, compromissos, dívidas e gastos variáveis. Compare o total com a renda e escolha uma meta possível para acompanhar. O objetivo é enxergar o orçamento com clareza, sem depender de estimativas inventadas.",
      related: ["objetivos", "poupar", "reserva"]
    },
    {
      id: "objetivos",
      title: "Objetivos e prazos",
      keywords: ["definir objetivo financeiro", "meta financeira", "prazo para investir", "curto prazo", "longo prazo"],
      answer: "Escreva o que pretende alcançar, quanto pode separar, quando precisará do dinheiro e se a data pode mudar. O prazo importa porque alguns investimentos têm vencimento ou podem oscilar quando vendidos antes dele. A resposta não escolhe um produto por você; serve para montar critérios de comparação.",
      related: ["liquidez", "reserva", "escolher"]
    },
    {
      id: "reserva",
      title: "Reserva de emergência",
      keywords: ["reserva de emergencia", "dinheiro para emergencia", "imprevisto", "reserva financeira"],
      answer: "A reserva de emergência é um valor separado para despesas inesperadas ou períodos sem renda. Como pode ser necessário usar o dinheiro sem aviso, disponibilidade e preservação do valor costumam ser critérios centrais. O tamanho depende das despesas e da situação de cada pessoa; não existe um número único adequado a todos.",
      related: ["liquidez", "orcamento", "risco"]
    },
    {
      id: "risco",
      title: "O que é risco",
      keywords: ["o que e risco", "risco de investimento", "posso perder dinheiro", "investimento seguro", "seguranca do investimento"],
      answer: "Risco é a possibilidade de o resultado ser diferente do esperado, inclusive com perda ou dificuldade para resgatar o dinheiro. Há riscos de mercado, de crédito, de liquidez e operacionais, entre outros. Diversificar pode reduzir alguns riscos, mas não elimina todos. Renda fixa também pode ter riscos e oscilações.",
      related: ["perda", "diversificar", "liquidez"]
    },
    {
      id: "liquidez",
      title: "Liquidez",
      keywords: ["o que e liquidez", "liquidez diaria", "resgatar investimento", "sacar investimento", "transformar em dinheiro"],
      answer: "Liquidez é a facilidade e a rapidez para transformar um investimento em dinheiro, respeitando as regras e condições de resgate ou venda. Liquidez alta não significa ausência de risco: o preço ainda pode oscilar e pode haver risco de crédito. Verifique o prazo de pagamento e se há carência ou perda ao resgatar antes do vencimento.",
      related: ["prazo", "reserva", "risco"]
    },
    {
      id: "prazo",
      title: "Vencimento e carência",
      keywords: ["vencimento", "carencia", "prazo do investimento", "resgate antes do vencimento", "data de vencimento"],
      answer: "Vencimento é a data prevista para terminar o investimento, conforme as regras do produto. Carência é um período em que o resgate pode não estar disponível. Alguns produtos permitem venda antecipada, mas o preço ou as condições podem ser diferentes do esperado. Confira essas datas antes de aplicar.",
      related: ["liquidez", "renda-fixa", "risco"]
    },
    {
      id: "retorno",
      title: "Retorno e rentabilidade",
      keywords: ["o que e retorno", "rentabilidade", "rendimento", "quanto vou ganhar", "lucro do investimento"],
      answer: "Retorno é o resultado obtido em um período; rentabilidade expressa esse resultado em relação ao valor aplicado. Uma rentabilidade passada não garante a futura. Para comparar, observe o prazo, os custos, os impostos aplicáveis, a inflação e os riscos, além de conferir se a taxa divulgada é bruta ou líquida.",
      related: ["inflacao", "taxas", "juros-compostos"]
    },
    {
      id: "renda-fixa",
      title: "Renda fixa",
      keywords: ["o que e renda fixa", "investimento de renda fixa", "prefixado", "pos fixado", "hibrido"],
      answer: "Na renda fixa, a forma de calcular a remuneração é definida por regras conhecidas, como uma taxa prefixada, um índice de referência ou uma combinação. Isso não torna o resultado sempre previsível: preços podem oscilar, principalmente em venda antecipada, e existem riscos de crédito e liquidez. Leia a remuneração e as condições do título.",
      related: ["renda-variavel", "cdb", "tesouro"]
    },
    {
      id: "renda-variavel",
      title: "Renda variável",
      keywords: ["o que e renda variavel", "investimento de renda variavel", "preco varia", "ativos variaveis"],
      answer: "Na renda variável, o retorno não é definido previamente e o preço pode subir ou cair. Ações e cotas de alguns fundos negociados em bolsa são exemplos. É possível perder parte do valor investido, e pagamentos como dividendos não são garantidos. Entender o ativo e o prazo é essencial antes de decidir.",
      related: ["acoes", "fii", "risco"]
    },
    {
      id: "comparar-renda",
      title: "Renda fixa e renda variável",
      keywords: ["diferenca renda fixa e renda variavel", "renda fixa versus renda variavel", "renda fixa ou variavel"],
      answer: "A diferença principal está na forma como o retorno é determinado. Na renda fixa, há uma regra de remuneração definida; na renda variável, o resultado depende de preços e eventos que podem mudar. Nenhuma das duas categorias significa risco zero. Compare também liquidez, prazo, custos e possibilidade de perda.",
      related: ["renda-fixa", "renda-variavel", "risco"]
    },
    {
      id: "diversificar",
      title: "Diversificação",
      keywords: ["o que e diversificacao", "diversificar investimentos", "diversificar carteira", "espalhar investimentos"],
      answer: "Diversificar é distribuir recursos entre investimentos com características diferentes. Isso pode reduzir a dependência de um único emissor, setor ou tipo de ativo, mas não elimina riscos nem garante retorno. Uma carteira diversificada ainda pode cair de valor. O que faz sentido depende de objetivos, prazos e tolerância a perdas.",
      related: ["risco", "escolher", "renda-variavel"]
    },
    {
      id: "juros-compostos",
      title: "Juros compostos",
      keywords: ["juros compostos", "juros sobre juros", "efeito dos juros", "crescimento composto"],
      answer: "Juros compostos são calculados sobre o valor acumulado, que pode incluir juros de períodos anteriores. Em uma simulação, o resultado depende da taxa, do tempo, dos aportes e das condições consideradas. Uma conta hipotética não prevê o retorno real de um investimento e não substitui a leitura das regras do produto.",
      related: ["retorno", "simulador", "inflacao"]
    },
    {
      id: "inflacao",
      title: "Inflação e retorno real",
      keywords: ["o que e inflacao", "retorno real", "rentabilidade real", "poder de compra", "descontar inflacao"],
      answer: "Inflação é o aumento geral dos preços ao longo do tempo, que reduz o poder de compra do dinheiro. O retorno nominal é o número divulgado; o retorno real considera também a inflação e, numa comparação mais completa, custos e impostos. Um rendimento nominal positivo pode não representar ganho real de poder de compra.",
      related: ["ipca", "retorno", "selic"]
    },
    {
      id: "selic",
      title: "Taxa Selic",
      keywords: ["selic", "taxa basica de juros", "taxa selic atual", "juros do brasil"],
      answer: "A Selic é a taxa básica de juros da economia brasileira e influencia outras taxas e decisões financeiras. O valor muda ao longo do tempo; este chat não consulta a taxa atual. Para o número vigente, consulte o Banco Central em bcb.gov.br. A Selic não é, por si só, um investimento.",
      related: ["cdi", "inflacao", "tesouro-selic"]
    },
    {
      id: "cdi",
      title: "CDI",
      keywords: ["cdi", "cem por cento do cdi", "rendimento do cdi", "cdi atual"],
      answer: "CDI é uma taxa de referência ligada a operações de curtíssimo prazo entre instituições financeiras e aparece como parâmetro em produtos. Um percentual do CDI não informa sozinho quanto você receberá: considere prazo, impostos, taxas, liquidez e risco do emissor. A taxa vigente muda; consulte fontes oficiais ou a documentação do produto.",
      related: ["cdb", "selic", "retorno"]
    },
    {
      id: "ipca",
      title: "IPCA",
      keywords: ["ipca", "indice de inflacao", "inflacao oficial", "ipca atual"],
      answer: "IPCA é um índice usado para acompanhar a variação de preços ao consumidor no Brasil. Alguns investimentos usam o IPCA como parte da regra de remuneração. Como o índice muda e o resultado depende das demais condições, não use uma taxa antiga como previsão. Consulte o IBGE para os dados mais recentes.",
      related: ["inflacao", "renda-fixa", "retorno"]
    },
    {
      id: "tesouro",
      title: "Tesouro Direto",
      keywords: ["tesouro direto", "titulo publico", "tesouro nacional", "investir no governo"],
      answer: "Tesouro Direto é o programa de compra e venda de títulos públicos federais por pessoas físicas. Cada título tem uma regra de remuneração e uma data de vencimento. Se houver venda antes do prazo, o preço pode oscilar conforme as condições de mercado; por isso, o valor de saída pode diferir do esperado. Consulte as regras e custos oficiais antes de investir.",
      related: ["tesouro-selic", "marcacao", "renda-fixa"]
    },
    {
      id: "tesouro-selic",
      title: "Tesouro Selic",
      keywords: ["tesouro selic", "titulo selic", "tesouro pos fixado"],
      answer: "Tesouro Selic é um título público cuja remuneração acompanha a taxa Selic conforme as regras do título. O preço de venda antecipada ainda pode variar e podem existir custos ou impostos. Não o trate como dinheiro instantâneo sem conferir prazos de liquidação, horários e condições atuais no Tesouro Direto.",
      related: ["selic", "tesouro", "liquidez"]
    },
    {
      id: "cdb",
      title: "CDB",
      keywords: ["cdb", "certificado de deposito bancario", "cdb prefixado", "cdb pos fixado"],
      answer: "CDB é um título emitido por banco para captar recursos. Pode ter diferentes formas de remuneração, prazos e regras de resgate. O risco de crédito está ligado ao emissor; alguns CDBs podem contar com cobertura do FGC, dentro das regras e limites vigentes. Confira emissor, vencimento, liquidez, taxa, custos e proteção aplicável.",
      related: ["fgc", "cdi", "liquidez"]
    },
    {
      id: "lci-lca",
      title: "LCI e LCA",
      keywords: ["lci", "lca", "letra de credito imobiliario", "letra de credito do agronegocio"],
      answer: "LCI e LCA são títulos bancários associados, respectivamente, a créditos imobiliários e do agronegócio. Suas condições de remuneração, prazo, carência e resgate variam por emissão. Podem existir regras tributárias específicas e proteção do FGC sujeita às normas vigentes; confirme tudo na oferta e em fontes oficiais antes de comparar.",
      related: ["cdb", "fgc", "prazo"]
    },
    {
      id: "debenture",
      title: "Debêntures",
      keywords: ["debenture", "debentures", "titulo de empresa", "empresa capta dinheiro"],
      answer: "Debênture é um título de dívida emitido por uma empresa. Ao comprar, o investidor empresta recursos ao emissor e fica sujeito às condições da emissão e à capacidade de pagamento da empresa. Debêntures não têm cobertura do FGC. Avalie riscos, garantias descritas, vencimento, liquidez e documentos da oferta.",
      related: ["risco", "renda-fixa", "liquidez"]
    },
    {
      id: "fundos",
      title: "Fundos de investimento",
      keywords: ["fundo de investimento", "fundos de investimento", "cota de fundo", "gestor do fundo", "administrador do fundo"],
      answer: "Um fundo reúne recursos de vários cotistas e segue uma política de investimento descrita em documentos. Administrador e gestor têm funções diferentes na operação e nas decisões da carteira. O valor das cotas pode subir ou cair; existem custos, riscos e regras de resgate. Leia regulamento, lâmina e informações oficiais do fundo.",
      related: ["taxas", "etf", "risco"]
    },
    {
      id: "etf",
      title: "ETF",
      keywords: ["etf", "fundo de indice", "fundo negociado em bolsa", "exchange traded fund"],
      answer: "ETF é um fundo de índice negociado em bolsa. Ele busca acompanhar um índice conforme sua política, mas pode haver diferenças entre o desempenho do fundo e o índice. O preço da cota oscila e há custos e riscos. Antes de investir, confira qual índice é seguido, a composição, as taxas e os documentos do ETF.",
      related: ["fundos", "diversificar", "acoes"]
    },
    {
      id: "acoes",
      title: "Ações",
      keywords: ["acao", "acoes", "comprar acoes", "bolsa de valores", "participacao em empresa"],
      answer: "Uma ação representa uma fração do capital de uma empresa. Seu preço pode subir ou cair por fatores da empresa e do mercado, e pode haver perda de parte do valor aplicado. Ações não garantem dividendos nem retorno. Estude a empresa, os riscos e os custos; este chat não indica quais ações comprar.",
      related: ["dividendos", "renda-variavel", "risco"]
    },
    {
      id: "fii",
      title: "Fundos imobiliários (FIIs)",
      keywords: ["fii", "fiis", "fundo imobiliario", "fundos imobiliarios", "renda de aluguel"],
      answer: "FII é um fundo que investe em ativos relacionados ao mercado imobiliário, conforme sua política. A pessoa compra cotas, não necessariamente um imóvel específico. O preço pode oscilar, rendimentos podem variar ou deixar de ocorrer, e há riscos de vacância, crédito, mercado e liquidez. Consulte documentos e relatórios do fundo.",
      related: ["fundos", "dividendos", "renda-variavel"]
    },
    {
      id: "dividendos",
      title: "Dividendos e rendimentos",
      keywords: ["dividendo", "dividendos", "proventos", "rendimento de fii", "pagamento de fundo"],
      answer: "Dividendos e outros proventos são pagamentos que alguns ativos podem distribuir aos investidores, conforme regras e resultados. Eles não são garantidos e os valores podem variar. Um pagamento passado não prova que haverá pagamentos futuros. Ao avaliar um ativo, considere também o preço, os riscos, os custos e os documentos oficiais.",
      related: ["acoes", "fii", "retorno"]
    },
    {
      id: "poupanca",
      title: "Poupança",
      keywords: ["poupanca", "caderneta de poupanca", "poupanca rende", "poupanca ou investimento"],
      answer: "A poupança é uma modalidade de depósito com regras próprias de remuneração e crédito de rendimentos. Seu funcionamento e resultado podem ser comparados com outras opções, considerando liquidez, rendimento, inflação, impostos e proteção aplicável. Não existe uma comparação justa usando apenas uma taxa isolada; consulte os dados e as regras atuais.",
      related: ["inflacao", "cdb", "fgc"]
    },
    {
      id: "cripto",
      title: "Criptoativos",
      keywords: ["criptoativo", "criptoativos", "criptomoeda", "bitcoin", "ethereum", "moeda digital"],
      answer: "Criptoativos são ativos digitais que podem ter preços muito voláteis e riscos próprios, incluindo perda de valor, fraudes, falhas de plataformas e riscos de custódia. As regras e a forma de negociação variam. Não invista por promessa de lucro garantido; entenda como o ativo funciona e consulte fontes oficiais e documentos antes de qualquer decisão.",
      related: ["risco", "golpes", "renda-variavel"]
    },
    {
      id: "corretora",
      title: "Corretoras e instituições",
      keywords: ["corretora", "escolher corretora", "instituicao financeira", "plataforma de investimento"],
      answer: "Uma corretora ou instituição pode intermediar acesso a produtos financeiros. Antes de abrir conta, confira se a empresa está autorizada quando isso for exigido, leia tarifas, regras de atendimento, custódia e transferência e verifique os canais oficiais. Não compartilhe senha ou código de autenticação com ninguém.",
      related: ["custodia", "taxas", "golpes"]
    },
    {
      id: "b3",
      title: "B3 e bolsa de valores",
      keywords: ["b3", "bolsa brasileira", "bolsa de valores", "negociar na bolsa"],
      answer: "A B3 é a infraestrutura do mercado organizado brasileiro que oferece serviços ligados a negociação, registro, compensação, liquidação e custódia, conforme cada produto e operação. A negociação em bolsa não elimina risco: preços podem oscilar e custos e regras variam. Para dados e informações atuais, consulte os canais oficiais da B3.",
      related: ["acoes", "etf", "fii"]
    },
    {
      id: "fgc",
      title: "FGC e cobertura",
      keywords: ["fgc", "fundo garantidor de creditos", "garantia do cdb", "cobertura do cdb", "lci tem garantia"],
      answer: "O FGC é um mecanismo de proteção para determinados produtos financeiros, sob condições e limites definidos em suas regras. Nem todo investimento é coberto, e a existência de cobertura não elimina todos os riscos nem garante resgate imediato. Verifique se o produto e a instituição são elegíveis e consulte diretamente o FGC para limites e regras atuais.",
      related: ["cdb", "lci-lca", "risco"]
    },
    {
      id: "impostos",
      title: "Impostos sobre investimentos",
      keywords: ["imposto de renda investimento", "ir sobre investimento", "tributacao", "impostos", "imposto no resgate"],
      answer: "A tributação depende do produto, do prazo, do tipo de operação e das regras vigentes. Alguns produtos têm tratamentos diferentes, e as normas podem mudar. Confira a documentação do investimento e as orientações atuais da Receita Federal; em caso de dúvida sobre sua declaração, procure um contador. Este chat não calcula seu imposto pessoal.",
      related: ["taxas", "retorno", "cdb"]
    },
    {
      id: "taxas",
      title: "Taxas e custos",
      keywords: ["taxa de administracao", "taxa de performance", "custos do investimento", "tarifa da corretora", "taxas"],
      answer: "Custos podem incluir taxas de administração ou performance, tarifas, corretagem, custódia e tributos, conforme o produto e a instituição. Eles reduzem o resultado líquido. Compare os custos nos documentos oficiais e confira quando e como são cobrados; uma taxa pequena pode fazer diferença ao longo do tempo.",
      related: ["fundos", "retorno", "escolher"]
    },
    {
      id: "perfil",
      title: "Perfil de investidor",
      keywords: ["perfil de investidor", "conservador moderado arrojado", "teste de perfil", "tolerancia ao risco"],
      answer: "O perfil de investidor ajuda a refletir objetivos, conhecimento, situação financeira e disposição para lidar com oscilações e perdas. Questionários de instituições são instrumentos de avaliação, não uma garantia de adequação ou resultado. Seu perfil pode mudar com a vida; não use um rótulo para ignorar prazo, liquidez ou riscos do produto.",
      related: ["risco", "objetivos", "escolher"]
    },
    {
      id: "escolher",
      title: "Como comparar investimentos",
      keywords: ["como escolher investimento", "como comparar investimentos", "qual o melhor investimento", "qual investimento escolher", "onde investir", "qual investimento e melhor"],
      answer: "Não existe um investimento melhor para todas as pessoas. Para comparar, observe: objetivo e prazo; possibilidade e prazo de resgate; riscos de mercado e de crédito; forma de remuneração; custos e impostos; regras de garantia; e documentos oficiais. Este chat não escolhe um produto para você nem recomenda compra ou venda.",
      related: ["objetivos", "risco", "liquidez"]
    },
    {
      id: "perda",
      title: "Posso perder dinheiro?",
      keywords: ["perder dinheiro", "perda no investimento", "investimento pode cair", "saldo negativo", "prejuizo"],
      answer: "Sim, dependendo do produto e da situação, o valor pode cair ou o emissor pode não cumprir suas obrigações. Mesmo quando há uma regra de remuneração, uma venda antes do vencimento pode ocorrer por um preço diferente. Antes de investir, entenda as possibilidades de perda e não use dinheiro necessário para despesas imediatas sem avaliar as condições.",
      related: ["risco", "marcacao", "liquidez"]
    },
    {
      id: "garantia-retorno",
      title: "Promessa de ganho garantido",
      keywords: ["lucro garantido", "rendimento garantido", "retorno garantido", "ganho certo", "sem risco"],
      answer: "Promessas de ganho alto, rápido e garantido merecem desconfiança. Todo investimento envolve condições e algum tipo de risco; desconfie de pressão para transferir dinheiro, sigilo, urgência ou indicação de recrutar outras pessoas. Pesquise a empresa e a oferta em fontes oficiais e não envie senhas, códigos ou dinheiro sem verificar.",
      related: ["golpes", "risco", "corretora"]
    },
    {
      id: "pouco-dinheiro",
      title: "Começar com pouco dinheiro",
      keywords: ["investir com pouco", "pouco dinheiro para investir", "valor minimo", "comecar com pouco", "investir pouco"],
      answer: "O valor mínimo depende de cada produto e pode mudar. Antes de procurar um valor, organize o orçamento e veja se há dívidas caras ou despesas próximas. Depois confira mínimos, custos, liquidez e riscos nos documentos oficiais. Não é necessário assumir riscos maiores só porque o valor disponível é pequeno.",
      related: ["orcamento", "reserva", "escolher"]
    },
    {
      id: "pre-pos-hibrido",
      title: "Prefixado, pós-fixado e híbrido",
      keywords: ["prefixado pos fixado", "pos fixado", "prefixado", "hibrido", "indexado a inflacao"],
      answer: "Prefixado usa uma taxa definida na contratação; pós-fixado acompanha um indicador conforme as regras; híbrido combina uma taxa definida com um índice. A forma de remuneração não elimina riscos de crédito, liquidez ou oscilação de preço. Compare o prazo e o que acontece se precisar vender antes do vencimento.",
      related: ["renda-fixa", "ipca", "cdi"]
    },
    {
      id: "credito-risk",
      title: "Risco de crédito",
      keywords: ["risco de credito", "emissor nao pagar", "banco quebrar", "calote do emissor"],
      answer: "Risco de crédito é a possibilidade de quem deve pagar o investimento não cumprir suas obrigações. Ele depende do emissor e das condições do título. Garantias, quando existem, têm regras próprias e não devem ser presumidas. Leia os documentos e verifique quem é o responsável pelo pagamento.",
      related: ["cdb", "debenture", "fgc"]
    },
    {
      id: "mercado-risk",
      title: "Risco de mercado",
      keywords: ["risco de mercado", "oscilacao do preco", "preco do titulo caiu", "marcacao a mercado"],
      answer: "Risco de mercado é a possibilidade de mudanças em preços, juros, câmbio ou condições econômicas afetarem o valor de um investimento. Ele pode aparecer também em renda fixa, principalmente quando há venda antes do vencimento. A variação de preço não significa necessariamente que as regras originais do título tenham mudado.",
      related: ["marcacao", "perda", "risco"]
    },
    {
      id: "golpes",
      title: "Golpes financeiros",
      keywords: ["golpe financeiro", "fraude de investimento", "piramide financeira", "roubaram meu dinheiro", "golpe de investimento"],
      answer: "Desconfie de retorno garantido, urgência, contato que pede senha ou código, pagamentos para liberar saque e empresas sem informações verificáveis. Não clique em links suspeitos nem compartilhe acesso remoto ao celular ou computador. Se suspeitar de fraude, interrompa transferências e contate seu banco pelos canais oficiais; registre a ocorrência e procure os órgãos competentes.",
      related: ["garantia-retorno", "corretora", "risco"]
    },
    {
      id: "ipo",
      title: "Oferta pública inicial (IPO)",
      keywords: ["ipo", "oferta publica inicial", "empresa abrindo capital", "estreia na bolsa"],
      answer: "IPO é uma oferta pública inicial em que uma empresa passa a oferecer ações ao público e pode começar a ter ações negociadas em bolsa. Participar não garante valorização: preço, demanda e desempenho podem variar. Leia o prospecto e os documentos da oferta, entenda riscos e custos e não decida somente por publicidade ou comentários.",
      related: ["acoes", "risco", "escolher"]
    },
    {
      id: "marcacao",
      title: "Marcação a mercado",
      keywords: ["marcacao a mercado", "preco de mercado do titulo", "vender titulo antes", "valor do titulo oscilou"],
      answer: "Marcação a mercado é a atualização do preço de um ativo considerando as condições atuais de negociação. Por isso, um título de renda fixa vendido antes do vencimento pode valer mais ou menos do que o valor esperado para a data final. Confira as condições de saída e evite confundir o preço de hoje com a regra de pagamento no vencimento.",
      related: ["tesouro", "renda-fixa", "perda"]
    },
    {
      id: "aposentadoria",
      title: "Planejamento para aposentadoria",
      keywords: ["aposentadoria", "previdencia privada", "investir para aposentadoria", "longo prazo para aposentadoria"],
      answer: "Planejar aposentadoria envolve prazo, contribuições, custos, regras de resgate, tributação e riscos. Produtos de previdência têm modalidades e condições diferentes; não são automaticamente melhores ou piores que outros investimentos. Leia regulamento e taxas, entenda as regras tributárias vigentes e procure orientação adequada para sua situação.",
      related: ["objetivos", "taxas", "impostos"]
    },
    {
      id: "atualidade",
      title: "Taxas e dados atuais",
      keywords: ["taxa atual", "cotacao atual", "noticia do mercado", "quanto esta a selic", "preco hoje", "dados em tempo real"],
      answer: "Este chat funciona com respostas educativas preparadas e não consulta cotações, taxas ou notícias em tempo real. Para um dado atual, verifique diretamente a fonte responsável, como Banco Central, IBGE, CVM, Tesouro Direto, B3 ou os documentos da instituição. Confira também a data da informação.",
      related: ["selic", "ipca", "cdi"]
    },
    {
      id: "sem-recomendacao",
      title: "Recomendação de compra ou venda",
      keywords: ["devo comprar", "devo vender", "compro ou vendo", "me recomenda", "qual ativo comprar", "qual acao comprar"],
      answer: "Não consigo decidir por você nem indicar compra ou venda de um ativo. Posso ajudar a entender conceitos e montar uma lista de critérios: objetivo, prazo, liquidez, riscos, custos, impostos e regras do produto. Para uma recomendação adequada à sua situação, converse com um profissional habilitado e verifique seus interesses e credenciais.",
      related: ["escolher", "perfil", "risco"]
    },
    {
      id: "custodia",
      title: "Custódia de investimentos",
      keywords: ["custodia", "onde ficam meus investimentos", "custodiante", "transferir investimentos"],
      answer: "Custódia é o registro e a guarda operacional de ativos financeiros por instituições autorizadas, conforme as regras de cada mercado. O extrato da corretora é uma forma de acompanhar posições, mas confira também os registros oficiais disponíveis para o produto. Nunca entregue senha para alguém consultar sua custódia.",
      related: ["corretora", "b3", "golpes"]
    },
    {
      id: "fundo-imobiliario-vs-imovel",
      title: "FII ou imóvel físico",
      keywords: ["fii ou imovel", "comprar imovel ou fii", "fundo imobiliario versus imovel", "investir em imovel"],
      answer: "Um imóvel físico e um FII são formas diferentes de exposição ao setor imobiliário. O imóvel envolve compra, documentação, manutenção e eventual dificuldade de venda; no FII, a pessoa compra cotas sujeitas a preço de mercado, regras do fundo e riscos próprios. Não são equivalentes, e nenhum garante renda. Compare custos, liquidez e objetivos.",
      related: ["fii", "liquidez", "risco"]
    },
    {
      id: "simulador",
      title: "Como interpretar uma simulação",
      keywords: ["simulador", "simular investimento", "resultado da simulacao", "calcular rendimento", "cenarios"],
      answer: "Uma simulação mostra o resultado matemático das hipóteses que você digitou, como valor inicial, aportes, prazo e taxa. Ela não sabe qual será a rentabilidade real e pode não incluir impostos, custos, inflação ou oscilações. Troque os valores para comparar cenários e trate o resultado como exemplo, não como previsão.",
      related: ["juros-compostos", "retorno", "inflacao"]
    },
    {
      id: "documentos",
      title: "Quais documentos consultar",
      keywords: ["documentos do investimento", "prospecto", "lamina do produto", "regulamento do fundo", "onde ler sobre investimento"],
      answer: "Procure a lâmina, o regulamento, o prospecto ou o documento de informações essenciais, conforme o produto. Leia objetivo, riscos, custos, liquidez, vencimento, tributação descrita e quem é responsável pelo pagamento. Use a versão mais recente disponibilizada pela instituição ou pela fonte oficial.",
      related: ["escolher", "taxas", "risco"]
    },
    {
      id: "consultar-fontes",
      title: "Fontes confiáveis para aprender",
      keywords: ["fonte confiavel", "onde aprender investimentos", "site oficial investimentos", "estudar sobre investimentos"],
      answer: "Para estudar conceitos e cuidados, consulte o Portal do Investidor da CVM em gov.br/investidor e os materiais de cidadania financeira do Banco Central em bcb.gov.br/cidadaniafinanceira. Para regras ou dados de um produto, consulte também seus documentos oficiais e a instituição responsável.",
      related: ["documentos", "escolher", "atualidade"]
    }
  ];
})();
