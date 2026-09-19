import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import type { Payload } from "payload";

import config from "../payload.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const mediaCache = new Map<string, number>();

async function uploadMedia(payload: Payload, relPath: string, alt: string): Promise<number> {
  const cached = mediaCache.get(relPath);
  if (cached !== undefined) return cached;
  const filePath = path.resolve(dirname, "..", "public", relPath.replace(/^\//, ""));
  const doc = await payload.create({
    collection: "media",
    data: { alt },
    filePath,
    context: { disableRevalidate: true },
  });
  mediaCache.set(relPath, doc.id);
  console.log(`media uploaded: ${relPath} -> id ${doc.id}`);
  return doc.id;
}

async function run() {
  const payload = await getPayload({ config });

  // Idempotency marker: the "Dokumente" cards are only ever written by this seed.
  const current = await payload.findGlobal({ slug: "mitgliedschaft", depth: 0 });
  if ((current.dokumente?.karten?.length ?? 0) > 0) {
    console.log("skip (already seeded): mitgliedschaft");
    process.exit(0);
  }

  const aufnahmeantrag = await uploadMedia(
    payload,
    "/aufnahmeantrag.pdf",
    "Aufnahmeantrag Hardter TV (PDF)",
  );
  const schnuppercard = await uploadMedia(
    payload,
    "/HTV-SchnupperCard-Antrag 2026.pdf",
    "HTV SchnupperCard Antrag 2026 (PDF)",
  );
  const beitragsordnung = await uploadMedia(
    payload,
    "/beitragsordnung.pdf",
    "Beitragsordnung Hardter TV (PDF)",
  );

  await payload.updateGlobal({
    slug: "mitgliedschaft",
    context: { disableRevalidate: true },
    data: {
      hero: {
        eyebrow: "Mitmachen",
        titelVorne: "Werde",
        titelHighlight: "Mitglied",
        text: "Ob jung, ob alt, ob Profi oder Anfänger, ob Männlein oder Weiblein — jeder ist willkommen beim Hardter TV.",
        antragButtonLabel: "Antrag herunterladen",
        antragPdf: aufnahmeantrag,
        kontaktLinkLabel: "Fragen? Schreib uns →",
        kontaktEmail: "1.vorsitzender@hardt-tennis.de",
      },
      vorteile: {
        eyebrow: "Deine Vorteile",
        titelVorne: "Was du als",
        titelHighlight: "Mitglied",
        titelHinten: "bekommst",
        text: "Als Mitglied des Hardter TV bist du Teil einer lebendigen Tennisgemeinschaft mit allem, was dazu gehört.",
        liste: [
          { text: "Nutzung aller 6 Tennisplätze (inkl. 2 Flutlichtplätze)" },
          { text: "Teilnahme am Mannschaftsspielbetrieb" },
          { text: "Zugang zu Vereinsturnieren & Events" },
          { text: "Professionelles Training durch André Albert" },
          { text: "Aktives Vereinsleben mit Gemeinschaft" },
          { text: "Günstige Mitgliedsbeiträge für alle Altersgruppen" },
        ],
        stats: [
          { wert: "200+", label: "Aktive Mitglieder", zusatz: "aus Dorsten und Umgebung" },
          { wert: "1978", label: "Vereinsgründung", zusatz: "über 45 Jahre Tennistradition" },
          { wert: "6", label: "Tennisplätze", zusatz: "inkl. 2 Flutlichtplätze" },
        ],
      },
      dokumente: {
        eyebrow: "Dokumente",
        titelVorne: "Alle",
        titelHighlight: "Unterlagen",
        karten: [
          {
            icon: "users",
            titel: "Mitglied werden",
            beschreibung:
              "Fülle den Aufnahmeantrag aus und schick ihn per E-Mail an uns. Wir melden uns schnellstmöglich bei dir.",
            datei: aufnahmeantrag,
            downloadLabel: "Antrag herunterladen",
            mailLabel: "Per E-Mail einreichen",
            mailAdresse: "1.vorsitzender@hardt-tennis.de",
            mailBetreff: "Mitgliedschaft Hardter TV",
          },
          {
            icon: "star",
            titel: "HTV Schnuppercard",
            beschreibung:
              "Du möchtest Tennis beim HTV erst ausprobieren? Mit unserer Greencard kannst du für wenig Geld eine komplette Sommersaison schnuppern — ganz unverbindlich.",
            datei: schnuppercard,
            downloadLabel: "Schnuppercard laden",
            mailLabel: "Per E-Mail einreichen",
            mailAdresse: "1.vorsitzender@hardt-tennis.de",
            mailBetreff: "Schnuppercard Hardter TV",
          },
          {
            icon: "fileText",
            titel: "Beitragsordnung",
            beschreibung:
              "Alle Informationen zu Beiträgen, Altersgruppen und Konditionen findest du in unserer Beitragsordnung als PDF-Dokument.",
            datei: beitragsordnung,
            downloadLabel: "Beitragsordnung laden",
          },
        ],
      },
      prozess: {
        eyebrow: "Anmeldung",
        titelVorne: "So einfach",
        titelHighlight: "geht's",
        schritte: [
          {
            nr: "01",
            titel: "Antrag herunterladen",
            text: "Lade den Aufnahmeantrag oder die Schnuppercard als PDF herunter und drucke ihn aus.",
          },
          {
            nr: "02",
            titel: "Ausfüllen & unterschreiben",
            text: "Fülle den Antrag vollständig aus und unterschreibe ihn.",
          },
          {
            nr: "03",
            titel: "Einreichen",
            text: "Schick den ausgefüllten Antrag per E-Mail an 1.vorsitzender@hardt-tennis.de — fertig!",
          },
        ],
      },
      cta: {
        titel: "Noch Fragen?",
        text: "Unser 1. Vorsitzender Oliver Wiegand hilft dir gerne weiter — per E-Mail oder telefonisch.",
        buttonLabel: "E-Mail schreiben",
        email: "1.vorsitzender@hardt-tennis.de",
        telefonLabel: "0172 25 80 209 →",
        telefonHref: "+4917225802099",
      },
    },
  });

  console.log("seeded: mitgliedschaft");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
