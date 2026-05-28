// Formatadores de Markdown pra exportar conteúdo da Trilha pra fora da app
// (Slack, Notion, Word, Google Docs). Saída é Markdown padrão; quando
// colado em editor que entende MD, vira formatação automaticamente.
//
// Uso típico: time de consultores do Projeto Pescadores ou parceiros que
// usam Trilha como referência B2B no atendimento.

import archetypesData from '../data/archetypes.json';
import tasksData from '../data/taskTemplates.json';

function getArchetypeName(id) {
  const a = archetypesData.find((x) => x.id === id);
  return a?.name || id;
}

function getTaskTitle(id) {
  const t = tasksData.find((x) => x.id === id);
  return t?.title || id;
}

const DEFAULT_BASE = 'https://trilhaempreendedora.com.br';

export function formatCaseAsMarkdown(c, { baseUrl } = {}) {
  if (!c) return '';
  const base = baseUrl || DEFAULT_BASE;
  const lines = [];

  lines.push(`# ${c.title}`);
  lines.push('');

  const meta = [];
  if (c.sector) meta.push(`**Setor:** ${c.sector}`);
  if (c.region) meta.push(`**Região:** ${c.region}`);
  if (c.readingTime) meta.push(`**Leitura:** ${c.readingTime}`);
  if (meta.length) {
    lines.push(meta.join(' · '));
    lines.push('');
  }

  if (Array.isArray(c.archetypes) && c.archetypes.length) {
    lines.push(
      `**Arquétipo(s):** ${c.archetypes.map(getArchetypeName).join('; ')}`
    );
    lines.push('');
  }

  if (c.situation) {
    lines.push('## A situação');
    lines.push('');
    lines.push(c.situation);
    lines.push('');
  }

  if (c.dilemma) {
    lines.push('## O dilema');
    lines.push('');
    lines.push(c.dilemma);
    lines.push('');
  }

  if (Array.isArray(c.options) && c.options.length) {
    lines.push('## Caminhos possíveis');
    lines.push('');
    for (const opt of c.options) lines.push(`- ${opt}`);
    lines.push('');
  }

  if (c.tradeoffs) {
    lines.push('## O que pesa em cada caminho');
    lines.push('');
    lines.push(c.tradeoffs);
    lines.push('');
  }

  if (c.lessonLearned) {
    lines.push('## O que esse caso ensina');
    lines.push('');
    lines.push(c.lessonLearned);
    lines.push('');
  }

  if (c.tropicalizedLesson) {
    lines.push('## Como isso se aplica no Brasil');
    lines.push('');
    lines.push(c.tropicalizedLesson);
    lines.push('');
  }

  if (c.practicalTask) {
    lines.push('## Tarefa prática vinculada');
    lines.push('');
    lines.push(`- ${getTaskTitle(c.practicalTask)}`);
    lines.push('');
  }

  if (c.helpTrigger) {
    lines.push('## Quando pedir ajuda');
    lines.push('');
    lines.push(c.helpTrigger);
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push(
    `Caso da Trilha Empreendedora. Fonte: ${base}/casos/${c.id}`
  );
  if (c.caseAuthenticityType) {
    lines.push(`Tipo de autenticidade: ${c.caseAuthenticityType}`);
  }

  return lines.join('\n');
}

export function formatTaskAsMarkdown(t, { baseUrl } = {}) {
  if (!t) return '';
  const base = baseUrl || DEFAULT_BASE;
  const lines = [];

  lines.push(`# ${t.title}`);
  lines.push('');

  const meta = [];
  if (t.week) meta.push(`**Semana:** ${t.week} de 4`);
  if (t.archetypeId) {
    meta.push(`**Arquétipo de origem:** ${getArchetypeName(t.archetypeId)}`);
  }
  if (t.reviewLevel) {
    meta.push(
      `**Revisão:** ${t.reviewLevel === 'elevated' ? 'elevada' : 'leve'}`
    );
  }
  if (meta.length) {
    lines.push(meta.join(' · '));
    lines.push('');
  }

  if (t.action) {
    lines.push('## A ação');
    lines.push('');
    lines.push(t.action);
    lines.push('');
  }

  if (t.purpose) {
    lines.push('## Por que isso importa');
    lines.push('');
    lines.push(t.purpose);
    lines.push('');
  }

  if (t.expectedLearning) {
    lines.push('## O que se aprende');
    lines.push('');
    lines.push(t.expectedLearning);
    lines.push('');
  }

  if (Array.isArray(t.reflectionQuestions) && t.reflectionQuestions.length) {
    lines.push('## Perguntas pra refletir no fim');
    lines.push('');
    for (const q of t.reflectionQuestions) lines.push(`- ${q}`);
    lines.push('');
  }

  if (Array.isArray(t.commonMistakes) && t.commonMistakes.length) {
    lines.push('## Armadilhas comuns');
    lines.push('');
    for (const m of t.commonMistakes) lines.push(`- ${m}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push(
    `Tarefa da Trilha Empreendedora. Fonte: ${base}/biblioteca/tarefas/${t.id}`
  );

  return lines.join('\n');
}
