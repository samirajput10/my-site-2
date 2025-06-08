
import { HeroSection } from '@/components/layout/HeroSection';
import { FeaturedCategories } from '@/components/layout/FeaturedCategories';
import { PersonalizedRecommendations } from '@/components/layout/PersonalizedRecommendations';
// Import other sections as they are built
// import { SmallBrandsShowcase } from '@/components/layout/SmallBrandsShowcase';
// import { SpecialOffer } from '@/components/layout/SpecialOffer';
// import { WhyChooseUs } from '@/components/layout/WhyChooseUs';
// import { NewsletterSignup } from '@/components/layout/NewsletterSignup';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCategories />
      <PersonalizedRecommendations />
      {/* 
        Placeholder for other sections based on user's HTML.
        These can be built out as separate components.
      */}
      {/* <SmallBrandsShowcase /> */}
      {/* <SpecialOffer /> */}
      {/* <WhyChooseUs /> */}
      {/* <NewsletterSignup /> */}
    </>
  );
}
