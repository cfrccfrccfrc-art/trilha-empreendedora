# Guia do Supervisor — Trilha Empreendedora

Este guia explica como fazer revisão de tarefas dentro da plataforma. O
papel do supervisor é o que separa "app de questionário" de "trilha real".

## Acesso

1. Vá em `/supervisor/login`
2. Coloque seu e-mail e clique em "Receber link mágico"
3. Abra o e-mail e clique no link — você cai direto na fila

Você precisa estar cadastrada na tabela `supervisors` (ativa). Se você fez
login mas vê "acesso restrito", peça pra um admin te cadastrar.

## A fila

`/supervisor` mostra todas as submissões que ainda não receberam revisão
(`task_reviews` vazio). Filtros disponíveis:

- **Status reportado** — Fiz / Fiz em parte / Não consegui
- **Perfil** — arquétipo da pessoa
- **Pediu ajuda** — quem marcou "Preciso de ajuda com isso"

Clique em qualquer card pra abrir a tela de revisão.

## Review levels

Tarefas têm `review_level`:

- **`light`** — pode ser auto-aprovada se a pessoa marcou "Fiz" e não pediu
  ajuda. Você só precisa revisar se ela marcou "Fiz em parte" ou "Não
  consegui".
- **`elevated`** — sempre exige revisão humana. Tarefas que envolvem decisão
  financeira (capital, crédito, investimento) são sempre elevated.

## Rubricas

Tarefas com rubrica vinculada (ex.: `task_anotar_7_dias` → "Controle de
caixa básico") aparecem com checklist na tela de revisão. Marque os
critérios que a pessoa atendeu. O total guia a decisão:

- Acima do `passThreshold` → aprovar
- Abaixo, mas algum critério crítico atendido → pedir ajuste
- Quase nada atendido → marcar como travada

A rubrica não decide por você — é uma referência. Use seu julgamento.

## Modelos de feedback

A tela carrega modelos relevantes para a combinação `taskTemplateId +
archetypeId + decision`. Cada modelo tem 4 campos:

- **recognition** — começa pelo que a pessoa fez bem
- **learning** — explica a verdade que a tarefa devia ensinar
- **adjustment** — só quando o status é `precisa_ajustar` — diga o que
  refazer e como
- **next_step** — próxima missão ou pausa

Use o modelo como ponto de partida, mas adapte. Se for pedir ajuste,
mencione algo concreto da resposta dela.

## Decisões disponíveis

| Decisão              | Quando usar                                                | O que acontece com a tarefa |
| -------------------- | ---------------------------------------------------------- | --------------------------- |
| **Aprovar**          | Tarefa cumprida, aprendizado evidente                      | `concluida`                 |
| **Pedir ajuste**     | Tentou mas faltou algo importante                          | `precisa_ajustar`           |
| **Marcar travada**   | A pessoa não conseguiu mesmo tentando                      | volta a `a_fazer`           |
| **Encaminhar ajuda** | Tema requer voluntário humano (foto, planilha, equipamento) | fica `enviada` + abre `help_request` |
| **Escalar**          | Risco financeiro, jurídico ou pessoal                       | fica `enviada` (admin pega) |

## Quando escalar

Escale (decisão "Escalar") quando:

- A pessoa está prestes a tomar empréstimo, parcelar grande no cartão, ou
  garantir empréstimo de outra pessoa
- A pessoa relatou problema pessoal sério (saúde, violência, dívida que já
  está afetando a casa)
- Há sinal de informalidade ilegal (não MEI legítimo: venda de produto
  proibido, bebida sem alvará pra menor, etc.)
- A pessoa está pedindo aconselhamento jurídico ou contábil específico
- O caso fica fora da sua competência

Escalar não é sair da conversa — é dizer "isso aqui precisa de outro olhar".

## O que NÃO aconselhar

A plataforma é educativa, não consultiva. **Nunca** dê:

- **Promessa de crédito** ("você consegue empréstimo X")
- **Indicação específica de banco ou financeira** ("vai no banco Y, pega
  com fulano")
- **Aconselhamento jurídico individual** ("você pode/não pode fazer X
  legalmente") — sempre direcionar pra apoio jurídico
- **Aconselhamento contábil individual** ("declare X no IR")
- **Aconselhamento financeiro individual** ("invista em X", "venda Y agora")
- **Diagnóstico médico ou psicológico**, mesmo que pareça óbvio

Quando a pessoa precisa de algo dessas categorias, encaminhe pra ajuda
(categoria `apoio_juridico`, `educacao_financeira`, etc.) e diga que vai
buscar um voluntário com experiência específica.

## Tom

- Comece pelo que ela fez bem.
- Diga a verdade sem suavizar demais — se o preço está abaixo do custo, fala.
- Termine com uma ação concreta, não um abraço genérico.
- Português falado. Sem "vossa mercê".

## Fluxo do trabalho

1. Abra `/supervisor`.
2. Filtra por status reportado = "Fiz em parte" pra começar pelos casos onde
   sua revisão muda mais coisa.
3. Abra um card.
4. Leia a resposta da pessoa, evidência (se tiver), obstáculo, se pediu
   ajuda.
5. Marque a rubrica (se houver).
6. Escolha decisão.
7. Selecione modelo de feedback (opcional) ou escreva direto no comentário.
8. "Salvar revisão".
9. Volte pra fila.

Cada revisão vira `task_reviews` no banco. A pessoa vê seu comentário na
próxima vez que abrir `/tarefa/:id/aprendizado`.

## Cuidado com tempo

Revisão boa exige atenção. Se você está cansada e prestes a aprovar tudo
sem ler, pare. Volte depois. Aprovação automática mal feita é pior do que
tarefa pendente.
