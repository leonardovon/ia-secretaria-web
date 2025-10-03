-- Criar tabela de configuração de webhooks primeiro
CREATE TABLE IF NOT EXISTS clinica.webhook_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  webhook_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Adicionar clinic_id nas tabelas existentes (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'clinica' 
                 AND table_name = 'chat_messages' 
                 AND column_name = 'clinic_id') THEN
    ALTER TABLE clinica.chat_messages ADD COLUMN clinic_id UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'clinica' 
                 AND table_name = 'dados_cliente' 
                 AND column_name = 'clinic_id') THEN
    ALTER TABLE clinica.dados_cliente ADD COLUMN clinic_id UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'clinica' 
                 AND table_name = 'chats' 
                 AND column_name = 'clinic_id') THEN
    ALTER TABLE clinica.chats ADD COLUMN clinic_id UUID;
  END IF;
END $$;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_chat_messages_clinic_id ON clinica.chat_messages(clinic_id);
CREATE INDEX IF NOT EXISTS idx_dados_cliente_clinic_id ON clinica.dados_cliente(clinic_id);
CREATE INDEX IF NOT EXISTS idx_chats_clinic_id ON clinica.chats(clinic_id);
CREATE INDEX IF NOT EXISTS idx_webhook_config_clinic_id ON clinica.webhook_config(clinic_id);
CREATE INDEX IF NOT EXISTS idx_webhook_config_phone ON clinica.webhook_config(phone);

-- Trigger para updated_at no webhook_config
DROP TRIGGER IF EXISTS update_webhook_config_updated_at ON clinica.webhook_config;
CREATE TRIGGER update_webhook_config_updated_at
  BEFORE UPDATE ON clinica.webhook_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE clinica.webhook_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Permitir todas operações em webhook_config" ON clinica.webhook_config;
CREATE POLICY "Permitir todas operações em webhook_config" 
  ON clinica.webhook_config
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Atualizar dados existentes para associar com a clínica demo
DO $$
DECLARE
  v_demo_clinic_id uuid;
BEGIN
  -- Obter o ID da clínica demo (primeira clínica cadastrada)
  SELECT id INTO v_demo_clinic_id
  FROM clinica.config
  ORDER BY created_at ASC
  LIMIT 1;

  -- Se não houver clínica, criar uma demo
  IF v_demo_clinic_id IS NULL THEN
    INSERT INTO clinica.config (nome_clinica, telefone, endereco, login, senha_hash)
    VALUES ('Clínica Demo', '(00) 0000-0000', 'Endereço Demo', 'admin', 'admin123')
    RETURNING id INTO v_demo_clinic_id;
  END IF;

  -- Atualizar dados existentes com o clinic_id da demo
  UPDATE clinica.chat_messages SET clinic_id = v_demo_clinic_id WHERE clinic_id IS NULL;
  UPDATE clinica.dados_cliente SET clinic_id = v_demo_clinic_id WHERE clinic_id IS NULL;
  UPDATE clinica.chats SET clinic_id = v_demo_clinic_id WHERE clinic_id IS NULL;
END $$;

-- Criar tabela de usuários/contas
CREATE TABLE IF NOT EXISTS clinica.user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinica.config(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(username)
);

-- Adicionar índices para user_accounts
CREATE INDEX IF NOT EXISTS idx_user_accounts_clinic_id ON clinica.user_accounts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_username ON clinica.user_accounts(username);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_user_accounts_updated_at ON clinica.user_accounts;
CREATE TRIGGER update_user_accounts_updated_at
  BEFORE UPDATE ON clinica.user_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE clinica.user_accounts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Permitir todas operações em user_accounts" ON clinica.user_accounts;
CREATE POLICY "Permitir todas operações em user_accounts" 
  ON clinica.user_accounts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Criar usuário admin padrão para a clínica demo
DO $$
DECLARE
  v_demo_clinic_id uuid;
BEGIN
  SELECT id INTO v_demo_clinic_id
  FROM clinica.config
  ORDER BY created_at ASC
  LIMIT 1;

  INSERT INTO clinica.user_accounts (clinic_id, username, password_hash, full_name, role)
  VALUES (v_demo_clinic_id, 'admin', 'admin123', 'Administrador', 'admin')
  ON CONFLICT (username) DO NOTHING;
END $$;

-- Remover função antiga e criar nova com retorno completo
DROP FUNCTION IF EXISTS public.authenticate_clinic_user(text, text);

CREATE FUNCTION public.authenticate_clinic_user(p_username text, p_password text)
RETURNS TABLE(
  success BOOLEAN,
  clinic_id UUID,
  user_id UUID,
  username VARCHAR,
  full_name VARCHAR,
  role VARCHAR
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE as success,
    ua.clinic_id,
    ua.id as user_id,
    ua.username,
    ua.full_name,
    ua.role
  FROM clinica.user_accounts ua
  WHERE ua.username = lower(p_username)
    AND ua.password_hash = p_password
    AND ua.is_active = true
  LIMIT 1;
END;
$$;

-- Criar função para obter configuração da clínica por ID
CREATE OR REPLACE FUNCTION public.get_clinica_config_by_id(p_clinic_id UUID)
RETURNS TABLE(
  id UUID,
  nome_clinica VARCHAR,
  telefone VARCHAR,
  endereco TEXT,
  login VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    id,
    nome_clinica,
    telefone,
    endereco,
    login,
    created_at,
    updated_at
  FROM clinica.config
  WHERE id = p_clinic_id
  LIMIT 1;
$$;