# Guia de Conteúdo — Trilha Empreendedora

Este guia define a barra de qualidade do conteúdo da plataforma. Conteúdo
mediano dilui o produto. Quando em dúvida, marque como `draft` em vez de
publicar algo fraco.

## Como editar conteúdo (fluxo recomendado)

Conteúdo vive em `src/data/` como JSON. Você não precisa editar JSON na mão — pode usar Claude Opus a partir de MD.

### Fluxo MD → JSON

1. Escreva ou edite o conteúdo em **Markdown** (qualquer editor — Notion, Obsidian, .md no GitHub).
2. Cole no Claude Opus com:
   > "Converta esse [caso/arquétipo/companheiro] pro schema do `[X.json]` da Trilha Empreendedora. Use essa entrada existente como template: [colar 1 entrada do JSON]. Mantenha todos os campos obrigatórios e siga o tom (português coloquial, sem anglicismos)."
3. Claude devolve JSON. Cole no arquivo certo em `src/data/`.
4. Rode **`npm run validate-content`** antes de commitar. Se passar, está pronto pra deploy.

### Validador automático

```bash
npm run validate-content
```

Checa, em todos os 15 arquivos de conteúdo:
- Sintaxe JSON válida
- Campos obrigatórios presentes (varia por tipo)
- Enums com valores permitidos (status, type, sourceStatus, evidenceType, etc.)
- IDs únicos dentro de cada arquivo
- **Referências cruzadas resolvem** (`archetype.firstTaskId` → tasks, `case.relatedResources` → resources, etc.)
- Datas em formato YYYY-MM-DD (warning, não bloqueia)
- Quantidades mínimas em arrays (≥ 2 reflectionQuestions, ≥ 2 commonMistakes, etc.)

Saída ao final:
- `✓ All content valid` → seguro pra commitar
- `✗ N errors` → cada erro com `arquivo | id-do-item | descrição`. Conserta e roda de novo.

Use o validador como guarda-chuva: se passar, o conteúdo não vai quebrar a aplicação.

### Pra quando você usar Claude Opus pra gerar conteúdo novo

Inclua no prompt:
> "O resultado precisa passar no validador `scripts/validate-content.mjs`. Em particular: todos os IDs cruzados (firstTaskId, relatedCases, etc.) devem apontar pra IDs reais — eu te mando a lista de IDs válidos junto."

E cole as IDs disponíveis dos arquivos relevantes. Claude segue.

## Princípios

1. **Qualidade vence quantidade.** Um caso bem escrito vale mais que cinco
   genéricos. A spec original é explícita: marque `status: "draft"` em vez de
   encher com filler.
2. **Linguagem simples e direta.** Português falado, frases curtas, palavras
   do dia a dia. Evite jargão de business school. Se um termo técnico é
   inevitável, explique entre parênteses na primeira aparição.
3. **Tropicalização obrigatória.** Conteúdo importado (caso de outro país,
   método estrangeiro) precisa explicar como se aplica no Brasil — bairro,
   feira, MEI, microcrédito local, WhatsApp. Sem tropicalização, vira
   exotismo.
4. **Sem promessas.** Conteúdo nunca promete sucesso, retorno garantido,
   crédito aprovado, lucro mínimo. Trabalhamos com cenários, hipóteses e
   probabilidades.
5. **Direito autoral**: nunca reproduza texto de Sebrae, HBS, BCB, Pescadoras
   ou qualquer outra fonte. Sempre escreva o resumo nas suas palavras e
   linke pra fonte original.

## Tipos de conteúdo

### Arquétipos (`src/data/archetypes.json`)

Cada arquétipo precisa ter:

- `name` — nome curto, em fala (não vira título de livro)
- `shortDescription` — 1-2 frases que a pessoa lê e reconhece
- `commonPain` — 1 frase concreta, sem jargão, no tom "você"
- `typicalMistakes` — 3 bullets, cada um uma armadilha real
- `firstTaskId` — id da tarefa que o arquétipo recebe primeiro
- `avoidNow` — 1 frase específica do que NÃO fazer agora
- `expectedLearning` — a verdade que a trilha vai entregar
- `roadmap30d` — 4 semanas, cada uma com 1-2 tarefas
- `supervisionLevel` — `light` | `elevated`
- `warningFlags` — bandeiras que ativam revisão extra (ex.: `finance_blind`,
  `capital_pressure`)

