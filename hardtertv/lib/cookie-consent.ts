// Nur in Client-Komponenten aufrufen (greift auf window/localStorage zu).
// Storage-Key und Event-Name dürfen sich nie ändern — sonst verlieren Besucher ihre Entscheidung.
export const STORAGE_KEY = "htv-cookie-consent";

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

export function saveConsent(consent: ConsentState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new Event("htv-consent-updated"));
}
