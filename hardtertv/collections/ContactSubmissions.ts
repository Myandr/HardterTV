import type { Access, CollectionConfig } from "payload";

const isAuthenticated: Access = ({ req }) => Boolean(req.user);
const isAdmin: Access = ({ req }) => req.user?.role === "admin";

export const ContactSubmissions: CollectionConfig = {
  slug: "contact-submissions",
  labels: { singular: "Kontaktanfrage", plural: "Kontaktanfragen" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "gelesen", "createdAt"],
    group: "Kontakt",
    description:
      "Nachrichten aus dem Kontaktformular. Personenbezogene Daten — nur für angemeldete Benutzer sichtbar.",
  },
  defaultSort: "-createdAt",
  access: {
    // Anlegen ausschließlich über die Server Action (Local API, overrideAccess: true).
    // Über REST/GraphQL ist das Anlegen für alle gesperrt.
    create: () => false,
    read: isAuthenticated,
    update: isAuthenticated,
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      maxLength: 120,
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "email",
      type: "email",
      required: true,
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "telefon",
      type: "text",
      maxLength: 60,
      access: { update: () => false },
      admin: { readOnly: true, description: "Wird vom aktuellen Formular nicht abgefragt." },
    },
    {
      name: "nachricht",
      type: "textarea",
      required: true,
      maxLength: 5000,
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "einwilligung",
      type: "checkbox",
      required: true,
      label: "Einwilligung in die Datenverarbeitung",
      validate: (value) =>
        value === true ||
        "Ohne Einwilligung in die Datenverarbeitung darf die Anfrage nicht gespeichert werden.",
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "einwilligungAm",
      type: "date",
      required: true,
      label: "Einwilligung erteilt am",
      access: { update: () => false },
      admin: {
        readOnly: true,
        date: { pickerAppearance: "dayAndTime", displayFormat: "dd.MM.yyyy HH:mm" },
      },
    },
    {
      name: "gelesen",
      type: "checkbox",
      defaultValue: false,
      label: "Gelesen / bearbeitet",
    },
  ],
};
