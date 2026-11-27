(() => {
  "use strict";
  const input = document.getElementById("siteSearchInput");
  const list = document.getElementById("siteSearchResults");
  const status = document.getElementById("siteSearchStatus");
  if (!input || !list || !status) return;
  const pages = [
    ["Página inicial", "começar Cashy educação financeira", "index.html"],
    ["Cursos de educação financeira", "trilha aprender nível iniciante intermediário avançado XP", "educacao.html#trilha"],
    ["Planejar orçamento", "renda despesas orçamento categorias receitas gastos", "planejamento.html"],
    ["Reserva e metas", "reserva emergência objetivo guardar prazo", "reserva.html"],
    ["Calculadoras financeiras", "juros compostos inflação parcelamento dívida renda fixa taxa", "calculadoras.html"],
    ["Simulador e carteira fictícia", "comparar cenários investimentos carteira renda fixa fundos ações hipóteses", "simulador.html"],
    ["Praticar conceitos", "quiz exercícios checklist teste conhecimento", "praticar.html"],
    ["Movimentações", "entradas saídas transações despesas receitas", "movimentacoes.html"],
    ["Minhas metas", "objetivos progresso valor guardado", "metas.html"],
    ["Relatórios", "gráfico resumo financeiro entradas despesas", "relatorios.html"],
    ["Meu perfil", "preferências dados senha avatar", "perfil.html"],
    ["Diagnóstico financeiro", "ponto de partida perguntas situação", "diagnostico.html"],
    ["Privacidade e dados", "exportar apagar dados conta segurança", "privacidade.html"],
    ["Termos de uso", "simulações limites educação", "termos.html"],
    ["Dicionário e fontes oficiais", "conceitos CDI Selic IPCA liquidez risco CVM Banco Central", "biblioteca.html#dicionario"],
    ["Cashy Empresas", "negócio empresa ROI lucro faturamento fluxo de caixa ponto de equilíbrio CAC LTV", "empresas.html"],
  ];
  const entries = pages.map(([title, description, href]) => ({ title, description, href }));
  (window.CASHY_CURSOS || []).forEach((course) => entries.push({ title: course.title, description: course.description + " " + course.level + " curso aula quiz", href: "curso.html?id=" + encodeURIComponent(course.id) }));
  document.querySelectorAll(".term-card").forEach((card) => {
    const title = card.querySelector("h3")?.textContent?.trim();
    const description = [...card.querySelectorAll("p")].map((paragraph) => paragraph.textContent).join(" ");
    if (title) entries.push({ title, description, href: "biblioteca.html#dicionario" });
  });
  function normalize(value) { return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim(); }
  input.addEventListener("input", () => {
    const query = normalize(input.value);
    list.replaceChildren(); list.hidden = true;
    if (query.length < 2) { status.textContent = "Digite pelo menos duas letras."; return; }
    const words = query.split(/\s+/).filter(Boolean);
    const matches = entries.map((entry) => {
      const title = normalize(entry.title), text = normalize(entry.title + " " + entry.description);
      const score = words.reduce((total, word) => total + (title.startsWith(word) ? 3 : title.includes(word) ? 2 : text.includes(word) ? 1 : 0), 0);
      return { ...entry, score };
    }).filter((entry) => entry.score === words.length * 1 || entry.score >= words.length * 2)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "pt-BR")).slice(0, 8);
    if (!matches.length) { status.textContent = "Nenhum conteúdo encontrado. Tente outro termo."; return; }
    matches.forEach((entry) => {
      const item = document.createElement("li");
      const link = document.createElement("a"); link.href = entry.href;
      const title = document.createElement("strong"); title.textContent = entry.title;
      const description = document.createElement("span"); description.textContent = entry.description;
      link.append(title, description); item.append(link); list.append(item);
    });
    list.hidden = false;
    status.textContent = matches.length + (matches.length === 1 ? " resultado encontrado." : " resultados encontrados.");
  });
})();
