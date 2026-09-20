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

const FEHLERMELDUNGEN = {
  nameZuKurz: "Bitte gib deinen Namen an (mindestens {min} Zeichen).",
  nameZuLang: "Der Name darf höchstens {max} Zeichen lang sein.",
  emailFehlt: "Bitte gib deine E-Mail-Adresse an.",
  emailZuLang: "Diese E-Mail-Adresse ist zu lang.",
  emailUngueltig: "Diese E-Mail-Adresse sieht nicht gültig aus.",
  telefonZuLang: "Diese Telefonnummer ist zu lang.",
  nachrichtZuKurz: "Bitte schreib uns ein paar Worte (mindestens {min} Zeichen).",
  nachrichtZuLang: "Die Nachricht darf höchstens {max} Zeichen lang sein.",
  einwilligungFehlt:
    "Bitte stimme der Verarbeitung deiner Daten zu — ohne Einwilligung dürfen wir deine Nachricht nicht speichern.",
  allgemein: "Bitte prüfe die markierten Felder.",
  speichernFehlgeschlagen:
    "Deine Nachricht konnte gerade nicht gespeichert werden. Bitte versuche es später noch einmal oder schreib uns direkt eine E-Mail.",
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

  // Zweiter, unabhängiger Block mit eigenem Marker.
  const existing2 = await payload.findGlobal({ slug: "kontakt-section", depth: 0 });
  if (existing2?.fehlermeldungen?.allgemein) {
    console.log("skip (already seeded): kontakt-fehlermeldungen");
  } else {
    await payload.updateGlobal({
      slug: "kontakt-section",
      data: { fehlermeldungen: FEHLERMELDUNGEN },
      context: { disableRevalidate: true },
    });
    console.log("seeded: kontakt-fehlermeldungen");
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
