import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Hospital, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TestSection = () => {
  const navigate = useNavigate();

  const handleWhatsAppTest = () => {
    window.open('https://wa.me/5548984141354?text=Olá! Gostaria de informações sobre a clínica', '_blank');
  };

  const handleClinicAccess = () => {
    navigate('/login');
  };

  const handleDemoRequest = () => {
    window.open('https://wa.me/5548984141354?text=Olá! Gostaria de testar o atendimento da IA Secretária', '_blank');
  };

  return (
    <section id="teste" className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
          Teste agora mesmo a nossa Solução
        </h2>
        <p className="text-xl mb-2 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Experimente como funciona o atendimento automatizado em uma clínica Demo.
        </p>
        <p className="text-muted-foreground mb-2 text-xl">
            Converse com o nosso agente inteligente e teste as funcionalidades
        </p>
        <p className="text-muted-foreground mb-6 text-xl">
            Acompanhe o atendimento no back-end da clínica, mensagens trocadas, agendamentos, notificações, etc
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          <Card className="shadow-card hover-lift bg-card">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Hospital className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">
                  Clínica Girassol
                </h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Acesse a área administrativa da clínica demo
              </p>
              <Button 
                onClick={handleClinicAccess}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 transition-all duration-300 w-full"
              >
                <LogIn className="w-5 h-5" />
                Acessar Sistema
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Usuário: <strong>von</strong> | Senha: <strong>von123</strong>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover-lift bg-card">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">
                  Teste via WhatsApp
                </h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Converse com o agente inteligente da clínica
              </p>
              <Button 
                onClick={handleWhatsAppTest}
                className="whatsapp-button text-white px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 transition-all duration-300 w-full"
              >
                <MessageSquare className="w-5 h-5" />
                Testar no WhatsApp
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                * Ambiente de demonstração completo
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-4 text-foreground">
            Pronto para Implementar?
          </h3>
          <Button 
            onClick={handleDemoRequest}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-full shadow-elegant hover-lift transition-all duration-300"
          >
            Solicitar Demonstração Personalizada
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TestSection;