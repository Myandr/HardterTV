"use client";

import { ArrowUpRight, Mail, Phone, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";
import { FadeIn } from "@/components/ui/fade-in";

const vorstand = [
  {
    name: "Oliver Wiegand",
    titel: "1. Vorsitzender",
    email: "1.vorsitzender@hardt-tennis.de",
    telefon: "0172 25 80 209",
    bild: "/images/Oliver 1JPG copy.jpg",
  },
  {
    name: "Holger Arlt",
    titel: "2. Geschäftsführer",
    email: "woodworm4u@gmail.com",
    telefon: "0151 70 09 01 37",
    bild: "/images/Holger Arlt_1.jpg",
  },
  {
    name: "Volker Schuhmacher",
    titel: "Schatzmeister",
    email: "schatzmeister@hardt-tennis.de",
    telefon: "0160 99 78 94 11",
    bild: "/images/Volker Schumacher_1.JPG",
  },
];

function VorstandCard({ person }: { person: (typeof vorstand)[0] }) {
  return (
    <div className="group flex flex-col rounded-2xl bg-white overflow-hidden border border-black/[0.06] transition-shadow duration-300 hover:shadow-lg">
      <div className="relative h-72 w-full overflow-hidden">
        <Image
          src={person.bild}
          alt={person.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4">
          <h3 className="font-kanturmuy text-2xl font-normal tracking-tight text-black">
            {person.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-[2px] w-5 bg-[#e1fcad] rounded-full" />
            <span className="text-sm font-light text-black/50">{person.titel}</span>
          </div>
        </div>

        <div className="mt-auto space-y-2.5 border-t border-black/[0.06] pt-4">
          <a
            href={`mailto:${person.email}`}
            className="flex items-center gap-2.5 text-sm text-black/50 transition-colors hover:text-black"
          >
            <Mail className="size-3.5 shrink-0" strokeWidth={1.5} />
            <span className="truncate">{person.email}</span>
          </a>
          <a
            href={`tel:${person.telefon.replace(/\s/g, "")}`}
            className="flex items-center gap-2.5 text-sm text-black/50 transition-colors hover:text-black"
          >
            <Phone className="size-3.5 shrink-0" strokeWidth={1.5} />
            {person.telefon}
          </a>
        </div>
      </div>

      <div className="h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
    </div>
  );
}

export default function VorstandSection() {
  return (
    <section id="trainer" className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-black/30" />
              <span className="text-xs uppercase tracking-[0.2em] text-black/50">
                Menschen hinter dem HTV
              </span>
            </div>

            <h2 className="font-kanturmuy max-w-xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              <BlurTextEffect>Unser </BlurTextEffect>
              <span className="relative inline-block">
                <BlurTextEffect>Vorstand</BlurTextEffect>
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>

            <p className="mt-4 max-w-md text-base font-light text-black/50">
              Lernen Sie die Menschen kennen, die unseren Verein leiten und gestalten.
            </p>
          </div>

          <div className="shrink-0">
            <Link href="/vorstand">
              <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                  Ganzen Vorstand sehen
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
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-14 lg:grid-cols-3">
          {vorstand.map((person) => (
            <VorstandCard key={person.name} person={person} />
          ))}
        </div>
        </FadeIn>
      </div>
    </section>
  );
}
