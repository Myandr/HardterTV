import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Phone,
  Mail,
  Dumbbell,
  Users,
  Trophy,
  Calendar,
  Star,
  UserCheck,
  MapPin,
  ExternalLink,
} from "lucide-react";

const angebote = [
  {
    icon: UserCheck,
    title: "Einzelstunden",
    description: "Individuelles Training abgestimmt auf dein Spielniveau und deine Ziele.",
  },
  {
    icon: Users,
    title: "Gruppentraining",
    description: "Gemeinsam mehr Spaß — Training in kleinen Gruppen für alle Altersklassen.",
  },
  {
    icon: Trophy,
    title: "Mannschaftstraining",
    description: "Vorbereitung für Vereinsmannschaften auf den Wettkampf.",
  },
  {
    icon: Dumbbell,
    title: "Spielvorbereitung",
    description: "Gezielte Einheiten zur taktischen und technischen Matchvorbereitung.",
  },
  {
    icon: Star,
    title: "Turnierbegleitung",
    description: "Coaching und Unterstützung bei Turnieren auf allen Niveaus.",
  },
  {
    icon: Calendar,
    title: "Schnupperstunden",
    description: "Noch nie Tennis gespielt? Lern das Spiel bei einer unverbindlichen Schnupperstunde kennen.",
  },
];

