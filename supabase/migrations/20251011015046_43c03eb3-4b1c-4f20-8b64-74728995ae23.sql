-- Função para buscar agendamentos de uma clínica
CREATE OR REPLACE FUNCTION public.get_clinic_agendamentos(p_clinic_id uuid)
RETURNS TABLE(
  id uuid,
  clinic_id uuid,
  paciente_id uuid,
  medico_id uuid,
  data_agendamento timestamp with time zone,
  procedimento character varying,
  informacoes_adicionais text,
  status character varying,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    clinic_id,
    paciente_id,
    medico_id,
    data_agendamento,
    procedimento,
    informacoes_adicionais,
    status,
    created_at,
    updated_at
  FROM clinica.agendamentos
  WHERE clinic_id = p_clinic_id
  ORDER BY data_agendamento ASC;
$$;

-- Função para buscar pacientes de uma clínica
CREATE OR REPLACE FUNCTION public.get_clinic_pacientes(p_clinic_id uuid)
RETURNS TABLE(
  id uuid,
  nome character varying
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    nome
  FROM clinica.pacientes
  WHERE clinic_id = p_clinic_id
  ORDER BY nome;
$$;

-- Função para buscar médicos de uma clínica
CREATE OR REPLACE FUNCTION public.get_clinic_medicos(p_clinic_id uuid)
RETURNS TABLE(
  id uuid,
  nome character varying
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    nome
  FROM clinica.medicos
  WHERE clinic_id = p_clinic_id
  ORDER BY nome;
$$;

-- Função para criar agendamento
CREATE OR REPLACE FUNCTION public.create_agendamento(
  p_clinic_id uuid,
  p_paciente_id uuid,
  p_medico_id uuid,
  p_data_agendamento timestamp with time zone,
  p_procedimento character varying,
  p_informacoes_adicionais text,
  p_status character varying
)
RETURNS TABLE(
  id uuid,
  clinic_id uuid,
  paciente_id uuid,
  medico_id uuid,
  data_agendamento timestamp with time zone,
  procedimento character varying,
  informacoes_adicionais text,
  status character varying,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_id uuid;
BEGIN
  INSERT INTO clinica.agendamentos (
    clinic_id,
    paciente_id,
    medico_id,
    data_agendamento,
    procedimento,
    informacoes_adicionais,
    status
  )
  VALUES (
    p_clinic_id,
    p_paciente_id,
    p_medico_id,
    p_data_agendamento,
    p_procedimento,
    p_informacoes_adicionais,
    p_status
  )
  RETURNING clinica.agendamentos.id INTO v_new_id;
  
  RETURN QUERY
  SELECT 
    a.id,
    a.clinic_id,
    a.paciente_id,
    a.medico_id,
    a.data_agendamento,
    a.procedimento,
    a.informacoes_adicionais,
    a.status,
    a.created_at,
    a.updated_at
  FROM clinica.agendamentos a
  WHERE a.id = v_new_id;
END;
$$;

-- Função para atualizar agendamento
CREATE OR REPLACE FUNCTION public.update_agendamento(
  p_agendamento_id uuid,
  p_paciente_id uuid,
  p_medico_id uuid,
  p_data_agendamento timestamp with time zone,
  p_procedimento character varying,
  p_informacoes_adicionais text,
  p_status character varying
)
RETURNS TABLE(
  id uuid,
  clinic_id uuid,
  paciente_id uuid,
  medico_id uuid,
  data_agendamento timestamp with time zone,
  procedimento character varying,
  informacoes_adicionais text,
  status character varying,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE clinica.agendamentos
  SET 
    paciente_id = p_paciente_id,
    medico_id = p_medico_id,
    data_agendamento = p_data_agendamento,
    procedimento = p_procedimento,
    informacoes_adicionais = p_informacoes_adicionais,
    status = p_status,
    updated_at = now()
  WHERE id = p_agendamento_id;
  
  RETURN QUERY
  SELECT 
    a.id,
    a.clinic_id,
    a.paciente_id,
    a.medico_id,
    a.data_agendamento,
    a.procedimento,
    a.informacoes_adicionais,
    a.status,
    a.created_at,
    a.updated_at
  FROM clinica.agendamentos a
  WHERE a.id = p_agendamento_id;
END;
$$;

-- Função para deletar agendamento
CREATE OR REPLACE FUNCTION public.delete_agendamento(p_agendamento_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM clinica.agendamentos WHERE id = p_agendamento_id;
  RETURN TRUE;
END;
$$;