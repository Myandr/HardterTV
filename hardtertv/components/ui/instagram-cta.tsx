"use client";

import { BlurTextEffect } from "@/components/ui/blur-text-effect";
import { FadeIn } from "@/components/ui/fade-in";

export default function InstagramCta() {
  return (
    <section className="bg-[#122023] px-6 py-16 md:px-12 lg:px-20">
      <FadeIn>
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Social Media
          </p>
          <h2 className="font-kanturmuy text-3xl font-normal tracking-tight text-white md:text-4xl">
            <BlurTextEffect>Folge uns auf Instagram</BlurTextEffect>
          </h2>
          <p className="max-w-sm text-sm font-light text-white/50">
            Aktuelle Bilder, Spielberichte und Vereinsleben — immer live auf{" "}
            <span className="text-white/70">@hardtertv</span>
          </p>
        </div>

        <div className="shrink-0">
          <a
            href="https://www.instagram.com/hardtertv/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-full bg-[#e1fcad] px-6 py-3.5 text-sm font-medium text-black transition-all duration-300 hover:bg-white"
          >
            <svg className="size-4 shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
            </svg>
            @hardtertv auf Instagram
          </a>
        </div>
      </div>
      </FadeIn>
    </section>
  );
}
