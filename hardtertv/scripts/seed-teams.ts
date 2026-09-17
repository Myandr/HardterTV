import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

import config from "../payload.config";
import { teams } from "../lib/mannschaften-data";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

async function run() {
  const payload = await getPayload({ config });

  for (const team of teams) {
    const existing = await payload.find({
      collection: "teams",
      where: { slug: { equals: team.slug } },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      console.log(`skip (already exists): ${team.slug}`);
      continue;
    }

    let mediaId: number | undefined;
    if (team.bild) {
      const filePath = path.resolve(dirname, "..", "public", team.bild.replace(/^\//, ""));
      const media = await payload.create({
        collection: "media",
        data: { alt: `${team.name} Mannschaftsfoto` },
        filePath,
      });
      mediaId = media.id;
    }

    await payload.create({
      collection: "teams",
      data: {
        slug: team.slug,
        name: team.name,
        kategorie: team.kategorie,
        kontakt: team.kontakt,
        ligaUrl: team.ligaUrl,
        bild: mediaId,
      },
    });
    console.log(`created: ${team.slug}`);
  }

  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
