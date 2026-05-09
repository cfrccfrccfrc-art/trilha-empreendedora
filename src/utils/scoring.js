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
      if (b.score !== a.score) return b.score - a.score;
      return tieRank(a.id) - tieRank(b.id);
    });

  const minScore = rules?.minScoreForArchetype ?? 0;
  const fallback = rules?.fallbackArchetype ?? null;
  const top = ranked[0];

  // Engagement floor: even if a tiny archetype has 100% ratio, require a
  // minimum raw score so the user actually engaged with relevant questions.
  const archetypeId =
    top && top.score >= minScore ? top.id : fallback;

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

  return {
    archetypeId,
    archetypeScores,
    archetypeMaxes,
    archetypeRatios: Object.fromEntries(
      ranked.map((e) => [e.id, e.ratio])
    ),
    mainPain,
    secondaryPain,
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
