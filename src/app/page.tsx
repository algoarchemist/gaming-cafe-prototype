import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import StationShowcase from '@/components/StationShowcase';
import HowItWorks from '@/components/HowItWorks';
import SnacksMenu from '@/components/SnacksMenu';
import LocationHours from '@/components/LocationHours';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <StationShowcase />
      <HowItWorks />
      <SnacksMenu />
      <LocationHours />
      <Footer />
    </main>
  );
}
