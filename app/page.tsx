import Hero from '@/components/Hero';
import OpeningHours from '@/components/OpeningHours';
import Services from '@/components/Services';
import MapSection from '@/components/MapSection';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-stone-50">
      <Hero />
      <OpeningHours />
      <Services />
      <MapSection />
    </main>
  );
}