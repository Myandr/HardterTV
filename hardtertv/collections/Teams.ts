import type { CollectionConfig } from "payload";

export const Teams: CollectionConfig = {
  slug: "teams",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "kategorie", "slug"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "kategorie",
      type: "select",
      required: true,
      options: [
        { label: "Herren", value: "Herren" },
        { label: "Damen", value: "Damen" },
        { label: "Gemischt", value: "Gemischt" },
      ],
    },
    {
      name: "kontakt",
      type: "text",
      required: true,
    },
    {
      name: "bild",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "ligaUrl",
      type: "text",
      required: true,
      label: "Liga-URL (wtv.liga.nu)",
    },
  ],
};
