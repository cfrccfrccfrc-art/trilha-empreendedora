// Computes the theoretical maximum each archetype could earn if a user picked
// the most-favorable answer to every question. Used to normalize scores —
// without this, archetypes that appear in MORE questions win mechanically.
//
// For single_choice: per question, take the max weight across options
// (user picks ONE option, so worst case = highest single-option weight).
// For multi_choice: per question, sum all option weights (user could pick
// every option).
function computeArchetypeMaxes(questions, archetypes) {
  const maxes = {};
  for (const a of archetypes) maxes[a.id] = 0;

  for (const q of questions) {
    if (q.type === 'single_choice') {
      const qMax = {};
      for (const opt of q.options || []) {
        for (const [aid, w] of Object.entries(opt.scoring?.archetypes || {})) {
          if (!(aid in qMax) || w > qMax[aid]) qMax[aid] = w;
        }
      }
      for (const [aid, w] of Object.entries(qMax)) {
        maxes[aid] = (maxes[aid] || 0) + w;
      }
    } else if (q.type === 'multi_choice') {
      for (const opt of q.options || []) {
        for (const [aid, w] of Object.entries(opt.scoring?.archetypes || {})) {
          maxes[aid] = (maxes[aid] || 0) + w;
        }
      }
    }
  }
  return maxes;
}

