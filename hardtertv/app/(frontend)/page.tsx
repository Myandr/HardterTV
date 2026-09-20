import { getPayload } from "payload";
import config from "@payload-config";
import Hero from "@/components/ui/hero";
import WelcomeSection from "@/components/ui/welcome-section";
import LocationSection from "@/components/ui/location-section";
import TermineSection from "@/components/ui/termine-section";
import VorstandSection from "@/components/ui/vorstand-section";
import NewsSection from "@/components/ui/news-section";
import InstagramCta from "@/components/ui/instagram-cta";
import KontaktSection from "@/components/ui/kontakt-section";
import { formatTerminDatum, startOfTodayIso } from "@/lib/events";
import { formatNewsDatum } from "@/lib/news";
import { toBild } from "@/lib/media";

export const revalidate = 3600;

async function getHero() {
  const payload = await getPayload({ config });
  const data = await payload.findGlobal({ slug: "hero", depth: 1 });
  return {
    headline: data.headline ?? "",
    subtext: data.subtext ?? "",
    ctaLabel: data.ctaLabel ?? "",
    bild: toBild(data.bild),
    partnerLogos: (data.partnerLogos ?? []).flatMap((row, i) => {
      const bild = toBild(row.logo);
      if (!bild) return [];
      return [{ id: row.id ?? String(i), url: bild.url, alt: row.alt || bild.alt }];
    }),
  };
}

async function getWelcome() {
  const payload = await getPayload({ config });
  const data = await payload.findGlobal({ slug: "welcome-section", depth: 1 });
  return {
    eyebrow: data.eyebrow ?? "",
    headline: data.headline ?? "",
    intro: data.intro ?? "",
    stats: (data.stats ?? []).map((row, i) => ({
      id: row.id ?? String(i),
      icon: row.icon,
      wert: row.wert,
      label: row.label,
    })),
    bild: toBild(data.bild),
    bildBadge: data.bildBadge ?? "",
    absaetze: (data.text ?? "")
      .split(/\n\s*\n/)
      .map((absatz) => absatz.trim())
      .filter((absatz) => absatz.length > 0),
    signaturName: data.signaturName ?? "",
    signaturRolle: data.signaturRolle ?? "",
    ctaLabel: data.ctaLabel ?? "",
    sekundaerLabel: data.sekundaerLabel ?? "",
  };
}

async function getStandorte() {
  const payload = await getPayload({ config });
  const data = await payload.findGlobal({ slug: "location-section", depth: 1 });
  return {
    eyebrow: data.eyebrow ?? "",
    headlineTeil1: data.headlineTeil1 ?? "",
    headlineTeil2: data.headlineTeil2 ?? "",
    intro: data.intro ?? "",
    ctaLabel: data.ctaLabel ?? "",
    karten: (data.karten ?? []).map((row, i) => ({
      id: row.id ?? String(i),
      titel: row.titel,
      untertitel: row.untertitel ?? "",
      bild: toBild(row.bild),
      href: row.href,
    })),
  };
}

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

async function getTermine() {
  const payload = await getPayload({ config });
  const heute = startOfTodayIso();
  const { docs } = await payload.find({
    collection: "events",
    where: {
      or: [{ datum: { greater_than_equal: heute } }, { datumEnde: { greater_than_equal: heute } }],
    },
    sort: "datum",
    limit: 3,
    depth: 0,
  });
  return docs.map((d) => ({
    ...formatTerminDatum(d.datum, d.datumEnde),
    veranstaltung: d.titel,
    uhrzeit: d.uhrzeit ?? "",
    ort: d.ort ?? "",
    kategorie: d.kategorie,
  }));
}

async function getNews() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "news",
    depth: 1,
    limit: 5,
    sort: "-datum",
  });
  return docs.map((d) => ({
    datum: formatNewsDatum(d.datum),
    titel: d.titel,
    excerpt: d.excerpt,
    bild: typeof d.bild === "object" && d.bild ? d.bild.url ?? null : null,
    kategorie: d.kategorie,
  }));
}

export default async function Home() {
  const [hero, welcome, standorte, vorstand, termine, news] = await Promise.all([
    getHero(),
    getWelcome(),
    getStandorte(),
    getVorstand(),
    getTermine(),
    getNews(),
  ]);
  return (
    <main>
      <Hero {...hero} />
      <WelcomeSection {...welcome} />
      <LocationSection {...standorte} />
      <TermineSection termine={termine} />
      <VorstandSection vorstand={vorstand} />
      <NewsSection news={news} />
      <InstagramCta />
      <KontaktSection />
    </main>
  );
}
