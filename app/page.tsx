import { HeroSection } from '@/components/sections/hero-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { AgentsSection } from '@/components/sections/agents-section';
import { CTASection } from '@/components/sections/cta-section';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <AgentsSection />
      <CTASection />
    </>
  );
}