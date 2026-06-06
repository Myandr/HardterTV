"use client";

import React from "react";
import Link from "next/link";
import { useCookieConsent } from "@/hooks/use-cookie-consent";

interface MapsConsentGateProps {
  src: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
}

export function MapsConsentGate({ src, title, className = "", style }: MapsConsentGateProps) {
  const consent = useCookieConsent();
  const allowed = consent?.maps ?? false;

  if (allowed) {
    return (
      <iframe
        src={src}
        title={title}
        className={className}
        style={style}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-4 bg-black/[0.04] ${className}`} style={style}>
      <div className="flex flex-col items-center gap-3 text-center p-8">
        <div className="flex size-12 items-center justify-center rounded-full bg-black/[0.06]">
          <svg className="size-5 text-black/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>
        <div>
          <p className="font-kanturmuy text-lg font-normal tracking-tight text-black">
            Google Maps nicht aktiviert
          </p>
          <p className="mt-1 max-w-xs text-sm font-light leading-relaxed text-black/50">
            Um die Karte anzuzeigen, müssen Google Maps Cookies in den Einstellungen aktiviert werden.
          </p>
        </div>
        <Link
          href="/cookies"
          className="mt-1 rounded-full bg-[#122023] px-5 py-2.5 text-sm font-medium text-[#e1fcad] transition-colors hover:bg-black"
        >
          Cookie-Einstellungen öffnen
        </Link>
      </div>
    </div>
  );
}
