import { getPayload } from "payload";
import config from "@payload-config";

import type { LegalSlug } from "./legal-pages";
import type { LegalPage } from "@/payload-types";

export async function getLegalPage(slug: LegalSlug): Promise<LegalPage> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "legal-pages",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });

  const doc = docs[0];
  if (!doc) {
    throw new Error(`Rechtsseite "${slug}" fehlt in Payload — bitte "npm run seed:legal-pages" ausführen.`);
  }
  return doc;
}
