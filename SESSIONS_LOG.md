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

---

## Sessão 09/06/2026 — 14º arquétipo (recomeço pós-falha)

### O quê

Adicionou o 14º arquétipo cobrindo gap mais óbvio depois da auditoria: pessoa que já teve negócio, fechou, e quer voltar. Esse perfil hoje caía em arquétipos errados:
- Quem diz "tenho ideia" → `ainda_e_ideia` (mas é experiência queimada, não ideia)
- Quem diz "vendo sem lucro" → `vende_sem_lucro` (mas não tá vendendo, tá hesitando em começar de novo)

Público real e mensurável: mais de 7 milhões de MEIs baixados no Brasil entre 2020 e 2024.

### Novo arquétipo `recomecou_apos_falir`

Quote em 1ª pessoa: "Já tive negócio, fechei, agora não sei se tento de novo"

Dor única que diferencia dos 13:
- Medo emocional ("levo a família junto se errar de novo")
- Dívida pendente do anterior
- Trauma de margem (cobra abaixo do mercado pra "garantir cliente desta vez", repetindo o erro)
- Síndrome do "vou começar pequenininho" (defesa que vira sub-dimensionamento)

### Roadmap 30 dias

- W1 `task_inventario_negocio_anterior`: 3 acertos + 3 erros + 3 sinais que não viu, escritos em folha
- W2 `task_decidir_mesmo_ou_diferente`: mesmo ajustado OU diferente OU sociedade, escolhendo um caminho
- W3 `task_testar_com_5_clientes_antigos`: mensagem pra 5 clientes do anterior testando a hipótese
- W4 `task_piso_minimo_margem`: 3 números escritos (margem mín, reserva mín, dependência máx por cliente)

### Cases novos

- `case_padaria_dona_isabel_voltou` (Diadema/SP): padaria fechou em 2021 com R$ 38 mil de dívida, voltou em 2025 em sociedade com sobrinho que cuida do digital
- `case_manicure_renata_voltou` (Manaus/AM): estúdio fechou por reajuste de R$ 80 no aluguel sem reserva, volta com cabine compartilhada + 3 pisos escritos (margem 45%, reserva R$ 2.400, dependência ≤10%)

### Companions narrativos

- `companion_inventario_negocio_anterior_isabel`: Dona Isabel fazendo o exercício, mostrando como travou em "a pandemia me derrubou" e como destravou separando "o que o mundo trouxe" de "como reagi"
- `companion_piso_minimo_margem_renata`: Renata calibrando os 3 números, conversando com colega que tem estúdio há 8 anos, fixando folha física na pasta de instrumentos

### Scoring

- Nova opção em `q_stage_selling`: `had_closed` "Já tive negócio, fechei, quero voltar" pontua +5 pra `recomecou_apos_falir` + flag `restart_after_close`
- `recomecou_apos_falir` adicionado ao `tieBreakOrder` (12ª posição, entre `vende_sem_lucro` e `negocio_consolidado`)
- Sem `minScorePerArchetype` específico (max possível é 5, threshold padrão de 3 cobre)
- Teste 9 novo: `had_closed` sozinho → `recomecou_apos_falir`. 16 testes passando.

### Referências 13→14

Atualizado em todos os lugares user-facing:
- `index.html` title/og:description
- Home (texto "13 caminhos" e link "Ler sobre os 13 perfis")
- ArchetypesIndex (Schema CollectionPage + PageHeader + subtitle)
- ArchetypeProfile (CTA "13 caminhos" + botão "Voltar pros 13 perfis")
- Apresentacao em PT e EN (s4Line2 + body)
- App.jsx comentário

### Decisões registradas

- Quem fechou e quer voltar não é "ainda é ideia" nem "vende sem lucro" — é arquétipo próprio com dor própria
- W1 começa olhando pra trás (inventário) antes de olhar pra frente — é o que diferencia o roadmap dos outros 13
- Cases novos focam em sociedade (Isabel) e cabine compartilhada (Renata) como soluções práticas brasileiras, não em "comece do zero forte"

---

## Sessão 09/06/2026 (parte 2) — auditoria + 15º arquétipo (cuidador empreendedor)

### Auditoria de conteúdo

Rodou auditoria pra ver gaps que validate-content não pega. Achados:
- 3 arquétipos sem nenhum companion (talento_sem_postura_comercial, digital_antes_da_base, negocio_consolidado)
- 6 tasks sem nenhum companion
- 2 arquétipos com só 1 case (ainda_e_ideia, digital_antes_da_base)
- 1 resource com sourceStatus needs_review

