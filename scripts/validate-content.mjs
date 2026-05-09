#!/usr/bin/env node
// Trilha Empreendedora — content validator
// ----------------------------------------------------------------------------
// Run: npm run validate-content
//
// Validates every JSON file in src/data/ for:
//   - Valid JSON syntax
//   - Required fields per content type
//   - Enum values (status, sourceStatus, type, etc.)
//   - Cross-file references (archetype.firstTaskId → tasks, etc.)
//   - Duplicate IDs within a file
//   - Date format YYYY-MM-DD on review dates
//
// ERRORS fail the script (exit 1). WARNINGS are reported but pass (exit 0).
// Wire to CI via Vercel build hooks if you want hard gates.
// ----------------------------------------------------------------------------

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '../src/data');

const errors = [];
const warnings = [];

const E = (file, ctx, msg) => errors.push({ file, ctx, msg });
const W = (file, ctx, msg) => warnings.push({ file, ctx, msg });

function loadJson(rel) {
  const full = resolve(dataDir, rel);
  if (!existsSync(full)) {
    E(rel, '<root>', 'file not found');
    return null;
  }
  try {
    return JSON.parse(readFileSync(full, 'utf-8'));
  } catch (e) {
    E(rel, '<root>', `JSON parse error: ${e.message}`);
    return null;
  }
}

function loadMiniTrilhas() {
  const out = {};
  const slugs = ['precificacao', 'capital', 'canais'];
  for (const slug of slugs) {
    const data = loadJson(`miniTrilhas/${slug}.json`);
    if (data) out[slug] = data;
  }
  return out;
}

// ---------- Enum constants ----------
const ARCHETYPE_STATUS = ['active', 'draft'];
const RESOURCE_STATUS = ['active', 'draft'];
const RESOURCE_TYPE = ['guide', 'template', 'external_guide', 'external_portal', 'community'];
const SOURCE_STATUS = ['active', 'needs_review', 'broken_link', 'outdated'];
const COMPANION_STATUS = ['active', 'draft'];
const CASE_STATUS = ['active', 'draft'];
const CASE_AUTHENTICITY = [
  'anonymized_local_case',
  'fictionalized_composite_case',
  'teaching_scenario_inspired_by_multiple_sources',
];
const TASK_REVIEW_LEVEL = ['light', 'elevated'];
const TASK_EVIDENCE_TYPE = [
  'optional_text',
  'optional_image',
  'optional_text_or_image',
  'required_text',
  'required_image',
];
const QUESTION_TYPE = ['single_choice', 'multi_choice', 'text_short', 'number'];
const FEEDBACK_DECISION = ['aprovada', 'precisa_ajustar', 'travada', 'encaminhada'];
const SUPERVISION_LEVEL = ['light', 'elevated'];
const OPP_STATUS = ['active', 'draft'];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function checkEnum(file, ctx, field, value, allowed, optional = false) {
  if (value === undefined || value === null) {
    if (!optional) E(file, ctx, `missing required: ${field}`);
    return;
  }
  if (!allowed.includes(value)) {
    E(file, ctx, `${field} has invalid value "${value}" (allowed: ${allowed.join(', ')})`);
  }
}

function checkDate(file, ctx, field, value, optional = true) {
  if (!value) {
    if (!optional) E(file, ctx, `missing required date: ${field}`);
    return;
  }
  if (!DATE_RE.test(value)) {
    W(file, ctx, `${field} not in YYYY-MM-DD format: "${value}"`);
  }
}

function checkUniqueIds(file, items) {
  const seen = new Set();
  for (const item of items) {
    if (!item.id) continue;
    if (seen.has(item.id)) {
      E(file, item.id, 'duplicate id within file');
    }
    seen.add(item.id);
  }
}

function checkRef(file, ctx, field, value, validSet) {
  if (!validSet.has(value)) {
    E(file, ctx, `${field} → "${value}" not found`);
  }
}

// ---------- Load everything ----------
const archetypes = loadJson('archetypes.json') || [];
const tasks = loadJson('taskTemplates.json') || [];
const cases = loadJson('cases.json') || [];
const companions = loadJson('taskCompanions.json') || [];
const resources = loadJson('resources.json') || [];
const opportunities = loadJson('opportunities.json') || [];
const feedback = loadJson('feedbackTemplates.json') || [];
const rubrics = loadJson('rubrics.json') || [];
const fGuides = loadJson('formalizationGuides.json') || [];
const fQuestions = loadJson('formalizationQuestions.json') || [];
const questions = loadJson('questions.json') || [];
const scoringRules = loadJson('scoringRules.json') || {};
const miniTrilhas = loadMiniTrilhas();

