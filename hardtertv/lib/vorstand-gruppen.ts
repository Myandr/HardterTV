export const VORSTAND_GRUPPEN = [
  { value: "fuehrung", adminLabel: "Führung" },
  { value: "finanzen", adminLabel: "Finanzen & Verwaltung" },
  { value: "sport", adminLabel: "Sport" },
  { value: "events", adminLabel: "Events & Kommunikation" },
  { value: "technik", adminLabel: "Technik & Platz" },
] as const;

export type GruppeValue = (typeof VORSTAND_GRUPPEN)[number]["value"];
