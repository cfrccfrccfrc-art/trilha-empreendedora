// Reads from the (authenticated) supervisor client.
// Each function returns a list of "gaps" with enough context to act.

const FAILURE_STATUSES = ['Fiz em parte', 'Não consegui'];

export async function fetchTaskFailureRates(authClient, { sinceDays = 30 } = {}) {
  const since = new Date(Date.now() - sinceDays * 86400 * 1000).toISOString();
  const { data, error } = await authClient
    .from('task_submissions')
    .select('task_id, status_reported, submitted_at, tasks(task_template_id, title)')
    .gte('submitted_at', since);
  if (error) throw error;

  const buckets = new Map();
  for (const row of data || []) {
    const tplId = row.tasks?.task_template_id;
    if (!tplId) continue;
    if (!buckets.has(tplId)) {
      buckets.set(tplId, { tplId, title: row.tasks?.title, total: 0, failed: 0 });
    }
    const b = buckets.get(tplId);
    b.total += 1;
    if (FAILURE_STATUSES.includes(row.status_reported)) b.failed += 1;
  }
  return Array.from(buckets.values())
    .map((b) => ({
      ...b,
      failureRate: b.total === 0 ? 0 : b.failed / b.total,
    }))
    .filter((b) => b.total >= 5 && b.failureRate > 0.4)
    .sort((a, b) => b.failureRate - a.failureRate);
}

export async function fetchOverdueContentReviews(authClient) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await authClient
    .from('content_reviews')
    .select('*')
    .lte('next_review', today)
    .order('next_review', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchOpenContentGaps(authClient) {
  const { data, error } = await authClient
    .from('content_gaps')
    .select('*')
    .is('resolved_at', null)
    .order('detected_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchPendingSubmissions(authClient, filters = {}) {
  let query = authClient
    .from('task_submissions')
    .select(`
      id, status_reported, text_response, evidence_url, obstacle, needs_help, submitted_at,
      task_id,
      tasks ( id, title, week, review_level, task_template_id, plan_id ),
      user_id,
      users ( id, name, city, neighborhood ),
      task_reviews ( id )
    `)
    .order('submitted_at', { ascending: true });

  if (filters.needsHelp) query = query.eq('needs_help', true);
  if (filters.status) query = query.eq('status_reported', filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).filter((s) => !s.task_reviews || s.task_reviews.length === 0);
}

// Schedule for next_review based on content type.
// Source-of-truth for the refresh cadence used by SourceRefresh.jsx.
export const REVIEW_INTERVAL_DAYS = {
  resource: 180,
  case: 365,
  opportunity: 90,
  task: 365,
  archetype: 365,
  question: 365,
  default: 180,
};

export function nextReviewDate(contentType, fromDate = new Date()) {
  const days =
    REVIEW_INTERVAL_DAYS[contentType] ?? REVIEW_INTERVAL_DAYS.default;
  const d = new Date(fromDate);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
