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

---

## 14. Atualizações pós-v1 (estado atual de produção)

Este bloco resume o que mudou depois da v1 deste documento. As seções 1–13 acima ainda descrevem a arquitetura essencial; aqui ficam só os deltas relevantes.

### Deploy + domínio

- **Site no ar:** `https://trilhaempreendedora.com.br` (apex) e `www` redirecionando pro apex. `https://trilha-empreendedora.vercel.app` ainda funciona e tem 301 pro domínio próprio (via `vercel.json`).
- **GitHub:** repositório público em `https://github.com/cfrccfrccfrc-art/trilha-empreendedora`. Auto-deploy a cada push pra `main`.
- **Vercel project:** `cfrccfrccfrc-arts-projects/trilha-empreendedora`. Domínios apex + www adicionados via CLI.
- **DNS:** Registro.br com 2 A records pra `76.76.21.21` (apex + www). SSL provisionado pelo Vercel via Let's Encrypt.
- **Migrations Supabase aplicadas:** 0001, 0002, 0003, 0004, 0005 (user_case_submissions), 0006 (client_events).
- **Bucket `task-evidence`** criado no Storage.
- **1º admin** existe na tabela `supervisors` (role=admin, active=true).

### Arquétipos: agora 13 (não 12)

Novo arquétipo `negocio_consolidado` ("Tenho o básico no lugar, agora é decidir onde apostar") roteia quem já tem fundamentos (>1 ano de negócio, finanças controladas, formalização, presença online regular). Trilha leve de reflexão estratégica em vez de fundamentos básicos, com Pescadores handoff prominente.

Os 13 `name` foram trocados de rótulos descritivos pra **quotes em 1ª pessoa entre aspas** (ex: "Vendo todo dia, mas no fim do mês não sobra"). Schema.name agora guarda a quote com aspas embutidas. Tudo que renderiza `{archetype.name}` mostra a quote direto.

### Novas tasks estratégicas (4)

- `task_mapear_proximo_gargalo` (W1 negocio_consolidado)
- `task_5_movimentos_estrategicos` (W2)
- `task_conversar_negocios_pares` (W3)
- `task_decidir_1_aposta_6m` (W4)

Total geral (após sessões de 09-10/06/2026): **39 task templates ativos, 42 companions, 15 archetypes ativos, 35 cases, 21 resources, 11 opportunities — 163 itens curados, 36 perguntas no diagnóstico**.

### Personas dos cases ficaram brasileiras

3 cases adaptados estrangeiros foram rebatizados (Keisha→Joana/Aracaju, Amina→Aline/Teresina, Priya→Patrícia/Florianópolis). 8 companions correspondentes seguiram. IDs preservados (slugs internos não mudam).

Nova persona high-tech: **Vinícius** (Recife, estudante + iFood + faz sites) em `case_vinicius_websites_b2b` + `companion_listar_compradores_locais_vinicius`. Cobre o arquétipo `potencial_b2b_local`.

### Resources com body completo

14 Trilha originais ganharam campo `body` (array de parágrafos com `**negrito**` markdown leve). Renderiza expandido em `/conteudos/<id>` como "Guia completo".

Schema novo: `body` (array opcional de strings) e `searchHint` (string opcional). Validador atualizado.

Links externos Sebrae + BCB todos com deep links reais (não mais homepage). `sourceStatus` desses 5 saiu de `needs_review` pra `active`.

### Nova feature: contribuir caso aos 30 dias

Rota `/minha-historia` (MyStory.jsx) onde empreendedor que completou 30 dias pode enviar sua história estruturada (business_short, biggest_change, favorite_week, difficulty, result_concrete, message_to_others + consentimentos). Salva em `user_case_submissions` (migration 0005). Admin revisa em `/admin/historias`, move status (submitted → in_review → anonymized → published).

CTAs disparam em BadgeCard nível 3 (30 dias completos) e em MyPlan quando progress=100%.

Schema enum: `caseAuthenticityType` aceita `user_submitted_anonymized`.

### Pescadores: parceria oficial integrada

