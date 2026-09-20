import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";

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

export default async function Footer() {
  const payload = await getPayload({ config });
  const data = await payload.findGlobal({ slug: "footer", depth: 0 });

  const kontaktpersonen = (data.kontaktpersonen ?? []).map((person, i) => ({
    id: person.id ?? String(i),
    label: person.label,
    name: person.name,
    email: person.email,
  }));

  return (
    <footer className="bg-[#0d1a1c] text-white">
      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-12 lg:px-20 lg:py-20">
        <FadeIn>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="h-[3px] w-5 rounded-full bg-[#e1fcad]" />
              <span className="font-kanturmuy text-xl tracking-tight">{data.vereinsname}</span>
            </div>
            <p className="text-sm font-light leading-relaxed text-white/50">
              {data.beschreibung}
            </p>
            <a
              href={data.instagram?.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-white/50 transition-colors hover:border-[#e1fcad]/40 hover:text-[#e1fcad]"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
              </svg>
              {data.instagram?.handle}
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
              {data.vereinsname}<br />
              {data.strasse}<br />
              {data.plz} {data.ort}
            </p>
            <ul className="flex flex-col gap-2.5">
              {kontaktpersonen.map((k) => (
                <li key={k.id} className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-widest text-white/25">{k.label}</span>
                  <a
                    href={`mailto:${k.email}`}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {k.name}
                  </a>
                </li>
              ))}
              <li className="flex flex-col">
                <span className="text-[11px] uppercase tracking-widest text-white/25">E-Mail</span>
                <a
                  href={`mailto:${data.email}`}
                  className="text-sm text-white/50 transition-colors hover:text-white"
                >
                  {data.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Fun fact */}
          <div>
            <h4 className="mb-5 text-xs uppercase tracking-[0.2em] text-white/30">
              {data.funFactTitel}
            </h4>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
              <p className="text-sm font-light leading-relaxed text-white/40">
                {data.funFact}
              </p>
              <div className="mt-4 h-px w-full bg-white/[0.06]" />
              <p className="mt-4 text-sm font-light leading-relaxed text-white/40">
                {data.shop?.textVor}{" "}
                <a
                  href={data.shop?.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e1fcad]/70 transition-colors hover:text-[#e1fcad]"
                >
                  {data.shop?.linkText}
                </a>{" "}
                {data.shop?.textNach}
              </p>
            </div>
          </div>
        </div>
        </FadeIn>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-white/30 md:flex-row md:px-12 lg:px-20">
          <p>{`© ${new Date().getFullYear()} ${data.copyrightName}. Alle Rechte vorbehalten.`}</p>
          <div className="flex gap-5">
            <Link href="/datenschutz" className="transition-colors hover:text-white">
              Datenschutz
            </Link>
            <Link href="/impressum" className="transition-colors hover:text-white">
              Impressum
            </Link>
            <Link href="/cookies" className="transition-colors hover:text-white">
              Cookie-Einstellungen
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
