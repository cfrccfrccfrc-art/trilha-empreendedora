# SESSIONS_LOG

Histórico narrativo de sessões de trabalho importantes. Linha do tempo de decisões + entregas.

Pra arquitetura + estado atual de produção, ver `PROJECT_CONTEXT.md` (seção 14 tem o resumo pós-v1).

---

## Sessão grande (maio 2026)

Tudo nesta sessão foi feito com Claude Code num único contexto. Resumo do que entrou no ar.

### Deploy + infraestrutura

- `git init` + repo público em GitHub
- Domínio próprio `trilhaempreendedora.com.br` configurado (apex + www, redirect 301 do `.vercel.app` pro apex)
- DNS no Registro.br (2 A records pra `76.76.21.21`)
- `vercel.json` com SPA rewrite + redirects
- PWA via `vite-plugin-pwa@1.3` (manifest, SW, ícone `public/icon.svg`, precache ~898KB)
- OG image SVG, sitemap auto-gerado no build, robots.txt
- Migrations 0005 (user_case_submissions) + 0006 (client_events) aplicadas
- Bucket `task-evidence` criado
- 1º admin bootstrapped via SQL

### Mudanças de conteúdo grandes

- 12 → **13 arquétipos** (adicionado `negocio_consolidado` pra quem já passou do básico)
- Nomes dos archetypes viraram **quotes em 1ª pessoa entre aspas**
- 3 personas estrangeiras viraram brasileiras (Keisha→Joana/Aracaju, Amina→Aline/Teresina, Priya→Patrícia/Floripa)
- Nova persona high-tech **Vinícius** (Recife, faz sites + iFood)
- 14 Trilha originais ganharam `body` completo (parágrafos com markdown leve)
- 4 tasks novas estratégicas pro arquétipo consolidado
- Auditoria de cobertura: todas as 31 tasks têm companion, todos os 13 archetypes têm cases + opps + flags
- Links externos Sebrae/BCB com deep links reais (não mais homepage)
- "Cuidados comuns" virou "Armadilhas comuns" em TaskDetail
- Pescadores integrado como parceiro oficial (logo real, handoff em 6 telas, recursos atualizados)
- Vários ajustes de gênero e tom em PT

### Features novas

- `/minha-historia` — empreendedor contribui caso aos 30 dias (com workflow editorial em `/admin/historias`)
- Telemetria leve (`client_events` + `track()` em 12 pontos) + admin `/admin/metricas` com funil e taxas
- Modal de preview de archetype antes de iniciar diagnóstico
- Card expansível "Sua primeira missão" no Results
- Fallback de busca quando link externo cai em homepage (com `searchHint`)
- Case inline no companion (não mais só link)
- `/apresentacao` — pitch institucional bilíngue PT/EN, scroll-driven, com auto-scroll + audio opcional (`bailey.mp3`)

### Bugs corrigidos

- Hook order em `AdminDashboard` (useMemo depois de returns condicionais)
- Mini-trilhas com `<a href>` plano causando 404 → trocado por `navigate()`
- Vercel sem SPA fallback → adicionado `vercel.json`
- Sebrae links pra homepage → todos os 6+ deep links reais
- Companions sem `relatedCases` → fallback pro `archetype.recommendedCases[0]`

### Pendências que ficaram

- `/admin` em branco no browser do dono — versão diagnóstico no ar mostrando o estado em tela. Aguarda teste em janela anônima fora do FortiGuard.
- FortiGuard bloqueia domínio novo na rede do dono — espera reavaliação (24-72h) ou liberação manual.
- Press kit + `/imprensa` + QR + `MEDIA_KIT.md` — proposto, não executado.
- Schema.org markup nos guides/cases — proposto, não executado.
- `bailey.mp3` real — placeholder 0-byte no `public/`, dono vai gravar e overwrite.
- Supabase Auth Site URL trocar pro domínio próprio quando SSL estabilizar.
- SMTP custom no Supabase Auth (rate limit do magic-link).

### Decisões registradas

- Manter conteúdo em JSON (não DB), seguir "edit + commit + deploy"
- Não virar SaaS (gratuito, sem cadastro pra começar, doação Pix)
- Pescadores é parceiro de apoio humano, não fonte de metodologia
- Inspiração da Trilha é Khan Academy (não Projeto Pescadores)
- Telemetria leve sem analytics externo (privacy-friendly)
- `/apresentacao` é web-first (fora do Layout mobile)
- Em ties de scoring, archetype consolidado ganha (segurança: pessoa avançada não cai em fundamento básico)

---

