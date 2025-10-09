import { createSupabaseClient, validateClinicExists } from '../_shared/supabase.ts';
import {
  validateTelefone,
  validateDataNascimento,
  validateDataAgendamento,
  sanitizeTelefone,
  formatErrorMessage
} from '../_shared/validation.ts';
import type { AgendamentoRequest, AgendamentoResponse } from '../_shared/types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: AgendamentoRequest = await req.json();
    const { action, clinic_id } = body;

    console.log('Agendamento Clinica - Action:', action, 'Clinic ID:', clinic_id);

    // Validação obrigatória do clinic_id
    if (!clinic_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'clinic_id é obrigatório para operações multi-tenant'
        } as AgendamentoResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createSupabaseClient();

    // Valida se a clínica existe
    const clinicExists = await validateClinicExists(supabase, clinic_id);
    if (!clinicExists) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Clínica não encontrada'
        } as AgendamentoResponse),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Roteamento de ações
    let result: AgendamentoResponse;

    switch (action) {
      case 'criar':
        result = await criarAgendamento(supabase, body);
        break;
      case 'consultar':
        result = await consultarAgendamentos(supabase, body);
        break;
      case 'remarcar':
        result = await remarcarAgendamento(supabase, body);
        break;
      case 'cancelar':
        result = await cancelarAgendamento(supabase, body);
        break;
      case 'listar_medicos':
        result = await listarMedicos(supabase, body);
        break;
      case 'listar_pacientes':
        result = await listarPacientes(supabase, body);
        break;
      case 'criar_medico':
        result = await criarMedico(supabase, body);
        break;
      case 'criar_paciente':
        result = await criarPaciente(supabase, body);
        break;
      default:
        result = {
          success: false,
          error: `Ação '${action}' não reconhecida. Use: criar, consultar, remarcar, cancelar, listar_medicos, listar_pacientes, criar_medico, criar_paciente`
        };
    }

    const status = result.success ? 200 : 400;
    return new Response(
      JSON.stringify(result),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro no agendamento-clinica:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: formatErrorMessage(error)
      } as AgendamentoResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function criarAgendamento(supabase: any, body: AgendamentoRequest): Promise<AgendamentoResponse> {
  const { clinic_id, paciente, agendamento } = body;

  if (!paciente || !agendamento) {
    return {
      success: false,
      error: 'Dados do paciente e agendamento são obrigatórios'
    };
  }

  // Validações
  const telefoneValidation = validateTelefone(paciente.telefone);
  if (!telefoneValidation.valid) {
    return { success: false, error: telefoneValidation.error! };
  }

  const dataNascValidation = validateDataNascimento(paciente.data_nascimento);
  if (!dataNascValidation.valid) {
    return { success: false, error: dataNascValidation.error! };
  }

  const dataAgendValidation = validateDataAgendamento(agendamento.data_agendamento);
  if (!dataAgendValidation.valid) {
    return { success: false, error: dataAgendValidation.error! };
  }

  const telefoneSanitized = sanitizeTelefone(paciente.telefone);

  try {
    // 1. Buscar ou criar paciente
    let pacienteId: string;
    
    const { data: pacienteExistente, error: searchError } = await supabase
      .from('pacientes')
      .select('id')
      .eq('clinic_id', clinic_id)
      .eq('telefone', telefoneSanitized)
      .maybeSingle();

    if (searchError) {
      console.error('Erro ao buscar paciente:', searchError);
      return { success: false, error: 'Erro ao buscar paciente' };
    }

    if (pacienteExistente) {
      pacienteId = pacienteExistente.id;
      console.log('Paciente encontrado:', pacienteId);
    } else {
      const { data: novoPaciente, error: insertError } = await supabase
        .from('pacientes')
        .insert({
          clinic_id,
          nome: paciente.nome,
          telefone: telefoneSanitized,
          data_nascimento: paciente.data_nascimento
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Erro ao criar paciente:', insertError);
        return { success: false, error: 'Erro ao criar paciente' };
      }

      pacienteId = novoPaciente.id;
      console.log('Novo paciente criado:', pacienteId);
    }

    // 2. Buscar ou criar médico (se necessário)
    let medicoId: string | undefined = agendamento.medico_id;

    if (!medicoId && agendamento.medico_nome) {
      const { data: medicoExistente, error: searchMedicoError } = await supabase
        .from('medicos')
        .select('id')
        .eq('clinic_id', clinic_id)
        .ilike('nome', agendamento.medico_nome)
        .maybeSingle();

      if (searchMedicoError) {
        console.error('Erro ao buscar médico:', searchMedicoError);
      }

      if (medicoExistente) {
        medicoId = medicoExistente.id;
      } else {
        const { data: novoMedico, error: insertMedicoError } = await supabase
          .from('medicos')
          .insert({
            clinic_id,
            nome: agendamento.medico_nome
          })
          .select('id')
          .single();

        if (insertMedicoError) {
          console.error('Erro ao criar médico:', insertMedicoError);
        } else {
          medicoId = novoMedico.id;
        }
      }
    }

    // 3. Criar agendamento
    const agendamentoData: any = {
      clinic_id,
      paciente_id: pacienteId,
      procedimento: agendamento.procedimento,
      data_agendamento: agendamento.data_agendamento,
      status: 'agendado'
    };

    if (medicoId) {
      agendamentoData.medico_id = medicoId;
    }

    if (agendamento.informacoes_adicionais) {
      agendamentoData.informacoes_adicionais = agendamento.informacoes_adicionais;
    }

    const { data: novoAgendamento, error: agendError } = await supabase
      .from('agendamentos')
      .insert(agendamentoData)
      .select(`
        id,
        procedimento,
        data_agendamento,
        status,
        informacoes_adicionais,
        pacientes (nome, telefone),
        medicos (nome)
      `)
      .single();

    if (agendError) {
      console.error('Erro ao criar agendamento:', agendError);
      return { success: false, error: 'Erro ao criar agendamento' };
    }

    return {
      success: true,
      message: 'Agendamento criado com sucesso',
      data: novoAgendamento
    };

  } catch (error: any) {
    console.error('Erro em criarAgendamento:', error);
    return { success: false, error: formatErrorMessage(error) };
  }
}

async function consultarAgendamentos(supabase: any, body: AgendamentoRequest): Promise<AgendamentoResponse> {
  const { clinic_id, filtros } = body;

  try {
    let query = supabase
      .from('agendamentos')
      .select(`
        id,
        procedimento,
        data_agendamento,
        status,
        informacoes_adicionais,
        created_at,
        pacientes (id, nome, telefone),
        medicos (id, nome)
      `)
      .eq('clinic_id', clinic_id)
      .order('data_agendamento', { ascending: true });

    if (filtros?.data_inicio) {
      query = query.gte('data_agendamento', filtros.data_inicio);
    }

    if (filtros?.data_fim) {
      query = query.lte('data_agendamento', filtros.data_fim);
    }

    if (filtros?.medico_id) {
      query = query.eq('medico_id', filtros.medico_id);
    }

    if (filtros?.paciente_id) {
      query = query.eq('paciente_id', filtros.paciente_id);
    }

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao consultar agendamentos:', error);
      return { success: false, error: 'Erro ao consultar agendamentos' };
    }

    return {
      success: true,
      message: `${data.length} agendamento(s) encontrado(s)`,
      data
    };

  } catch (error: any) {
    console.error('Erro em consultarAgendamentos:', error);
    return { success: false, error: formatErrorMessage(error) };
  }
}

