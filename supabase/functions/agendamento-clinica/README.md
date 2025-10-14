# Edge Function: agendamento-clinica

Edge function multi-tenant para gestão de agendamentos médicos no schema `clinica`.

## Endpoint

```
POST https://ononwldrcvretdjflyjk.supabase.co/functions/v1/agendamento-clinica
```

## Autenticação

A função requer autenticação via JWT. Certifique-se de incluir o token no header:

```
Authorization: Bearer <seu-token>
```

## Parâmetros Obrigatórios

- `clinic_id` (string, UUID): ID da clínica no schema `clinica.config`
- `action` (string): Ação a ser executada: `criar`, `consultar`, `remarcar`, `cancelar`, `horarios_disponiveis`, `listar_medicos`, `agenda_semanal`, `listar_pacientes`, `editar_paciente`

## Ações Disponíveis

### 1. Criar Agendamento

```json
{
  "action": "criar",
  "clinic_id": "uuid-da-clinica",
  "paciente": {
    "nome": "Nome do Paciente",
    "telefone": "5548991234567",
    "data_nascimento": "1990-01-15"
  },
  "agendamento": {
    "medico_id": "uuid-do-medico",
    "medico_nome": "Dr. João Silva",
    "procedimento": "Consulta Oftalmológica",
    "data_agendamento": "2025-10-15T14:30:00Z",
    "informacoes_adicionais": "Paciente com histórico de miopia"
  }
}
```

**Notas:**
- Se `medico_id` não for fornecido, a função tentará buscar ou criar o médico pelo nome
- Se o paciente já existir (mesmo telefone), será reutilizado
- Telefone deve estar no formato: 55 + DDD + número (ex: 5548991234567)

### 2. Consultar Agendamentos

```json
{
  "action": "consultar",
  "clinic_id": "uuid-da-clinica",
  "filtros": {
    "data_inicio": "2025-10-01",
    "data_fim": "2025-10-31",
    "medico_id": "uuid-do-medico",
    "paciente_id": "uuid-do-paciente",
    "telefone": "5548991234567",
    "status": "agendado"
  }
}
```

**Filtros disponíveis:**
- `data_inicio`: Filtra agendamentos a partir desta data
- `data_fim`: Filtra agendamentos até esta data
- `medico_id`: Filtra por médico específico
- `paciente_id`: Filtra por paciente específico
- `telefone`: Busca agendamentos por telefone do paciente
- `status`: Filtra por status (`agendado`, `remarcado`, `cancelado`, `concluído`)

### 3. Remarcar Agendamento

```json
{
  "action": "remarcar",
  "clinic_id": "uuid-da-clinica",
  "agendamento": {
    "id": "uuid-do-agendamento",
    "data_agendamento": "2025-10-20T15:00:00Z",
    "informacoes_adicionais": "Remarcado a pedido do paciente"
  }
}
```

### 4. Cancelar Agendamento

```json
{
  "action": "cancelar",
  "clinic_id": "uuid-da-clinica",
  "agendamento": {
    "id": "uuid-do-agendamento"
  }
}
```

### 5. Buscar Horários Disponíveis

```json
{
  "action": "horarios_disponiveis",
  "clinic_id": "uuid-da-clinica",
  "filtros": {
    "medico_id": "uuid-do-medico",
    "data_inicio": "2025-01-15T10:00:00",
    "limite": 3
  }
}
```

**Parâmetros:**
- `medico_id` (obrigatório): UUID do médico
- `data_inicio` (obrigatório): Data/hora sugerida em formato ISO 8601
- `limite` (opcional): Quantidade de horários a retornar (padrão: 3)

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "3 horário(s) disponível(is) encontrado(s)",
  "data": [
    {
      "data": "2025-01-15T10:00:00.000Z",
      "hora": "10:00"
    },
    {
      "data": "2025-01-15T10:30:00.000Z",
      "hora": "10:30"
    },
    {
      "data": "2025-01-15T11:00:00.000Z",
      "hora": "11:00"
    }
  ]
}
```

### 6. Listar Médicos

```json
{
  "action": "listar_medicos",
  "clinic_id": "uuid-da-clinica"
}
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "3 médico(s) encontrado(s)",
  "data": [
    {
      "id": "uuid-medico-1",
      "nome": "Dr. João Silva",
      "created_at": "2025-01-10T10:00:00Z"
    },
    {
      "id": "uuid-medico-2",
      "nome": "Dra. Maria Santos",
      "created_at": "2025-01-11T14:30:00Z"
    }
  ]
}
```

### 7. Agenda Semanal do Médico

```json
{
  "action": "agenda_semanal",
  "clinic_id": "uuid-da-clinica",
  "agenda_semanal": {
    "medico_id": "uuid-do-medico",
    "data": "2025-01-20"
  }
}
```

**Parâmetros:**
- `medico_id` (obrigatório): UUID do médico
- `data` (opcional): Data de referência no formato YYYY-MM-DD. Se não informado, usa semana atual

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "Agenda semanal de Dr. João Silva",
  "data": {
    "medico": {
      "id": "uuid-medico",
      "nome": "Dr. João Silva"
    },
    "semana": {
      "inicio": "2025-01-20",
      "fim": "2025-01-24"
    },
    "dias": [
      {
        "data": "2025-01-20",
        "dia_semana": "Segunda",
        "horarios": [
          {
            "hora": "09:00",
            "ocupado": true,
            "agendamento": {
              "id": "uuid-agendamento",
              "paciente_nome": "Maria Silva",
              "paciente_telefone": "5548991234567",
              "procedimento": "Consulta"
            }
          },
          {
            "hora": "09:30",
            "ocupado": false
          }
        ]
      }
    ]
  }
}
```

