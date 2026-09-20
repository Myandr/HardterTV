import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

import config from "../payload.config";
import type { StatIconKey } from "../lib/stat-icons";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const STATS: { icon: StatIconKey; wert: string; label: string }[] = [
  { icon: "trophy", wert: "1978", label: "Gegründet" },
  { icon: "users", wert: "200+", label: "Mitglieder" },
  { icon: "mapPin", wert: "6", label: "Tennisplätze" },
  { icon: "zap", wert: "2", label: "Flutlichtplätze" },
];

const BILD = { pfad: "images/Tennisball an Linie groß.jpg", alt: "Tennisball an der Linie" };

const ABSAETZE = [
  "Gerne zeigen wir Ihnen unsere 6-Platzanlage mit Clubhaus direkt am Kanal gelegen. Die Anlage ist im Normalfall von Mitte April bis Ende Oktober geöffnet. Bei uns kann Tennis als Hobby-, Mannschafts- oder Leistungssport betrieben werden.",
  "Zum gemütlichen Beisammensein vor und nach dem Tennisspielen lädt die großzügig angelegte Terrasse ein. Von dieser aus können Sie die gesamte Anlage überblicken und sie ist zu einem beliebten Treffpunkt geworden.",
  "Für alle diejenigen, die das Tennisspielen beim HTV einmal ausprobieren wollen, bieten wir die sogenannte Greencard an. Mit dieser kann Jeder erst einmal für wenig Geld ab Saisonbeginn bis zum 31.7. des jeweiligen Jahres schnuppern. Denn bevor Jemand Mitglied werden muss, soll er sich sicher sein, dass der Tennissport und insbesondere der HTV genau das Richtige sind, um in der Freizeit aktiv zu sein.",
  "Wir wünschen viel Spaß beim virtuellen Rundgang auf unserer Homepage und bemühen uns die Internetseite nach Möglichkeit immer aktuell zu halten. Für Anmerkungen, Anregungen, Kommunikation etc. steht Ihnen unser Kontaktformular zur Verfügung! Ansonsten freuen wir uns auf Ihren Besuch auf unserer Anlage.",
];

async function run() {
  const payload = await getPayload({ config });

  const existing = await payload.findGlobal({ slug: "welcome-section", depth: 0 });
  if (existing?.headline) {
    console.log("skip (already seeded): welcome-section");
    process.exit(0);
  }

  const media = await payload.create({
    collection: "media",
    data: { alt: BILD.alt },
    filePath: path.resolve(dirname, "..", "public", BILD.pfad),
    context: { disableRevalidate: true },
  });
  console.log(`uploaded: ${BILD.pfad}`);

  await payload.updateGlobal({
    slug: "welcome-section",
    data: {
      eyebrow: "Über den Verein",
      headline: "Hardter TV, ein Verein für Jedermann mit bezahlbaren Beiträgen!",
      intro:
        "Herzlich willkommen beim Hardter Tennisverein in Dorsten. Erlebe die Freude am Tennis und werde Teil unserer aktiven Gemeinschaft.",
      stats: STATS,
      bild: media.id,
      bildBadge: "Hardter TV Dorsten",
      text: ABSAETZE.join("\n\n"),
      signaturName: "Oliver Wiegand",
      signaturRolle: "1. Vorsitzender HTV",
      ctaLabel: "Jetzt Mitglied werden",
      sekundaerLabel: "Training entdecken",
    },
    context: { disableRevalidate: true },
  });

  console.log("seeded: welcome-section");
  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
