import { getPayload } from "payload";
import config from "@payload-config";

import type { SeitenTexte } from "@/payload-types";

export async function getSeitenTexte(): Promise<SeitenTexte> {
  const payload = await getPayload({ config });
  return payload.findGlobal({ slug: "seiten-texte", depth: 0 });
}