Componente `PescadoresHandoff` com 5 variantes (`onboarding`, `soft`, `stuck`, `celebrate`, `helprequest`, `strategic`). Logo oficial em `public/pescadores-logo.jpg` (arquivo fornecido pelo dono). Aparece em 6 telas: Home (variant onboarding), Results (apenas pra `negocio_consolidado`, variant strategic), HelpRequest (helprequest, 2×), LearningResponse (stuck, quando review.review_status é "precisa_ajustar" ou "travada"), MyPlan (soft), BadgeCard (celebrate, nível 3).

Link sempre externo `https://projetopescadores.com.br/contato`, sempre opcional, sempre com label "gratuito + parceiro + externo à Trilha".

Recursos `res_pescadoras_rede` (URL real do parceiro) e `res_pescadoras_metodologia` (renomeado pra "Princípios para empreender com pouco capital" — neutro).

### Telemetria (migration 0006 + service)

Tabela `client_events` (event_type, plan_token, page, meta jsonb, created_at). `src/services/telemetry.js` com `track()` que batchea em 1.5s. RLS: insert livre (anon+auth), select só admin.

Eventos chave plumbados em ~12 pontos:
- `home_view`, `diagnostic_started`, `diagnostic_completed`, `results_view`
- `plan_saved`, `task_submitted`, `story_submitted`
- `pescadores_clicked`, `share_opened`, `share_whatsapp`
- `archetype_overview_opened`, `archetype_overview_to_diagnostic`, `archetype_overview_dismissed`
- `apresentacao_view`, `apresentacao_lang_switched`, `apresentacao_share_clicked`, `apresentacao_pescadores_clicked`, `apresentacao_autoplay_started/paused/finished`, `apresentacao_audio_toggled`

Admin tela `/admin/metricas` (`AdminMetrics.jsx`) com funil (Home→Diag→Plan→Task→Story), engajamento (Pescadores, share, results_view) e taxas calculadas. Filtro 24h/7d/30d/tudo.

### PWA

`vite-plugin-pwa@1.3` com service worker auto-update. Manifest com nome, descrição, theme `#4F7CAC`, bg `#FFFDF7`, display standalone, locale pt-BR. Ícone em `public/icon.svg` (caderno espiral em paleta da Trilha). Precache 41 entries / ~898 KB. Runtime cache pra Google Fonts.

App instalável no Android/iOS via "Adicionar à tela inicial". Shell offline disponível (Supabase ainda exige conexão pra dados).

### Página `/apresentacao` (pitch institucional)

Rota fora do Layout (web-first, full-width). 8 seções scroll-driven (Hero + 7 ideias). Bilíngue PT/EN com toggle no top bar (`COPY` object inline, persistido em localStorage). Auto-scroll com play/pause + 8 dots de progresso, timing por seção (9–15s, total ~100s), pausa em scroll manual (wheel/touch/keys).

**Trilha sonora opcional via `public/bailey.mp3`** (arquivo do dono, atualmente um placeholder 0-byte aguardando override). Toca quando auto-scroll ativo + não mutado. Toggle de mute aparece só durante o tour. Falha silenciosa se arquivo ausente/inválido.

Gênero balanceado em PT ("empreendedor ou empreendedora", "quem empreende", "companheiro ou companheira", "encaminhada(o)"). EN é neutro por padrão.

### SEO foundations

- `index.html` com meta description, canonical, Open Graph completo, Twitter Card
- `public/og-image.svg` 1200x630 com identidade Trilha
- `public/robots.txt` permite crawl, bloqueia rotas internas
- `public/sitemap.xml` gerado automaticamente em todo build via `scripts/generate-sitemap.mjs` (42 URLs: 10 estáticas + 14 conteúdos + 18 cases). `SITE_URL` env var sobrescreve default.
- `vercel.json` com SPA rewrite + redirects www→apex + .vercel.app→apex

Pendente: Schema.org markup (HowTo nos guides, Article nos cases, FAQPage no help), prerender SSG, URLs amigáveis, submit sitemap ao Google Search Console.

### Auth supervisor: bypass do init do supabase-js (sessão 27-28/05/2026)

Sintoma: `/admin` ficava em branco mesmo logando com sucesso. `getSession()` e `getUser()` do `supabase-js v2.45.4` travavam o `_initializePromise` interno indefinidamente (timeout 7s em ambos). Fetch direto ao Supabase respondia 200 em ~200ms, então era a lib, não a rede.

