-- Corrigir RLS policy do n8n_chat_histories
-- A aplicação usa autenticação customizada, não Supabase Auth

-- Remover policy incorreta
DROP POLICY IF EXISTS "Users can access their clinic chat histories" ON clinica.n8n_chat_histories;

-- Recriar policy que permite todas operações (autenticação é feita no backend)
CREATE POLICY "Permitir todas operações em n8n_chat_histories"
ON clinica.n8n_chat_histories
FOR ALL
USING (true)
WITH CHECK (true);

-- Comentário
COMMENT ON POLICY "Permitir todas operações em n8n_chat_histories" ON clinica.n8n_chat_histories 
IS 'Permite acesso total - autenticação gerenciada pela aplicação via clinica.user_accounts';