### Pacote A + B (10 commits no commit e05fa99)

8 companions novos:
- companion_lista_servicos_precos_carmen (talento_sem_postura_comercial)
- companion_anotar_7_dias_mariana (digital_antes_da_base)
- 4 companions do Bia cobrindo W1-W4 do negocio_consolidado
- companion_decidir_mesmo_ou_diferente_renata (recomecou_apos_falir W2)
- companion_testar_com_5_clientes_antigos_isabel (recomecou_apos_falir W3)

2 cases novos:
- case_diego_barbeiro_reels_lucro (digital_antes_da_base, Salvador)
- case_eduardo_hamburgueria_validacao (ainda_e_ideia, BH)

Fix técnico:
- res_alimentacao_higiene_basica: sourceStatus needs_review → active (era flag antiga; recurso é Trilha original com body)

### 15º arquétipo: cuidador empreendedor

Avaliação prévia: cuidador colidiria com empreendedora_sobrecarregada sem pergunta nova. Pivot necessário (#16 candidato) colidiria com negocio_consolidado sem 2 perguntas novas. Decisão: adicionar cuidador (1 pergunta nova) + descartar pivot (custo mais alto, valor menor).

Novo arquétipo `cuidador_empreendedor`:
- Quote: "Cuido de alguém em casa, preciso fazer o negócio caber nesse espaço"
- Dor única: tempo fragmentado em janelas curtas + cliente exigindo prazo apertado + ciclo de queimar madrugada que vira burnout
- Diferenciação de empreendedora_sobrecarregada: gatilho é cuidado externo não delegável, não volume

Roadmap específico (centrado em encaixar negócio no tempo real):
- W1 task_mapear_janelas_reais (cronometrar tempo efetivo por 7 dias)
- W2 task_oferta_caber_janela (oferta única que cabe na janela média)
- W3 task_prazo_realista_comunicado (tabela escrita + mensagem no WhatsApp Business)
- W4 task_plano_continuidade (plano pra dia ruim de cuidado)

Cobertura sem deixar tarefa órfã:
- 2 cases: case_joelma_lembrancinhas_janela (Olinda, mãe solo Tarcísio 3 anos), case_tereza_trico_cuidado_pai (Pelotas, filha cuidando pai com Alzheimer)
- 4 companions cobrindo todas as W1-W4 (Joelma em W1+W2, Tereza em W3+W4)

Pergunta nova q_home_business_reason:
- Section: context, order 28
- Opção caregiver pontua +5 pra cuidador_empreendedor + flag caregiver
- 3 outras opções (not_home, by_choice, until_space) não enviesam quem não é cuidador
- Diagnóstico cresceu de 35 → 36 perguntas (impacto mínimo no tempo)

Scoring:
- tieBreakOrder: cuidador_empreendedor antes de empreendedora_sobrecarregada
- Sem minScorePerArchetype (max 5 pts em 1 questão, threshold padrão cobre)
- Teste 10: caregiver sozinho → cuidador_empreendedor
- Teste 11: overloaded sem caregiver → continua caindo em sobrecarregada
- 19 testes passando

Referências 14→15 atualizadas em: index.html, Home, ArchetypesIndex, ArchetypeProfile, Apresentacao PT+EN, App.jsx.

### Decisões registradas

- Cuidador empreendedor é arquétipo próprio, não variante de sobrecarregada
- Pergunta nova é trade-off justo (1 pergunta a mais pra cobrir público real de cuidadoras)
- Pivot necessário fica fora do escopo atual (custo > benefício sem dado de busca real)
- Pergunta q_home_business_reason desenhada pra não enviesar quem não é cuidador (3 das 4 opções não pontuam)


---

## Sessão 09-10/06/2026 (parte 2) — atalho skip + cadastro reduzido + tour refeito + saga DNS/SSL

### O quê

Sessão longa e híbrida com 4 frentes:
1. UX (atalho de skip do diagnóstico, cadastro reduzido)
2. Conteúdo (Pacote A+B de companions e cases)
3. Visual (tour `/apresentacao` refeito com punch Steve Jobs)
4. Operação (saga DNS/SSL com IP novo do Vercel + ISP bloqueando)

### Atalho de skip do diagnóstico

Em `/perfis/:id` e no modal de overview da Home: 2 → 3 caminhos.

- Botão novo "Já me identifico, começar a trilha" pra quem foi orientado por consultor (Pescadores) ou já voltou ao site sabendo o perfil
- Cria result sintético com `archetypeId` + `firstTaskId` + flag `self_selected` no sessionStorage
- Results detecta flag e mostra "Perfil escolhido" lembrando que dá pra refazer com nuance depois
- Telemetria nova: `archetype_profile_skip_diagnostic`, `archetype_overview_skip_diagnostic`

### Cadastro reduzido

`/salvar` foi de 4 obrigatórios → 2 obrigatórios + progressive disclosure.

- Só nome + WhatsApp obrigatórios
- Cidade, bairro, nome do negócio, tipo: opcionais
- Campos opcionais escondidos atrás de "Adicionar mais detalhes →" — quem quer fluxo rápido nem vê
- Microcopy explica que opcionais ajudam a rede de voluntários a encontrar a pessoa com oportunidades locais

### Pacote A+B de conteúdo

Gaps cobertos na auditoria:
- 3 arquétipos passaram de 0 → 1+ companion (talento_sem_postura_comercial, digital_antes_da_base, negocio_consolidado)
- 2 arquétipos passaram de 1 → 2 cases (digital_antes_da_base, ainda_e_ideia)
- 6 tasks órfãs ganharam companion

Total: 8 companions novos + 2 cases novos + fix do `res_alimentacao_higiene_basica` (sourceStatus `needs_review` → `active`).

### Tour `/apresentacao` refeito (Pacotes A+B)

Punch Steve Jobs-style:
- Copy reescrito (PT+EN): frases curtas, pausa dramática, ex.: "Empreender no escuro." / "Khan Academy. Pra empreender." / "Trilha educa. Pescadores fecha."
- Tipografia 2x maior: `text-5xl→8xl xl tracking-tight`. Hero chega `text-[11rem]`
- Componentes novos: `<Reveal>` (fade + slide-up por viewport) + `<CounterUp>` (anima 0→N com easing)
- Stagger nas linhas: eyebrow → title → body (150/350/500ms delay)
- ScaleNumbers com números reais (163/15/42/0)
- Quotes da S1 em stagger (180ms entre cada)
- S6 (Pescadores) e S7 (Visão) viraram dark theme com blobs animados atrás
- Dot pattern sutil de fundo nas seções claras (papel pautado)
- FunnelVisual recolorido pra alto contraste em fundo dark: gradient paper→highlight, textos ink-800, seta amarela

Bug do `s4Line2.replace('13','')` corrigido (gerava "1515 perfis." na S4).

### Saga DNS/SSL (operacional, não código)

- Vercel mudou IP recomendado: `76.76.21.21` → `216.198.79.1` (apex) + CNAME `395f249898a0eb52.vercel-dns-017.com.` (www)
- Migração DNS feita no Registro.br ao longo de várias iterações
- Cert SSL provisionou (Vercel chat confirmou). Mas o ISP fixo local do dono bloqueia o IP novo do Vercel
- Workaround temporário no `vercel.json` (removia redirect `.vercel.app → apex` pra dono testar) foi commitado e revertido — `commit 17a8d50` + `commit 08f70a1`
- Pra dono ver pelo Wi-Fi: trocar DNS local pra `1.1.1.1` (Cloudflare)
- Site funciona normal pra quem está em 4G/5G ou outros ISPs

### Decisões registradas

- Cuidador é arquétipo próprio (não variante)
- Atalho de skip é caminho válido e medível por telemetria; se 40%+ usarem, vale repensar tamanho do diagnóstico (36 perguntas)
- Cadastro mínimo é nome+WhatsApp; outros campos opcionais com microcopy explicando benefício de preencher
- Apresentação tem 7 seções + Hero; padrão é seção clara com pattern + S6/S7 dark com blob
- Funnel sempre com contraste alto em qualquer fundo (gradient paper→highlight, textos ink-800)

## Sessão 13/06/2026 — auditoria de conteúdo (utilidade + realismo) + disclaimer jurídico

Pedido: auditar dicas, tarefas e cases de novo, comprehensively, pra garantir que sejam úteis e realistas. Saiu um relatório em 4 tiers; tiers 1 e 2 + correções mecânicas de tom aplicados e em produção.

### Tier 1 — risco legal/tributário (commit 7b57525)

- **Case Jorge (conserto de celular):** removida citação jurídica falsa ("Código Civil art. 644-647 — penhor sobre obra"). Trocada por orientação de combinar por escrito antes do serviço e procurar apoio antes de dar outro destino a aparelho parado. Opção 3 e tropicalizedLesson reescritas em torno de "sinal já pago cobre a peça", sem afirmar que o aparelho "vira propriedade do estabelecimento".
- **Case Sandra (MEI):** helpTrigger e tropicalizedLesson ganharam o alerta de que servidor público deve checar o estatuto antes (muitos proíbem ser titular de MEI).

### Tier 2 — credibilidade/números (commit 5a9ee5b)

- **Case Diego (barbeiro):** volume ajustado de "8-10 clientes/dia" pra "5-6 clientes/dia (cada corte 45-60 min)" pra bater com o faturamento declarado de R$ 9.800.
- **resources.json:** BNDES não é credor direto de microcrédito. `res_capital_inteligente` e `res_microcredito_orientacao` reescritos: quem atende é banco/cooperativa/agente credenciado; comparar 3 ofertas; microcrédito orientado costuma ficar até ~4% a.m.
- **precificacao.json:** guia `cobertura_basica` parou de sugerir baixar preço com margem >40%; agora orienta que margem boa protege e só baixar se confirmar perda de venda por preço.
- **Tom mecânico:** "tráfego pago" → "anúncios pagos" (4x em cases); 2ª "Dona Marlene" (carrinho de Ceilândia) renomeada pra "Dona Marluce" pra não colidir com a quitandeira de Olinda; varredura de em-dash em todos os JSON (305 → 0).

### Tier 3 — execução desta sessão (commit pendente)

- **Nova task `task_dizer_o_preco_sem_dobrar`** (talento_sem_postura_comercial, semana 3) com 3 falas pra treinar: passar orçamento sem pedir desculpa, responder "tá caro" mexendo na entrega e não no preço, cobrar atraso com firmeza. Entrou no `roadmap30d` na semana 3 (saiu `task_falar_com_10_clientes`, que não treinava a dor central do arquétipo: cobrar).
- **Novo companion `companion_dizer_o_preco_sem_dobrar_carmen`** (Dona Carmen, Belford Roxo) — continuação do arco dela: agora segura o preço na conversa cara a cara.
- **`vende_comunidade_nao_online`:** `expectedLearning` deixou de prometer alcançar "outras comunidades parecidas" (o roadmap não entrega isso); agora fala em montar presença online simples pra alcançar além de quem passa na frente.
- **Disclaimer jurídico (sticker):** novo `variant='legal'` em `DisclaimerNote.jsx` (ícone DocumentStamp, borda coral) deixando claro que não é parecer jurídico e apontando Defensoria/OAB/Procon/Sebrae. Renderizado em `CaseDetailPage` quando o case tem `"legalSensitive": true` (marcados: Jorge e Sandra/MEI). Formalização já tinha o aviso de contador, mantido.

### Verificações

- `npm run validate-content`: 227 itens, tudo válido (era 225; +1 task +1 companion).
- `npm run test-scoring`: 19/19.
- `npm run build`: OK.

### Decisões / não-mudanças

- IDs de companion (amina/keisha/priya vs Aline/Joana/Patrícia) têm mismatch interno, mas **não renomeados**: case IDs aparecem em `/casos/:id` e no sitemap (risco de SEO) e o personaName já está correto.
- Sobreposições de scoring entre arquétipos foram julgadas em geral intencionais (robustez a erro de diagnóstico é feature). Único gap real era o roadmap do talento não treinar a dor central — corrigido acima.

### Reformulação do arquétipo digital_antes_da_base (scoringRules 1.3)

Diagnóstico: o arquétipo (a pessoa que só desenvolveu o digital, mas a base comercial/operacional/financeira não acompanhou) **quase nunca vencia**. Ganhava no máximo +1 em 4 perguntas (teto 4, piso global 3), em toda opção um concorrente ganhava +2, e 2 das 4 pistas estavam fora da tese ("pensando em empréstimo", "quero aparecer mais" — esta última é o oposto: quem quer aparecer ainda não aparece).

Correção (motor aditivo não faz "E" lógico, então usamos o piso por-arquétipo pra simular a conjunção):
- `q_channels_online` / "Sim, com frequência": digital +1 → **+3**.
- `q_finances_costs` / "Não, nunca calculei": **+digital 1** (sinal de base fraca).
- `q_finances_profit` / "Não, nunca calculei": mantém digital +1.
- Removido digital de `q_capital_credit`/"pensando em pegar" e de `q_goals`/"Aparecer mais (divulgação)".
- `minScorePerArchetype.digital_antes_da_base = 4`: posta-muito sozinho (3) não basta; precisa ter pelo menos um buraco de base junto. Teto novo = 5.
- Nome: "Posto bonito todo dia, mas não sei se sobra lucro" → **"Já apareço na internet, mas preciso de ajuda com o resto"**. **id mantido** (`digital_antes_da_base`) porque aparece em `/perfis/:id`, sitemap e cross-refs.
- Tests 12 (digital forte + base fraca → cai no arquétipo) e 13 (digital forte mas base ok → NÃO cai, piso protege) adicionados. test-scoring: 21/21.

Decisão registrada: preferimos rebalancear os sinais existentes a adicionar pergunta nova, pra não alongar o diagnóstico (já tem 36 perguntas + atalho de skip).

### Oportunidades: URLs e links internos quebrados (commit pendente)

Auditoria do `opportunities.json`: 2 fontes Sebrae estavam em `needs_review` e 4 oportunidades apontavam o botão "Saber mais" pra páginas internas que não existem (404). `sourceStatus` não afeta o render público (só alimenta a lista de revisão em `/admin/fontes`), mas o `sourceLink` quebrado afeta. Correções (Opção A: apontar cada uma pra um destino que existe de verdade):

- `opp_sebrae_curso_inicial`: link `https://sebrae.com.br/` → `https://loja.sebrae.com.br/cursos/cursos-online`; `needs_review` → `active`.
- `opp_sebrae_atendimento_presencial`: link mantido (`https://sebrae.com.br/`); `needs_review` → `active`.
- `opp_rede_pescadoras`: link `/oportunidades/rede-pescadoras` (inexistente) → `https://projetopescadores.com.br/contato`; `needs_review` → `active`.
- `opp_feira_bazar_local`: link `/oportunidades/feiras-bazares` (inexistente) → `/conteudos/res_feira_bazar_basico`; `needs_review` → `active`.
- `opp_apoio_juridico_mei`: link `/oportunidades/apoio-mei` (inexistente) → `/formalizacao`; `needs_review` → `active`.
- `opp_microcredito_orientacao`: link `/oportunidades/microcredito-orientacao` (inexistente) → `/conteudos/res_microcredito_orientacao` (já estava `active`).

Não existe rota `/oportunidades/:slug` no app, só o índice `/oportunidades` - por isso todos os links internos de detalhe estavam 404. Validação: 227 itens OK. Build: OK.

**Smoke-test ao vivo (após deploy):** confirmados os 6 fixes no ar e renderizando (microcrédito, feira, /formalizacao com conteúdo; Sebrae/Pescadores externos). O teste revelou **mais 4 links quebrados** com o mesmo defeito `/oportunidades/:slug` (renderizam tela em branco, não 404): oficina de fotos, mentoria B2B, curso de precificação e compra coletiva. 3 tinham destino existente e foram corrigidos no mesmo padrão:
- `opp_oficina_fotos_celular` → `/conteudos/res_fotos_celular`
- `opp_mentoria_b2b` → `/conteudos/res_proposta_b2b`
- `opp_curso_precificacao` → `/conteudos/res_precificacao_simples`

Pendência: `opp_compra_coletiva_insumos` (`/oportunidades/compra-coletiva`) segue quebrado - não há conteúdo dedicado sobre compra coletiva. Decisão em aberto (criar conteúdo novo / apontar pra conteúdo próximo / tirar o botão).

### Atribuição de origem na telemetria (pré-campanha)

Contexto: ninguém chega ao app ainda; objetivo é ativação/distribuição. Antes de gastar em anúncio, instrumentamos a origem do tráfego pra qualquer real gasto virar aprendizado. Diagnóstico: o funil já estava todo instrumentado (`home_view` → `diagnostic_started` → `diagnostic_completed` → `plan_saved` → `task_submitted`) e o painel `/admin/metricas` já calcula taxas. Faltavam só 2 coisas pra medir campanha: origem do tráfego e id de visitante/sessão anônimo. Ambas couberam no `meta` (JSONB) - **sem migration**.

- `telemetry.js`: todo evento passa a carregar `meta.vid` (visitante, localStorage), `meta.sid` (sessão, sessionStorage) e `meta.src` (first-touch: `utm_source/medium/campaign` da URL + domínio do referrer). Ids aleatórios, sem dado pessoal; falha de storage não quebra o fluxo.
- `AdminMetrics.jsx`: novo cartão "Origem do tráfego" (visitantes únicos + sessões distintas por origem). Select passou a puxar `meta`.
- Uso: link de anúncio com `?utm_source=instagram&utm_campaign=...` faz toda a jornada da pessoa carregar a origem, dá pra ver o funil por fonte e calcular custo por usuária real. Validação 227 OK, build OK.

Decisão de produto registrada: priorizar multiplicador + WhatsApp (custo ~zero, mais confiança) sobre anúncio frio; se for testar pago, começar com R$200-300 só pra medir o funil por origem antes de escalar.
