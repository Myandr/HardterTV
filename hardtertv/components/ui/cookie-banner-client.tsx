"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCookieConsent, saveConsent } from "@/lib/cookie-consent";
import type { CookieBannerTexte, CookieKategorie } from "@/lib/cookie-texte";

export default function CookieBannerClient({
  banner,
  kategorien,
}: {
  banner: CookieBannerTexte;
  kategorien: CookieKategorie[];
}) {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [maps, setMaps] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent?.decided) setVisible(true);
  }, []);

  if (!visible) return null;

  function acceptAll() {
    saveConsent({ necessary: true, maps: true, analytics: true, decided: true });
    setVisible(false);
  }

  function acceptSelected() {
    saveConsent({ necessary: true, maps, analytics, decided: true });
    setVisible(false);
  }

  function rejectAll() {
    saveConsent({ necessary: true, maps: false, analytics: false, decided: true });
    setVisible(false);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-black/[0.08] bg-white shadow-2xl shadow-black/10">
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="font-kanturmuy text-xl font-normal tracking-tight text-black">
                {banner.titel}
              </h2>
              <p className="mt-2 text-sm font-light leading-relaxed text-black/60">
                {banner.textVor}{" "}
                <Link href="/datenschutz" className="underline underline-offset-2 hover:text-black transition-colors">
                  {banner.linkText}
                </Link>
                {banner.textNach}
              </p>
            </div>
          </div>

          {showDetails && (
            <div className="mt-6 space-y-3 rounded-xl border border-black/[0.06] bg-black/[0.02] p-4">
              {kategorien.map((k, i) => {
                const wrapper = i === 0 ? "flex items-start justify-between gap-4" : "flex items-start justify-between gap-4 border-t border-black/[0.06] pt-3";
                const aktiv = k.schluessel === "maps" ? maps : analytics;
                const toggle = () => (k.schluessel === "maps" ? setMaps(!maps) : setAnalytics(!analytics));
                return (
                  <div key={k.schluessel} className={wrapper}>
                    <div>
                      <p className="text-sm font-medium text-black">{k.titel}</p>
                      <p className="mt-0.5 text-xs font-light text-black/50">{k.bannerBeschreibung}</p>
                    </div>
                    {k.schluessel === "notwendig" ? (
                      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-[#e1fcad]">
                        <svg className="size-3 text-black" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    ) : (
                      <button
                        onClick={toggle}
                        className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${aktiv ? "bg-[#122023]" : "bg-black/20"}`}
                        aria-label={k.toggleAriaLabel}
                      >
                        <span className={`ml-0.5 size-4 rounded-full bg-white shadow transition-transform duration-200 ${aktiv ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={acceptAll}
              className="rounded-full bg-[#122023] px-5 py-2.5 text-sm font-medium text-[#e1fcad] transition-colors hover:bg-black"
            >
              {banner.alleAkzeptierenLabel}
            </button>
            {showDetails ? (
              <button
                onClick={acceptSelected}
                className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:border-black/30"
              >
                {banner.auswahlSpeichernLabel}
              </button>
            ) : (
              <button
                onClick={() => setShowDetails(true)}
                className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:border-black/30"
              >
                {banner.einstellungenLabel}
              </button>
            )}
            <button
              onClick={rejectAll}
              className="text-sm font-light text-black/40 underline underline-offset-2 transition-colors hover:text-black/70"
            >
              {banner.nurNotwendigeLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
