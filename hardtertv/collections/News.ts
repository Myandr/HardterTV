import type { CollectionConfig } from "payload";

import { revalidatePathsAfterChange, revalidatePathsAfterDelete } from "./hooks/revalidate";

const PATHS = ["/"];

export const News: CollectionConfig = {
  slug: "news",
  labels: { singular: "Neuigkeit", plural: "News" },
  admin: {
    useAsTitle: "titel",
    defaultColumns: ["titel", "datum", "kategorie"],
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
    {
      name: "datum",
      type: "date",
      required: true,
      admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } },
    },
    { name: "titel", type: "text", required: true },
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      label: "Kurztext",
      admin: { description: "Wird auf der Startseite unter der Überschrift angezeigt." },
    },
    {
      name: "content",
      type: "richText",
      label: "Ausführlicher Text",
      admin: {
        description:
          "Wird aktuell noch nicht auf der Website angezeigt — eine Detailseite folgt in einem späteren Schritt.",
      },
    },
    { name: "bild", type: "upload", relationTo: "media" },
    {
      name: "kategorie",
      type: "select",
      required: true,
      defaultValue: "Vereinsnews",
      options: [
        { label: "Vereinsnews", value: "Vereinsnews" },
        { label: "Vereinsleben", value: "Vereinsleben" },
        { label: "Turnier", value: "Turnier" },
        { label: "Training", value: "Training" },
      ],
    },
  ],
};
