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
      case 'horarios_disponiveis':
        result = await buscarHorariosDisponiveis(supabase, body);
        break;
      case 'listar_medicos':
        result = await listarMedicos(supabase, body);
        break;
      case 'agenda_semanal':
        result = await agendaSemanal(supabase, body);
        break;
      case 'listar_pacientes':
        result = await listarPacientes(supabase, body);
        break;
      case 'editar_paciente':
        result = await editarPaciente(supabase, body);
        break;
      default:
        result = {
          success: false,
          error: `Ação '${action}' não reconhecida. Use: criar, consultar, remarcar, cancelar, horarios_disponiveis, listar_medicos, agenda_semanal, listar_pacientes ou editar_paciente`
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
      .select('id, telefone')
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

    // 2) Se filtro de telefone existir, encontrar paciente_id correspondente
    if (filtros?.telefone) {
      const pacienteComTelefone = (pacientesRows ?? []).find((p: any) => p.telefone === filtros.telefone);
      if (pacienteComTelefone) {
        filtros.paciente_id = pacienteComTelefone.id;
      } else {
        // Telefone não encontrado na clínica
        return { success: true, message: '0 agendamento(s) encontrado(s)', data: [] };
      }
    }

    // 3) Se filtro de paciente_id existir, valida se pertence à clínica
    if (filtros?.paciente_id && !pacienteIds.includes(filtros.paciente_id)) {
      return { success: true, message: '0 agendamento(s) encontrado(s)', data: [] };
    }

    // 4) Montar consulta de agendamentos filtrando por paciente_id
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

    // 5) Enriquecer com dados de paciente e médico (opcional)
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

async function buscarHorariosDisponiveis(supabase: any, body: AgendamentoRequest): Promise<AgendamentoResponse> {
  const { clinic_id, filtros } = body;

  if (!filtros?.medico_id || !filtros.data_inicio) {
    return {
      success: false,
      error: 'medico_id e data_inicio são obrigatórios'
    };
  }

  const limite = filtros.limite || 3;

  try {
    // 0) Verificar se o médico pertence à clínica
    const { data: medicoRow, error: medicoErr } = await supabase
      .schema('clinica')
      .from('medicos')
      .select('id')
      .eq('id', filtros.medico_id)
      .eq('clinic_id', clinic_id)
      .maybeSingle();

    if (medicoErr) {
      console.error('Erro ao validar médico:', medicoErr);
      return { success: false, error: 'Erro ao validar médico' };
    }
    if (!medicoRow) {
      return { success: false, error: 'Médico não encontrado para esta clínica' };
    }

    // 1) Definir horários de funcionamento
    const HORARIOS_FUNCIONAMENTO = {
      segunda_sexta: { inicio: 7, fim: 19 }, // 07h - 19h
    } as const;
    const DURACAO_CONSULTA = 30; // minutos

    // 2) Parse da data sugerida
    const dataSugerida = new Date(filtros.data_inicio);
    if (isNaN(dataSugerida.getTime())) {
      return { success: false, error: 'data_inicio inválida. Use formato ISO 8601' };
    }

    // Nunca retornar horários no passado
    const agora = new Date();
    if (dataSugerida < agora) {
      // arredonda para o próximo slot de 30 minutos
      const arred = new Date(agora);
      const min = arred.getMinutes();
      arred.setSeconds(0, 0);
      if (min > 0 && min <= 30) arred.setMinutes(30);
      else if (min > 30) arred.setHours(arred.getHours() + 1, 0, 0, 0);
      dataSugerida.setTime(arred.getTime());
    }

    // 3) Intervalo de busca (até 14 dias à frente)
    const inicioIntervalo = new Date(dataSugerida);
    inicioIntervalo.setHours(0, 0, 0, 0);
    const fimIntervalo = new Date(inicioIntervalo);
    fimIntervalo.setDate(fimIntervalo.getDate() + 14);

    // 4) Buscar agendamentos já ocupados do médico
    const { data: agendamentos, error: agendError } = await supabase
      .schema('clinica')
      .from('agendamentos')
      .select('data_agendamento')
      .eq('medico_id', filtros.medico_id)
      .gte('data_agendamento', inicioIntervalo.toISOString())
      .lt('data_agendamento', fimIntervalo.toISOString())
      .in('status', ['agendado', 'remarcado']);

    if (agendError) {
      console.error('Erro ao buscar agendamentos:', agendError);
      return { success: false, error: 'Erro ao buscar agendamentos do médico' };
    }

    const horariosOcupados = new Set((agendamentos || []).map((a: any) => new Date(a.data_agendamento).getTime()));

    // 5) Gerar horários disponíveis seguindo regras
    const horariosDisponiveis: Array<{ data: string; hora: string }> = [];
    let dataAtual = new Date(dataSugerida);

    while (horariosDisponiveis.length < limite && dataAtual < fimIntervalo) {
      const diaSemana = dataAtual.getDay();

      // Pular finais de semana (sábado=6, domingo=0)
      if (diaSemana === 0 || diaSemana === 6) {
        dataAtual.setDate(dataAtual.getDate() + 1);
        dataAtual.setHours(0, 0, 0, 0);
        continue;
      }

      // Horário de funcionamento segunda a sexta
      const horaInicio = HORARIOS_FUNCIONAMENTO.segunda_sexta.inicio;
      const horaFim = HORARIOS_FUNCIONAMENTO.segunda_sexta.fim;

      // Se é o primeiro dia, começar a partir do horário sugerido (ajustado)
      if (dataAtual.toDateString() === dataSugerida.toDateString()) {
        const horaSugerida = dataSugerida.getHours();
        const minutoSugerido = dataSugerida.getMinutes();

        // Arredondar para próximo slot de 30 minutos
        if (minutoSugerido > 0 && minutoSugerido <= 30) {
          dataAtual.setMinutes(30, 0, 0);
        } else if (minutoSugerido > 30) {
          dataAtual.setHours(horaSugerida + 1, 0, 0, 0);
        }

        if (dataAtual.getHours() < horaInicio) {
          dataAtual.setHours(horaInicio, 0, 0, 0);
        }
      } else {
        dataAtual.setHours(horaInicio, 0, 0, 0);
      }

      // Verificar slots do dia
      while (
        dataAtual.getHours() < horaFim ||
        (dataAtual.getHours() === horaFim && dataAtual.getMinutes() === 0)
      ) {
        // Última consulta deve ter tempo suficiente (30 minutos)
        const ultimoHorario = new Date(dataAtual);
        ultimoHorario.setMinutes(ultimoHorario.getMinutes() + DURACAO_CONSULTA);

        if (ultimoHorario.getHours() <= horaFim) {
          const timestamp = dataAtual.getTime();

          // Não permitir horários no passado
          if (dataAtual >= agora && !horariosOcupados.has(timestamp)) {
            horariosDisponiveis.push({
              data: dataAtual.toISOString(),
              hora: `${String(dataAtual.getHours()).padStart(2, '0')}:${String(dataAtual.getMinutes()).padStart(2, '0')}`,
            });

            if (horariosDisponiveis.length >= limite) break;
          }
        }

        // Próximo slot (30 minutos)
        dataAtual.setMinutes(dataAtual.getMinutes() + DURACAO_CONSULTA);
      }

      // Próximo dia
      dataAtual.setDate(dataAtual.getDate() + 1);
      dataAtual.setHours(0, 0, 0, 0);
    }

    return {
      success: true,
      message: `${horariosDisponiveis.length} horário(s) disponível(is) encontrado(s)`,
      data: horariosDisponiveis,
    };
  } catch (error: any) {
    console.error('Erro em buscarHorariosDisponiveis:', error);
    return { success: false, error: formatErrorMessage(error) };
  }
}

// ========================================
// LISTAR MÉDICOS
// ========================================
async function listarMedicos(supabase: any, body: AgendamentoRequest): Promise<AgendamentoResponse> {
  const { clinic_id } = body;

  try {
    const { data: medicos, error } = await supabase
      .schema('clinica')
      .from('medicos')
      .select('id, nome, created_at')
      .eq('clinic_id', clinic_id)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao listar médicos:', error);
      return { success: false, error: 'Erro ao listar médicos' };
    }

    return {
      success: true,
      message: `${medicos?.length || 0} médico(s) encontrado(s)`,
      data: medicos || []
    };

  } catch (error: any) {
    console.error('Erro em listarMedicos:', error);
    return { success: false, error: formatErrorMessage(error) };
  }
}

