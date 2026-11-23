(() => {
  "use strict";

  const page = location.pathname.split("/").pop() || "dashboard.html";
  const key = "cashyTour:v1";
  const flow = [
    { page: "dashboard.html", target: ".starter-path", title: "Seu caminho começa aqui", text: "Esta trilha organiza os primeiros passos para entender e cuidar melhor do seu dinheiro." },
    { page: "dashboard.html", target: 'a[href="movimentacoes.html"]', title: "Registre seu dia a dia", text: "Clique em Movimentações para continuar e conhecer seus registros.", action: true, href: "movimentacoes.html" },
    { page: "movimentacoes.html", target: ".workspace-heading", title: "Acompanhe o que entra e sai", text: "Aqui você registra receitas e despesas e filtra seus lançamentos." },
    { page: "movimentacoes.html", target: 'a[href="metas.html"]', title: "Agora, pense nos seus objetivos", text: "Clique em Minhas metas para avançar.", action: true, href: "metas.html" },
    { page: "metas.html", target: ".workspace-heading", title: "Dê forma aos seus objetivos", text: "Crie uma meta e acompanhe o progresso com os valores que você informar." },
    { page: "metas.html", target: 'a[href="educacao.html"]', title: "Aprender ajuda a decidir", text: "Clique em Aprender para conhecer a trilha de educação financeira.", action: true, href: "educacao.html" },
    { page: "educacao.html", target: ".edu-hero", title: "Aprenda no seu ritmo", text: "Os conteúdos começam pelo básico e avançam gradualmente." },
    { page: "educacao.html", target: "#lessonGrid a, #lessonGrid .lesson-card", title: "Escolha uma aula", text: "Clique em um curso para ver como as aulas e exercícios são organizados.", action: true },
    { page: "curso.html", target: ".course-topics", title: "Estude e pratique", text: "O curso reúne explicações e atividades para aplicar o que aprendeu." },
    { page: "curso.html", target: ".course-quiz", title: "Tour concluído", text: "Você pode voltar a este tour quando quiser pelo botão de ajuda." }
  ];

  const guides = {
    "dashboard.html": [[".starter-path", "Seu caminho", "A trilha sugere passos curtos para organizar as finanças."], ["#financeOverview", "Resumo financeiro", "Abra esta seção para consultar os registros que você cadastrou."]],
    "movimentacoes.html": [[".workspace-heading", "Movimentações", "Registre entradas e saídas e use os filtros para encontrar lançamentos."], ["#adicionarMovimentacao", "Adicionar registro", "Cadastre uma receita ou despesa para atualizar seus resumos."]],
    "metas.html": [[".workspace-heading", "Metas", "Crie objetivos e acompanhe o progresso informado por você."], ["#editarMeta", "Criar meta", "Defina um valor e, se desejar, um prazo para seu objetivo."]],
    "planejamento.html": [["#budgetForm", "Orçamento", "Organize valores por categoria e compare o planejado com seus registros."], ["#budgetBars", "Visão por categoria", "Consulte a distribuição do orçamento para identificar prioridades."]],
    "reserva.html": [["#reserveForm", "Planejar a reserva", "Informe despesas essenciais, o prazo desejado e os valores que consegue separar."], [".reserve-progress-wrap", "Acompanhar o progresso", "Veja o valor estimado, o que falta e um prazo aproximado com o aporte informado."]],
    "calculadoras.html": [["#interestForm", "Juros", "Compare juros simples e compostos com valores e taxas hipotéticos."], ["#inflationForm", "Inflação", "Veja como uma hipótese de inflação afeta preços e poder de compra."], ["#installmentForm", "Parcelamentos", "Compare o total parcelado ao preço à vista e observe a diferença nominal."], ["#debtForm", "Saldo de uma dívida", "Observe como taxas e pagamentos hipotéticos podem alterar o saldo ao longo dos meses."]],
    "diagnostico.html": [["#diagnosticForm", "Reflexão pessoal", "Responda pensando na sua rotina. Não há nota ou perfil ideal."], ["#diagnosticForm > button", "Sugestões de aprendizagem", "Quando concluir as respostas, veja ideias de conteúdos e ferramentas para explorar."]],
    "relatorios.html": [["#reportMonth", "Escolha um mês", "Os relatórios usam movimentações e metas reais da sua conta. Entre para acessar os valores."], [".report-privacy-note", "Seus dados", "As categorias e os gráficos refletem apenas os registros que você fez no Cashy."]],
    "simulador.html": [[".scenario-grid", "Simulações", "Compare cenários educativos e veja como prazo e juros alteram resultados."], [".simulator-note", "Como interpretar", "As simulações são exemplos de aprendizagem, não recomendações financeiras."]],
    "educacao.html": [[".edu-hero", "Trilha de aprendizagem", "Aprenda conceitos financeiros numa sequência progressiva."], ["#lessonGrid", "Cursos", "Escolha um curso para estudar e acompanhar seu progresso."]],
    "curso.html": [[".course-topics", "Conteúdo", "Avance pelos tópicos e consulte exemplos práticos."], [".course-quiz", "Exercício", "Use as perguntas para conferir o que entendeu."]],
    "praticar.html": [[".challenge-section", "Desafio semanal", "Escolha passos práticos; o progresso é opcional e fica neste navegador."], ["#investmentChecklist", "Checklist", "Use a lista para refletir sobre conceitos e perguntas que quer pesquisar."], [".practice-grid", "Exercícios", "Explore situações hipotéticas e leia a explicação de cada resposta."]],
    "biblioteca.html": [["#termSearch", "Dicionário", "Pesquise conceitos financeiros explicados em linguagem simples."], [".sources-section", "Fontes", "Aprofunde o estudo em materiais de fontes oficiais."]]
  };

  const style = document.createElement("link"); style.rel = "stylesheet"; style.href = "css/tour.css?v=3"; document.head.append(style);
  const overlay = document.createElement("div"); overlay.className = "tour-spotlight"; overlay.hidden = true; overlay.setAttribute("aria-hidden", "true"); document.body.append(overlay);
  const dialog = document.createElement("section"); dialog.className = "tour-popover"; dialog.hidden = true; dialog.setAttribute("role", "dialog"); dialog.setAttribute("aria-modal", "false"); dialog.tabIndex = -1; dialog.setAttribute("aria-labelledby", "tourTitle"); dialog.innerHTML = '<div class="tour-progress"><span id="tourProgress"></span><button type="button" data-tour="exit" aria-label="Fechar tour">×</button></div><h2 id="tourTitle"></h2><p id="tourText" aria-live="polite"></p><div class="tour-actions"><button type="button" data-tour="back">Voltar</button><button type="button" data-tour="skip">Pular</button><button type="button" data-tour="next" class="tour-primary">Próximo</button></div>'; document.body.append(dialog);
  let active = false, index = 0, localGuide = null, guideIndex = 0, target = null;
  const help = document.createElement("button"); help.type = "button"; help.className = "tour-help"; help.textContent = "?"; help.setAttribute("aria-label", "Ajuda e tour Cashy"); help.setAttribute("aria-expanded", "false"); document.body.append(help);
  const menu = document.createElement("div"); menu.className = "tour-menu"; menu.hidden = true; menu.innerHTML = '<strong>Como podemos ajudar?</strong><button type="button" data-help="page">Entenda esta página</button><button type="button" data-help="tour">Iniciar tour do Cashy</button>'; document.body.append(menu);

  function position() {
    if (!target || dialog.hidden) return;
    const r = target.getBoundingClientRect(); overlay.style.left = `${Math.max(4, r.left - 5)}px`; overlay.style.top = `${Math.max(4, r.top - 5)}px`; overlay.style.width = `${Math.max(24, r.width + 10)}px`; overlay.style.height = `${Math.max(24, r.height + 10)}px`;
    const box = dialog.getBoundingClientRect(), margin = 12; let left = Math.max(margin, Math.min(innerWidth - box.width - margin, r.left)); let top = r.bottom + 14;
    if (top + box.height > innerHeight - margin) top = Math.max(margin, r.top - box.height - 14);
    dialog.style.left = `${left}px`; dialog.style.top = `${top}px`;
  }
  function close() { active = false; localGuide = null; overlay.hidden = dialog.hidden = true; target = null; document.body.classList.remove("tour-active"); help.focus({ preventScroll: true }); }
  function show(title, text, count, current, countMax) {
    target = document.querySelector(current); dialog.querySelector("#tourTitle").textContent = title; dialog.querySelector("#tourText").textContent = text; dialog.querySelector("#tourProgress").textContent = count;
    dialog.hidden = false; overlay.hidden = !target; document.body.classList.toggle("tour-active", !!target); dialog.querySelector("[data-tour=exit]").focus({ preventScroll: true });
    dialog.querySelector('[data-tour="back"]').disabled = localGuide ? guideIndex === 0 : index === 0;
    dialog.querySelector('[data-tour="next"]').textContent = localGuide ? (guideIndex === countMax - 1 ? "Concluir" : "Próximo") : (index === flow.length - 1 ? "Concluir" : "Próximo");
    dialog.querySelector('[data-tour="next"]').disabled = !!(!localGuide && flow[index]?.action);
    if (target) { target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" }); requestAnimationFrame(position); }
    else { overlay.hidden = true; dialog.style.left = `${Math.max(12, (innerWidth - 340) / 2)}px`; dialog.style.top = `${Math.max(16, (innerHeight - 180) / 2)}px`; }
  }
  function showFlow() { const step = flow[index]; if (!step) return finish(); if (page !== step.page) return; show(step.title, step.text, `Etapa ${index + 1} de ${flow.length}`, step.target, flow.length); }
  function finish() { try { localStorage.setItem(`${key}:complete`, "1"); localStorage.setItem(`${key}:seen`, "1"); sessionStorage.removeItem(key); } catch (_) {} close(); }
  function startFlow(startAt = 0) { localGuide = null; active = true; index = startAt; try { localStorage.setItem(`${key}:seen`, "1"); sessionStorage.setItem(key, String(index)); } catch (_) {} if (flow[index]?.page !== page) { location.href = flow[index]?.page || "dashboard.html"; return; } showFlow(); }
  function startGuide() { const items = guides[page] || [["main", "Esta página", "Explore os conteúdos e use a navegação para conhecer as ferramentas do Cashy."]]; localGuide = items; guideIndex = 0; active = true; drawGuide(); }
  function drawGuide() { const item = localGuide?.[guideIndex]; if (item) show(item[1], item[2], `Ajuda ${guideIndex + 1} de ${localGuide.length}`, item[0], localGuide.length); }

  dialog.addEventListener("click", e => {
    const action = e.target.closest("[data-tour]")?.dataset.tour; if (!action) return;
    if (action === "exit") { close(); return; }
    if (action === "skip") { if (localGuide) { guideIndex++; if (guideIndex >= localGuide.length) close(); else drawGuide(); } else if (flow[index]?.action) { index++; try { sessionStorage.setItem(key, String(index)); } catch (_) {} showFlow(); } else { index++; if (index >= flow.length) finish(); else showFlow(); } return; }
    if (action === "back") { if (localGuide) { guideIndex = Math.max(0, guideIndex - 1); drawGuide(); } else { const n = Math.max(0, index - 1); try { sessionStorage.setItem(key, String(n)); } catch (_) {} if (flow[n].page !== page) location.href = flow[n].page; else { index = n; showFlow(); } } return; }
    if (action === "next") { if (localGuide) { guideIndex++; if (guideIndex >= localGuide.length) close(); else drawGuide(); return; } if (index >= flow.length - 1) { finish(); return; } index++; try { sessionStorage.setItem(key, String(index)); } catch (_) {} if (flow[index].page !== page) location.href = flow[index].page; else showFlow(); }
  });
  help.addEventListener("click", () => { const opening = menu.hidden; menu.hidden = !opening; help.setAttribute("aria-expanded", String(opening)); });
  menu.addEventListener("click", e => { const action = e.target.closest("[data-help]")?.dataset.help; if (!action) return; menu.hidden = true; help.setAttribute("aria-expanded", "false"); if (action === "page") startGuide(); else startFlow(0); });
  document.addEventListener("click", e => {
    if (!active || localGuide || !flow[index]?.action) return;
    const link = e.target.closest("a"); if (!link) return;
    const step = flow[index]; if (step.href && !link.getAttribute("href")?.includes(step.href)) return;
    if (!step.href && !(link.matches("#lessonGrid a, #lessonGrid .lesson-card") || link.closest("#lessonGrid"))) return;
    e.preventDefault(); index++; try { sessionStorage.setItem(key, String(index)); } catch (_) {} location.href = link.href;
  });
  addEventListener("resize", position); addEventListener("scroll", position, { passive: true }); document.addEventListener("keydown", e => { if (e.key === "Escape" && active) close(); });

  if (page === "dashboard.html") {
    let pending = null; try { pending = sessionStorage.getItem(key); } catch (_) {}
    if (pending !== null) { index = Number(pending) || 0; if (flow[index]?.page === page) showFlow(); }
    else if (!localStorage.getItem(`${key}:seen`) && window.CashyAPI?.auth?.me) {
      window.CashyAPI.auth.me().then(() => { if (!localStorage.getItem(`${key}:seen`)) startFlow(0); }).catch(() => {});
    }
  } else {
    let pending = null; try { pending = sessionStorage.getItem(key); } catch (_) {}
    if (pending !== null) { index = Number(pending) || 0; if (flow[index]?.page === page) showFlow(); }
  }
})();
