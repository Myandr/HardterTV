import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

import config from "../payload.config";
import type { GruppeValue } from "../lib/vorstand-gruppen";

const dirname = path.dirname(fileURLToPath(import.meta.url));

type Seed = {
  name: string;
  titel: string;
  gruppe: GruppeValue;
  emails?: string[];
  telefon?: string;
  bild?: string;
  featured?: boolean;
};

const MEMBERS: Seed[] = [
  { name: "Oliver Wiegand", titel: "1. Vorsitzender", gruppe: "fuehrung", emails: ["1.vorsitzender@hardt-tennis.de"], telefon: "0172 25 80 209", bild: "/images/änderungen/oliver-wiegand.png", featured: true },
  { name: "Volker Schuhmacher", titel: "2. Vorsitzender", gruppe: "fuehrung", telefon: "0160 99 78 94 11", bild: "/images/änderungen/volker-schuhmacher.png" },
  { name: "Hendrick Büncker", titel: "1. Geschäftsführer", gruppe: "fuehrung", telefon: "0151 741 04 202", bild: "/images/änderungen/handrick-bünker.png", featured: true },
  { name: "Holger Arlt", titel: "2. Geschäftsführer", gruppe: "fuehrung", emails: ["woodworm4u@gmail.com"], telefon: "0151 70 09 01 37", bild: "/images/änderungen/holger-arlt.png" },
  { name: "Marco Hohenstein", titel: "Schatzmeister", gruppe: "finanzen", emails: ["schatzmeister@hardt-tennis.de"], telefon: "0176 666 46 288", bild: "/images/änderungen/marco-hohenstein.png", featured: true },
  { name: "Anni Holzmann", titel: "Breitensport- & Clubheimwartin", gruppe: "finanzen", emails: ["annikaholzmann@gmx.de"], bild: "/images/änderungen/anni-holzmann.png" },
  { name: "Tanja Wiegand", titel: "1. Sportwartin", gruppe: "sport", emails: ["1.sportwart@hardt-tennis.de"], bild: "/images/änderungen/tanja-wiegand.png" },
  { name: "Rainer Pieper", titel: "2. Sportwart", gruppe: "sport", bild: "/images/änderungen/rainer-pieper.png" },
  { name: "Tabea Wiegand", titel: "Event & Kommunikationswartin", gruppe: "events", emails: ["tabea.wiegand.tw@gmail.com", "event.HTV@gmail.com"], bild: "/images/änderungen/tabea-wiegand.png" },
  { name: "Valentin Trapp", titel: "Eventmanager", gruppe: "events", emails: ["v.trapp1407@gmail.com", "event.HTV@gmail.com"], bild: "/images/änderungen/valentin-trapp1.png" },
  { name: "Udo Kahlert", titel: "Technikwart", gruppe: "technik", emails: ["annikaholzmann@gmx.de"], bild: "/images/änderungen/udo-kahlert.png" },
  { name: "Jürgen Mertens", titel: "Platzwart", gruppe: "technik", emails: ["juergenmertens62tennis@web.de"], bild: "/images/Jürgen Mertens_1.jpg" },
];

async function run() {
  const payload = await getPayload({ config });

  for (const [index, m] of MEMBERS.entries()) {
    const existing = await payload.find({
      collection: "board-members",
      where: { name: { equals: m.name } },
      limit: 1,
      depth: 0,
    });
    if (existing.docs.length > 0) {
      console.log(`skip (already exists): ${m.name}`);
      continue;
    }

    let fotoId: number | undefined;
    if (m.bild) {
      const filePath = path.resolve(dirname, "..", "public", m.bild.replace(/^\//, ""));
      const media = await payload.create({
        collection: "media",
        data: { alt: m.name },
        filePath,
        context: { disableRevalidate: true },
      });
      fotoId = media.id;
    }

    await payload.create({
      collection: "board-members",
      data: {
        name: m.name,
        titel: m.titel,
        gruppe: m.gruppe,
        reihenfolge: (index + 1) * 10,
        emails: (m.emails ?? []).map((email) => ({ email })),
        telefon: m.telefon,
        foto: fotoId,
        featured: m.featured ?? false,
      },
      context: { disableRevalidate: true },
    });
    console.log(`created: ${m.name}`);
  }

  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
