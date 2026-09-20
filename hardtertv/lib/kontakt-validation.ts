export type KontaktFeld = "name" | "email" | "telefon" | "nachricht" | "datenschutz";

export type KontaktEingabe = {
  name: string;
  email: string;
  telefon: string;
  nachricht: string;
  datenschutz: boolean;
};

export type KontaktFeldFehler = Partial<Record<KontaktFeld, string>>;

export type KontaktValidierung =
  | { ok: true; data: { name: string; email: string; telefon: string; nachricht: string } }
  | { ok: false; error: string; fieldErrors: KontaktFeldFehler };

export const KONTAKT_LIMITS = {
  nameMin: 2,
  nameMax: 120,
  emailMax: 200,
  telefonMax: 60,
  nachrichtMin: 10,
  nachrichtMax: 5000,
};

const EMAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export function validateKontakt(eingabe: KontaktEingabe): KontaktValidierung {
  const name = eingabe.name.trim();
  const email = eingabe.email.trim();
  const telefon = eingabe.telefon.trim();
  const nachricht = eingabe.nachricht.trim();

  const fieldErrors: KontaktFeldFehler = {};

  if (name.length < KONTAKT_LIMITS.nameMin) {
    fieldErrors.name = `Bitte gib deinen Namen an (mindestens ${KONTAKT_LIMITS.nameMin} Zeichen).`;
  } else if (name.length > KONTAKT_LIMITS.nameMax) {
    fieldErrors.name = `Der Name darf höchstens ${KONTAKT_LIMITS.nameMax} Zeichen lang sein.`;
  }

  if (email.length === 0) {
    fieldErrors.email = "Bitte gib deine E-Mail-Adresse an.";
  } else if (email.length > KONTAKT_LIMITS.emailMax) {
    fieldErrors.email = "Diese E-Mail-Adresse ist zu lang.";
  } else if (!EMAIL_MUSTER.test(email)) {
    fieldErrors.email = "Diese E-Mail-Adresse sieht nicht gültig aus.";
  }

  if (telefon.length > KONTAKT_LIMITS.telefonMax) {
    fieldErrors.telefon = "Diese Telefonnummer ist zu lang.";
  }

  if (nachricht.length < KONTAKT_LIMITS.nachrichtMin) {
    fieldErrors.nachricht = `Bitte schreib uns ein paar Worte (mindestens ${KONTAKT_LIMITS.nachrichtMin} Zeichen).`;
  } else if (nachricht.length > KONTAKT_LIMITS.nachrichtMax) {
    fieldErrors.nachricht = `Die Nachricht darf höchstens ${KONTAKT_LIMITS.nachrichtMax} Zeichen lang sein.`;
  }

  if (!eingabe.datenschutz) {
    fieldErrors.datenschutz =
      "Bitte stimme der Verarbeitung deiner Daten zu — ohne Einwilligung dürfen wir deine Nachricht nicht speichern.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Bitte prüfe die markierten Felder.", fieldErrors };
  }

  return { ok: true, data: { name, email, telefon, nachricht } };
}
