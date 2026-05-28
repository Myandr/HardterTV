import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { teams, getTeamBySlug } from "@/lib/mannschaften-data";
import TeamPlaceholder from "@/components/ui/team-placeholder";

export function generateStaticParams() {
  return teams.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) return {};
  return {
    title: `${team.name} – Hardter TV`,
    description: `${team.name} des Hardter Tennisverein – Saison 2024/2025`,
  };
}

function isEmail(s: string) {
  return s.includes("@");
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) notFound();

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#122023]">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-[#e1fcad]" />
          <div className="absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-[#e1fcad]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-10 md:px-12 lg:px-20 lg:pb-20 lg:pt-12">
          {/* Back link */}
          <Link
            href="/mannschaften"
            className="mb-10 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-[#e1fcad]"
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} />
            Zurück zur Übersicht
          </Link>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.08]">
              {team.bild ? (
                <>
                  <Image
                    src={team.bild}
                    alt={`${team.name} Mannschaftsfoto`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </>
              ) : (
                <TeamPlaceholder />
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-6">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px w-8 bg-white/30" />
                  <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                    {team.kategorie}
                  </span>
                </div>
                <h1 className="font-kanturmuy text-4xl font-normal tracking-tighter text-white sm:text-5xl md:text-6xl">
                  {team.name}
                </h1>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-xs uppercase tracking-[0.15em] text-white/30">
                  Saison 2024 / 2025
                </p>
                {isEmail(team.kontakt) ? (
                  <a
                    href={`mailto:${team.kontakt}`}
                    className="inline-flex items-center gap-2.5 text-sm text-white/60 transition-colors hover:text-[#e1fcad]"
                  >
                    <Mail className="size-4 shrink-0" strokeWidth={1.5} />
                    {team.kontakt}
                  </a>
                ) : (
                  <div className="inline-flex items-center gap-2.5 text-sm text-white/60">
                    <Phone className="size-4 shrink-0" strokeWidth={1.5} />
                    {team.kontakt}
                  </div>
                )}
              </div>

              <div className="mt-2 h-px w-full bg-white/[0.06]" />

              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-white/[0.12] px-4 py-2 text-xs text-white/50">
                  Hardter TV
                </span>
                <span className="rounded-full bg-[#e1fcad]/10 px-4 py-2 text-xs text-[#e1fcad]">
                  WTV
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Liga iframe */}
      <section className="bg-[#f9f9f7] px-6 py-16 md:px-12 lg:px-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-black/20" />
              <span className="text-xs uppercase tracking-[0.2em] text-black/40">
                Ligadaten
              </span>
            </div>
            <h2 className="font-kanturmuy text-2xl font-normal tracking-tighter sm:text-3xl">
              Tabelle & Ergebnisse
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="h-[3px] w-4 rounded-full bg-[#e1fcad]" />
                <span className="text-sm font-medium text-black/70">
                  {team.name} – Saison 2024/2025
                </span>
              </div>
              <span className="text-xs text-black/30">wtv.liga.nu</span>
            </div>
            <div className="p-0">
              <iframe
                src={team.ligaUrl}
                title={`${team.name} Ligadaten`}
                loading="lazy"
                className="h-[1000px] w-full border-0 md:h-[1100px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Back CTA */}
      <section className="bg-[#122023] px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-white/40">Alle Mannschaften im Überblick</p>
          <Link
            href="/mannschaften"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm text-white/70 transition-colors hover:border-[#e1fcad]/40 hover:text-[#e1fcad]"
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} />
            Zurück zur Übersicht
          </Link>
        </div>
      </section>
    </main>
  );
}
