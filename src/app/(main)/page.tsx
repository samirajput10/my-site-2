
import { HeroSection } from '@/components/layout/HeroSection';
import { PersonalizedRecommendations } from '@/components/layout/PersonalizedRecommendations';
import { NewArrivals } from '@/components/layout/NewArrivals';
import { SaleBanner } from '@/components/layout/SaleBanner';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <NewArrivals />
      <SaleBanner />
      <PersonalizedRecommendations />
    </>
  );
}
