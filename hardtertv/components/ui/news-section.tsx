"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";
import { FadeIn } from "@/components/ui/fade-in";

const news = [
  {
    datum: "News",
    titel: "Flutlichtanlage für zwei Tennisplätze",
    excerpt:
      "Der HTV erhielt Mittel aus der Sportpauschale 2023 der Stadt Dorsten zur Anschaffung einer Flutlichtanlage. Dies ermöglicht erweiterte Trainingszeiten in den Abendstunden und die Durchführung von Nachturnieren. Die Anlage wird auf den Plätzen 5 und 6 installiert.",
    bild: "/images/Tennisball an Linie groß.jpg",
    kategorie: "Vereinsnews",
  },
  {
    datum: "4. Oktober 2024",
    titel: "Saisonabschlussfest 2024",
    excerpt:
      "Am vergangenen Samstag haben wir in geselliger Runde die Sommersaison verabschiedet: Wir haben gemeinsam auf die schönsten Momente angestoßen und die Saison noch einmal Revue passieren lassen.",
    bild: "/images/tennis.jpg",
    kategorie: "Vereinsleben",
  },
  {
    datum: "4. Oktober 2024",
    titel: "Jahresrückblick 2024",
    excerpt:
      "Jahresrückblick 2024 – Danke für eine unvergessliche Saison! Das Jahr 2024 neigt sich dem Ende zu, und wir blicken auf eine großartige Saison voller schöner Momente zurück!",
    bild: "/images/wilson-2259352_960_720.jpg",
    kategorie: "Vereinsnews",
  },
  {
    datum: "News",
    titel: "Saisonabschluss 2024 – ein Abend voller Highlights!",
    excerpt:
      "Am vergangenen Samstag haben wir in geselliger Runde die Sommersaison verabschiedet: Wir haben gemeinsam auf die schönsten Momente angestoßen, die Tanzfläche unsicher gemacht und die Saison noch einmal Revue passieren lassen. Ein besonderes Highlight des Abends war das fantastische Buffet, das unsere Küchenfee Petra für uns gezaubert hat – ein Genuss für alle!",
    bild: "/images/Sasionabschluss 2024.jpg",
    kategorie: "Vereinsleben",
  },
  {
    datum: "News",
    titel: "Unsere eigene Vereinskollektion ist da!",
    excerpt:
      "Endlich ist es soweit – ab sofort könnt ihr unsere brandneue Vereinskleidung bekommen! Ob für das Training oder den Alltag – mit unserer Kollektion tragt ihr den HTV-Spirit mit Stil.",
    bild: "/images/tennis-court-1671852_960_720.jpg",
    kategorie: "Vereinsnews",
  },
];

const kategorieFarbe: Record<string, string> = {
  Vereinsnews: "bg-black text-white",
  Vereinsleben: "bg-[#e1fcad] text-black",
  Turnier: "bg-orange-50 text-orange-600",
  Training: "bg-blue-50 text-blue-600",
};

function NewsCard({
  artikel,
  featured,
}: {
  artikel: (typeof news)[0];
  featured?: boolean;
}) {
  if (featured) {
    return (
      <div className="group col-span-1 flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-shadow duration-300 hover:shadow-lg lg:col-span-2 lg:flex-row">
        <div className="relative h-56 overflow-hidden lg:h-auto lg:w-1/2">
          <Image
            src={artikel.bild}
            alt={artikel.titel}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>

        <div className="flex flex-1 flex-col justify-between p-5 sm:p-7 lg:p-10">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${kategorieFarbe[artikel.kategorie] ?? "bg-black/5 text-black/60"}`}>
                {artikel.kategorie}
              </span>
              <span className="text-xs text-black/35">{artikel.datum}</span>
            </div>
            <h3 className="font-kanturmuy text-2xl font-normal tracking-tight text-black md:text-3xl">
              {artikel.titel}
            </h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-black/50 md:text-base">
              {artikel.excerpt}
            </p>
          </div>

          <div className="mt-6">
            <button className="group/btn flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
              <span className="rounded-full bg-[#e1fcad] px-5 py-2.5 text-sm font-medium text-black duration-500 ease-in-out group-hover/btn:bg-[#122023] group-hover/btn:text-[#e1fcad]">
                Weiterlesen
              </span>
              <div className="relative flex size-[42px] items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover/btn:bg-[#122023] group-hover/btn:text-[#e1fcad]">
                <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover/btn:translate-x-10" />
                <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover/btn:-translate-x-1/2" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-shadow duration-300 hover:shadow-lg">
      <div className="relative h-44 overflow-hidden">
        <Image
          src={artikel.bild}
          alt={artikel.titel}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${kategorieFarbe[artikel.kategorie] ?? "bg-black/5 text-black/60"}`}>
            {artikel.kategorie}
          </span>
          <span className="text-xs text-black/35">{artikel.datum}</span>
        </div>
        <h3 className="font-kanturmuy text-lg font-normal tracking-tight text-black">
          {artikel.titel}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm font-light leading-relaxed text-black/50">
          {artikel.excerpt}
        </p>

        <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-black/40 transition-colors duration-200 group-hover:text-black">
          <span>Weiterlesen</span>
          <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
        </div>
      </div>

      <div className="h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
    </div>
  );
}

export default function NewsSection() {
  return (
    <section id="news" className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-black/30" />
              <span className="text-xs uppercase tracking-[0.2em] text-black/50">
                Aus dem Verein
              </span>
            </div>

            <h2 className="font-kanturmuy max-w-xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              <BlurTextEffect>Aktuelle </BlurTextEffect>
              <span className="relative inline-block">
                <BlurTextEffect>Neuigkeiten</BlurTextEffect>
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>

            <p className="mt-4 max-w-md text-base font-light text-black/50">
              Bleiben Sie auf dem Laufenden über die neuesten Entwicklungen in unserem Verein.
            </p>
          </div>

          <div className="shrink-0">
            <Link href="/news">
              <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                  News-Archiv
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
        <div className="mt-8 grid grid-cols-1 gap-6 md:mt-14 lg:grid-cols-3">
          <NewsCard artikel={news[0]} featured />
          <NewsCard artikel={news[1]} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.slice(2).map((artikel) => (
            <NewsCard key={artikel.titel} artikel={artikel} />
          ))}
        </div>
        </FadeIn>
      </div>
    </section>
  );
}
