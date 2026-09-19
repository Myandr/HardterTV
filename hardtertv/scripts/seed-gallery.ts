import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

import config from "../payload.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

type SeedAlbum = {
  titel: string;
  jahr: number;
  /** Ordner unterhalb von public/ */
  ordner: string;
  /** Dateiname-Muster, {n} wird durch 1..anzahl ersetzt */
  dateiMuster: string;
  anzahl: number;
};

const ALBEN: SeedAlbum[] = [
  {
    titel: "Rückblick 2024",
    jahr: 2024,
    ordner: "images/Rückblick 2024",
    dateiMuster: "Rückblick 2024_{n}.jpg",
    anzahl: 17,
  },
];

async function run() {
  const payload = await getPayload({ config });

  for (const album of ALBEN) {
    const existing = await payload.find({
      collection: "gallery-albums",
      where: { titel: { equals: album.titel } },
      limit: 1,
      depth: 0,
    });
    if (existing.docs.length > 0) {
      console.log(`skip (already exists): ${album.titel}`);
      continue;
    }

    const bilder: number[] = [];
    for (let i = 1; i <= album.anzahl; i++) {
      const dateiname = album.dateiMuster.replace("{n}", String(i));
      const filePath = path.resolve(dirname, "..", "public", album.ordner, dateiname);
      const media = await payload.create({
        collection: "media",
        data: { alt: `${album.titel} – Bild ${i}` },
        filePath,
        context: { disableRevalidate: true },
      });
      bilder.push(media.id);
      console.log(`uploaded (${i}/${album.anzahl}): ${dateiname}`);
    }

    await payload.create({
      collection: "gallery-albums",
      data: { titel: album.titel, jahr: album.jahr, bilder },
      context: { disableRevalidate: true },
    });
    console.log(`created album: ${album.titel} (${bilder.length} Bilder)`);
  }

  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
