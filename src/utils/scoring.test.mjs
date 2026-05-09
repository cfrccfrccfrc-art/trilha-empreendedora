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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
