// Generic scorer for mini-trilhas: each option has score: { dim1: N, dim2: N, ... }.
// Sums across questions, picks highest, breaks ties by data.tieBreakOrder.

export function scoreMiniTrilha(answers, data) {
  const dims = data.tieBreakOrder.reduce((acc, d) => {
    acc[d] = 0;
    return acc;
  }, {});

  for (const q of data.questions) {
    const ans = answers?.[q.id];
    if (!ans) continue;
    const opt = q.options?.find((o) => o.id === ans);
    if (!opt?.score) continue;
    for (const dim of Object.keys(dims)) {
      dims[dim] += opt.score[dim] || 0;
    }
  }

  const sorted = Object.entries(dims).sort(([aId, a], [bId, b]) => {
    if (b !== a) return b - a;
    return data.tieBreakOrder.indexOf(aId) - data.tieBreakOrder.indexOf(bId);
  });

  const [topId, topScore] = sorted[0];
  const recommendedId =
    topScore === 0 ? data.tieBreakOrder[data.tieBreakOrder.length - 1] : topId;

  return {
    recommendedId,
    totals: dims,
    secondId: sorted[1]?.[0] ?? null,
  };
}
