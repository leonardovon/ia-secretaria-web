import medicareInnovateLogo from '@/assets/medicare-innovate-logo-new.png';

const Footer = () => {
  return (
    <footer id="contato" className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4 text-center">
        {/* Logo Section */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6">
            <img 
              src={medicareInnovateLogo} 
              alt="Medicare Innovate" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-3">IA Secretária</h3>
          <p className="text-xl opacity-90 mb-4">
            Transformando o atendimento médico com inteligência artificial
          </p>
          <p className="text-lg opacity-75 mb-6">
            Powered by Medicare Innovate
          </p>
        </div>
        
        {/* Contact Information */}
        <div className="space-y-3 text-lg mb-8">
          <p>
            <a 
              href="mailto:contato@ia-secretaria.com.br" 
              className="hover:opacity-80 transition-opacity"
            >
              contato@ia-secretaria.com.br
            </a>
          </p>
          <p>
            <a 
              href="tel:+5511999999999" 
              className="hover:opacity-80 transition-opacity"
            >
              (11) 99999-9999
            </a>
          </p>
        </div>
        
        {/* Copyright */}
        <div className="pt-8 border-t border-background/20">
          <p className="opacity-70">
            &copy; 2025 IA Secretária. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;