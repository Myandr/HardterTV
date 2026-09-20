"use client";

import Image from "next/image";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";
import { FadeIn } from "@/components/ui/fade-in";

export type NewsItem = {
  id: string;
  datum: string;
  titel: string;
  excerpt: string;
  bild: string | null;
  kategorie: string;
};

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
  artikel: NewsItem;
  featured?: boolean;
}) {
  if (featured) {
    return (
      <div className="group col-span-1 flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-shadow duration-300 hover:shadow-lg lg:col-span-2 lg:flex-row">
        <div className="relative h-56 overflow-hidden lg:h-auto lg:w-1/2">
          {artikel.bild ? (
            <Image
              src={artikel.bild}
              alt={artikel.titel}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-black/[0.04]" />
          )}
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
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-shadow duration-300 hover:shadow-lg">
      <div className="relative h-44 overflow-hidden">
        {artikel.bild ? (
          <Image
            src={artikel.bild}
            alt={artikel.titel}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-black/[0.04]" />
        )}
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
      </div>

      <div className="h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
    </div>
  );
}

export default function NewsSection({ news }: { news: NewsItem[] }) {
  if (news.length === 0) return null;

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
          </div>
        </FadeIn>

        <div className="mt-8 grid grid-cols-1 gap-6 md:mt-14 lg:grid-cols-3">
          <FadeIn delay={0.1}><NewsCard artikel={news[0]} featured /></FadeIn>
          {news[1] && <FadeIn delay={0.18}><NewsCard artikel={news[1]} /></FadeIn>}
        </div>

        {news.length > 2 && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.slice(2).map((artikel, i) => (
              <FadeIn key={artikel.id} delay={0.08 + i * 0.08}>
                <NewsCard artikel={artikel} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
