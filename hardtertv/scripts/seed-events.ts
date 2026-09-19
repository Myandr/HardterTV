import { getPayload } from "payload";

import config from "../payload.config";

type Kategorie = "Training" | "Turnier" | "Sonstiges";
type Seed = {
  titel: string;
  datum: string;
  datumEnde?: string;
  uhrzeit?: string;
  ort?: string;
  kategorie: Kategorie;
  beschreibung?: string;
};

const ORT = "Gahlener Str. 204, Dorsten";

const EVENTS: Seed[] = [
  // Startseite (2026)
  { titel: "LK-Turnier LK 20-25", datum: "2026-08-08", datumEnde: "2026-08-09", uhrzeit: "Ganztägig", ort: ORT, kategorie: "Turnier" },
  { titel: "2. HTV-Tennis Beer Pong Turnier", datum: "2026-08-15", uhrzeit: "noch offen", ort: ORT, kategorie: "Turnier" },
  { titel: "Mixed- und Doppelstadtmeisterschaften", datum: "2026-09-12", datumEnde: "2026-09-13", uhrzeit: "Ganztägig", ort: ORT, kategorie: "Turnier" },
  // Kalender (2025)
  { titel: "Frühjahrinstandsetzung", datum: "2025-04-12", uhrzeit: "10:00", ort: ORT, kategorie: "Sonstiges" },
  { titel: "Saisoneröffnung", datum: "2025-04-26", uhrzeit: "14:00", ort: ORT, kategorie: "Sonstiges" },
  { titel: "LK-Turnier LK 20 – 25", datum: "2025-06-08", ort: ORT, kategorie: "Turnier", beschreibung: "Ganztägig" },
  { titel: "1. HTV-Tennis Beer Pong Turnier", datum: "2025-07-12", uhrzeit: "11:00", ort: ORT, kategorie: "Turnier" },
  { titel: "LK-Turnier LK 20 – 25", datum: "2025-07-13", ort: ORT, kategorie: "Turnier", beschreibung: "Ganztägig" },
  { titel: "Stadtmeisterschaften der Senioren", datum: "2025-09-01", ort: ORT, kategorie: "Turnier", beschreibung: "Mehrtägiges Turnier" },
  { titel: "Doppel-/Mixed Stadtmeisterschaften", datum: "2025-09-20", ort: "TV Feldmark", kategorie: "Turnier", beschreibung: "Mehrtägiges Turnier" },
];

const noon = (day: string) => `${day}T12:00:00.000Z`;

async function run() {
  const payload = await getPayload({ config });

  for (const e of EVENTS) {
    const existing = await payload.find({
      collection: "events",
      where: { and: [{ titel: { equals: e.titel } }, { datum: { equals: noon(e.datum) } }] },
      limit: 1,
      depth: 0,
    });
    if (existing.docs.length > 0) {
      console.log(`skip (already exists): ${e.datum} ${e.titel}`);
      continue;
    }
    await payload.create({
      collection: "events",
      data: {
        titel: e.titel,
        datum: noon(e.datum),
        datumEnde: e.datumEnde ? noon(e.datumEnde) : undefined,
        uhrzeit: e.uhrzeit,
        ort: e.ort,
        kategorie: e.kategorie,
        beschreibung: e.beschreibung,
      },
      context: { disableRevalidate: true },
    });
    console.log(`created: ${e.datum} ${e.titel}`);
  }

  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
