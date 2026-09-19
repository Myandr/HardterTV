import type { CollectionConfig } from "payload";

import { VORSTAND_GRUPPEN } from "../lib/vorstand-gruppen";
import { revalidatePathsAfterChange, revalidatePathsAfterDelete } from "./hooks/revalidate";

const PATHS = ["/vorstand", "/"];

export const BoardMembers: CollectionConfig = {
  slug: "board-members",
  labels: { singular: "Vorstandsmitglied", plural: "Vorstand" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "titel", "gruppe", "featured", "reihenfolge"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidatePathsAfterChange(PATHS)],
    afterDelete: [revalidatePathsAfterDelete(PATHS)],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "titel", type: "text", required: true, label: "Funktion (z.B. 1. Vorsitzender)" },
    {
      name: "gruppe",
      type: "select",
      required: true,
      options: VORSTAND_GRUPPEN.map((g) => ({ label: g.titel, value: g.value })),
    },
    {
      name: "reihenfolge",
      type: "number",
      required: true,
      defaultValue: 1000,
      label: "Reihenfolge (kleiner = weiter vorne)",
      admin: { description: "Bestimmt die Reihenfolge innerhalb der Gruppe und auf der Startseite." },
    },
    {
      name: "emails",
      type: "array",
      label: "E-Mail-Adressen",
      fields: [{ name: "email", type: "email", required: true }],
    },
    { name: "telefon", type: "text" },
    { name: "foto", type: "upload", relationTo: "media" },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      label: "Auf der Startseite zeigen",
      admin: { description: "Die ersten 3 Markierten (nach Reihenfolge) erscheinen auf der Startseite." },
    },
  ],
};
