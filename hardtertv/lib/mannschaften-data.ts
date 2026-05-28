export type Team = {
  slug: string;
  name: string;
  kategorie: "Herren" | "Damen" | "Gemischt";
  kontakt: string;
  bild: string | null;
  ligaUrl: string;
};

export const teams: Team[] = [
  // Herren
  {
    slug: "herren-1",
    name: "Herren 1",
    kategorie: "Herren",
    kontakt: "henbue@ymail.com",
    bild: "/images/Herren_1_B1.jpg",
    ligaUrl:
      "https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/teamPortrait?team=3276586&championship=MS+2025",
  },
  {
    slug: "herren-2",
    name: "Herren 2",
    kategorie: "Herren",
    kontakt: "Schapdicktill@googlemail.com",
    bild: "/images/Herren_2_B2.JPG",
    ligaUrl:
      "https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/teamPortrait?team=3279398&championship=MS+2025",
  },
  {
    slug: "herren-30",
    name: "Herren 30",
    kategorie: "Herren",
    kontakt: "herzog-stefan@gmx.de",
    bild: "/images/Herren30_B2.JPG",
    ligaUrl:
      "https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/teamPortrait?team=3274873&championship=MS+2025",
  },
  {
    slug: "herren-40-1",
    name: "Herren 40/1",
    kategorie: "Herren",
    kontakt: "Comprix Gordon – Mobil: 0172 3238590",
    bild: "/images/Herren40_1_B3.JPG",
    ligaUrl:
      "https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/teamPortrait?team=3277293&championship=MS+2025",
  },
  {
    slug: "herren-40-2",
    name: "Herren 40/2",
    kategorie: "Herren",
    kontakt: "hspickermann@t-online.de",
    bild: "/images/Herren40_2_B3.JPG",
    ligaUrl:
      "https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/teamPortrait?team=3275004&championship=MS+2025",
  },
  {
    slug: "herren-55",
    name: "Herren 55",
    kategorie: "Herren",
    kontakt: "woodworm4u@gmail.com",
    bild: "/images/Herren55_B2.JPG",
    ligaUrl:
      "https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/teamPortrait?team=3274750&championship=WTV+2025",
  },
  {
    slug: "herren-60",
    name: "Herren 60",
    kategorie: "Herren",
    kontakt: "1.Sportwart@hardt-tennis.de",
    bild: "/images/Herren60_B2.JPG",
    ligaUrl:
      "https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/teamPortrait?team=3380796&championship=MS+2025",
  },
  {
    slug: "herren-doppel-60",
    name: "Herren Doppel 60",
    kategorie: "Herren",
    kontakt: "MOL3007@gmail.com",
    bild: null,
    ligaUrl:
      "https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/teamPortrait?team=3363120&championship=MS+2025",
  },
  // Damen
  {
    slug: "damen-1",
    name: "Damen 1",
    kategorie: "Damen",
    kontakt: "tabea.wiegand.tw@gmail.com",
    bild: "/images/damen-1.jpg",
    ligaUrl:
      "https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/teamPortrait?team=3274537&championship=MS+2025",
  },
  {
    slug: "damen-2",
    name: "Damen 2",
    kategorie: "Damen",
    kontakt: "viviangievert@icloud.com",
    bild: null,
    ligaUrl:
      "https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/teamPortrait?team=3363603&championship=MS+2025",
  },
  {
    slug: "damen-40",
    name: "Damen 40",
    kategorie: "Damen",
    kontakt: "marion.voellmeke@web.de",
    bild: "/images/Damen40_B1.jpg",
    ligaUrl:
      "https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/teamPortrait?team=3276508&championship=WTV+2025",
  },
  {
    slug: "damen-50",
    name: "Damen 50",
    kategorie: "Damen",
    kontakt: "sabine.voss63@gmx.de",
    bild: "/images/Damen50_B1.JPG",
    ligaUrl:
      "https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/teamPortrait?team=3275350&championship=WTV+2025",
  },
  {
    slug: "damen-doppel-40",
    name: "Damen Doppel 40",
    kategorie: "Damen",
    kontakt: "Martina.Keysers@yahoo.de",
    bild: null,
    ligaUrl:
      "https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/teamPortrait?team=3365247&championship=MS+2025",
  },
  // Gemischt
  {
    slug: "gemischt-1",
    name: "Gemischt 1",
    kategorie: "Gemischt",
    kontakt: "tabea.wiegand.tw@gmail.com",
    bild: "/images/Gemischt_B5.jpg",
    ligaUrl:
      "https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/teamPortrait?team=3274846&championship=MS+2025",
  },
  {
    slug: "gemischt-2",
    name: "Gemischt 2",
    kategorie: "Gemischt",
    kontakt: "Schapdicktill@googlemail.com",
    bild: null,
    ligaUrl:
      "https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/teamPortrait?team=3363374&championship=MS+2025",
  },
  {
    slug: "mixed-50-doppel",
    name: "Mixed 50 Doppel",
    kategorie: "Gemischt",
    kontakt: "tanjawiegand@icloud.com",
    bild: null,
    ligaUrl:
      "https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/teamPortrait?team=3277568&championship=MS+2025",
  },
];

export function getTeamBySlug(slug: string): Team | undefined {
  return teams.find((t) => t.slug === slug);
}

export const herren = teams.filter((t) => t.kategorie === "Herren");
export const damen = teams.filter((t) => t.kategorie === "Damen");
export const gemischt = teams.filter((t) => t.kategorie === "Gemischt");
