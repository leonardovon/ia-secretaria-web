-- =========================================
-- NORMALIZAÇÃO MULTI-TENANT (Versão 2)
-- Adiciona clinic_id em todas as tabelas
-- =========================================

-- 1. Adicionar clinic_id em clinica.pacientes
ALTER TABLE clinica.pacientes 
ADD COLUMN IF NOT EXISTS clinic_id UUID;

-- Migrar dados existentes (assumindo uma clínica padrão)
UPDATE clinica.pacientes 
SET clinic_id = (SELECT id FROM clinica.config LIMIT 1)
WHERE clinic_id IS NULL;

-- Tornar NOT NULL e adicionar foreign key
ALTER TABLE clinica.pacientes 
ALTER COLUMN clinic_id SET NOT NULL;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_pacientes_clinic'
  ) THEN
    ALTER TABLE clinica.pacientes
    ADD CONSTRAINT fk_pacientes_clinic 
      FOREIGN KEY (clinic_id) 
      REFERENCES clinica.config(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_pacientes_clinic_id ON clinica.pacientes(clinic_id);

-- 2. Adicionar clinic_id em clinica.medicos
ALTER TABLE clinica.medicos 
ADD COLUMN IF NOT EXISTS clinic_id UUID;

UPDATE clinica.medicos 
SET clinic_id = (SELECT id FROM clinica.config LIMIT 1)
WHERE clinic_id IS NULL;

ALTER TABLE clinica.medicos 
ALTER COLUMN clinic_id SET NOT NULL;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_medicos_clinic'
  ) THEN
    ALTER TABLE clinica.medicos
    ADD CONSTRAINT fk_medicos_clinic 
      FOREIGN KEY (clinic_id) 
      REFERENCES clinica.config(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_medicos_clinic_id ON clinica.medicos(clinic_id);

-- 3. Adicionar clinic_id em clinica.agendamentos
ALTER TABLE clinica.agendamentos 
ADD COLUMN IF NOT EXISTS clinic_id UUID;

UPDATE clinica.agendamentos 
SET clinic_id = (SELECT id FROM clinica.config LIMIT 1)
WHERE clinic_id IS NULL;

ALTER TABLE clinica.agendamentos 
ALTER COLUMN clinic_id SET NOT NULL;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_agendamentos_clinic'
  ) THEN
    ALTER TABLE clinica.agendamentos
    ADD CONSTRAINT fk_agendamentos_clinic 
      FOREIGN KEY (clinic_id) 
      REFERENCES clinica.config(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_agendamentos_clinic_id ON clinica.agendamentos(clinic_id);

-- 4. Atualizar clinica.chat_messages (já tem clinic_id mas pode ser nullable)
UPDATE clinica.chat_messages 
SET clinic_id = (SELECT id FROM clinica.config LIMIT 1)
WHERE clinic_id IS NULL;

ALTER TABLE clinica.chat_messages 
ALTER COLUMN clinic_id SET NOT NULL;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_chat_messages_clinic'
  ) THEN
    ALTER TABLE clinica.chat_messages
    ADD CONSTRAINT fk_chat_messages_clinic 
      FOREIGN KEY (clinic_id) 
      REFERENCES clinica.config(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_chat_messages_clinic_id ON clinica.chat_messages(clinic_id);

-- 5. Atualizar clinica.dados_cliente (já tem clinic_id mas pode ser nullable)
UPDATE clinica.dados_cliente 
SET clinic_id = (SELECT id FROM clinica.config LIMIT 1)
WHERE clinic_id IS NULL;

ALTER TABLE clinica.dados_cliente 
ALTER COLUMN clinic_id SET NOT NULL;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_dados_cliente_clinic'
  ) THEN
    ALTER TABLE clinica.dados_cliente
    ADD CONSTRAINT fk_dados_cliente_clinic 
      FOREIGN KEY (clinic_id) 
      REFERENCES clinica.config(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_dados_cliente_clinic_id ON clinica.dados_cliente(clinic_id);

-- =========================================
-- ATUALIZAR RLS POLICIES
-- =========================================

-- Remover policies antigas de agendamentos
DROP POLICY IF EXISTS "Permitir todas operações em agendamentos" ON clinica.agendamentos;

-- Criar nova policy para agendamentos filtrada por clinic_id
CREATE POLICY "Users can access their clinic agendamentos"
ON clinica.agendamentos
FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id 
    FROM clinica.user_accounts 
    WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  )
);

-- Remover policies antigas de pacientes
DROP POLICY IF EXISTS "Permitir todas operações em pacientes" ON clinica.pacientes;

-- Criar nova policy para pacientes filtrada por clinic_id
CREATE POLICY "Users can access their clinic pacientes"
ON clinica.pacientes
FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id 
    FROM clinica.user_accounts 
    WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  )
);

-- Remover policies antigas de medicos
DROP POLICY IF EXISTS "Permitir todas operações em medicos" ON clinica.medicos;

-- Criar nova policy para medicos filtrada por clinic_id
CREATE POLICY "Users can access their clinic medicos"
ON clinica.medicos
FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id 
    FROM clinica.user_accounts 
    WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  )
);

-- Atualizar policy de chat_messages
DROP POLICY IF EXISTS "Permitir todas operações em chat_messages" ON clinica.chat_messages;

CREATE POLICY "Users can access their clinic chat_messages"
ON clinica.chat_messages
FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id 
    FROM clinica.user_accounts 
    WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  )
);

-- Atualizar policy de dados_cliente
DROP POLICY IF EXISTS "Permitir todas operações em dados_cliente" ON clinica.dados_cliente;

CREATE POLICY "Users can access their clinic dados_cliente"
ON clinica.dados_cliente
FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id 
    FROM clinica.user_accounts 
    WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  )
);