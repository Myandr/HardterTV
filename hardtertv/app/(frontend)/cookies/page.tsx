import CookieSettings from "@/components/ui/cookie-settings";
import RichTextBody from "@/components/ui/rich-text";
import { getLegalPage } from "@/lib/get-legal-page";
import { getSeitenTexte } from "@/lib/seiten-texte";
import { getCookieTexte } from "@/lib/cookie-texte";

export const revalidate = 3600;

export const metadata = {
  title: "Cookie-Einstellungen",
  description: "Verwalte deine Cookie-Einstellungen für hardt-tennis.de",
};

export default async function CookiesPage() {
  const [page, texte, cookieTexte] = await Promise.all([
    getLegalPage("cookies"),
    getSeitenTexte(),
    getCookieTexte(),
  ]);

  return (
    <main className="min-h-screen bg-[#f9f9f7] px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-black/30" />
          <span className="text-xs uppercase tracking-[0.2em] text-black/50">{texte.rechtliches.cookiesEyebrow}</span>
        </div>

        <h1 className="font-kanturmuy text-4xl font-normal tracking-tighter text-black sm:text-5xl">
          {texte.rechtliches.cookiesTitelVorne}
          <span className="relative inline-block">
            {texte.rechtliches.cookiesTitelHighlight}
            <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
          </span>
        </h1>

        {page.intro && (
          <RichTextBody
            data={page.intro}
            className="mt-4 text-base font-light leading-relaxed text-black/60 [&>*:first-child]:mt-0 [&_p]:mt-3 [&_a]:text-black [&_a]:underline-offset-2 [&_a:hover]:underline"
          />
        )}

        <CookieSettings seite={cookieTexte.seite} kategorien={cookieTexte.kategorien} />
      </div>
    </main>
  );
}
