import type { CollectionConfig } from "payload";

import { revalidatePathsAfterChange, revalidatePathsAfterDelete } from "./hooks/revalidate";

const PATHS = ["/galerie"];

export const GalleryAlbums: CollectionConfig = {
  slug: "gallery-albums",
  labels: { singular: "Galerie-Album", plural: "Galerie" },
  admin: {
    useAsTitle: "titel",
    defaultColumns: ["titel", "jahr"],
  },
  defaultSort: "-jahr",
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidatePathsAfterChange(PATHS)],
    afterDelete: [revalidatePathsAfterDelete(PATHS)],
  },
  fields: [
    {
      name: "titel",
      type: "text",
      required: true,
      admin: { description: 'z.B. "Rückblick 2024" — erscheint als Überschrift über dem Bilderraster.' },
    },
    {
      name: "jahr",
      type: "number",
      required: true,
      min: 1900,
      max: 2100,
      admin: { description: "Bestimmt die Reihenfolge: neuestes Jahr zuerst." },
    },
    {
      name: "bilder",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      required: true,
      label: "Bilder",
      admin: { description: "Die Reihenfolge hier ist die Reihenfolge auf der Website." },
    },
  ],
};
