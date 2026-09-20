import { getPayload } from "payload";

import config from "../payload.config";

const FORMULAR = {
  adresseLabel: "Adresse",
  emailLabel: "E-Mail",
  nameLabel: "Name",
  namePlaceholder: "Dein Name",
  emailFeldLabel: "E-Mail",
  emailPlaceholder: "deine@email.de",
  nachrichtLabel: "Nachricht",
  nachrichtPlaceholder: "Deine Nachricht an den HTV...",
  einwilligungTextVor: "Ich habe die",
  einwilligungLinkText: "Datenschutzerklärung",
  einwilligungTextNach:
    "gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung meiner Anfrage zu.",
  absendenLabel: "Nachricht senden",
  sendenLabel: "Wird gesendet…",
  honeypotLabel: "Dieses Feld bitte leer lassen",
};

async function run() {
  const payload = await getPayload({ config });

  // Nur die neue Gruppe wird geschrieben; die vorhandenen Felder bleiben unberührt.
  const existing = await payload.findGlobal({ slug: "kontakt-section", depth: 0 });
  if (existing?.formular?.absendenLabel) {
    console.log("skip (already seeded): kontakt-formular");
  } else {
    await payload.updateGlobal({
      slug: "kontakt-section",
      data: { formular: FORMULAR },
      context: { disableRevalidate: true },
    });
    console.log("seeded: kontakt-formular");
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
