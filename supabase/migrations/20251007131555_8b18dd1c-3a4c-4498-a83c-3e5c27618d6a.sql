-- Remover constraints da coluna clinic_id na tabela n8n_chat_histories
-- Permitir que n8n insira registros sem clinic_id

-- Remover a foreign key constraint se existir
ALTER TABLE clinica.n8n_chat_histories 
DROP CONSTRAINT IF EXISTS n8n_chat_histories_clinic_id_fkey;

-- Remover o default se existir
ALTER TABLE clinica.n8n_chat_histories 
ALTER COLUMN clinic_id DROP DEFAULT;

-- Remover a constraint NOT NULL
ALTER TABLE clinica.n8n_chat_histories 
ALTER COLUMN clinic_id DROP NOT NULL;

-- Remover a função se não for mais necessária
DROP FUNCTION IF EXISTS clinica.get_default_clinic_id();

-- Comentário
COMMENT ON COLUMN clinica.n8n_chat_histories.clinic_id 
IS 'ID da clínica - campo opcional para filtrar históricos por clínica';