Marque `status: "active"` só quando todos os campos estiverem preenchidos com
qualidade. Caso contrário, deixe `draft` e a página de Resultados mostra um
estado "em construção" honesto.

### Tarefas (`src/data/taskTemplates.json`)

Cada tarefa precisa:

- `action` — o que fazer, em uma frase imperativa
- `purpose` — por que fazer (1 frase)
- `expectedLearning` — a verdade que a tarefa entrega
- `reflectionQuestions` — 3 perguntas pra pessoa pensar
- `commonMistakes` — 3 armadilhas previsíveis
- `evidenceType` — `optional_text` | `optional_image` | `optional_text_or_image` | `required_text` | `required_image`
- `reviewLevel` — `light` (auto-aprovação possível) | `elevated` (revisão obrigatória)

Tarefas com decisão financeira ou risco de dívida devem ser `elevated`.

### Conteúdos / Resources (`src/data/resources.json`)

- Para conteúdo Trilha original: `source: "Trilha Empreendedora"`,
  `sourceLink` é caminho relativo (`/conteudos/...`).
- Para conteúdo externo (Sebrae, BCB, Pescadoras): cite a fonte e linke pro
  original. Nunca colar texto deles.
- `description` é SEMPRE escrita por nós, com palavras nossas.
- `qualityScore` 1-5 — mantemos só score ≥ 3 com `status: "active"`.
- `sourceStatus`: `active` | `needs_review` | `broken_link` | `outdated`.
- `lastReviewed` / `nextReview`: datas no formato `YYYY-MM-DD`.

### Casos (`src/data/cases.json`)

**Regras críticas de copyright e autenticidade:**

- **Nunca** reproduza HBS, MIT, Insead, Stanford, ou qualquer caso publicado.
- Use sempre `caseAuthenticityType`:
  - `anonymized_local_case` — caso real anonimizado (com permissão)
  - `fictionalized_composite_case` — composto de várias situações reais
  - `teaching_scenario_inspired_by_multiple_sources` — situação ensaiada
- Caso curto (3-7 min de leitura no mobile)
- Cenário em Brasil, Índia, Quênia, Colômbia, Bangladesh ou similar — sempre
  com tropicalização ao final
- Estrutura obrigatória:
  1. `situation`
  2. `dilemma`
  3. `options` (3 opções concretas)
  4. `tradeoffs`
  5. `lessonLearned` ("O que esse caso ensina")
  6. `tropicalizedLesson` ("Como isso se aplica no Brasil")
  7. `practicalTask` (id de tarefa real da plataforma)
  8. `relatedResources` (ids)
  9. `helpTrigger` ("Quando pedir ajuda")

### Companheiros de tarefa (`src/data/taskCompanions.json`)

Companheiros são histórias curtas de uma persona executando **uma tarefa
específica**. Diferente dos casos (que mostram um dilema de decisão), os
companheiros mostram **a jornada da execução** — onde a pessoa tropeçou, o
que ajudou em cada momento, e qual foi a virada de chave.

Servem como auto-ajuda: aparecem na tela da tarefa e na tela de
aprendizado quando o supervisor marca `precisa_ajustar` ou `travada`. A
ideia é destravar a pessoa antes que ela precise de um humano.

Schema obrigatório:

- `id` — string única (ex.: `companion_anotar_7_dias_marlene`)
- `taskTemplateId` — id da tarefa que esse companheiro acompanha
- `archetypeId` — para contexto do leitor
- `personaName` — nome da persona (preferencialmente o mesmo de um caso já
  publicado, para criar continuidade narrativa)
- `region` — onde a história se passa
- `personaContext` — 1-2 frases situando quem é a pessoa
- `stumbles` — array de 3 momentos. Cada um:
  - `moment` — "Dia 1", "Pessoa 4", "Primeira tentativa", etc.
  - `whatHappened` — o tropeço, em narrativa
  - `whatHelped` — o ajuste que destravou
- `breakthrough` — a virada de chave (1 parágrafo)
- `outcome` — o que a pessoa fez na sequência (1-2 frases)
- `whenToAskForHelp` — sinal honesto de quando NÃO basta o companheiro e
  vale escalar para humano
