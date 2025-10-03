-- Função para listar todas as contas de usuário
CREATE OR REPLACE FUNCTION public.list_user_accounts()
RETURNS TABLE(
  id UUID,
  clinic_id UUID,
  username VARCHAR,
  full_name VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    id,
    clinic_id,
    username,
    full_name,
    role,
    is_active,
    created_at
  FROM clinica.user_accounts
  ORDER BY created_at DESC;
$$;

-- Função para criar uma nova conta
CREATE OR REPLACE FUNCTION public.create_user_account(
  p_clinic_id UUID,
  p_username VARCHAR,
  p_password_hash VARCHAR,
  p_full_name VARCHAR,
  p_role VARCHAR
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_new_id UUID;
BEGIN
  INSERT INTO clinica.user_accounts (clinic_id, username, password_hash, full_name, role)
  VALUES (p_clinic_id, lower(p_username), p_password_hash, p_full_name, p_role)
  RETURNING id INTO v_new_id;
  
  RETURN v_new_id;
END;
$$;

-- Função para deletar uma conta
CREATE OR REPLACE FUNCTION public.delete_user_account(p_account_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM clinica.user_accounts WHERE id = p_account_id;
  RETURN TRUE;
END;
$$;

-- Função para listar todas as clínicas
CREATE OR REPLACE FUNCTION public.list_clinicas()
RETURNS TABLE(
  id UUID,
  nome_clinica VARCHAR,
  telefone VARCHAR,
  endereco TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    id,
    nome_clinica,
    telefone,
    endereco
  FROM clinica.config
  ORDER BY nome_clinica;
$$;