// ID sets
const archIds = new Set(archetypes.map((a) => a.id));
const taskIds = new Set(tasks.map((t) => t.id));
const caseIds = new Set(cases.map((c) => c.id));
const resIds = new Set(resources.map((r) => r.id));
const oppIds = new Set(opportunities.map((o) => o.id));
const fbIds = new Set(feedback.map((f) => f.id));
const rubricIds = new Set(rubrics.map((r) => r.id));
const fGuideIds = new Set(fGuides.map((g) => g.id));

// ---------- Validators ----------

function validateArchetypes() {
  const file = 'archetypes.json';
  checkUniqueIds(file, archetypes);
  for (const a of archetypes) {
    const ctx = a.id || '<no-id>';
    if (!a.id) E(file, ctx, 'missing id');
    if (!a.name) E(file, ctx, 'missing name');
    checkEnum(file, ctx, 'status', a.status, ARCHETYPE_STATUS);

    if (a.status !== 'active') continue;

    const required = [
      'shortDescription', 'commonPain', 'avoidNow',
      'expectedLearning', 'firstTaskId', 'roadmap30d',
    ];
    for (const f of required) {
      if (!a[f]) E(file, ctx, `missing required (active): ${f}`);
    }

    if (a.firstTaskId && !taskIds.has(a.firstTaskId)) {
      E(file, ctx, `firstTaskId → "${a.firstTaskId}" not in taskTemplates`);
    }

    if (Array.isArray(a.typicalMistakes)) {
      if (a.typicalMistakes.length < 1) W(file, ctx, 'typicalMistakes is empty');
    } else if (a.status === 'active') {
      W(file, ctx, 'typicalMistakes missing or not array');
    }

    if (Array.isArray(a.roadmap30d)) {
      if (a.roadmap30d.length !== 4) {
        W(file, ctx, `roadmap30d should have 4 weeks, has ${a.roadmap30d.length}`);
      }
      for (const week of a.roadmap30d) {
        if (typeof week.week !== 'number') E(file, ctx, `roadmap week missing numeric week`);
        if (!week.title) E(file, ctx, `roadmap week ${week.week} missing title`);
        if (!Array.isArray(week.tasks) || week.tasks.length === 0) {
          E(file, ctx, `roadmap week ${week.week} has no tasks`);
        } else {
          for (const tid of week.tasks) {
            if (!taskIds.has(tid)) {
              E(file, ctx, `roadmap week ${week.week} → task "${tid}" not in taskTemplates`);
            }
          }
        }
      }
    }

    for (const rid of a.recommendedResources || []) {
      if (!resIds.has(rid)) E(file, ctx, `recommendedResources → "${rid}" not found`);
    }
    for (const cid of a.recommendedCases || []) {
      if (!caseIds.has(cid)) E(file, ctx, `recommendedCases → "${cid}" not found`);
    }
    for (const oid of a.recommendedOpportunities || []) {
      if (!oppIds.has(oid)) E(file, ctx, `recommendedOpportunities → "${oid}" not found`);
    }

    if (a.supervisionLevel) {
      checkEnum(file, ctx, 'supervisionLevel', a.supervisionLevel, SUPERVISION_LEVEL, true);
    }
  }
}

function validateTasks() {
  const file = 'taskTemplates.json';
  checkUniqueIds(file, tasks);
  for (const t of tasks) {
    const ctx = t.id || '<no-id>';
    if (!t.id) E(file, ctx, 'missing id');
    if (!t.title) E(file, ctx, 'missing title');
    if (typeof t.week !== 'number') E(file, ctx, 'missing/invalid week (number)');
    if (!t.action) E(file, ctx, 'missing action');
    if (!t.purpose) E(file, ctx, 'missing purpose');
    if (!t.expectedLearning) E(file, ctx, 'missing expectedLearning');

    checkEnum(file, ctx, 'evidenceType', t.evidenceType, TASK_EVIDENCE_TYPE, true);
    checkEnum(file, ctx, 'reviewLevel', t.reviewLevel, TASK_REVIEW_LEVEL, true);

    if (!Array.isArray(t.reflectionQuestions) || t.reflectionQuestions.length < 2) {
      W(file, ctx, 'reflectionQuestions should have ≥ 2 items');
    }
    if (!Array.isArray(t.commonMistakes) || t.commonMistakes.length < 2) {
      W(file, ctx, 'commonMistakes should have ≥ 2 items');
    }

    if (t.archetypeId && !archIds.has(t.archetypeId)) {
      E(file, ctx, `archetypeId → "${t.archetypeId}" not found`);
    }
  }
}