async function remarcarAgendamento(supabase: any, body: AgendamentoRequest): Promise<AgendamentoResponse> {
  const { clinic_id, agendamento } = body;

  if (!agendamento?.id || !agendamento.data_agendamento) {
    return {
      success: false,
      error: 'ID do agendamento e nova data são obrigatórios'
    };
  }

  const dataValidation = validateDataAgendamento(agendamento.data_agendamento);
  if (!dataValidation.valid) {
    return { success: false, error: dataValidation.error! };
  }

  try {
    const updateData: any = {
      data_agendamento: agendamento.data_agendamento,
      status: 'remarcado'
    };

    if (agendamento.informacoes_adicionais) {
      updateData.informacoes_adicionais = agendamento.informacoes_adicionais;
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .update(updateData)
      .eq('id', agendamento.id)
      .eq('clinic_id', clinic_id)
      .select(`
        id,
        procedimento,
        data_agendamento,
        status,
        informacoes_adicionais,
        pacientes (nome, telefone),
        medicos (nome)
      `)
      .single();

    if (error) {
      console.error('Erro ao remarcar agendamento:', error);
      return { success: false, error: 'Erro ao remarcar agendamento' };
    }

    if (!data) {
      return { success: false, error: 'Agendamento não encontrado' };
    }

    return {
      success: true,
      message: 'Agendamento remarcado com sucesso',
      data
    };

  } catch (error: any) {
    console.error('Erro em remarcarAgendamento:', error);
    return { success: false, error: formatErrorMessage(error) };
  }
}

async function cancelarAgendamento(supabase: any, body: AgendamentoRequest): Promise<AgendamentoResponse> {
  const { clinic_id, agendamento } = body;

  if (!agendamento?.id) {
    return {
      success: false,
      error: 'ID do agendamento é obrigatório'
    };
  }

  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .update({ status: 'cancelado' })
      .eq('id', agendamento.id)
      .eq('clinic_id', clinic_id)
      .select(`
        id,
        procedimento,
        data_agendamento,
        status,
        pacientes (nome, telefone),
        medicos (nome)
      `)
      .single();

    if (error) {
      console.error('Erro ao cancelar agendamento:', error);
      return { success: false, error: 'Erro ao cancelar agendamento' };
    }

    if (!data) {
      return { success: false, error: 'Agendamento não encontrado' };
    }

    return {
      success: true,
      message: 'Agendamento cancelado com sucesso',
      data
    };

  } catch (error: any) {
    console.error('Erro em cancelarAgendamento:', error);
    return { success: false, error: formatErrorMessage(error) };
  }
}

