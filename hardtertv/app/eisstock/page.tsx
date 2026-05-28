import { MapPin, Users, Euro, CalendarDays, ArrowUpRight } from "lucide-react";
import { EisWidget } from "@/components/ui/eis-widget";

const infoKacheln = [
  {
    icon: MapPin,
    title: "Ort",
    description: "Demo-Standort, Demo-Adresse",
  },
  {
    icon: Users,
    title: "Gruppengröße",
    description: "Demo: 6–20 Personen",
  },
  {
    icon: Euro,
    title: "Preis",
    description: "Demo: ab X€ pro Person",
  },
  {
    icon: CalendarDays,
    title: "Saison",
    description: "Demo: Oktober – März",
  },
];

export default function EisPage() {
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
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Eisstockschießen</span>
          </div>

          <h1 className="font-kanturmuy max-w-3xl text-4xl font-normal tracking-tighter text-white sm:text-5xl md:text-7xl">
            Eisstockschießen{" "}
            <span className="relative inline-block">
              beim HTV
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light text-white/60 md:text-lg">
            Entdecke Eisstockschießen beim Hardter Tennisverein — Demo-Text: Spaß für Gruppen,
            Vereine und Firmenevents. Jetzt direkt online buchen.
          </p>

          <div className="mt-10">
            <a href="#buchen">
              <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-white group-hover:text-black">
                  Jetzt buchen
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

      {/* Info-Kacheln */}
      <section className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-black/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-black/50">Das Angebot</span>
          </div>

          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="font-kanturmuy max-w-xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Alles auf einen{" "}
              <span className="relative inline-block">
                Blick
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
            <p className="max-w-sm text-base font-light text-black/50">
              Demo-Text: Alle wichtigen Infos zum Eisstockschießen beim HTV.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {infoKacheln.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-6 transition-shadow duration-300 hover:shadow-lg"
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

      {/* Buchungs-Widget */}
      <section id="buchen" className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-black/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-black/50">Online buchen</span>
          </div>

          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="font-kanturmuy max-w-xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
              Wähle deinen{" "}
              <span className="relative inline-block">
                Wunschtermin
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
            <p className="max-w-sm text-base font-light text-black/50">
              Buche deinen Termin direkt online — schnell, einfach und ohne Telefonat.
            </p>
          </div>

          <EisWidget />
        </div>
      </section>
    </main>
  );
}