function validateCases() {
  const file = 'cases.json';
  checkUniqueIds(file, cases);
  for (const c of cases) {
    const ctx = c.id || '<no-id>';
    if (!c.id) E(file, ctx, 'missing id');
    if (!c.title) E(file, ctx, 'missing title');
    checkEnum(file, ctx, 'status', c.status, CASE_STATUS);

    if (c.status !== 'active') continue;

    const required = [
      'region', 'sector', 'archetypes', 'readingTime',
      'dilemma', 'situation', 'options', 'tradeoffs',
      'lessonLearned', 'tropicalizedLesson', 'caseAuthenticityType',
    ];
    for (const f of required) {
      if (c[f] === undefined || c[f] === null || c[f] === '') {
        E(file, ctx, `missing required (active): ${f}`);
      }
    }

    checkEnum(file, ctx, 'caseAuthenticityType', c.caseAuthenticityType, CASE_AUTHENTICITY, true);

    if (!Array.isArray(c.options) || c.options.length < 2) {
      W(file, ctx, 'options should have ≥ 2 items');
    }
    if (!Array.isArray(c.archetypes) || c.archetypes.length === 0) {
      E(file, ctx, 'archetypes is empty');
    } else {
      for (const aid of c.archetypes) {
        if (!archIds.has(aid)) E(file, ctx, `archetypes → "${aid}" not found`);
      }
    }

    if (c.practicalTask && !taskIds.has(c.practicalTask)) {
      E(file, ctx, `practicalTask → "${c.practicalTask}" not in taskTemplates`);
    }
    for (const rid of c.relatedResources || []) {
      if (!resIds.has(rid)) E(file, ctx, `relatedResources → "${rid}" not found`);
    }
  }
}

function validateCompanions() {
  const file = 'taskCompanions.json';
  checkUniqueIds(file, companions);
  for (const c of companions) {
    const ctx = c.id || '<no-id>';
    if (!c.id) E(file, ctx, 'missing id');
    if (!c.taskTemplateId) E(file, ctx, 'missing taskTemplateId');
    if (!c.archetypeId) E(file, ctx, 'missing archetypeId');
    if (!c.personaName) E(file, ctx, 'missing personaName');
    checkEnum(file, ctx, 'status', c.status, COMPANION_STATUS);

    if (c.taskTemplateId && !taskIds.has(c.taskTemplateId)) {
      E(file, ctx, `taskTemplateId → "${c.taskTemplateId}" not in taskTemplates`);
    }
    if (c.archetypeId && !archIds.has(c.archetypeId)) {
      E(file, ctx, `archetypeId → "${c.archetypeId}" not in archetypes`);
    }

    if (c.status !== 'active') continue;

    const required = [
      'region', 'personaContext', 'stumbles',
      'breakthrough', 'outcome', 'whenToAskForHelp',
    ];
    for (const f of required) {
      if (c[f] === undefined || c[f] === null || c[f] === '') {
        E(file, ctx, `missing required (active): ${f}`);
      }
    }

    if (Array.isArray(c.stumbles)) {
      if (c.stumbles.length < 2) W(file, ctx, 'stumbles should have ≥ 2 items');
      for (const [i, s] of c.stumbles.entries()) {
        if (!s.moment) E(file, ctx, `stumbles[${i}] missing moment`);
        if (!s.whatHappened) E(file, ctx, `stumbles[${i}] missing whatHappened`);
        if (!s.whatHelped) E(file, ctx, `stumbles[${i}] missing whatHelped`);
      }
    }

    for (const cid of c.relatedCases || []) {
      if (!caseIds.has(cid)) E(file, ctx, `relatedCases → "${cid}" not found`);
    }
    for (const rid of c.relatedResources || []) {
      if (!resIds.has(rid)) E(file, ctx, `relatedResources → "${rid}" not found`);
    }

    if (c.caseAuthenticityType) {
      checkEnum(file, ctx, 'caseAuthenticityType', c.caseAuthenticityType, CASE_AUTHENTICITY, true);
    }
  }
}

