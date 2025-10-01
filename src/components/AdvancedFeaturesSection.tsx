import { Card, CardContent } from '@/components/ui/card';
import { Target, BookOpen, Brain, UserCheck } from 'lucide-react';

const AdvancedFeaturesSection = () => {
  const features = [
    {
      icon: Target,
      title: "Personalização Total",
      description: "Prompt personalizado para cada clínica, adaptando-se perfeitamente ao seu atendimento"
    },
    {
      icon: BookOpen,
      title: "Sistema RAG",
      description: "Busca inteligente em arquivos e documentos para responder com precisão baseada na sua base de conhecimento"
    },
    {
      icon: Brain,
      title: "Treinamento Automático",
      description: "O sistema aprende continuamente através de mensagens codificadas, melhorando constantemente e sem a necessidade de intervenções da nossa equipe"
    },
    {
      icon: UserCheck,
      title: "Mantenha o controle",
      description: "Identifica quando é necessário transferir o atendimento para um humano, garantindo qualidade"
    }
  ];

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-foreground">
          Recursos Avançados
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-gradient-primary text-primary-foreground hover-lift shadow-glow group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-primary-foreground/90 leading-relaxed text-sm">
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

export default AdvancedFeaturesSection;