async function listarMedicos(supabase: any, body: AgendamentoRequest): Promise<AgendamentoResponse> {
  const { clinic_id } = body;

  try {
    const { data, error } = await supabase
      .from('medicos')
      .select('id, nome, especialidade, crm, created_at')
      .eq('clinic_id', clinic_id)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao listar médicos:', error);
      return { success: false, error: 'Erro ao listar médicos' };
    }

    return {
      success: true,
      message: `${data.length} médico(s) encontrado(s)`,
      data
    };

  } catch (error: any) {
    console.error('Erro em listarMedicos:', error);
    return { success: false, error: formatErrorMessage(error) };
  }
}

async function listarPacientes(supabase: any, body: AgendamentoRequest): Promise<AgendamentoResponse> {
  const { clinic_id } = body;

  try {
    const { data, error } = await supabase
      .from('pacientes')
      .select('id, nome, telefone, data_nascimento, created_at')
      .eq('clinic_id', clinic_id)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao listar pacientes:', error);
      return { success: false, error: 'Erro ao listar pacientes' };
    }

    return {
      success: true,
      message: `${data.length} paciente(s) encontrado(s)`,
      data
    };

  } catch (error: any) {
    console.error('Erro em listarPacientes:', error);
    return { success: false, error: formatErrorMessage(error) };
  }
}

async function criarMedico(supabase: any, body: AgendamentoRequest): Promise<AgendamentoResponse> {
  const { clinic_id, medico } = body;

  if (!medico?.nome) {
    return {
      success: false,
      error: 'Nome do médico é obrigatório'
    };
  }

  try {
    const medicoData: any = {
      clinic_id,
      nome: medico.nome
    };

    if (medico.especialidade) {
      medicoData.especialidade = medico.especialidade;
    }

    if (medico.crm) {
      medicoData.crm = medico.crm;
    }

    const { data, error } = await supabase
      .from('medicos')
      .insert(medicoData)
      .select('id, nome, especialidade, crm, created_at')
      .single();

    if (error) {
      console.error('Erro ao criar médico:', error);
      return { success: false, error: 'Erro ao criar médico' };
    }

    return {
      success: true,
      message: 'Médico criado com sucesso',
      data
    };

  } catch (error: any) {
    console.error('Erro em criarMedico:', error);
    return { success: false, error: formatErrorMessage(error) };
  }
}

async function criarPaciente(supabase: any, body: AgendamentoRequest): Promise<AgendamentoResponse> {
  const { clinic_id, paciente } = body;

  if (!paciente?.nome || !paciente?.telefone || !paciente?.data_nascimento) {
    return {
      success: false,
      error: 'Nome, telefone e data de nascimento são obrigatórios'
    };
  }

  // Validações
  const telefoneValidation = validateTelefone(paciente.telefone);
  if (!telefoneValidation.valid) {
    return { success: false, error: telefoneValidation.error! };
  }

  const dataNascValidation = validateDataNascimento(paciente.data_nascimento);
  if (!dataNascValidation.valid) {
    return { success: false, error: dataNascValidation.error! };
  }

  const telefoneSanitized = sanitizeTelefone(paciente.telefone);

  try {
    // Verificar se paciente já existe
    const { data: existente } = await supabase
      .from('pacientes')
      .select('id')
      .eq('clinic_id', clinic_id)
      .eq('telefone', telefoneSanitized)
      .maybeSingle();

    if (existente) {
      return {
        success: false,
        error: 'Paciente com este telefone já existe'
      };
    }

    const { data, error } = await supabase
      .from('pacientes')
      .insert({
        clinic_id,
        nome: paciente.nome,
        telefone: telefoneSanitized,
        data_nascimento: paciente.data_nascimento
      })
      .select('id, nome, telefone, data_nascimento, created_at')
      .single();

    if (error) {
      console.error('Erro ao criar paciente:', error);
      return { success: false, error: 'Erro ao criar paciente' };
    }

    return {
      success: true,
      message: 'Paciente criado com sucesso',
      data
    };

  } catch (error: any) {
    console.error('Erro em criarPaciente:', error);
    return { success: false, error: formatErrorMessage(error) };
  }
}
