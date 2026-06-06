import CookieSettings from "@/components/ui/cookie-settings";

export const metadata = {
  title: "Cookie-Einstellungen",
  description: "Verwalte deine Cookie-Einstellungen für hardt-tennis.de",
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#f9f9f7] px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-black/30" />
          <span className="text-xs uppercase tracking-[0.2em] text-black/50">Datenschutz</span>
        </div>

        <h1 className="font-kanturmuy text-4xl font-normal tracking-tighter text-black sm:text-5xl">
          Cookie-{" "}
          <span className="relative inline-block">
            Einstellungen
            <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
          </span>
        </h1>

        <p className="mt-4 text-base font-light leading-relaxed text-black/60">
          Hier kannst du jederzeit deine Einwilligung zur Verwendung von Cookies anpassen.
          Notwendige Cookies sind für den Betrieb der Website erforderlich und können nicht
          deaktiviert werden.
        </p>

        <CookieSettings />
      </div>
    </main>
  );
}
