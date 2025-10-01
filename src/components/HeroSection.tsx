import { Button } from '@/components/ui/button';
import medicalHeroBg from '@/assets/medical-hero-bg.jpg';

const HeroSection = () => {
  const scrollToTest = () => {
    const element = document.getElementById('teste');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="relative py-32 text-center text-white overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.8)), url(${medicalHeroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-4">
           <p className="text-2xl md:text-5xl mb-8 text-blue-50 max-w-3xl mx-auto leading-relaxed">
              Modernize sua clínica médica com
           </p>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          IA Secretária
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-blue-50 max-w-3xl mx-auto leading-relaxed">
          Sistema Inteligente de Atendimento Médico
        </p>
       
      </div>
    </section>
  );
};

export default HeroSection;