function validateResources() {
  const file = 'resources.json';
  checkUniqueIds(file, resources);
  for (const r of resources) {
    const ctx = r.id || '<no-id>';
    if (!r.id) E(file, ctx, 'missing id');
    if (!r.title) E(file, ctx, 'missing title');
    if (!r.description) E(file, ctx, 'missing description');
    if (!r.source) E(file, ctx, 'missing source');
    if (!r.sourceLink) E(file, ctx, 'missing sourceLink');
    if (!r.topic) E(file, ctx, 'missing topic');

    checkEnum(file, ctx, 'type', r.type, RESOURCE_TYPE, true);
    checkEnum(file, ctx, 'status', r.status, RESOURCE_STATUS);
    checkEnum(file, ctx, 'sourceStatus', r.sourceStatus, SOURCE_STATUS, true);

    checkDate(file, ctx, 'lastReviewed', r.lastReviewed);
    checkDate(file, ctx, 'nextReview', r.nextReview);

    if (typeof r.qualityScore === 'number') {
      if (r.qualityScore < 1 || r.qualityScore > 5) {
        W(file, ctx, `qualityScore should be 1-5, got ${r.qualityScore}`);
      }
    }

    for (const aid of r.recommendedArchetypes || []) {
      if (!archIds.has(aid)) E(file, ctx, `recommendedArchetypes → "${aid}" not found`);
    }

    if (r.body !== undefined) {
      if (!Array.isArray(r.body)) {
        E(file, ctx, 'body must be an array of paragraph strings if present');
      } else {
        r.body.forEach((p, idx) => {
          if (typeof p !== 'string' || !p.trim()) {
            E(file, ctx, `body[${idx}] must be a non-empty string`);
          }
        });
      }
    }
  }
}

function validateOpportunities() {
  const file = 'opportunities.json';
  checkUniqueIds(file, opportunities);
  for (const o of opportunities) {
    const ctx = o.id || '<no-id>';
    if (!o.id) E(file, ctx, 'missing id');
    if (!o.title) E(file, ctx, 'missing title');
    if (!o.description) E(file, ctx, 'missing description');
    if (!o.category) E(file, ctx, 'missing category');
    checkEnum(file, ctx, 'status', o.status, OPP_STATUS);

    for (const aid of o.recommendedArchetypes || []) {
      if (!archIds.has(aid)) E(file, ctx, `recommendedArchetypes → "${aid}" not found`);
    }
  }
}

function validateFeedback() {
  const file = 'feedbackTemplates.json';
  checkUniqueIds(file, feedback);
  for (const f of feedback) {
    const ctx = f.id || '<no-id>';
    if (!f.id) E(file, ctx, 'missing id');
    checkEnum(file, ctx, 'decision', f.decision, FEEDBACK_DECISION);

    if (f.archetypeId && !archIds.has(f.archetypeId)) {
      E(file, ctx, `archetypeId → "${f.archetypeId}" not found`);
    }
    if (f.taskTemplateId && !taskIds.has(f.taskTemplateId)) {
      E(file, ctx, `taskTemplateId → "${f.taskTemplateId}" not found`);
    }
  }
}

function validateRubrics() {
  const file = 'rubrics.json';
  checkUniqueIds(file, rubrics);
  for (const r of rubrics) {
    const ctx = r.id || '<no-id>';
    if (!r.id) E(file, ctx, 'missing id');
    if (!r.name) E(file, ctx, 'missing name');
    if (typeof r.passThreshold !== 'number') E(file, ctx, 'passThreshold must be number');

    if (r.appliesTo && !taskIds.has(r.appliesTo)) {
      W(file, ctx, `appliesTo → "${r.appliesTo}" not in taskTemplates (might be a task type, ignore if intentional)`);
    }

    if (Array.isArray(r.criteria)) {
      const seenCrit = new Set();
      for (const c of r.criteria) {
        if (!c.id) E(file, ctx, 'criterion missing id');
        if (!c.label) E(file, ctx, `criterion ${c.id} missing label`);
        if (typeof c.weight !== 'number') E(file, ctx, `criterion ${c.id} weight must be number`);
        if (seenCrit.has(c.id)) E(file, ctx, `criterion id "${c.id}" duplicated`);
        seenCrit.add(c.id);
      }
    } else {
      E(file, ctx, 'criteria must be an array');
    }
  }
}

