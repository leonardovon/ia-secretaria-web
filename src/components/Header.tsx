import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

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
    <header className="bg-gradient-primary text-primary-foreground shadow-elegant sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12">
              <svg width="48" height="48" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                {/* Círculo externo com padrão digital */}
                <circle cx="25" cy="25" r="23" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="4 2" opacity="0.8"/>
                
                {/* Órbitas do átomo */}
                <ellipse cx="25" cy="25" rx="18" ry="8" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(30 25 25)" opacity="0.7"/>
                <ellipse cx="25" cy="25" rx="18" ry="8" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(-30 25 25)" opacity="0.7"/>
                <ellipse cx="25" cy="25" rx="18" ry="8" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(90 25 25)" opacity="0.7"/>
                
                {/* Olho central */}
                <circle cx="25" cy="25" r="10" fill="url(#eyeGrad)"/>
                <circle cx="25" cy="25" r="5" fill="white" opacity="0.2"/>
                <circle cx="27" cy="23" r="2" fill="white" opacity="0.9"/>
                
                {/* Pontos de conexão neural */}
                <circle cx="15" cy="15" r="1" fill="currentColor" opacity="0.6"/>
                <circle cx="35" cy="15" r="1" fill="currentColor" opacity="0.6"/>
                <circle cx="15" cy="35" r="1" fill="currentColor" opacity="0.6"/>
                <circle cx="35" cy="35" r="1" fill="currentColor" opacity="0.6"/>
                
                <defs>
                  <radialGradient id="eyeGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style={{stopColor: 'white', stopOpacity: 0.9}} />
                    <stop offset="70%" style={{stopColor: 'currentColor', stopOpacity: 0.8}} />
                    <stop offset="100%" style={{stopColor: 'currentColor', stopOpacity: 1}} />
                  </radialGradient>
                </defs>
              </svg>
            </div>
            <div className="text-2xl font-bold">IA Secretária</div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8">
            <button 
              onClick={() => scrollToSection('recursos')}
              className="text-primary-foreground hover:opacity-80 transition-opacity font-medium"
            >
              Recursos
            </button>
            <button 
              onClick={() => scrollToSection('beneficios')}
              className="text-primary-foreground hover:opacity-80 transition-opacity font-medium"
            >
              Benefícios
            </button>
            <button 
              onClick={() => scrollToSection('teste')}
              className="text-primary-foreground hover:opacity-80 transition-opacity font-medium"
            >
              Teste Grátis
            </button>
            <button 
              onClick={() => scrollToSection('contato')}
              className="text-primary-foreground hover:opacity-80 transition-opacity font-medium"
            >
              Contato
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-primary-foreground hover:bg-white/10"
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
                className="text-primary-foreground hover:opacity-80 transition-opacity font-medium text-left"
              >
                Recursos
              </button>
              <button 
                onClick={() => scrollToSection('beneficios')}
                className="text-primary-foreground hover:opacity-80 transition-opacity font-medium text-left"
              >
                Benefícios
              </button>
              <button 
                onClick={() => scrollToSection('teste')}
                className="text-primary-foreground hover:opacity-80 transition-opacity font-medium text-left"
              >
                Teste Grátis
              </button>
              <button 
                onClick={() => scrollToSection('contato')}
                className="text-primary-foreground hover:opacity-80 transition-opacity font-medium text-left"
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