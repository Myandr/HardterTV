import Link from "next/link";
import { ArrowUpRight, Download, Mail, Users, Star, FileText } from "lucide-react";

const vorteile = [
  "Nutzung aller 8 Tennisplätze (inkl. 2 Flutlichtplätze)",
  "Teilnahme am Mannschaftsspielbetrieb",
  "Zugang zu Vereinsturnieren & Events",
  "Professionelles Training durch André Albert",
  "Aktives Vereinsleben mit Gemeinschaft",
  "Günstige Mitgliedsbeiträge für alle Altersgruppen",
];

export default function MitgliedschaftPage() {
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
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Mitmachen</span>
          </div>

          <h1 className="font-kanturmuy max-w-3xl text-4xl font-normal tracking-tighter text-white sm:text-5xl md:text-7xl">
            Werde{" "}
            <span className="relative inline-block">
              Mitglied
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light text-white/60 md:text-lg">
            Ob jung, ob alt, ob Profi oder Anfänger, ob Männlein oder Weiblein —
            jeder ist willkommen beim Hardter TV.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a href="/aufnahmeantrag.pdf" download>
              <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-white group-hover:text-black">
                  Antrag herunterladen
                </span>
                <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover:bg-white group-hover:text-black">
                  <Download className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" strokeWidth={1.5} />
                  <Download className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" strokeWidth={1.5} />
                </div>
              </button>
            </a>
            <a
              href="mailto:1.vorsitzender@hardt-tennis.de"
              className="flex items-center text-sm font-light text-white/50 underline-offset-4 hover:underline"
            >
              Fragen? Schreib uns →
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
                <span className="text-xs uppercase tracking-[0.2em] text-black/50">Deine Vorteile</span>
              </div>
              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
                Was du als{" "}
                <span className="relative inline-block">
                  Mitglied
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
                </span>{" "}
                bekommst
              </h2>
              <p className="mt-5 text-base font-light leading-relaxed text-black/60">
                Als Mitglied des Hardter TV bist du Teil einer lebendigen Tennisgemeinschaft
                mit allem, was dazu gehört.
              </p>

              <ul className="mt-8 space-y-3">
                {vorteile.map((v) => (
                  <li key={v} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e1fcad]">
                      <Star className="size-3 text-black" strokeWidth={2} />
                    </span>
                    <span className="text-sm font-light text-black/70">{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stat block */}
            <div className="flex flex-col justify-center gap-6">
              {[
                { value: "300+", label: "Aktive Mitglieder", sub: "aus Dorsten und Umgebung" },
                { value: "1952", label: "Vereinsgründung", sub: "über 70 Jahre Tennistradition" },
                { value: "8", label: "Tennisplätze", sub: "inkl. 2 Flutlichtplätze" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-6 rounded-2xl border border-black/[0.06] bg-[#f9f9f7] p-6"
                >
                  <span className="font-kanturmuy text-4xl font-normal tracking-tight text-black">
                    {s.value}
                  </span>
                  <div>
                    <p className="font-medium text-black">{s.label}</p>
                    <p className="text-sm font-light text-black/50">{s.sub}</p>
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
              <span className="text-xs uppercase tracking-[0.2em] text-black/50">Dokumente</span>
            </div>
            <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
              Alle{" "}
              <span className="relative inline-block">
                Unterlagen
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Mitglied werden */}
            <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-shadow duration-300 hover:shadow-lg">
              <div className="flex flex-1 flex-col p-7">
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-[#e1fcad]">
                  <Users className="size-5 text-black" strokeWidth={1.5} />
                </div>
                <h3 className="font-kanturmuy text-2xl font-normal tracking-tight text-black">
                  Mitglied werden
                </h3>
                <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-black/55">
                  Fülle den Aufnahmeantrag aus und schick ihn per E-Mail an uns. Wir melden
                  uns schnellstmöglich bei dir.
                </p>
                <div className="mt-6 space-y-3 border-t border-black/[0.06] pt-5">
                  <a href="/aufnahmeantrag.pdf" download>
                    <button className="group/btn flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#f9f9f7] px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-[#e1fcad]">
                      <span>Antrag herunterladen</span>
                      <Download className="size-4" strokeWidth={1.5} />
                    </button>
                  </a>
                  <a
                    href="mailto:1.vorsitzender@hardt-tennis.de?subject=Mitgliedschaft%20Hardter%20TV"
                    className="flex items-center justify-between rounded-xl border border-black/[0.06] px-4 py-3 text-sm text-black/50 transition-colors hover:text-black"
                  >
                    <span>Per E-Mail einreichen</span>
                    <Mail className="size-4" strokeWidth={1.5} />
                  </a>
                </div>
              </div>
              <div className="h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
            </div>

            {/* Schnuppercard */}
            <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-shadow duration-300 hover:shadow-lg">
              <div className="flex flex-1 flex-col p-7">
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-[#e1fcad]">
                  <Star className="size-5 text-black" strokeWidth={1.5} />
                </div>
                <h3 className="font-kanturmuy text-2xl font-normal tracking-tight text-black">
                  HTV Schnuppercard
                </h3>
                <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-black/55">
                  Du möchtest Tennis beim HTV erst ausprobieren? Mit unserer Greencard kannst
                  du für wenig Geld eine komplette Sommersaison schnuppern — ganz unverbindlich.
                </p>
                <div className="mt-6 space-y-3 border-t border-black/[0.06] pt-5">
                  <a href="/schnuppercard.pdf" download>
                    <button className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#f9f9f7] px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-[#e1fcad]">
                      <span>Schnuppercard laden</span>
                      <Download className="size-4" strokeWidth={1.5} />
                    </button>
                  </a>
                  <a
                    href="mailto:1.vorsitzender@hardt-tennis.de?subject=Schnuppercard%20Hardter%20TV"
                    className="flex items-center justify-between rounded-xl border border-black/[0.06] px-4 py-3 text-sm text-black/50 transition-colors hover:text-black"
                  >
                    <span>Per E-Mail einreichen</span>
                    <Mail className="size-4" strokeWidth={1.5} />
                  </a>
                </div>
              </div>
              <div className="h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
            </div>

            {/* Beitragsordnung */}
            <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-shadow duration-300 hover:shadow-lg">
              <div className="flex flex-1 flex-col p-7">
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-[#e1fcad]">
                  <FileText className="size-5 text-black" strokeWidth={1.5} />
                </div>
                <h3 className="font-kanturmuy text-2xl font-normal tracking-tight text-black">
                  Beitragsordnung
                </h3>
                <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-black/55">
                  Alle Informationen zu Beiträgen, Altersgruppen und Konditionen findest du
                  in unserer Beitragsordnung als PDF-Dokument.
                </p>
                <div className="mt-6 border-t border-black/[0.06] pt-5">
                  <a href="/beitragsordnung.pdf" download>
                    <button className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#f9f9f7] px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-[#e1fcad]">
                      <span>Beitragsordnung laden</span>
                      <Download className="size-4" strokeWidth={1.5} />
                    </button>
                  </a>
                </div>
              </div>
              <div className="h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* So läuft es ab */}
      <section className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-black/30" />
              <span className="text-xs uppercase tracking-[0.2em] text-black/50">Anmeldung</span>
            </div>
            <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
              So einfach{" "}
              <span className="relative inline-block">
                geht's
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                nr: "01",
                titel: "Antrag herunterladen",
                text: "Lade den Aufnahmeantrag oder die Schnuppercard als PDF herunter und drucke ihn aus.",
              },
              {
                nr: "02",
                titel: "Ausfüllen & unterschreiben",
                text: "Fülle den Antrag vollständig aus und unterschreibe ihn.",
              },
              {
                nr: "03",
                titel: "Einreichen",
                text: "Schick den ausgefüllten Antrag per E-Mail an 1.vorsitzender@hardt-tennis.de — fertig!",
              },
            ].map((s) => (
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
                Noch Fragen?
              </h2>
              <p className="mt-3 max-w-md text-base font-light text-black/60">
                Unser 1. Vorsitzender Oliver Wiegand hilft dir gerne weiter —
                per E-Mail oder telefonisch.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0">
              <a href="mailto:1.vorsitzender@hardt-tennis.de">
                <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                  <span className="rounded-full bg-[#122023] px-6 py-3 text-sm font-medium text-[#e1fcad] duration-500 ease-in-out group-hover:bg-black group-hover:text-white">
                    E-Mail schreiben
                  </span>
                  <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#122023] text-[#e1fcad] duration-500 ease-in-out group-hover:bg-black group-hover:text-white">
                    <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                    <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                  </div>
                </button>
              </a>
              <a
                href="tel:+4917225802099"
                className="flex items-center text-sm font-light text-black/60 underline-offset-4 hover:underline"
              >
                0172 25 80 209 →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
