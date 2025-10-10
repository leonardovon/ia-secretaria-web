-- Adicionar coluna email na tabela user_accounts
ALTER TABLE clinica.user_accounts 
ADD COLUMN email VARCHAR(255);

-- Criar índice para email
CREATE INDEX idx_user_accounts_email ON clinica.user_accounts(email);

-- Atualizar a função create_user_account para aceitar email
CREATE OR REPLACE FUNCTION public.create_user_account(
  p_clinic_id uuid, 
  p_username character varying, 
  p_password_hash character varying, 
  p_full_name character varying, 
  p_role character varying,
  p_email character varying DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_new_id UUID;
BEGIN
  INSERT INTO clinica.user_accounts (clinic_id, username, password_hash, full_name, role, email)
  VALUES (p_clinic_id, lower(p_username), p_password_hash, p_full_name, p_role, p_email)
  RETURNING id INTO v_new_id;
  
  RETURN v_new_id;
END;
$function$;