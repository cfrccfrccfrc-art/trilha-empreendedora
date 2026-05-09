// Pure helper: decides whether a submission can be auto-approved.
// Kept separate so it's testable without a Supabase client.
export function shouldAutoApprove({ task, statusReported, needsHelp }) {
  if (needsHelp) return false;
  if (statusReported !== 'Fiz') return false;
  return task?.review_level === 'light';
}

// Side-effectful: writes submission, optionally writes review + help_request,
// updates task.status. Returns the inserted submission and a flag.
export async function submitTask(client, params) {
  const {
    task,
    userId,
    statusReported,
    textResponse,
    evidenceUrls,
    obstacle,
    needsHelp,
  } = params;

  const evidenceArray = Array.isArray(evidenceUrls)
    ? evidenceUrls.filter(Boolean)
    : [];

  const { data: submission, error: submissionError } = await client
    .from('task_submissions')
    .insert({
      task_id: task.id,
      user_id: userId,
      status_reported: statusReported,
      text_response: textResponse || null,
      evidence_url: evidenceArray.length > 0 ? evidenceArray : null,
      obstacle: obstacle || null,
      needs_help: !!needsHelp,
    })
    .select()
    .single();
  if (submissionError) throw submissionError;

  await client
    .from('tasks')
    .update({ status: 'enviada' })
    .eq('id', task.id);

  const autoApproved = shouldAutoApprove({
    task,
    statusReported,
    needsHelp,
  });

  if (autoApproved) {
    const { error: reviewError } = await client.from('task_reviews').insert({
      submission_id: submission.id,
      reviewer_id: null,
      review_status: 'aprovada',
      next_action: 'concluida',
    });
    if (reviewError) throw reviewError;

    const { error: completeError } = await client
      .from('tasks')
      .update({
        status: 'concluida',
        completed_at: new Date().toISOString(),
      })
      .eq('id', task.id);
    if (completeError) throw completeError;
  }

  if (needsHelp) {
    await client.from('help_requests').insert({
      user_id: userId,
      task_id: task.id,
      submission_id: submission.id,
      topic: 'tarefa',
      message: textResponse || null,
      status: 'aberto',
    });
  }

  return { submission, autoApproved };
}

export function buildTasksForPlan({ planId, archetype, taskTemplates }) {
  if (!archetype?.roadmap30d) return [];
  return archetype.roadmap30d.flatMap((week) =>
    (week.tasks || []).map((taskId) => {
      const tpl = taskTemplates.find((t) => t.id === taskId);
      return {
        plan_id: planId,
        task_template_id: taskId,
        title: tpl?.title || taskId,
        description: tpl?.action || null,
        week: week.week,
        status: 'a_fazer',
        review_level: tpl?.reviewLevel || 'light',
      };
    })
  );
}
