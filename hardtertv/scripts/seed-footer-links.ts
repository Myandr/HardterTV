import { getPayload } from "payload";

import config from "../payload.config";

const NEU = {
  schnelleLinksTitel: "Schnelle Links",
  schnelleLinks: [
    { label: "Home", ziel: "/" },
    { label: "Über uns", ziel: "/#about" },
    { label: "Termine", ziel: "/#termine" },
    { label: "Vorstand", ziel: "/vorstand" },
    { label: "Neuigkeiten", ziel: "/#news" },
    { label: "Kontakt", ziel: "/#contact" },
    { label: "Training", ziel: "/training" },
    { label: "Mannschaften", ziel: "/mannschaften" },
    { label: "Galerie", ziel: "/galerie" },
    { label: "Mitgliedschaft", ziel: "/mitgliedschaft" },
  ],
  kontaktTitel: "Kontakt",
  emailLabel: "E-Mail",
  copyrightZusatz: "Alle Rechte vorbehalten.",
  rechtlicheLinks: [
    { label: "Datenschutz", ziel: "/datenschutz" },
    { label: "Impressum", ziel: "/impressum" },
    { label: "Cookie-Einstellungen", ziel: "/cookies" },
  ],
} as const;

async function run() {
  const payload = await getPayload({ config });

  // Marker: ein Feld, das es vor dieser Erweiterung nicht gab. Nur die neuen
  // Felder werden geschrieben, damit Redakteursänderungen an den alten bleiben.
  const existing = await payload.findGlobal({ slug: "footer", depth: 0 });
  if (existing?.schnelleLinksTitel) {
    console.log("skip (already seeded): footer-links");
  } else {
    await payload.updateGlobal({
      slug: "footer",
      data: {
        ...NEU,
        schnelleLinks: NEU.schnelleLinks.map((l) => ({ ...l })),
        rechtlicheLinks: NEU.rechtlicheLinks.map((l) => ({ ...l })),
      },
      context: { disableRevalidate: true },
    });
    console.log("seeded: footer-links");
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
