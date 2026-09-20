"use server";

import { getPayload } from "payload";
import config from "@payload-config";

import { validateKontakt, type KontaktFeldFehler } from "@/lib/kontakt-validation";

export type KontaktResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: KontaktFeldFehler };

/** Schneller als das ist kein Mensch — dann ist es ein Bot. */
const MINDESTDAUER_MS = 2000;

export async function sendeKontaktanfrage(
  _prev: KontaktResult | null,
  formData: FormData,
): Promise<KontaktResult> {
  // 1. Honeypot: ein für Menschen unsichtbares Feld. Ausgefüllt = Bot.
  //    Wir melden trotzdem Erfolg, damit der Bot nichts lernt — speichern aber nichts.
  if (String(formData.get("website") ?? "").trim().length > 0) {
    return { ok: true };
  }

  // 2. Zeitfalle: das Formular wurde in unter 2 Sekunden abgeschickt.
  //    Fehlt der Wert (kein JavaScript), wird die Prüfung übersprungen.
  const gestartetAm = Number(formData.get("gestartetAm"));
  if (
    Number.isFinite(gestartetAm) &&
    gestartetAm > 0 &&
    Date.now() - gestartetAm < MINDESTDAUER_MS
  ) {
    return { ok: true };
  }

  // 3. Serverseitige Validierung.
  const validierung = validateKontakt({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    telefon: String(formData.get("telefon") ?? ""),
    nachricht: String(formData.get("message") ?? ""),
    datenschutz: formData.get("datenschutz") != null,
  });

  if (!validierung.ok) {
    return { ok: false, error: validierung.error, fieldErrors: validierung.fieldErrors };
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
    // Nur die Fehlerklasse loggen — keine Inhalte, keine E-Mail-Adressen.
    console.error(
      "[kontakt] Anfrage konnte nicht gespeichert werden:",
      error instanceof Error ? error.name : "unbekannter Fehler",
    );
    return {
      ok: false,
      error:
        "Deine Nachricht konnte gerade nicht gespeichert werden. Bitte versuche es später noch einmal oder schreib uns direkt eine E-Mail.",
    };
  }

  return { ok: true };
}
