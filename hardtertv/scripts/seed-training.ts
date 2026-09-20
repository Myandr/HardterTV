import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import type { Payload } from "payload";

import config from "../payload.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

async function uploadMedia(payload: Payload, relPath: string, alt: string): Promise<number> {
  const filePath = path.resolve(dirname, "..", "public", relPath.replace(/^\//, ""));
  const doc = await payload.create({
    collection: "media",
    data: { alt },
    filePath,
    context: { disableRevalidate: true },
  });
  console.log(`media uploaded: ${relPath} -> id ${doc.id}`);
  return doc.id;
}

async function run() {
  const payload = await getPayload({ config });

  // Idempotency marker: the "Angebote" cards are only ever written by this seed.
  const current = await payload.findGlobal({ slug: "training", depth: 0 });
  if ((current.angebote?.karten?.length ?? 0) > 0) {
    console.log("skip (already seeded): training");
    process.exit(0);
  }

  const foto = await uploadMedia(payload, "/images/Andre Albert_1.JPG", "André Albert – Tennislehrer");

  await payload.updateGlobal({
    slug: "training",
    context: { disableRevalidate: true },
    data: {
      hero: {
        eyebrow: "Training",
        titelVorne: "Tennisschule",
        titelHighlight: "André Albert",
        text: "Wir l(i)eben Tennis – das ist das Motto von André Albert und dem Team seiner Tennisschule, mit dem er seit 2005 unseren Verein betreut.",
        buttonLabel: "Jetzt anrufen",
        telefonHref: "+4917559049030",
      },
      trainer: {
        eyebrow: "Euer Trainer",
        foto,
        badge: "Seit 2005 beim HTV",
        name: "André Albert",
        rolle: "Tennislehrer & Vereinstrainer",
        bio:
          "André Albert ist seit 2005 selbstständiger Tennislehrer und betreut den Hardter Tennisverein mit vollem Einsatz. Als ehemaliger Leistungsspieler mit Deutschlandranking bringt er nicht nur technisches Know-how, sondern auch die Leidenschaft für das Spiel mit.\n\nMit seiner B-Trainer-Lizenz des Deutschen Tennisbundes und jahrelanger Erfahrung bietet er maßgeschneidertes Training für Anfänger, Fortgeschrittene und ambitionierte Wettkampfspieler.",
        fakten: [
          { wert: "2005", label: "Selbstständig seit" },
          { wert: "B-Lizenz", label: "DTB Trainer" },
        ],
        telefonLabel: "0175 59 04 903",
        telefonHref: "+4917559049030",
      },
      angebote: {
        eyebrow: "Was wir anbieten",
        titelVorne: "Unsere",
        titelHighlight: "Trainingsangebote",
        text: "Für jedes Alter und jedes Niveau — von der ersten Schnupperstunde bis zum Turnierspieler.",
        karten: [
          {
            icon: "userCheck",
            titel: "Einzelstunden",
            beschreibung: "Individuelles Training abgestimmt auf dein Spielniveau und deine Ziele.",
          },
          {
            icon: "users",
            titel: "Gruppentraining",
            beschreibung: "Gemeinsam mehr Spaß — Training in kleinen Gruppen für alle Altersklassen.",
          },
          {
            icon: "trophy",
            titel: "Mannschaftstraining",
            beschreibung: "Vorbereitung für Vereinsmannschaften auf den Wettkampf.",
          },
          {
            icon: "dumbbell",
            titel: "Spielvorbereitung",
            beschreibung: "Gezielte Einheiten zur taktischen und technischen Matchvorbereitung.",
          },
          {
            icon: "star",
            titel: "Turnierbegleitung",
            beschreibung: "Coaching und Unterstützung bei Turnieren auf allen Niveaus.",
          },
          {
            icon: "calendar",
            titel: "Schnupperstunden",
            beschreibung:
              "Noch nie Tennis gespielt? Lern das Spiel bei einer unverbindlichen Schnupperstunde kennen.",
          },
        ],
      },
      halle: {
        eyebrow: "Anlage",
        titelVorne: "Tennishalle",
        titelHighlight: "Kirchhellen",
        text: "Seit dem 1. Oktober 2022 leitet André Albert auch die Tennishalle Kirchhellen. Die Halle bietet vier Plätze — drei Sandplätze und einen Teppichplatz — und ist damit die ideale Ergänzung für ganzjähriges Training.",
        stats: [
          { wert: "4", label: "Plätze gesamt" },
          { wert: "3", label: "Sandplätze" },
          { wert: "1", label: "Teppichplatz" },
        ],
        websiteLabel: "Zur Website der Halle",
        websiteUrl: "https://www.tennishalle-kirchhellen.com",
        anrufLabel: "Direkt anrufen →",
        telefonHref: "+4917559049030",
        standortTitel: "Standort",
        adresse: "Gahlener Str. 204\n46284 Dorsten",
        kontaktTitel: "Kontakt",
        kontaktText:
          "Ruf André direkt an oder schreib uns eine E-Mail — wir melden uns schnellstmöglich.",
        kontaktTelefonLabel: "0175 59 04 903",
        kontaktTelefonHref: "+4917559049030",
        kontaktEmail: "1.vorsitzender@hardt-tennis.de",
      },
      cta: {
        titel: "Bereit für dein erstes Training?",
        text: "Melde dich jetzt und starte durch — Schnupperstunden jederzeit möglich.",
        buttonLabel: "Anrufen",
        telefonHref: "+4917559049030",
        zurueckLabel: "Zurück zur Startseite →",
      },
    },
  });

  console.log("seeded: training");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
