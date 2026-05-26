-- Trilha Empreendedora — telemetria mínima de eventos do cliente
-- ----------------------------------------------------------------------------
-- Tabela leve pra capturar eventos de uso (page views, cliques em handoff,
-- abertura de share, etc.) que não geram linha nas tabelas operacionais.
-- Inserção anônima permitida (sem auth) porque o app é majoritariamente
-- de usuário anônimo. Leitura restrita ao admin pra agregação em /admin/metricas.
--
-- Re-executável: usa CREATE TABLE IF NOT EXISTS, DROP POLICY IF EXISTS antes
-- de CREATE POLICY.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS client_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  plan_token UUID,
  page       TEXT,
  meta       JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_events_type
  ON client_events (event_type);
CREATE INDEX IF NOT EXISTS idx_client_events_created_at
  ON client_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_events_plan_token
  ON client_events (plan_token) WHERE plan_token IS NOT NULL;

ALTER TABLE client_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS client_events_insert_anon  ON client_events;
DROP POLICY IF EXISTS client_events_insert_auth  ON client_events;
DROP POLICY IF EXISTS client_events_select_admin ON client_events;

-- Inserção livre (anon + auth). Validamos só o schema, não o conteúdo.
CREATE POLICY client_events_insert_anon ON client_events
  FOR INSERT TO anon
  WITH CHECK (TRUE);

CREATE POLICY client_events_insert_auth ON client_events
  FOR INSERT TO authenticated
  WITH CHECK (TRUE);

-- Leitura: só admin (via tela /admin/metricas)
CREATE POLICY client_events_select_admin ON client_events
  FOR SELECT TO authenticated
  USING (is_admin());
