-- Fix ambiguous "id" reference and enforce lowercase login on server
CREATE OR REPLACE FUNCTION public.update_clinica_config(
  p_nome_clinica character varying,
  p_telefone character varying,
  p_endereco text,
  p_login character varying,
  p_senha_hash character varying DEFAULT NULL::character varying
)
RETURNS TABLE(
  id uuid,
  nome_clinica character varying,
  telefone character varying,
  endereco text,
  login character varying,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_config_id uuid;
BEGIN
  -- Get the existing config ID
  SELECT c.id INTO v_config_id
  FROM clinica.config c
  LIMIT 1;

  IF v_config_id IS NULL THEN
    -- Insert new config
    INSERT INTO clinica.config (nome_clinica, telefone, endereco, login, senha_hash)
    VALUES (p_nome_clinica, p_telefone, p_endereco, lower(p_login), COALESCE(p_senha_hash, 'change_me'))
    RETURNING id INTO v_config_id;
  ELSE
    -- Update existing config
    IF p_senha_hash IS NOT NULL AND p_senha_hash <> '' THEN
      UPDATE clinica.config
      SET 
        nome_clinica = p_nome_clinica,
        telefone = p_telefone,
        endereco = p_endereco,
        login = lower(p_login),
        senha_hash = p_senha_hash,
        updated_at = NOW()
      WHERE clinica.config.id = v_config_id;
    ELSE
      UPDATE clinica.config
      SET 
        nome_clinica = p_nome_clinica,
        telefone = p_telefone,
        endereco = p_endereco,
        login = lower(p_login),
        updated_at = NOW()
      WHERE clinica.config.id = v_config_id;
    END IF;
  END IF;

  -- Return the updated config
  RETURN QUERY
  SELECT 
    c.id,
    c.nome_clinica,
    c.telefone,
    c.endereco,
    c.login,
    c.created_at,
    c.updated_at
  FROM clinica.config c
  WHERE c.id = v_config_id;
END;
$function$;