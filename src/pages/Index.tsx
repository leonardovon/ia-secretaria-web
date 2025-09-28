import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import BenefitsSection from '@/components/BenefitsSection';
import AdvancedFeaturesSection from '@/components/AdvancedFeaturesSection';
import TestSection from '@/components/TestSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <AdvancedFeaturesSection />
        <TestSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
