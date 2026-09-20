import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import type { Payload } from "payload";

import config from "../payload.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

async function uploadMedia(payload: Payload, relPath: string, alt: string): Promise<number> {
  const filePath = path.resolve(dirname, "..", "public", relPath.replace(/^\//, ""));
  const doc = await payload.create({
    collection: "media",
    data: { alt },
    filePath,
    context: { disableRevalidate: true },
  });
  console.log(`media uploaded: ${relPath} -> id ${doc.id}`);
  return doc.id;
}

async function run() {
  const payload = await getPayload({ config });

  // Idempotency marker: the info tiles are only ever written by this seed.
  const current = await payload.findGlobal({ slug: "eisstock", depth: 0 });
  if ((current.angebot?.kacheln?.length ?? 0) > 0) {
    console.log("skip (already seeded): eisstock");
    process.exit(0);
  }

  const heroBild = await uploadMedia(
    payload,
    "/images/änderungen/eis2.png",
    "Eisstockschießen beim Hardter TV",
  );
  const galerie1 = await uploadMedia(payload, "/images/änderungen/eis.png", "Eisstockbahn");
  const galerie2 = await uploadMedia(payload, "/images/änderungen/eis3.png", "Eisstockschießen");

  await payload.updateGlobal({
    slug: "eisstock",
    context: { disableRevalidate: true },
    data: {
      hero: {
        bild: heroBild,
        eyebrow: "Eisstockschießen",
        titelVorne: "Eisstockschießen",
        titelHighlight: "beim HTV",
        text: "Entdecke Eisstockschießen beim Hardter Tennisverein — Demo-Text: Spaß für Gruppen, Vereine und Firmenevents. Jetzt direkt online buchen.",
        buttonLabel: "Jetzt buchen",
      },
      angebot: {
        eyebrow: "Das Angebot",
        titelVorne: "Alles auf einen",
        titelHighlight: "Blick",
        text: "Demo-Text: Alle wichtigen Infos zum Eisstockschießen beim HTV.",
        kacheln: [
          { icon: "mapPin", titel: "Ort", beschreibung: "Demo-Standort, Demo-Adresse" },
          { icon: "users", titel: "Gruppengröße", beschreibung: "Demo: 6–20 Personen" },
          { icon: "euro", titel: "Preis", beschreibung: "Demo: ab X€ pro Person" },
          { icon: "calendarDays", titel: "Saison", beschreibung: "Demo: Oktober – März" },
        ],
      },
      galerie: {
        bilder: [{ bild: galerie1 }, { bild: galerie2 }],
      },
      buchung: {
        eyebrow: "Online buchen",
        titelVorne: "Wähle deinen",
        titelHighlight: "Wunschtermin",
        text: "Buche deinen Termin direkt online — schnell, einfach und ohne Telefonat.",
        widgetUrl: "https://hartdertv.simplybook.it/v2/#book",
      },
    },
  });

  console.log("seeded: eisstock");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
