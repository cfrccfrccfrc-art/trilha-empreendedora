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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
