import CookieBannerClient from "@/components/ui/cookie-banner-client";
import { getCookieTexte } from "@/lib/cookie-texte";

export default async function CookieBanner() {
  const { banner, kategorien } = await getCookieTexte();
  return <CookieBannerClient banner={banner} kategorien={kategorien} />;
}
