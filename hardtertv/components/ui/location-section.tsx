"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";
import { FadeIn } from "@/components/ui/fade-in";
import { useCookieConsent } from "@/hooks/use-cookie-consent";

export type StandortKarte = {
  id: string;
  titel: string;
  untertitel: string;
  bild: { url: string; alt: string } | null;
  href: string;
};

export type LocationSectionProps = {
  eyebrow: string;
  headlineTeil1: string;
  headlineTeil2: string;
  intro: string;
  ctaLabel: string;
  karten: StandortKarte[];
};

function LocationCard({ location, mapsAllowed }: { location: StandortKarte; mapsAllowed: boolean }) {
  const isExternal = location.href.startsWith("http");
  const blocked = isExternal && !mapsAllowed;

  const cardContent = (
    <div className="overflow-hidden rounded-2xl bg-black/[0.03] transition-all duration-500 hover:shadow-xl">
      <div className="relative h-52 overflow-hidden">
        {location.bild ? (
          <Image
            src={location.bild.url}
            alt={location.bild.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
            className={`object-cover object-center transition-transform duration-700 ease-out ${!blocked ? "group-hover:scale-105" : "blur-sm"}`}
          />
        ) : (
          <div className="absolute inset-0 bg-black/[0.04]" />
        )}
        {blocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 p-4 text-center">
            <svg className="size-5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            <p className="text-xs font-light text-white/80 leading-snug">Google Maps nicht aktiviert</p>
            <Link
              href="/cookies"
              className="mt-1 rounded-full bg-white/20 px-3 py-1 text-xs text-white transition-colors hover:bg-white/30"
              onClick={(e) => e.stopPropagation()}
            >
              Einstellungen
            </Link>
          </div>
        )}
        {!blocked && (
          <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
        )}
        {!blocked && (
          <div className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
            <ArrowUpRight className="size-4 text-black" strokeWidth={2} />
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-kanturmuy text-xl font-normal tracking-tight text-black">
          {location.titel}
        </h3>
        {location.untertitel && (
          <p className="mt-1 text-sm font-light text-black/50 whitespace-pre-line">
            {location.untertitel}
          </p>
        )}
        {!blocked && (
          <div className="mt-4 h-[2px] w-0 rounded-full bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
        )}
      </div>
    </div>
  );

  if (blocked) return <div>{cardContent}</div>;

  return (
    <div>
      <Link
        href={location.href}
        className="group block"
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {cardContent}
      </Link>
    </div>
  );
}

export default function LocationSection({
  eyebrow,
  headlineTeil1,
  headlineTeil2,
  intro,
  ctaLabel,
  karten,
}: LocationSectionProps) {
  const consent = useCookieConsent();
  const mapsAllowed = consent?.maps ?? false;

  return (
    <section id="one" className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-black/30" />
              <span className="text-xs uppercase tracking-[0.2em] text-black/50">
                {eyebrow}
              </span>
            </div>

            <h2 className="font-kanturmuy max-w-xl text-4xl font-normal tracking-tighter md:text-5xl lg:text-6xl">
              <BlurTextEffect>{`${headlineTeil1} `}</BlurTextEffect>
              <span className="relative inline-block">
                <BlurTextEffect>{headlineTeil2}</BlurTextEffect>
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>

            <p className="mt-4 max-w-md text-base font-light text-black/50">
              {intro}
            </p>
          </div>

          <div className="shrink-0">
            <Link href="/mitgliedschaft">
              <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                  {ctaLabel}
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

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {karten.map((karte, i) => (
            <FadeIn key={karte.id} delay={0.1 + i * 0.08}>
              <LocationCard location={karte} mapsAllowed={mapsAllowed} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