function validateFormalization() {
  const fG = 'formalizationGuides.json';
  checkUniqueIds(fG, fGuides);
  for (const g of fGuides) {
    const ctx = g.id || '<no-id>';
    if (!g.id) E(fG, ctx, 'missing id');
    if (!g.name) E(fG, ctx, 'missing name');
    if (!g.shortDescription) E(fG, ctx, 'missing shortDescription');
    if (!g.whatItIs) E(fG, ctx, 'missing whatItIs');
    if (!Array.isArray(g.relatedSources)) {
      W(fG, ctx, 'relatedSources missing or not array');
    } else {
      for (const s of g.relatedSources) {
        if (!s.label || !s.url) E(fG, ctx, 'relatedSources entry missing label or url');
      }
    }
    checkDate(fG, ctx, 'lastReviewed', g.lastReviewed);
    checkDate(fG, ctx, 'nextReview', g.nextReview);
  }

  const fQ = 'formalizationQuestions.json';
  checkUniqueIds(fQ, fQuestions);
  for (const q of fQuestions) {
    const ctx = q.id || '<no-id>';
    if (!q.id) E(fQ, ctx, 'missing id');
    if (!q.text) E(fQ, ctx, 'missing text');
    if (!Array.isArray(q.options) || q.options.length < 2) {
      E(fQ, ctx, 'options must have ≥ 2');
    } else {
      for (const opt of q.options) {
        if (!opt.id) E(fQ, ctx, 'option missing id');
        if (!opt.label) E(fQ, ctx, 'option missing label');
        if (!opt.score || typeof opt.score !== 'object') {
          E(fQ, ctx, `option ${opt.id} missing score object`);
        } else {
          for (const dim of Object.keys(opt.score)) {
            if (!fGuideIds.has(dim)) {
              E(fQ, ctx, `option ${opt.id} score.${dim} not a guide id`);
            }
          }
        }
      }
    }
  }
}

function validateMiniTrilhas() {
  for (const [slug, data] of Object.entries(miniTrilhas)) {
    const file = `miniTrilhas/${slug}.json`;
    if (!data.slug) E(file, '<root>', 'missing slug');
    if (data.slug && data.slug !== slug) {
      E(file, '<root>', `slug field "${data.slug}" doesn't match filename "${slug}"`);
    }
    if (!data.title) E(file, '<root>', 'missing title');
    if (!Array.isArray(data.tieBreakOrder)) E(file, '<root>', 'tieBreakOrder must be array');
    if (!Array.isArray(data.questions)) E(file, '<root>', 'questions must be array');
    if (!Array.isArray(data.guides)) E(file, '<root>', 'guides must be array');

    const guideIds = new Set((data.guides || []).map((g) => g.id));

    for (const tb of data.tieBreakOrder || []) {
      if (!guideIds.has(tb)) E(file, '<root>', `tieBreakOrder "${tb}" not a guide id`);
    }
    if (data.tabLabels) {
      for (const tlk of Object.keys(data.tabLabels)) {
        if (!guideIds.has(tlk)) E(file, '<root>', `tabLabels key "${tlk}" not a guide id`);
      }
    }

    checkUniqueIds(file, data.questions || []);
    for (const q of data.questions || []) {
      const ctx = q.id || '<no-id>';
      if (!q.text) E(file, ctx, 'question missing text');
      if (!Array.isArray(q.options) || q.options.length < 2) {
        E(file, ctx, 'options must have ≥ 2');
        continue;
      }
      for (const opt of q.options) {
        if (!opt.id) E(file, ctx, 'option missing id');
        if (!opt.label) E(file, ctx, 'option missing label');
        if (!opt.score || typeof opt.score !== 'object') {
          E(file, ctx, `option ${opt.id} missing score`);
        } else {
          for (const dim of Object.keys(opt.score)) {
            if (!guideIds.has(dim)) {
              E(file, ctx, `option ${opt.id} score.${dim} not a guide id`);
            }
          }
        }
      }
    }

    checkUniqueIds(file, data.guides || []);
    for (const g of data.guides || []) {
      const ctx = g.id || '<no-id>';
      if (!g.name) E(file, ctx, 'guide missing name');
      if (!g.shortDescription) E(file, ctx, 'guide missing shortDescription');
      if (!g.nextStep) E(file, ctx, 'guide missing nextStep');
    }
  }
}

