import { getPayload } from "payload";

import config from "../payload.config";

const DATA = {
  banner: {
    titel: "Cookies & Datenschutz",
    textVor:
      "Wir verwenden Cookies, um externe Dienste wie Google Maps einzubinden. Einige Cookies sind technisch notwendig, andere helfen uns, die Website zu verbessern. Weitere Infos in unserer",
    linkText: "Datenschutzerklärung",
    textNach: ".",
    alleAkzeptierenLabel: "Alle akzeptieren",
    auswahlSpeichernLabel: "Auswahl speichern",
    einstellungenLabel: "Einstellungen",
    nurNotwendigeLabel: "Nur notwendige",
  },
  seite: {
    speichernLabel: "Einstellungen speichern",
    gespeichertLabel: "Gespeichert ✓",
    alleAkzeptierenLabel: "Alle akzeptieren",
    nurNotwendigeLabel: "Nur notwendige",
  },
  kategorien: [
    {
      schluessel: "notwendig" as const,
      titel: "Notwendige Cookies",
      bannerBeschreibung:
        "Technisch erforderlich für die Grundfunktionen der Website. Können nicht deaktiviert werden.",
      seiteBeschreibung:
        "Diese Cookies sind für den Betrieb der Website technisch notwendig und können nicht deaktiviert werden. Sie speichern keine personenbezogenen Daten.",
      seiteFussnote: "Beispiel: Cookie-Einstellungen speichern (localStorage)",
    },
    {
      schluessel: "maps" as const,
      titel: "Google Maps",
      bannerBeschreibung:
        "Ermöglicht die Nutzung von Google Maps zum Anzeigen von Standorten. Google kann dabei Daten erheben.",
      seiteBeschreibung:
        "Wir verlinken auf Google Maps für Standortangaben. Beim Klick auf einen Maps-Link gelten die Datenschutzbestimmungen von Google. Google LLC, USA.",
      seiteFussnote:
        "Anbieter: Google LLC · Zweck: Kartenanzeige & Standort · Datenübertragung in die USA möglich",
      toggleAriaLabel: "Google Maps togglen",
    },
    {
      schluessel: "analyse" as const,
      titel: "Analyse",
      bannerBeschreibung:
        "Hilft uns zu verstehen, wie Besucher die Website nutzen (z.B. Google Analytics).",
      seiteBeschreibung:
        "Analyse-Cookies helfen uns zu verstehen, wie Besucher die Website nutzen, damit wir sie verbessern können (z.B. Google Analytics).",
      seiteFussnote:
        "Anbieter: Google LLC · Zweck: Websiteanalyse · Datenübertragung in die USA möglich",
      toggleAriaLabel: "Analyse togglen",
    },
  ],
  maps: {
    titel: "Google Maps nicht aktiviert",
    text: "Um die Karte anzuzeigen, müssen Google Maps Cookies in den Einstellungen aktiviert werden.",
    buttonLabel: "Cookie-Einstellungen öffnen",
  },
};

async function run() {
  const payload = await getPayload({ config });

  const existing = await payload.findGlobal({ slug: "cookie-texte", depth: 0 });
  if (existing?.banner?.titel) {
    console.log("skip (already seeded): cookie-texte");
  } else {
    await payload.updateGlobal({ slug: "cookie-texte", data: DATA, context: { disableRevalidate: true } });
    console.log("seeded: cookie-texte");
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
