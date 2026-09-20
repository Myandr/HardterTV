import type { GlobalConfig } from "payload";

import { revalidateGlobalPaths } from "./hooks/revalidate";

export const VorstandSectionGlobal: GlobalConfig = {
  slug: "vorstand-section",
  label: "Startseite: Vorstand",
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
    { name: "eyebrow", type: "text", required: true, maxLength: 60, label: "Kleine Überschrift" },
    { name: "headlineTeil1", type: "text", required: true, maxLength: 60, label: "Überschrift (erster Teil)" },
    { name: "headlineTeil2", type: "text", required: true, maxLength: 60, label: "Überschrift (unterstrichener Teil)" },
    { name: "intro", type: "textarea", required: true, maxLength: 400, label: "Einleitungstext" },
    {
      name: "ctaLabel",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Button-Beschriftung",
      admin: { description: "Der Button verlinkt immer auf /vorstand." },
    },
  ],
};
