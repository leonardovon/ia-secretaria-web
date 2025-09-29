import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import medicareInnovateLogo from '@/assets/medicare-innovate-logo-final.png';

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
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16">
              <img 
                src={medicareInnovateLogo} 
                alt="Medicare Innovate - IA Secretária" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-3xl font-bold text-foreground"></div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8">
            <button 
              onClick={() => scrollToSection('recursos')}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-lg"
            >
              Recursos
            </button>
            <button 
              onClick={() => scrollToSection('beneficios')}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-lg"
            >
              Benefícios
            </button>
            <button 
              onClick={() => scrollToSection('teste')}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-lg"
            >
              Teste Grátis
            </button>
            <button 
              onClick={() => scrollToSection('contato')}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-lg"
            >
              Contato
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-foreground hover:bg-muted"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => scrollToSection('recursos')}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-left text-lg"
              >
                Recursos
              </button>
              <button 
                onClick={() => scrollToSection('beneficios')}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-left text-lg"
              >
                Benefícios
              </button>
              <button 
                onClick={() => scrollToSection('teste')}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-left text-lg"
              >
                Teste Grátis
              </button>
              <button 
                onClick={() => scrollToSection('contato')}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-left text-lg"
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