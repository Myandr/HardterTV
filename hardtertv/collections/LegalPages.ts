import type { CollectionConfig } from "payload";

import { LEGAL_SLUGS, LEGAL_SLUG_OPTIONS } from "../lib/legal-pages";
import { revalidatePathsAfterChange, revalidatePathsAfterDelete } from "./hooks/revalidate";

const PATHS = ["/impressum", "/datenschutz", "/cookies"];

export const LegalPages: CollectionConfig = {
  slug: "legal-pages",
  labels: { singular: "Rechtsseite", plural: "Rechtsseiten" },
  admin: {
    useAsTitle: "titel",
    defaultColumns: ["titel", "slug"],
    description:
      "Impressum, Datenschutzerklärung und Cookie-Seite. Diese drei Seiten können bearbeitet, aber nicht neu angelegt oder gelöscht werden.",
  },
  access: {
    read: () => true,
    create: () => false,
    delete: () => false,
  },
  hooks: {
    afterChange: [revalidatePathsAfterChange(PATHS)],
    afterDelete: [revalidatePathsAfterDelete(PATHS)],
  },
  fields: [
    {
      name: "slug",
      type: "select",
      required: true,
      unique: true,
      options: LEGAL_SLUG_OPTIONS,
      admin: {
        readOnly: true,
        description: "Fest verdrahtet — bestimmt die URL der Seite und kann nicht geändert werden.",
      },
      validate: (value: unknown) =>
        typeof value === "string" && (LEGAL_SLUGS as readonly string[]).includes(value)
          ? true
          : "Nur impressum, datenschutz oder cookies sind erlaubt.",
    },
    {
      name: "titel",
      type: "text",
      required: true,
      admin: { description: "Überschrift der Seite und Titel im Browser-Tab." },
    },
    {
      name: "intro",
      type: "richText",
      label: "Einleitung",
      admin: { description: "Optionaler Text direkt unter der Überschrift (wird auf der Cookie-Seite genutzt)." },
    },
    {
      name: "abschnitte",
      type: "array",
      label: "Abschnitte",
      labels: { singular: "Abschnitt", plural: "Abschnitte" },
      admin: { description: "Jeder Abschnitt erscheint als eigene Karte mit kleiner Überschrift darüber." },
      fields: [
        { name: "titel", type: "text", required: true, label: "Überschrift" },
        { name: "inhalt", type: "richText", required: true, label: "Inhalt" },
      ],
    },
    {
      name: "stand",
      type: "text",
      label: "Stand",
      admin: { description: 'z.B. "Stand: Juni 2026" — erscheint klein unter der Seite.' },
    },
  ],
};
