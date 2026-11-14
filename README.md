# Cashy — educação financeira e organização do dinheiro

Projeto demonstrativo para quem está começando a aprender sobre organização financeira e investimentos.

## Tecnologias

- HTML, CSS e JavaScript para as páginas.
- PHP 8 com PDO para autenticação e operações do site.
- MySQL para contas, movimentações, metas e progresso educativo.

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
   - O Groq oferece planos e limites que podem mudar; consulte os [limites atuais](https://console.groq.com/docs/rate-limits). As perguntas e o contexto recente são enviados à Groq. O Cashy não envia os dados da conta, movimentações ou metas. Evite escrever informações pessoais, confidenciais ou financeiras. Consulte as [políticas da Groq](https://groq.com/privacy-policy/).

### Atualização de uma instalação existente

Se o banco já tinha sido criado antes desta evolução, execute `database/migration-2026-11-profile-learning.sql` uma única vez no MySQL Workbench. Ela adiciona o prazo das metas e as tabelas de perfil, atividade educativa e estado das aulas; os registros existentes são preservados. Não execute essa migração novamente.

## Abrir o site

No terminal, dentro da pasta do projeto, execute:

~~~powershell
php -S localhost:8000 -t .
~~~

Depois abra http://localhost:8000/index.html no navegador. As páginas de cadastro, login e dados precisam ser acessadas pelo servidor PHP; abrir os arquivos diretamente com file:// não executa a API.

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

As tabelas financeiras e educativas usam o identificador da conta e são apagadas junto com ela. Consultas PHP usam parâmetros preparados e as rotas de gravação exigem uma sessão autenticada e token CSRF.

A preferência de tema continua neste navegador. Avatar, preferências, perfil e progresso de pessoa conectada ficam no banco; o lembrete configurado é exibido dentro do painel Cashy. E-mail e notificações push ainda não estão configurados. O progresso de visitante sem login fica somente no navegador; depois que a pessoa entra, o progresso é associado à conta. Os cadastros antigos armazenados no navegador não são importados para o MySQL.

## Recuperação de senha

A recuperação por e-mail ainda não foi configurada. O link informa essa limitação; não existe redefinição local da senha do banco. Para ativá-la, configure um provedor SMTP ou serviço transacional, domínio remetente validado, segredos no servidor, tokens de uso único com expiração e limite de tentativas.

## Organização dos arquivos

~~~text
Cashy/
├── api/                 endpoints PHP, conexão e autenticação
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
├── dashboard.html       painel pessoal
├── movimentacoes.html   entradas e saídas
├── metas.html           metas financeiras
├── perfil.html          perfil, preferências e segurança da conta
├── educacao.html        trilha, simulador, checklist e dicionário
├── curso.html           página individual de cada curso
├── privacidade.html     explicação e exclusão da conta
└── termos.html          termos do projeto
~~~

## Conteúdo educativo

O Cashy oferece dez cursos com leituras e quizzes, filtro por nível, progresso de aulas, simulador de cenários, exercícios, checklist e dicionário. As primeiras etapas priorizam orçamento, crédito, consumo e objetivos antes de aprofundar investimentos. O painel prioriza o próximo passo de aprendizagem antes do resumo financeiro. A oficina permite organizar renda, despesas, dívidas, parcelas, reservas e objetivos e guardar versões do orçamento neste navegador. Os planos não conectam contas bancárias, não são enviados ao servidor e não sincronizam entre dispositivos.

As simulações usam hipóteses informadas pela pessoa e são exercícios educativos, não previsões ou recomendações financeiras. Valores de exemplo não representam contas, produtos ou resultados reais.

Para publicar o projeto em uma hospedagem, configure uma senha própria para o banco, use HTTPS e não publique api/config.php.

## Assistente educativo

O botão do assistente aparece na página inicial, na educação, nos cursos e nas telas da conta. O navegador envia somente as mensagens recentes da conversa ao endpoint `api/chat.php`; o PHP consulta a API da Groq com instruções educativas. O histórico fica na memória da página e não é gravado no MySQL. O assistente não recebe nome, e-mail, saldo, movimentações ou metas da conta, não fornece recomendação personalizada e não consulta dados de mercado em tempo real. Não escreva informações pessoais, confidenciais ou financeiras no chat.
