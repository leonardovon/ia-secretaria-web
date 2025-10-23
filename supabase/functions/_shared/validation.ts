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

export function convertBrazilianDateToISO(date: string): string {
  // Se já estiver em formato ISO (YYYY-MM-DD), retorna como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // Se estiver em formato brasileiro (DD/MM/YYYY)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  }
  
  // Tenta converter via Date (pode funcionar com outros formatos)
  const parsedDate = new Date(date);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().split('T')[0];
  }
  
  // Se não conseguir converter, retorna como está (vai falhar na validação)
  return date;
}

export function validateDataNascimento(data: string): ValidationResult {
  // Converte para ISO se necessário
  const dataISO = convertBrazilianDateToISO(data);
  const date = new Date(dataISO);
  
  if (isNaN(date.getTime())) {
    return {
      valid: false,
      error: 'Data de nascimento inválida. Use formato DD/MM/YYYY ou YYYY-MM-DD'
    };
  }
  
  const hoje = new Date();
  const idade = hoje.getFullYear() - date.getFullYear();
  
  if (idade < 0 || idade > 150) {
    return {
      valid: false,
      error: 'Data de nascimento fora do intervalo válido (0-150 anos)'
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