// ========================================
// AGENDA SEMANAL
// ========================================
async function agendaSemanal(supabase: any, body: AgendamentoRequest): Promise<AgendamentoResponse> {
  const { clinic_id, agenda_semanal } = body;

  if (!agenda_semanal?.medico_id) {
    return { success: false, error: 'medico_id é obrigatório' };
  }

  try {
    const { medico_id, data } = agenda_semanal;

    // Verificar se médico pertence à clínica
    const { data: medico, error: medicoError } = await supabase
      .schema('clinica')
      .from('medicos')
      .select('id, nome')
      .eq('id', medico_id)
      .eq('clinic_id', clinic_id)
      .single();

    if (medicoError || !medico) {
      return { success: false, error: 'Médico não encontrado nesta clínica' };
    }

    // Data base (semana atual se não informada)
    const dataBase = data ? new Date(data) : new Date();
    
    // Calcular início da semana (segunda-feira)
    const inicioSemana = new Date(dataBase);
    const dia = inicioSemana.getDay();
    const diffParaSegunda = dia === 0 ? -6 : 1 - dia;
    inicioSemana.setDate(inicioSemana.getDate() + diffParaSegunda);
    inicioSemana.setHours(0, 0, 0, 0);

    // Calcular fim da semana (sexta-feira)
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(fimSemana.getDate() + 4);
    fimSemana.setHours(23, 59, 59, 999);

    // Buscar agendamentos da semana
    const { data: agendamentos, error } = await supabase
      .schema('clinica')
      .from('agendamentos')
      .select(`
        id,
        procedimento,
        data_agendamento,
        status,
        informacoes_adicionais,
        paciente_id
      `)
      .eq('medico_id', medico_id)
      .gte('data_agendamento', inicioSemana.toISOString())
      .lte('data_agendamento', fimSemana.toISOString())
      .neq('status', 'cancelado');

    if (error) {
      console.error('Erro ao buscar agenda semanal:', error);
      return { success: false, error: 'Erro ao buscar agenda semanal' };
    }

    // Buscar dados dos pacientes
    const pacienteIds = [...new Set((agendamentos || []).map((a: any) => a.paciente_id))];
    let pacientesMap = new Map();

    if (pacienteIds.length > 0) {
      const { data: pacientes } = await supabase
        .schema('clinica')
        .from('pacientes')
        .select('id, nome, telefone')
        .in('id', pacienteIds);

      pacientesMap = new Map((pacientes || []).map((p: any) => [p.id, p]));
    }

    // Gerar grade de horários (7h às 19h, slots de 30 minutos)
    const horariosDisponiveis = [];
    for (let hora = 7; hora < 19; hora++) {
      horariosDisponiveis.push(`${hora.toString().padStart(2, '0')}:00`);
      horariosDisponiveis.push(`${hora.toString().padStart(2, '0')}:30`);
    }

    // Gerar dias da semana
    const diasSemana = [];
    for (let i = 0; i < 5; i++) {
      const dia = new Date(inicioSemana);
      dia.setDate(dia.getDate() + i);
      diasSemana.push({
        data: dia.toISOString().split('T')[0],
        diaSemana: dia.toLocaleDateString('pt-BR', { weekday: 'long' }),
        diaMes: dia.getDate()
      });
    }

    // Organizar agendamentos por data e hora
    const agendaPorDiaHora: any = {};
    (agendamentos || []).forEach((agendamento: any) => {
      const dataAgendamento = new Date(agendamento.data_agendamento);
      const data = dataAgendamento.toISOString().split('T')[0];
      const hora = dataAgendamento.toTimeString().slice(0, 5);

      if (!agendaPorDiaHora[data]) {
        agendaPorDiaHora[data] = {};
      }

      agendaPorDiaHora[data][hora] = {
        ...agendamento,
        paciente: pacientesMap.get(agendamento.paciente_id) || null
      };
    });

    return {
      success: true,
      message: 'Agenda semanal carregada',
      data: {
        medico,
        diasSemana,
        horariosDisponiveis,
        agendamentos: agendaPorDiaHora,
        inicioSemana: inicioSemana.toISOString().split('T')[0],
        fimSemana: fimSemana.toISOString().split('T')[0]
      }
    };

  } catch (error: any) {
    console.error('Erro em agendaSemanal:', error);
    return { success: false, error: formatErrorMessage(error) };
  }
}