- `relatedCases` — opcional, ids de casos da mesma persona
- `relatedResources` — opcional, ids de conteúdos relacionados
- `caseAuthenticityType` — mesma regra dos casos
- `status` — `active` | `draft`
- `version`

**Reuso de personas dos casos:** sempre que possível, use o mesmo persona
que aparece em um caso já publicado. Cria continuidade: o caso mostra a
pessoa decidindo, o companheiro mostra a mesma pessoa fazendo.

**Tom:** narrativo, presente, primeira ou terceira pessoa. Evite
moralizar. Deixe o tropeço ser tropeço, sem julgar a pessoa por ele.

**Cobertura:** prioridade é a primeira tarefa do roadmap de cada arquétipo
ativo (é onde mais gente trava). Tarefas de risco financeiro elevado
(capital, crédito) precisam de companheiro com `whenToAskForHelp` que
oriente a procurar revisão humana.

**Cobertura por compartilhamento de tarefa:** quando dois arquétipos têm a
mesma tarefa no roadmap (ex.: `task_anotar_7_dias` aparece em
`vende_sem_lucro` e em `digital_antes_da_base`), um único companheiro
cobre os dois. Não precisa duplicar com persona diferente — a página é a
mesma porque a tarefa é a mesma. Hoje:

- `digital_antes_da_base` reusa a Marlene (`task_anotar_7_dias`,
  `task_custo_3_produtos`, `task_revisar_precos`) e a Priya
  (`task_fotos_3_produtos`).
- `talento_sem_postura_comercial` reusa o Carlos
  (`task_lista_servicos_precos`).

**Múltiplos capítulos da mesma persona:** quando uma persona tem
companheiros em mais de uma tarefa do mesmo arquétipo (ex.: Marlene em
toda a trilha de 30 dias do `vende_sem_lucro`), a página de companheiro
mostra automaticamente uma seção "Outros capítulos da história de [X]"
com links pros outros capítulos. Isso cria continuidade narrativa sem
você precisar amarrar à mão.

### Oportunidades (`src/data/opportunities.json`)

- **NÃO oferecer crédito.** Educação financeira sobre crédito sim, oferta
  de crédito não.
- Categorias: `curso_online`, `mentoria`, `feira_evento`, `rede`,
  `educacao_financeira`, `compra_coletiva`, `oficina`, `apoio_juridico`.
- Verificar `sourceStatus` antes de listar como `active`.
- Para programas externos com URLs que mudam (Sebrae): `sourceStatus:
  "needs_review"` e prazo de revisão de 90 dias.

## Diversidade de fontes

Manter na biblioteca de conteúdo:

- ~25% Trilha Empreendedora original (controlamos a qualidade e o link)
- ~30% Sebrae (educação para microempreendedor)
- ~15% Banco Central / educação financeira oficial
- ~15% Conteúdo setorial (alimentação, beleza, moda, artesanato)
- ~15% Pescadoras / metodologia inspiradora

Se algum bloco está faltando, isso é um gap — registre em `content_gaps`.

## Cronograma de revisão

Definido em `src/services/contentService.js → REVIEW_INTERVAL_DAYS`:

| Tipo          | Revisar a cada |
| ------------- | -------------- |
| Resource      | 180 dias       |
| Case          | 365 dias       |
| Opportunity   | 90 dias        |
| Task          | 365 dias       |
| Archetype     | 365 dias       |
| Question      | 365 dias       |

A página `/admin/fontes` mostra o que está vencido ou marcado como
`needs_review`.

## Fluxo de publicação

1. Editar o JSON em `src/data/`.
2. Validar localmente: `npm run dev` e abrir as páginas afetadas.
3. Rodar `node src/utils/scoring.test.mjs` para garantir que o scoring não
   quebrou (se você editou questions ou archetypes).
4. Commit + push + deploy.
5. Marcar `lastReviewed` na próxima revisão (página de fontes).

## O que NÃO fazer

- Copiar texto de Sebrae, HBS, BCB ou Pescadoras
- Inventar URLs externas que talvez não existam
- Publicar conteúdo de outra cultura sem tropicalização
- Marcar `active` algo que você marcaria `draft` se outra pessoa fosse ler
- Prometer retorno financeiro, aprovação de crédito, ou sucesso garantido
- Adicionar arquétipo sem testar uma rota de respostas que leve a ele