export function scoreAnswers(answers, questions, archetypes, rules) {
  const archetypeScores = {};
  const painScores = {};
  const flagSet = new Set();

  for (const a of archetypes) archetypeScores[a.id] = 0;
  const archetypeMaxes = computeArchetypeMaxes(questions, archetypes);

  for (const q of questions) {
    const answer = answers?.[q.id];
    if (answer === undefined || answer === null || answer === '') continue;

    if (q.type === 'single_choice') {
      const opt = q.options?.find((o) => o.id === answer);
      if (opt) applyOptionScoring(opt, archetypeScores, painScores, flagSet);
    } else if (q.type === 'multi_choice') {
      const ids = Array.isArray(answer) ? answer : [];
      for (const id of ids) {
        const opt = q.options?.find((o) => o.id === id);
        if (opt) applyOptionScoring(opt, archetypeScores, painScores, flagSet);
      }
    }
  }

  const tieRank = (id) => {
    const i = rules?.tieBreakOrder?.indexOf(id);
    return i === undefined || i === -1 ? Number.POSITIVE_INFINITY : i;
  };

  // Rank by RATIO (score / theoretical max), so an archetype with fewer
  // discriminating questions can still win when its few signals are strong.
  // Archetypes with 0 max are unreachable and excluded from ranking.
  const ranked = Object.entries(archetypeScores)
    .filter(([id]) => (archetypeMaxes[id] || 0) > 0)
    .map(([id, score]) => ({
      id,
      score,
      ratio: score / archetypeMaxes[id],
    }))
    .sort((a, b) => {
      if (b.ratio !== a.ratio) return b.ratio - a.ratio;
      // On an exact ratio tie, prefer the curated priority (tieBreakOrder)
      // over raw score. Raw score would reintroduce the question-count bias
      // that ratio normalization exists to neutralize — letting a broad
      // saturating archetype steal a tie from a narrow identity archetype
      // (e.g. cuidador/recomecou at ratio 1.0). Raw is the last resort.
      const ra = tieRank(a.id);
      const rb = tieRank(b.id);
      if (ra !== rb) return ra - rb;
      return b.score - a.score;
    });

  const minScore = rules?.minScoreForArchetype ?? 0;
  const perArchetype = rules?.minScorePerArchetype || {};
  const fallback = rules?.fallbackArchetype ?? null;

  // Walk the ranking and pick the first archetype that meets its own
  // threshold. Per-archetype thresholds override the global one. This lets
  // us require, e.g., that `negocio_consolidado` only wins with a strong
  // raw score, while keeping the global floor low for narrower archetypes.
  let archetypeId = fallback;
  for (const cand of ranked) {
    const needed = perArchetype[cand.id] ?? minScore;
    if (cand.score >= needed) {
      archetypeId = cand.id;
      break;
    }
  }

  // Fix B: someone who hasn't sold yet has no cash flow to track. Answering
  // "não sei / nunca calculei" on the money questions is the HONEST answer for
  // a pre-revenue idea — it shouldn't surface `financas` as their main pain,
  // nor seed an "anote seu caixa por 7 dias" mission for a business with no
  // caixa. When a pre-revenue signal is present, drop the suppressed pains.
  const preRev = rules?.preRevenuePainSuppression;
  if (preRev?.pains?.length) {
    const isPreRevenue = Object.entries(preRev.signals || {}).some(
      ([qid, optIds]) => {
        const ans = answers?.[qid];
        if (Array.isArray(ans)) return ans.some((v) => optIds.includes(v));
        return optIds.includes(ans);
      }
    );
    if (isPreRevenue) {
      for (const p of preRev.pains) delete painScores[p];
    }
  }

  const painThreshold = rules?.painThreshold ?? 0;
  const sortedPains = Object.entries(painScores)
    .filter(([, s]) => s >= painThreshold)
    .sort(([aId, aScore], [bId, bScore]) => {
      if (bScore !== aScore) return bScore - aScore;
      return aId.localeCompare(bId);
    });

  const mainPain = sortedPains[0]?.[0] ?? null;
  const secondaryPain = sortedPains[1]?.[0] ?? null;

  const archetype = archetypes.find((a) => a.id === archetypeId);
  const recommendedTaskId = archetype?.firstTaskId ?? null;

  // --- Border zone -------------------------------------------------------
  // When the runner-up is nearly as strong as the chosen archetype, the
  // reading is genuinely "between two". We surface that honestly as a light
  // pointer to the second profile — NOT a second 30-day trail, which would
  // fight the product's whole premise of focus. Guardrails:
  //   1. Both must clear their own score threshold (so a near-zero ratio tie
  //      between two low-signal archetypes never counts as a border).
  //   2. The normalized (ratio) gap must be within borderZone.maxRatioGap.
  //   3. Suppressed when both share the same first task — there is no
  //      practical fork to communicate; the next step is identical either way.
  let borderArchetypeId = null;
  const borderCfg = rules?.borderZone;
  if (borderCfg?.enabled && archetypeId) {
    const winnerEntry = ranked.find((e) => e.id === archetypeId);
    // `ranked` is sorted and `archetypeId` is the first entry that cleared its
    // threshold, so the next entry that also clears its threshold is the
    // runner-up.
    const runnerUp = ranked.find(
      (e) => e.id !== archetypeId && e.score >= (perArchetype[e.id] ?? minScore)
    );
    if (winnerEntry && runnerUp) {
      const gap = winnerEntry.ratio - runnerUp.ratio;
      const firstTaskOf = (id) =>
        archetypes.find((a) => a.id === id)?.firstTaskId ?? null;
      const sameFirstTask =
        firstTaskOf(archetypeId) &&
        firstTaskOf(archetypeId) === firstTaskOf(runnerUp.id);
      if (gap <= (borderCfg.maxRatioGap ?? 0.1) && !sameFirstTask) {
        borderArchetypeId = runnerUp.id;
      }
    }
  }

  return {
    archetypeId,
    archetypeScores,
    archetypeMaxes,
    archetypeRatios: Object.fromEntries(
      ranked.map((e) => [e.id, e.ratio])
    ),
    mainPain,
    secondaryPain,
    borderArchetypeId,
    painScores,
    flags: Array.from(flagSet),
    recommendedTaskId,
  };
}

function applyOptionScoring(opt, archetypeScores, painScores, flagSet) {
  const s = opt.scoring || {};
  if (s.archetypes) {
    for (const [id, w] of Object.entries(s.archetypes)) {
      archetypeScores[id] = (archetypeScores[id] || 0) + w;
    }
  }
  if (s.pains) {
    for (const [id, w] of Object.entries(s.pains)) {
      painScores[id] = (painScores[id] || 0) + w;
    }
  }
  if (Array.isArray(s.flags)) {
    for (const f of s.flags) flagSet.add(f);
  }
}
