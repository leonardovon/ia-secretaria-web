import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ArrowLeft, Calendar, Users, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Demo = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleWhatsAppDemo = () => {
    window.open('https://wa.me/5548984141354?text=Olá! Gostaria de testar o atendimento da IA Secretária', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Experimente Nossa Clínica Demo
          </h1>
          <p className="text-xl text-center mb-12 text-muted-foreground">
            Teste todas as funcionalidades da IA Secretária em ambiente real
          </p>

          <Card className="mb-8 shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                Como Funciona a Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Nossa clínica de demonstração está totalmente funcional e permite que você teste:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Agendamento Automático:</strong> Marque consultas através do WhatsApp e veja aparecer no sistema em tempo real</span>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Gestão de Pacientes:</strong> Cadastro automático de novos pacientes e histórico completo</span>
                </li>
                <li className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Notificações Inteligentes:</strong> Lembretes automáticos e confirmações de consulta</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8 shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">🤖 Capacidades do Agente de Atendimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Nossa IA Secretária é equipada com tecnologia de ponta para oferecer um atendimento completo e inteligente:
              </p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-2">📝 Processamento Multimodal</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Mensagens de Texto:</strong> Compreensão natural de linguagem em português</li>
                    <li>• <strong>Áudios:</strong> Transcrição automática usando tecnologia OpenAI Whisper</li>
                    <li>• <strong>Imagens:</strong> Análise inteligente de documentos e fotos enviadas</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-2">🧠 Memória e Contexto</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Histórico Completo:</strong> Armazena todo o histórico de conversas de cada paciente</li>
                    <li>• <strong>Contexto Persistente:</strong> Lembra de conversas anteriores e informações importantes</li>
                    <li>• <strong>Personalização:</strong> Adapta respostas baseadas no histórico do paciente</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-2">📚 Sistema RAG (Busca em Documentos)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Base de Conhecimento:</strong> Acessa informações da clínica em tempo real</li>
                    <li>• <strong>Respostas Precisas:</strong> Busca dados específicos sobre médicos, horários e especialidades</li>
                    <li>• <strong>Documentos Suportados:</strong> PDF, Excel, Word e Google Docs</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-2">⚡ Automações Inteligentes</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Cadastro Automático:</strong> Registra novos pacientes automaticamente</li>
                    <li>• <strong>Fila de Mensagens:</strong> Gerencia múltiplas conversas simultaneamente</li>
                    <li>• <strong>Roteamento Inteligente:</strong> Direciona mensagens para os fluxos corretos</li>
                    <li>• <strong>Sistema de Pausa:</strong> Permite transferência para atendimento humano quando necessário</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-2">🎯 Funcionalidades Principais</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Agendamento:</strong> Marca consultas considerando disponibilidade de médicos</li>
                    <li>• <strong>Reagendamento:</strong> Altera horários de forma automática</li>
                    <li>• <strong>Cancelamento:</strong> Processa cancelamentos e libera horários</li>
                    <li>• <strong>Confirmações:</strong> Envia lembretes e confirma presença</li>
                    <li>• <strong>Informações:</strong> Responde dúvidas sobre localização, horários e especialidades</li>
                  </ul>
                </div>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg mt-6">
                <p className="text-sm">
                  <strong>🚀 Tecnologia:</strong> Powered by OpenAI GPT-4, Supabase Vector Store, e n8n Workflow Automation
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">Sobre a Clínica Girassol (Demo)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Esta é a clínica fictícia que você poderá interagir através do WhatsApp. Utilize as informações abaixo para testar os agendamentos:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div>
                  <h4 className="font-semibold mb-2">📋 Especialidades</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Clínica Médica</li>
                    <li>• Pediatria</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">👨‍⚕️ Médicos Disponíveis</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Dr. André Moreira (Clínica Médica)</li>
                    <li>• Dra. Carolina Santos (Pediatria)</li>
                    <li>• Dr. Ricardo Lima (Clínica Médica)</li>
                    <li>• Dra. Juliana Oliveira (Pediatria)</li>
                    <li>• Dr. Fernando Silva (Clínica Médica)</li>
                    <li>• Dra. Mariana Rodrigues (Pediatria)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🕒 Horário de Funcionamento</h4>
                  <p className="text-sm text-muted-foreground">Segunda a Sexta: 7h às 19h</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">📍 Localização</h4>
                  <p className="text-sm text-muted-foreground">
                    Rua das Flores, 456<br />
                    Centro - São Paulo/SP<br />
                    CEP: 01234-567
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">📞 Contatos</h4>
                  <p className="text-sm text-muted-foreground">
                    Tel: (11) 3456-7890<br />
                    WhatsApp: (11) 99988-7766
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">✉️ E-mail</h4>
                  <p className="text-sm text-muted-foreground">
                    contato@clinicagirassol.com.br
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg mt-6">
                <p className="text-sm text-muted-foreground">
                  <strong>💡 Dica:</strong> Ao conversar com a IA no WhatsApp, você pode solicitar agendamentos mencionando qualquer um dos médicos ou especialidades listadas acima. Teste diferentes cenários!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 shadow-card bg-card">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-semibold mb-4 text-foreground">
                Pronto para Testar?
              </h3>
              <p className="text-muted-foreground mb-6">
                Clique no botão abaixo e inicie uma conversa com nossa IA Secretária
              </p>
              <Button 
                onClick={handleWhatsAppDemo}
                className="whatsapp-button text-white px-8 py-4 text-lg rounded-full font-semibold inline-flex items-center gap-2 transition-all duration-300"
              >
                <MessageSquare className="w-5 h-5" />
                Iniciar Teste no WhatsApp
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                * Ambiente 100% funcional com dados de demonstração
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Acesso ao Painel Administrativo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Após testar o WhatsApp, acesse o painel da clínica para ver:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-6">
                <li>• Agendamentos criados pela IA</li>
                <li>• Histórico de conversas</li>
                <li>• Dados dos pacientes cadastrados</li>
                <li>• Relatórios e estatísticas</li>
              </ul>
              <Button 
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full"
              >
                Acessar Painel Demo
              </Button>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Credenciais de demonstração disponíveis na página de login
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Demo;
