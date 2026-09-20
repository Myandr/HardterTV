import type { GlobalConfig } from "payload";

import { revalidateGlobalPaths } from "./hooks/revalidate";

export const Eisstock: GlobalConfig = {
  slug: "eisstock",
  label: "Eisstock (Seite)",
  admin: { group: "Seiten" },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalPaths(["/eisstock"])],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "hero",
          label: "Hero",
          fields: [
            { name: "bild", type: "upload", relationTo: "media", label: "Hintergrundbild" },
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, label: "Einleitungstext" },
            { name: "buttonLabel", type: "text", required: true, label: "Beschriftung Buchungs-Button" },
          ],
        },
        {
          name: "angebot",
          label: "Angebot",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, label: "Text rechts neben der Überschrift" },
            {
              name: "kacheln",
              type: "array",
              label: "Info-Kacheln",
              required: true,
              labels: { singular: "Kachel", plural: "Kacheln" },
              fields: [
                {
                  name: "icon",
                  type: "select",
                  required: true,
                  defaultValue: "mapPin",
                  label: "Symbol",
                  options: [
                    { label: "Ort", value: "mapPin" },
                    { label: "Personen", value: "users" },
                    { label: "Preis", value: "euro" },
                    { label: "Kalender", value: "calendarDays" },
                  ],
                },
                { name: "titel", type: "text", required: true },
                { name: "beschreibung", type: "textarea", required: true },
              ],
            },
          ],
        },
        {
          name: "galerie",
          label: "Galerie",
          fields: [
            {
              name: "bilder",
              type: "array",
              label: "Bilder",
              labels: { singular: "Bild", plural: "Bilder" },
              fields: [{ name: "bild", type: "upload", relationTo: "media", required: true }],
            },
          ],
        },
        {
          name: "buchung",
          label: "Buchung",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, label: "Text rechts neben der Überschrift" },
            {
              name: "widgetUrl",
              type: "text",
              required: true,
              defaultValue: "https://hartdertv.simplybook.it/v2/#book",
              label: "SimplyBook.me-Buchungslink",
              admin: { description: "Wird als Buchungs-Widget (iframe) eingebunden." },
            },
          ],
        },
      ],
    },
  ],
};
