import type { GlobalConfig } from "payload";

import { revalidateGlobalPaths } from "./hooks/revalidate";

export const TermineSectionGlobal: GlobalConfig = {
  slug: "termine-section",
  label: "Startseite: Termine",
  admin: {
    group: "Startseite",
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalPaths(["/"])],
  },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Kleine Überschrift",
      admin: { description: "Die Jahreszahl wird automatisch angehängt." },
    },
    { name: "headlineTeil1", type: "text", required: true, maxLength: 60, label: "Überschrift (erster Teil)" },
    { name: "headlineTeil2", type: "text", required: true, maxLength: 60, label: "Überschrift (unterstrichener Teil)" },
    { name: "intro", type: "textarea", required: true, maxLength: 400, label: "Einleitungstext" },
    {
      name: "ctaLabel",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Button-Beschriftung",
      admin: { description: "Der Button verlinkt immer auf /kalender." },
    },
    { name: "leerTextVor", type: "text", required: true, maxLength: 300, label: "Leer-Hinweis: Text vor dem Link" },
    {
      name: "leerLinkText",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Leer-Hinweis: Link-Text",
      admin: { description: "Verlinkt auf /kalender." },
    },
    { name: "leerTextNach", type: "text", required: true, maxLength: 40, label: "Leer-Hinweis: Text nach dem Link" },
  ],
};