Fix: `useSupervisorSession` agora lê o token direto do `localStorage` (chave `trilha_supervisor_auth`) e usa um cliente Supabase fresh (`getAuthedClient(token)` em `supabaseClient.js`) sem `persistSession` pra fazer a query do `supervisors`. Não passa mais pelo init travado.

Decisões correlatas:
- **Login agora é email + senha** (`signInWithPassword`), magic-link foi descontinuado. `detectSessionInUrl: false` no client supervisor impede processar callback de hash, então o botão "Receber link mágico" saiu da UI.
- **Sessão expira em ~1h** (sem `autoRefreshToken`). Pra admin casual tá ok.
- **Cadastro de admin/supervisor**: 2 passos, ver `ADMIN_GUIDE.md` seção "Cadastro de supervisores e admins".

### Biblioteca pra consultores B2B (sessão 27-28/05/2026)

Time de consultores do Projeto Pescadores usa a Trilha como referência no atendimento. Pra que copiem conteúdo formatado pra Slack/Notion/Word/Google Docs:

- `src/utils/exports.js`: `formatCaseAsMarkdown(case)` e `formatTaskAsMarkdown(task)` retornam Markdown limpo (cabeçalho, metadados, seções, fonte).
- `src/components/CopyTextButton.jsx`: botão reutilizável que copia pro clipboard com feedback "Copiado!" e fallback pra browsers antigos.
- Rota `/casos/<id>` ganhou card "Pra consultores e parceiros" com `CopyTextButton`.
- Rotas novas: `/biblioteca/tarefas` (catálogo agrupado por arquétipo, filtros de arquétipo + semana) e `/biblioteca/tarefas/<id>` (detalhe da tarefa avulsa, sem o frame de submissão, com `CopyTextButton`).
- Links discretos "Sou consultor ou parceiro" em `/casos` (lista) e `/preciso-de-ajuda`.
- Sitemap agora indexa `/biblioteca/tarefas` e cada uma das 31 tarefas.

### Responsividade desktop nas bibliotecas (sessão 27-28/05/2026)

Fluxo principal (`/`, `/diagnostico`, `/resultado`, `/salvar`, `/minha-trilha`, `/tarefa/:id`) continua mobile-style em qualquer largura por decisão de foco. Bibliotecas ganham layout aberto:

- `Layout.jsx` detecta rotas wide (`/conteudos`, `/casos`, `/oportunidades`, `/preciso-de-ajuda`, `/posso-ajudar`, `/biblioteca/*`, `/perfis/*`) e libera `max-w-5xl` em md+.
- `TopNav` ganha sub-nav horizontal em md+ com links pra Perfis, Conteúdos, Casos, Oportunidades, Tarefas.
- `BottomNav` se esconde em md+ nessas rotas (TopNav cobre); fica em mobile.
- Listas (`Resources`, `CaseLibrary`, `Opportunities`, `TaskLibrary`) viram grid 1/2/3 cols em mobile/md/lg.
- Telas de detalhe (`CaseDetailPage`, `TaskLibraryDetail`, `ResourceDetail`) usam `max-w-3xl` em md+ pra leitura confortável.

### Visual upgrade (sessão 29/05/2026)

Sprint 3 dedicado a tirar o "pobre" do look & feel. 7 blocos:

- **PageHeader** com `text-3xl md:text-4xl`, eyebrow em Patrick Hand maior, subtitle `text-base md:text-lg`.
- **Card** ganha props `tone` (default, soft, primary, highlight, coral, green, ink) e `interactive` (hover lift + shadow + cursor-pointer).
- **Button** primary com sombra que cresce no hover + `hover:-translate-y-0.5`.
- **Hero da Home** com blobs decorativos (highlight + primaryLight blur), `HeroNotebook` maior com glow, title `text-4xl md:text-5xl`, CTA `text-lg`.
- **Final CTA da Home** vira card `tone="ink"` (escuro) com Sparkle amarelo e botão highlight pra contraste forte.
- **Cards de STEPS/FEATURES/METODOLOGIA** com tones alternados (highlight, primary, soft, green).
- **MyPlan** com cards de tarefa coloridos por status (green/coral/primary).
- **PathTrail** entre seções principais da Home.
- **PersonaAvatar** novo: círculo com iniciais em Patrick Hand, cor determinística por nome (hash). Usado em `TaskCompanion` e em `TaskLibraryDetail`.
- **Layout 2-col em md+** nas telas de detalhe (`CaseDetailPage`, `TaskLibraryDetail`): conteúdo principal à esquerda, sidebar sticky à direita com tarefa prática, recursos, copy text, voltar.

