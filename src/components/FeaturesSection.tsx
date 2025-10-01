import { Bot, Calendar, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const FeaturesSection = () => {
  const features = [
    {
      icon: Bot,
      title: "Atendimento Automatizado",
      description: "Responde automaticamente dúvidas frequentes dos pacientes como endereço, especialidades, médicos, planos e procedimentos da sua clínica"
    },
    {
      icon: Calendar,
      title: "Gestão de Agendamentos", 
      description: "Tenha o controle da Agenda médica! Nosso agente marca, remarca e cancela consultas automaticamente além do follow-up com os pacientes"
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Integrado",
      description: "Funciona diretamente no WhatsApp da sua clínica, onde os pacientes já estão acostumados a se comunicar"
    }
  ];

  return (
    <section id="recursos" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-foreground">
          Como Funciona
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="hover-lift bg-muted border-border shadow-card group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow group-hover:animate-glow">
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;