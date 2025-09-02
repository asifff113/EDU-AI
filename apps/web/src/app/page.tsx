import { Features } from '@/components/Features';
import { CTA } from '@/components/CTA';
import { Testimonials } from '@/components/Testimonials';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { StatsSection } from '@/components/StatsSection';
import { PricingSection } from '@/components/PricingSection';
import { AboutSection } from '@/components/AboutSection';
import { CoursesPreview } from '@/components/CoursesPreview';
import ContactFormSection from '@/components/ContactFormSection';

export default async function Home() {
  // Always show landing page - users can navigate to dashboard via menu
  return (
    <div className="font-sans min-h-screen">
      <main className="flex flex-col">
        <HeroSection />
        <StatsSection />
        <Features />
        <CoursesPreview />
        <AboutSection />
        <PricingSection />
        <Testimonials />
        <CTA />
        <ContactFormSection />
        <Footer />
      </main>
    </div>
  );
}
