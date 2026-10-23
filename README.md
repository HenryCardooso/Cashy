# Cashy — Gestão financeira (projeto demonstrativo)

Site introdutório para pessoas que estão começando a aprender sobre dinheiro e investimentos, desenvolvido como Trabalho de Conclusão de Curso (TCC). A proposta é explicar o básico em linguagem simples e incentivar decisões sem pressa.

## Tecnologias
- HTML5 semântico
- CSS3 (Grid, Flexbox, variáveis CSS, media queries)
- JavaScript puro (sem bibliotecas)

## Paleta
- Preto: `#050706`
- Verde bandeira principal: `#009739`
- Verde claro: `#14B957`

## Como os arquivos estão organizados

As páginas HTML ficam na raiz para facilitar a abertura e a navegação. O ponto de entrada é `index.html`. Os recursos compartilhados estão separados por tipo:

```text
Cashy/
├── index.html, login.html, dashboard.html, educacao.html, ...  páginas do site
├── css/       estilos das páginas e componentes
├── js/        interações, dados dos cursos e armazenamento local
├── images/    logo e imagens do projeto
└── README.md  guia do projeto
```

## Estrutura de arquivos
| Arquivo | Função |
|---|---|
| `index.html` | Página inicial (landing page) |
| `css/style.css` | Estilos e responsividade da página inicial |
| `js/script.js` | Menu mobile e exibição do usuário logado / botão "Sair" |
| `login.html` | Tela de login |
| `css/login.css` | Estilos da tela de login |
| `js/login.js` | Validação do formulário e criação da sessão simulada |
| `css/accessibility.css` | Foco visível, texto ampliado, link para pular conteúdo e suporte a movimento reduzido |
| `privacidade.html` | Explica armazenamento local e permite apagar os dados da conta atual |
| `js/privacidade.js` | Remoção de conta demonstrativa e dados locais da conta atual |
| `termos.html` | Termos simples para uso do projeto demonstrativo |
| `css/legal.css` | Estilos das páginas de privacidade e termos |
| `dashboard.html` | Painel pessoal exibido depois do login |
| `css/dashboard.css` | Estilos responsivos do painel |
| `js/dashboard.js` | Proteção de rota, saudação e encerramento da sessão |
| `movimentacoes.html` | Página para cadastrar, consultar, editar, filtrar, excluir e exportar movimentações |
| `metas.html` | Página própria para criar, editar, acompanhar e excluir várias metas financeiras |
| `js/workspace.js` | Sessão, gravação local e interações das páginas de movimentações e metas |
| `css/workspace.css` | Estilos das páginas independentes do painel |
| `educacao.html` | Trilha de aulas, simulador e dicionário de investimentos |
| `css/educacao.css` | Layout responsivo da área de educação |
| `js/educacao.js` | Lista de cursos, progresso, cálculo hipotético e busca no dicionário |
| `js/cursos-data.js` | Conteúdo dos oito cursos e quizzes |
| `curso.html` | Página individual reutilizável para cada curso |
| `css/curso.css` | Estilos das páginas individuais de curso |
| `js/curso.js` | Conteúdo do curso, quiz, progresso e navegação entre cursos |
| `images/logo.png` | Logo do projeto |
| `images/home-financas.svg` | Ilustração da página inicial |
| `images/ilustracao-*.svg` | Ilustrações da tela de login, educação, cursos, painel, metas, movimentações, privacidade e termos |
| `css/theme.css` / `js/theme.js` | Alternância de tema claro/escuro, com preferência lembrada neste navegador |

## Como abrir
Abra `index.html` para ver a página pública. Para testar cadastro e login, sirva a pasta em `localhost` (por exemplo, com a extensão Live Server do editor) ou publique em HTTPS; a API segura do navegador usada para proteger a senha não funciona em todos os casos ao abrir o arquivo diretamente.

## Como funciona a autenticação demonstrativa
Não há servidor ou banco de dados. A pessoa cria uma conta localmente e depois entra com o mesmo e-mail e senha. O navegador guarda um hash SHA-256 da senha no `localStorage`; a senha digitada não é gravada. O cadastro usa a API Web Crypto, por isso abra o projeto em `localhost` ou HTTPS. “Manter conectado” guarda a sessão no `localStorage`; sem marcar, a sessão usa `sessionStorage`.

Essa autenticação serve apenas para demonstração e não substitui um sistema real. SHA-256 no navegador não oferece os recursos de segurança de autenticação no servidor, armazenamento com hash apropriado e cookies seguros.

## Interações do painel
- O seletor de período mostra os meses disponíveis; resumos começam em zero e são calculados somente com os registros cadastrados pela pessoa.
- É possível cadastrar, editar, filtrar e excluir entradas e saídas; os registros podem ser exportados em CSV e ficam salvos localmente por conta.
- A pessoa pode criar, editar e excluir várias metas; metas antigas são preservadas ao atualizar o formato de armazenamento.
- O gráfico do painel compara entradas e saídas reais que a pessoa registrou no período selecionado; não há valores de exemplo.
- “Ver todas” mostra somente os registros cadastrados; a dica Cashy abre uma explicação introdutória sobre investimentos.
- A recuperação de senha troca a senha salva localmente; como não há servidor, não envia e-mail nem confirma identidade.
- Não há dados de exemplo preenchidos nem integração com banco ou serviço financeiro.

## Área de educação
- Oito cursos em páginas próprias, com explicações, quiz e navegação entre cursos; concluir exige acertar todas as perguntas.
- Filtro por nível e sequência recomendada entre cursos; o filtro organiza a trilha sem bloquear aulas.
- O progresso fica salvo no navegador, separado pelo e-mail da conta quando houver sessão.
- O simulador compara hipóteses informadas pela pessoa. As taxas não vêm de produtos ou dados de mercado.
- O checklist interativo ajuda a revisar objetivo, prazo, riscos, custos e regras de resgate; suas respostas não são recomendação.
- A área "Praticar" contém três exercícios com situações e personagens fictícios, explicações após resposta e nenhum dado de produto ou mercado.
- A área "Fontes oficiais" reúne links para materiais de educação financeira da CVM e do Banco Central, com data de conferência visível.
- O dicionário permite pesquisar termos com exemplos simples, sem depender de conexão externa.

## Observações
- O botão de tema claro/escuro está disponível em todas as páginas e guarda a escolha neste navegador.
- O conteúdo é educativo e não constitui recomendação de investimento.
- Todas as páginas incluem atalho para pular ao conteúdo; controles têm foco visível, e os menus móveis podem ser fechados com Escape.
- Formulários e atualizações dinâmicas usam rótulos, mensagens anunciadas por leitor de tela e estados acessíveis; o login também permite navegar entre abas pelo teclado.
- Texto mínimo ampliado, suporte a alto contraste e preferência por movimento reduzido.
- As páginas Privacidade e Termos explicam as limitações locais da demonstração; a página de privacidade permite apagar a conta atual e seus dados deste navegador.
- A interface usa fontes locais do dispositivo e não solicita fontes externas.

## Próximos passos sugeridos
- Back-end com banco de dados e autenticação real para sincronizar dados entre dispositivos
- Integração com serviços financeiros, somente após definir provedor, permissões e requisitos de segurança
