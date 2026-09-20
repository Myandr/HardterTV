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

/** Was der Nutzer eingegeben hat — wird bei Fehlern zurückgespiegelt, damit nichts verloren geht. */
export type KontaktWerte = {
  name: string;
  email: string;
  telefon: string;
  nachricht: string;
  datenschutz: boolean;
};

export const KONTAKT_LIMITS = {
  nameMin: 2,
  nameMax: 120,
  emailMax: 200,
  telefonMax: 60,
  nachrichtMin: 10,
  nachrichtMax: 5000,
};

// Identisch zur E-Mail-Prüfung von Payload (node_modules/payload/dist/fields/validations.js),
// damit eine hier akzeptierte Adresse nicht erst in payload.create scheitert.
const EMAIL_MUSTER =
  /^(?!.*\.\.)[\w!#$%&'*+/=?^`{|}~-](?:[\w!#$%&'*+/=?^`{|}~.-]*[\w!#$%&'*+/=?^`{|}~-])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;

// Steuerzeichen (Header-Injection-Hygiene). In der Nachricht bleiben Tab, LF und CR erhalten.
const STEUERZEICHEN = /[\u0000-\u001F\u007F]/g;
const STEUERZEICHEN_OHNE_UMBRUCH = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function validateKontakt(eingabe: KontaktEingabe): KontaktValidierung {
  const name = eingabe.name.replace(STEUERZEICHEN, "").trim();
  const email = eingabe.email.replace(STEUERZEICHEN, "").trim().toLowerCase();
  const telefon = eingabe.telefon.replace(STEUERZEICHEN, "").trim();
  const nachricht = eingabe.nachricht
    .replace(/\r\n?/g, "\n")
    .replace(STEUERZEICHEN_OHNE_UMBRUCH, "").trim();

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