### 15º arquétipo: cuidador empreendedor (sessão 09/06/2026)

Adicionado `cuidador_empreendedor` ("Cuido de alguém em casa, preciso fazer o negócio caber nesse espaço") cobrindo público de mães solo de crianças pequenas, filhas/filhos cuidando de pais idosos, esposas/esposos cuidando de pessoa adoecida. Dor única: tempo fragmentado em janelas curtas + cliente exigindo prazo apertado + ciclo de queimar madrugada que vira burnout.

Diferenciação de `empreendedora_sobrecarregada`: ali o gatilho é volume de trabalho. Aqui é cuidado externo não delegável.

Roadmap 30d específico (centrado em encaixar negócio no tempo real):
- W1 `task_mapear_janelas_reais`: cronometrar tempo de trabalho efetivo (não ideal) por 7 dias
- W2 `task_oferta_caber_janela`: definir 1 oferta principal que cabe na janela média
- W3 `task_prazo_realista_comunicado`: tabela de prazos escrita + mensagem padrão no WhatsApp Business
- W4 `task_plano_continuidade`: plano pra dia ruim de cuidado (lista de clientes flexíveis, mensagem pré-escrita, backup humano)

Cobertura de conteúdo (sem deixar nenhuma task órfã):
- 2 cases (`case_joelma_lembrancinhas_janela` em Olinda, `case_tereza_trico_cuidado_pai` em Pelotas)
- 4 companions cobrindo todas as W1-W4 (Joelma em W1+W2, Tereza em W3+W4)

Pergunta nova (35 → 36 perguntas no diagnóstico):
- `q_home_business_reason` ("Você trabalha de casa hoje? Se sim, qual o motivo principal?") com 4 opções
- Opção `caregiver` ("Sim, cuido de alguém em casa e não posso sair em horário fixo") pontua +5 pra `cuidador_empreendedor` + flag `caregiver`
- Outras 3 opções (not_home, by_choice, until_space) não pontuam — não enviesa diagnóstico de quem não é cuidador
- Pergunta posicionada na seção "context", order 28 (depois de capital, antes de community)

Scoring:
- `cuidador_empreendedor` adicionado ao `tieBreakOrder` antes de `empreendedora_sobrecarregada` (em empate, cuidador específico ganha)
- Sem `minScorePerArchetype` (max possível 5 pts em 1 questão, threshold padrão 3 cobre)
- Testes 10 e 11 novos: caregiver sozinho → cuidador; overload sem caregiver → sobrecarregada continua funcionando
- 19 testes passando

Decisão sobre #3 (pivot necessário, "tô há anos no mesmo e tá morrendo"): **não vai entrar agora**. Diferenciá-lo do `negocio_consolidado` exigiria 1-2 perguntas novas (e o questionário já chegou a 36). Reavaliar se GSC mostrar busca real por keywords tipo "negócio antigo perdendo cliente", "pivot pequeno empreendedor".

### 15º arquétipo + atalho de skip + cadastro reduzido + tour refeito (sessão 09/06/2026, parte 2)

**15º arquétipo: `cuidador_empreendedor`** ("Cuido de alguém em casa, preciso fazer o negócio caber nesse espaço")
- Cobre mãe solo de criança pequena, cuidadora de pai idoso, esposa de pessoa adoecida
- Distinto de `empreendedora_sobrecarregada` (gatilho: cuidado externo não delegável) e de `renda_complementar` (sem trabalho fixo paralelo)
- Roadmap próprio (4 task templates novas) + 2 cases novos + 2 companions
- **1 pergunta nova** adicionada ao diagnóstico (`q_home_motive`) com 5 opções pra capturar contexto de cuidador
- Tieabreak + threshold ajustado pra evitar falsos positivos

**Atalho de skip do diagnóstico** (Pacote ergonômico):
- Em `/perfis/:id` e no modal de overview da Home, agora aparecem **3 caminhos** em vez de 2:
  1. "Fazer o diagnóstico pra conferir" (caminho principal)
  2. "Já me identifico, começar a trilha" (atalho — para cliente do Pescadores orientado por consultor, ou pessoa que voltou ao site e já sabe seu perfil)
  3. "Conhecer outros perfis" (ghost)
