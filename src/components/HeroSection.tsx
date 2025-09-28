import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const scrollToTest = () => {
    const element = document.getElementById('teste');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-hero py-20 text-center">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
          Automatize o Atendimento<br />da Sua Clínica
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Agente virtual inteligente que atende pacientes 24/7 no WhatsApp, agenda consultas e reduz a sobrecarga da sua equipe
        </p>
        <Button 
          onClick={scrollToTest}
          className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-full shadow-elegant hover-lift transition-all duration-300 transform hover:scale-105"
        >
          Testar Gratuitamente
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;