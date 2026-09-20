export const VORSTAND_GRUPPEN = [
  {
    value: "fuehrung",
    adminLabel: "Führung",
    titel: "Führung",
    beschreibung: "Der geschäftsführende Vorstand leitet den Verein und vertritt ihn nach außen.",
  },
  {
    value: "finanzen",
    adminLabel: "Finanzen & Verwaltung",
    titel: "Finanzen & Verwaltung",
    beschreibung: "Sie kümmern sich um Finanzen, Organisation und das Vereinsheim.",
  },
  {
    value: "sport",
    adminLabel: "Sport",
    titel: "Sport",
    beschreibung: "Die Sportwarte organisieren den Spielbetrieb und koordinieren unsere Mannschaften.",
  },
  {
    value: "events",
    adminLabel: "Events & Kommunikation",
    titel: "Events & Kommunikation",
    beschreibung: "Sie gestalten das Vereinsleben, organisieren Events und pflegen die Kommunikation.",
  },
  {
    value: "technik",
    adminLabel: "Technik & Platz",
    titel: "Technik & Platz",
    beschreibung: "Sie sorgen für die technische Infrastruktur und gepflegte Anlagen.",
  },
] as const;

export type GruppeValue = (typeof VORSTAND_GRUPPEN)[number]["value"];
