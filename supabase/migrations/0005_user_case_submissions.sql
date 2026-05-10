-- Trilha Empreendedora — submissões de caso pelo próprio empreendedor
-- ----------------------------------------------------------------------------
-- Objetivo: ao bater 30 dias na trilha, a pessoa pode contar como foi sua
-- jornada (estrutura curta de perguntas) e topar que a Trilha edite,
-- anonimize e publique como case oficial pra ajudar quem está começando.
--
-- Re-executável: usa CREATE TABLE IF NOT EXISTS, DROP POLICY IF EXISTS antes
-- de CREATE POLICY, etc. Pode rodar mais de uma vez sem erro.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_case_submissions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- vínculo com o empreendedor (RLS por plan_token)
  plan_token           UUID NOT NULL,
  user_id              UUID REFERENCES users(id) ON DELETE SET NULL,
  archetype_id         TEXT NOT NULL,

  -- consentimentos explícitos
  consent_anonymize    BOOLEAN NOT NULL DEFAULT TRUE,
  consent_publish      BOOLEAN NOT NULL,
  include_real_name    BOOLEAN NOT NULL DEFAULT FALSE,
  include_region       BOOLEAN NOT NULL DEFAULT FALSE,

  -- conteúdo da história (formulário guiado)
  business_short       TEXT,   -- "Como você descreveria seu negócio em 1 frase?"
  biggest_change       TEXT,   -- "O que mais mudou nesses 30 dias?"
  favorite_week        INT,    -- 1..4: semana com maior aprendizado
  favorite_week_lesson TEXT,   -- "O que essa missão te ensinou?"
  difficulty           TEXT,   -- "Qual foi a maior dificuldade?"
  result_concrete      TEXT,   -- "Tem um resultado concreto pra contar?"
  message_to_others    TEXT,   -- "Mensagem pra quem está começando agora?"

  -- workflow editorial
  status               TEXT    NOT NULL DEFAULT 'submitted', -- submitted | in_review | anonymized | published | rejected
  reviewer_notes       TEXT,
  published_case_id    TEXT,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_case_submissions_plan_token
  ON user_case_submissions (plan_token);
CREATE INDEX IF NOT EXISTS idx_user_case_submissions_status
  ON user_case_submissions (status);
CREATE INDEX IF NOT EXISTS idx_user_case_submissions_archetype
  ON user_case_submissions (archetype_id);

-- RLS
ALTER TABLE user_case_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_case_submissions_insert_anon       ON user_case_submissions;
DROP POLICY IF EXISTS user_case_submissions_select_by_token   ON user_case_submissions;
DROP POLICY IF EXISTS user_case_submissions_update_by_token   ON user_case_submissions;
DROP POLICY IF EXISTS user_case_submissions_admin_all         ON user_case_submissions;
DROP POLICY IF EXISTS user_case_submissions_supervisor_select ON user_case_submissions;

-- Empreendedor (anon com plan_token) pode inserir só se o token bater com o dele
CREATE POLICY user_case_submissions_insert_anon ON user_case_submissions
  FOR INSERT TO anon
  WITH CHECK (plan_token = current_plan_token());

-- Empreendedor pode ler só os próprios envios
CREATE POLICY user_case_submissions_select_by_token ON user_case_submissions
  FOR SELECT TO anon
  USING (plan_token = current_plan_token());

-- Empreendedor pode editar (refinar a história) ANTES de virar 'in_review'
CREATE POLICY user_case_submissions_update_by_token ON user_case_submissions
  FOR UPDATE TO anon
  USING (plan_token = current_plan_token() AND status = 'submitted')
  WITH CHECK (plan_token = current_plan_token() AND status = 'submitted');

-- Supervisor lê tudo (pra triagem editorial)
CREATE POLICY user_case_submissions_supervisor_select ON user_case_submissions
  FOR SELECT TO authenticated
  USING (is_supervisor());

-- Admin tem acesso total (pra mover status, anotar revisor, vincular published_case_id)
CREATE POLICY user_case_submissions_admin_all ON user_case_submissions
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Trigger pra updated_at
CREATE OR REPLACE FUNCTION user_case_submissions_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_case_submissions_updated_at ON user_case_submissions;
CREATE TRIGGER trg_user_case_submissions_updated_at
  BEFORE UPDATE ON user_case_submissions
  FOR EACH ROW EXECUTE FUNCTION user_case_submissions_set_updated_at();
