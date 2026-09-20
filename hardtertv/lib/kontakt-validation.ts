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

export type KontaktMeldungen = {
  nameZuKurz: string;
  nameZuLang: string;
  emailFehlt: string;
  emailZuLang: string;
  emailUngueltig: string;
  telefonZuLang: string;
  nachrichtZuKurz: string;
  nachrichtZuLang: string;
  einwilligungFehlt: string;
  allgemein: string;
  speichernFehlgeschlagen: string;
};

/**
 * Ausfallsicherung: die Validierung darf nie daran scheitern, dass das Laden der
 * Meldungen aus Payload fehlschlägt. Die gepflegten Texte stehen im Global
 * "kontakt-section" (Gruppe "fehlermeldungen").
 */
export const STANDARD_MELDUNGEN: KontaktMeldungen = {
  nameZuKurz: "Bitte gib deinen Namen an (mindestens {min} Zeichen).",
  nameZuLang: "Der Name darf höchstens {max} Zeichen lang sein.",
  emailFehlt: "Bitte gib deine E-Mail-Adresse an.",
  emailZuLang: "Diese E-Mail-Adresse ist zu lang.",
  emailUngueltig: "Diese E-Mail-Adresse sieht nicht gültig aus.",
  telefonZuLang: "Diese Telefonnummer ist zu lang.",
  nachrichtZuKurz: "Bitte schreib uns ein paar Worte (mindestens {min} Zeichen).",
  nachrichtZuLang: "Die Nachricht darf höchstens {max} Zeichen lang sein.",
  einwilligungFehlt:
    "Bitte stimme der Verarbeitung deiner Daten zu — ohne Einwilligung dürfen wir deine Nachricht nicht speichern.",
  allgemein: "Bitte prüfe die markierten Felder.",
  speichernFehlgeschlagen:
    "Deine Nachricht konnte gerade nicht gespeichert werden. Bitte versuche es später noch einmal oder schreib uns direkt eine E-Mail.",
};

/** Ersetzt {min}/{max}-Platzhalter; unbekannte Platzhalter bleiben stehen. */
export function fuelleMeldung(text: string, werte: Record<string, number>): string {
  return text.replace(/\{(\w+)\}/g, (treffer, schluessel: string) =>
    schluessel in werte ? String(werte[schluessel]) : treffer,
  );
}

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

export function validateKontakt(
  eingabe: KontaktEingabe,
  meldungen: KontaktMeldungen = STANDARD_MELDUNGEN,
): KontaktValidierung {
  const name = eingabe.name.replace(STEUERZEICHEN, "").trim();
  const email = eingabe.email.replace(STEUERZEICHEN, "").trim().toLowerCase();
  const telefon = eingabe.telefon.replace(STEUERZEICHEN, "").trim();
  const nachricht = eingabe.nachricht
    .replace(/\r\n?/g, "\n")
    .replace(STEUERZEICHEN_OHNE_UMBRUCH, "").trim();

  const fieldErrors: KontaktFeldFehler = {};

  if (name.length < KONTAKT_LIMITS.nameMin) {
    fieldErrors.name = fuelleMeldung(meldungen.nameZuKurz, { min: KONTAKT_LIMITS.nameMin });
  } else if (name.length > KONTAKT_LIMITS.nameMax) {
    fieldErrors.name = fuelleMeldung(meldungen.nameZuLang, { max: KONTAKT_LIMITS.nameMax });
  }

  if (email.length === 0) {
    fieldErrors.email = meldungen.emailFehlt;
  } else if (email.length > KONTAKT_LIMITS.emailMax) {
    fieldErrors.email = meldungen.emailZuLang;
  } else if (!EMAIL_MUSTER.test(email)) {
    fieldErrors.email = meldungen.emailUngueltig;
  }

  if (telefon.length > KONTAKT_LIMITS.telefonMax) {
    fieldErrors.telefon = meldungen.telefonZuLang;
  }

  if (nachricht.length < KONTAKT_LIMITS.nachrichtMin) {
    fieldErrors.nachricht = fuelleMeldung(meldungen.nachrichtZuKurz, { min: KONTAKT_LIMITS.nachrichtMin });
  } else if (nachricht.length > KONTAKT_LIMITS.nachrichtMax) {
    fieldErrors.nachricht = fuelleMeldung(meldungen.nachrichtZuLang, { max: KONTAKT_LIMITS.nachrichtMax });
  }

  if (!eingabe.datenschutz) {
    fieldErrors.datenschutz = meldungen.einwilligungFehlt;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: meldungen.allgemein, fieldErrors };
  }

  return { ok: true, data: { name, email, telefon, nachricht } };
}
