export const VORSTAND_GRUPPEN = [
  {
    value: "fuehrung",
    titel: "Führung",
    beschreibung: "Der geschäftsführende Vorstand leitet den Verein und vertritt ihn nach außen.",
  },
  {
    value: "finanzen",
    titel: "Finanzen & Verwaltung",
    beschreibung: "Sie kümmern sich um Finanzen, Organisation und das Vereinsheim.",
  },
  {
    value: "sport",
    titel: "Sport",
    beschreibung: "Die Sportwarte organisieren den Spielbetrieb und koordinieren unsere Mannschaften.",
  },
  {
    value: "events",
    titel: "Events & Kommunikation",
    beschreibung: "Sie gestalten das Vereinsleben, organisieren Events und pflegen die Kommunikation.",
  },
  {
    value: "technik",
    titel: "Technik & Platz",
    beschreibung: "Sie sorgen für die technische Infrastruktur und gepflegte Anlagen.",
  },
] as const;

export type GruppeValue = (typeof VORSTAND_GRUPPEN)[number]["value"];