## Sessão 27-28/05/2026 — login bug + biblioteca B2B + responsividade

### O quê

Sessão longa de 3 frentes intercaladas: caçar o bug do `/admin` em branco, construir camada B2B pro time de consultores do Projeto Pescadores, e abrir as bibliotecas pra desktop.

### Auth do supervisor (saga do dia)

Sintoma: usuário logado em `/supervisor/login` (sem erro), mas `/admin` ficava em branco. Card de diagnóstico mostrava `loading: true` eternamente.

Investigação:
1. Hipótese inicial (cache do SW) descartada — bug persistiu em janela privada.
2. Probe1 (`getSession`) timeout em 7s. Probe2 (`getUser`) timeout em 5s. Probe3 (fetch direto pro Supabase) respondeu 200 em ~200ms. Concluído: rede OK, lib travada.
3. Tentativa de bypass do `lock` (navigator.locks) não resolveu.
4. Tentativa de desativar `autoRefreshToken` + `detectSessionInUrl` não resolveu.
5. Diagnóstico final: `_initializePromise` do GoTrueClient trava por motivo não identificado em algumas combinações Chrome/PWA. `signInWithPassword` não depende desse init e funciona; `getSession`/`getUser` dependem e travam.

Fix definitivo: `useSupervisorSession` agora lê o token direto do `localStorage` (chave `trilha_supervisor_auth`) e usa um cliente Supabase novo via `getAuthedClient(token)` (sem `persistSession` nem auto-refresh, com Authorization Bearer) pra fazer a query do `supervisors`. Bypass completo do init travado.

Decisões correlatas:
- Login passou a ser **email + senha**. Magic-link foi descontinuado.
- Botão de magic-link saiu do `SupervisorLogin`.
- Sessão expira em ~1h sem refresh — pra admin tá ok.

### Biblioteca B2B pra consultores Pescadores

Frente nova (Sprint 1):
- `src/utils/exports.js`: `formatCaseAsMarkdown` + `formatTaskAsMarkdown` retornam Markdown limpo
- `src/components/CopyTextButton.jsx`: copy pra clipboard com feedback "Copiado!"
- `/casos/<id>` ganhou card "Pra consultores e parceiros" com botão de copy
- Rotas novas: `/biblioteca/tarefas` (catálogo agrupado por arquétipo, filtros) e `/biblioteca/tarefas/<id>` (detalhe da tarefa avulsa)
- Links discretos "Sou consultor ou parceiro" em `/casos` e `/preciso-de-ajuda`
- Sitemap atualizado pra indexar `/biblioteca/tarefas` + cada uma das 31 tarefas

### Responsividade desktop (Sprint 2)

Decisão: fluxo principal (`/diagnostico`, `/resultado`, `/salvar`, `/minha-trilha`, `/tarefa/:id`) continua mobile-style por foco. Bibliotecas e telas B2B viram desktop-friendly:
- `Layout` detecta rotas wide e libera `max-w-5xl` em md+
- `TopNav` em md+ ganha sub-nav com Conteúdos / Casos / Oportunidades / Tarefas
- `BottomNav` se esconde em md+ nessas rotas
- Listas viram grid 1/2/3 cols
- Detalhes usam `max-w-3xl` em md+

### Outras correções pontuais do dia

- `SavePlan.jsx`: `result is not defined` na linha 158 (referência órfã a `result` em vez de `diagnostic.result`). Trilha era salva mas mostrava erro pro usuário, confundindo.
- `SavePlan.jsx`: pós-save (`setPlanToken`, `track`) envolvidos em try/catch isolados — falha aí não bloqueia redirect pra `/minha-trilha`.
- `MyPlan.jsx`: novo botão discreto "Refazer trilha do zero" com confirmação. Cobre o caso onde a pessoa refaz o diagnóstico mas `plan_token` antigo redirecionava.
- `Apresentacao.jsx`: logo Pescadores dentro do retângulo final do funil (estava só texto).
- `ADMIN_GUIDE.md`: seção "Cadastro de supervisores e admins" reescrita com passo a passo completo (criar user no Auth → INSERT em supervisors → recuperação de user_id fora de sincronia).

### Decisões registradas

- Login do supervisor é email + senha (magic-link descontinuado)
- Time de consultores Pescadores é audiência B2B prioritária da biblioteca
- Fluxo do empreendedor permanece mobile-only mesmo em desktop (foco)
- Bibliotecas (`/biblioteca/*` e similares) ganham layout aberto em md+
- Páginas internas do admin ainda usam `getAuthClient` direto; migrar pra `getAuthedClient(token)` só se o bug do init voltar

---

