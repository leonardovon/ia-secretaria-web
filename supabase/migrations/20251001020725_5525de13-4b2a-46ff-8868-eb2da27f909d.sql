-- Create RPC function to get clinic configuration
CREATE OR REPLACE FUNCTION public.get_clinica_config()
RETURNS TABLE(
  id uuid,
  nome_clinica varchar,
  telefone varchar,
  endereco text,
  login varchar,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
  SELECT 
    id,
    nome_clinica,
    telefone,
    endereco,
    login,
    created_at,
    updated_at
  FROM clinica.config
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Create RPC function to update clinic configuration
CREATE OR REPLACE FUNCTION public.update_clinica_config(
  p_nome_clinica varchar,
  p_telefone varchar,
  p_endereco text,
  p_login varchar,
  p_senha_hash varchar DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  nome_clinica varchar,
  telefone varchar,
  endereco text,
  login varchar,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
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
    VALUES (p_nome_clinica, p_telefone, p_endereco, p_login, COALESCE(p_senha_hash, 'change_me'))
    RETURNING clinica.config.id INTO v_config_id;
  ELSE
    -- Update existing config
    IF p_senha_hash IS NOT NULL AND p_senha_hash != '' THEN
      UPDATE clinica.config
      SET 
        nome_clinica = p_nome_clinica,
        telefone = p_telefone,
        endereco = p_endereco,
        login = p_login,
        senha_hash = p_senha_hash,
        updated_at = NOW()
      WHERE id = v_config_id;
    ELSE
      UPDATE clinica.config
      SET 
        nome_clinica = p_nome_clinica,
        telefone = p_telefone,
        endereco = p_endereco,
        login = p_login,
        updated_at = NOW()
      WHERE id = v_config_id;
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_clinica_config() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_clinica_config(varchar, varchar, text, varchar, varchar) TO anon, authenticated;