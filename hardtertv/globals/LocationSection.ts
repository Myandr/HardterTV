import type { GlobalConfig } from "payload";

import { revalidateGlobalPaths } from "./hooks/revalidate";

export const LocationSectionGlobal: GlobalConfig = {
  slug: "location-section",
  label: "Startseite: Standorte",
  admin: { group: "Startseite" },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalPaths(["/"])],
  },
  fields: [
    { name: "eyebrow", type: "text", required: true, maxLength: 60, label: "Kleine Überschrift" },
    {
      name: "headlineTeil1",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Überschrift (erster Teil)",
    },
    {
      name: "headlineTeil2",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Überschrift (unterstrichener Teil)",
    },
    { name: "intro", type: "textarea", required: true, maxLength: 600, label: "Einleitungstext" },
    {
      name: "ctaLabel",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Button-Beschriftung",
      admin: { description: "Der Button verlinkt immer auf /mitgliedschaft." },
    },
    {
      name: "karten",
      type: "array",
      label: "Standort-Karten",
      labels: { singular: "Karte", plural: "Karten" },
      minRows: 1,
      admin: { description: "Fünf Karten passen am besten in das Raster." },
      fields: [
        { name: "titel", type: "text", required: true, maxLength: 80 },
        {
          name: "untertitel",
          type: "textarea",
          maxLength: 160,
          label: "Untertitel",
          admin: { description: "Zeilenumbrüche bleiben erhalten." },
        },
        {
          name: "bild",
          type: "upload",
          relationTo: "media",
          admin: { description: "Ohne Bild bleibt die Fläche grau." },
        },
        {
          name: "href",
          type: "text",
          required: true,
          maxLength: 500,
          label: "Link",
          admin: {
            description:
              'Externe Links (beginnen mit "http") öffnen in einem neuen Tab und liegen hinter der Google-Maps-Einwilligung. Interne Links beginnen mit "/", z. B. /eisstock.',
          },
        },
      ],
    },
  ],
};
