import type { CollectionConfig } from "payload";

import { revalidatePathsAfterChange, revalidatePathsAfterDelete } from "./hooks/revalidate";

const PATHS = ["/kalender", "/"];

export const Events: CollectionConfig = {
  slug: "events",
  labels: { singular: "Termin", plural: "Termine" },
  admin: {
    useAsTitle: "titel",
    defaultColumns: ["titel", "datum", "kategorie", "ort"],
  },
  defaultSort: "-datum",
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidatePathsAfterChange(PATHS)],
    afterDelete: [revalidatePathsAfterDelete(PATHS)],
  },
  fields: [
    { name: "titel", type: "text", required: true },
    {
      name: "datum",
      type: "date",
      required: true,
      label: "Datum (Beginn)",
      admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } },
    },
    {
      name: "datumEnde",
      type: "date",
      label: "Datum (Ende, nur bei mehrtägigen Terminen)",
      admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } },
    },
    { name: "uhrzeit", type: "text", admin: { description: 'z.B. "10:00" oder "Ganztägig"' } },
    { name: "ort", type: "text" },
    {
      name: "kategorie",
      type: "select",
      required: true,
      defaultValue: "Sonstiges",
      options: [
        { label: "Training", value: "Training" },
        { label: "Turnier", value: "Turnier" },
        { label: "Sonstiges", value: "Sonstiges" },
      ],
    },
    { name: "beschreibung", type: "text" },
  ],
};
