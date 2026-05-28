"use client";

import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";
import { FadeIn } from "@/components/ui/fade-in";

const termine = [
  {
    datum: "17. Mai",
    tag: "Sa",
    veranstaltung: "Medenspiele Herren 30",
    uhrzeit: "10:00 Uhr",
    ort: "Gahlener Str. 204",
    kategorie: "Medenspiele",
  },
  {
    datum: "24. Mai",
    tag: "Sa",
    veranstaltung: "Jugendturnier HTV",
    uhrzeit: "09:00 Uhr",
    ort: "Gahlener Str. 204",
    kategorie: "Turnier",
  },
  {
    datum: "7. Juni",
    tag: "Sa",
    veranstaltung: "Mixed-Turnier Einzel",
    uhrzeit: "10:00 Uhr",
    ort: "Gahlener Str. 204",
    kategorie: "Turnier",
  },
  {
    datum: "21. Juni",
    tag: "Sa",
    veranstaltung: "Vereinsmeisterschaft – Runde 1",
    uhrzeit: "09:00 Uhr",
    ort: "Gahlener Str. 204",
    kategorie: "Vereinsmeisterschaft",
  },
  {
    datum: "9. Aug.",
    tag: "Sa",
    veranstaltung: "Sommerfest des HTV",
    uhrzeit: "15:00 Uhr",
    ort: "Clubheim Hardt",
    kategorie: "Vereinsleben",
  },
  {
    datum: "20. Sep.",
    tag: "Sa",
    veranstaltung: "Herbstturnier – Doppel",
    uhrzeit: "10:00 Uhr",
    ort: "Gahlener Str. 204",
    kategorie: "Turnier",
  },
];

const kategorieFarbe: Record<string, string> = {
  Medenspiele: "bg-blue-50 text-blue-600",
  Turnier: "bg-[#e1fcad] text-black",
  Vereinsmeisterschaft: "bg-black text-white",
  Vereinsleben: "bg-orange-50 text-orange-600",
};

function TerminCard({ termin }: { termin: (typeof termine)[0] }) {
  return (
    <div className="group flex items-start gap-5 rounded-2xl border border-black/[0.07] bg-white p-5 transition-shadow duration-300 hover:shadow-md">
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-black/[0.04] py-3 text-center">
        <span className="text-[11px] uppercase tracking-widest text-black/40">
          {termin.tag}
        </span>
        <span className="font-kanturmuy text-2xl font-normal leading-none text-black">
          {termin.datum.split(".")[0]}
        </span>
        <span className="mt-0.5 text-[11px] text-black/40">
          {termin.datum.split(". ")[1] ?? termin.datum.split(".")[1]}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${kategorieFarbe[termin.kategorie] ?? "bg-black/5 text-black/60"}`}>
          {termin.kategorie}
        </span>
        <p className="font-kanturmuy text-lg font-normal tracking-tight text-black">
          {termin.veranstaltung}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5 text-xs text-black/40">
            <Clock className="size-3" strokeWidth={1.5} />
            {termin.uhrzeit}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-black/40">
            <MapPin className="size-3" strokeWidth={1.5} />
            {termin.ort}
          </span>
        </div>
      </div>

      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-transparent transition-colors duration-300 group-hover:bg-[#e1fcad]">
        <ArrowUpRight className="size-4 text-black/30 transition-colors duration-300 group-hover:text-black" strokeWidth={1.5} />
      </div>
    </div>
  );
}

export default function TermineSection() {
  return (
    <section id="termine" className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-black/30" />
              <span className="text-xs uppercase tracking-[0.2em] text-black/50">
                Veranstaltungen 2026
              </span>
            </div>

            <h2 className="font-kanturmuy max-w-xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              <BlurTextEffect>Kommende </BlurTextEffect>
              <span className="relative inline-block">
                <BlurTextEffect>Termine</BlurTextEffect>
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>

            <p className="mt-4 max-w-md text-base font-light text-black/50">
              Hier erfahren Sie alles über kommende Termine und Veranstaltungen.
            </p>
          </div>

          <div className="shrink-0">
            <Link href="/kalender">
              <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                  Zum Kalender
                </span>
                <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                  <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                  <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                </div>
              </button>
            </Link>
          </div>
        </div>
        </FadeIn>

        <FadeIn delay={0.1}>
        <div className="mt-8 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-2">
          {termine.map((t) => (
            <TerminCard key={t.veranstaltung} termin={t} />
          ))}
        </div>
        </FadeIn>
      </div>
    </section>
  );
}
