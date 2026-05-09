# Guia do Admin — Trilha Empreendedora

Este guia é para quem gerencia conteúdo, supervisores e a saúde geral do
produto.

## Acesso

1. Faça login via `/supervisor/login` (mesmo fluxo dos supervisores).
2. Você precisa ter `role = 'admin'` na tabela `supervisors`.
3. Depois de logada, `/admin`, `/admin/preview` e `/admin/fontes` ficam
   disponíveis.

Bootstrap do primeiro admin: ver instruções no fim de
`supabase/migrations/0002_supervisors.sql`.

## Onde mora cada coisa

A plataforma tem dois "lugares" pra conteúdo:

1. **JSON no repositório** (`src/data/`) — conteúdo seed: arquétipos,
   tarefas, conteúdos, casos, oportunidades, modelos de feedback, rubricas.
   Edite no código, faça commit + deploy.
2. **Banco Supabase** — estado dinâmico: usuários, planos, tarefas
   instanciadas, submissões, revisões, voluntários, content_gaps,
   content_reviews.

Não tem CMS web. A escolha é proposital: conteúdo passa por revisão de
código, tem versão (git) e nunca quebra inesperadamente.

## Validador de conteúdo

```bash
npm run validate-content
```

Roda em ~1 segundo. Checa todos os 15 arquivos de conteúdo (`src/data/`) por: sintaxe JSON, campos obrigatórios, enums válidos, IDs únicos, referências cruzadas, formato de datas. Use sempre antes de commitar/deployar mudança de conteúdo.

Detalhes do que ele checa estão em [`CONTENT_GUIDE.md`](CONTENT_GUIDE.md).

## Atualizar conteúdo

### Arquétipo

Arquivo: `src/data/archetypes.json`. Cada item segue o schema descrito em
`CONTENT_GUIDE.md`. Para ativar um arquétipo `draft`:

1. Preencha os campos obrigatórios com qualidade
2. Garanta que o `firstTaskId` existe em `taskTemplates.json`
3. Garanta que cada `roadmap30d.tasks[]` aponta pra task existente
4. Mude `status: "draft"` → `status: "active"`
5. Pré-visualize em `/admin/preview` selecionando esse arquétipo
6. Commit + deploy

### Tarefa

`src/data/taskTemplates.json`. Lembre: `reviewLevel: "elevated"` para
tarefas de risco financeiro.

### Conteúdo (resource)

`src/data/resources.json`. Para conteúdo externo (Sebrae, BCB):

- `description` é nossa, sempre nas nossas palavras
- `sourceLink` aponta pra fonte oficial
- `sourceStatus: "needs_review"` se não temos URL exata verificada
- `lastReviewed` / `nextReview` em `YYYY-MM-DD`

### Caso

`src/data/cases.json`. Regras críticas em `CONTENT_GUIDE.md` (copyright!).
Marque `caseAuthenticityType` honestamente. Caso `draft` aparece em
`/admin/fontes` na lista de "Casos em rascunho".

### Oportunidade

`src/data/opportunities.json`. **Não listar oferta de crédito.** Se a
oportunidade saiu do ar, mude `status` pra `draft` ou remova.

### Modelo de feedback

`src/data/feedbackTemplates.json`. Estrutura: recognition, learning,
adjustment, next_step. Vinculados por `archetypeId` + `taskTemplateId` +
`decision`. Modelo com ambos `null` é fallback genérico.

### Rubrica

`src/data/rubrics.json`. Cada critério tem peso. Use `notes` pra explicar
ao supervisor como interpretar.

### Pergunta do diagnóstico

`src/data/questions.json`. Cuidado: alterar pesos muda o resultado de quem
está respondendo agora. Antes de mudar:

1. Rode `node src/utils/scoring.test.mjs` (preserva os 4 testes existentes).
2. Adicione novos casos de teste se a mudança for grande.
3. Atualize `CONTENT_GUIDE.md` se mudou semântica de campos.

## Pré-visualizar

`/admin/preview` deixa você escolher arquétipo, dor principal e setor — e
mostra a tela de Resultado como a pessoa veria. Use sempre antes de
publicar mudança em arquétipo ou na primeira tarefa.

## Source Refresh (`/admin/fontes`)

Mostra:

- **Conteúdos para revisar** — `nextReview` vencido OU `sourceStatus` em
  needs_review/broken_link/outdated
- **Oportunidades para revisar** — mesma regra
- **Casos em rascunho** — não saem dessa lista até virarem `active`
- **Tarefas com alta taxa de falha (30 dias)** — taxa > 40% e ≥ 5 envios.
  Sinal de que a tarefa precisa ser reescrita ou simplificada.
- **Gaps abertos** — registros em `content_gaps` que ainda não foram
  resolvidos.
- **Revisões vencidas no banco** — `content_reviews` com `next_review`
  vencido.

"Marcar revisado" insere uma nova linha em `content_reviews` com
`next_review = hoje + intervalo do tipo`. O intervalo está definido em
`src/services/contentService.js → REVIEW_INTERVAL_DAYS`.

## Cronograma de revisão

| Tipo          | A cada      |
| ------------- | ----------- |
| Resource      | 180 dias    |
| Case          | 365 dias    |
| Opportunity   | 90 dias     |
| Task          | 365 dias    |
| Archetype     | 365 dias    |
| Question      | 365 dias    |

## Spotting content gaps

Sinais de que algo precisa ser revisto:

- Taxa de falha de tarefa > 40% (aparece em /admin/fontes)
- Pergunta com alta abandono no diagnóstico (futuro: telemetria)
- Conteúdo com `qualityScore` ≤ 2 (mude pra `draft` se não dá pra melhorar)
- Comentário recorrente de supervisor em `task_reviews.custom_comment`
  apontando o mesmo problema
