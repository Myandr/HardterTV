"use client";

import { useEffect, useState } from "react";
import { getCookieConsent, type ConsentState } from "@/components/ui/cookie-banner";

export function useCookieConsent(): ConsentState | null {
  const [consent, setConsent] = useState<ConsentState | null>(null);

  useEffect(() => {
    setConsent(getCookieConsent());

    function onUpdate() {
      setConsent(getCookieConsent());
    }

    window.addEventListener("htv-consent-updated", onUpdate);
    return () => window.removeEventListener("htv-consent-updated", onUpdate);
  }, []);

  return consent;
}
