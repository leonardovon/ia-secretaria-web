-- Função para autenticar usuário da clínica
CREATE OR REPLACE FUNCTION public.authenticate_clinic_user(
  p_username TEXT,
  p_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM clinica.config
  WHERE login = p_username
    AND senha_hash = p_password;
  
  RETURN v_count > 0;
END;
$$;