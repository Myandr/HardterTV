"use client";

import { useState } from "react";
import Link from "next/link";

interface EmbedConsentGateProps {
  src: string;
  title: string;
  /** Klassen für iframe und Platzhalter (Größe/Höhe). */
  className?: string;
  iframeProps?: Omit<React.IframeHTMLAttributes<HTMLIFrameElement>, "src" | "title" | "className">;
  platzhalterTitel: string;
  platzhalterText: string;
  buttonLabel: string;
  directLinkLabel: string;
}

/**
 * Zwei-Klick-Lösung: Das iframe (und damit jeder Request an den Drittanbieter) wird erst
 * nach ausdrücklichem Klick geladen. Die Entscheidung gilt nur für diesen Seitenaufruf
 * und wird nicht gespeichert.
 */
export function EmbedConsentGate({
  src,
  title,
  className = "",
  iframeProps,
  platzhalterTitel,
  platzhalterText,
  buttonLabel,
  directLinkLabel,
}: EmbedConsentGateProps) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return <iframe src={src} title={title} className={className} {...iframeProps} />;
  }

  return (
    <div className={`flex items-center justify-center bg-black/[0.04] ${className}`}>
      <div className="flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <p className="font-kanturmuy text-lg font-normal tracking-tight text-black">{platzhalterTitel}</p>
        <p className="text-sm font-light leading-relaxed text-black/50">
          {platzhalterText}{" "}
          <Link href="/datenschutz" className="underline underline-offset-2 transition-colors hover:text-black">
            Datenschutzerklärung
          </Link>
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="rounded-full bg-[#122023] px-5 py-2.5 text-sm font-medium text-[#e1fcad] transition-colors hover:bg-black"
          >
            {buttonLabel}
          </button>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-light text-black/50 underline underline-offset-2 transition-colors hover:text-black"
          >
            {directLinkLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
