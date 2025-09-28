import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import medicareInnovateLogo from '@/assets/medicare-innovate-logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-gradient-purple text-white shadow-elegant sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12">
              <img 
                src={medicareInnovateLogo} 
                alt="Medicare Innovate - IA Secretária" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-2xl font-bold text-white">IA Secretária</div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8">
            <button 
              onClick={() => scrollToSection('recursos')}
              className="text-white/90 hover:text-white transition-colors font-medium"
            >
              Recursos
            </button>
            <button 
              onClick={() => scrollToSection('beneficios')}
              className="text-white/90 hover:text-white transition-colors font-medium"
            >
              Benefícios
            </button>
            <button 
              onClick={() => scrollToSection('teste')}
              className="text-white/90 hover:text-white transition-colors font-medium"
            >
              Teste Grátis
            </button>
            <button 
              onClick={() => scrollToSection('contato')}
              className="text-white/90 hover:text-white transition-colors font-medium"
            >
              Contato
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-white/20 pt-4">
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => scrollToSection('recursos')}
                className="text-white/90 hover:text-white transition-colors font-medium text-left"
              >
                Recursos
              </button>
              <button 
                onClick={() => scrollToSection('beneficios')}
                className="text-white/90 hover:text-white transition-colors font-medium text-left"
              >
                Benefícios
              </button>
              <button 
                onClick={() => scrollToSection('teste')}
                className="text-white/90 hover:text-white transition-colors font-medium text-left"
              >
                Teste Grátis
              </button>
              <button 
                onClick={() => scrollToSection('contato')}
                className="text-white/90 hover:text-white transition-colors font-medium text-left"
              >
                Contato
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;