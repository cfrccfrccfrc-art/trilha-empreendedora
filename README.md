# Trilha Empreendedora

Plataforma mobile-first que ajuda empreendedores iniciantes a descobrirem o
próximo passo do negócio. Inspirado na metodologia do Projeto Pescadores.

## O que a plataforma faz

1. **Diagnóstico** — 35 perguntas curtas em português para identificar o
   perfil do empreendedor (12 arquétipos possíveis).
2. **Resultado** — devolve um arquétipo, dores principais, missão imediata e
   trilha de 30 dias.
3. **Salvar trilha** — sem senha; o usuário recebe um `plan_token` salvo no
   navegador (modelo MVP).
4. **Minha trilha** — acompanhamento das tarefas semanais, com status e
   reportes simples.
5. **Tarefa + aprendizado** — fluxo "Reportar tarefa → Aprendizado" com
   auto-aprovação para tarefas leves.
6. **Conteúdos / Casos / Oportunidades** — biblioteca filtrável pra apoiar
   cada passo.
7. **Pedir / Oferecer ajuda** — formulários simples que alimentam a fila
   de voluntários.
8. **Supervisor** — fila autenticada (Supabase Auth, magic link) com revisão
   por rubrica e modelos de feedback.
9. **Admin** — visão geral do conteúdo, pré-visualização de resultado por
   arquétipo, refresh de fontes e gaps de conteúdo.
10. **Cartão do empreendedor** — cartão compartilhável com disclaimer
    obrigatório (sem promessa de crédito).

## Stack

- Vite + React 18 (JavaScript, sem TypeScript)
- React Router v6
- Tailwind CSS (com paleta custom)
- Supabase (Postgres + Auth para supervisores + Storage para evidências)
- Deploy: Vercel

## Setup local

```bash
npm install
cp .env.example .env   # preencha as chaves do Supabase
npm run dev
```

Variáveis de ambiente:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

## Banco de dados

Migrations em `supabase/migrations/`:

- `0001_init.sql` — tabelas de usuário, diagnóstico, plano, tarefa, submissão,
  revisão, ajuda. RLS por `plan_token` no header `x-plan-token`.
- `0002_supervisors.sql` — supervisores (Supabase Auth), feedback templates,
  rubricas, voluntários, matches, content_gaps, content_reviews. RLS por
  `is_supervisor()` / `is_admin()`.

Aplicar:

```bash
supabase db push       # CLI
# ou copie o SQL no SQL Editor do dashboard
```

Bucket de storage `task-evidence` (público para MVP) — instruções em
`supabase/README.md`.

Bootstrap do primeiro admin: instruções dentro de `0002_supervisors.sql`
(comentário no final).

## Rotas

| Caminho                              | Página                         |
| ------------------------------------ | ------------------------------ |
| `/`                                  | Home                           |
| `/diagnostico`                       | Diagnóstico (35 perguntas)     |
| `/resultado`                         | Resultado do diagnóstico       |
| `/salvar`                            | Salvar plano                   |
| `/minha-trilha`                      | Minha trilha                   |
| `/tarefa/:id`                        | Detalhe da tarefa + reporte    |
| `/tarefa/:id/aprendizado`            | Tela de aprendizado pós-tarefa |
| `/cartao`                            | Cartão do empreendedor         |
| `/conteudos`                         | Biblioteca de conteúdos        |
| `/casos` / `/casos/:id`              | Biblioteca de casos            |
| `/oportunidades`                     | Oportunidades                  |
| `/preciso-de-ajuda`                  | Pedir ajuda                    |
| `/posso-ajudar`                      | Oferecer ajuda                 |
| `/supervisor` / `/supervisor/login`  | Painel do supervisor + login   |
| `/supervisor/revisar/:submissionId`  | Revisar uma submissão          |
| `/admin`                             | Painel admin (gate por papel)  |
| `/admin/preview`                     | Pré-visualizar resultado       |
| `/admin/fontes`                      | Refresh de fontes              |

## Estrutura de pastas

```
src/
  components/   primitivos compartilhados (Button, Card, ProgressBar, PageHeader, FilterChips, Layout)
  pages/        páginas roteadas
  data/         conteúdo seed em JSON (questions, archetypes, tasks, resources, cases, opportunities, feedback, rubrics)
  services/     supabaseClient.js, contentService.js
  utils/        scoring.js, scoring.test.mjs, taskRouting.js, useSupervisorSession.js
  styles/       index.css com Tailwind
  App.jsx       rotas
  main.jsx      bootstrap
supabase/
  migrations/   0001_init.sql, 0002_supervisors.sql
  README.md
```

## Documentação

- [`ADMIN_GUIDE.md`](ADMIN_GUIDE.md) — como editar conteúdo, fluxo de revisão, copyright
- [`SUPERVISOR_GUIDE.md`](SUPERVISOR_GUIDE.md) — review levels, rubricas, escalada, o que NÃO aconselhar
- [`CONTENT_GUIDE.md`](CONTENT_GUIDE.md) — barra de qualidade, fontes, tropicalização, refresh

## Deploy (Vercel)

```bash
vercel link        # uma vez
vercel deploy --prod
```

Configure no painel Vercel:

- **Environment Variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Depois do primeiro deploy, atualize o redirect do Supabase Auth:

- Supabase → Authentication → URL Configuration
- Site URL: `https://<seu-dominio>.vercel.app`
- Redirect URLs: `https://<seu-dominio>.vercel.app/supervisor`

## Status

- 12 arquétipos ativos
- 27 task templates ativos
- 20 conteúdos (mistura de Trilha original, Sebrae, BCB, Pescadoras, setoriais)
- 8 casos ativos + 4 em rascunho
- 10 oportunidades
- 15 modelos de feedback
- 3 rubricas (caixa, preço, capital inicial)
