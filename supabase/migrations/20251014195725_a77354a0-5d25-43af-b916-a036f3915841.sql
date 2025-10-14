-- Adicionar foreign keys faltantes na tabela agendamentos do schema clinica

-- Foreign key para pacientes
ALTER TABLE clinica.agendamentos 
ADD CONSTRAINT fk_agendamentos_paciente 
FOREIGN KEY (paciente_id) 
REFERENCES clinica.pacientes(id) 
ON DELETE RESTRICT;

-- Foreign key para medicos
ALTER TABLE clinica.agendamentos 
ADD CONSTRAINT fk_agendamentos_medico 
FOREIGN KEY (medico_id) 
REFERENCES clinica.medicos(id) 
ON DELETE SET NULL;