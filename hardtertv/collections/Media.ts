import type { CollectionConfig } from "payload";
import { revalidateLayoutAfterChange, revalidateLayoutAfterDelete } from "./hooks/revalidate";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  hooks: {
    afterChange: [revalidateLayoutAfterChange],
    afterDelete: [revalidateLayoutAfterDelete],
  },
  upload: true,
};
