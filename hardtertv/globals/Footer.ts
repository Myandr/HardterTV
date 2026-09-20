import type { GlobalConfig } from "payload";

import { INTERNE_LINKS } from "../lib/interne-links";
import { revalidateGlobalLayout } from "./hooks/revalidate";

export const FooterGlobal: GlobalConfig = {
  slug: "footer",
  label: "Footer & Kontaktdaten",
  admin: {
    group: "Seitenweit",
    description:
      "Diese Daten erscheinen im Footer jeder Seite, im Instagram-Banner und im Kontaktbereich der Startseite.",
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalLayout()],
  },
  fields: [
    { name: "vereinsname", type: "text", required: true, maxLength: 80 },
    {
      name: "beschreibung",
      type: "textarea",
      required: true,
      maxLength: 300,
      label: "Kurzbeschreibung im Footer",
    },
    { name: "strasse", type: "text", required: true, maxLength: 120, label: "Straße und Hausnummer" },
    { name: "plz", type: "text", required: true, maxLength: 10, label: "PLZ" },
    { name: "ort", type: "text", required: true, maxLength: 80, label: "Ort" },
    { name: "email", type: "email", required: true, label: "Allgemeine E-Mail-Adresse" },
    {
      name: "telefonLabel",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Beschriftung der Telefonnummer",
      admin: { description: 'Steht im Kontaktbereich über der Nummer, z. B. "Vorsitzender".' },
    },
    { name: "telefon", type: "text", required: true, maxLength: 40, label: "Telefonnummer (Anzeige)" },
    {
      name: "telefonHref",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Telefonnummer (Anruf-Link)",
      admin: { description: 'Technische Schreibweise, z. B. "tel:+491722580209".' },
    },
    {
      name: "kontaktpersonen",
      type: "array",
      label: "Kontaktpersonen im Footer",
      labels: { singular: "Person", plural: "Personen" },
      fields: [
        { name: "label", type: "text", required: true, maxLength: 60, label: "Funktion" },
        { name: "name", type: "text", required: true, maxLength: 80 },
        { name: "email", type: "email", required: true, label: "E-Mail für den Link" },
      ],
    },
    { name: "funFactTitel", type: "text", required: true, maxLength: 60 },
    { name: "funFact", type: "textarea", required: true, maxLength: 600, label: "Fun Fact" },
    {
      name: "shop",
      type: "group",
      label: "Shop-Hinweis",
      fields: [
        { name: "textVor", type: "text", required: true, maxLength: 80, label: "Text vor dem Link" },
        { name: "linkText", type: "text", required: true, maxLength: 60, label: "Linktext" },
        { name: "url", type: "text", required: true, maxLength: 500, label: "Shop-Adresse" },
        { name: "textNach", type: "text", required: true, maxLength: 120, label: "Text nach dem Link" },
      ],
    },
    {
      name: "instagram",
      type: "group",
      label: "Instagram",
      fields: [
        { name: "handle", type: "text", required: true, maxLength: 60, admin: { description: 'Mit @, z. B. "@hardtertv".' } },
        { name: "url", type: "text", required: true, maxLength: 500, label: "Profil-Adresse" },
        { name: "ctaEyebrow", type: "text", required: true, maxLength: 60, label: "Banner: kleine Überschrift" },
        { name: "ctaHeadline", type: "text", required: true, maxLength: 120, label: "Banner: Überschrift" },
        {
          name: "ctaText",
          type: "textarea",
          required: true,
          maxLength: 300,
          label: "Banner: Text",
          admin: { description: "Der Instagram-Name wird automatisch dahinter gesetzt." },
        },
      ],
    },
    {
      name: "copyrightName",
      type: "text",
      required: true,
      maxLength: 80,
      label: "Name in der Copyright-Zeile",
      admin: { description: "Das Jahr wird automatisch eingesetzt." },
    },
    { name: "schnelleLinksTitel", type: "text", required: true, maxLength: 60, label: "Überschrift der Linkspalte" },
    {
      name: "schnelleLinks",
      type: "array",
      required: true,
      label: "Schnelle Links",
      labels: { singular: "Link", plural: "Links" },
      fields: [
        { name: "label", type: "text", required: true, maxLength: 60 },
        { name: "ziel", type: "select", required: true, options: INTERNE_LINKS },
      ],
    },
    { name: "kontaktTitel", type: "text", required: true, maxLength: 60, label: "Überschrift der Kontaktspalte" },
    { name: "emailLabel", type: "text", required: true, maxLength: 60, label: "Beschriftung über der E-Mail-Adresse" },
    {
      name: "copyrightZusatz",
      type: "text",
      required: true,
      maxLength: 120,
      admin: { description: "Steht hinter Jahr und Vereinsname." },
    },
    {
      name: "rechtlicheLinks",
      type: "array",
      required: true,
      maxRows: 6,
      label: "Rechtliche Links",
      labels: { singular: "Link", plural: "Links" },
      fields: [
        { name: "label", type: "text", required: true, maxLength: 60 },
        { name: "ziel", type: "select", required: true, options: INTERNE_LINKS },
      ],
    },
  ],
};