- Atalho monta `result` sintético com `archetypeId` + `firstTaskId` + flag `self_selected`, salva no sessionStorage e navega pra `/resultado`
- Results detecta `self_selected` e mostra card com header "Perfil escolhido" lembrando que dá pra refazer o diagnóstico depois se quiser confirmar nuance
- Telemetria: `archetype_profile_skip_diagnostic`, `archetype_overview_skip_diagnostic` (para medir adoção em 2-3 semanas)

**Cadastro simplificado em `/salvar`** (4 obrigatórios → 2 obrigatórios + progressive disclosure):
- Antes: nome + WhatsApp + cidade + bairro obrigatórios
- Agora: só nome + WhatsApp. Cidade, bairro, nome do negócio, tipo: todos opcionais
- Progressive disclosure: campos opcionais ficam escondidos atrás de "Adicionar mais detalhes (cidade, bairro, negócio) →". Quem quer fluxo rápido nem vê.
- Microcopy do topo: "Só nome e WhatsApp são obrigatórios. O resto é opcional — quem preenche ajuda a rede de voluntários a encontrar você com oportunidades locais."

**Auditoria + Pacote A+B de conteúdo**:
- Gaps identificados: 3 arquétipos com 0 companions, 2 arquétipos com 1 case só, 6 tasks órfãs sem companion
- Adicionado: 8 companions novos (Dona Carmen W1 talento_sem_postura_comercial · Mariana W1 digital_antes_da_base · Bia W1-W4 negocio_consolidado · Renata W2 + Dona Isabel W3 recomecou_apos_falir) + 2 cases novos (case_diego_barbeiro_reels_lucro e case_eduardo_hamburgueria_validacao)
- `res_alimentacao_higiene_basica`: `needs_review` → `active` (era flag antiga de quando dependia de URL externa)

**Tour `/apresentacao` refeito (Pacotes A+B)**:
- Copy reescrito (PT+EN) com punch Steve Jobs-style: frases curtas, pausa dramática
  - Hero: "Empreender no escuro." (era "Pra quem empreende no escuro")
  - S1: "30 milhões. Quase todos no escuro." + cita Sebrae 800/BCB/YouTube 14k
  - S3: "Khan Academy. Pra empreender." (era pergunta longa)
  - S6: "Trilha educa. Pescadores fecha."
  - S7: "Cada trilha terminada é um negócio menos no escuro."
- Componentes novos no `Apresentacao.jsx`:
  - `<Reveal>` — fade + slide-up por viewport, honra prefers-reduced-motion
  - `<CounterUp>` — anima 0→N com easing ease-out cubic
- Tipografia 2x maior: `text-5xl sm:6xl lg:7xl xl:8xl` com `tracking-tight`. Hero chega a `text-[11rem]` em XL.
- ScaleNumbers atualizado pra contagens reais: **163 itens, 15 perfis, 42 companions, 0 atendentes** (era 184/13/28/0)
- S1 quotes em stagger sequence (180ms entre cada) em vez de grid simultâneo
- S6 (Pescadores) e S7 (Visão) viraram dark theme com blobs animados atrás
- Dot pattern sutil de fundo (papel pautado) nas seções claras
- PhoneFrames + Khan card + Funnel envolvidos em Reveal, shadow reforçado
- FunnelVisual recolorido pra alto contraste contra `bg-ink`: gradient paper→highlight, textos ink-800, seta amarela com linecap round
- Bug corrigido em S4: `s4Line2.replace('13','')` que gerava `"1515 perfis."` → agora regex `/^\d+/` substitui número pelo `activeCount` dinâmico

**Saga DNS/SSL (custom domains)**:
- Vercel mudou IP recomendado de `76.76.21.21` → `216.198.79.1` (apex) + CNAME `395f249898a0eb52.vercel-dns-017.com.` pro `www`
- Migração de DNS feita no Registro.br
- Cert SSL provisionou OK (Vercel chat confirmou via suporte)
- **Mas o ISP fixo local bloqueia o IP novo do Vercel** — site fica fora do ar pra usuários nesse ISP, normal pra quem está em 4G/5G ou outro ISP
- Workaround `commit 17a8d50` (removia redirect `.vercel.app → apex`) já revertido por `commit 08f70a1`
- Para resolver no Wi-Fi do dono: trocar DNS local pra `1.1.1.1` (Cloudflare)

