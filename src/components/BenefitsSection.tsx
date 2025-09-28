import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, TrendingDown, Heart, DollarSign } from 'lucide-react';

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Users,
      title: "Redução da Carga de Trabalho",
      description: "Suas atendentes podem focar em atividades mais estratégicas enquanto o agente cuida do atendimento básico"
    },
    {
      icon: Clock,
      title: "Atendimento 24/7",
      description: "Pacientes podem agendar consultas e tirar dúvidas a qualquer hora, mesmo fora do horário comercial"
    },
    {
      icon: TrendingDown,
      title: "Redução de No-shows",
      description: "Confirmações automáticas e lembretes reduzem significativamente o número de faltas em consultas"
    },
    {
      icon: Heart,
      title: "Melhora na Experiência do Paciente",
      description: "Respostas rápidas e precisas melhoram a satisfação e fidelização dos pacientes"
    },
    {
      icon: DollarSign,
      title: "Economia de Custos",
      description: "Reduz a necessidade de equipe adicional para atendimento, otimizando custos operacionais"
    }
  ];

  return (
    <section id="beneficios" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-foreground">
          Benefícios para Sua Clínica
        </h2>
        <div className="max-w-4xl mx-auto space-y-4">
          {benefits.map((benefit, index) => (
            <Card 
              key={index}
              className="bg-card border-l-4 border-l-primary shadow-card hover-lift group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:animate-glow">
                    <benefit.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-foreground">
                      {benefit.title}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;