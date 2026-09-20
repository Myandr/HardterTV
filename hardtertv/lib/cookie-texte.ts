import { getPayload } from "payload";
import config from "@payload-config";

export type CookieKategorie = {
  schluessel: "notwendig" | "maps" | "analyse";
  titel: string;
  bannerBeschreibung: string;
  seiteBeschreibung: string;
  seiteFussnote: string;
  toggleAriaLabel: string;
};

export type CookieBannerTexte = {
  titel: string;
  textVor: string;
  linkText: string;
  textNach: string;
  alleAkzeptierenLabel: string;
  auswahlSpeichernLabel: string;
  einstellungenLabel: string;
  nurNotwendigeLabel: string;
};

export type CookieSeiteTexte = {
  speichernLabel: string;
  gespeichertLabel: string;
  alleAkzeptierenLabel: string;
  nurNotwendigeLabel: string;
};

export type CookieMapsTexte = {
  platzhalterTitel: string;
  platzhalterText: string;
  buttonLabel: string;
};

/** Lädt das Global "cookie-texte" und liefert einfache, serialisierbare Props. */
export async function getCookieTexte() {
  const payload = await getPayload({ config });
  const data = await payload.findGlobal({ slug: "cookie-texte", depth: 0 });

  const banner: CookieBannerTexte = {
    titel: data.banner?.titel ?? "",
    textVor: data.banner?.textVor ?? "",
    linkText: data.banner?.linkText ?? "",
    textNach: data.banner?.textNach ?? "",
    alleAkzeptierenLabel: data.banner?.alleAkzeptierenLabel ?? "",
    auswahlSpeichernLabel: data.banner?.auswahlSpeichernLabel ?? "",
    einstellungenLabel: data.banner?.einstellungenLabel ?? "",
    nurNotwendigeLabel: data.banner?.nurNotwendigeLabel ?? "",
  };

  const seite: CookieSeiteTexte = {
    speichernLabel: data.seite?.speichernLabel ?? "",
    gespeichertLabel: data.seite?.gespeichertLabel ?? "",
    alleAkzeptierenLabel: data.seite?.alleAkzeptierenLabel ?? "",
    nurNotwendigeLabel: data.seite?.nurNotwendigeLabel ?? "",
  };

  const kategorien: CookieKategorie[] = (data.kategorien ?? []).map((k) => ({
    schluessel: k.schluessel,
    titel: k.titel,
    bannerBeschreibung: k.bannerBeschreibung,
    seiteBeschreibung: k.seiteBeschreibung,
    seiteFussnote: k.seiteFussnote,
    toggleAriaLabel: k.toggleAriaLabel ?? "",
  }));

  const maps: CookieMapsTexte = {
    platzhalterTitel: data.maps?.titel ?? "",
    platzhalterText: data.maps?.text ?? "",
    buttonLabel: data.maps?.buttonLabel ?? "",
  };

  return { banner, seite, kategorien, maps };
}
