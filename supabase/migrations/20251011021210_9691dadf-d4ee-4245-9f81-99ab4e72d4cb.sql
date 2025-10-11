-- Copy patients from public.pacientes to clinica.pacientes for user von
-- von's clinic_id: d14c59dc-137c-4d0c-8f35-a24f5b00d14c

INSERT INTO clinica.pacientes (id, clinic_id, nome, telefone, data_nascimento, created_at, updated_at)
SELECT 
  id,
  'd14c59dc-137c-4d0c-8f35-a24f5b00d14c'::uuid as clinic_id,
  nome,
  telefone,
  data_nascimento,
  created_at,
  updated_at
FROM public.pacientes
ON CONFLICT (id) DO NOTHING;