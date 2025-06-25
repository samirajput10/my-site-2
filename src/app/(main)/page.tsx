
import { HeroSection } from '@/components/layout/HeroSection';
import { FeaturedCategories } from '@/components/layout/FeaturedCategories';
import { PersonalizedRecommendations } from '@/components/layout/PersonalizedRecommendations';
import { NewArrivals } from '@/components/layout/NewArrivals';
import { StyleAssistantHero } from '@/components/layout/StyleAssistantHero';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCategories />
      <NewArrivals />
      <StyleAssistantHero />
      <PersonalizedRecommendations />
    </>
  );
}
