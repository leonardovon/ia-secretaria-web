-- Normalização da tabela clinica.n8n_chat_histories para multitenant

-- 1. Adicionar coluna clinic_id
ALTER TABLE clinica.n8n_chat_histories 
ADD COLUMN clinic_id UUID NOT NULL 
REFERENCES clinica.config(id) ON DELETE CASCADE;

-- 2. Criar índices para performance
CREATE INDEX idx_n8n_chat_histories_clinic_id ON clinica.n8n_chat_histories(clinic_id);
CREATE INDEX idx_n8n_chat_histories_clinic_session ON clinica.n8n_chat_histories(clinic_id, session_id);

-- 3. Remover RLS policy antiga
DROP POLICY IF EXISTS "Permitir todas operações em n8n_chat_histories" ON clinica.n8n_chat_histories;

-- 4. Criar nova RLS policy baseada em clinic_id
CREATE POLICY "Users can access their clinic chat histories"
ON clinica.n8n_chat_histories
FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id 
    FROM clinica.user_accounts 
    WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  )
);

-- 5. Comentário
COMMENT ON TABLE clinica.n8n_chat_histories IS 'Histórico de conversas do n8n com suporte multitenant';

-- 6. Recarregar cache do PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';