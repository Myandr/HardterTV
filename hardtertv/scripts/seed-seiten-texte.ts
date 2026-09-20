import { getPayload } from "payload";

import config from "../payload.config";

const DATEN = {
  vorstand: {
    eyebrow: "Der Verein",
    titelVorne: "Unser",
    titelHighlight: "Vorstand",
    text: "Lern die Menschen kennen, die unseren Verein leiten, gestalten und am Leben erhalten — ehrenamtlich und mit vollem Herz dabei.",
    badgeSuffix: "Mitglieder",
    gruppen: [
      {
        gruppe: "fuehrung" as const,
        titel: "Führung",
        beschreibung: "Der geschäftsführende Vorstand leitet den Verein und vertritt ihn nach außen.",
      },
      {
        gruppe: "finanzen" as const,
        titel: "Finanzen & Verwaltung",
        beschreibung: "Sie kümmern sich um Finanzen, Organisation und das Vereinsheim.",
      },
      {
        gruppe: "sport" as const,
        titel: "Sport",
        beschreibung: "Die Sportwarte organisieren den Spielbetrieb und koordinieren unsere Mannschaften.",
      },
      {
        gruppe: "events" as const,
        titel: "Events & Kommunikation",
        beschreibung: "Sie gestalten das Vereinsleben, organisieren Events und pflegen die Kommunikation.",
      },
      {
        gruppe: "technik" as const,
        titel: "Technik & Platz",
        beschreibung: "Sie sorgen für die technische Infrastruktur und gepflegte Anlagen.",
      },
    ],
    ctaTitel: "Du möchtest mitmachen?",
    ctaText:
      "Wir freuen uns über engagierte Mitglieder, die den Verein aktiv mitgestalten wollen. Meld dich einfach bei uns.",
    ctaButtonLabel: "Kontakt aufnehmen",
    ctaEmail: "1.vorsitzender@hardt-tennis.de",
  },
  kalender: {
    eyebrow: "Vereinsleben",
    titelVorne: "Termine &",
    titelHighlight: "Kalender",
    text: "Alle Termine des Hardter TV auf einen Blick — von Turnieren und Trainingszeiten bis zu geselligen Vereinsabenden.",
    monatsansichtLabel: "Monatsansicht",
    listenansichtLabel: "Listenansicht",
    filterAlleLabel: "Alle",
    ausgewaehlterTagLabel: "Ausgewählter Tag",
    naechsteTermineLabel: "Nächste Termine",
    keineTermineTag: "Keine Termine an diesem Tag",
    keineTermineListe: "Keine Termine gefunden",
    uhrzeitSuffix: "Uhr",
  },
  galerie: {
    eyebrow: "Galerie",
    titelVorne: "Unsere",
    titelHighlight: "Tennismomente",
    text: "Entdecke die schönsten Momente aus unserem Vereinsleben — von Turnieren über Mannschaftsabende bis zum Saisonabschluss.",
    bilderSuffix: "Bilder",
    leerText: "Aktuell sind keine Bilder online — schau bald wieder vorbei.",
  },
  mannschaften: {
    eyebrow: "Sport",
    titelVorne: "Unsere",
    titelHighlight: "Mannschaften",
    text: "Vom Nachwuchs bis zu den Senioren — der Hardter TV stellt zahlreiche Mannschaften in verschiedenen Altersklassen und Ligen auf.",
    kategorien: [
      { kategorie: "Herren" as const, reiterLabel: "Herren", listenEyebrow: "Herren-Teams", badgeSuffix: "Herren-Teams" },
      { kategorie: "Damen" as const, reiterLabel: "Damen", listenEyebrow: "Damen-Teams", badgeSuffix: "Damen-Teams" },
      { kategorie: "Gemischt" as const, reiterLabel: "Gemischt", listenEyebrow: "Gemischt-Teams", badgeSuffix: "Gemischt-Teams" },
    ],
    teamsSuffix: "Teams",
    kartenUntertitel: "Hardter TV",
    kontaktEyebrow: "Ansprechpartner",
    kontaktTitelVorne: "Fragen zu den",
    kontaktTitelHighlight: "Mannschaften?",
    kontaktText:
      "Unser Sportwart hilft dir bei allen Fragen rund um Anmeldung, Spielbetrieb und Mannschaftseinteilung.",
    kontaktLabel: "Sportwart",
    kontaktTelefon: "0151 53 55 33 55",
    kontaktTelefonHref: "tel:+4915153553355",
    // Wörtlich aus dem Code übernommen: der Block ist mit "Sportwart" beschriftet,
    // trägt aber die Adresse des 1. Vorsitzenden. NICHT stillschweigend korrigiert.
    kontaktEmail: "1.vorsitzender@hardt-tennis.de",
  },
  mannschaftDetail: {
    zurueckLabel: "Zurück zur Übersicht",
    saisonLabel: "Saison 2024 / 2025",
    vereinBadge: "Hardter TV",
    verbandBadge: "WTV",
    ligaEyebrow: "Ligadaten",
    ligaTitel: "Tabelle & Ergebnisse",
    ligaSaisonLabel: "Saison 2024/2025",
    ligaQuelle: "wtv.liga.nu",
    abschlussText: "Alle Mannschaften im Überblick",
  },
  rechtliches: {
    zurueckLabel: "Zurück zur Startseite",
    cookiesEyebrow: "Datenschutz",
    cookiesTitelVorne: "Cookie-",
    cookiesTitelHighlight: "Einstellungen",
  },
};

async function run() {
  const payload = await getPayload({ config });

  const existing = await payload.findGlobal({ slug: "seiten-texte", depth: 0 });
  if (existing?.vorstand?.titelHighlight) {
    console.log("skip (already seeded): seiten-texte");
    process.exit(0);
  }

  await payload.updateGlobal({
    slug: "seiten-texte",
    data: DATEN,
    context: { disableRevalidate: true },
  });

  console.log("seeded: seiten-texte");
  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
