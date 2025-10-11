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
      default:
        result = {
          success: false,
          error: `Ação '${action}' não reconhecida. Use: criar, consultar, remarcar ou cancelar`
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
      .schema('clinica')
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
        .schema('clinica')
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
        .schema('clinica')
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
          .schema('clinica')
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
      .schema('clinica')
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
    // 1) Buscar IDs de pacientes da clínica
    const { data: pacientesRows, error: pacientesError } = await supabase
      .schema('clinica')
      .from('pacientes')
      .select('id')
      .eq('clinic_id', clinic_id);

    if (pacientesError) {
      console.error('Erro ao listar pacientes da clínica:', pacientesError);
      return { success: false, error: 'Erro ao consultar agendamentos' };
    }

    const pacienteIds = (pacientesRows ?? []).map((p: any) => p.id);

    // Se não há pacientes, retorna vazio
    if (!pacienteIds.length) {
      return { success: true, message: '0 agendamento(s) encontrado(s)', data: [] };
    }

    // 2) Se filtro de paciente_id existir, valida se pertence à clínica
    if (filtros?.paciente_id && !pacienteIds.includes(filtros.paciente_id)) {
      return { success: true, message: '0 agendamento(s) encontrado(s)', data: [] };
    }

    // 3) Montar consulta de agendamentos filtrando por paciente_id
    let query = supabase
      .schema('clinica')
      .from('agendamentos')
      .select('id, procedimento, data_agendamento, status, informacoes_adicionais, created_at, paciente_id, medico_id')
      .in('paciente_id', filtros?.paciente_id ? [filtros.paciente_id] : pacienteIds)
      .order('data_agendamento', { ascending: true });

    if (filtros?.data_inicio) query = query.gte('data_agendamento', filtros.data_inicio);
    if (filtros?.data_fim) query = query.lte('data_agendamento', filtros.data_fim);
    if (filtros?.medico_id) query = query.eq('medico_id', filtros.medico_id);
    if (filtros?.status) query = query.eq('status', filtros.status);

    const { data: agendamentos, error: agError } = await query;

    if (agError) {
      console.error('Erro ao consultar agendamentos:', agError);
      return { success: false, error: 'Erro ao consultar agendamentos' };
    }

    if (!agendamentos?.length) {
      return { success: true, message: '0 agendamento(s) encontrado(s)', data: [] };
    }

    // 4) Enriquecer com dados de paciente e médico (opcional)
    const uniqPacienteIds = [...new Set(agendamentos.map((a: any) => a.paciente_id))];
    const uniqMedicoIds = [...new Set(agendamentos.map((a: any) => a.medico_id).filter(Boolean))];

    const [pacRes, medRes] = await Promise.all([
      supabase.schema('clinica').from('pacientes').select('id, nome, telefone').in('id', uniqPacienteIds),
      uniqMedicoIds.length
        ? supabase.schema('clinica').from('medicos').select('id, nome').in('id', uniqMedicoIds)
        : Promise.resolve({ data: [] as any[], error: null } as any)
    ]);

    const pacientesDetalhe = (pacRes as any).data ?? [];
    const medicosDetalhe = (medRes as any).data ?? [];

    const pacMap = new Map((pacientesDetalhe ?? []).map((p: any) => [p.id, p]));
    const medMap = new Map((medicosDetalhe ?? []).map((m: any) => [m.id, m]));

    const resultado = agendamentos.map((a: any) => ({
      id: a.id,
      procedimento: a.procedimento,
      data_agendamento: a.data_agendamento,
      status: a.status,
      informacoes_adicionais: a.informacoes_adicionais,
      created_at: a.created_at,
      pacientes: pacMap.get(a.paciente_id) || null,
      medicos: a.medico_id ? medMap.get(a.medico_id) || null : null,
    }));

    return { success: true, message: `${resultado.length} agendamento(s) encontrado(s)`, data: resultado };

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
    // Verificar se o agendamento pertence à clínica
    const { data: agendCheck } = await supabase
      .schema('clinica')
      .from('agendamentos')
      .select('id, pacientes!inner(clinic_id)')
      .eq('id', agendamento.id)
      .eq('pacientes.clinic_id', clinic_id)
      .maybeSingle();
    
    if (!agendCheck) {
      return { success: false, error: 'Agendamento não encontrado ou não pertence a esta clínica' };
    }

    const updateData: any = {
      data_agendamento: agendamento.data_agendamento,
      status: 'remarcado'
    };

    if (agendamento.informacoes_adicionais) {
      updateData.informacoes_adicionais = agendamento.informacoes_adicionais;
    }

    const { data, error } = await supabase
      .schema('clinica')
      .from('agendamentos')
      .update(updateData)
      .eq('id', agendamento.id)
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
    // Verificar se o agendamento pertence à clínica
    const { data: agendCheck } = await supabase
      .schema('clinica')
      .from('agendamentos')
      .select('id, pacientes!inner(clinic_id)')
      .eq('id', agendamento.id)
      .eq('pacientes.clinic_id', clinic_id)
      .maybeSingle();
    
    if (!agendCheck) {
      return { success: false, error: 'Agendamento não encontrado ou não pertence a esta clínica' };
    }

    const { data, error } = await supabase
      .schema('clinica')
      .from('agendamentos')
      .update({ status: 'cancelado' })
      .eq('id', agendamento.id)
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
