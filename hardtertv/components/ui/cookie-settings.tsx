"use client";

import { useEffect, useState } from "react";
import { getCookieConsent, saveConsent, type ConsentState } from "@/lib/cookie-consent";
import type { CookieKategorie, CookieSeiteTexte } from "@/lib/cookie-texte";

export default function CookieSettings({
  seite,
  kategorien,
}: {
  seite: CookieSeiteTexte;
  kategorien: CookieKategorie[];
}) {
  const [maps, setMaps] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (consent) {
      setMaps(consent.maps);
      setAnalytics(consent.analytics);
    }
    setLoaded(true);
  }, []);

  function save(mapsVal: boolean, analyticsVal: boolean) {
    const consent: ConsentState = {
      necessary: true,
      maps: mapsVal,
      analytics: analyticsVal,
      decided: true,
    };
    saveConsent(consent);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!loaded) return null;

  return (
    <div className="mt-10 space-y-4">

      {kategorien.map((k) => {
        const aktiv = k.schluessel === "maps" ? maps : analytics;
        const toggle = () => (k.schluessel === "maps" ? setMaps(!maps) : setAnalytics(!analytics));
        return (
          <div key={k.schluessel} className="rounded-2xl border border-black/[0.06] bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-kanturmuy text-lg font-normal text-black">{k.titel}</p>
                <p className="mt-1.5 text-sm font-light leading-relaxed text-black/50">
                  {k.seiteBeschreibung}
                </p>
              </div>
              {k.schluessel === "notwendig" ? (
                <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#e1fcad]">
                  <svg className="size-3.5 text-black" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              ) : (
                <button
                  onClick={toggle}
                  className={`mt-1 flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${aktiv ? "bg-[#122023]" : "bg-black/20"}`}
                  aria-label={k.toggleAriaLabel}
                >
                  <span className={`ml-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${aktiv ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              )}
            </div>
            <div className="mt-4 border-t border-black/[0.06] pt-4">
              <p className="text-xs font-light text-black/40">
                {k.seiteFussnote}
              </p>
            </div>
          </div>
        );
      })}

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={() => save(maps, analytics)}
          className="rounded-full bg-[#122023] px-6 py-3 text-sm font-medium text-[#e1fcad] transition-colors hover:bg-black"
        >
          {saved ? seite.gespeichertLabel : seite.speichernLabel}
        </button>
        <button
          onClick={() => { setMaps(true); setAnalytics(true); save(true, true); }}
          className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:border-black/30"
        >
          {seite.alleAkzeptierenLabel}
        </button>
        <button
          onClick={() => { setMaps(false); setAnalytics(false); save(false, false); }}
          className="text-sm font-light text-black/40 underline underline-offset-2 transition-colors hover:text-black/70"
        >
          {seite.nurNotwendigeLabel}
        </button>
      </div>
    </div>
  );
}
