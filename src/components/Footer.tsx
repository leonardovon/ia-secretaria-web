import medicareInnovateLogo from '@/assets/logo_atendmed.jpg';

const Footer = () => {
  return (
      <footer id="contato" className="bg-card-foreground text-card py-2">
      <div className="container mx-auto px-4 text-center">        
        {/* Main Content */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-3">IA Secretária</h3>
          <p className="text-xl opacity-70 mb-4">
            Transformando o atendimento médico com inteligência artificial
          </p>
          <p className="text-lg opacity-75 mb-6">
            Powered by Atend Med Inteligência Artificial
          </p>                   
          <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-2">
              <img 
              src={medicareInnovateLogo} 
              alt="Medicare Innovate - IA Secretária" 
              className="w-full h-full object-contain"
              />
          </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="space-y-3 text-lg mb-8">
          <p>
            <a 
              href="mailto:leonardovon@gmail.com" 
              className="hover:opacity-70 transition-opacity">
              contato@ia-secretaria.com.br
            </a>
          </p>
          <p>
            <a href="tel:+5548984141354" 
              className="hover:opacity-70 transition-opacity">
              (48) 98414-1354
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