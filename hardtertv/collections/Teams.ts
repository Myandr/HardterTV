import { revalidatePath } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from "payload";

const revalidateTeam: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req,
}) => {
  if (req.context?.disableRevalidate) return doc;
  revalidatePath("/mannschaften");
  revalidatePath(`/mannschaften/${doc.slug}`);
  if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
    revalidatePath(`/mannschaften/${previousDoc.slug}`);
  }
  return doc;
};

const revalidateTeamDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (req.context?.disableRevalidate) return doc;
  revalidatePath("/mannschaften");
  revalidatePath(`/mannschaften/${doc.slug}`);
  return doc;
};

export const Teams: CollectionConfig = {
  slug: "teams",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "kategorie", "slug"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateTeam],
    afterDelete: [revalidateTeamDelete],
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
