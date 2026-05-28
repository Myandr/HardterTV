import MannschaftenClient from "./mannschaften-client";
import { herren, damen, gemischt } from "@/lib/mannschaften-data";

export default function MannschaftenPage() {
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
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Sport</span>
          </div>

          <h1 className="font-kanturmuy max-w-3xl text-4xl font-normal tracking-tighter text-white sm:text-5xl md:text-7xl">
            Unsere{" "}
            <span className="relative inline-block">
              Mannschaften
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light text-white/60 md:text-lg">
            Vom Nachwuchs bis zu den Senioren — der Hardter TV stellt zahlreiche
            Mannschaften in verschiedenen Altersklassen und Ligen auf.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { label: `${herren.length} Herren-Teams` },
              { label: `${damen.length} Damen-Teams` },
              { label: `${gemischt.length} Gemischt-Teams` },
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

      <MannschaftenClient herren={herren} damen={damen} gemischt={gemischt} />

      {/* Kontakt Sportwart */}
      <section className="bg-[#122023] px-6 py-20 md:px-12 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-white/30" />
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Ansprechpartner</span>
              </div>
              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter text-white sm:text-4xl">
                Fragen zu den{" "}
                <span className="relative inline-block">
                  Mannschaften?
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
                </span>
              </h2>
              <p className="mt-3 max-w-md text-base font-light text-white/60">
                Unser Sportwart hilft dir bei allen Fragen rund um Anmeldung,
                Spielbetrieb und Mannschaftseinteilung.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="text-xs uppercase tracking-widest text-white/40">Sportwart</div>
              <a
                href="tel:+4915153553355"
                className="flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-white"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-[#e1fcad]/20 text-[#e1fcad] text-xs">📞</span>
                0151 53 55 33 55
              </a>
              <a
                href="mailto:1.vorsitzender@hardt-tennis.de"
                className="flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-white"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-[#e1fcad]/20 text-[#e1fcad] text-xs">✉</span>
                1.vorsitzender@hardt-tennis.de
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
