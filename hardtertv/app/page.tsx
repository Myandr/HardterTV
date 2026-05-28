import Hero from "@/components/ui/hero";
import WelcomeSection from "@/components/ui/welcome-section";
import LocationSection from "@/components/ui/location-section";
import TermineSection from "@/components/ui/termine-section";
import VorstandSection from "@/components/ui/vorstand-section";
import NewsSection from "@/components/ui/news-section";
import InstagramCta from "@/components/ui/instagram-cta";
import KontaktSection from "@/components/ui/kontakt-section";

export default function Home() {
  return (
    <main>
      <Hero />
      <WelcomeSection />
      <LocationSection />
      <TermineSection />
      <VorstandSection />
      <NewsSection />
      <InstagramCta />
      <KontaktSection />
    </main>
  );
}
