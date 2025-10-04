import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ArrowLeft, Calendar, Users, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Demo = () => {
  const navigate = useNavigate();

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