### 8. Listar Pacientes

```json
{
  "action": "listar_pacientes",
  "clinic_id": "uuid-da-clinica",
  "paciente_busca": {
    "busca": "Maria"
  }
}
```

**Parâmetros:**
- `busca` (opcional): Busca por nome ou telefone do paciente

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "5 paciente(s) encontrado(s)",
  "data": [
    {
      "id": "uuid-paciente",
      "nome": "Maria Silva",
      "telefone": "5548991234567",
      "data_nascimento": "1990-01-15",
      "created_at": "2025-01-10T10:00:00Z"
    }
  ]
}
```

### 9. Editar Paciente

```json
{
  "action": "editar_paciente",
  "clinic_id": "uuid-da-clinica",
  "paciente_edicao": {
    "id": "uuid-do-paciente",
    "nome": "Maria Silva Santos",
    "telefone": "5548991234567",
    "data_nascimento": "1990-01-15"
  }
}
```

**Validações:**
- Paciente deve pertencer à clínica informada
- Telefone não pode estar duplicado para outro paciente
- Data de nascimento deve ser válida

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "Paciente atualizado com sucesso",
  "data": {
    "id": "uuid-paciente",
    "nome": "Maria Silva Santos",
    "telefone": "5548991234567",
    "data_nascimento": "1990-01-15",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

## Respostas

### Sucesso

```json
{
  "success": true,
  "message": "Agendamento criado com sucesso",
  "data": {
    "id": "uuid",
    "procedimento": "Consulta",
    "data_agendamento": "2025-10-15T14:30:00Z",
    "status": "agendado",
    "pacientes": {
      "nome": "Nome do Paciente",
      "telefone": "5548991234567"
    },
    "medicos": {
      "nome": "Dr. João Silva"
    }
  }
}
```

### Erro

```json
{
  "success": false,
  "error": "Descrição do erro"
}
```

## Validações

A função realiza as seguintes validações:

1. **Telefone**: Deve estar no formato brasileiro: 55 + DDD (2 dígitos) + número (8 ou 9 dígitos)
2. **Data de Nascimento**: Deve ser válida e dentro de um intervalo razoável (0-150 anos)
3. **Data de Agendamento**: Não pode ser no passado
4. **Clinic ID**: Deve existir na tabela `clinica.config`

## Schemas e Tabelas

A função opera no schema `clinica` e acessa as seguintes tabelas:

- `clinica.config` - Configurações da clínica
- `clinica.pacientes` - Dados dos pacientes
- `clinica.medicos` - Dados dos médicos
- `clinica.agendamentos` - Agendamentos

Todas as tabelas incluem o campo `clinic_id` para isolamento multi-tenant.

## Exemplo de Uso no n8n

```javascript
// No nó HTTP Request do n8n:
{
  "method": "POST",
  "url": "https://ononwldrcvretdjflyjk.supabase.co/functions/v1/agendamento-clinica",
  "headers": {
    "Authorization": "Bearer {{ $json.supabase_token }}",
    "Content-Type": "application/json"
  },
  "body": {
    "action": "criar",
    "clinic_id": "{{ $json.clinic_id }}",
    "paciente": {
      "nome": "{{ $json.paciente_nome }}",
      "telefone": "{{ $json.paciente_telefone }}",
      "data_nascimento": "{{ $json.paciente_nascimento }}"
    },
    "agendamento": {
      "medico_nome": "{{ $json.medico }}",
      "procedimento": "{{ $json.procedimento }}",
      "data_agendamento": "{{ $json.data_hora }}",
      "informacoes_adicionais": "{{ $json.observacoes }}"
    }
  }
}
```

## Logs

A função gera logs detalhados para facilitar debugging:
- Logs de cada ação executada
- Logs de criação/busca de pacientes e médicos
- Logs de erros com stack trace completo

Acesse os logs em: https://supabase.com/dashboard/project/ononwldrcvretdjflyjk/functions/agendamento-clinica/logs

## Arquitetura

A função utiliza código compartilhado na pasta `_shared/`:
- `types.ts` - Tipos TypeScript compartilhados
- `validation.ts` - Funções de validação reutilizáveis
- `supabase.ts` - Cliente Supabase e helpers

Isso permite manter a consistência entre múltiplas edge functions e facilita a manutenção.
