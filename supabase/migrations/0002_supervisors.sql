-- Trilha Empreendedora — Phase 4: supervisão e ops de conteúdo
-- Re-executável: usa CREATE TABLE IF NOT EXISTS, CREATE INDEX IF NOT EXISTS,
-- CREATE OR REPLACE FUNCTION, e DROP POLICY IF EXISTS antes de cada policy.
-- Pré-requisito: 0001_init.sql aplicado primeiro.

CREATE TABLE IF NOT EXISTS supervisors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL UNIQUE,
  email        TEXT NOT NULL,
  name         TEXT,
  role         TEXT NOT NULL DEFAULT 'supervisor',
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedback_templates (
  id                TEXT PRIMARY KEY,
  archetype_id      TEXT,
  task_template_id  TEXT,
  decision          TEXT NOT NULL,
  recognition       TEXT,
  learning          TEXT,
  adjustment        TEXT,
  next_step         TEXT,
  active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rubrics (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  applies_to    TEXT,
  criteria_json JSONB NOT NULL,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS volunteer_offers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  whatsapp     TEXT,
  email        TEXT,
  category     TEXT NOT NULL,
  description  TEXT,
  availability TEXT,
  status       TEXT NOT NULL DEFAULT 'aberto',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  help_request_id     UUID REFERENCES help_requests(id) ON DELETE CASCADE,
  volunteer_offer_id  UUID REFERENCES volunteer_offers(id) ON DELETE SET NULL,
  status              TEXT NOT NULL DEFAULT 'sugerida',
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  matched_at          TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS content_gaps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL,
  reference_id  TEXT NOT NULL,
  metric        NUMERIC,
  observation   TEXT,
  detected_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS content_reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type  TEXT NOT NULL,
  content_id    TEXT NOT NULL,
  reviewed_by   UUID,
  status        TEXT NOT NULL,
  notes         TEXT,
  next_review   DATE,
  reviewed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supervisors_user        ON supervisors(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_archetype      ON feedback_templates(archetype_id);
CREATE INDEX IF NOT EXISTS idx_feedback_task           ON feedback_templates(task_template_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_status        ON volunteer_offers(status);
CREATE INDEX IF NOT EXISTS idx_matches_help            ON matches(help_request_id);
CREATE INDEX IF NOT EXISTS idx_content_gaps_unresolved ON content_gaps(resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_content_reviews_due     ON content_reviews(next_review);

CREATE OR REPLACE FUNCTION is_supervisor() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM supervisors
    WHERE user_id = auth.uid() AND active = TRUE
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM supervisors
    WHERE user_id = auth.uid() AND active = TRUE AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

ALTER TABLE supervisors        ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubrics            ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_offers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches            ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_gaps       ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reviews    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS supervisors_self_read              ON supervisors;
DROP POLICY IF EXISTS supervisors_admin_all              ON supervisors;
DROP POLICY IF EXISTS feedback_templates_read            ON feedback_templates;
DROP POLICY IF EXISTS feedback_templates_admin           ON feedback_templates;
DROP POLICY IF EXISTS rubrics_read                       ON rubrics;
DROP POLICY IF EXISTS rubrics_admin                      ON rubrics;
DROP POLICY IF EXISTS volunteer_offers_insert_anon       ON volunteer_offers;
DROP POLICY IF EXISTS volunteer_offers_insert_auth       ON volunteer_offers;
DROP POLICY IF EXISTS volunteer_offers_read              ON volunteer_offers;
DROP POLICY IF EXISTS volunteer_offers_update            ON volunteer_offers;
DROP POLICY IF EXISTS matches_supervisor                 ON matches;
DROP POLICY IF EXISTS content_gaps_supervisor            ON content_gaps;
DROP POLICY IF EXISTS content_reviews_supervisor         ON content_reviews;
DROP POLICY IF EXISTS users_supervisor_read              ON users;
DROP POLICY IF EXISTS diagnostics_supervisor_read        ON diagnostics;
DROP POLICY IF EXISTS plans_supervisor_read              ON plans;
DROP POLICY IF EXISTS plans_supervisor_update            ON plans;
DROP POLICY IF EXISTS tasks_supervisor_read              ON tasks;
DROP POLICY IF EXISTS tasks_supervisor_update            ON tasks;
DROP POLICY IF EXISTS task_submissions_supervisor_read   ON task_submissions;
DROP POLICY IF EXISTS task_reviews_supervisor_all        ON task_reviews;
DROP POLICY IF EXISTS help_requests_supervisor_read      ON help_requests;
DROP POLICY IF EXISTS help_requests_supervisor_update    ON help_requests;

CREATE POLICY supervisors_self_read ON supervisors FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY supervisors_admin_all ON supervisors FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY feedback_templates_read  ON feedback_templates FOR SELECT TO authenticated USING (is_supervisor());
CREATE POLICY feedback_templates_admin ON feedback_templates FOR ALL    TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY rubrics_read  ON rubrics FOR SELECT TO authenticated USING (is_supervisor());
CREATE POLICY rubrics_admin ON rubrics FOR ALL    TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY volunteer_offers_insert_anon ON volunteer_offers FOR INSERT TO anon          WITH CHECK (TRUE);
CREATE POLICY volunteer_offers_insert_auth ON volunteer_offers FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY volunteer_offers_read        ON volunteer_offers FOR SELECT TO authenticated USING (is_supervisor());
CREATE POLICY volunteer_offers_update      ON volunteer_offers FOR UPDATE TO authenticated USING (is_supervisor()) WITH CHECK (is_supervisor());

CREATE POLICY matches_supervisor ON matches FOR ALL TO authenticated USING (is_supervisor()) WITH CHECK (is_supervisor());

CREATE POLICY content_gaps_supervisor    ON content_gaps    FOR ALL TO authenticated USING (is_supervisor()) WITH CHECK (is_supervisor());
CREATE POLICY content_reviews_supervisor ON content_reviews FOR ALL TO authenticated USING (is_supervisor()) WITH CHECK (is_supervisor());

CREATE POLICY users_supervisor_read              ON users             FOR SELECT TO authenticated USING (is_supervisor());
CREATE POLICY diagnostics_supervisor_read        ON diagnostics       FOR SELECT TO authenticated USING (is_supervisor());
CREATE POLICY plans_supervisor_read              ON plans             FOR SELECT TO authenticated USING (is_supervisor());
CREATE POLICY plans_supervisor_update            ON plans             FOR UPDATE TO authenticated USING (is_supervisor()) WITH CHECK (is_supervisor());
CREATE POLICY tasks_supervisor_read              ON tasks             FOR SELECT TO authenticated USING (is_supervisor());
CREATE POLICY tasks_supervisor_update            ON tasks             FOR UPDATE TO authenticated USING (is_supervisor()) WITH CHECK (is_supervisor());
CREATE POLICY task_submissions_supervisor_read   ON task_submissions  FOR SELECT TO authenticated USING (is_supervisor());
CREATE POLICY task_reviews_supervisor_all        ON task_reviews      FOR ALL    TO authenticated USING (is_supervisor()) WITH CHECK (is_supervisor());
CREATE POLICY help_requests_supervisor_read      ON help_requests     FOR SELECT TO authenticated USING (is_supervisor());
CREATE POLICY help_requests_supervisor_update    ON help_requests     FOR UPDATE TO authenticated USING (is_supervisor()) WITH CHECK (is_supervisor());
