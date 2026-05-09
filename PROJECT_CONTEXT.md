# PROJECT_CONTEXT

Briefing pra Claude Code que está abrindo esse repositório pela primeira vez. Leia inteiro antes de qualquer ação. As outras docs (ADMIN_GUIDE, SUPERVISOR_GUIDE, CONTENT_GUIDE) entram em detalhe; este arquivo te situa.

## 1. Visão do produto

**Trilha Empreendedora** é uma plataforma mobile-first em português brasileiro que ajuda microempreendedores brasileiros a descobrirem o próximo passo concreto do negócio. Inspirada na metodologia do Projeto Pescadores. Princípio central: ninguém empreende em geral, empreende numa situação específica. O usuário responde 35 perguntas curtas em 5 minutos, recebe um arquétipo (1 entre 12) que descreve a situação dele, e ganha uma trilha de 30 dias com 4 missões práticas (uma por semana). É gratuito, não vende crédito, não busca lucro. Mantido por doação voluntária via Pix.

Público: empreendedora ou empreendedor com baixa renda, geralmente entre R$ 500 e R$ 7.000 de faturamento mensal, com celular Android simples e franquia de dados limitada. Provavelmente vende comida, beleza, costura, artesanato, serviços de bairro. Pode estar começando do zero ou tentando profissionalizar bico antigo.

## 2. Stack técnico

