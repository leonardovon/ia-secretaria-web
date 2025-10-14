// Tipos compartilhados entre edge functions

export interface AgendamentoRequest {
  action: 'criar' | 'consultar' | 'remarcar' | 'cancelar' | 'horarios_disponiveis';
  clinic_id?: string;
  paciente?: {
    nome: string;
    telefone: string;
    data_nascimento: string;
  };
  agendamento?: {
    id?: string;
    medico_id?: string;
    medico_nome?: string;
    procedimento: string;
    data_agendamento: string;
    informacoes_adicionais?: string;
  };
  filtros?: {
    data_inicio?: string;
    data_fim?: string;
    medico_id?: string;
    paciente_id?: string;
    telefone?: string;
    status?: string;
    limite?: number;
  };
}

export interface AgendamentoResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}
