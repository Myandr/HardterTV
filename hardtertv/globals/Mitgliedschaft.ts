import type { GlobalConfig } from "payload";

import { revalidateGlobalPaths } from "./hooks/revalidate";

export const Mitgliedschaft: GlobalConfig = {
  slug: "mitgliedschaft",
  label: "Mitgliedschaft (Seite)",
  admin: { group: "Seiten" },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalPaths(["/mitgliedschaft"])],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "hero",
          label: "Hero",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel (über der Überschrift)" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, label: "Einleitungstext" },
            { name: "antragButtonLabel", type: "text", required: true, label: "Beschriftung Download-Button" },
            {
              name: "antragPdf",
              type: "upload",
              relationTo: "media",
              label: "Aufnahmeantrag (PDF)",
              admin: { description: "Wird vom Button im Hero heruntergeladen." },
            },
            { name: "kontaktLinkLabel", type: "text", required: true, label: "Beschriftung Kontakt-Link" },
            { name: "kontaktEmail", type: "email", required: true, label: "E-Mail-Adresse für den Kontakt-Link" },
          ],
        },
        {
          name: "vorteile",
          label: "Vorteile & Zahlen",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            { name: "titelHinten", type: "text", label: "Überschrift – letzter Teil" },
            { name: "text", type: "textarea", required: true, label: "Einleitungstext" },
            {
              name: "liste",
              type: "array",
              label: "Vorteile",
              required: true,
              labels: { singular: "Vorteil", plural: "Vorteile" },
              fields: [{ name: "text", type: "text", required: true }],
            },
            {
              name: "stats",
              type: "array",
              label: "Zahlen-Kacheln",
              required: true,
              labels: { singular: "Kachel", plural: "Kacheln" },
              fields: [
                { name: "wert", type: "text", required: true, label: "Große Zahl" },
                { name: "label", type: "text", required: true, label: "Bezeichnung" },
                { name: "zusatz", type: "text", required: true, label: "Zusatztext" },
              ],
            },
          ],
        },
        {
          name: "dokumente",
          label: "Dokumente",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            {
              name: "karten",
              type: "array",
              label: "Dokumenten-Karten",
              required: true,
              labels: { singular: "Karte", plural: "Karten" },
              fields: [
                {
                  name: "icon",
                  type: "select",
                  required: true,
                  defaultValue: "fileText",
                  label: "Symbol",
                  options: [
                    { label: "Personen", value: "users" },
                    { label: "Stern", value: "star" },
                    { label: "Dokument", value: "fileText" },
                  ],
                },
                { name: "titel", type: "text", required: true },
                { name: "beschreibung", type: "textarea", required: true },
                { name: "datei", type: "upload", relationTo: "media", label: "PDF-Datei" },
                { name: "downloadLabel", type: "text", required: true, label: "Beschriftung Download-Button" },
                { name: "mailLabel", type: "text", label: "Beschriftung E-Mail-Button (leer = kein Button)" },
                { name: "mailAdresse", type: "email", label: "E-Mail-Adresse" },
                { name: "mailBetreff", type: "text", label: "Betreff der E-Mail" },
              ],
            },
          ],
        },
        {
          name: "prozess",
          label: "Ablauf",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            {
              name: "schritte",
              type: "array",
              label: "Schritte",
              required: true,
              labels: { singular: "Schritt", plural: "Schritte" },
              fields: [
                { name: "nr", type: "text", required: true, label: "Nummer (z.B. 01)" },
                { name: "titel", type: "text", required: true },
                { name: "text", type: "textarea", required: true },
              ],
            },
          ],
        },
        {
          name: "cta",
          label: "Abschluss-Box",
          fields: [
            { name: "titel", type: "text", required: true },
            { name: "text", type: "textarea", required: true },
            { name: "buttonLabel", type: "text", required: true, label: "Beschriftung E-Mail-Button" },
            { name: "email", type: "email", required: true },
            { name: "telefonLabel", type: "text", required: true, label: "Telefonnummer (Anzeige)" },
            {
              name: "telefonHref",
              type: "text",
              required: true,
              label: "Telefonnummer (Wählformat)",
              admin: { description: 'Wird als tel:-Link verwendet, z.B. "+4917225802099".' },
            },
          ],
        },
      ],
    },
  ],
};
