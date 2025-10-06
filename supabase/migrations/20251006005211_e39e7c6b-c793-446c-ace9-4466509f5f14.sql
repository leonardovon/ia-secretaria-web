-- Create sequence for clinica.n8n_chat_histories
CREATE SEQUENCE IF NOT EXISTS clinica.n8n_chat_histories_id_seq;

-- Create table clinica.n8n_chat_histories with same structure as public.n8n_chat_histories
CREATE TABLE clinica.n8n_chat_histories (
  id INTEGER NOT NULL DEFAULT nextval('clinica.n8n_chat_histories_id_seq'::regclass) PRIMARY KEY,
  session_id CHARACTER VARYING NOT NULL,
  message JSONB NOT NULL
);

-- Copy data from public.n8n_chat_histories to clinica.n8n_chat_histories
INSERT INTO clinica.n8n_chat_histories (id, session_id, message)
SELECT id, session_id, message
FROM public.n8n_chat_histories;

-- Update sequence to continue from the max id
SELECT setval('clinica.n8n_chat_histories_id_seq', COALESCE((SELECT MAX(id) FROM clinica.n8n_chat_histories), 1), true);

-- Enable Row Level Security
ALTER TABLE clinica.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (same as other clinica tables)
CREATE POLICY "Permitir todas operações em n8n_chat_histories" 
ON clinica.n8n_chat_histories 
FOR ALL 
USING (true);