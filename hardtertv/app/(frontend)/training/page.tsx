import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Phone,
  Dumbbell,
  Users,
  Trophy,
  Calendar,
  Star,
  UserCheck,
  MapPin,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Media } from "@/payload-types";

export const revalidate = 3600;

const ANGEBOT_ICONS: Record<string, LucideIcon> = {
  userCheck: UserCheck,
  users: Users,
  trophy: Trophy,
  dumbbell: Dumbbell,
  star: Star,
  calendar: Calendar,
};

function angebotIcon(key: string | null | undefined): LucideIcon {
  return ANGEBOT_ICONS[key ?? ""] ?? Star;
}

function mediaDoc(value: number | Media | null | undefined): Media | null {
  return typeof value === "object" && value ? value : null;
}

export default async function TrainingPage() {
  const payload = await getPayload({ config });
  const { hero, trainer, angebote, halle, cta } = await payload.findGlobal({
    slug: "training",
    depth: 1,
  });

  const foto = mediaDoc(trainer?.foto);
  const bioAbsaetze = (trainer?.bio ?? "").split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const adresseZeilen = (halle?.adresse ?? "").split("\n").filter((z) => z.trim().length > 0);

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
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">{hero?.eyebrow}</span>
          </div>

          <h1 className="font-kanturmuy max-w-3xl text-4xl font-normal tracking-tighter text-white sm:text-5xl md:text-7xl">
            {hero?.titelVorne}{" "}
            <span className="relative inline-block">
              {hero?.titelHighlight}
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light text-white/60 md:text-lg">{hero?.text}</p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a href={`tel:${hero?.telefonHref ?? ""}`}>
              <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-white group-hover:text-black">
                  {hero?.buttonLabel}
                </span>
                <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover:bg-white group-hover:text-black">
                  <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                  <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                </div>
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Trainer Profile */}
      <section id="trainer" className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-black/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-black/50">{trainer?.eyebrow}</span>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Photo */}
            <div className="group relative overflow-hidden rounded-2xl">
              {foto?.url ? (
                <Image
                  src={foto.url}
                  alt={foto.alt}
                  width={900}
                  height={1100}
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  style={{ minHeight: "420px" }}
                />
              ) : (
                <div className="h-full w-full bg-black/[0.04]" style={{ minHeight: "420px" }} />
              )}
              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-[#e1fcad] px-4 py-2">
                <Trophy className="size-4 text-black" strokeWidth={1.5} />
                <span className="text-sm font-medium text-black">{trainer?.badge}</span>
              </div>
              <div className="h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full absolute bottom-0 left-0" />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <h2 className="font-kanturmuy text-4xl font-normal tracking-tight text-black sm:text-5xl">
                {trainer?.name}
              </h2>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-[2px] w-5 rounded-full bg-[#e1fcad]" />
                <span className="text-sm font-light text-black/50">{trainer?.rolle}</span>
              </div>

              <div className="mt-8 space-y-4 text-base font-light leading-relaxed text-black/70">
                {bioAbsaetze.map((absatz) => (
                  <p key={absatz.slice(0, 40)}>{absatz}</p>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {(trainer?.fakten ?? []).map((f) => (
                  <div key={f.label} className="flex flex-col gap-1 border-t border-black/10 pt-4">
                    <span className="font-kanturmuy text-2xl font-normal tracking-tight">{f.wert}</span>
                    <span className="text-xs uppercase tracking-widest text-black/50">{f.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-3 border-t border-black/[0.06] pt-6">
                <a
                  href={`tel:${trainer?.telefonHref ?? ""}`}
                  className="flex items-center gap-3 text-sm text-black/50 transition-colors hover:text-black"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#e1fcad]">
                    <Phone className="size-3.5" strokeWidth={1.5} />
                  </div>
                  {trainer?.telefonLabel}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Angebote */}
      <section id="angebote" className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-black/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-black/50">{angebote?.eyebrow}</span>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="font-kanturmuy max-w-xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              {angebote?.titelVorne}{" "}
              <span className="relative inline-block">
                {angebote?.titelHighlight}
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
            <p className="max-w-sm text-base font-light text-black/50">{angebote?.text}</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
            {(angebote?.karten ?? []).map((item) => {
              const Icon = angebotIcon(item.icon);
              return (
                <div
                  key={item.titel}
                  className="group flex flex-col rounded-2xl border border-black/[0.06] bg-white p-6 transition-shadow duration-300 hover:shadow-lg overflow-hidden relative"
                >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[#e1fcad]">
                    <Icon className="size-5 text-black" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-kanturmuy text-xl font-normal tracking-tight text-black">
                    {item.titel}
                  </h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-black/55">
                    {item.beschreibung}
                  </p>
                  <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tennishalle Kirchhellen */}
      <section id="anlage" className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="flex flex-col justify-center">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-black/30" />
                <span className="text-xs uppercase tracking-[0.2em] text-black/50">{halle?.eyebrow}</span>
              </div>

              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
                {halle?.titelVorne}{" "}
                <span className="relative inline-block">
                  {halle?.titelHighlight}
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
                </span>
              </h2>

              <p className="mt-6 text-base font-light leading-relaxed text-black/70">{halle?.text}</p>

              <div className="mt-8 grid grid-cols-3 gap-4">
                {(halle?.stats ?? []).map((s) => (
                  <div key={s.label} className="flex flex-col gap-1 border-t border-black/10 pt-4">
                    <span className="font-kanturmuy text-3xl font-normal tracking-tight">{s.wert}</span>
                    <span className="text-xs uppercase tracking-widest text-black/50">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a href={halle?.websiteUrl ?? "#"} target="_blank" rel="noopener noreferrer">
                  <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                    <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                      {halle?.websiteLabel}
                    </span>
                    <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                      <ExternalLink className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                      <ExternalLink className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                    </div>
                  </button>
                </a>
                <a
                  href={`tel:${halle?.telefonHref ?? ""}`}
                  className="text-sm font-light text-black/50 underline-offset-4 hover:underline"
                >
                  {halle?.anrufLabel}
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-[#122023] p-8 text-white">
                <MapPin className="mb-4 size-6 text-[#e1fcad]" strokeWidth={1.5} />
                <h3 className="font-kanturmuy text-2xl font-normal tracking-tight">{halle?.standortTitel}</h3>
                <p className="mt-2 text-sm font-light text-white/60">
                  {adresseZeilen.map((zeile, i) => (
                    <span key={zeile}>
                      {i > 0 && <br />}
                      {zeile}
                    </span>
                  ))}
                </p>
              </div>
              <div className="rounded-2xl border border-black/[0.06] bg-[#f9f9f7] p-8">
                <Phone className="mb-4 size-6 text-black/40" strokeWidth={1.5} />
                <h3 className="font-kanturmuy text-2xl font-normal tracking-tight">{halle?.kontaktTitel}</h3>
                <p className="mt-2 text-sm font-light text-black/55">{halle?.kontaktText}</p>
                <div className="mt-4 space-y-2">
                  {halle?.kontaktTelefonLabel && halle.kontaktTelefonHref && (
                    <a href={`tel:${halle.kontaktTelefonHref}`} className="block text-sm text-black/70 hover:text-black">
                      {halle.kontaktTelefonLabel}
                    </a>
                  )}
                  {halle?.kontaktEmail && (
                    <a href={`mailto:${halle.kontaktEmail}`} className="block text-sm text-black/70 hover:text-black">
                      {halle.kontaktEmail}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#e1fcad] px-6 py-20 md:px-12 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter text-black sm:text-4xl md:text-5xl">
                {cta?.titel}
              </h2>
              <p className="mt-3 text-base font-light text-black/60">{cta?.text}</p>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0">
              <a href={`tel:${cta?.telefonHref ?? ""}`}>
                <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                  <span className="rounded-full bg-[#122023] px-6 py-3 text-sm font-medium text-[#e1fcad] duration-500 ease-in-out group-hover:bg-black group-hover:text-white">
                    {cta?.buttonLabel}
                  </span>
                  <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#122023] text-[#e1fcad] duration-500 ease-in-out group-hover:bg-black group-hover:text-white">
                    <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                    <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                  </div>
                </button>
              </a>
              <Link
                href="/"
                className="flex items-center text-sm font-light text-black/60 underline-offset-4 hover:underline"
              >
                {cta?.zurueckLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
