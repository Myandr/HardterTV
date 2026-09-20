import { getPayload } from "payload";
import { convertMarkdownToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";

import config from "../payload.config";
import type { LegalPage } from "../payload-types";

/**
 * Aktualisiert die im CMS gespeicherten Texte für die Zwei-Klick-Einbindung von
 * SimplyBook.me und nuLiga (Cookie-Banner + Datenschutzerklärung).
 *
 * WICHTIG: Die folgenden Angaben müssen vom Verein bzw. aus der SimplyBook-Dokumentation
 * stammen. Solange ein Wert leer ist, bricht das Skript ab und ändert nichts.
 * Vor dem Live-Schalten anwaltlich prüfen lassen.
 */
const SIMPLYBOOK = {
  /** Name und Anschrift des Anbieters (Verantwortlicher/Auftragsverarbeiter) laut SimplyBook-Dokumentation. */
  anbieter: "",
  /** Speicherdauer der Buchungsdaten (z. B. "bis zum Ablauf der gesetzlichen Aufbewahrungsfristen"). */
  speicherdauer: "",
  /** Aussage zum AV-Vertrag, z. B. "Mit dem Anbieter besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO." */
  avvHinweis: "",
  /** Aussage zur Drittlandübermittlung (Serverstandort, Garantien wie SCCs/Angemessenheitsbeschluss). */
  drittland: "",
};

const BANNER_TEXT_VOR =
  "Wir binden externe Dienste ein: Google Maps laden wir nur mit Ihrer Einwilligung. Die Online-Buchung (SimplyBook.me) und die Ligadaten (nuLiga) werden erst nach einem separaten Klick auf der jeweiligen Seite geladen. Weitere Infos in unserer";

const COOKIES_MARKDOWN = `Unsere Website verwendet technisch notwendige Cookies, die für den Betrieb der Website erforderlich sind (z. B. zum Speichern Ihrer Cookie-Einstellungen). Darüber hinaus werden Cookies von Google Maps erst nach Ihrer ausdrücklichen Einwilligung gesetzt. Die Online-Buchung (SimplyBook.me) und die Ligadaten (nuLiga) werden erst nach Ihrem ausdrücklichen Klick auf „Buchung laden“ bzw. „Ligadaten laden“ eingebunden; erst dann werden Daten an den jeweiligen Anbieter übertragen und dort Cookies gesetzt. Technisch notwendige Cookies können nicht deaktiviert werden.

Ihre Einwilligung für optionale Cookies können Sie jederzeit über die [Cookie-Einstellungen](/cookies) widerrufen.

> Rechtsgrundlage technisch notwendige Cookies: Art. 6 Abs. 1 lit. f DSGVO · Rechtsgrundlage optionale Cookies und Einbindung externer Inhalte: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)`;

const simplybookMarkdown = () => `Für die Online-Buchung von Eisstockschießen (Seite „Eisstock“) nutzen wir den Buchungsdienst SimplyBook.me. Anbieter: ${SIMPLYBOOK.anbieter}

Das Buchungsformular wird erst eingebunden, nachdem Sie auf „Buchung laden“ geklickt haben. Vorher werden keine Daten an SimplyBook.me übertragen. Alternativ können Sie die Buchungsseite direkt bei SimplyBook.me öffnen (hartdertv.simplybook.it).

Nach dem Laden werden Ihre IP-Adresse, Browserinformationen und die Adresse der aufgerufenen Seite an SimplyBook.me übertragen und Cookies bzw. ähnliche Technologien (u. a. „sb_token_hartdertv“ und „sb_line_token_hartdertv“) gesetzt. Bei einer Buchung werden die von Ihnen eingegebenen Daten (Name, Kontaktdaten, gewählter Termin, ggf. Nachricht) verarbeitet. Zweck ist die Abwicklung und Verwaltung Ihrer Buchung.

${SIMPLYBOOK.avvHinweis}

${SIMPLYBOOK.drittland}

> Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO i. V. m. § 25 Abs. 1 TDDDG (Einwilligung in das Laden des Widgets und den Zugriff auf Endgeräteinformationen) · Art. 6 Abs. 1 lit. b DSGVO (Durchführung der Buchung) · Speicherdauer: ${SIMPLYBOOK.speicherdauer} · Die Einwilligung können Sie jederzeit widerrufen, indem Sie die Seite verlassen und die gespeicherten Cookies in Ihrem Browser löschen.`;

const LIGA_MARKDOWN = `Auf den Seiten unserer Mannschaften werden Ligadaten des Westfälischen Tennis-Verbands (WTV) eingebunden, die über den Dienst nuLiga (Anbieter: Ediscom GmbH, Otto-Hahn-Str. 1, 97204 Höchberg) unter wtv.liga.nu bereitgestellt werden. Die Einbindung erfolgt per iframe, aber erst nachdem Sie auf „Ligadaten laden“ geklickt haben. Vorher werden keine Daten an nuLiga übertragen. Alternativ können Sie die Ligadaten über den Link „Ligadaten bei nuLiga öffnen“ direkt bei nuLiga aufrufen; dann verlassen Sie unsere Website und es gelten die Datenschutzbestimmungen von nuLiga.

Nach dem Laden werden Ihre IP-Adresse, Browserinformationen und die Adresse der aufgerufenen Seite an nuLiga übertragen.

Weitere Informationen: [nuLiga Datenschutz](https://www.nuliga.de).

> Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO i. V. m. § 25 Abs. 1 TDDDG (Einwilligung durch Klick auf „Ligadaten laden“) · Die Einwilligung gilt nur für den aktuellen Seitenaufruf und kann durch Verlassen der Seite widerrufen werden`;

type LexNode = { type?: string; fields?: { url?: string; newTab?: boolean }; children?: LexNode[] };

function setNewTabForExternalLinks(node: LexNode): void {
  if ((node.type === "link" || node.type === "autolink") && node.fields) {
    node.fields.newTab = (node.fields.url ?? "").startsWith("http");
  }
  for (const child of node.children ?? []) setNewTabForExternalLinks(child);
}

async function run() {
  const missing = Object.entries(SIMPLYBOOK)
    .filter(([, v]) => !v.trim())
    .map(([k]) => k);
  if (missing.length > 0) {
    console.error(`Abbruch: Bitte zuerst in SIMPLYBOOK ausfüllen: ${missing.join(", ")}`);
    process.exit(1);
  }

  const payload = await getPayload({ config });
  const editorConfig = await editorConfigFactory.default({ config: payload.config });
  const toLexical = (markdown: string) => {
    const state = convertMarkdownToLexical({ editorConfig, markdown });
    setNewTabForExternalLinks(state.root as unknown as LexNode);
    return state as unknown as NonNullable<LegalPage["intro"]>;
  };

  const cookieTexte = await payload.findGlobal({ slug: "cookie-texte", depth: 0 });
  await payload.updateGlobal({
    slug: "cookie-texte",
    data: { banner: { ...cookieTexte.banner, textVor: BANNER_TEXT_VOR } },
  });
  console.log("updated: cookie-texte.banner.textVor");

  const { docs } = await payload.find({
    collection: "legal-pages",
    where: { slug: { equals: "datenschutz" } },
    limit: 1,
    depth: 0,
  });
  const page = docs[0];
  if (!page) throw new Error("Datenschutz-Seite nicht gefunden (seed:legal-pages ausführen)");

  const abschnitte = (page.abschnitte ?? []).map((a) => ({ titel: a.titel, inhalt: a.inhalt }));
  const replace = (titelStart: string, markdown: string) => {
    const i = abschnitte.findIndex((a) => a.titel.toLowerCase().startsWith(titelStart.toLowerCase()));
    if (i === -1) throw new Error(`Abschnitt nicht gefunden: ${titelStart}`);
    abschnitte[i] = { titel: abschnitte[i].titel, inhalt: toLexical(markdown) };
  };

  replace("Cookies", COOKIES_MARKDOWN);
  replace("Liga-Daten", LIGA_MARKDOWN);

  const title = "Online-Buchung Eisstockschießen (SimplyBook.me)";
  const neu = { titel: title, inhalt: toLexical(simplybookMarkdown()) };
  const existing = abschnitte.findIndex((a) => a.titel === title);
  if (existing >= 0) {
    abschnitte[existing] = neu;
  } else {
    const mapsIdx = abschnitte.findIndex((a) => a.titel === "Google Maps");
    abschnitte.splice(mapsIdx >= 0 ? mapsIdx + 1 : abschnitte.length, 0, neu);
  }

  await payload.update({
    collection: "legal-pages",
    id: page.id,
    data: { abschnitte },
  });
  console.log("updated: datenschutz");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
