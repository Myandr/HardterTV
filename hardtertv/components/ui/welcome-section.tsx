"use client";

import { ArrowUpRight, Trophy, Users, MapPin, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";
import { FadeIn } from "@/components/ui/fade-in";

const stats = [
  { icon: Trophy, value: "1952", label: "Gegründet" },
  { icon: Users, value: "300+", label: "Mitglieder" },
  { icon: MapPin, value: "8", label: "Tennisplätze" },
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

          <h2 className="font-kanturmuy max-w-4xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-6xl lg:text-7xl">
            <BlurTextEffect>Willkommen beim </BlurTextEffect>
            <span className="relative inline-block">
              <BlurTextEffect>Hardter TV</BlurTextEffect>
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-base font-light text-black/60 md:text-lg">
            Herzlich willkommen beim Hardter Tennisverein in Dorsten. Erlebe die
            Freude am Tennis und werde Teil unserer aktiven Gemeinschaft.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:mt-14 md:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </FadeIn>

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
                Und los geht es mit einer sehr erfreulichen Nachricht: Der Antrag des HTV
                auf Mittel aus der Sportpauschale zur Anschaffung einer Flutlichtanlage
                für zwei Plätze wurde angenommen. Somit wird der HTV der erste
                Tennisverein in Dorsten sein, der über eine solche Anlage für
                zwei Tennisfelder verfügen wird.
              </p>
              <p>
                Neben der möglichen Ausweitung der Trainingszeiten auch in die späten
                Abendstunden sieht der HTV Chancen, mit Nachturnieren eine Bereicherung
                des Vereinslebens zu erzielen. Realisiert werden soll die Flutlichtanlage
                auf unseren Plätzen 5 und 6.
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
