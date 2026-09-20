import type { GlobalConfig } from "payload";

import { revalidateGlobalPaths } from "./hooks/revalidate";

export const Training: GlobalConfig = {
  slug: "training",
  label: "Training (Seite)",
  admin: { group: "Seiten" },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalPaths(["/training"])],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "hero",
          label: "Hero",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, label: "Einleitungstext" },
            { name: "buttonLabel", type: "text", required: true, label: "Beschriftung Anruf-Button" },
            {
              name: "telefonHref",
              type: "text",
              required: true,
              label: "Telefonnummer (Wählformat)",
              admin: { description: 'Wird als tel:-Link verwendet, z.B. "+4917559049030".' },
            },
          ],
        },
        {
          name: "trainer",
          label: "Trainer",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "foto", type: "upload", relationTo: "media", label: "Foto des Trainers" },
            { name: "badge", type: "text", required: true, label: "Text auf dem Foto-Badge" },
            { name: "name", type: "text", required: true },
            { name: "rolle", type: "text", required: true, label: "Funktion" },
            {
              name: "bio",
              type: "textarea",
              required: true,
              label: "Beschreibung",
              admin: { description: "Leerzeile = neuer Absatz." },
            },
            {
              name: "fakten",
              type: "array",
              label: "Eckdaten",
              required: true,
              labels: { singular: "Eckdatum", plural: "Eckdaten" },
              fields: [
                { name: "wert", type: "text", required: true, label: "Wert" },
                { name: "label", type: "text", required: true, label: "Bezeichnung" },
              ],
            },
            { name: "telefonLabel", type: "text", required: true, label: "Telefonnummer (Anzeige)" },
            { name: "telefonHref", type: "text", required: true, label: "Telefonnummer (Wählformat)" },
          ],
        },
        {
          name: "angebote",
          label: "Angebote",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, label: "Text rechts neben der Überschrift" },
            {
              name: "karten",
              type: "array",
              label: "Angebots-Karten",
              required: true,
              labels: { singular: "Angebot", plural: "Angebote" },
              fields: [
                {
                  name: "icon",
                  type: "select",
                  required: true,
                  defaultValue: "star",
                  label: "Symbol",
                  options: [
                    { label: "Person mit Haken", value: "userCheck" },
                    { label: "Personen", value: "users" },
                    { label: "Pokal", value: "trophy" },
                    { label: "Hantel", value: "dumbbell" },
                    { label: "Stern", value: "star" },
                    { label: "Kalender", value: "calendar" },
                  ],
                },
                { name: "titel", type: "text", required: true },
                { name: "beschreibung", type: "textarea", required: true },
              ],
            },
          ],
        },
        {
          name: "halle",
          label: "Halle",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, label: "Beschreibung" },
            {
              name: "stats",
              type: "array",
              label: "Zahlen",
              required: true,
              labels: { singular: "Zahl", plural: "Zahlen" },
              fields: [
                { name: "wert", type: "text", required: true },
                { name: "label", type: "text", required: true },
              ],
            },
            { name: "websiteLabel", type: "text", required: true, label: "Beschriftung Website-Button" },
            { name: "websiteUrl", type: "text", required: true, label: "Website der Halle" },
            { name: "anrufLabel", type: "text", required: true, label: "Beschriftung Anruf-Link" },
            { name: "telefonHref", type: "text", required: true, label: "Telefonnummer (Wählformat)" },
            { name: "standortTitel", type: "text", required: true, label: "Überschrift Standort-Box" },
            {
              name: "adresse",
              type: "textarea",
              required: true,
              label: "Adresse",
              admin: { description: "Jede Zeile wird als eigene Zeile ausgegeben." },
            },
            { name: "kontaktTitel", type: "text", required: true, label: "Überschrift Kontakt-Box" },
            { name: "kontaktText", type: "textarea", required: true, label: "Text der Kontakt-Box" },
            { name: "kontaktTelefonLabel", type: "text", label: "Telefonnummer (Anzeige)" },
            { name: "kontaktTelefonHref", type: "text", label: "Telefonnummer (Wählformat)" },
            { name: "kontaktEmail", type: "email", label: "E-Mail-Adresse (leer = kein E-Mail-Link)" },
          ],
        },
        {
          name: "cta",
          label: "Abschluss-Box",
          fields: [
            { name: "titel", type: "text", required: true },
            { name: "text", type: "textarea", required: true },
            { name: "buttonLabel", type: "text", required: true, label: "Beschriftung Anruf-Button" },
            { name: "telefonHref", type: "text", required: true, label: "Telefonnummer (Wählformat)" },
            { name: "zurueckLabel", type: "text", required: true, label: "Beschriftung Link zur Startseite" },
          ],
        },
      ],
    },
  ],
};
