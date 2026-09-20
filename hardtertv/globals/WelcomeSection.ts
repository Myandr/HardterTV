import type { GlobalConfig } from "payload";

import { STAT_ICON_OPTIONS } from "../lib/stat-icons";
import { revalidateGlobalPaths } from "./hooks/revalidate";

export const WelcomeSectionGlobal: GlobalConfig = {
  slug: "welcome-section",
  label: "Startseite: Willkommen",
  admin: { group: "Startseite" },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalPaths(["/"])],
  },
  fields: [
    { name: "eyebrow", type: "text", required: true, maxLength: 60, label: "Kleine Überschrift" },
    { name: "headline", type: "text", required: true, maxLength: 200, label: "Überschrift" },
    { name: "intro", type: "textarea", required: true, maxLength: 500, label: "Einleitungstext" },
    {
      name: "stats",
      type: "array",
      label: "Zahlen-Kacheln",
      labels: { singular: "Kachel", plural: "Kacheln" },
      minRows: 1,
      maxRows: 4,
      admin: { description: "Vier Kacheln passen genau in eine Zeile." },
      fields: [
        {
          name: "icon",
          type: "select",
          required: true,
          defaultValue: "trophy",
          options: STAT_ICON_OPTIONS,
        },
        { name: "wert", type: "text", required: true, maxLength: 20, label: "Zahl" },
        { name: "label", type: "text", required: true, maxLength: 40, label: "Beschriftung" },
      ],
    },
    {
      name: "bild",
      type: "upload",
      relationTo: "media",
      label: "Bild",
      admin: { description: "Ohne Bild bleibt die Fläche grau." },
    },
    {
      name: "bildBadge",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Text im Badge auf dem Bild",
    },
    {
      name: "text",
      type: "textarea",
      required: true,
      maxLength: 6000,
      label: "Begrüßungstext",
      admin: { description: "Absätze durch eine Leerzeile voneinander trennen." },
    },
    { name: "signaturName", type: "text", required: true, maxLength: 80, label: "Unterschrift: Name" },
    { name: "signaturRolle", type: "text", required: true, maxLength: 80, label: "Unterschrift: Funktion" },
    {
      name: "ctaLabel",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Button-Beschriftung",
      admin: { description: "Der Button verlinkt immer auf /mitgliedschaft." },
    },
    {
      name: "sekundaerLabel",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Textlink-Beschriftung",
      admin: { description: "Verlinkt auf /training. Der Pfeil wird automatisch angehängt." },
    },
  ],
};
