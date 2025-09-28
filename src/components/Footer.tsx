const Footer = () => {
  return (
    <footer id="contato" className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">IA Secretária</h3>
          <p className="text-lg opacity-90">
            Transformando o atendimento médico com inteligência artificial
          </p>
        </div>
        
        <div className="space-y-2 text-lg">
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
        
        <div className="mt-8 pt-8 border-t border-background/20">
          <p className="opacity-70">
            &copy; 2025 IA Secretária. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;