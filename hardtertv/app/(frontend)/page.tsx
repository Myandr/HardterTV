import { getPayload } from "payload";
import config from "@payload-config";
import Hero from "@/components/ui/hero";
import WelcomeSection from "@/components/ui/welcome-section";
import LocationSection from "@/components/ui/location-section";
import TermineSection from "@/components/ui/termine-section";
import VorstandSection from "@/components/ui/vorstand-section";
// import NewsSection from "@/components/ui/news-section";
import InstagramCta from "@/components/ui/instagram-cta";
import KontaktSection from "@/components/ui/kontakt-section";

export const revalidate = 3600;

async function getVorstand() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "board-members",
    where: { featured: { equals: true } },
    depth: 1,
    limit: 3,
    sort: "reihenfolge",
  });
  return docs.map((d) => ({
    name: d.name,
    titel: d.titel,
    email: d.emails?.[0]?.email ?? "",
    telefon: d.telefon ?? "",
    bild: typeof d.foto === "object" && d.foto ? d.foto.url ?? null : null,
  }));
}

export default async function Home() {
  const vorstand = await getVorstand();
  return (
    <main>
      <Hero />
      <WelcomeSection />
      <LocationSection />
      <TermineSection />
      <VorstandSection vorstand={vorstand} />
      {/* <NewsSection /> */}
      <InstagramCta />
      <KontaktSection />
    </main>
  );
}
