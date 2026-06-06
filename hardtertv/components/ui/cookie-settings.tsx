"use client";

import { useEffect, useState } from "react";
import { getCookieConsent, type ConsentState } from "@/components/ui/cookie-banner";

const STORAGE_KEY = "htv-cookie-consent";

export default function CookieSettings() {
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    window.dispatchEvent(new Event("htv-consent-updated"));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!loaded) return null;

  return (
    <div className="mt-10 space-y-4">

      {/* Notwendig */}
      <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-kanturmuy text-lg font-normal text-black">Notwendige Cookies</p>
            <p className="mt-1.5 text-sm font-light leading-relaxed text-black/50">
              Diese Cookies sind für den Betrieb der Website technisch notwendig und können nicht
              deaktiviert werden. Sie speichern keine personenbezogenen Daten.
            </p>
          </div>
          <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#e1fcad]">
            <svg className="size-3.5 text-black" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="mt-4 border-t border-black/[0.06] pt-4">
          <p className="text-xs font-light text-black/40">
            Beispiel: Cookie-Einstellungen speichern (localStorage)
          </p>
        </div>
      </div>

      {/* Google Maps */}
      <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-kanturmuy text-lg font-normal text-black">Google Maps</p>
            <p className="mt-1.5 text-sm font-light leading-relaxed text-black/50">
              Wir verlinken auf Google Maps für Standortangaben. Beim Klick auf einen Maps-Link
              gelten die Datenschutzbestimmungen von Google. Google LLC, USA.
            </p>
          </div>
          <button
            onClick={() => setMaps(!maps)}
            className={`mt-1 flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${maps ? "bg-[#122023]" : "bg-black/20"}`}
            aria-label="Google Maps togglen"
          >
            <span className={`ml-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${maps ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
        <div className="mt-4 border-t border-black/[0.06] pt-4">
          <p className="text-xs font-light text-black/40">
            Anbieter: Google LLC · Zweck: Kartenanzeige & Standort · Datenübertragung in die USA möglich
          </p>
        </div>
      </div>

      {/* Analyse */}
      <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-kanturmuy text-lg font-normal text-black">Analyse</p>
            <p className="mt-1.5 text-sm font-light leading-relaxed text-black/50">
              Analyse-Cookies helfen uns zu verstehen, wie Besucher die Website nutzen,
              damit wir sie verbessern können (z.B. Google Analytics).
            </p>
          </div>
          <button
            onClick={() => setAnalytics(!analytics)}
            className={`mt-1 flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${analytics ? "bg-[#122023]" : "bg-black/20"}`}
            aria-label="Analyse togglen"
          >
            <span className={`ml-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${analytics ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
        <div className="mt-4 border-t border-black/[0.06] pt-4">
          <p className="text-xs font-light text-black/40">
            Anbieter: Google LLC · Zweck: Websiteanalyse · Datenübertragung in die USA möglich
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={() => save(maps, analytics)}
          className="rounded-full bg-[#122023] px-6 py-3 text-sm font-medium text-[#e1fcad] transition-colors hover:bg-black"
        >
          {saved ? "Gespeichert ✓" : "Einstellungen speichern"}
        </button>
        <button
          onClick={() => { setMaps(true); setAnalytics(true); save(true, true); }}
          className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:border-black/30"
        >
          Alle akzeptieren
        </button>
        <button
          onClick={() => { setMaps(false); setAnalytics(false); save(false, false); }}
          className="text-sm font-light text-black/40 underline underline-offset-2 transition-colors hover:text-black/70"
        >
          Nur notwendige
        </button>
      </div>
    </div>
  );
}
