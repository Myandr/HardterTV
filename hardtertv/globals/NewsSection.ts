import type { GlobalConfig } from "payload";

import { revalidateGlobalPaths } from "./hooks/revalidate";

export const NewsSectionGlobal: GlobalConfig = {
  slug: "news-section",
  label: "Startseite: Neuigkeiten",
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
  ],
};
