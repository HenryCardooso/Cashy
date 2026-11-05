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
3. Abra `api/config.php`, que já vem preparado para a conexão local. Se ele não existir, copie `api/config.example.php` com `Copy-Item api/config.example.php api/config.php`.
4. Confira host, porta, banco, usuário e senha do seu MySQL. O arquivo `config.php` fica fora do controle de versão.
   - No XAMPP sem senha para root, o valor de password pode ficar vazio.
   - Em outras instalações, use a senha configurada no MySQL.
   - O PHP que inicia o site precisa ter as extensões PDO MySQL (`pdo_mysql`), `mbstring` e cURL habilitadas.
5. Para ativar o chat com Cerebras, gere uma chave no [Cerebras Cloud Console](https://cloud.cerebras.ai/) e cole em `cerebras_api_key` dentro de `api/config.php`. A chave deve ficar somente nesse arquivo local, que não é publicado no Git. O modelo padrão é `gpt-oss-120b`.
   - A Cerebras oferece US$ 5 em créditos de avaliação por 30 dias, com método de pagamento verificado; não há cota gratuita permanente. Quando os créditos acabarem ou expirarem, a API para até a compra de novos créditos. Consulte [preços](https://www.cerebras.ai/pricing) e [limites atuais](https://inference-docs.cerebras.ai/support/rate-limits). Sem chave, o chat informa que ainda não está configurado.
   - As perguntas e o contexto recente são enviados à Cerebras. O Cashy não envia os dados da conta, movimentações ou metas. Evite escrever informações pessoais, confidenciais ou financeiras. Consulte os [termos da Cerebras](https://www.cerebras.ai/terms-of-service) e a [política de privacidade](https://www.cerebras.ai/privacy-policy).

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

As tabelas financeiras e educativas usam o identificador da conta e são apagadas junto com ela. Consultas PHP usam parâmetros preparados e as rotas de gravação exigem uma sessão autenticada e token CSRF.

A preferência de tema continua neste navegador. O progresso de visitante sem login também fica somente no navegador; depois que a pessoa entra, o progresso é associado à conta. Os cadastros antigos armazenados no navegador não são importados para o MySQL.

## Recuperação de senha

A recuperação por e-mail ainda não foi configurada. O link de recuperação informa essa limitação; não existe redefinição local da senha do banco.

## Organização dos arquivos

~~~text
Cashy/
├── api/                 endpoints PHP, conexão e autenticação
│   ├── auth.php         cadastro, login e sessão
│   ├── account.php      exclusão de conta
│   ├── chat.php         assistente educativo via Cerebras
│   ├── bootstrap.php    conexão ao banco e funções comuns da API
│   ├── education.php    progresso educativo
│   ├── goals.php        metas
│   ├── transactions.php movimentações
│   └── config.example.php  exemplo de configuração do banco
├── database/schema.sql  criação do banco e tabelas
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
├── educacao.html        trilha, simulador, checklist e dicionário
├── curso.html           página individual de cada curso
├── privacidade.html     explicação e exclusão da conta
└── termos.html          termos do projeto
~~~

## Conteúdo educativo

O Cashy oferece oito cursos com leituras e quizzes, filtro por nível, progresso de aulas, simulador de cenários, exercícios, checklist e dicionário. As simulações usam somente as hipóteses informadas pela pessoa e não são previsões ou recomendações de investimento.

Para publicar o projeto em uma hospedagem, configure uma senha própria para o banco, use HTTPS e não publique api/config.php.

## Assistente educativo

O botão do assistente aparece na página inicial, na educação, nos cursos e nas telas da conta. O navegador envia somente as mensagens recentes da conversa ao endpoint `api/chat.php`; o PHP consulta a API da Cerebras com instruções educativas. O histórico fica na memória da página e não é gravado no MySQL. O assistente não recebe nome, e-mail, saldo, movimentações ou metas da conta, não fornece recomendação personalizada e não consulta dados de mercado em tempo real. Não escreva informações pessoais, confidenciais ou financeiras no chat.
