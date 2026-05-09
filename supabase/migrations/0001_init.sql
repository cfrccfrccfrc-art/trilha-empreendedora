-- Trilha Empreendedora — Phase 3 schema
-- Re-executável: usa CREATE TABLE IF NOT EXISTS, CREATE INDEX IF NOT EXISTS,
-- CREATE OR REPLACE FUNCTION, e DROP POLICY IF EXISTS antes de cada policy.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  whatsapp           TEXT NOT NULL,
  city               TEXT,
  neighborhood       TEXT,
  business_name      TEXT,
  business_type      TEXT,
  consent_contact    BOOLEAN NOT NULL DEFAULT FALSE,
  plan_token         UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS diagnostics (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers_json       JSONB NOT NULL,
  archetype_id       TEXT NOT NULL,
  main_pain          TEXT,
  secondary_pain     TEXT,
  sector             TEXT,
  sales_channel      TEXT,
  capital_need       TEXT,
  content_version    TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plans (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  archetype_id       TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'active',
  start_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  current_week       INT  NOT NULL DEFAULT 1,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id            UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  task_template_id   TEXT NOT NULL,
  title              TEXT NOT NULL,
  description        TEXT,
  week               INT  NOT NULL,
  status             TEXT NOT NULL DEFAULT 'a_fazer',
  review_level       TEXT,
  due_date           DATE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at       TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS task_submissions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id            UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status_reported    TEXT NOT NULL,
  text_response      TEXT,
  evidence_url       TEXT,
  obstacle           TEXT,
  needs_help         BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_reviews (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id          UUID NOT NULL REFERENCES task_submissions(id) ON DELETE CASCADE,
  reviewer_id            UUID,
  review_status          TEXT NOT NULL,
  rubric_scores_json     JSONB,
  feedback_template_id   TEXT,
  custom_comment         TEXT,
  next_action            TEXT,
  reviewed_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS help_requests (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id            UUID REFERENCES tasks(id) ON DELETE SET NULL,
  submission_id      UUID REFERENCES task_submissions(id) ON DELETE SET NULL,
  topic              TEXT,
  message            TEXT,
  status             TEXT NOT NULL DEFAULT 'aberto',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_plan_token       ON users(plan_token);
CREATE INDEX IF NOT EXISTS idx_diagnostics_user       ON diagnostics(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_user             ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_plan             ON tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task       ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user       ON task_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_submission     ON task_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_help_requests_user     ON help_requests(user_id);

CREATE OR REPLACE FUNCTION current_plan_token() RETURNS UUID AS $$
DECLARE
  token TEXT;
BEGIN
  BEGIN
    token := current_setting('request.headers', true)::json ->> 'x-plan-token';
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
  IF token IS NULL OR token = '' THEN
    RETURN NULL;
  END IF;
  BEGIN
    RETURN token::uuid;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql STABLE;

ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics       ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_reviews      ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_insert_anon              ON users;
DROP POLICY IF EXISTS users_select_by_token          ON users;
DROP POLICY IF EXISTS users_update_by_token          ON users;
DROP POLICY IF EXISTS diagnostics_insert_anon        ON diagnostics;
DROP POLICY IF EXISTS diagnostics_select_by_token    ON diagnostics;
DROP POLICY IF EXISTS plans_insert_anon              ON plans;
DROP POLICY IF EXISTS plans_select_by_token          ON plans;
DROP POLICY IF EXISTS plans_update_by_token          ON plans;
DROP POLICY IF EXISTS tasks_insert_anon              ON tasks;
DROP POLICY IF EXISTS tasks_select_by_token          ON tasks;
DROP POLICY IF EXISTS tasks_update_by_token          ON tasks;
DROP POLICY IF EXISTS task_submissions_insert_anon   ON task_submissions;
DROP POLICY IF EXISTS task_submissions_select_by_token ON task_submissions;
DROP POLICY IF EXISTS task_reviews_insert_anon       ON task_reviews;
DROP POLICY IF EXISTS task_reviews_select_by_token   ON task_reviews;
DROP POLICY IF EXISTS help_requests_insert_anon      ON help_requests;
DROP POLICY IF EXISTS help_requests_select_by_token  ON help_requests;

CREATE POLICY users_insert_anon ON users
  FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY users_select_by_token ON users
  FOR SELECT TO anon USING (plan_token = current_plan_token());
CREATE POLICY users_update_by_token ON users
  FOR UPDATE TO anon
  USING (plan_token = current_plan_token())
  WITH CHECK (plan_token = current_plan_token());

CREATE POLICY diagnostics_insert_anon ON diagnostics
  FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY diagnostics_select_by_token ON diagnostics
  FOR SELECT TO anon
  USING (user_id IN (SELECT id FROM users WHERE plan_token = current_plan_token()));

CREATE POLICY plans_insert_anon ON plans
  FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY plans_select_by_token ON plans
  FOR SELECT TO anon
  USING (user_id IN (SELECT id FROM users WHERE plan_token = current_plan_token()));
CREATE POLICY plans_update_by_token ON plans
  FOR UPDATE TO anon
  USING (user_id IN (SELECT id FROM users WHERE plan_token = current_plan_token()))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE plan_token = current_plan_token()));

CREATE POLICY tasks_insert_anon ON tasks
  FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY tasks_select_by_token ON tasks
  FOR SELECT TO anon
  USING (plan_id IN (
    SELECT p.id FROM plans p JOIN users u ON u.id = p.user_id
    WHERE u.plan_token = current_plan_token()
  ));
CREATE POLICY tasks_update_by_token ON tasks
  FOR UPDATE TO anon
  USING (plan_id IN (
    SELECT p.id FROM plans p JOIN users u ON u.id = p.user_id
    WHERE u.plan_token = current_plan_token()
  ))
  WITH CHECK (plan_id IN (
    SELECT p.id FROM plans p JOIN users u ON u.id = p.user_id
    WHERE u.plan_token = current_plan_token()
  ));

CREATE POLICY task_submissions_insert_anon ON task_submissions
  FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY task_submissions_select_by_token ON task_submissions
  FOR SELECT TO anon
  USING (user_id IN (SELECT id FROM users WHERE plan_token = current_plan_token()));

CREATE POLICY task_reviews_insert_anon ON task_reviews
  FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY task_reviews_select_by_token ON task_reviews
  FOR SELECT TO anon
  USING (submission_id IN (
    SELECT s.id FROM task_submissions s JOIN users u ON u.id = s.user_id
    WHERE u.plan_token = current_plan_token()
  ));

CREATE POLICY help_requests_insert_anon ON help_requests
  FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY help_requests_select_by_token ON help_requests
  FOR SELECT TO anon
  USING (user_id IN (SELECT id FROM users WHERE plan_token = current_plan_token()));
