-- Trilha Empreendedora — Phase 4.5: pipeline de doações via Pix
-- Re-executável: usa CREATE TABLE/INDEX IF NOT EXISTS, DROP POLICY IF EXISTS,
-- e o INSERT do seed só roda se ainda não tem nenhuma campanha cadastrada.
-- Pré-requisito: 0002 (precisa da função is_admin()).

CREATE TABLE IF NOT EXISTS donation_campaigns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  amounts       INTEGER[] NOT NULL DEFAULT ARRAY[1, 5, 10],
  pix_key       TEXT,
  pix_qr_url    TEXT,
  placements    TEXT[] NOT NULL DEFAULT ARRAY['my_plan', 'learning_response'],
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_donation_campaigns_enabled
  ON donation_campaigns(enabled, created_at DESC);

ALTER TABLE donation_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS donation_campaigns_anon_read   ON donation_campaigns;
DROP POLICY IF EXISTS donation_campaigns_admin_all   ON donation_campaigns;

CREATE POLICY donation_campaigns_anon_read ON donation_campaigns
  FOR SELECT TO anon USING (enabled = TRUE);

CREATE POLICY donation_campaigns_admin_all ON donation_campaigns
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

INSERT INTO donation_campaigns (
  enabled, title, message, amounts, pix_key, pix_qr_url, placements
)
SELECT
  FALSE,
  'A Trilha não cobra. E não busca lucro.',
  'Mas servidor, conteúdo e voluntários têm custo. Se a Trilha te ajudou, considere uma doação de qualquer valor.',
  ARRAY[1, 5, 10],
  '',
  '',
  ARRAY['my_plan', 'learning_response']
WHERE NOT EXISTS (SELECT 1 FROM donation_campaigns);
