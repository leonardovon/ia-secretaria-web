import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Hospital } from 'lucide-react';
import medicareInnovateLogo from '@/assets/medicare-innovate-logo.png';

const TestSection = () => {
  const handleWhatsAppTest = () => {
    // This will be updated with the actual WhatsApp link when the demo clinic is ready
    window.open('https://wa.me/5511999999999?text=Olá! Gostaria de testar o atendimento da IA Secretária', '_blank');
  };

  const handleDemoRequest = () => {
    window.open('mailto:contato@ia-secretaria.com.br?subject=Solicitação de Demonstração Personalizada', '_blank');
  };

  return (
    <section id="teste" className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Background Logo - positioned differently for variety */}
      <div 
        className="absolute top-10 right-10 opacity-3 w-64 h-64 bg-no-repeat bg-contain"
        style={{
          backgroundImage: `url(${medicareInnovateLogo})`,
        }}
      />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
          Teste Nossa Solução
        </h2>
        <p className="text-xl mb-12 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Experimente como funciona o atendimento automatizado em uma clínica de exemplo
        </p>
        
        <Card className="max-w-lg mx-auto mb-12 shadow-card hover-lift bg-card/95 backdrop-blur-sm">
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
              onClick={handleWhatsAppTest}
              className="whatsapp-button text-white px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 transition-all duration-300"
            >
              <MessageSquare className="w-5 h-5" />
              Testar no WhatsApp
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              * Ambiente de demonstração - todas as funcionalidades ativas
            </p>
          </CardContent>
        </Card>

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