// ========================================
// LISTAR PACIENTES
// ========================================
async function listarPacientes(supabase: any, body: AgendamentoRequest): Promise<AgendamentoResponse> {
  const { clinic_id, paciente_busca } = body;

  try {
    let query = supabase
      .schema('clinica')
      .from('pacientes')
      .select('id, nome, telefone, data_nascimento, created_at')
      .eq('clinic_id', clinic_id)
      .order('nome', { ascending: true });

    // Aplicar filtro de busca se fornecido
    if (paciente_busca?.busca) {
      const busca = paciente_busca.busca;
      query = query.or(`nome.ilike.%${busca}%,telefone.ilike.%${busca}%`);
    }

    const { data: pacientes, error } = await query;

    if (error) {
      console.error('Erro ao listar pacientes:', error);
      return { success: false, error: 'Erro ao listar pacientes' };
    }

    return {
      success: true,
      message: `${pacientes?.length || 0} paciente(s) encontrado(s)`,
      data: pacientes || []
    };

  } catch (error: any) {
    console.error('Erro em listarPacientes:', error);
    return { success: false, error: formatErrorMessage(error) };
  }
}

// ========================================
// EDITAR PACIENTE
// ========================================
async function editarPaciente(supabase: any, body: AgendamentoRequest): Promise<AgendamentoResponse> {
  const { clinic_id, paciente_edicao } = body;

  if (!paciente_edicao) {
    return { success: false, error: 'Dados do paciente são obrigatórios' };
  }

  const { id, nome, telefone, data_nascimento } = paciente_edicao;

  if (!id || !nome || !telefone || !data_nascimento) {
    return { success: false, error: 'ID, nome, telefone e data de nascimento são obrigatórios' };
  }

  try {
    // Verificar se o paciente existe e pertence à clínica
    const { data: pacienteExistente, error: errorVerificar } = await supabase
      .schema('clinica')
      .from('pacientes')
      .select('id, telefone')
      .eq('id', id)
      .eq('clinic_id', clinic_id)
      .single();

    if (errorVerificar || !pacienteExistente) {
      return { success: false, error: 'Paciente não encontrado nesta clínica' };
    }

    // Verificar se o telefone já está sendo usado por outro paciente
    if (telefone !== pacienteExistente.telefone) {
      const { data: telefoneExistente } = await supabase
        .schema('clinica')
        .from('pacientes')
        .select('id')
        .eq('clinic_id', clinic_id)
        .eq('telefone', telefone)
        .neq('id', id)
        .single();

      if (telefoneExistente) {
        return { success: false, error: 'Este telefone já está sendo usado por outro paciente' };
      }
    }

    // Atualizar paciente
    const { data: pacienteAtualizado, error: errorAtualizar } = await supabase
      .schema('clinica')
      .from('pacientes')
      .update({
        nome,
        telefone,
        data_nascimento
      })
      .eq('id', id)
      .select()
      .single();

    if (errorAtualizar) {
      console.error('Erro ao atualizar paciente:', errorAtualizar);
      return { success: false, error: 'Erro ao atualizar paciente' };
    }

    return {
      success: true,
      message: 'Paciente atualizado com sucesso',
      data: pacienteAtualizado
    };

  } catch (error: any) {
    console.error('Erro em editarPaciente:', error);
    return { success: false, error: formatErrorMessage(error) };
  }
}