### 14º arquétipo: recomeço pós-falha (sessão 09/06/2026)

Adicionado `recomecou_apos_falir` ("Já tive negócio, fechei, agora não sei se tento de novo") cobrindo o público de mais de 7 milhões de MEIs baixados no Brasil entre 2020 e 2024 que querem voltar a empreender. Não é `ainda_e_ideia` (esse nunca tentou) nem `vende_sem_lucro` (esse tá vendendo). É próprio.

Dor única: medo emocional + dívida pendente + trauma de margem + síndrome do "vou começar pequenininho" por defesa.

Roadmap 30d específico:
- W1: `task_inventario_negocio_anterior` (3 acertos + 3 erros + 3 sinais ignorados do negócio anterior)
- W2: `task_decidir_mesmo_ou_diferente` (mesmo ajustado / diferente / em sociedade)
- W3: `task_testar_com_5_clientes_antigos` (mensagem pra 5 clientes do anterior)
- W4: `task_piso_minimo_margem` (margem mín + reserva mín + dependência máx por cliente)

Cobertura de conteúdo:
- 2 cases novos (`case_padaria_dona_isabel_voltou` em Diadema, `case_manicure_renata_voltou` em Manaus)
- 2 companions narrativos (Dona Isabel fazendo o inventário, Renata definindo os pisos)

Scoring:
- Nova opção `had_closed` em `q_stage_selling` ("Já tive negócio, fechei, quero voltar") pontua +5 pra `recomecou_apos_falir` + flag `restart_after_close`
- `recomecou_apos_falir` adicionado no `tieBreakOrder` entre `vende_sem_lucro` e `negocio_consolidado`
- Sem `minScorePerArchetype` específico (max possível é 5, threshold padrão de 3 funciona)
- Teste 9 novo: `had_closed` sozinho → `recomecou_apos_falir`. 16 testes passando.

Total: **14 arquétipos ativos**, 35 task templates, 31 companions, 29 cases.

### Auditoria + ajustes (sessão 29-30/05/2026)

**Scoring fixado:** `negocio_consolidado` cobrindo falsos positivos. Movido pra penúltimo no `tieBreakOrder` e ganhou threshold próprio (`minScorePerArchetype.negocio_consolidado = 11`). Engine itera o ranking pegando o primeiro arquétipo que atende seu próprio threshold. 14 testes passando (incluindo 2 novos).

**Disclaimer** (`DisclaimerNote`): aparece em Results, TaskDetail e MyPlan. Reconhece que a Trilha pode errar e aponta pro Projeto Pescadores como apoio humano.

**SEO/AEO Fase 1+2 deployada:**
- `index.html`: Schema.org `Organization` + `WebSite` estáticos. Title/description 12→13 perfis.
- Componente `JsonLd` injeta JSON-LD dinâmico no head.
- `CaseDetailPage` → `Article`. `TaskLibraryDetail` → `HowTo`. `ResourceDetail` → `Article`.
- **Novas páginas `/perfis` + `/perfis/:id`** (14 URLs evergreen indexáveis dos 13 arquétipos). Cada perfil é uma landing com `Article` em Schema.org. Pega busca tipo "como sair do bico", "o que é negócio consolidado".
- `sitemap.xml`: hoje 78 URLs (estáticas + 21 conteúdos + 29 cases + 31 tarefas + 1 índice perfis + 13 perfis + 5 mini-trilhas).

**Conteúdo ampliado:**
- 10 cases novos cobrindo gaps (consolidado, sazonalidade, inadimplência, primeira contratação, catálogo digital, projeção, artesanato, costura, conserto, beleza-móvel). Total: **29 cases ativos** (era 19).
- 2 mini-trilhas novas: `/mini/projecao` (prever caixa do mês que vem) e `/mini/socio_familia` (sócio/esposo(a)/família no negócio). Total: **5 mini-trilhas** (era 3).

**Cleanups técnicos:**
- 15 `sourceLink` fantasmas removidos dos recursos da Trilha original (apontavam pra slugs que não existiam). Validador atualizado pra exigir `sourceLink` só de fontes externas.
- 5 páginas admin migradas pro `getAuthedClient(token)` preventivo: `SupervisorDashboard`, `SupervisorReview`, `AdminUserStories`, `SourceRefresh`, `AdminMetrics`. Se o bug do init voltar, elas não travam.

