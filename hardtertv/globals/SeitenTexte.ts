import type { GlobalConfig } from "payload";

import { VORSTAND_GRUPPEN } from "../lib/vorstand-gruppen";
import { revalidateGlobalLayout } from "./hooks/revalidate";

const TEAM_KATEGORIEN = [
  { label: "Herren", value: "Herren" },
  { label: "Damen", value: "Damen" },
  { label: "Gemischt", value: "Gemischt" },
];

export const SeitenTexte: GlobalConfig = {
  slug: "seiten-texte",
  label: "Seitentexte (Unterseiten)",
  admin: {
    group: "Seiten",
    description:
      "Überschriften und Einleitungen der Unterseiten. Die Inhalte selbst (Vorstandsmitglieder, Termine, Bilder, Mannschaften) werden in den jeweiligen Sammlungen gepflegt.",
  },
  access: {
    read: () => true,
  },
  hooks: {
    // Diese Texte stehen auf sieben festen Seiten UND auf der dynamischen Route
    // /mannschaften/[slug]. Layout-weit invalidieren ist hier der sichere Weg.
    afterChange: [revalidateGlobalLayout()],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "vorstand",
          label: "Vorstand",
          fields: [
            { name: "eyebrow", type: "text", required: true, maxLength: 60, label: "Kleiner Titel über der Überschrift" },
            { name: "titelVorne", type: "text", required: true, maxLength: 60, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, maxLength: 60, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, maxLength: 600, label: "Einleitungstext" },
            {
              name: "badgeSuffix",
              type: "text",
              required: true,
              maxLength: 40,
              label: "Beschriftung der Personen-Zahl",
              admin: { description: 'Die Zahl wird automatisch davorgesetzt, z. B. "17 Mitglieder".' },
            },
            {
              name: "gruppen",
              type: "array",
              required: true,
              minRows: 1,
              maxRows: VORSTAND_GRUPPEN.length,
              label: "Gruppen",
              labels: { singular: "Gruppe", plural: "Gruppen" },
              admin: {
                description:
                  "Reihenfolge der Zeilen = Reihenfolge der Abschnitte auf der Seite. Gruppen ohne Mitglieder werden nicht angezeigt.",
              },
              fields: [
                {
                  name: "gruppe",
                  type: "select",
                  required: true,
                  label: "Gruppe",
                  options: VORSTAND_GRUPPEN.map((g) => ({ label: g.adminLabel, value: g.value })),
                },
                { name: "titel", type: "text", required: true, maxLength: 80, label: "Überschrift" },
                { name: "beschreibung", type: "textarea", required: true, maxLength: 400, label: "Beschreibung" },
              ],
            },
            { name: "ctaTitel", type: "text", required: true, maxLength: 120, label: "Aufruf am Seitenende: Überschrift" },
            { name: "ctaText", type: "textarea", required: true, maxLength: 400, label: "Aufruf am Seitenende: Text" },
            { name: "ctaButtonLabel", type: "text", required: true, maxLength: 60, label: "Aufruf am Seitenende: Button" },
            { name: "ctaEmail", type: "email", required: true, label: "Aufruf am Seitenende: E-Mail-Adresse" },
          ],
        },
        {
          name: "kalender",
          label: "Kalender",
          fields: [
            { name: "eyebrow", type: "text", required: true, maxLength: 60, label: "Kleiner Titel über der Überschrift" },
            { name: "titelVorne", type: "text", required: true, maxLength: 60, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, maxLength: 60, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, maxLength: 600, label: "Einleitungstext" },
            { name: "monatsansichtLabel", type: "text", required: true, maxLength: 40, label: "Umschalter: Monatsansicht" },
            { name: "listenansichtLabel", type: "text", required: true, maxLength: 40, label: "Umschalter: Listenansicht" },
            { name: "filterAlleLabel", type: "text", required: true, maxLength: 40, label: 'Filter: "alle Kategorien"' },
            { name: "ausgewaehlterTagLabel", type: "text", required: true, maxLength: 60, label: "Seitenleiste: ausgewählter Tag" },
            { name: "naechsteTermineLabel", type: "text", required: true, maxLength: 60, label: "Seitenleiste: nächste Termine" },
            { name: "keineTermineTag", type: "text", required: true, maxLength: 120, label: "Hinweis: keine Termine an diesem Tag" },
            { name: "keineTermineListe", type: "text", required: true, maxLength: 120, label: "Hinweis: keine Termine gefunden" },
            {
              name: "uhrzeitSuffix",
              type: "text",
              required: true,
              maxLength: 20,
              label: "Zusatz hinter der Uhrzeit",
              admin: { description: 'Steht hinter jeder Uhrzeit, z. B. "Uhr".' },
            },
          ],
        },
        {
          name: "galerie",
          label: "Galerie",
          fields: [
            { name: "eyebrow", type: "text", required: true, maxLength: 60, label: "Kleiner Titel über der Überschrift" },
            { name: "titelVorne", type: "text", required: true, maxLength: 60, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, maxLength: 60, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, maxLength: 600, label: "Einleitungstext" },
            {
              name: "bilderSuffix",
              type: "text",
              required: true,
              maxLength: 40,
              label: "Beschriftung der Bilder-Zahl",
              admin: { description: 'Die Zahl wird automatisch davorgesetzt, z. B. "84 Bilder".' },
            },
            { name: "leerText", type: "text", required: true, maxLength: 200, label: "Hinweis, wenn keine Bilder online sind" },
          ],
        },
        {
          name: "mannschaften",
          label: "Mannschaften (Übersicht)",
          fields: [
            { name: "eyebrow", type: "text", required: true, maxLength: 60, label: "Kleiner Titel über der Überschrift" },
            { name: "titelVorne", type: "text", required: true, maxLength: 60, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, maxLength: 60, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, maxLength: 600, label: "Einleitungstext" },
            {
              name: "kategorien",
              type: "array",
              required: true,
              minRows: 1,
              maxRows: 3,
              label: "Kategorien",
              labels: { singular: "Kategorie", plural: "Kategorien" },
              admin: {
                description:
                  "Beschriftungen für die drei Reiter. Die Zuordnung der Teams passiert in der Sammlung Mannschaften.",
              },
              fields: [
                { name: "kategorie", type: "select", required: true, options: TEAM_KATEGORIEN, label: "Kategorie" },
                { name: "reiterLabel", type: "text", required: true, maxLength: 40, label: "Beschriftung des Reiters" },
                { name: "listenEyebrow", type: "text", required: true, maxLength: 40, label: "Kleiner Titel über der Liste" },
                {
                  name: "badgeSuffix",
                  type: "text",
                  required: true,
                  maxLength: 40,
                  label: "Beschriftung der Zahl im Hero",
                  admin: { description: 'Die Zahl wird automatisch davorgesetzt, z. B. "9 Herren-Teams".' },
                },
              ],
            },
            {
              name: "teamsSuffix",
              type: "text",
              required: true,
              maxLength: 40,
              label: "Beschriftung der Team-Zahl über der Liste",
              admin: { description: 'Die Zahl wird automatisch davorgesetzt, z. B. "9 Teams".' },
            },
            { name: "kartenUntertitel", type: "text", required: true, maxLength: 60, label: "Untertitel auf jeder Mannschaftskarte" },
            { name: "kontaktEyebrow", type: "text", required: true, maxLength: 60, label: "Kontaktblock: kleiner Titel" },
            { name: "kontaktTitelVorne", type: "text", required: true, maxLength: 60, label: "Kontaktblock: Überschrift – erster Teil" },
            { name: "kontaktTitelHighlight", type: "text", required: true, maxLength: 60, label: "Kontaktblock: Überschrift – unterstrichener Teil" },
            { name: "kontaktText", type: "textarea", required: true, maxLength: 400, label: "Kontaktblock: Text" },
            { name: "kontaktLabel", type: "text", required: true, maxLength: 60, label: "Kontaktblock: Funktionsbezeichnung" },
            { name: "kontaktTelefon", type: "text", required: true, maxLength: 40, label: "Kontaktblock: Telefonnummer (Anzeige)" },
            {
              name: "kontaktTelefonHref",
              type: "text",
              required: true,
              maxLength: 60,
              label: "Kontaktblock: Telefonnummer (Anruf-Link)",
              admin: { description: 'Technische Schreibweise, z. B. "tel:+4915153553355".' },
            },
            { name: "kontaktEmail", type: "email", required: true, label: "Kontaktblock: E-Mail-Adresse" },
          ],
        },
        {
          name: "mannschaftDetail",
          label: "Mannschaften (Detailseite)",
          fields: [
            { name: "zurueckLabel", type: "text", required: true, maxLength: 60, label: "Zurück-Link" },
            {
              name: "saisonLabel",
              type: "text",
              required: true,
              maxLength: 60,
              label: "Saison-Angabe über den Kontaktdaten",
            },
            { name: "vereinBadge", type: "text", required: true, maxLength: 40, label: "Badge links" },
            { name: "verbandBadge", type: "text", required: true, maxLength: 40, label: "Badge rechts" },
            { name: "ligaEyebrow", type: "text", required: true, maxLength: 60, label: "Ligabereich: kleiner Titel" },
            { name: "ligaTitel", type: "text", required: true, maxLength: 80, label: "Ligabereich: Überschrift" },
            {
              name: "ligaSaisonLabel",
              type: "text",
              required: true,
              maxLength: 60,
              label: "Ligabereich: Saison-Angabe neben dem Mannschaftsnamen",
              admin: {
                description:
                  'Erscheint als "<Mannschaft> – <Angabe>" und zusätzlich in der Seitenbeschreibung für Suchmaschinen.',
              },
            },
            { name: "ligaQuelle", type: "text", required: true, maxLength: 60, label: "Ligabereich: Quellenangabe rechts" },
            { name: "abschlussText", type: "text", required: true, maxLength: 120, label: "Text über dem Zurück-Link am Seitenende" },
          ],
        },
        {
          name: "rechtliches",
          label: "Rechtliche Seiten",
          fields: [
            {
              name: "zurueckLabel",
              type: "text",
              required: true,
              maxLength: 60,
              label: "Zurück-Link auf Impressum und Datenschutz",
            },
            { name: "cookiesEyebrow", type: "text", required: true, maxLength: 60, label: "Cookie-Seite: kleiner Titel" },
            {
              name: "cookiesTitelVorne",
              type: "text",
              required: true,
              maxLength: 60,
              label: "Cookie-Seite: Überschrift – erster Teil",
              admin: { description: 'Wird ohne Leerzeichen an den zweiten Teil gehängt (aktuell "Cookie-" + "Einstellungen").' },
            },
            { name: "cookiesTitelHighlight", type: "text", required: true, maxLength: 60, label: "Cookie-Seite: Überschrift – unterstrichener Teil" },
          ],
        },
      ],
    },
  ],
};
