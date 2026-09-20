import { getPayload } from "payload";
import config from "@payload-config";
import { getSeitenTexte } from "@/lib/seiten-texte";
import MannschaftenClient from "./mannschaften-client";

export const revalidate = 3600;

const KATEGORIEN = ["Herren", "Damen", "Gemischt"] as const;

type Team = {
  slug: string;
  name: string;
  kategorie: "Herren" | "Damen" | "Gemischt";
  kontakt: string;
  bild: string | null;
  ligaUrl: string;
};

async function getTeams(): Promise<Team[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "teams",
    depth: 1,
    limit: 200,
    sort: "name",
  });

  return docs.map((doc) => ({
    slug: doc.slug,
    name: doc.name,
    kategorie: doc.kategorie,
    kontakt: doc.kontakt,
    bild: typeof doc.bild === "object" && doc.bild ? doc.bild.url ?? null : null,
    ligaUrl: doc.ligaUrl,
  }));
}

export default async function MannschaftenPage() {
  const [teams, seitenTexte] = await Promise.all([getTeams(), getSeitenTexte()]);
  const texte = seitenTexte.mannschaften;
  const herren = teams.filter((t) => t.kategorie === "Herren");
  const damen = teams.filter((t) => t.kategorie === "Damen");
  const gemischt = teams.filter((t) => t.kategorie === "Gemischt");
  const kategorien = KATEGORIEN.map((k) => {
    const zeile = texte.kategorien.find((z) => z.kategorie === k);
    return {
      kategorie: k,
      reiterLabel: zeile?.reiterLabel ?? k,
      listenEyebrow: zeile?.listenEyebrow ?? `${k}-Teams`,
      badgeSuffix: zeile?.badgeSuffix ?? `${k}-Teams`,
    };
  });

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

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { label: `${herren.length} ${kategorien[0].badgeSuffix}` },
              { label: `${damen.length} ${kategorien[1].badgeSuffix}` },
              { label: `${gemischt.length} ${kategorien[2].badgeSuffix}` },
            ].map((b) => (
              <span
                key={b.label}
                className="rounded-full bg-[#e1fcad]/20 px-4 py-2 text-sm font-light text-[#e1fcad]"
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <MannschaftenClient
        herren={herren}
        damen={damen}
        gemischt={gemischt}
        texte={{
          kategorien,
          teamsSuffix: texte.teamsSuffix,
          kartenUntertitel: texte.kartenUntertitel,
        }}
      />

      {/* Kontakt Sportwart */}
      <section className="bg-[#122023] px-6 py-20 md:px-12 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-white/30" />
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">{texte.kontaktEyebrow}</span>
              </div>
              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter text-white sm:text-4xl">
                {texte.kontaktTitelVorne}{" "}
                <span className="relative inline-block">
                  {texte.kontaktTitelHighlight}
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
                </span>
              </h2>
              <p className="mt-3 max-w-md text-base font-light text-white/60">
                {texte.kontaktText}
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="text-xs uppercase tracking-widest text-white/40">{texte.kontaktLabel}</div>
              <a
                href={texte.kontaktTelefonHref}
                className="flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-white"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-[#e1fcad]/20 text-[#e1fcad] text-xs">📞</span>
                {texte.kontaktTelefon}
              </a>
              <a
                href={`mailto:${texte.kontaktEmail}`}
                className="flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-white"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-[#e1fcad]/20 text-[#e1fcad] text-xs">✉</span>
                {texte.kontaktEmail}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
