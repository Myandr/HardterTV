import type { GlobalConfig } from "payload";

import { revalidateGlobalLayout } from "./hooks/revalidate";

export const CookieTexteGlobal: GlobalConfig = {
  slug: "cookie-texte",
  label: "Cookie-Hinweis & Einwilligung",
  admin: {
    group: "Seitenweit",
    description: "Diese Texte sind datenschutzrechtlich relevant. Bitte nur nach Rücksprache ändern.",
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalLayout()],
  },
  fields: [
    {
      name: "banner",
      type: "group",
      label: "Cookie-Banner",
      fields: [
        { name: "titel", type: "text", required: true, maxLength: 80 },
        { name: "textVor", type: "textarea", required: true, maxLength: 500, label: "Text vor dem Link" },
        {
          name: "linkText",
          type: "text",
          required: true,
          maxLength: 60,
          admin: { description: "Verlinkt immer auf /datenschutz." },
        },
        { name: "textNach", type: "text", required: true, maxLength: 40, label: "Text nach dem Link" },
        { name: "alleAkzeptierenLabel", type: "text", required: true, maxLength: 60 },
        { name: "auswahlSpeichernLabel", type: "text", required: true, maxLength: 60 },
        { name: "einstellungenLabel", type: "text", required: true, maxLength: 60 },
        { name: "nurNotwendigeLabel", type: "text", required: true, maxLength: 60 },
      ],
    },
    {
      name: "seite",
      type: "group",
      label: "Seite „Cookie-Einstellungen“",
      fields: [
        { name: "speichernLabel", type: "text", required: true, maxLength: 60 },
        { name: "gespeichertLabel", type: "text", required: true, maxLength: 60 },
        { name: "alleAkzeptierenLabel", type: "text", required: true, maxLength: 60 },
        { name: "nurNotwendigeLabel", type: "text", required: true, maxLength: 60 },
      ],
    },
    {
      name: "kategorien",
      type: "array",
      required: true,
      maxRows: 3,
      label: "Kategorien",
      labels: { singular: "Kategorie", plural: "Kategorien" },
      fields: [
        {
          name: "schluessel",
          type: "select",
          required: true,
          label: "Kategorie",
          options: [
            { label: "Notwendige Cookies", value: "notwendig" },
            { label: "Google Maps", value: "maps" },
            { label: "Analyse", value: "analyse" },
          ],
        },
        { name: "titel", type: "text", required: true, maxLength: 80 },
        { name: "bannerBeschreibung", type: "textarea", required: true, maxLength: 400, label: "Beschreibung im Banner" },
        { name: "seiteBeschreibung", type: "textarea", required: true, maxLength: 600, label: "Beschreibung auf der Einstellungsseite" },
        { name: "seiteFussnote", type: "text", required: true, maxLength: 300, label: "Fußnote auf der Einstellungsseite" },
        {
          name: "toggleAriaLabel",
          type: "text",
          maxLength: 80,
          label: "Beschriftung des Schalters (Screenreader)",
          admin: { description: "Nicht bei „Notwendige Cookies“ — dort gibt es keinen Schalter." },
        },
      ],
    },
    {
      name: "maps",
      type: "group",
      label: "Kartenplatzhalter (Kontaktbereich)",
      fields: [
        { name: "titel", type: "text", required: true, maxLength: 80 },
        { name: "text", type: "textarea", required: true, maxLength: 300 },
        {
          name: "buttonLabel",
          type: "text",
          required: true,
          maxLength: 60,
          admin: { description: "Verlinkt immer auf /cookies." },
        },
      ],
    },
  ],
};
