# Cashy — educação financeira e organização do dinheiro

Projeto demonstrativo para quem está começando a aprender sobre organização financeira e investimentos.

## Tecnologias

- HTML, CSS e JavaScript para as páginas.
- PHP 8 com PDO para autenticação e operações do site.
- MySQL para contas, movimentações, metas, progresso educativo e contadores temporários de tentativas de login.

## Preparar o banco MySQL

1. Inicie o serviço MySQL.
2. Execute o arquivo database/schema.sql uma vez. Ele cria o banco cashy e suas tabelas.
   - No MySQL Workbench, abra o arquivo e execute o conteúdo.
   - No PowerShell, execute: Get-Content .\database\schema.sql | mysql -u root -p
3. Se `api/config.php` ainda não existir, copie `api/config.example.php` com `Copy-Item api/config.example.php api/config.php`.
4. Confira host, porta, banco, usuário e senha do seu MySQL. O arquivo `config.php` fica fora do controle de versão.
   - No XAMPP sem senha para root, o valor de password pode ficar vazio.
   - Em outras instalações, use a senha configurada no MySQL.
   - O PHP que inicia o site precisa ter as extensões PDO MySQL (`pdo_mysql`), `mbstring` e cURL habilitadas.
5. Para ativar o chat com Groq, gere uma chave no [GroqCloud](https://console.groq.com/keys) e informe `groq_api_key` em `api/config.php` ou defina a variável de ambiente `GROQ_API_KEY` no servidor. Mantenha a chave fora do Git. O modelo padrão é `openai/gpt-oss-120b`; consulte a [lista de modelos disponíveis](https://console.groq.com/docs/models). Sem chave, o chat informa que ainda não está configurado.
   - O Groq oferece planos e limites que podem mudar; consulte os [limites atuais](https://console.groq.com/docs/rate-limits). O Cashy envia a pergunta e até sete mensagens anteriores (máximo de oito mensagens, até 1.200 caracteres cada). Não envia os dados da conta, movimentações ou metas. A Groq informa que entradas e respostas podem ser registradas por até 30 dias para confiabilidade ou prevenção de abuso, salvo configuração Zero Data Retention (ZDR); confira os [controles de dados](https://console.groq.com/docs/your-data). Evite escrever informações pessoais, confidenciais ou financeiras.

### Atualização de uma instalação existente

Se o banco já tinha sido criado antes desta evolução, execute `database/migration-2026-11-profile-learning.sql` uma única vez no MySQL Workbench para adicionar prazo das metas e tabelas de perfil e aprendizagem. Depois, execute `database/migration-2026-11-auth-rate-limit.sql` para criar a tabela temporária de limitação de tentativas de login. As migrações preservam os registros existentes; a segunda usa `IF NOT EXISTS`.

## Abrir o site

Depois da configuração inicial do banco e do arquivo `api/config.php`, inicie o MySQL pelo XAMPP e dê dois cliques em `iniciar-cashy.bat`. O arquivo localiza o PHP do XAMPP em `C:\xampp` ou usa `php` no `PATH`, inicia o servidor e abre a página inicial. Se `api/config.php` estiver ausente, ele cria uma cópia do exemplo; confira os dados do MySQL antes de usar. Mantenha a janela aberta durante a apresentação. O script não instala o PHP, não inicia o MySQL e não cria o banco.

Se preferir iniciar manualmente, abra um terminal dentro da pasta do projeto e execute:

~~~powershell
php -S localhost:8000 -t . router.php
~~~

Depois abra http://localhost:8000/index.html no navegador. O roteador PHP exige uma sessão ativa nas páginas de recursos e mantém o destino solicitado para depois do login. As páginas de cadastro, login e dados precisam ser acessadas pelo servidor PHP; abrir os arquivos diretamente com file:// não executa a API.

Para encerrar o servidor PHP iniciado no terminal, pressione Ctrl+C.

## O que vai para o banco

- users: nome, e-mail e hash da senha. A senha não é gravada em texto puro.
- financial_transactions: entradas e saídas, com categoria, valor e data.
- financial_goals: metas e valores guardados.
- course_progress: cursos concluídos.
- education_checklists: respostas do checklist educativo.
- user_profiles: avatar e preferência do lembrete dentro do Cashy.
- education_course_state: etapa atual, etapas concluídas e histórico de respostas dos quizzes.
- education_activity: atividade de estudo e recompensas de XP, usadas para nível, sequência e desafio semanal.
- auth_login_attempts: contadores e hashes temporários por endereço de origem e combinação endereço/e-mail; não guarda IP ou e-mail em texto puro e remove registros antigos na próxima tentativa de login.

As tabelas financeiras e educativas usam o identificador da conta e são apagadas junto com ela. Consultas PHP usam parâmetros preparados e as rotas de gravação exigem uma sessão autenticada e token CSRF. O login limita a cinco falhas por combinação de origem/e-mail e 30 falhas por origem em uma janela de 15 minutos; o bloqueio temporário dura 15 minutos. O IP vem de `REMOTE_ADDR` e cabeçalhos de proxy são ignorados. Atrás de um proxy reverso, clientes podem compartilhar o limite; configure proxies confiáveis antes de alterar essa regra e não aceite `X-Forwarded-For` arbitrário. A opção “Manter conectado neste dispositivo” vem marcada e pode manter o cookie por até 30 dias; desmarcada, vale só pela sessão do navegador.

A preferência de tema, planos de orçamento e reserva, progresso de visitante, desafios e estado do tour ficam no armazenamento local deste navegador. Avatar, preferências de perfil e progresso de pessoa conectada ficam no banco; o lembrete configurado é exibido dentro do painel Cashy. E-mail e notificações push ainda não estão configurados. Os cadastros antigos armazenados no navegador não são importados para o MySQL.

## Recuperação de senha

A recuperação por e-mail ainda não foi configurada; não há redefinição automática nem canal de suporte definido neste protótipo. Não solicite nem compartilhe senhas. Uma futura recuperação exigirá provedor de e-mail, tokens aleatórios de uso único com expiração, limitação de tentativas e respostas que não revelem se uma conta existe.

## Organização dos arquivos

~~~text
Cashy/
├── router.php          controla o acesso às páginas no servidor PHP local
├── api/                 endpoints PHP, conexão e autenticação
│   ├── page-router.php  valida sessão e entrega páginas de recursos
│   ├── auth.php         cadastro, login e sessão
│   ├── account.php      exclusão de conta
│   ├── profile.php      dados, preferências e alteração de senha
│   ├── chat.php         assistente educativo via Groq
│   ├── bootstrap.php    conexão ao banco e funções comuns da API
│   ├── education.php    progresso educativo
│   ├── goals.php        metas
│   ├── transactions.php movimentações
│   └── config.example.php  exemplo de configuração do banco
├── database/schema.sql  criação do banco e tabelas
├── database/migration-2026-11-profile-learning.sql  migração de perfil e aprendizagem
├── css/                 estilos, incluindo chatbot.css
├── images/              logo e ilustrações
├── js/                  interações do site
│   ├── api.js           chamadas ao servidor PHP
│   └── chatbot.js       interface do assistente educativo
├── index.html           página pública inicial
├── login.html           entrar e criar conta
├── dashboard.html       painel com orientação inicial, evolução e resumo mensal
├── movimentacoes.html   entradas e saídas da conta
├── metas.html           metas financeiras
├── perfil.html          perfil, preferências e segurança da conta
├── educacao.html        cursos e progresso da trilha
├── planejamento.html    oficina de orçamento salva neste navegador
├── praticar.html        checklist educativo e exercícios
├── simulador.html       comparação de cenários hipotéticos
├── biblioteca.html      dicionário e fontes oficiais
├── curso.html           página individual de cada curso
├── privacidade.html     explicação e exclusão da conta
└── termos.html          termos do projeto
~~~

## Estado atual e escopo da auditoria

O frontend usa páginas HTML independentes com CSS e JavaScript sem framework ou etapa de build. A API é composta por endpoints PHP com PDO; o MySQL é descrito em `database/schema.sql`. Não há `package.json` nem `composer.json`. A verificação do projeto fica em `tests/verify.ps1`; ela confere sintaxe, referências locais, normalização das observações SGS e cálculos financeiros. Ainda não substitui testes de navegador, carga ou testes com banco ativo. A instalação precisa do PHP com PDO MySQL, `mbstring` e cURL, além do MySQL configurado.

Execute `powershell -NoProfile -ExecutionPolicy Bypass -File .\tests\verify.ps1` na pasta do projeto para rodar as verificações automatizadas.

A autenticação usa sessões PHP, cookies `HttpOnly`/`SameSite`, rotação de sessão no login e tokens CSRF nas gravações. O roteador e as regras do Apache exigem uma sessão válida nas páginas de recursos; as rotas de movimentações, metas, perfil, educação e chat também verificam a conta. Consultas usam parâmetros preparados. `api/config.php` contém configuração local e não deve ser enviado ao Git.

A auditoria desta etapa encontrou e corrigiu descrições desatualizadas neste README. Os links locais das páginas HTML foram conferidos e a sintaxe dos arquivos PHP e JavaScript passou. O site não tem build configurado; a validação em navegador e fluxos ligados ao MySQL precisam ser feitos com Apache/PHP e banco ativos.

## Conteúdo educativo

O Cashy oferece dez cursos com leituras e quizzes, filtro por nível, progresso de aulas e atividades educativas. As primeiras etapas priorizam orçamento, crédito, consumo e objetivos antes de aprofundar investimentos. O painel inclui um caminho inicial baseado nos registros, no progresso do curso de crédito e no cadastro de metas. As ferramentas educativas ficam em páginas separadas: cursos em `educacao.html`, orçamento em `planejamento.html`, checklist e exercícios em `praticar.html`, cenários hipotéticos em `simulador.html` e conceitos/fontes em `biblioteca.html`. A oficina permite organizar renda, despesas, dívidas, parcelas, reservas e objetivos e guardar versões do orçamento somente neste navegador. Esses planos não conectam contas bancárias, não são enviados ao servidor e não sincronizam entre dispositivos.

As simulações usam hipóteses informadas pela pessoa e são exercícios educativos, não previsões ou recomendações financeiras. A calculadora de renda fixa não representa um produto, e a carteira fictícia não salva dados nem consulta cotações. Valores de exemplo não representam contas, produtos ou resultados reais.

## Indicadores e busca de conteúdo

A biblioteca consulta as séries SGS 432 (Meta Selic) e 433 (IPCA mensal) do Banco Central do Brasil por meio de `api/indicators.php`. A API valida formato, valor e datas futuras antes de devolver observações; o navegador mostra a unidade e a referência de cada série. O indicador depende de conexão HTTPS de saída do servidor e da disponibilidade do BCB. A carteira fictícia e a calculadora de renda fixa são ferramentas hipotéticas; nenhuma delas estima imposto ou risco específico de produto.

A busca na biblioteca percorre páginas, cursos e termos cadastrados no frontend. A exportação na página de privacidade baixa dados JSON da conta conectada ou os dados locais do navegador.

Para publicar o projeto em uma hospedagem, configure uma senha própria para o banco, use HTTPS e não publique api/config.php.

## Assistente educativo

O assistente só é montado depois que `api/auth.php?action=me` confirma uma sessão autenticada, e o endpoint `api/chat.php` também exige login e token CSRF. O navegador envia a pergunta e até sete mensagens anteriores; o PHP consulta a API da Groq com instruções educativas. O histórico fica na memória da página e não é gravado no MySQL. O assistente não recebe nome, e-mail, saldo, movimentações ou metas da conta, não fornece recomendação personalizada e não consulta dados de mercado em tempo real. A Groq informa que pode registrar entradas e respostas por até 30 dias para confiabilidade ou prevenção de abuso, salvo ZDR habilitada pelo administrador da conta. Não escreva informações pessoais, confidenciais ou financeiras no chat.
