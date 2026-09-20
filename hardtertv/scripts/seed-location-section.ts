import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

import config from "../payload.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const MAPS_URL = "https://maps.google.com/?q=Hardter+TV+Gahlener+Str.+204+46282+Dorsten";

const KARTEN = [
  {
    titel: "6 Ascheplätze",
    untertitel: "Zwei mit Flutlichtanlage",
    pfad: "images/hero-new.png",
    href: MAPS_URL,
  },
  {
    titel: "Clubheim Hardt",
    untertitel: "Vermietung nur an Mitglieder",
    pfad: "images/image copy 2.png",
    href: MAPS_URL,
  },
  {
    titel: "Flutlichtanlage",
    untertitel: "Auf 2 Plätzen",
    pfad: "images/image.png",
    href: MAPS_URL,
  },
  {
    titel: "Kletter- und Spielgerüst",
    untertitel: "Für die jüngsten Mitglieder",
    pfad: "images/image copy 3.png",
    href: MAPS_URL,
  },
  {
    titel: "Eisstockbahn",
    untertitel: "Vermietung nur an Mitglieder",
    pfad: "images/änderungen/eis.png",
    href: "/eisstock",
  },
];

async function run() {
  const payload = await getPayload({ config });

  const existing = await payload.findGlobal({ slug: "location-section", depth: 0 });
  if (existing?.eyebrow) {
    console.log("skip (already seeded): location-section");
    process.exit(0);
  }

  const bildIds: number[] = [];
  for (const karte of KARTEN) {
    const media = await payload.create({
      collection: "media",
      data: { alt: karte.titel },
      filePath: path.resolve(dirname, "..", "public", karte.pfad),
      context: { disableRevalidate: true },
    });
    console.log(`uploaded: ${karte.pfad}`);
    bildIds.push(media.id);
  }

  await payload.updateGlobal({
    slug: "location-section",
    data: {
      eyebrow: "Standorte",
      headlineTeil1: "Unsere",
      headlineTeil2: "Tennisanlage",
      intro:
        "Erleben Sie Tennis vom Feinsten mit unserer erstklassig gepflegten Anlage und dem Überblick aller 6 Plätze von unserer überdachten Terrasse. Egal, ob Anfänger oder erfahrener Profi, wir haben den perfekten Platz für Ihr Spiel.",
      ctaLabel: "Mitgliedschaft",
      karten: KARTEN.map((karte, i) => ({
        titel: karte.titel,
        untertitel: karte.untertitel,
        bild: bildIds[i],
        href: karte.href,
      })),
    },
    context: { disableRevalidate: true },
  });

  console.log("seeded: location-section");
  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
