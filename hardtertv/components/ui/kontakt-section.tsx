"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";
import { FadeIn } from "@/components/ui/fade-in";

const kontaktInfo = [
  {
    icon: MapPin,
    label: "Adresse",
    wert: "Gahlener Str. 204\n46282 Dorsten",
  },
  {
    icon: Phone,
    label: "Vorsitzender",
    wert: "0172 25 80 209",
    href: "tel:+4917225800209",
  },
  {
    icon: Mail,
    label: "E-Mail",
    wert: "1.vorsitzender@hardt-tennis.de",
    href: "mailto:1.vorsitzender@hardt-tennis.de",
  },
];

export default function KontaktSection() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section id="contact" className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-black/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-black/50">
              Kontakt
            </span>
          </div>

          <h2 className="font-kanturmuy max-w-xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            <BlurTextEffect>Schreibe </BlurTextEffect>
            <span className="relative inline-block">
              <BlurTextEffect>uns direkt</BlurTextEffect>
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h2>

          <p className="mt-4 max-w-md text-base font-light text-black/50">
            Nehmt direkt Kontakt mit uns auf — wir melden uns so schnell wie möglich.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              {kontaktInfo.map(({ icon: Icon, label, wert, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e1fcad]">
                    <Icon className="size-4 text-black" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-black/35">{label}</p>
                    {href ? (
                      <a href={href} className="mt-0.5 whitespace-pre-line text-sm text-black/70 transition-colors hover:text-black">
                        {wert}
                      </a>
                    ) : (
                      <p className="mt-0.5 whitespace-pre-line text-sm text-black/70">{wert}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              {sent ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-[#e1fcad]">
                    <ArrowUpRight className="size-5 text-black" strokeWidth={2} />
                  </div>
                  <p className="font-kanturmuy text-xl tracking-tight text-black">Nachricht gesendet!</p>
                  <p className="text-sm text-black/50">Wir melden uns bald bei dir.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-widest text-black/40">Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black/30 focus:bg-white"
                        placeholder="Dein Name"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-widest text-black/40">E-Mail</label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black/30 focus:bg-white"
                        placeholder="deine@email.de"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-widest text-black/40">Nachricht</label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      className="resize-none rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black/30 focus:bg-white"
                      placeholder="Deine Nachricht an den HTV..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="group flex cursor-pointer items-center gap-0 self-start rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none"
                  >
                    <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                      Nachricht senden
                    </span>
                    <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                      <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                      <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                    </div>
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/[0.06] min-h-[280px] sm:min-h-[360px] lg:min-h-0">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2474.959200775651!2d6.927527713413548!3d51.6605833717312!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b8f26e657412d9%3A0x9088105a5549feb5!2sHardter%20TV!5e0!3m2!1sde!2sde!4v1737024831814!5m2!1sde!2sde"
              title="Standort Hardter TV"
              className="h-full w-full"
              style={{ border: 0, minHeight: "280px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
        </FadeIn>
      </div>
    </section>
  );
}
