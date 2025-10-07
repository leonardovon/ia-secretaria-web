-- Normalização da tabela clinica.documents para multitenant

-- 1. Adicionar coluna clinic_id
ALTER TABLE clinica.documents 
ADD COLUMN clinic_id UUID NOT NULL 
REFERENCES clinica.config(id) ON DELETE CASCADE;

-- 2. Criar índice para performance
CREATE INDEX idx_clinica_documents_clinic_id ON clinica.documents(clinic_id);
CREATE INDEX idx_clinica_documents_clinic_id_id ON clinica.documents(clinic_id, id);

-- 3. Remover RLS policies antigas
DROP POLICY IF EXISTS "Permitir atualização em documents" ON clinica.documents;
DROP POLICY IF EXISTS "Permitir exclusão em documents" ON clinica.documents;
DROP POLICY IF EXISTS "Permitir inserção em documents" ON clinica.documents;
DROP POLICY IF EXISTS "Permitir leitura em documents" ON clinica.documents;

-- 4. Criar novas RLS policies baseadas em clinic_id
CREATE POLICY "Users can access their clinic documents"
ON clinica.documents
FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id 
    FROM clinica.user_accounts 
    WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  )
);

-- 5. Criar view public.clinica_documents
CREATE OR REPLACE VIEW public.clinica_documents AS
SELECT 
  d.id,
  d.content,
  d.metadata,
  d.embedding,
  d.clinic_id
FROM clinica.documents d
WHERE d.clinic_id IN (
  SELECT ua.clinic_id 
  FROM clinica.user_accounts ua 
  WHERE ua.id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
);

-- 6. Garantir permissões na view
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinica_documents TO anon, authenticated, service_role;

-- 7. Comentários para documentação
COMMENT ON VIEW public.clinica_documents IS 'View filtrada por clinic_id do usuário logado para acesso seguro aos documentos da clínica';
COMMENT ON TABLE clinica.documents IS 'Tabela de documentos com suporte a multitenant via clinic_id';

-- 8. Recarregar cache do PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';