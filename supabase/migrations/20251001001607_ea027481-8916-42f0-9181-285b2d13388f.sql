-- Criar schema clinica
CREATE SCHEMA IF NOT EXISTS clinica;

-- Tabela de configuração da clínica
CREATE TABLE clinica.config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_clinica VARCHAR NOT NULL,
  telefone VARCHAR NOT NULL,
  endereco TEXT,
  login VARCHAR NOT NULL UNIQUE,
  senha_hash VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de médicos
CREATE TABLE clinica.medicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de pacientes
CREATE TABLE clinica.pacientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR NOT NULL,
  telefone VARCHAR NOT NULL,
  data_nascimento DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de agendamentos
CREATE TABLE clinica.agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL,
  medico_id UUID NOT NULL,
  procedimento VARCHAR NOT NULL,
  data_agendamento TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'agendado',
  informacoes_adicionais TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de chats
CREATE TABLE clinica.chats (
  id BIGSERIAL PRIMARY KEY,
  phone TEXT,
  etapa_followup NUMERIC DEFAULT 0,
  updated_at TEXT,
  created_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de mensagens do chat
CREATE TABLE clinica.chat_messages (
  id BIGSERIAL PRIMARY KEY,
  phone TEXT,
  nomewpp TEXT,
  user_message TEXT,
  bot_message TEXT,
  message_type TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de histórico de mensagens
CREATE TABLE clinica.chat_message_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de dados do cliente
CREATE TABLE clinica.dados_cliente (
  id BIGSERIAL PRIMARY KEY,
  telefone TEXT,
  nomewpp TEXT,
  atendimento_ia TEXT,
  created_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE clinica.config ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinica.medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinica.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinica.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinica.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinica.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinica.chat_message_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinica.dados_cliente ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permitir todas operações por enquanto)
CREATE POLICY "Permitir todas operações em config" ON clinica.config FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em medicos" ON clinica.medicos FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em pacientes" ON clinica.pacientes FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em agendamentos" ON clinica.agendamentos FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em chats" ON clinica.chats FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em chat_messages" ON clinica.chat_messages FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em chat_message_history" ON clinica.chat_message_history FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em dados_cliente" ON clinica.dados_cliente FOR ALL USING (true);

-- Triggers para updated_at
CREATE TRIGGER update_config_updated_at
  BEFORE UPDATE ON clinica.config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicos_updated_at
  BEFORE UPDATE ON clinica.medicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pacientes_updated_at
  BEFORE UPDATE ON clinica.pacientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON clinica.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();