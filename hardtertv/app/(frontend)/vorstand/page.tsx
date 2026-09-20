import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { getPayload } from "payload";
import config from "@payload-config";
import { getSeitenTexte } from "@/lib/seiten-texte";
import { VORSTAND_GRUPPEN } from "@/lib/vorstand-gruppen";

export const revalidate = 3600;

type Person = {
  id: string;
  name: string;
  titel: string;
  email: string[];
  telefon?: string;
  bild: string | null;
};

type GruppenText = { gruppe: string; titel: string; beschreibung: string };

function gruppenReihenfolge(gepflegt: GruppenText[]): GruppenText[] {
  const bekannt = new Set(gepflegt.map((g) => g.gruppe));
  const fehlend = VORSTAND_GRUPPEN.filter((g) => !bekannt.has(g.value)).map((g) => ({
    gruppe: g.value,
    titel: g.adminLabel,
    beschreibung: "",
  }));
  return [...gepflegt, ...fehlend];
}

async function getGruppen(gruppenTexte: GruppenText[]) {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "board-members",
    depth: 1,
    limit: 200,
    sort: "reihenfolge",
  });

  return gruppenReihenfolge(gruppenTexte).map((g) => ({
    gruppe: g.gruppe,
    titel: g.titel,
    beschreibung: g.beschreibung,
    mitglieder: docs
      .filter((d) => d.gruppe === g.gruppe)
      .map(
        (d): Person => ({
          id: String(d.id),
          name: d.name,
          titel: d.titel,
          email: (d.emails ?? []).map((e) => e.email),
          telefon: d.telefon ?? undefined,
          bild: typeof d.foto === "object" && d.foto ? d.foto.url ?? null : null,
        }),
      ),
  })).filter((g) => g.mitglieder.length > 0);
}

function VorstandCard({ person }: { person: Person }) {
  const emails = person.email;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-shadow duration-300 hover:shadow-lg">
      <div className="relative h-64 w-full overflow-hidden">
        {person.bild ? (
          <Image
            src={person.bild}
            alt={person.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-black/[0.04]" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-kanturmuy text-xl font-normal tracking-tight text-black">
          {person.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="h-[2px] w-4 rounded-full bg-[#e1fcad]" />
          <span className="text-xs font-light text-black/50">{person.titel}</span>
        </div>

        {(emails.length > 0 || person.telefon) && (
          <div className="mt-4 space-y-2 border-t border-black/[0.06] pt-4">
            {emails.map((email) => (
              <a
                key={email}
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-xs text-black/50 transition-colors hover:text-black"
              >
                <Mail className="size-3 shrink-0" strokeWidth={1.5} />
                <span className="truncate">{email}</span>
              </a>
            ))}
            {person.telefon && (
              <a
                href={`tel:${person.telefon.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-xs text-black/50 transition-colors hover:text-black"
              >
                <Phone className="size-3 shrink-0" strokeWidth={1.5} />
                {person.telefon}
              </a>
            )}
          </div>
        )}
      </div>

      <div className="h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
    </div>
  );
}

export default async function VorstandPage() {
  const texte = await getSeitenTexte();
  const gruppen = await getGruppen(texte.vorstand.gruppen);
  const total = gruppen.reduce((sum, g) => sum + g.mitglieder.length, 0);

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
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">{texte.vorstand.eyebrow}</span>
          </div>

          <h1 className="font-kanturmuy max-w-3xl text-4xl font-normal tracking-tighter text-white sm:text-5xl md:text-7xl">
            {texte.vorstand.titelVorne}{" "}
            <span className="relative inline-block">
              {texte.vorstand.titelHighlight}
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light text-white/60 md:text-lg">
            {texte.vorstand.text}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-[#e1fcad]/20 px-4 py-2 text-sm font-light text-[#e1fcad]">
              {`${total} ${texte.vorstand.badgeSuffix}`}
            </span>
            {gruppen.map((g) => (
              <span
                key={g.gruppe}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-light text-white/60"
              >
                {g.titel}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Gruppen */}
      {gruppen.map((gruppe, gi) => (
        <section
          key={gruppe.gruppe}
          className={`px-6 py-20 md:px-12 lg:px-20 lg:py-28 ${gi % 2 === 0 ? "bg-white" : "bg-[#f9f9f7]"}`}
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-black/30" />
                <span className="text-xs uppercase tracking-[0.2em] text-black/50">
                  {gruppe.titel}
                </span>
              </div>
              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
                <span className="relative inline-block">
                  {gruppe.titel}
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
                </span>
              </h2>
              <p className="mt-3 max-w-lg text-base font-light text-black/50">
                {gruppe.beschreibung}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {gruppe.mitglieder.map((person) => (
                <VorstandCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="bg-[#e1fcad] px-6 py-20 md:px-12 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter text-black sm:text-4xl md:text-5xl">
                {texte.vorstand.ctaTitel}
              </h2>
              <p className="mt-3 max-w-md text-base font-light text-black/60">
                {texte.vorstand.ctaText}
              </p>
            </div>
            <a href={`mailto:${texte.vorstand.ctaEmail}`} className="shrink-0">
              <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                <span className="rounded-full bg-[#122023] px-6 py-3 text-sm font-medium text-[#e1fcad] duration-500 ease-in-out group-hover:bg-black group-hover:text-white">
                  {texte.vorstand.ctaButtonLabel}
                </span>
                <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#122023] text-[#e1fcad] duration-500 ease-in-out group-hover:bg-black group-hover:text-white">
                  <Mail className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" strokeWidth={1.5} />
                  <Mail className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" strokeWidth={1.5} />
                </div>
              </button>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
