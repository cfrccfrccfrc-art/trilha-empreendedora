-- Trilha Empreendedora — múltiplas evidências por submissão
-- ----------------------------------------------------------------------------
-- Antes: task_submissions.evidence_url TEXT (uma foto/link por envio)
-- Agora: task_submissions.evidence_url TEXT[] (até N — UI limita a 3)
--
-- Conversão segura: linhas existentes com URL única viram array de 1 item;
-- linhas com NULL ou string vazia ficam NULL.
-- ----------------------------------------------------------------------------

ALTER TABLE task_submissions
  ALTER COLUMN evidence_url TYPE TEXT[]
  USING CASE
    WHEN evidence_url IS NULL OR evidence_url = '' THEN NULL
    ELSE ARRAY[evidence_url]
  END;
