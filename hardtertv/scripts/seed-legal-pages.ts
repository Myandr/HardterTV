import { getPayload } from "payload";
import { convertMarkdownToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";

import config from "../payload.config";
import type { LegalSlug } from "../lib/legal-pages";
import type { LegalPage } from "../payload-types";

type Lexical = NonNullable<LegalPage["intro"]>;

type SeedAbschnitt = { titel: string; markdown: string };
type SeedPage = {
  slug: LegalSlug;
  titel: string;
  introMarkdown?: string;
  abschnitte: SeedAbschnitt[];
  stand?: string;
};

const IMPRESSUM: SeedPage = {
  slug: "impressum",
  titel: "Impressum",
  abschnitte: [
    {
      titel: "Angaben gemäß § 5 DDG",
      markdown: `**Sitz und Postanschrift des Vereins**

Hardter TV e. V.\\
Gahlener Str. 204\\
46282 Dorsten`,
    },
    {
      titel: "Vertreten durch",
      markdown: `**1. Vorsitzender:** Oliver Wiegand\\
**1. Geschäftsführer:** Hendrick Büncker\\
**Schatzmeister:** Marco Hohenstein

Telefon: [0172 25 80 209](tel:+4917225800209)

E-Mail: [1.vorsitzender@hardt-tennis.de](mailto:1.vorsitzender@hardt-tennis.de)`,
    },
    {
      titel: "Registereintrag",
      markdown: `Eintragung im Vereinsregister\\
Registergericht: Gelsenkirchen\\
Registernummer: VR 13415`,
    },
    {
      titel: "Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV",
      markdown: `Oliver Wiegand\\
Teichstr. 14 a\\
46282 Dorsten

E-Mail: [1.vorsitzender@hardt-tennis.de](mailto:1.vorsitzender@hardt-tennis.de)`,
    },
    {
      titel: "Online-Streitbeilegung",
      markdown: `Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: [https://ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr)

Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`,
    },
    {
      titel: "Disclaimer – Rechtliche Hinweise",
      markdown: `### § 1 Haftungsbeschränkung

Die Inhalte dieser Website werden mit größtmöglicher Sorgfalt erstellt. Der Anbieter übernimmt jedoch keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Inhalte. Die Nutzung der Inhalte der Website erfolgt auf eigene Gefahr des Nutzers. Namentlich gekennzeichnete Beiträge geben die Meinung des jeweiligen Autors und nicht immer die Meinung des Anbieters wieder. Mit der reinen Nutzung der Website des Anbieters kommt keinerlei Vertragsverhältnis zwischen dem Nutzer und dem Anbieter zustande.

### § 2 Externe Links

Diese Website enthält Verknüpfungen zu Websites Dritter („externe Links"). Diese Websites unterliegen der Haftung der jeweiligen Betreiber. Der Anbieter hat bei der erstmaligen Verknüpfung der externen Links die fremden Inhalte daraufhin überprüft, ob etwaige Rechtsverstöße bestehen. Zu dem Zeitpunkt waren keine Rechtsverstöße ersichtlich. Der Anbieter hat keinerlei Einfluss auf die aktuelle und zukünftige Gestaltung und auf die Inhalte der verknüpften Seiten. Das Setzen von externen Links bedeutet nicht, dass sich der Anbieter die hinter dem Verweis oder Link liegenden Inhalte zu Eigen macht. Eine ständige Kontrolle der externen Links ist für den Anbieter ohne konkrete Hinweise auf Rechtsverstöße nicht zumutbar. Bei Kenntnis von Rechtsverstößen werden jedoch derartige externe Links unverzüglich gelöscht.

### § 3 Urheber- und Leistungsschutzrechte

Die auf dieser Website veröffentlichten Inhalte unterliegen dem deutschen Urheber- und Leistungsschutzrecht. Jede vom deutschen Urheber- und Leistungsschutzrecht nicht zugelassene Verwertung bedarf der vorherigen schriftlichen Zustimmung des Anbieters oder jeweiligen Rechteinhabers. Dies gilt insbesondere für Vervielfältigung, Bearbeitung, Übersetzung, Einspeicherung, Verarbeitung bzw. Wiedergabe von Inhalten in Datenbanken oder anderen elektronischen Medien und Systemen. Die unerlaubte Vervielfältigung oder Weitergabe einzelner Inhalte oder kompletter Seiten ist nicht gestattet und strafbar. Lediglich die Herstellung von Kopien und Downloads für den persönlichen, privaten und nicht kommerziellen Gebrauch ist erlaubt. Die Darstellung dieser Website in fremden Frames ist nur mit schriftlicher Erlaubnis zulässig.

### § 4 Besondere Nutzungsbedingungen

Soweit besondere Bedingungen für einzelne Nutzungen dieser Website von den vorgenannten Paragraphen abweichen, wird an entsprechender Stelle ausdrücklich darauf hingewiesen. In diesem Falle gelten im jeweiligen Einzelfall die besonderen Nutzungsbedingungen.`,
    },
  ],
};

const DATENSCHUTZ: SeedPage = {
  slug: "datenschutz",
  titel: "Datenschutzerklärung",
  stand: "Stand: Juni 2026",
  abschnitte: [
    {
      titel: "Verantwortlicher",
      markdown: `Hardter TV e. V.\\
Gahlener Str. 204\\
46282 Dorsten

E-Mail: [1.vorsitzender@hardt-tennis.de](mailto:1.vorsitzender@hardt-tennis.de)`,
    },
    {
      titel: "Hosting",
      markdown: `Diese Website wird gehostet von Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, USA. Beim Aufruf der Website werden IP-Adressen und Zugriffsdaten auf Servern von Vercel verarbeitet. Mit Vercel wurde ein Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO abgeschlossen. Datentransfers in die USA erfolgen auf Basis von Standardvertragsklauseln (SCCs) gemäß Art. 46 Abs. 2 lit. c DSGVO.

> Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem zuverlässigen Websitebetrieb) · Speicherdauer: Logfiles werden nach spätestens 30 Tagen automatisch gelöscht`,
    },
    {
      titel: "Erhebung und Verarbeitung personenbezogener Daten",
      markdown: `Wir erheben und verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung unserer Angebote erforderlich ist. Personenbezogene Daten sind alle Daten, die sich auf eine identifizierte oder identifizierbare natürliche Person beziehen.

Beim Besuch unserer Website werden automatisch technische Informationen (z. B. IP-Adresse, Browsertyp, Betriebssystem, Uhrzeit des Zugriffs) in Server-Logfiles gespeichert. Diese Daten sind nicht einer bestimmten Person zuordenbar und werden nicht mit anderen Datenquellen zusammengeführt.

> Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am sicheren Websitebetrieb)`,
    },
    {
      titel: "Kontaktformular",
      markdown: `Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.

> Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung von Anfragen) · Speicherdauer: bis zur abschließenden Bearbeitung der Anfrage, längstens 3 Jahre`,
    },
    {
      titel: "Cookies",
      markdown: `Unsere Website verwendet technisch notwendige Cookies, die für den Betrieb der Website erforderlich sind (z. B. zum Speichern Ihrer Cookie-Einstellungen). Darüber hinaus werden Cookies von Google Maps erst nach Ihrer ausdrücklichen Einwilligung gesetzt. Technisch notwendige Cookies können nicht deaktiviert werden.

Ihre Einwilligung für optionale Cookies können Sie jederzeit über die [Cookie-Einstellungen](/cookies) widerrufen.

> Rechtsgrundlage technisch notwendige Cookies: Art. 6 Abs. 1 lit. f DSGVO · Rechtsgrundlage optionale Cookies: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)`,
    },
    {
      titel: "Google Maps",
      markdown: `Auf unserer Website wird Google Maps eingebunden (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland). Google Maps wird erst nach Ihrer ausdrücklichen Einwilligung über die Cookie-Einstellungen aktiviert. Vor Aktivierung werden keine Daten an Google übertragen.

Nach Aktivierung können Daten (u. a. IP-Adresse, Standortdaten, Browserinformationen) an Server von Google in den USA übertragen werden. Google unterliegt dem EU-US Data Privacy Framework; zusätzlich gelten Standardvertragsklauseln (SCCs) gemäß Art. 46 Abs. 2 DSGVO. Weitere Informationen: [Google Datenschutzerklärung](https://policies.google.com/privacy).

> Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) · Ihre Einwilligung können Sie jederzeit über die Cookie-Einstellungen widerrufen`,
    },
    {
      titel: "Liga-Daten (nuLiga / wtv.liga.nu)",
      markdown: `Diese Website verlinkt auf Ligadaten des Westfälischen Tennis-Verbands (WTV), die über den Dienst nuLiga (Anbieter: Ediscom GmbH, Otto-Hahn-Str. 1, 97204 Höchberg) bereitgestellt werden. Beim Klick auf einen nuLiga-Link verlassen Sie unsere Website; es gelten die Datenschutzbestimmungen von nuLiga. Es werden keine Daten automatisch an nuLiga übertragen, solange Sie keinen Link anklicken.

Weitere Informationen: [nuLiga Datenschutz](https://www.nuliga.de).

> Rechtsgrundlage für die Verlinkung: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Information unserer Mitglieder über aktuelle Ligadaten)`,
    },
    {
      titel: "Instagram",
      markdown: `Auf unserer Website ist ein Link zu unserem Instagram-Profil (@hardtertv) eingebunden. Der Link führt zu einer externen Website, die von Meta Platforms Ireland Limited, 4 Grand Canal Square, Dublin 2, Irland, betrieben wird. Beim Klick auf den Link verlassen Sie unsere Website; es gelten die Datenschutzbestimmungen von Instagram/Meta. Es werden keine Daten automatisch an Instagram übertragen, solange Sie keinen Link anklicken — es ist kein Plug-in oder Widget eingebettet.

Weitere Informationen: [Instagram Datenschutzrichtlinie](https://privacycenter.instagram.com/policy).`,
    },
    {
      titel: "Externe Links (Shop)",
      markdown: `Diese Website enthält einen Link zum externen Tennisshop matchpoint24.de. Beim Klick auf diesen Link verlassen Sie unsere Website. Für die Datenverarbeitung auf der verlinkten Website ist der jeweilige Betreiber verantwortlich.`,
    },
    {
      titel: "Ihre Rechte gemäß DSGVO",
      markdown: `Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:

- **Auskunft** über die bei uns gespeicherten Daten (Art. 15 DSGVO)
- **Berichtigung** unrichtiger Daten (Art. 16 DSGVO)
- **Löschung** Ihrer gespeicherten Daten (Art. 17 DSGVO)
- **Einschränkung der Verarbeitung** Ihrer Daten (Art. 18 DSGVO)
- **Datenübertragbarkeit** (Art. 20 DSGVO)
- **Widerspruch** gegen die Verarbeitung Ihrer Daten (Art. 21 DSGVO)
- **Widerruf einer Einwilligung** jederzeit mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)

Zur Geltendmachung Ihrer Rechte wenden Sie sich bitte an die im Impressum angegebene E-Mail-Adresse.

### Beschwerderecht bei der Aufsichtsbehörde

Sie haben das Recht, sich bei der zuständigen Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO):

Landesbeauftragte für Datenschutz und Informationsfreiheit NRW (LDI NRW)\\
Postfach 20 04 44\\
40102 Düsseldorf\\
Telefon: 0211 / 38424-0\\
E-Mail: [poststelle@ldi.nrw.de](mailto:poststelle@ldi.nrw.de)`,
    },
  ],
};

const COOKIES: SeedPage = {
  slug: "cookies",
  titel: "Cookie-Einstellungen",
  introMarkdown: `Hier kannst du jederzeit deine Einwilligung zur Verwendung von Cookies anpassen. Notwendige Cookies sind für den Betrieb der Website erforderlich und können nicht deaktiviert werden.`,
  abschnitte: [],
};

const PAGES: SeedPage[] = [IMPRESSUM, DATENSCHUTZ, COOKIES];

type LexNode = { type?: string; fields?: { url?: string; newTab?: boolean }; children?: LexNode[] };

/**
 * Markdown-Links werden mit newTab: false importiert. Externe (http/https) Links
 * sollen — wie bisher im JSX — in einem neuen Tab öffnen; mailto:, tel: und
 * interne Links bleiben im selben Tab.
 */
function setNewTabForExternalLinks(node: LexNode): void {
  if ((node.type === "link" || node.type === "autolink") && node.fields) {
    node.fields.newTab = (node.fields.url ?? "").startsWith("http");
  }
  for (const child of node.children ?? []) setNewTabForExternalLinks(child);
}

async function run() {
  const payload = await getPayload({ config });
  const editorConfig = await editorConfigFactory.default({ config: payload.config });

  const toLexical = (markdown: string): Lexical => {
    const state = convertMarkdownToLexical({ editorConfig, markdown });
    setNewTabForExternalLinks(state.root as unknown as LexNode);
    return state as unknown as Lexical;
  };

  for (const page of PAGES) {
    const existing = await payload.find({
      collection: "legal-pages",
      where: { slug: { equals: page.slug } },
      limit: 1,
      depth: 0,
    });
    if (existing.docs.length > 0) {
      console.log(`skip (already exists): ${page.slug}`);
      continue;
    }

    await payload.create({
      collection: "legal-pages",
      data: {
        slug: page.slug,
        titel: page.titel,
        intro: page.introMarkdown ? toLexical(page.introMarkdown) : undefined,
        abschnitte: page.abschnitte.map((a) => ({ titel: a.titel, inhalt: toLexical(a.markdown) })),
        stand: page.stand,
      },
      context: { disableRevalidate: true },
    });
    console.log(`created: ${page.slug} (${page.abschnitte.length} Abschnitte)`);
  }

  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
