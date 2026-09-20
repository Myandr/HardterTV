import type { GlobalConfig } from "payload";

import { revalidateGlobalPaths } from "./hooks/revalidate";

export const HeroGlobal: GlobalConfig = {
  slug: "hero",
  label: "Startseite: Hero",
  admin: { group: "Startseite" },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalPaths(["/"])],
  },
  fields: [
    {
      name: "headline",
      type: "text",
      required: true,
      maxLength: 160,
      label: "Überschrift",
    },
    {
      name: "subtext",
      type: "textarea",
      required: true,
      maxLength: 500,
      label: "Text unter der Überschrift",
    },
    {
      name: "ctaLabel",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Button-Beschriftung",
      admin: { description: "Der Button verlinkt immer auf /mitgliedschaft." },
    },
    {
      name: "bild",
      type: "upload",
      relationTo: "media",
      label: "Hero-Bild",
      admin: {
        description:
          "Querformat, mindestens 1920×1080. Ohne Bild bleibt die Fläche grau — die Seite bricht nicht.",
      },
    },
    {
      name: "partnerLogos",
      type: "array",
      label: "Partner-Logos",
      labels: { singular: "Logo", plural: "Logos" },
      admin: { description: "Laufen als Endlosband unter dem Text durch." },
      fields: [
        { name: "logo", type: "upload", relationTo: "media", required: true },
        {
          name: "alt",
          type: "text",
          maxLength: 120,
          label: "Alternativtext (optional)",
          admin: { description: "Leer lassen = Alternativtext des Bildes wird verwendet." },
        },
      ],
    },
  ],
};
