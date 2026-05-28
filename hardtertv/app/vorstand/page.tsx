import Image from "next/image";
import { Mail, Phone } from "lucide-react";

type Person = {
  name: string;
  titel: string;
  email?: string;
  telefon?: string;
  bild: string;
};

const placeholder = "/images/Foto Person fehlt.png";

const gruppen: { titel: string; beschreibung: string; mitglieder: Person[] }[] = [
  {
    titel: "Führung",
    beschreibung: "Der geschäftsführende Vorstand leitet den Verein und vertritt ihn nach außen.",
    mitglieder: [
      {
        name: "Oliver Wiegand",
        titel: "1. Vorsitzender",
        email: "1.vorsitzender@hardt-tennis.de",
        telefon: "0172 25 80 209",
        bild: "/images/Oliver 1JPG.jpg",
      },
      {
        name: "Tanja Wiegand",
        titel: "2. Vorsitzende",
        email: "tanjawiegand@icloud.com",
        bild: placeholder,
      },
      {
        name: "Holger Arlt",
        titel: "2. Geschäftsführer",
        email: "woodworm4u@gmail.com",
        telefon: "0151 70 09 01 37",
        bild: "/images/Holger Arlt_1.jpg",
      },
      {
        name: "Hendrick Büncker",
        titel: "2. Geschäftsführer",
        bild: "/images/Hendrick Büncker_1.jpg",
      },
    ],
  },
  {
    titel: "Sport",
    beschreibung: "Die Sportwarte organisieren den Spielbetrieb und koordinieren unsere Mannschaften.",
    mitglieder: [
      {
        name: "Rainer Pieper",
        titel: "1. Sportwart",
        email: "1.sportwart@hardt-tennis.de",
        telefon: "0151 53 55 33 55",
        bild: placeholder,
      },
      {
        name: "Jan Helling",
        titel: "2. Sportwart",
        email: "jan.helling97@web.de",
        bild: placeholder,
      },
    ],
  },
  {
    titel: "Jugend",
    beschreibung: "Die Jugendwarte kümmern sich um unsere jungen Spielerinnen und Spieler.",
    mitglieder: [
      {
        name: "Tabea Wiegand",
        titel: "1. Jugendwartin",
        email: "tabea.wiegand.tw@gmail.com",
        bild: placeholder,
      },
      {
        name: "Florian Gröbel",
        titel: "2. Jugendwart",
        email: "florian.groebel@web.de",
        bild: "/images/Florian Gröbel_1.JPG",
      },
    ],
  },
  {
    titel: "Verwaltung & Platz",
    beschreibung: "Sie sorgen für reibungslose Organisation, Kommunikation und gepflegte Anlagen.",
    mitglieder: [
      {
        name: "Volker Schuhmacher",
        titel: "Schatzmeister",
        email: "schatzmeister@hardt-tennis.de",
        telefon: "0160 99 78 94 11",
        bild: "/images/Volker Schumacher_1.JPG",
      },
      {
        name: "Frank Horn",
        titel: "Pressewart",
        email: "Frank.Horn@vestische.de",
        bild: placeholder,
      },
      {
        name: "André Albert",
        titel: "Breitensportwart",
        email: "info@tennisschule-albert.de",
        bild: "/images/Andre Albert_1.JPG",
      },
      {
        name: "Dieter Schlott",
        titel: "Platzwart",
        email: "pdschlott@unitybox.de",
        bild: "/images/Dieter Schlott_1.jpg",
      },
      {
        name: "Jürgen Mertens",
        titel: "Platzwart",
        email: "juergenmertens62tennis@web.de",
        bild: "/images/Jürgen Mertens_1.jpg",
      },
    ],
  },
];

function VorstandCard({ person }: { person: Person }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-shadow duration-300 hover:shadow-lg">
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={person.bild}
          alt={person.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-kanturmuy text-xl font-normal tracking-tight text-black">
          {person.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="h-[2px] w-4 rounded-full bg-[#e1fcad]" />
          <span className="text-xs font-light text-black/50">{person.titel}</span>
        </div>

        {(person.email || person.telefon) && (
          <div className="mt-4 space-y-2 border-t border-black/[0.06] pt-4">
            {person.email && (
              <a
                href={`mailto:${person.email}`}
                className="flex items-center gap-2 text-xs text-black/50 transition-colors hover:text-black"
              >
                <Mail className="size-3 shrink-0" strokeWidth={1.5} />
                <span className="truncate">{person.email}</span>
              </a>
            )}
            {person.telefon && (
              <a
                href={`tel:${person.telefon.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-xs text-black/50 transition-colors hover:text-black"
              >
                <Phone className="size-3 shrink-0" strokeWidth={1.5} />
                {person.telefon}
              </a>
            )}
          </div>
        )}
      </div>

      <div className="h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
    </div>
  );
}

export default function VorstandPage() {
  const total = gruppen.reduce((sum, g) => sum + g.mitglieder.length, 0);

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
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Der Verein</span>
          </div>

          <h1 className="font-kanturmuy max-w-3xl text-4xl font-normal tracking-tighter text-white sm:text-5xl md:text-7xl">
            Unser{" "}
            <span className="relative inline-block">
              Vorstand
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light text-white/60 md:text-lg">
            Lern die Menschen kennen, die unseren Verein leiten, gestalten und am Leben erhalten —
            ehrenamtlich und mit vollem Herz dabei.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-[#e1fcad]/20 px-4 py-2 text-sm font-light text-[#e1fcad]">
              {total} Mitglieder
            </span>
            {gruppen.map((g) => (
              <span
                key={g.titel}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-light text-white/60"
              >
                {g.titel}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Gruppen */}
      {gruppen.map((gruppe, gi) => (
        <section
          key={gruppe.titel}
          className={`px-6 py-20 md:px-12 lg:px-20 lg:py-28 ${gi % 2 === 0 ? "bg-white" : "bg-[#f9f9f7]"}`}
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-black/30" />
                <span className="text-xs uppercase tracking-[0.2em] text-black/50">
                  {gruppe.titel}
                </span>
              </div>
              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
                <span className="relative inline-block">
                  {gruppe.titel}
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
                </span>
              </h2>
              <p className="mt-3 max-w-lg text-base font-light text-black/50">
                {gruppe.beschreibung}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {gruppe.mitglieder.map((person) => (
                <VorstandCard key={person.name} person={person} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="bg-[#e1fcad] px-6 py-20 md:px-12 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter text-black sm:text-4xl md:text-5xl">
                Du möchtest mitmachen?
              </h2>
              <p className="mt-3 max-w-md text-base font-light text-black/60">
                Wir freuen uns über engagierte Mitglieder, die den Verein aktiv mitgestalten wollen.
                Meld dich einfach bei uns.
              </p>
            </div>
            <a href="mailto:1.vorsitzender@hardt-tennis.de" className="shrink-0">
              <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                <span className="rounded-full bg-[#122023] px-6 py-3 text-sm font-medium text-[#e1fcad] duration-500 ease-in-out group-hover:bg-black group-hover:text-white">
                  Kontakt aufnehmen
                </span>
                <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#122023] text-[#e1fcad] duration-500 ease-in-out group-hover:bg-black group-hover:text-white">
                  <Mail className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" strokeWidth={1.5} />
                  <Mail className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" strokeWidth={1.5} />
                </div>
              </button>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
