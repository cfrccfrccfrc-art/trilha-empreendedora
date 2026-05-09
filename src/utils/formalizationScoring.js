// Recommends one of: 'pf', 'mei', 'cnpj_outros' based on a quiz answer set.
// Pure function. Tie-break order: mei > pf > cnpj_outros (MEI is the safe
// default — start small, formalize, reconsider later).

const TIE_BREAK = ['mei', 'pf', 'cnpj_outros'];

export function scoreFormalization(answers, questions) {
  const totals = { pf: 0, mei: 0, cnpj_outros: 0 };

  for (const q of questions) {
    const ans = answers?.[q.id];
    if (!ans) continue;
    const opt = q.options?.find((o) => o.id === ans);
    if (!opt?.score) continue;
    for (const k of Object.keys(totals)) {
      totals[k] += opt.score[k] || 0;
    }
  }

  const sorted = Object.entries(totals).sort(
    ([aId, aScore], [bId, bScore]) => {
      if (bScore !== aScore) return bScore - aScore;
      return TIE_BREAK.indexOf(aId) - TIE_BREAK.indexOf(bId);
    }
  );

  const [topId, topScore] = sorted[0];
  // If literally everything is 0 (no answers), fall back to PF.
  const recommendedId = topScore === 0 ? 'pf' : topId;

  return {
    recommendedId,
    totals,
    secondId: sorted[1]?.[0] ?? null,
  };
}
