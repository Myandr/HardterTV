import { getPayload } from "payload";

import config from "../payload.config";

const TERMINE = {
  eyebrow: "Veranstaltungen",
  headlineTeil1: "Kommende",
  headlineTeil2: "Termine",
  intro: "Hier erfahren Sie alles über kommende Termine und Veranstaltungen.",
  ctaLabel: "Zum Kalender",
  leerTextVor: "Aktuell sind keine Termine geplant — schau bald wieder vorbei oder wirf einen Blick in den",
  leerLinkText: "Kalender",
  leerTextNach: ".",
};

const VORSTAND = {
  eyebrow: "Menschen hinter dem HTV",
  headlineTeil1: "Unser",
  headlineTeil2: "Vorstand",
  intro: "Das Team des Hardter TV",
  ctaLabel: "Ganzen Vorstand sehen",
};

const NEWS = {
  eyebrow: "Aus dem Verein",
  headlineTeil1: "Aktuelle",
  headlineTeil2: "Neuigkeiten",
  intro: "Bleiben Sie auf dem Laufenden über die neuesten Entwicklungen in unserem Verein.",
};

async function run() {
  const payload = await getPayload({ config });

  const existingTermine = await payload.findGlobal({ slug: "termine-section", depth: 0 });
  if (existingTermine?.headlineTeil2) {
    console.log("skip (already seeded): termine-section");
  } else {
    await payload.updateGlobal({ slug: "termine-section", data: TERMINE, context: { disableRevalidate: true } });
    console.log("seeded: termine-section");
  }

  const existingVorstand = await payload.findGlobal({ slug: "vorstand-section", depth: 0 });
  if (existingVorstand?.headlineTeil2) {
    console.log("skip (already seeded): vorstand-section");
  } else {
    await payload.updateGlobal({ slug: "vorstand-section", data: VORSTAND, context: { disableRevalidate: true } });
    console.log("seeded: vorstand-section");
  }

  const existingNews = await payload.findGlobal({ slug: "news-section", depth: 0 });
  if (existingNews?.headlineTeil2) {
    console.log("skip (already seeded): news-section");
  } else {
    await payload.updateGlobal({ slug: "news-section", data: NEWS, context: { disableRevalidate: true } });
    console.log("seeded: news-section");
  }

  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
