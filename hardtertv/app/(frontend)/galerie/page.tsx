import { getPayload } from "payload";
import config from "@payload-config";
import type { Media } from "@/payload-types";
import { getSeitenTexte } from "@/lib/seiten-texte";
import GalerieClient from "./galerie-client";

export const revalidate = 3600;

export type GalerieAlbum = {
  id: number;
  titel: string;
  jahr: number;
  bilder: { src: string; alt: string; index: number }[];
};

async function getAlben(): Promise<GalerieAlbum[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "gallery-albums",
    depth: 1,
    limit: 100,
    sort: "-jahr",
  });

  let laufenderIndex = 0;
  return docs.map((doc) => ({
    id: doc.id,
    titel: doc.titel,
    jahr: doc.jahr,
    bilder: (doc.bilder ?? [])
      .filter((b): b is Media => typeof b === "object" && b !== null && typeof b.url === "string")
      .map((b) => ({
        src: b.url as string,
        alt: b.alt || doc.titel,
        index: laufenderIndex++,
      })),
  }));
}

export default async function GaleriePage() {
  const [seitenTexte, alben] = await Promise.all([getSeitenTexte(), getAlben()]);
  const texte = seitenTexte.galerie;
  const gesamtBilder = alben.reduce((summe, album) => summe + album.bilder.length, 0);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#122023] px-6 py-24 md:px-12 lg:px-20 lg:py-36">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-[#e1fcad]" />
          <div className="absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-[#e1fcad]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-white/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">{texte.eyebrow}</span>
          </div>

          <h1 className="font-kanturmuy max-w-3xl text-4xl font-normal tracking-tighter text-white sm:text-5xl md:text-7xl">
            {texte.titelVorne}{" "}
            <span className="relative inline-block">
              {texte.titelHighlight}
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light text-white/60 md:text-lg">
            {texte.text}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {alben.map((album) => (
              <span
                key={album.id}
                className="rounded-full bg-[#e1fcad]/20 px-4 py-2 text-sm font-light text-[#e1fcad]"
              >
                {album.titel}
              </span>
            ))}
            <span className="text-sm text-white/40">{`${gesamtBilder} ${texte.bilderSuffix}`}</span>
          </div>
        </div>
      </section>

      <GalerieClient alben={alben} leerText={texte.leerText} />
    </main>
  );
}
