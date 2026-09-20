import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

import config from "../payload.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const HEADLINE = "Herzlich Willkommen beim Hardter TV";
const SUBTEXT =
  "Erlebe die Freude am Tennis und die Kraft der Gemeinschaft. Verbinde dich mit Gleichgesinnten und wachse gemeinsam im Sport.";
const CTA_LABEL = "Mitglied werden";

const HERO_BILD = { pfad: "images/hero-new.png", alt: "Tennisplatz Hardter Tennisverein" };

const LOGOS = [5, 6, 7, 8, 9, 10, 11].map((i) => ({
  pfad: `images/image copy ${i}.png`,
  alt: `Partner Logo ${i}`,
}));

async function run() {
  const payload = await getPayload({ config });

  const existing = await payload.findGlobal({ slug: "hero", depth: 0 });
  if (existing?.headline) {
    console.log("skip (already seeded): hero");
    process.exit(0);
  }

  const upload = async ({ pfad, alt }: { pfad: string; alt: string }) => {
    const media = await payload.create({
      collection: "media",
      data: { alt },
      filePath: path.resolve(dirname, "..", "public", pfad),
      context: { disableRevalidate: true },
    });
    console.log(`uploaded: ${pfad}`);
    return media.id;
  };

  const bildId = await upload(HERO_BILD);

  const logoIds: number[] = [];
  for (const logo of LOGOS) {
    logoIds.push(await upload(logo));
  }

  await payload.updateGlobal({
    slug: "hero",
    data: {
      headline: HEADLINE,
      subtext: SUBTEXT,
      ctaLabel: CTA_LABEL,
      bild: bildId,
      partnerLogos: LOGOS.map((logo, i) => ({ logo: logoIds[i], alt: logo.alt })),
    },
    context: { disableRevalidate: true },
  });

  console.log("seeded: hero");
  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
