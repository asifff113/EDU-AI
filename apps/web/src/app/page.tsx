import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { GlobeCanvas } from '@/components/GlobeCanvas';
import { Features } from '@/components/Features';
import { CTA } from '@/components/CTA';
import { Testimonials } from '@/components/Testimonials';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { StatsSection } from '@/components/StatsSection';
import { PricingSection } from '@/components/PricingSection';
import { AboutSection } from '@/components/AboutSection';
import { CoursesPreview } from '@/components/CoursesPreview';

export default async function Home() {
  // Check if user is authenticated
  const cookieStore = await cookies();
  const token = cookieStore.get('eduai_token')?.value;

  // If authenticated, redirect to dashboard
  if (token) {
    redirect('/dashboard');
  }

  // Show landing page for unauthenticated users
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
        <Footer />
      </main>
    </div>
  );
}
