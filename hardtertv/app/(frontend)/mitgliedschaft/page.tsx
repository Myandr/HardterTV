import { ArrowUpRight, Download, FileText, Mail, Star, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Media } from "@/payload-types";

export const revalidate = 3600;

const DOKUMENT_ICONS: Record<string, LucideIcon> = {
  users: Users,
  star: Star,
  fileText: FileText,
};

function dokumentIcon(key: string | null | undefined): LucideIcon {
  return DOKUMENT_ICONS[key ?? ""] ?? FileText;
}

function fileUrl(value: number | Media | null | undefined): string | null {
  return typeof value === "object" && value ? value.url ?? null : null;
}

function mailtoHref(email: string, betreff?: string | null): string {
  return betreff ? `mailto:${email}?subject=${encodeURIComponent(betreff)}` : `mailto:${email}`;
}

export default async function MitgliedschaftPage() {
  const payload = await getPayload({ config });
  const { hero, vorteile, dokumente, prozess, cta } = await payload.findGlobal({
    slug: "mitgliedschaft",
    depth: 1,
  });

  const antragUrl = fileUrl(hero.antragPdf);

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
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">{hero.eyebrow}</span>
          </div>

          <h1 className="font-kanturmuy max-w-3xl text-4xl font-normal tracking-tighter text-white sm:text-5xl md:text-7xl">
            {hero.titelVorne}{" "}
            <span className="relative inline-block">
              {hero.titelHighlight}
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light text-white/60 md:text-lg">{hero.text}</p>

          <div className="mt-10 flex flex-wrap gap-4">
            {antragUrl && (
              <a href={antragUrl} download>
                <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                  <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-white group-hover:text-black">
                    {hero.antragButtonLabel}
                  </span>
                  <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover:bg-white group-hover:text-black">
                    <Download className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" strokeWidth={1.5} />
                    <Download className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" strokeWidth={1.5} />
                  </div>
                </button>
              </a>
            )}
            <a
              href={`mailto:${hero.kontaktEmail}`}
              className="flex items-center text-sm font-light text-white/50 underline-offset-4 hover:underline"
            >
              {hero.kontaktLinkLabel}
            </a>
          </div>
        </div>
      </section>

      {/* Vorteile */}
      <section className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-black/30" />
                <span className="text-xs uppercase tracking-[0.2em] text-black/50">{vorteile.eyebrow}</span>
              </div>
              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
                {vorteile.titelVorne}{" "}
                <span className="relative inline-block">
                  {vorteile.titelHighlight}
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
                </span>
                {vorteile.titelHinten ? <> {vorteile.titelHinten}</> : null}
              </h2>
              <p className="mt-5 text-base font-light leading-relaxed text-black/60">{vorteile.text}</p>

              <ul className="mt-8 space-y-3">
                {(vorteile.liste ?? []).map((v) => (
                  <li key={v.text} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e1fcad]">
                      <Star className="size-3 text-black" strokeWidth={2} />
                    </span>
                    <span className="text-sm font-light text-black/70">{v.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stat block */}
            <div className="flex flex-col justify-center gap-6">
              {(vorteile.stats ?? []).map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-6 rounded-2xl border border-black/[0.06] bg-[#f9f9f7] p-6"
                >
                  <span className="font-kanturmuy text-4xl font-normal tracking-tight text-black">
                    {s.wert}
                  </span>
                  <div>
                    <p className="font-medium text-black">{s.label}</p>
                    <p className="text-sm font-light text-black/50">{s.zusatz}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 Karten */}
      <section className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-black/30" />
              <span className="text-xs uppercase tracking-[0.2em] text-black/50">{dokumente.eyebrow}</span>
            </div>
            <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
              {dokumente.titelVorne}{" "}
              <span className="relative inline-block">
                {dokumente.titelHighlight}
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {(dokumente.karten ?? []).map((karte) => {
              const Icon = dokumentIcon(karte.icon);
              const dateiUrl = fileUrl(karte.datei);
              return (
                <div
                  key={karte.titel}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-shadow duration-300 hover:shadow-lg"
                >
                  <div className="flex flex-1 flex-col p-7">
                    <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-[#e1fcad]">
                      <Icon className="size-5 text-black" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-kanturmuy text-2xl font-normal tracking-tight text-black">
                      {karte.titel}
                    </h3>
                    <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-black/55">
                      {karte.beschreibung}
                    </p>
                    <div className="mt-6 space-y-3 border-t border-black/[0.06] pt-5">
                      {dateiUrl && (
                        <a href={dateiUrl} download>
                          <button className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#f9f9f7] px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-[#e1fcad]">
                            <span>{karte.downloadLabel}</span>
                            <Download className="size-4" strokeWidth={1.5} />
                          </button>
                        </a>
                      )}
                      {karte.mailAdresse && karte.mailLabel && (
                        <a
                          href={mailtoHref(karte.mailAdresse, karte.mailBetreff)}
                          className="flex items-center justify-between rounded-xl border border-black/[0.06] px-4 py-3 text-sm text-black/50 transition-colors hover:text-black"
                        >
                          <span>{karte.mailLabel}</span>
                          <Mail className="size-4" strokeWidth={1.5} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* So läuft es ab */}
      <section className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-black/30" />
              <span className="text-xs uppercase tracking-[0.2em] text-black/50">{prozess.eyebrow}</span>
            </div>
            <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
              {prozess.titelVorne}{" "}
              <span className="relative inline-block">
                {prozess.titelHighlight}
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {(prozess.schritte ?? []).map((s) => (
              <div key={s.nr} className="flex flex-col gap-4 rounded-2xl border border-black/[0.06] bg-[#f9f9f7] p-7">
                <span className="font-kanturmuy text-4xl font-normal text-black/10">{s.nr}</span>
                <h3 className="font-kanturmuy text-xl font-normal tracking-tight text-black">
                  {s.titel}
                </h3>
                <p className="text-sm font-light leading-relaxed text-black/55">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#e1fcad] px-6 py-20 md:px-12 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter text-black sm:text-4xl md:text-5xl">
                {cta.titel}
              </h2>
              <p className="mt-3 max-w-md text-base font-light text-black/60">{cta.text}</p>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0">
              <a href={`mailto:${cta.email}`}>
                <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                  <span className="rounded-full bg-[#122023] px-6 py-3 text-sm font-medium text-[#e1fcad] duration-500 ease-in-out group-hover:bg-black group-hover:text-white">
                    {cta.buttonLabel}
                  </span>
                  <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#122023] text-[#e1fcad] duration-500 ease-in-out group-hover:bg-black group-hover:text-white">
                    <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                    <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                  </div>
                </button>
              </a>
              <a
                href={`tel:${cta.telefonHref}`}
                className="flex items-center text-sm font-light text-black/60 underline-offset-4 hover:underline"
              >
                {cta.telefonLabel}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
