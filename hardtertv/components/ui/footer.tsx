import Link from "next/link";

const links = [
  { label: "Home", href: "/" },
  { label: "Über uns", href: "/#about" },
  { label: "Termine", href: "/#termine" },
  { label: "Vorstand", href: "/vorstand" },
  { label: "Neuigkeiten", href: "/#news" },
  { label: "Kontakt", href: "/#contact" },
  { label: "Training", href: "/training" },
  { label: "Mannschaften", href: "/mannschaften" },
  { label: "Galerie", href: "/galerie" },
  { label: "Mitgliedschaft", href: "/mitgliedschaft" },
];

const kontakt = [
  { label: "Vorsitzender", wert: "0172 25 80 209", href: "tel:+4917225800209" },
  { label: "Geschäftsführer", wert: "0151 70 09 01 37", href: "tel:+4915170090137" },
  { label: "Sportwart", wert: "0151 53 55 33 55", href: "tel:+4915153553355" },
  { label: "E-Mail", wert: "1.vorsitzender@hardt-tennis.de", href: "mailto:1.vorsitzender@hardt-tennis.de" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0d1a1c] text-white">
      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-12 lg:px-20 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="h-[3px] w-5 rounded-full bg-[#e1fcad]" />
              <span className="font-kanturmuy text-xl tracking-tight">Hardter TV</span>
            </div>
            <p className="text-sm font-light leading-relaxed text-white/50">
              Ihr Tennisverein für Sport, Spaß und Gemeinschaft in
              Dorsten.
            </p>
            <a
              href="https://www.instagram.com/hardtertv/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-white/50 transition-colors hover:border-[#e1fcad]/40 hover:text-[#e1fcad]"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
              </svg>
              @hardtertv
            </a>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-5 text-xs uppercase tracking-[0.2em] text-white/30">
              Schnelle Links
            </h4>
            <ul className="flex flex-col gap-2.5">
              {links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="mb-5 text-xs uppercase tracking-[0.2em] text-white/30">
              Kontakt
            </h4>
            <p className="mb-4 text-sm font-light leading-relaxed text-white/50">
              Hardter TV<br />
              Gahlener Str. 204<br />
              46282 Dorsten
            </p>
            <ul className="flex flex-col gap-2.5">
              {kontakt.map((k) => (
                <li key={k.label} className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-widest text-white/25">{k.label}</span>
                  <a
                    href={k.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {k.wert}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Fun fact */}
          <div>
            <h4 className="mb-5 text-xs uppercase tracking-[0.2em] text-white/30">
              Wusstest du schon?
            </h4>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
              <p className="text-sm font-light leading-relaxed text-white/40">
                Der längste Tennismatch der Geschichte dauerte über 11 Stunden —
                John Isner gegen Nicolas Mahut in Wimbledon 2010.
              </p>
              <div className="mt-4 h-px w-full bg-white/[0.06]" />
              <p className="mt-4 text-sm font-light leading-relaxed text-white/40">
                Mitglied im{" "}
                <a
                  href="https://matchpoint24.de/collections/tennisclub-hardter-tv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e1fcad]/70 transition-colors hover:text-[#e1fcad]"
                >
                  HTV-Shop
                </a>{" "}
                — Ausrüstung direkt vom Verein.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-white/30 md:flex-row md:px-12 lg:px-20">
          <p>© 2026 Hardter TV. Alle Rechte vorbehalten.</p>
          <div className="flex gap-5">
            <Link href="/datenschutz" className="transition-colors hover:text-white">
              Datenschutz
            </Link>
            <Link href="/impressum" className="transition-colors hover:text-white">
              Impressum
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
