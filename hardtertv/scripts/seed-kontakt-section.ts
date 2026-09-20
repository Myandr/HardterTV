import { getPayload } from "payload";

import config from "../payload.config";

const MAPS_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2474.959200775651!2d6.927527713413548!3d51.6605833717312!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b8f26e657412d9%3A0x9088105a5549feb5!2sHardter%20TV!5e0!3m2!1sde!2sde!4v1737024831814!5m2!1sde!2sde";

async function run() {
  const payload = await getPayload({ config });

  const existing = await payload.findGlobal({ slug: "kontakt-section", depth: 0 });
  if (existing?.eyebrow) {
    console.log("skip (already seeded): kontakt-section");
    process.exit(0);
  }

  await payload.updateGlobal({
    slug: "kontakt-section",
    data: {
      eyebrow: "Kontakt",
      headlineTeil1: "Schreibe",
      headlineTeil2: "uns direkt",
      intro: "Nehmt direkt Kontakt mit uns auf — wir melden uns so schnell wie möglich.",
      mapsEmbedUrl: MAPS_EMBED,
      mapsTitel: "Standort Hardter TV",
      erfolgTitel: "Nachricht gesendet!",
      erfolgText: "Wir melden uns bald bei dir.",
    },
    context: { disableRevalidate: true },
  });

  console.log("seeded: kontakt-section");
  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
