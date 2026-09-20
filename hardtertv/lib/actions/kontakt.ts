"use server";

import { getPayload, ValidationError } from "payload";
import config from "@payload-config";

import { validateKontakt, type KontaktFeldFehler, type KontaktWerte } from "@/lib/kontakt-validation";

export type KontaktResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: KontaktFeldFehler; values: KontaktWerte };

/** Schneller als das ist kein Mensch — dann ist es ein Bot. */
const MINDESTDAUER_MS = 2000;

export async function sendeKontaktanfrage(
  _prev: KontaktResult | null,
  formData: FormData,
): Promise<KontaktResult> {
  // 1. Honeypot: ein für Menschen unsichtbares Feld (Name bewusst kein Autofill-Kandidat).
  //    Ausgefüllt = Bot. Wir melden trotzdem Erfolg, damit der Bot nichts lernt —
  //    speichern aber nichts. Geloggt wird nur das Ereignis, nie Inhalte.
  if (String(formData.get("htv_hinweis") ?? "").trim().length > 0) {
    console.warn("[kontakt] Anfrage verworfen: honeypot");
    return { ok: true };
  }

  // 2. Zeitfalle: das Formular wurde in unter 2 Sekunden abgeschickt.
  //    Fail-open: fehlender/ungültiger Wert (kein JavaScript) oder ein Zeitstempel in der
  //    Zukunft (falsch gehende Uhr des Besuchers) überspringt die Prüfung. Nur 0 <= Delta < 2 s
  //    gilt als Bot. Eine Obergrenze gibt es bewusst nicht (lange offene Seite ist normal).
  const gestartetAm = Number(formData.get("gestartetAm"));
  if (Number.isFinite(gestartetAm) && gestartetAm > 0) {
    const delta = Date.now() - gestartetAm;
    if (delta >= 0 && delta < MINDESTDAUER_MS) {
      console.warn("[kontakt] Anfrage verworfen: zu schnell");
      return { ok: true };
    }
  }

  // 3. Serverseitige Validierung.
  const eingabe = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    telefon: String(formData.get("telefon") ?? ""),
    nachricht: String(formData.get("message") ?? ""),
    datenschutz: formData.get("datenschutz") != null,
  };
  // Nur die Nutzerfelder werden zurückgespiegelt — niemals Honeypot oder Zeitstempel.
  const values: KontaktWerte = { ...eingabe };

  const validierung = validateKontakt(eingabe);

  if (!validierung.ok) {
    return {
      ok: false,
      error: validierung.error,
      fieldErrors: validierung.fieldErrors,
      values,
    };
  }

  // 4. Speichern über die Local API. Die Sammlung sperrt `create` für REST/GraphQL
  //    bewusst (create: () => false); deshalb ist overrideAccess: true hier
  //    ausdrücklich gesetzt — nur so kann die Server Action speichern.
  //    Keine IP, kein User-Agent, keine weiteren Metadaten (Datenminimierung).
  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "contact-submissions",
      overrideAccess: true,
      data: {
        name: validierung.data.name,
        email: validierung.data.email,
        telefon: validierung.data.telefon.length > 0 ? validierung.data.telefon : undefined,
        nachricht: validierung.data.nachricht,
        einwilligung: true,
        // Serverseitig erzeugt — niemals vom Client übernommen.
        einwilligungAm: new Date().toISOString(),
        gelesen: false,
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      // Payload-Validierung: Meldung enthält nur Feldnamen, keine Werte.
      console.error("[kontakt] Payload-Validierung fehlgeschlagen:", error.name, error.message);
      const emailBetroffen = error.data?.errors?.some((e) => e.path === "email") ?? false;
      if (emailBetroffen) {
        return {
          ok: false,
          error: "Bitte prüfe die markierten Felder.",
          fieldErrors: { email: "Diese E-Mail-Adresse sieht nicht gültig aus." },
          values,
        };
      }
    } else {
      // Nur die Fehlerklasse loggen — keine Inhalte, keine E-Mail-Adressen.
      console.error(
        "[kontakt] Anfrage konnte nicht gespeichert werden:",
        error instanceof Error ? error.name : "unbekannter Fehler",
      );
    }
    return {
      ok: false,
      error:
        "Deine Nachricht konnte gerade nicht gespeichert werden. Bitte versuche es später noch einmal oder schreib uns direkt eine E-Mail.",
      values,
    };
  }

  return { ok: true };
}
