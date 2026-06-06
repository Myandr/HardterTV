"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "htv-cookie-consent";

export type ConsentState = {
  necessary: true;
  maps: boolean;
  analytics: boolean;
  decided: boolean;
};

export function getCookieConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveConsent(consent: ConsentState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new Event("htv-consent-updated"));
}

export default function CookieBanner() {
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
                Cookies & Datenschutz
              </h2>
              <p className="mt-2 text-sm font-light leading-relaxed text-black/60">
                Wir verwenden Cookies, um externe Dienste wie Google Maps einzubinden.
                Einige Cookies sind technisch notwendig, andere helfen uns, die Website zu verbessern.
                Weitere Infos in unserer{" "}
                <Link href="/datenschutz" className="underline underline-offset-2 hover:text-black transition-colors">
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </div>
          </div>

          {showDetails && (
            <div className="mt-6 space-y-3 rounded-xl border border-black/[0.06] bg-black/[0.02] p-4">
              {/* Notwendig */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-black">Notwendige Cookies</p>
                  <p className="mt-0.5 text-xs font-light text-black/50">
                    Technisch erforderlich für die Grundfunktionen der Website. Können nicht deaktiviert werden.
                  </p>
                </div>
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-[#e1fcad]">
                  <svg className="size-3 text-black" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Google Maps */}
              <div className="flex items-start justify-between gap-4 border-t border-black/[0.06] pt-3">
                <div>
                  <p className="text-sm font-medium text-black">Google Maps</p>
                  <p className="mt-0.5 text-xs font-light text-black/50">
                    Ermöglicht die Nutzung von Google Maps zum Anzeigen von Standorten. Google kann dabei Daten erheben.
                  </p>
                </div>
                <button
                  onClick={() => setMaps(!maps)}
                  className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${maps ? "bg-[#122023]" : "bg-black/20"}`}
                  aria-label="Google Maps togglen"
                >
                  <span className={`ml-0.5 size-4 rounded-full bg-white shadow transition-transform duration-200 ${maps ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>

              {/* Analyse */}
              <div className="flex items-start justify-between gap-4 border-t border-black/[0.06] pt-3">
                <div>
                  <p className="text-sm font-medium text-black">Analyse</p>
                  <p className="mt-0.5 text-xs font-light text-black/50">
                    Hilft uns zu verstehen, wie Besucher die Website nutzen (z.B. Google Analytics).
                  </p>
                </div>
                <button
                  onClick={() => setAnalytics(!analytics)}
                  className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${analytics ? "bg-[#122023]" : "bg-black/20"}`}
                  aria-label="Analyse togglen"
                >
                  <span className={`ml-0.5 size-4 rounded-full bg-white shadow transition-transform duration-200 ${analytics ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={acceptAll}
              className="rounded-full bg-[#122023] px-5 py-2.5 text-sm font-medium text-[#e1fcad] transition-colors hover:bg-black"
            >
              Alle akzeptieren
            </button>
            {showDetails ? (
              <button
                onClick={acceptSelected}
                className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:border-black/30"
              >
                Auswahl speichern
              </button>
            ) : (
              <button
                onClick={() => setShowDetails(true)}
                className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:border-black/30"
              >
                Einstellungen
              </button>
            )}
            <button
              onClick={rejectAll}
              className="text-sm font-light text-black/40 underline underline-offset-2 transition-colors hover:text-black/70"
            >
              Nur notwendige
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