export default function TrainingPage() {
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
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Training</span>
          </div>

          <h1 className="font-kanturmuy max-w-3xl text-4xl font-normal tracking-tighter text-white sm:text-5xl md:text-7xl">
            Tennisschule{" "}
            <span className="relative inline-block">
              André Albert
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light text-white/60 md:text-lg">
            Wir l(i)eben Tennis – das ist das Motto von André Albert und dem Team seiner
            Tennisschule, mit dem er seit 2005 unseren Verein betreut.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a href="tel:+4917559049030">
              <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-white group-hover:text-black">
                  Jetzt anrufen
                </span>
                <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover:bg-white group-hover:text-black">
                  <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                  <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                </div>
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Trainer Profile */}
      <section id="trainer" className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-black/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-black/50">Euer Trainer</span>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Photo */}
            <div className="group relative overflow-hidden rounded-2xl">
              <Image
                src="/images/Andre Albert_1.JPG"
                alt="André Albert – Tennislehrer"
                width={900}
                height={1100}
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                style={{ minHeight: "420px" }}
              />
              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-[#e1fcad] px-4 py-2">
                <Trophy className="size-4 text-black" strokeWidth={1.5} />
                <span className="text-sm font-medium text-black">Seit 2005 beim HTV</span>
              </div>
              <div className="h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full absolute bottom-0 left-0" />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <h2 className="font-kanturmuy text-4xl font-normal tracking-tight text-black sm:text-5xl">
                André Albert
              </h2>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-[2px] w-5 rounded-full bg-[#e1fcad]" />
                <span className="text-sm font-light text-black/50">Tennislehrer & Vereinstrainer</span>
              </div>

              <div className="mt-8 space-y-4 text-base font-light leading-relaxed text-black/70">
                <p>
                  André Albert ist seit 2005 selbstständiger Tennislehrer und betreut den
                  Hardter Tennisverein mit vollem Einsatz. Als ehemaliger Leistungsspieler
                  mit Deutschlandranking bringt er nicht nur technisches Know-how, sondern
                  auch die Leidenschaft für das Spiel mit.
                </p>
                <p>
                  Mit seiner B-Trainer-Lizenz des Deutschen Tennisbundes und jahrelanger
                  Erfahrung bietet er maßgeschneidertes Training für Anfänger, Fortgeschrittene
                  und ambitionierte Wettkampfspieler.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 border-t border-black/10 pt-4">
                  <span className="font-kanturmuy text-2xl font-normal tracking-tight">2005</span>
                  <span className="text-xs uppercase tracking-widest text-black/50">Selbstständig seit</span>
                </div>
                <div className="flex flex-col gap-1 border-t border-black/10 pt-4">
                  <span className="font-kanturmuy text-2xl font-normal tracking-tight">B-Lizenz</span>
                  <span className="text-xs uppercase tracking-widest text-black/50">DTB Trainer</span>
                </div>
              </div>

              <div className="mt-8 space-y-3 border-t border-black/[0.06] pt-6">
                <a
                  href="tel:+4917559049030"
                  className="flex items-center gap-3 text-sm text-black/50 transition-colors hover:text-black"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#e1fcad]">
                    <Phone className="size-3.5" strokeWidth={1.5} />
                  </div>
                  0175 59 04 903
                </a>
                <a
                  href="mailto:1.vorsitzender@hardt-tennis.de"
                  className="flex items-center gap-3 text-sm text-black/50 transition-colors hover:text-black"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#e1fcad]">
                    <Mail className="size-3.5" strokeWidth={1.5} />
                  </div>
                  1.vorsitzender@hardt-tennis.de
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Angebote */}
      <section id="angebote" className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-black/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-black/50">Was wir anbieten</span>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="font-kanturmuy max-w-xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Unsere{" "}
              <span className="relative inline-block">
                Trainingsangebote
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
            <p className="max-w-sm text-base font-light text-black/50">
              Für jedes Alter und jedes Niveau — von der ersten Schnupperstunde bis zum Turnierspieler.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
            {angebote.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group flex flex-col rounded-2xl border border-black/[0.06] bg-white p-6 transition-shadow duration-300 hover:shadow-lg overflow-hidden relative"
                >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[#e1fcad]">
                    <Icon className="size-5 text-black" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-kanturmuy text-xl font-normal tracking-tight text-black">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-black/55">
                    {item.description}
                  </p>
                  <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tennishalle Kirchhellen */}
      <section id="anlage" className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="flex flex-col justify-center">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-black/30" />
                <span className="text-xs uppercase tracking-[0.2em] text-black/50">Anlage</span>
              </div>

              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
                Tennishalle{" "}
                <span className="relative inline-block">
                  Kirchhellen
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
                </span>
              </h2>

              <p className="mt-6 text-base font-light leading-relaxed text-black/70">
                Seit dem 1. Oktober 2022 leitet André Albert auch die Tennishalle Kirchhellen.
                Die Halle bietet vier Plätze — drei Sandplätze und einen Teppichplatz — und
                ist damit die ideale Ergänzung für ganzjähriges Training.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { value: "4", label: "Plätze gesamt" },
                  { value: "3", label: "Sandplätze" },
                  { value: "1", label: "Teppichplatz" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col gap-1 border-t border-black/10 pt-4">
                    <span className="font-kanturmuy text-3xl font-normal tracking-tight">{s.value}</span>
                    <span className="text-xs uppercase tracking-widest text-black/50">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="https://www.tennishalle-kirchhellen.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                    <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                      Zur Website der Halle
                    </span>
                    <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                      <ExternalLink className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                      <ExternalLink className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                    </div>
                  </button>
                </a>
                <a
                  href="tel:+4917559049030"
                  className="text-sm font-light text-black/50 underline-offset-4 hover:underline"
                >
                  Direkt anrufen →
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-[#122023] p-8 text-white">
                <MapPin className="mb-4 size-6 text-[#e1fcad]" strokeWidth={1.5} />
                <h3 className="font-kanturmuy text-2xl font-normal tracking-tight">Standort</h3>
                <p className="mt-2 text-sm font-light text-white/60">
                  Gahlener Str. 204<br />46284 Dorsten
                </p>
              </div>
              <div className="rounded-2xl border border-black/[0.06] bg-[#f9f9f7] p-8">
                <Phone className="mb-4 size-6 text-black/40" strokeWidth={1.5} />
                <h3 className="font-kanturmuy text-2xl font-normal tracking-tight">Kontakt</h3>
                <p className="mt-2 text-sm font-light text-black/55">
                  Ruf André direkt an oder schreib uns eine E-Mail — wir melden uns schnellstmöglich.
                </p>
                <div className="mt-4 space-y-2">
                  <a href="tel:+4917559049030" className="block text-sm text-black/70 hover:text-black">
                    0175 59 04 903
                  </a>
                  <a href="mailto:1.vorsitzender@hardt-tennis.de" className="block text-sm text-black/70 hover:text-black">
                    1.vorsitzender@hardt-tennis.de
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#e1fcad] px-6 py-20 md:px-12 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter text-black sm:text-4xl md:text-5xl">
                Bereit für dein erstes Training?
              </h2>
              <p className="mt-3 text-base font-light text-black/60">
                Melde dich jetzt und starte durch — Schnupperstunden jederzeit möglich.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0">
              <a href="tel:+4917559049030">
                <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                  <span className="rounded-full bg-[#122023] px-6 py-3 text-sm font-medium text-[#e1fcad] duration-500 ease-in-out group-hover:bg-black group-hover:text-white">
                    Anrufen
                  </span>
                  <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#122023] text-[#e1fcad] duration-500 ease-in-out group-hover:bg-black group-hover:text-white">
                    <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                    <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                  </div>
                </button>
              </a>
              <Link
                href="/"
                className="flex items-center text-sm font-light text-black/60 underline-offset-4 hover:underline"
              >
                Zurück zur Startseite →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
