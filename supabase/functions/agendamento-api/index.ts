import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  validateTelefone,
  validateDataNascimento,
  validateDataAgendamento,
  sanitizeTelefone,
  formatErrorMessage,
  convertBrazilianDateToISO
} from '../_shared/validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Rotas da API
    if (path === 'agendamentos' && req.method === 'POST') {
      return await criarAgendamento(req, supabase);
    }

    return new Response(
      JSON.stringify({ error: 'Rota não encontrada' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na API:', error);
    return new Response(
      JSON.stringify({ error: formatErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function criarAgendamento(req: Request, supabase: any) {
  try {
    const body = await req.json();
    const { paciente, medico, data_agendamento, procedimento, informacoes_adicionais } = body;

    // Validações
    if (!paciente?.nome || !paciente?.telefone || !paciente?.data_nascimento) {
      return new Response(
        JSON.stringify({ error: 'Dados do paciente incompletos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar telefone
    const telefoneSanitized = sanitizeTelefone(paciente.telefone);
    const telefoneValidation = validateTelefone(telefoneSanitized);
    if (!telefoneValidation.valid) {
      return new Response(
        JSON.stringify({ error: telefoneValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar e converter data de nascimento
    const dataNascimentoValidation = validateDataNascimento(paciente.data_nascimento);
    if (!dataNascimentoValidation.valid) {
      return new Response(
        JSON.stringify({ error: dataNascimentoValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Converter data de nascimento para ISO
    const dataNascimentoISO = convertBrazilianDateToISO(paciente.data_nascimento);

    // Validar data de agendamento
    if (data_agendamento) {
      const dataAgendamentoValidation = validateDataAgendamento(data_agendamento);
      if (!dataAgendamentoValidation.valid) {
        return new Response(
          JSON.stringify({ error: dataAgendamentoValidation.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Buscar ou criar paciente
    let pacienteId: string;

    const { data: pacienteExistente } = await supabase
      .from('pacientes')
      .select('id')
      .eq('telefone', telefoneSanitized)
      .maybeSingle();

    if (pacienteExistente) {
      pacienteId = pacienteExistente.id;
      console.log('Paciente encontrado:', pacienteId);
    } else {
      // Criar novo paciente com data de nascimento já convertida
      const { data: novoPaciente, error: insertError } = await supabase
        .from('pacientes')
        .insert({
          nome: paciente.nome,
          telefone: telefoneSanitized,
          data_nascimento: dataNascimentoISO
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Erro ao criar paciente:', insertError);
        throw new Error(`Erro ao criar paciente: ${insertError.message || 'Data de nascimento inválida. Use formato DD/MM/YYYY ou YYYY-MM-DD'}`);
      }

      pacienteId = novoPaciente.id;
      console.log('Paciente criado:', pacienteId);
    }

    // Buscar ou criar médico (se fornecido)
    let medicoId: string | null = null;

    if (medico?.nome) {
      const { data: medicoExistente } = await supabase
        .from('medicos')
        .select('id')
        .eq('nome', medico.nome)
        .maybeSingle();

      if (medicoExistente) {
        medicoId = medicoExistente.id;
      } else {
        const { data: novoMedico, error: medicoError } = await supabase
          .from('medicos')
          .insert({ nome: medico.nome })
          .select('id')
          .single();

        if (medicoError) {
          console.error('Erro ao criar médico:', medicoError);
        } else {
          medicoId = novoMedico.id;
        }
      }
    }

    // Criar agendamento
    const agendamentoData: any = {
      paciente_id: pacienteId,
      status: 'pendente'
    };

    if (medicoId) agendamentoData.medico_id = medicoId;
    if (data_agendamento) agendamentoData.data_agendamento = data_agendamento;
    if (procedimento) agendamentoData.procedimento = procedimento;
    if (informacoes_adicionais) agendamentoData.informacoes_adicionais = informacoes_adicionais;

    const { data: agendamento, error: agendamentoError } = await supabase
      .from('agendamentos')
      .insert(agendamentoData)
      .select()
      .single();

    if (agendamentoError) {
      console.error('Erro ao criar agendamento:', agendamentoError);
      throw new Error('Erro ao criar agendamento');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: agendamento 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return new Response(
      JSON.stringify({ error: formatErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