- Pedido de ajuda recorrente sobre o mesmo tema (sinal de gap educacional)

Quando detectar gap, registre em `content_gaps`:

```sql
INSERT INTO content_gaps (type, reference_id, metric, observation)
VALUES ('task_failure', 'task_xxx', 0.55, 'Taxa subiu depois da mudança X');
```

## Cadastro de supervisores

```sql
INSERT INTO supervisors (user_id, email, name, role)
VALUES ('<uuid de auth.users>', 'pessoa@email.com', 'Nome', 'supervisor');
```

Pra desativar:

```sql
UPDATE supervisors SET active = false WHERE email = 'pessoa@email.com';
```

Pra promover a admin:

```sql
UPDATE supervisors SET role = 'admin' WHERE email = 'pessoa@email.com';
```

## Copyright

**Nunca** colar texto de fonte protegida (Sebrae, HBS, BCB, Pescadoras).
Sempre escrever resumo nas nossas palavras e linkar pra fonte. Casos sempre
com `caseAuthenticityType` declarado.

## Evidências de tarefa (fotos)

A entrepreneur pode anexar até 3 evidências por envio de tarefa. Cada
evidência é uma URL — geralmente uma foto enviada via câmera, mas pode
ser link externo (Google Drive, etc.).

### O que está em produção

- Botão **Tirar foto** abre a câmera direto no celular (atributo
  `capture="environment"`). Sem fricção de "selecionar arquivo".
- Botão **Escolher do celular** abre a galeria.
- Link **ou colar um link** abre input pra URL externa.
- Cada foto é comprimida no cliente antes do upload (lado maior 1280px,
  JPEG 0.78). Foto de 6 MB sai em ~250 KB.
- Thumbnails aparecem após o upload, com botão de remover.
- Limite de 3 fotos por envio (constante `MAX_PHOTOS` em
  `src/pages/TaskDetail.jsx`).

### Schema

A coluna `task_submissions.evidence_url` é `TEXT[]` desde a migration
`0004_evidence_multi.sql`. Linhas antigas com URL única foram convertidas
pra array de 1 item automaticamente. O supervisor vê todas as fotos como
galeria de thumbnails clicáveis na tela de revisão.

### Bucket `task-evidence`

Continua público no MVP (qualquer pessoa com a URL vê a foto). Pra
endurecer pós-MVP: tornar privado e servir via signed URLs com expiração
curta. A coluna `evidence_url` aceita signed URLs sem mudanças no schema.

### Quando aumentar o limite

`MAX_PHOTOS` está em 3 propositalmente — força foco. Se a tarefa exige
muitas fotos (ex.: catálogo completo), provavelmente o que precisa virar
um link externo (Drive, Pinterest) e não enxurrada de fotos. Pra
aumentar mesmo assim, é mudar a constante e nada mais (o array no banco
suporta qualquer tamanho).

## Campanhas de doação (Pix)

A plataforma **não cobra** dos empreendedores e **não busca lucro**. Mas tem
custo de servidor, conteúdo e voluntariado. O pipeline de doações via Pix
permite pedir apoio voluntário sem virar paywall.

### Como funciona

1. Migration `0003_donations.sql` cria a tabela `donation_campaigns` com uma
   linha desabilitada de exemplo.
2. Admin entra em `/admin/doacoes` e edita: título, mensagem, valores
   sugeridos (R$ 1, R$ 5, R$ 10 por padrão), chave Pix, URL do QR code, e
   onde mostrar.
3. Marca `Banner ativo`.
4. O componente `DonationBanner` aparece nas páginas escolhidas (Resultado,
   Minha Trilha, Tela de aprendizado, Home) pra quem ainda não dispensou.
5. Quando o usuário clica em "Doar →", abre o `DonationSheet` com os valores
   selecionáveis e a chave Pix pra copiar (ou QR pra escanear).

### O que NÃO faz

- **Não processa pagamento.** A pessoa transfere manualmente pelo app de
  banco. A plataforma só exibe a chave/QR.
- **Não rastreia se a pessoa doou.** Não tem reconciliação com extrato Pix,
  não envia recibo.
- **Não condiciona acesso.** A Trilha continua igual pra todo mundo.

### Antes de habilitar

- Garantir que a chave Pix está num CNPJ ou MEI ativo, em nome de quem
  recebe legalmente.
- Conferir com contabilidade: doação recebida via Pix tem regra fiscal
  específica (livro caixa, declaração de IR para PF doadora, etc.).
- Hospedar a imagem do QR num CDN público (Supabase Storage funciona) e
  colar URL na configuração.
- Se for pra mais de uma campanha em sequência, a interface preserva o
  histórico — basta clicar "Criar nova campanha" pra arquivar a atual.

### Próximos passos quando quiser processar Pix de verdade

Não está incluído nesta versão. Exigiria:

- Integração com PSP (Mercado Pago, PicPay, Asaas, etc.)
- Tabela `donation_transactions` ligando intent do usuário → cobrança real
- Webhook que confirma pagamento
- Recibo automático
- Relatório de doações por mês

Quando essa decisão for tomada, criar nova migration e gateway separado.

## Riscos / o que monitorar

- **Bucket `task-evidence` é público no MVP** — qualquer pessoa com a URL
  vê a foto. Postcoms-MVP migrar pra signed URLs.
- **`plan_token` é o único factor de autenticação do entrepreneur** — se
  vazar, conta vazou. Educar usuárias a não compartilhar a URL completa.
- **Conteúdo seed cresce no bundle** — se passar de ~500kb, vale lazy-load
  por rota.
- **Sem rate limiting** — Supabase RLS protege dados, mas spam de help
  requests é possível. Monitorar volume.