## Sessão 29-30/05/2026 — visual + scoring + SEO + cases + cleanup

### O quê

Sprint visual longa que virou também: auditoria de scoring (bug do consolidado), SEO/AEO Fase 1+2, disclaimer, 10 cases novos, 2 mini-trilhas novas, e cleanup técnico.

### Sprint visual (look & feel)

7 blocos pra tirar o "pobre":
- PageHeader maior (text-3xl md:text-4xl) com eyebrow Patrick Hand
- Card com props tone (default/soft/primary/highlight/coral/green/ink) e interactive (hover lift)
- Button com sombra crescente no hover
- Hero da Home com blobs decorativos, HeroNotebook maior com glow, text-4xl md:text-5xl
- Final CTA da Home virou card tone="ink" com Sparkle amarelo
- Cards de STEPS/FEATURES/METODOLOGIA com tones alternados
- MyPlan: tarefas coloridas por status (green/coral/primary)
- PathTrail entre seções da Home
- PersonaAvatar novo com iniciais coloridas por hash do nome
- Layout 2-col em md+ nas telas de detalhe (CaseDetailPage, TaskLibraryDetail) com sidebar sticky

### Bug do scoring (auditoria → fix → testes)

Sintoma reportado: "preciso de mais clientes" caía em negocio_consolidado.

Causa: pessoa com 1+ ano + MEI + finanças OK + dedicação 30h+ pontuava ~10/13 em consolidado (ratio 0.77), enquanto produto_bom_vitrine_fraca pontuava 2-3 pts (ratio 0.40). Mesmo dor explícita "no_clients" (+2 pra produto_bom) não revertia o ratio. E em empate, consolidado ganhava porque estava em primeiro no tieBreakOrder ("segurança").

Fix:
- Mover negocio_consolidado pra penúltimo no tieBreakOrder
- Adicionar minScorePerArchetype.negocio_consolidado = 11 (acima do que pessoa "1 ano + organização básica" pontua)
- Engine itera o ranking pegando o primeiro arquétipo que atende seu próprio threshold (per-archetype overrides global)
- 2 testes novos: cenário "1+ano organizado + falta clientes" → produto_bom_vitrine_fraca; cenário "consolidado de verdade" → negocio_consolidado

### Disclaimer

Componente DisclaimerNote em 2 variantes. Texto reconhece que a Trilha pode errar e aponta pro Projeto Pescadores. Aparece em Results (default), TaskDetail (compact) e MyPlan (compact).

### SEO/AEO Fase 1 + 2

- Schema.org Organization + WebSite no index.html
- Componente JsonLd injeta Schema dinâmico no head por rota
- CaseDetailPage → Article. TaskLibraryDetail → HowTo. ResourceDetail → Article.
- Title/description 12 → 13 perfis
- Novas páginas /perfis (CollectionPage) + /perfis/:id (13 Article evergreen) — pega busca tipo "como sair do bico", "o que é negócio consolidado"
- TopNav wide ganha link "Perfis" em primeiro
- Sitemap inclui /perfis e cada perfil

### Conteúdo ampliado

6 cases primeira leva (Bia, Roberto, Eduarda, Andréia, Luana, Tiago) + 4 cases segunda leva (Célia/artesanato, Carmen/costura, Jorge/conserto, Sílvia/beleza-móvel). Total: 29 cases ativos (era 19).

2 mini-trilhas novas:
- /mini/projecao: prever caixa do mês que vem (5 perguntas, 3 destinos)
- /mini/socio_familia: sócio/esposo(a)/família no negócio (5 perguntas, 3 destinos)

### Cleanup técnico

- 15 sourceLinks fantasmas removidos dos recursos da Trilha (apontavam pra slugs que não existiam). Validador atualizado.
- 5 páginas admin migradas pro getAuthedClient(token) preventivo (SupervisorDashboard, SupervisorReview, AdminUserStories, SourceRefresh, AdminMetrics) — se o bug do init voltar, não travam.

### Decisões registradas

- negocio_consolidado precisa de score absoluto alto (≥11) pra ganhar — não basta ratio
- SEO Fase 1+2 prioriza Article + HowTo + páginas evergreen de arquétipos. Fase 3 (FAQPage, BreadcrumbList) fica em standby.
- SMTP custom no Supabase foi descartado: magic-link foi descontinuado, não há fluxo público que dispara email
- Trilha audita conteúdo periodicamente e adiciona cases/mini-trilhas conforme dores são identificadas
- Layout 2-col em desktop é só pra telas de detalhe das bibliotecas; fluxo principal continua mobile-only mesmo em desktop
