import { ValidationResult } from './types.ts';

export function validateTelefone(telefone: string): ValidationResult {
  // Remove espaços, hífens e parênteses
  const cleaned = telefone.replace(/[\s\-\(\)]/g, '');
  
  // Valida formato brasileiro: 55 + DDD (2 dígitos) + número (8 ou 9 dígitos)
  if (!/^55\d{10,11}$/.test(cleaned)) {
    return {
      valid: false,
      error: 'Telefone deve estar no formato: 55 + DDD + número (ex: 5548991234567)'
    };
  }
  
  return { valid: true };
}

export function validateDataNascimento(data: string): ValidationResult {
  const date = new Date(data);
  
  if (isNaN(date.getTime())) {
    return {
      valid: false,
      error: 'Data de nascimento inválida'
    };
  }
  
  const hoje = new Date();
  const idade = hoje.getFullYear() - date.getFullYear();
  
  if (idade < 0 || idade > 150) {
    return {
      valid: false,
      error: 'Data de nascimento fora do intervalo válido'
    };
  }
  
  return { valid: true };
}

export function validateDataAgendamento(data: string): ValidationResult {
  const dataAgendamento = new Date(data);
  
  if (isNaN(dataAgendamento.getTime())) {
    return {
      valid: false,
      error: 'Data de agendamento inválida'
    };
  }
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  if (dataAgendamento < hoje) {
    return {
      valid: false,
      error: 'Data de agendamento não pode ser no passado'
    };
  }
  
  return { valid: true };
}

export function sanitizeTelefone(telefone: string): string {
  return telefone.replace(/[\s\-\(\)\n\r\t]/g, '').trim();
}

export function formatErrorMessage(error: any): string {
  if (error?.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Erro desconhecido';
}
