"use client";

import { ArrowUpRight, Trophy, Users, MapPin, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";
import { FadeIn } from "@/components/ui/fade-in";

const stats = [
  { icon: Trophy, value: "1952", label: "Gegründet" },
  { icon: Users, value: "300+", label: "Mitglieder" },
  { icon: MapPin, value: "6", label: "Tennisplätze" },
  { icon: Zap, value: "2", label: "Flutlichtplätze" },
];

function StatCard({ icon: Icon, value, label }: { icon: typeof Trophy; value: string; label: string }) {
  return (
    <div className="flex flex-col items-start gap-2 border-t border-black/10 pt-5">
      <Icon className="size-5 text-black/40" strokeWidth={1.5} />
      <span className="font-kanturmuy text-3xl font-normal tracking-tight sm:text-4xl">{value}</span>
      <span className="text-sm text-black/50 uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function WelcomeSection() {
  return (
    <section id="about" className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
      <div className="mx-auto max-w-7xl">

        <FadeIn>
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-black/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-black/50">
              Über den Verein
            </span>
          </div>

          <h2 className="font-kanturmuy max-w-6xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-6xl lg:text-7xl" style={{ wordBreak: "keep-all", hyphens: "none" }}>
            <BlurTextEffect>Hardter TV, ein Verein für Jedermann mit bezahlbaren Beiträgen!</BlurTextEffect>
          </h2>

          <p className="mt-6 max-w-2xl text-base font-light text-black/60 md:text-lg">
            Herzlich willkommen beim Hardter Tennisverein in Dorsten. Erlebe die
            Freude am Tennis und werde Teil unserer aktiven Gemeinschaft.
          </p>
        </FadeIn>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:mt-14 md:grid-cols-4">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={0.1 + i * 0.08}>
              <StatCard {...stat} />
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.15}>
        <div className="mt-10 grid grid-cols-1 gap-8 lg:mt-20 lg:grid-cols-2 lg:gap-20">
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src="/images/Tennisball an Linie groß.jpg"
              alt="Tennisball an der Linie"
              width={900}
              height={700}
              className="h-full w-full object-cover object-center"
              style={{ minHeight: "260px" }}
            />
            <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-[#e1fcad] px-4 py-2">
              <Trophy className="size-4 text-black" strokeWidth={1.5} />
              <span className="text-sm font-medium text-black">
                Hardter TV Dorsten
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4 text-base font-light leading-relaxed text-black/70 md:text-lg">
              <p>
                Gerne zeigen wir Ihnen unsere 6-Platzanlage mit Clubhaus direkt am Kanal gelegen. Die Anlage ist im Normalfall von Mitte April bis Ende Oktober geöffnet. Bei uns kann Tennis als Hobby-, Mannschafts- oder Leistungssport betrieben werden.
              </p>
              <p>
                Zum gemütlichen Beisammensein vor und nach dem Tennisspielen lädt die großzügig angelegte Terrasse ein. Von dieser aus können Sie die gesamte Anlage überblicken und sie ist zu einem beliebten Treffpunkt geworden.
              </p>
              <p>
                Für alle diejenigen, die das Tennisspielen beim HTV einmal ausprobieren wollen, bieten wir die sogenannte Greencard an. Mit dieser kann Jeder erst einmal für wenig Geld ab Saisonbeginn bis zum 31.7. des jeweiligen Jahres schnuppern. Denn bevor Jemand Mitglied werden muss, soll er sich sicher sein, dass der Tennissport und insbesondere der HTV genau das Richtige sind, um in der Freizeit aktiv zu sein.
              </p>
              <p>
                Wir wünschen viel Spaß beim virtuellen Rundgang auf unserer Homepage und bemühen uns die Internetseite nach Möglichkeit immer aktuell zu halten. Für Anmerkungen, Anregungen, Kommunikation etc. steht Ihnen unser Kontaktformular zur Verfügung! Ansonsten freuen wir uns auf Ihren Besuch auf unserer Anlage.
              </p>
              <p className="font-normal text-black/80">
                Oliver Wiegand<br />
                1. Vorsitzender HTV
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4">
              <Link href="/mitgliedschaft">
                <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                  <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                    Jetzt Mitglied werden
                  </span>
                  <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                    <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                    <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                  </div>
                </button>
              </Link>
              <Link
                href="/training"
                className="text-sm font-light text-black/50 underline-offset-4 hover:underline"
              >
                Training entdecken →
              </Link>
            </div>
          </div>
        </div>
        </FadeIn>
      </div>
    </section>
  );
}
