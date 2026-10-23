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
3. No PowerShell, copie o exemplo com: Copy-Item api/config.example.php api/config.php.
4. Abra api/config.php e informe usuário e senha do seu MySQL. O arquivo config.php fica fora do controle de versão.
   - No XAMPP sem senha para root, o valor de password pode ficar vazio.
   - Em outras instalações, use a senha configurada no MySQL.
5. Para habilitar o assistente com IA, crie uma chave no [Google AI Studio](https://aistudio.google.com/apikey) e preencha `gemini_api_key` em `api/config.php`. A chave deve ficar somente no servidor. O modelo pode ser alterado em `gemini_model` ou pela variável de ambiente `GEMINI_MODEL`.
   - O assistente fica indisponível até a chave ser configurada.
   - O modelo padrão é `gemini-3.8-flash`, cuja página oficial informa preço gratuito na cota Free Tier. A cota tem limites e pode mudar; confira [preços e limites oficiais](https://ai.google.dev/gemini-api/docs/pricing) e [limites do Gemini API](https://ai.google.dev/gemini-api/docs/rate-limits).
   - Não vincule um projeto com faturamento ativo se quiser manter o uso limitado à cota gratuita. Quando o limite é alcançado, o assistente informa que está temporariamente indisponível.
   - As perguntas são enviadas ao Google Gemini para gerar respostas. O Cashy não envia dados da conta, movimentações nem metas. No serviço gratuito, o Google pode usar entradas e respostas para melhorar produtos e permitir revisão humana; não informe dados pessoais, confidenciais ou financeiros. Consulte os [termos oficiais do Gemini API](https://ai.google.dev/gemini-api/terms).

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
│   └── chat.php         assistente educativo via API do Google Gemini
├── database/schema.sql  criação do banco e tabelas
├── css/                 estilos, incluindo chatbot.css
├── images/              logo e ilustrações
├── js/                  interações e chamadas à API, incluindo chatbot.js
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

O botão do assistente aparece na página inicial, na educação, nos cursos e nas telas da conta. O histórico existe apenas na memória da página e não é gravado no MySQL. O endpoint envia somente as mensagens recentes da conversa, junto com instruções educativas; não busca nem encaminha dados pessoais ou financeiros da conta. Na cota gratuita do Google Gemini, as mensagens podem ser usadas para melhorar os produtos e passar por revisão humana, conforme os termos do provedor. O assistente não fornece recomendações personalizadas nem consulta dados de mercado em tempo real.
