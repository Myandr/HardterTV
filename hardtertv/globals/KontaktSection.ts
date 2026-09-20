import type { GlobalConfig } from "payload";

import { revalidateGlobalPaths } from "./hooks/revalidate";

export const KontaktSectionGlobal: GlobalConfig = {
  slug: "kontakt-section",
  label: "Startseite: Kontaktbereich",
  admin: {
    group: "Startseite",
    description:
      "Adresse, Telefon und E-Mail stammen aus „Footer & Kontaktdaten“ — hier stehen nur die Texte dieses Abschnitts.",
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalPaths(["/"])],
  },
  fields: [
    { name: "eyebrow", type: "text", required: true, maxLength: 60, label: "Kleine Überschrift" },
    { name: "headlineTeil1", type: "text", required: true, maxLength: 60, label: "Überschrift (erster Teil)" },
    {
      name: "headlineTeil2",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Überschrift (unterstrichener Teil)",
    },
    { name: "intro", type: "textarea", required: true, maxLength: 400, label: "Einleitungstext" },
    {
      name: "mapsEmbedUrl",
      type: "text",
      required: true,
      maxLength: 1000,
      label: "Google-Maps-Einbettungsadresse",
      admin: {
        description:
          'In Google Maps: Teilen → Karte einbetten → die Adresse aus dem src="…" kopieren. Die Karte wird erst nach Cookie-Einwilligung geladen.',
      },
    },
    { name: "mapsTitel", type: "text", required: true, maxLength: 120, label: "Titel der Karte (Barrierefreiheit)" },
    { name: "erfolgTitel", type: "text", required: true, maxLength: 80, label: "Bestätigung: Überschrift" },
    { name: "erfolgText", type: "text", required: true, maxLength: 200, label: "Bestätigung: Text" },
  ],
};
