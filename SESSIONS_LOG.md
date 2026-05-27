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
