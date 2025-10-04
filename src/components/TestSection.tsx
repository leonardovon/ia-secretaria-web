import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Hospital } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TestSection = () => {
  const navigate = useNavigate();

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
        <Card className="max-w-lg mx-auto mb-12 shadow-card hover-lift bg-card">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Hospital className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                Clínica Demo
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Teste todas as funcionalidades em nossa clínica fictícia
            </p>
            <Button 
              onClick={() => navigate('/demo')}
              className="whatsapp-button text-white px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 transition-all duration-300"
            >
              Conhecer Agora
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              * Ambiente de demonstração - todas as funcionalidades ativas
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default TestSection;