### Pendências conhecidas

1. **FortiGuard** ainda bloqueia o domínio em algumas redes corporativas. Resolve em 24-72h naturalmente.
2. **Supabase Auth URL** — pendente trocar Site URL pro domínio próprio.
3. **Press kit + página `/imprensa` + QR code + `MEDIA_KIT.md`** — proposto, não executado. Fica como próxima frente quando for ativar imprensa/parceria.
4. **Google Search Console** — submeter `sitemap.xml`. Ação do dono (sem código), guia em ADMIN_GUIDE ou na próxima sessão.
5. **SEO Fase 3** (Schema.org `FAQPage` em `/ajuda`, `BreadcrumbList` nos detalhes) — proposto, não executado.
6. **SMTP custom no Supabase Auth** — **descartado** depois do magic-link ser descontinuado. Hoje não há fluxo que dispara email pro usuário comum. Reset de senha de supervisor é feito direto pelo dashboard do Supabase. Se algum dia houver fluxo público de reset, reavaliar.

### Arquivos importantes adicionados desde v1

```
PROJECT_CONTEXT.md                       (este arquivo, com a seção 14)
SESSIONS_LOG.md                          (histórico de sessões)
vercel.json                              (rewrites + redirects www→apex)
scripts/generate-sitemap.mjs             (auto-gera sitemap no build)
src/services/telemetry.js                (track()+batch)
src/components/PescadoresHandoff.jsx
src/components/CopyTextButton.jsx        (copy pra clipboard com feedback)
src/components/DisclaimerNote.jsx        (disclaimer reutilizável)
src/components/JsonLd.jsx                (injetor de Schema.org dinâmico)
src/components/PersonaAvatar.jsx         (avatar com iniciais coloridas)
src/utils/exports.js                     (Markdown formatters pra cases + tarefas)
src/pages/Apresentacao.jsx               (rota web-only pitch)
src/pages/AdminMetrics.jsx
src/pages/AdminUserStories.jsx
src/pages/MyStory.jsx
src/pages/TaskLibrary.jsx                (catálogo /biblioteca/tarefas)
src/pages/TaskLibraryDetail.jsx          (detalhe da tarefa avulsa B2B)
src/pages/ArchetypesIndex.jsx            (índice público /perfis)
src/pages/ArchetypeProfile.jsx           (perfil público /perfis/:id)
src/data/miniTrilhas/projecao.json       (mini-trilha projeção financeira)
src/data/miniTrilhas/socio_familia.json  (mini-trilha sócio/família)
public/pescadores-logo.jpg               (logo do parceiro)
public/bailey.mp3                        (trilha sonora do /apresentacao, 3.2MB)
public/icon.svg                          (ícone PWA)
public/og-image.svg
public/manifest.webmanifest              (gerado por vite-plugin-pwa)
public/sw.js                             (gerado por vite-plugin-pwa)
supabase/migrations/0005_user_case_submissions.sql
supabase/migrations/0006_client_events.sql
```

### Decisões importantes desde v1

- **NÃO usar editor admin pra conteúdo** — confirmado, segue o modelo "edit JSON → commit → deploy"
- **NÃO virar SaaS** — gratuito, sem cadastro pra começar, mantido por doação Pix
- **Pescadores é parceiro de apoio humano**, não fonte de metodologia. Conteúdo da Trilha é adaptação livre + Khan Academy como inspiração geral.
- **`/apresentacao` é web-first**, não tenta encaixar no mobile do Layout. Tour pra parceiros, jornalistas, decisores.
- **Telemetria é leve, sem analytics externo** — tabela própria no Supabase. Privacy-friendly.
- **Login do supervisor é só email + senha** (magic-link descontinuado por causa do bug do init do supabase-js).
- **Fluxo principal do empreendedor é mobile-style mesmo em desktop** (foco de leitura curta). Só bibliotecas e telas pra consultor B2B (`/biblioteca/*`) aproveitam largura desktop.
- **Time de consultores Pescadores é audiência B2B prioritária** — `/biblioteca/tarefas` e botões "Copiar texto" foram desenhados pra eles. Outras personas (jornalistas, educadores) podem reusar.
