// Run with: node src/utils/scoring.test.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { scoreAnswers } from './scoring.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '../data');
const load = (name) =>
  JSON.parse(readFileSync(resolve(dataDir, name), 'utf-8'));

const questions = load('questions.json');
const archetypes = load('archetypes.json');
const rules = load('scoringRules.json');

let pass = 0;
let fail = 0;
const assert = (name, cond, detail) => {
  if (cond) {
    console.log(`  ok  ${name}`);
    pass++;
  } else {
    console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`);
    fail++;
  }
};

console.log('Test 1: finance-blind path → vende_sem_lucro');
const financeBlind = {
  q_stage_selling: 'sells_regularly',
  q_finances_track: 'no',
  q_finances_profit: 'never_calculated',
  q_finances_mix: 'all_together',
  q_finances_costs: 'never_calculated',
  q_finances_price: 'dontknow',
  q_goals_main: 'no_idea_profit',
  q_goals_30days: 'know_profit',
};
const r1 = scoreAnswers(financeBlind, questions, archetypes, rules);
assert(
  'archetypeId === vende_sem_lucro',
  r1.archetypeId === 'vende_sem_lucro',
  `got ${r1.archetypeId}, scores=${JSON.stringify(r1.archetypeScores)}`
);
assert(
  'mainPain === financas',
  r1.mainPain === 'financas',
  `got ${r1.mainPain}, painScores=${JSON.stringify(r1.painScores)}`
);
assert('flags includes finance_blind', r1.flags.includes('finance_blind'));
assert(
  'recommendedTaskId === task_anotar_7_dias',
  r1.recommendedTaskId === 'task_anotar_7_dias',
  `got ${r1.recommendedTaskId}`
);

console.log('\nTest 2: empty answers → fallback');
const r2 = scoreAnswers({}, questions, archetypes, rules);
assert(
  'archetypeId === ainda_e_ideia (fallback)',
  r2.archetypeId === 'ainda_e_ideia',
  `got ${r2.archetypeId}`
);
assert('mainPain === null', r2.mainPain === null);
assert('flags is empty', r2.flags.length === 0);

console.log('\nTest 3: idea-stage path → fallback or ainda_e_ideia');
const ideaStage = {
  q_stage_selling: 'just_idea',
  q_stage_time: 'never_sold',
  q_sector_what: 'dontknow',
  q_sector_audience: 'no_clients',
};
const r3 = scoreAnswers(ideaStage, questions, archetypes, rules);
assert(
  'archetypeId === ainda_e_ideia',
  r3.archetypeId === 'ainda_e_ideia',
  `got ${r3.archetypeId}, scores=${JSON.stringify(r3.archetypeScores)}`
);

console.log('\nTest 4: ops-heavy path → operacao_travada');
const opsHeavy = {
  q_stage_selling: 'sells_regularly',
  q_stage_time: 'gt_1y',
  q_ops_routine: 'very_late',
  q_ops_help: 'all_alone',
  q_ops_organization: 'lost',
  q_goals_main: 'ops_stuck',
};
const r4 = scoreAnswers(opsHeavy, questions, archetypes, rules);
assert(
  'archetypeId === operacao_travada',
  r4.archetypeId === 'operacao_travada',
  `got ${r4.archetypeId}, scores=${JSON.stringify(r4.archetypeScores)}`
);

console.log('\n--- Test 5: mixed weak signals favor the archetype with strongest ratio ---');
// Mild finance issues + strong ops issues. Used to go to vsl (more questions).
// Should now go to operacao_travada because its ratio is higher.
const mixedOps = {
  q_stage_selling: 'sells_regularly',  // vsl +2
  q_finances_track: 'yes_rough',       // vsl +1, financa +1
  q_finances_mix: 'try_separate',       // vsl +1, financa +1
  q_ops_routine: 'very_late',           // operacao +3, operacao pain +3
  q_ops_organization: 'lost',           // operacao +3, operacao pain +2
  q_goals_main: 'ops_stuck',            // operacao +2
};
const r5 = scoreAnswers(mixedOps, questions, archetypes, rules);
console.log('  archetypeId:', r5.archetypeId);
console.log('  scores nonzero:', Object.fromEntries(Object.entries(r5.archetypeScores).filter(([, v]) => v)));
console.log('  ratios:', Object.fromEntries(Object.entries(r5.archetypeRatios).filter(([, v]) => v > 0).map(([k, v]) => [k, v.toFixed(2)])));
assert(
  'mixed-with-stronger-ops → operacao_travada (was vsl before)',
  r5.archetypeId === 'operacao_travada',
  `got ${r5.archetypeId}`
);

console.log('\n--- Test 6: only mild finance signal does NOT trigger vsl ---');
// Just answering "yes_rough" on a couple of finance questions.
// Used to accumulate enough vsl points to win. Now ratio is too low.
const mildFinance = {
  q_finances_track: 'yes_rough',  // vsl +1
  q_finances_mix: 'try_separate', // vsl +1
};
const r6 = scoreAnswers(mildFinance, questions, archetypes, rules);
console.log('  archetypeId:', r6.archetypeId);
console.log('  vsl ratio:', r6.archetypeRatios?.vende_sem_lucro?.toFixed(2));
assert(
  'mild-finance-only → fallback (raw 2 < min 3)',
  r6.archetypeId === 'ainda_e_ideia',
  `got ${r6.archetypeId}`
);

console.log(
  '\n--- Test 7: 1+ano organizado + falta clientes → produto_bom_vitrine_fraca ---'
);
// Pessoa com fundamentos no lugar (MEI, 1+ano, finanças OK, divulga online) mas
// dor explícita "faltam clientes". Antes do fix 1.2 caía em negocio_consolidado
// porque ratio alto + tiebreak. Agora deve cair em produto_bom_vitrine_fraca.
const orgWantsClients = {
  q_stage_selling: 'sells_regularly',
  q_stage_time: 'gt_1y',
  q_time_dedication: 'gt_30h',
  q_channels_online: 'rare',
  q_finances_track: 'yes_detailed',
  q_finances_profit: 'yes_monthly',
  q_finances_costs: 'yes_per_item',
  q_capital_formal: 'mei',
  q_goals_main: 'no_clients',
};
const r7 = scoreAnswers(orgWantsClients, questions, archetypes, rules);
console.log('  archetypeId:', r7.archetypeId);
console.log(
  '  scores nonzero:',
  Object.fromEntries(
    Object.entries(r7.archetypeScores).filter(([, v]) => v)
  )
);
assert(
  '1+ano organizado + dor=clientes NÃO cai em negocio_consolidado',
  r7.archetypeId !== 'negocio_consolidado',
  `got ${r7.archetypeId}`
);
assert(
  '1+ano organizado + dor=clientes → produto_bom_vitrine_fraca',
  r7.archetypeId === 'produto_bom_vitrine_fraca',
  `got ${r7.archetypeId}`
);

console.log(
  '\n--- Test 8: consolidado de verdade (todos sinais fortes) → negocio_consolidado ---'
);
// Pessoa que tem TODOS os sinais estruturais fortes E não declara dor
// específica de fundamento. Continua caindo em negocio_consolidado mesmo
// com o threshold maior.
const trueConsolidated = {
  q_stage_selling: 'sells_regularly',
  q_stage_time: 'gt_1y',
  q_time_dedication: 'gt_30h',
  q_channels_online: 'frequent',
  q_finances_track: 'yes_detailed',
  q_finances_profit: 'yes_monthly',
  q_finances_costs: 'yes_per_item',
  q_capital_formal: 'cnpj',
};
const r8 = scoreAnswers(trueConsolidated, questions, archetypes, rules);
console.log('  archetypeId:', r8.archetypeId);
console.log(
  '  negocio_consolidado score:',
  r8.archetypeScores.negocio_consolidado
);
assert(
  'consolidado de verdade → negocio_consolidado',
  r8.archetypeId === 'negocio_consolidado',
  `got ${r8.archetypeId} (score=${r8.archetypeScores.negocio_consolidado})`
);

console.log(
  '\n--- Test 9: had_closed em q_stage_selling → recomecou_apos_falir ---'
);
// Pessoa marca "Já tive negócio, fechei, quero voltar". Tem que cair em
// recomecou_apos_falir mesmo que pontue em outros arquétipos por outras
// respostas (porque +5 é mais que score acumulado normal em poucas perguntas).
const hadClosed = {
  q_stage_selling: 'had_closed',
};
const r9 = scoreAnswers(hadClosed, questions, archetypes, rules);
console.log('  archetypeId:', r9.archetypeId);
console.log('  flags:', r9.flags);
assert(
  'had_closed sozinho → recomecou_apos_falir',
  r9.archetypeId === 'recomecou_apos_falir',
  `got ${r9.archetypeId}`
);
assert(
  'flag restart_after_close presente',
  r9.flags.includes('restart_after_close')
);

console.log(
  '\n--- Test 10: caregiver em q_home_business_reason → cuidador_empreendedor ---'
);
// Pessoa marca "cuido de alguém em casa". Tem que cair em cuidador_empreendedor
// mesmo que pontue em outros arquétipos por outras respostas (porque +5 supera
// score acumulado normal em poucas perguntas).
const caregiver = {
  q_home_business_reason: 'caregiver',
};
const r10 = scoreAnswers(caregiver, questions, archetypes, rules);
console.log('  archetypeId:', r10.archetypeId);
console.log('  flags:', r10.flags);
assert(
  'caregiver sozinho → cuidador_empreendedor',
  r10.archetypeId === 'cuidador_empreendedor',
  `got ${r10.archetypeId}`
);
assert(
  'flag caregiver presente',
  r10.flags.includes('caregiver')
);

console.log(
  '\n--- Test 11: empreendedora_sobrecarregada (sem caregiver) ainda funciona ---'
);
// Pessoa pontua forte em sobrecarregada mas NÃO escolhe caregiver. Tem que
// cair em sobrecarregada, não em cuidador.
const overloaded = {
  q_stage_selling: 'sells_regularly',
  q_time_dedication: 'lt_5h',
  q_goals_main: 'time_overload',
  q_home_business_reason: 'by_choice',
};
const r11 = scoreAnswers(overloaded, questions, archetypes, rules);
console.log('  archetypeId:', r11.archetypeId);
assert(
  'overloaded sem caregiver → empreendedora_sobrecarregada',
  r11.archetypeId === 'empreendedora_sobrecarregada',
  `got ${r11.archetypeId}`
);

console.log(
  '\n--- Test 12: digital na frente + base fraca → digital_antes_da_base ---'
);
// Divulga muito na internet, mas não sabe lucro nem custo. É o perfil do
// arquétipo: digital desenvolvido, base comercial/financeira atrasada.
const digitalAheadWeakBase = {
  q_channels_online: 'frequent',          // digital +3, negocio +2
  q_finances_profit: 'never_calculated',  // digital +1, vsl +2
  q_finances_costs: 'never_calculated',   // digital +1, vsl +1
};
const r12 = scoreAnswers(digitalAheadWeakBase, questions, archetypes, rules);
console.log('  archetypeId:', r12.archetypeId);
console.log(
  '  scores nonzero:',
  Object.fromEntries(Object.entries(r12.archetypeScores).filter(([, v]) => v))
);
assert(
  'digital forte + base fraca → digital_antes_da_base',
  r12.archetypeId === 'digital_antes_da_base',
  `got ${r12.archetypeId}, score=${r12.archetypeScores.digital_antes_da_base}`
);

console.log(
  '\n--- Test 13: divulga muito MAS base no lugar → NÃO é digital_antes_da_base ---'
);
// Posta com frequência (digital +3) mas sabe lucro e custo. Sem buraco de base,
// não bate o piso 4 do arquétipo. Protege contra falso-positivo.
const digitalButSolid = {
  q_channels_online: 'frequent',     // digital +3, negocio +2
  q_finances_profit: 'yes_monthly',  // negocio +2
  q_finances_costs: 'yes_per_item',  // negocio +2
};
const r13 = scoreAnswers(digitalButSolid, questions, archetypes, rules);
console.log('  archetypeId:', r13.archetypeId);
console.log(
  '  digital score:',
  r13.archetypeScores.digital_antes_da_base
);
assert(
  'digital forte mas base ok NÃO cai em digital_antes_da_base (piso 4)',
  r13.archetypeId !== 'digital_antes_da_base',
  `got ${r13.archetypeId}, digital score=${r13.archetypeScores.digital_antes_da_base}`
);

console.log(
  '\n--- Test 14: ideia preliminar + emprego fixo → ainda_e_ideia (não renda_complementar) ---'
);
// Regressão: ter emprego fixo é sinal de tempo, não de já tirar renda de um
// negócio. "Só a ideia" + "trabalho fixo" não pode virar renda_complementar.
const ideaWithJob = {
  q_stage_selling: 'just_idea',
  q_stage_time: 'never_sold',
  q_about_motivation: 'support_family',
  q_time_other_job: 'fixed_job',
  q_goals_main: 'not_started',
};
const r14 = scoreAnswers(ideaWithJob, questions, archetypes, rules);
console.log('  archetypeId:', r14.archetypeId);
assert(
  'ideia + emprego fixo NÃO cai em renda_complementar',
  r14.archetypeId !== 'renda_complementar',
  `got ${r14.archetypeId}`
);
assert('ideia + emprego fixo → ainda_e_ideia', r14.archetypeId === 'ainda_e_ideia');

console.log(
  '\n--- Test 15: renda complementar legítima ainda funciona ---'
);
// Vende de vez em quando, tem emprego, pouco tempo, sustenta família.
const genuineSideIncome = {
  q_stage_selling: 'sells_sometimes',
  q_about_motivation: 'support_family',
  q_time_dedication: 'lt_5h',
  q_time_other_job: 'fixed_job',
};
const r15 = scoreAnswers(genuineSideIncome, questions, archetypes, rules);
console.log('  archetypeId:', r15.archetypeId);
assert(
  'vende às vezes + emprego + pouco tempo → renda_complementar',
  r15.archetypeId === 'renda_complementar',
  `got ${r15.archetypeId}`
);

console.log(
  '\n--- Test 16: sobrecarga por excesso de horas → empreendedora_sobrecarregada ---'
);
// Regressão (persona Rosângela): trabalha 30h+ sozinha, vende no bairro/
// comunidade e quer resolver a sobrecarga de tempo. Antes do ajuste em
// q_time_dedication[gt_30h], o excesso de horas dava ZERO para sobrecarregada
// e o sinal local vazava para vende_comunidade_nao_online (teto menor, ratio
// maior). O peso +1 em gt_30h corrige isso sem mexer no max do arquétipo.
const overloadedByHours = {
  q_stage_selling: 'sells_regularly',
  q_time_dedication: 'gt_30h',
  q_ops_help: 'all_alone',
  q_goals_main: 'time_overload',
  q_sector_audience: 'neighborhood',
  q_channels_clients: ['community'],
  q_community_neighborhood: 'all_know',
};
const r16 = scoreAnswers(overloadedByHours, questions, archetypes, rules);
console.log('  archetypeId:', r16.archetypeId);
assert(
  '30h+ sozinha + sobrecarga → empreendedora_sobrecarregada',
  r16.archetypeId === 'empreendedora_sobrecarregada',
  `got ${r16.archetypeId}, ratios=${JSON.stringify(r16.archetypeRatios)}`
);
assert(
  'NÃO cai em vende_comunidade_nao_online',
  r16.archetypeId !== 'vende_comunidade_nao_online',
  `got ${r16.archetypeId}`
);

console.log(
  '\n--- Test 17: ideia digital validada por sinais → negocio_digital_inicio ---'
);
// Persona Márcia/Tiago: ideia online (sector digital) + público da internet +
// canal redes sociais. Antes do 16º arquétipo, caía em ainda_e_ideia (trilha
// de produto físico). Agora o sinal de setor digital + corroboração leva ao
// arquétipo certo, com ratio alto (6/6).
const digitalIdea = {
  q_stage_selling: 'just_idea',
  q_sector_what: 'digital_online',
  q_sector_audience: 'online',
  q_channels_clients: ['social'],
  q_goals_main: 'not_started',
};
const r17 = scoreAnswers(digitalIdea, questions, archetypes, rules);
console.log('  archetypeId:', r17.archetypeId);
assert(
  'ideia digital com corroboração → negocio_digital_inicio',
  r17.archetypeId === 'negocio_digital_inicio',
  `got ${r17.archetypeId}, ratios=${JSON.stringify(r17.archetypeRatios)}`
);
assert(
  'recommendedTaskId === task_validar_dor_digital',
  r17.recommendedTaskId === 'task_validar_dor_digital',
  `got ${r17.recommendedTaskId}`
);

console.log(
  '\n--- Test 18: piso protege — só "setor digital" sem corroboração NÃO dispara ---'
);
// Marca setor digital mas dá zero sinal adicional (público de indicação, sem
// canal). Score 3 < piso 4 → não pode roubar de ainda_e_ideia; volta pro
// arquétipo de ideia comum.
const digitalNoCorrob = {
  q_stage_selling: 'just_idea',
  q_sector_what: 'digital_online',
  q_sector_audience: 'referrals',
  q_goals_main: 'not_started',
};
const r18 = scoreAnswers(digitalNoCorrob, questions, archetypes, rules);
console.log('  archetypeId:', r18.archetypeId);
assert(
  'setor digital sem corroboração NÃO vira negocio_digital_inicio',
  r18.archetypeId !== 'negocio_digital_inicio',
  `got ${r18.archetypeId}, score=${r18.archetypeScores.negocio_digital_inicio}`
);
assert(
  'cai em ainda_e_ideia (fallback de ideia comum)',
  r18.archetypeId === 'ainda_e_ideia',
  `got ${r18.archetypeId}`
);

console.log(
  '\n--- Test 19: empate de ratio 1.0 — identidade cuidador vence a saturação de sobrecarregada ---'
);
// Persona P7: é cuidadora (motivo de empreender em casa = cuidar de alguém) E
// também acumula sinais de sobrecarga (30h+, sozinha, cuida da família no lugar
// de emprego, meta = aliviar tempo). cuidador satura em 5/5 (ratio 1.0) e
// sobrecarregada em 7/7 (ratio 1.0). Antes do ajuste de desempate, o RAW maior
// (7 > 5) fazia sobrecarregada roubar — reintroduzindo o viés de contagem de
// perguntas que o ratio existe pra neutralizar. Agora o desempate é por
// tieBreakOrder (curadoria), e a IDENTIDADE de cuidadora prevalece.
const caregiverOverloaded = {
  q_home_business_reason: 'caregiver',
  q_time_dedication: 'gt_30h',
  q_time_other_job: 'family',
  q_ops_help: 'all_alone',
  q_goals_main: 'time_overload',
};
const r19 = scoreAnswers(caregiverOverloaded, questions, archetypes, rules);
console.log('  archetypeId:', r19.archetypeId);
console.log('  ratios:', JSON.stringify(r19.archetypeRatios));
assert(
  'empate 1.0 cuidador vs sobrecarregada → cuidador_empreendedor',
  r19.archetypeId === 'cuidador_empreendedor',
  `got ${r19.archetypeId}`
);
assert('flag caregiver presente', r19.flags.includes('caregiver'));

console.log(
  '\n--- Test 20: empate de ratio 1.0 — identidade recomeço vence a saturação de precisa_capital ---'
);
// Persona P8: fechou um negócio antes (had_closed → recomecou 5/5, ratio 1.0) e
// agora precisa de capital pra recomeçar — sinais de capital saturam
// precisa_capital em 9/9 (ratio 1.0). Antes, o RAW 9 > 5 dava precisa_capital e
// a pessoa caía numa trilha de capital, perdendo a leitura central: ela está
// RECOMEÇANDO depois de falir. tieBreakOrder agora coloca recomecou acima de
// precisa_capital, então a identidade do recomeço prevalece no empate.
const restartNeedsCapital = {
  q_stage_selling: 'had_closed',
  q_capital_need: 'urgent',
  q_capital_money: 'none',
  q_capital_credit: 'considering',
  q_goals_main: 'no_capital',
  q_goals_30days: 'more_money',
};
const r20 = scoreAnswers(restartNeedsCapital, questions, archetypes, rules);
console.log('  archetypeId:', r20.archetypeId);
console.log('  ratios:', JSON.stringify(r20.archetypeRatios));
assert(
  'empate 1.0 recomecou vs precisa_capital → recomecou_apos_falir',
  r20.archetypeId === 'recomecou_apos_falir',
  `got ${r20.archetypeId}`
);
assert('flag restart_after_close presente', r20.flags.includes('restart_after_close'));

console.log(
  '\n--- Test 21 (Fix B): pré-receita não recebe `financas` como dor principal ---'
);
// Persona P19 Fernanda: só tem a ideia (just_idea / never_sold). Ao responder as
// perguntas de dinheiro, a resposta HONESTA de quem não vende é "não sei / nunca
// calculei" — o que antes acumulava `financas` e fazia a dor principal ser
// finanças, semeando a missão "anote seu caixa por 7 dias" pra um negócio que
// não tem caixa. Fix B: com sinal de pré-receita, a dor `financas` é suprimida.
const preRevenueFinance = {
  q_stage_selling: 'just_idea',
  q_stage_time: 'never_sold',
  q_finances_track: 'no',
  q_finances_profit: 'never_calculated',
  q_finances_mix: 'all_together',
};
const r21 = scoreAnswers(preRevenueFinance, questions, archetypes, rules);
console.log('  mainPain:', r21.mainPain, 'painScores:', JSON.stringify(r21.painScores));
assert(
  'pré-receita: `financas` NÃO é a dor principal',
  r21.mainPain !== 'financas',
  `got mainPain=${r21.mainPain}, painScores=${JSON.stringify(r21.painScores)}`
);
assert(
  'pré-receita: `financas` removida de painScores',
  !('financas' in r21.painScores),
  `painScores=${JSON.stringify(r21.painScores)}`
);

// Guard-rail: quem VENDE regularmente e é cego pra finanças (Test 1) continua
// recebendo `financas` — a supressão é só pra pré-receita.
const sellingFinanceBlind = scoreAnswers(financeBlind, questions, archetypes, rules);
assert(
  'guard-rail: quem vende mantém `financas` como dor principal',
  sellingFinanceBlind.mainPain === 'financas',
  `got ${sellingFinanceBlind.mainPain}`
);

console.log(
  '\n--- Test 22 (border): integração — empate cuidador/sobrecarregada aponta o 2º perfil ---'
);
// Reusa a persona do Test 19 (empate de ratio 1.0 entre cuidador e
// sobrecarregada, primeiras tarefas DIFERENTES). A trilha principal continua
// cuidador, mas o resultado deve sinalizar a fronteira apontando o 2º perfil.
const r22 = scoreAnswers(caregiverOverloaded, questions, archetypes, rules);
assert(
  'empate com 1ª tarefa diferente → borderArchetypeId = empreendedora_sobrecarregada',
  r22.borderArchetypeId === 'empreendedora_sobrecarregada',
  `got ${r22.borderArchetypeId}`
);

console.log(
  '\n--- Test 23 (border): vencedor isolado NÃO marca fronteira ---'
);
// had_closed sozinho (Test 9): recomecou domina e ninguém mais bate o piso.
const r23 = scoreAnswers(hadClosed, questions, archetypes, rules);
assert(
  'vencedor isolado → borderArchetypeId = null',
  r23.borderArchetypeId === null,
  `got ${r23.borderArchetypeId}`
);

console.log(
  '\n--- Test 24 (border): lógica isolada (fixture sintético) ---'
);
// Fixture mínimo pra exercitar os 3 caminhos da zona de fronteira sem depender
// do conteúdo real (que pode mudar). A e C compartilham a mesma 1ª tarefa; B
// tem tarefa própria.
const synthArchetypes = [
  { id: 'A', firstTaskId: 'taskA' },
  { id: 'B', firstTaskId: 'taskB' },
  { id: 'C', firstTaskId: 'taskA' },
];
const synthQuestions = [
  {
    id: 'qA',
    type: 'single_choice',
    options: [
      { id: 'a', scoring: { archetypes: { A: 5 } } },
      { id: 'na', scoring: {} },
    ],
  },
  {
    id: 'qB',
    type: 'single_choice',
    options: [
      { id: 'b', scoring: { archetypes: { B: 5 } } },
      { id: 'b3', scoring: { archetypes: { B: 3 } } },
      { id: 'nb', scoring: {} },
    ],
  },
  {
    id: 'qC',
    type: 'single_choice',
    options: [
      { id: 'c', scoring: { archetypes: { C: 5 } } },
      { id: 'nc', scoring: {} },
    ],
  },
];
const synthRules = {
  tieBreakOrder: ['A', 'B', 'C'],
  minScoreForArchetype: 3,
  fallbackArchetype: 'A',
  borderZone: { enabled: true, maxRatioGap: 0.1 },
};

// 24a: empate A/B (ratios 1.0), 1ª tarefa diferente → fronteira = B
const s1 = scoreAnswers({ qA: 'a', qB: 'b' }, synthQuestions, synthArchetypes, synthRules);
assert(
  '24a empate 1ª-tarefa-diferente → border = B',
  s1.archetypeId === 'A' && s1.borderArchetypeId === 'B',
  `got winner=${s1.archetypeId}, border=${s1.borderArchetypeId}`
);

// 24b: empate A/C (ratios 1.0), MESMA 1ª tarefa → suprimido
const s2 = scoreAnswers({ qA: 'a', qC: 'c' }, synthQuestions, synthArchetypes, synthRules);
assert(
  '24b empate mesma-1ª-tarefa → border suprimido (null)',
  s2.archetypeId === 'A' && s2.borderArchetypeId === null,
  `got winner=${s2.archetypeId}, border=${s2.borderArchetypeId}`
);

// 24c: gap grande (A=1.0, B=0.6) → não é fronteira mesmo batendo o piso
const s3 = scoreAnswers({ qA: 'a', qB: 'b3' }, synthQuestions, synthArchetypes, synthRules);
assert(
  '24c gap > maxRatioGap → border = null',
  s3.archetypeId === 'A' && s3.borderArchetypeId === null,
  `got winner=${s3.archetypeId}, border=${s3.borderArchetypeId}, ratios=${JSON.stringify(s3.archetypeRatios)}`
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