function validateQuestions() {
  const file = 'questions.json';
  checkUniqueIds(file, questions);
  const orders = new Set();
  for (const q of questions) {
    const ctx = q.id || '<no-id>';
    if (!q.id) E(file, ctx, 'missing id');
    if (!q.section) W(file, ctx, 'missing section');
    if (typeof q.order !== 'number') E(file, ctx, 'order must be number');
    else {
      if (orders.has(q.order)) E(file, ctx, `duplicate order ${q.order}`);
      orders.add(q.order);
    }
    checkEnum(file, ctx, 'type', q.type, QUESTION_TYPE);
    if (!q.text) E(file, ctx, 'missing text');

    if (q.type === 'single_choice' || q.type === 'multi_choice') {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        E(file, ctx, 'options must have ≥ 2');
        continue;
      }
      for (const opt of q.options) {
        if (!opt.id) E(file, ctx, 'option missing id');
        if (!opt.label) E(file, ctx, 'option missing label');
        if (opt.scoring?.archetypes) {
          for (const aid of Object.keys(opt.scoring.archetypes)) {
            if (!archIds.has(aid)) {
              E(file, ctx, `option ${opt.id} scoring.archetypes "${aid}" not in archetypes`);
            }
          }
        }
      }
    }
  }
}

function validateScoringRules() {
  const file = 'scoringRules.json';
  if (!Array.isArray(scoringRules.tieBreakOrder)) {
    E(file, '<root>', 'tieBreakOrder must be array');
  } else {
    for (const aid of scoringRules.tieBreakOrder) {
      if (!archIds.has(aid)) E(file, '<root>', `tieBreakOrder "${aid}" not in archetypes`);
    }
    const missing = [...archIds].filter((id) => !scoringRules.tieBreakOrder.includes(id));
    if (missing.length) {
      W(file, '<root>', `archetypes not in tieBreakOrder: ${missing.join(', ')}`);
    }
  }
  if (scoringRules.fallbackArchetype && !archIds.has(scoringRules.fallbackArchetype)) {
    E(file, '<root>', `fallbackArchetype "${scoringRules.fallbackArchetype}" not in archetypes`);
  }
  if (typeof scoringRules.minScoreForArchetype !== 'number') {
    E(file, '<root>', 'minScoreForArchetype must be number');
  }
  if (typeof scoringRules.painThreshold !== 'number') {
    E(file, '<root>', 'painThreshold must be number');
  }
}

// ---------- Run all ----------
validateArchetypes();
validateTasks();
validateCases();
validateCompanions();
validateResources();
validateOpportunities();
validateFeedback();
validateRubrics();
validateFormalization();
validateMiniTrilhas();
validateQuestions();
validateScoringRules();

// ---------- Report ----------
const total =
  archetypes.length +
  tasks.length +
  cases.length +
  companions.length +
  resources.length +
  opportunities.length +
  feedback.length +
  rubrics.length +
  fGuides.length +
  fQuestions.length +
  questions.length;

console.log(`\nValidated ${total} content items across ${Object.keys(miniTrilhas).length + 12} files`);

if (warnings.length) {
  console.log(`\n⚠  ${warnings.length} warning${warnings.length === 1 ? '' : 's'}:`);
  for (const w of warnings) {
    console.log(`   ${w.file} | ${w.ctx} | ${w.msg}`);
  }
}

if (errors.length) {
  console.log(`\n✗  ${errors.length} error${errors.length === 1 ? '' : 's'}:`);
  for (const e of errors) {
    console.log(`   ${e.file} | ${e.ctx} | ${e.msg}`);
  }
  console.log('');
  process.exit(1);
}

console.log('\n✓  All content valid' + (warnings.length ? ' (with warnings)' : ''));
process.exit(0);
