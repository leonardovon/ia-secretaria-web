import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ArrowLeft, Calendar, Users, Bell, Settings, Phone, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Demo = () => {
  const navigate = useNavigate();
  const { logout, username } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleWhatsAppDemo = () => {
    window.open('https://wa.me/5548984141354?text=Olá! Gostaria de testar o atendimento da IA Secretária', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Sistema de Gestão</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Olá, <span className="font-semibold text-foreground">{username}</span>!
            </span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

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
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Experimente Nosso Agente de Atendimento
          </h1>
          <p className="text-xl text-center mb-12 text-muted-foreground">
            Teste todas as funcionalidades da IA Secretária em ambiente simulado
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
                                  <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <span><strong>Integração WhatsApp:</strong> Responde automaticamente as mensagens dos pacientes</span>
                    </li>
                    <li className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Agendamento de consultas:</strong> Marque consultas através do WhatsApp e veja aparecer no sistema em tempo real</span>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Gestão de Pacientes:</strong> Cadastro de novos pacientes atendidos pelo WhatsApp</span>
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
                    <li>• Dr. André Flores (Clínico Médica)</li>
                    <li>• Dr. Ricardo Margarida (Clínica Médica)</li>
                    <li>• Dra. Carolina Violeta (Pediatria)</li>
                    <li>• Dra. Juliana Rosa (Pediatria)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🕒 Horário de Funcionamento</h4>
                  <p className="text-sm text-muted-foreground">Segunda a Sexta: 7h às 19h</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">📍 Localização</h4>
                  <p className="text-sm text-muted-foreground">
                    Rua das Flores, 654<br />
                    Centro - Florianópolis/SC<br />
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">📞 Contatos</h4>
                  <p className="text-sm text-muted-foreground">
                    WhatsApp: (48) 99905-7812
                  </p>
                </div>

              </div>

              <div className="bg-muted/50 p-4 rounded-lg mt-6">
                <p className="text-sm text-muted-foreground">
                    <strong>💡 Dica:</strong> Ao conversar com a IA no WhatsApp, você pode solicitar agendamento de consultas para qualquer um dos médicos ou especialidades listadas acima.
                </p>
                <p className="text-sm text-muted-foreground">
                    Converse com a Rosa e tire dúvidas sobre convênios aceitos, especialidades, exames, etc.
                </p>
                <p className="text-sm text-muted-foreground">
                    Teste diferentes cenários!
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
              <p className="text-muted-foreground mb-6">
                Após testar o WhatsApp, acesse as funcionalidades administrativas da clínica:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Mensagens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Visualize todas as conversas do atendimento
                    </p>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/messages')}>
                      Acessar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Pacientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Gerencie o cadastro de pacientes
                    </p>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/pacientes')}>
                      Acessar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Agendamentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Visualize e gerencie os agendamentos
                    </p>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/agendamentos')}>
                      Acessar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Configurações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Configure os dados da clínica
                    </p>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/configuracoes')}>
                      Acessar
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  💡 <strong>Dica:</strong> Faça login para acessar todas as funcionalidades administrativas
                </p>
              </div>
            </CardContent>
        </Card>
        <pre> </pre>
        <Card className="mb-8 shadow-card">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Capacidades do Agente de Atendimento
                </CardTitle>
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
        </div>
      </div>
    </div>
  );
};
export default Demo;