- **Frontend**: Vite 5 + React 18 (JavaScript, não TypeScript)
- **Roteamento**: React Router v6 com lazy loading por rota
- **Estilo**: Tailwind CSS 3 com paleta custom (paper #FFFDF7, primary #4F7CAC, etc.) e fontes Nunito + Patrick Hand
- **Backend**: Supabase (Postgres + Storage + Auth para supervisores)
- **Auth entrepreneur**: nenhum. Plan_token UUID em localStorage, enviado via header `x-plan-token`, validado por RLS
- **Auth supervisor**: Supabase Auth via magic link (email)
- **Deploy**: Vercel (configurado mas não em produção ainda, .env aponta pra projeto Supabase real)
- **Sem TypeScript, sem framework de teste** (testes ad-hoc com Node escrito à mão), sem CSS-in-JS, sem state management externo (useState + sessionStorage + localStorage)

Bundle: ~64 KB main + 44 KB vendor-react + 51 KB vendor-supabase + 4 KB vendor-router (todos gzip). Cache friendly via vendor split.

## 3. Estrutura do projeto

```
trilha-empreendedora/
├── src/
│   ├── App.jsx                    Roteamento (24 rotas, maioria lazy)
│   ├── main.jsx                   Bootstrap React + Router
│   ├── components/                Componentes compartilhados
│   │   ├── Layout.jsx             Container mobile + TopNav (back arrow) + BottomNav
│   │   ├── BottomNav.jsx          5 tabs fixas (Início, Trilha, Conteúdos, Casos, Ajuda)
│   │   ├── Button.jsx             Variants: primary, secondary, ghost
│   │   ├── Card.jsx, PageHeader.jsx, ProgressBar.jsx, FilterChips.jsx
│   │   ├── Sketches.jsx           18 SVGs inline em estilo notebook (HeroNotebook, Lightbulb, OpenBook, etc.)
│   │   ├── ShareSheet.jsx + ShareBanner.jsx     Compartilhamento social
│   │   ├── DonationSheet.jsx + DonationBanner.jsx   Banner Pix configurável via admin
│   │   └── MiniTrilha.jsx         Componente genérico que renderiza qualquer mini-quiz
│   ├── pages/                     21 páginas roteadas
│   │   ├── Home, Diagnostic, Results, SavePlan, MyPlan          Fluxo principal
│   │   ├── TaskDetail, LearningResponse, TaskCompanion          Loop de tarefa
│   │   ├── Resources, ResourceDetail, CaseLibrary, CaseDetailPage, Opportunities    Bibliotecas
│   │   ├── HelpRequest, OfferHelp, BadgeCard                    Rede + cartão
│   │   ├── Formalization, MiniTrilhaPage                        Mini-trilhas
│   │   ├── SupervisorLogin, SupervisorDashboard, SupervisorReview   Painel supervisor
│   │   └── AdminDashboard, AdminPreview, AdminDonations, SourceRefresh  Painel admin
│   ├── data/                      CONTEÚDO. 15 arquivos JSON. Editáveis sem mexer em código.
│   │   ├── archetypes.json, cases.json, taskTemplates.json, taskCompanions.json
│   │   ├── resources.json, opportunities.json, feedbackTemplates.json, rubrics.json
│   │   ├── formalizationGuides.json, formalizationQuestions.json
│   │   ├── questions.json, scoringRules.json
│   │   ├── miniTrilhas/precificacao.json, capital.json, canais.json
│   │   └── (config.json, roadmaps.json: vestígios vazios da Fase 1, ignorados)
│   ├── utils/
│   │   ├── scoring.js             Engine do diagnóstico (rank por ratio score/max)
│   │   ├── scoring.test.mjs       11 testes Node-runnable
│   │   ├── miniTrilhaScoring.js   Engine genérico das mini-trilhas
│   │   ├── taskRouting.js         submitTask + lógica de auto-aprovação
│   │   ├── imageCompress.js       Canvas-based compression (1280px JPEG 0.78)
│   │   └── useSupervisorSession.js   Hook auth do supervisor
│   ├── services/
│   │   ├── supabaseClient.js      getSupabase(planToken) + getAuthClient() + plan_token helpers
│   │   └── contentService.js      Queries pra detectar gaps de conteúdo (auth-only)
│   └── styles/index.css           Tailwind base + body bg-paper + dot pattern
├── scripts/
│   └── validate-content.mjs       Valida todos os JSONs em src/data (campos, enums, refs cruzadas)
├── supabase/
│   ├── migrations/                4 migrations SQL re-executáveis (DROP IF EXISTS antes de CREATE POLICY)
│   │   ├── 0001_init.sql              users, diagnostics, plans, tasks, submissions, reviews, help_requests
│   │   ├── 0002_supervisors.sql       supervisors, feedback, rubrics, volunteers, matches, gaps, reviews
│   │   ├── 0003_donations.sql         donation_campaigns + RLS
│   │   └── 0004_evidence_multi.sql    converte evidence_url pra TEXT[] (até 3 fotos por submissão)
│   └── README.md                  Como aplicar migrations + criar bucket task-evidence
├── package.json                   scripts: dev, build, preview, validate-content, test-scoring
├── .env (gitignored), .env.example
├── ADMIN_GUIDE.md, SUPERVISOR_GUIDE.md, CONTENT_GUIDE.md, README.md
└── PROJECT_CONTEXT.md             (este arquivo)
```

## 4. Estado atual

### Fase 1 (scaffold) (completa)
Vite + React + Tailwind + paleta custom + tokens de design + 16 placeholders de página + Supabase client base + estrutura de pastas. Tudo do scaffold inicial original.

### Fase 2 (diagnóstico + scoring + 1 arquétipo) (completa)
- 35 perguntas autorizadas em `questions.json`
- Engine de scoring em `utils/scoring.js`
- 1 arquétipo full (vende_sem_lucro) + 11 stubs
- `scoringRules.json` com tieBreakOrder e fallback
- Diagnostic.jsx (one-question-per-screen, sessionStorage, auto-advance)
- Results.jsx renderizando arquétipo + roadmap
- 11 testes unitários Node

### Fase 3 (persistência + loop de tarefa) (completa)
- Migration 0001 com 7 tabelas e RLS por plan_token
- SavePlan flow (insert users + diagnostics + plans + tasks)
- MyPlan com badges de status
- TaskDetail com submission form
- LearningResponse com auto-aprovação
- 1 task template completa (anotar_7_dias)

### Fase 4 (escala de conteúdo + supervisão + biblioteca) (completa)
- 12 arquétipos ativos (todos os 11 stubs preenchidos)
- 27 task templates
- 17 companheiros de tarefa (Marlene tem 4 capítulos, Amina 4, mais 9 outros)
- 12 cases ativos
- 20 conteúdos ativos
- 10 oportunidades
- 15 modelos de retorno + 3 rubricas
- Migration 0002 com supervisores + feedback + rubricas + voluntários + content gaps + reviews
- SupervisorLogin + SupervisorDashboard + SupervisorReview funcionando
- AdminDashboard + AdminPreview + SourceRefresh + AdminDonations
- BadgeCard com disclaimer obrigatório

### Fase 4.5 (refinamento) (completa)
- Visual warmth: dot pattern, sketches inline, Patrick Hand acentos, cards com tinta de cor
- BottomNav universal escondendo em fluxos focados
- TopNav back button universal
- ShareSheet + ShareBanner pra recomendar
- DonationBanner + DonationSheet com pipeline Pix (banner desabilitado por default, configurável via /admin/doacoes)
- Migration 0003 (donation_campaigns) e 0004 (multi photo evidence)
- Foto: capture câmera direto + compressão client-side + até 3 fotos + thumbnails removíveis
- Mini-trilhas: formalização (PF/MEI/CNPJ), precificação, capital, canais
- Diagnóstico desenviesado: scoring agora ranqueia por ratio score/max possível, não absoluto
- Code splitting + vendor split: main bundle 64 KB gzip
- Validador de conteúdo (`npm run validate-content`)

### O que falta agora
- Aplicar as 4 migrations no Supabase real (faltava só 0004 da última checagem)
- Criar bucket `task-evidence` no Storage
- Bootstrap do primeiro admin (insert manual em `supervisors`)
- Deploy Vercel (env vars, redirect Auth)
- Smoke-test no celular real em rede 4G
- Confirmar Sebrae/BCB URLs antes de listar como `sourceStatus: active` (hoje vários estão como `needs_review`)

## 5. Modelo de conteúdo

15 arquivos JSON. Validador percorre todos com `npm run validate-content`. Dois arquivos vestigiais (`config.json`, `roadmaps.json`) são ignorados.

| Arquivo | Itens | O que é |
|---|---|---|
| archetypes.json | 12 | Os 12 perfis possíveis do diagnóstico |
| taskTemplates.json | 27 | Tarefas referenciadas pelos roadmaps |
| taskCompanions.json | 17 | Histórias narrativas de personas fazendo tarefas |
| cases.json | 12 | Casos compostos fictícios pedagógicos |
| resources.json | 20 | Materiais (Trilha original + Sebrae + BCB + setoriais) |
| opportunities.json | 10 | Cursos, mentorias, programas |
| feedbackTemplates.json | 15 | Modelos de retorno do supervisor |
| rubrics.json | 3 | Rubricas de revisão (caixa, preço, capital) |
| formalizationGuides.json | 3 | Guias PF, MEI, CNPJ |
| formalizationQuestions.json | 5 | Quiz de formalização |
| questions.json | 35 | Perguntas do diagnóstico principal |
| scoringRules.json | 1 obj | tieBreakOrder, fallbackArchetype, thresholds |
| miniTrilhas/precificacao.json | 5 perguntas + 3 guias | Mini-quiz de precificação |
| miniTrilhas/capital.json | 5 + 3 | Prontidão pra empréstimo |
| miniTrilhas/canais.json | 5 + 3 | Vender online ou não |

### Schema: archetypes.json (entry)
```json
{
  "id": "vende_sem_lucro",                  // string única
  "name": "Vende, mas não sabe se lucra",   // exibido no diagnóstico
  "shortDescription": "Você já vende...",
  "commonPain": "Confunde faturamento com lucro...",
  "typicalMistakes": ["...", "...", "..."],  // array de 3
  "firstTaskId": "task_anotar_7_dias",       // FK -> taskTemplates.id
  "avoidNow": "Evite tomar crédito...",
  "expectedLearning": "Vender não é o mesmo...",
  "roadmap30d": [                            // array de 4 weeks
    { "week": 1, "title": "...", "tasks": ["task_id"] },
    ...
  ],
  "recommendedResources": ["res_id"],        // FKs -> resources.id
  "recommendedCases": ["case_id"],           // FKs -> cases.id
  "recommendedOpportunities": ["opp_id"],
  "supervisionLevel": "light",               // light | elevated
  "warningFlags": ["finance_blind"],         // strings livres, usadas pra alertar supervisor
  "contentVersion": "1.0",
  "status": "active"                         // active | draft
}
```

### Schema: cases.json (entry)
```json
{
  "id": "case_dona_marlene_quitanda",
  "title": "Dona Marlene e a quitanda...",
  "region": "Brasil, Olinda (PE)",
  "sector": "alimentacao",
  "archetypes": ["vende_sem_lucro"],         // FKs -> archetypes.id
  "readingTime": "4 min",
  "dilemma": "Vende todo dia, mas...",       // 1 frase
  "situation": "Dona Marlene tem...",        // contexto
  "options": ["...", "...", "..."],          // ≥ 2
  "tradeoffs": "Empréstimo amplia...",
  "lessonLearned": "Faturamento alto não é lucro...",
  "tropicalizedLesson": "Em comunidades urbanas no Brasil...",
  "practicalTask": "task_anotar_7_dias",     // FK -> taskTemplates.id
  "relatedResources": ["res_id"],            // FKs
  "helpTrigger": "Se depois de anotar 7 dias...",
  "caseAuthenticityType": "fictionalized_composite_case",
  "status": "active"
}
```

### Schema: taskTemplates.json (entry)
```json
{
  "id": "task_anotar_7_dias",
  "title": "Anotar entradas e saídas por 7 dias",
  "week": 1,                                 // semana do roadmap (1-4)
  "archetypeId": "vende_sem_lucro",          // arquétipo originador
  "action": "Durante os próximos 7 dias...",
  "purpose": "Tornar visível o dinheiro...",
  "expectedLearning": "Vender não é o mesmo que lucrar...",
  "reflectionQuestions": ["...", "...", "..."],   // ≥ 2
  "commonMistakes": ["...", "...", "..."],         // ≥ 2
  "evidenceType": "optional_text_or_image",
  "evidenceRequired": false,
  "reviewLevel": "light",                    // light = auto-aprovação possível, elevated = revisão obrigatória
  "active": true,
  "version": "1.0"
}
```

### Schema: taskCompanions.json (entry)
```json
{
  "id": "companion_anotar_7_dias_marlene",
  "taskTemplateId": "task_anotar_7_dias",    // FK
  "archetypeId": "vende_sem_lucro",          // FK
  "personaName": "Dona Marlene",             // reusar persona dos cases
  "region": "Brasil, Olinda (PE)",
  "personaContext": "Tem uma quitanda...",
  "stumbles": [                              // ≥ 2 momentos
    { "moment": "Dia 1", "whatHappened": "...", "whatHelped": "..." },
    ...
  ],
  "breakthrough": "No domingo de noite...",  // virada de chave
  "outcome": "Marlene não mexeu em preço...", // o que veio depois
  "whenToAskForHelp": "Se depois de 7 dias você ainda confundir...",
  "relatedCases": ["case_id"],
  "relatedResources": ["res_id"],
  "caseAuthenticityType": "fictionalized_composite_case",
  "status": "active",
  "version": "1.0"
}
```

### Enums conhecidos (a validação pega valores fora do enum)

```
archetype.status:           active | draft
archetype.supervisionLevel: light | elevated
case.status:                active | draft
case.caseAuthenticityType:  anonymized_local_case | fictionalized_composite_case | teaching_scenario_inspired_by_multiple_sources
companion.status:           active | draft
companion.caseAuthenticityType: (mesmo do case)
task.evidenceType:          optional_text | optional_image | optional_text_or_image | required_text | required_image
task.reviewLevel:           light | elevated
resource.status:            active | draft
resource.type:              guide | template | external_guide | external_portal | community
resource.sourceStatus:      active | needs_review | broken_link | outdated
opportunity.status:         active | draft
question.type:              single_choice | multi_choice | text_short | number
feedback.decision:          aprovada | precisa_ajustar | travada | encaminhada
```

### Cross-references checadas pelo validador
```
archetype.firstTaskId, archetype.roadmap30d[].tasks[]  -> taskTemplates.id
archetype.recommendedResources[]                       -> resources.id
archetype.recommendedCases[]                           -> cases.id
archetype.recommendedOpportunities[]                   -> opportunities.id
case.practicalTask                                     -> taskTemplates.id
case.relatedResources[]                                -> resources.id
case.archetypes[]                                      -> archetypes.id
companion.taskTemplateId                               -> taskTemplates.id
companion.archetypeId                                  -> archetypes.id
companion.relatedCases[]                               -> cases.id
companion.relatedResources[]                           -> resources.id
task.archetypeId                                       -> archetypes.id
resource.recommendedArchetypes[]                       -> archetypes.id
opportunity.recommendedArchetypes[]                    -> archetypes.id
feedback.archetypeId, feedback.taskTemplateId          -> archetypes.id, taskTemplates.id (ou null)
rubric.appliesTo                                       -> taskTemplates.id (warn se não bater)
scoringRules.tieBreakOrder[], fallbackArchetype        -> archetypes.id
questions.options.scoring.archetypes keys              -> archetypes.id
miniTrilha.tieBreakOrder, tabLabels keys, options.score keys -> guides.id da mesma trilha
```

## 6. Convenções de tom e escrita

Todo conteúdo voltado pro empreendedor segue estas regras. Sem exceção.

- **Português brasileiro coloquial.** Frases curtas. Palavras do dia a dia. Sem "vossa mercê", sem "outrossim", sem "destarte".
- **Segunda pessoa direta.** "Você anotou os 7 dias?". Não "o(a) usuário(a) deve...". Não fala da pessoa em terceira.
- **Sem em-dashes.** Use ponto, vírgula, hífen com espaço, parênteses, dois-pontos. Em-dash atrapalha leitura no celular.
- **Sem anglicismos.** Evite: trade-off, checklist, feedback, engajamento, tráfego pago, marketing digital. Use: o que pesa em cada caminho, lista, retorno, ninguém curte, anúncios pagos, como divulgar online.
- **Sem jargão consultivo.** Evite: stakeholder, KPI, ROI, alavancagem, escalável. Use: pessoa interessada, número que importa, retorno, crescer, dá pra crescer.
- **Exemplos com números concretos.** "R$ 260 sobrou" não "uma quantia razoável". "12 potes mínimos" não "alguma quantidade". "5 minutos" não "rápido".
- **Tropicalizar contexto importado.** Se a história vem de outro país, sempre adicionar como se aplica no Brasil (CEASA, MEI, Pix, WhatsApp, feira de bairro).
- **Sem promessas.** Não: "você vai ter sucesso", "esse curso vai mudar sua vida", "garantimos crédito". Sim: "isso ajuda a destravar", "tem chance de funcionar", "vale tentar".
- **Tom acolhedor, não condescendente.** Se a pessoa errou, conta a verdade sem suavizar demais nem culpar. "O preço estava abaixo do custo. Vamos ajustar" é bom. "Tudo bem, todo mundo erra!" é fraco.

### Exemplo: case (excerto de case_dona_marlene_quitanda)
> **Situação.** Dona Marlene tem uma quitanda em Olinda (PE) há 6 anos. Vende verduras, frutas, ovos e alguns produtos de mercearia. As pessoas elogiam, o movimento é constante. Mesmo assim, ela paga as contas da casa atrasada quase todo mês. Ela acha que é por causa dos preços do CEASA, mas nunca calculou o custo real de cada caixa.
>
> **O dilema.** Vende todo dia, mas o caixa nunca fecha. Está faltando entender o que é faturamento e o que é lucro.
>
> **O que esse caso ensina.** Faturamento alto não é lucro. Sem anotar entrada e saída, ninguém sabe se o negócio dá ou não dá dinheiro.
>
> **Como isso se aplica no Brasil.** Em comunidades urbanas no Brasil, é comum o pequeno comércio operar no fluxo: vende de manhã, repõe à tarde, paga o fornecedor amanhã. Esse fluxo esconde o custo. Anotar 7 dias quebra o efeito 'parece que está dando' e mostra o número real, geralmente bem abaixo do esperado.

### Exemplo: companion (excerto de companion_anotar_7_dias_marlene)
> **Quem é.** Tem uma quitanda no bairro há 6 anos. Vende verduras, frutas e ovos. Decidiu anotar entrada e saída por 7 dias depois de perceber que vendia muito mas o caixa nunca fechava no fim do mês.
>
> **Dia 1.**  
> *O que aconteceu.* Começou o dia confiante. Anotou todas as vendas até o almoço. Mas só lembrou de anotar o que pagou na padaria do bairro pra revender pão quando ia dormir. Não tinha mais o valor exato. Anotou 'mais ou menos R$ 12'.  
> *O que ajudou.* Colocou um caderninho ao lado da maquininha, com uma caneta presa por barbante. Combinou com ela mesma uma regra: só anota quando o dinheiro entra ou sai, na hora. Nunca depois.
>
> **A virada de chave.** No domingo de noite, somou tudo: entraram R$ 1.480, saíram R$ 1.220. Sobrou R$ 260, e ela jurava que tinha 'uns R$ 800' no fim de cada semana. A diferença não estava na venda. Estava em pequenos custos que ela não enxergava: embalagem, sacolas, gelo pro peixe, taxa de cartão.

Note o tom: presente, narrativo, números concretos, sem moral da história explícita, sem jargão.

## 7. Validação

```bash
npm run validate-content
```

Roda em ~1 segundo. Output:
- `✓ All content valid` quando passa.
- `✗ N errors:` lista cada erro com `arquivo | id-do-item | descrição`.

Checa, em cada arquivo:
- Sintaxe JSON
- Campos obrigatórios (varia por tipo, status active exige mais que draft)
- Enums (qualquer string fora do enum permitido)
- IDs únicos dentro do arquivo
- Referências cruzadas resolvem (ver tabela acima)
- Datas em YYYY-MM-DD (warning, não bloqueia)
- Quantidades mínimas em arrays (warning)

**Regra:** validador verde = pode commitar. Validador vermelho = NÃO commitar antes de arrumar. Em CI futuro, o build do Vercel vai bloquear deploy se o validador falhar.

Outro comando útil:
```bash
npm run test-scoring
```
Roda os 11 testes unitários do scoring engine. Use depois de mexer em `questions.json` (pesos, opções) ou `scoringRules.json`.

## 8. Como atualizar conteúdo

Conteúdo NÃO é editado nesta sessão de Claude Code. O fluxo é:

1. **Conversa separada no Claude.ai** (Opus): você pede ajuda pra escrever ou expandir conteúdo. Resultado vem em MD ou diretamente em JSON.
2. **Você cola o JSON** no arquivo certo em `src/data/`. Se tiver muitas entradas, cola substituindo o array todo. Se for uma entrada nova, adiciona antes do `]` final.
3. **`npm run validate-content`** localmente. Se passar, segue.
4. **Commit + deploy.**

Por que essa separação? Porque escrever conteúdo em prosa é uma sessão de horas de trabalho criativo, não cabe na janela do Claude Code que está concentrado em código. E porque o conteúdo se beneficia de revisão humana editorial antes de virar PR.

### Pra Claude Code: o que fazer com pedidos de conteúdo

Se o usuário pedir "expanda esse caso" ou "escreva um companheiro novo" diretamente nessa sessão, você PODE responder, mas:

- **Lembre o usuário** que conteúdo costuma ser desenvolvido fora desta sessão. Esta aqui é melhor pra mecânica/estrutura.
- Se for pedido pequeno (1 entry, ajuste editorial), pode fazer aqui.
- Se for grande (vários cases, série de companheiros), sugira fazer no Claude.ai e mandar o JSON pronto pra esta sessão validar e integrar.
- **Sempre** rode `npm run validate-content` depois de qualquer mudança em `src/data/`.
- **Sempre** siga as regras de tom da seção 6.

## 9. Decisões arquiteturais relevantes

### Conta leve via plan_token
Empreendedor não tem login com senha. Quando salva o plano pela primeira vez, o cliente gera um UUID v4 (`plan_token`) e armazena em `localStorage`. Toda chamada Supabase do empreendedor passa esse token via header `x-plan-token`. RLS no Postgres confere o token contra `users.plan_token`. Se a pessoa limpar localStorage ou trocar de celular, perde o plano (não tem recuperação por enquanto). Tradeoff: usabilidade alta, baixo atrito, mas zero recuperação. Para um MVP de público com baixa renda, foi a escolha certa.

### Supabase Auth só pra supervisor
Supervisores e admins usam Supabase Auth (magic link via email). A tabela `supervisors` mapeia `auth.uid()` para um papel (`supervisor` | `admin`). RLS nas tabelas dá acesso adicional pra esses papéis (sem afetar o RLS por plan_token do empreendedor).

### Conteúdo em JSON modular, não em DB
Decisão consciente: archetypes, cases, tasks, companions etc. vivem como JSON no repositório, não em tabelas Postgres. Vantagens:
- Versionamento via git (qualquer mudança vira commit)
- Code review natural (PR mostra diff de conteúdo)
- Sem migration pra mudar conteúdo
- Validador estático (`validate-content`) pega bug antes de deploy
- Bundle do app inclui o conteúdo, sem round-trip ao banco pra carregar

Desvantagens:
- Admin não pode editar via UI (precisa editar JSON + deploy)
- Conteúdo cresce o bundle (~50 KB de JSON gzip hoje, aceitável)
- Mudança de conteúdo exige redeploy

Para MVP é a escolha certa. Quando passar de 200 itens ou tiver editor não-técnico operando, vale migrar pra DB.

### Mobile-first com max-w-md
`Layout.jsx` envolve tudo em `max-w-md` (~448px). Em desktop, o app aparece centralizado num "fone na tela". Pattern dos pontos atrás dele dá sensação de papel. Funciona bem em mobile real (a largura efetiva é a da tela) e em desktop (vira preview).

### Sketches inline em SVG
18 SVGs em `components/Sketches.jsx`, todos no estilo "linha à mão" com paleta da Trilha. Tudo inline (sem arquivos `.svg` separados, sem dependência de fonte de ícones). Custo: ~3 KB no bundle. Vantagem: pode aceitar `className` e mudar cor via CSS.

### Code splitting por rota + vendor split
Páginas core (Home, Diagnostic, Results, SavePlan, MyPlan, TaskDetail, LearningResponse, TaskCompanion) são eager. Tudo de admin/supervisor + bibliotecas (Resources, Cases, Opportunities, formalização) é lazy via `React.lazy`. Vendor splitting separa react, supabase-js, react-router em chunks próprios. Resultado: visita repetida só baixa o app code que mudou.

### Pix manual, sem gateway
Banner de doação (configurável via admin) mostra chave Pix e QR. NÃO processa pagamento. Quando precisar processar de verdade, integra com PSP (Mercado Pago, Asaas) e adiciona migration nova com `donation_transactions`. Decisão pelo MVP: doação voluntária com fricção mínima do nosso lado.

## 10. O que NÃO está no MVP

Pra Claude Code não sugerir por engano. Nada disso é prioridade agora:

- **AI tutor / chat com IA** dentro da app pra empreendedor. Linha vermelha: a Trilha é educativa estruturada, não conversação.
- **Processamento de pagamento.** Pix é só visualização da chave. Sem PSP, sem cobrança recorrente, sem assinatura.
- **Push notifications.** Sem service worker, sem Firebase, sem PWA push. Engajamento por hora é só via WhatsApp manual da rede de voluntários.
- **Gamificação pesada.** Existe um "cartão" simples (BadgeCard) com 3 níveis (diagnóstico concluído / primeira tarefa / 30 dias completos). Sem pontos, sem leaderboard, sem badges colecionáveis. Decisão consciente: público adulto profissional, gamificação infantil afasta.
- **Marketplace.** A app não vende nada, não conecta venda entre usuários, não tem catálogo público.
- **Real-time chat com supervisor.** Voluntário responde no zap manualmente (link gerado pelo supervisor). Nada in-app.
- **Mobile app nativo.** É web mobile-first. PWA é a próxima parada se for o caso, não app nativa iOS/Android.
- **Editor de conteúdo no admin.** Conteúdo edita-se via JSON no repositório. Quem opera admin hoje precisa saber abrir um arquivo de texto ou pedir ajuda pra alguém que sabe.
- **Refresh automático de conteúdo externo.** Sem job que vai checar URLs do Sebrae/BCB pra ver se mudaram. Admin marca manualmente como `needs_review`.
- **Multi-language.** Português brasileiro, ponto. Toda string voltada pro usuário está em PT-BR.
- **Onboarding tour, tutorial in-app.** O fluxo é o tutorial.

## 11. Próximos passos prioritários

Em ordem de importância. Quando o usuário abrir uma sessão pedindo "o que fazer", ofereça uma destas:

1. **Aplicar migrations pendentes no Supabase real.** A última checagem confirmou que migrations 1, 2, 3 estavam aplicadas. Falta confirmar 4 (multi-photo evidence). Verificar com query `\d task_submissions` se `evidence_url` é `text[]`.
2. **Criar bucket `task-evidence`** no Storage do Supabase (instruções em `supabase/README.md`). Sem isso, upload de foto na tarefa quebra.
3. **Bootstrap do primeiro admin.** Login em `/supervisor/login` cria a `auth.user`. Depois `INSERT INTO supervisors (user_id, email, name, role) VALUES (...,'admin')` no SQL editor pra promover.
4. **Smoke-test no celular real** em rede 4G, com foto via câmera, fluxo completo do diagnóstico até auto-aprovação.
5. **Deploy Vercel.** Env vars + atualizar Site URL e Redirect URL no Supabase Auth.
6. **Verificar URLs externas** (Sebrae, BCB) em `resources.json` e `opportunities.json`. Hoje vários estão com `sourceStatus: needs_review` porque não confirmei se a URL exata existe. Quando confirmar, mudar pra `active`.
7. **Conteúdo: arquétipos secundários menos cobertos.** `digital_antes_da_base` reusa tarefas de outros, ainda não tem peso de scoring (max 0). Decisão pendente: dar peso ou aceitar como "arquétipo só por afinidade de tarefa".
8. **Conteúdo: companheiros pra semanas 2-4 dos arquétipos não-Marlene-não-Amina.** Hoje só Marlene tem o arco completo. Outros têm só semana 1.
9. **Telemetria de uso real.** Nada implementado. Precisaria definir o que medir antes de codar (tempo no diagnóstico, abandono em pergunta X, conclusão de tarefas, etc.).
10. **PWA + offline.** Não está em nenhuma fase. Sugestão se o público ficar muito mobile-com-internet-instável.

## 12. Comandos rápidos

```bash
# Desenvolvimento
npm install                         # instalar deps (uma vez)
npm run dev                         # servidor local em :5173 (ou :5174 se ocupado)
npm run build                       # build de produção (verificar tamanho de bundle)
npm run preview                     # preview do build

# Qualidade
npm run validate-content            # valida todos os JSONs em src/data/
npm run test-scoring                # 11 testes do diagnóstico
```

```bash
# Smoke-test estático rápido (Python, não exige nada além de python3)
python3 -c "import json, glob; [json.load(open(f)) for f in glob.glob('src/data/**/*.json', recursive=True)]; print('JSON válido')"
```

```bash
# Supabase (quando o CLI estiver instalado)
supabase db push                    # aplica migrations
supabase functions deploy           # deploy de edge functions (não usadas hoje)
```

## 13. Quando perguntar antes de agir

Estas situações exigem confirmação do usuário antes de você executar:

- Deletar entradas de conteúdo (não basta marcar como `draft`, vai apagar mesmo).
- Mudar pesos do scoring (`questions.json`) ou regras (`scoringRules.json`). Pode mudar quem vai pra qual arquétipo. Sempre rodar `npm run test-scoring` depois.
- Mudar schema (adicionar/remover campo num JSON). Quebra o validador e provavelmente quebra páginas que esperam o campo.
- Aplicar nova migration no Supabase real (irreversível em Postgres).
- Renomear ID de qualquer entrada (quebra referências cruzadas).
- Push pra repo remoto (não tem repo configurado ainda, mas se tiver no futuro).

Se o pedido cabe nesse grupo, confirme. Se é refinamento puramente local (texto, layout, sketch), pode seguir.
