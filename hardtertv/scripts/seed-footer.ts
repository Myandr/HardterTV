import { getPayload } from "payload";

import config from "../payload.config";

const EMAIL = "1.vorsitzender@hardt-tennis.de";

async function run() {
  const payload = await getPayload({ config });

  const existing = await payload.findGlobal({ slug: "footer", depth: 0 });
  if (existing?.vereinsname) {
    console.log("skip (already seeded): footer");
    process.exit(0);
  }

  await payload.updateGlobal({
    slug: "footer",
    data: {
      vereinsname: "Hardter TV",
      beschreibung: "Ihr Tennisverein für Sport, Spaß und Gemeinschaft in Dorsten.",
      strasse: "Gahlener Str. 204",
      plz: "46282",
      ort: "Dorsten",
      email: EMAIL,
      telefonLabel: "Vorsitzender",
      telefon: "0172 25 80 209",
      // Übernommen wie im bisherigen Code (siehe "Notes for the user" — die Nummer
      // enthält vermutlich eine Null zu viel; sie wird hier NICHT stillschweigend korrigiert).
      telefonHref: "tel:+4917225800209",
      kontaktpersonen: [
        { label: "1. Vorsitzender", name: "Oliver Wiegand", email: EMAIL },
        { label: "1. Geschäftsführer", name: "Hendrick Büncker", email: EMAIL },
        { label: "Schatzmeister", name: "Marco Hohenstein", email: EMAIL },
      ],
      funFactTitel: "Wusstest du schon?",
      funFact:
        "Der längste Tennismatch der Geschichte dauerte über 11 Stunden — John Isner gegen Nicolas Mahut in Wimbledon 2010.",
      shop: {
        textVor: "Mitglied im",
        linkText: "HTV-Shop",
        url: "https://matchpoint24.de/collections/tennisclub-hardter-tv",
        textNach: "— Ausrüstung direkt vom Verein.",
      },
      instagram: {
        handle: "@hardtertv",
        url: "https://www.instagram.com/hardtertv/",
        ctaEyebrow: "Social Media",
        ctaHeadline: "Folge uns auf Instagram",
        ctaText: "Aktuelle Bilder, Spielberichte und Vereinsleben — immer live auf",
      },
      copyrightName: "Hardter TV",
    },
    context: { disableRevalidate: true },
  });

  console.log("seeded: footer");
  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
