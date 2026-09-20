import { MapPin, Users, Euro, CalendarDays, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { getPayload } from "payload";
import config from "@payload-config";
import { EisWidget } from "@/components/ui/eis-widget";
import type { Media } from "@/payload-types";

export const revalidate = 3600;

const KACHEL_ICONS: Record<string, LucideIcon> = {
  mapPin: MapPin,
  users: Users,
  euro: Euro,
  calendarDays: CalendarDays,
};

function kachelIcon(key: string | null | undefined): LucideIcon {
  return KACHEL_ICONS[key ?? ""] ?? MapPin;
}

function mediaDoc(value: number | Media | null | undefined): Media | null {
  return typeof value === "object" && value ? value : null;
}

export default async function EisPage() {
  const payload = await getPayload({ config });
  const { hero, angebot, galerie, buchung } = await payload.findGlobal({
    slug: "eisstock",
    depth: 1,
  });

  const heroBild = mediaDoc(hero?.bild);
  const galerieBilder = (galerie?.bilder ?? [])
    .map((b) => mediaDoc(b.bild))
    .filter((m): m is Media => m !== null && Boolean(m.url));

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#122023] px-6 py-24 md:px-12 lg:px-20 lg:py-36">
        {heroBild?.url && (
          <Image src={heroBild.url} alt="" fill className="object-cover opacity-30" priority />
        )}

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

          <div className="mt-10">
            <a href="#buchen">
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

      {/* Info-Kacheln */}
      <section className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-black/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-black/50">{angebot?.eyebrow}</span>
          </div>

          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="font-kanturmuy max-w-xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              {angebot?.titelVorne}{" "}
              <span className="relative inline-block">
                {angebot?.titelHighlight}
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
            <p className="max-w-sm text-base font-light text-black/50">{angebot?.text}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(angebot?.kacheln ?? []).map((item, index) => {
              const Icon = kachelIcon(item.icon);
              return (
                <div
                  key={item.id ?? index}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-6 transition-shadow duration-300 hover:shadow-lg"
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

      {/* Galerie */}
      <section className="bg-white px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {galerieBilder.map((bild, index) => (
              <div key={index} className="relative h-72 overflow-hidden rounded-2xl sm:h-96">
                <Image
                  src={bild.url as string}
                  alt={bild.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buchungs-Widget */}
      <section id="buchen" className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-black/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-black/50">{buchung?.eyebrow}</span>
          </div>

          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="font-kanturmuy max-w-xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
              {buchung?.titelVorne}{" "}
              <span className="relative inline-block">
                {buchung?.titelHighlight}
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
            <p className="max-w-sm text-base font-light text-black/50">{buchung?.text}</p>
          </div>

          <EisWidget url={buchung?.widgetUrl ?? ""} />
        </div>
      </section>
    </main>
  );
}
