# Alle restlichen Seitentexte in Payload („alles ins Payload") — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nach den Plänen 1–5 stehen alle *Inhalte* (Teams, Vorstand, Termine, Galerie, News, Rechtstexte, Mitgliedschaft, Training, Eisstock, Startseiten-Globals) in Payload — aber die **Rahmentexte der Seiten** stecken noch im Code: die Hero-Bereiche von `/vorstand`, `/kalender`, `/galerie`, `/mannschaften`, der „Sportwart"-Kontaktblock, die Abschnitts-Überschriften der Startseite, die Vorstandsgruppen, die Footer-Spalten, die Formulartexte des Kontaktformulars und die Cookie-/Einwilligungstexte. Dieser Plan macht sie **alle** im Admin editierbar, ohne dass sich am gerenderten Text ein einziges Zeichen ändert.

**Architecture:** Ein neues Global **`seiten-texte`** (Tabs pro Unterseite: Vorstand, Kalender, Galerie, Mannschaften, Mannschaftsdetail, Rechtliches) bündelt die Texte der Unterseiten; drei kleine neue Globals (`termine-section`, `vorstand-section`, `news-section`) ergänzen die vorhandenen Startseiten-Globals in der Admin-Gruppe „Startseite"; die bestehenden Globals `footer` und `kontakt-section` werden um Felder **erweitert** (Schnelle Links, Spaltenüberschriften, Formulartexte, Fehlermeldungen); ein letztes Global `cookie-texte` trägt die Einwilligungs-Oberfläche. Jede Schemaänderung bekommt eine eigene Migration, jeder neue/erweiterte Datensatz ein eigenes, idempotentes Seed-Skript mit **eigenem Marker-Feld** (die alten Seeds von `footer`/`kontakt-section` sind längst gelaufen und würden sonst überspringen). Gerendert wird weiterhin in Server Components; Client-Komponenten bekommen einfache, serialisierbare Props.

**Tech Stack:** Payload 3.89 (`@payloadcms/db-postgres` auf Neon, `@payloadcms/storage-vercel-blob`), Next.js 16.2.6 App Router, React 19.2.4, TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-17-payload-cms-migration-design.md`
**Builds on:** Pläne 1–5 (alle erledigt), zuletzt `docs/superpowers/plans/2026-09-19-payload-startseite-kontakt.md`. Übernommene Konventionen: `globals/hooks/revalidate.ts`, idempotente self-contained Seeds mit `context: { disableRevalidate: true }`, Baseline-Diff als Abnahmekriterium, `export const revalidate = 3600` auf den Frontend-Seiten.

**Auslöser:** Ledger-Eintrag in `.superpowers/sdd/2026-09-19-payload-startseite-kontakt/progress.md`: „Deferred to plan 6 (all page texts/section headings/Sportwart contact/vorstand groups editable) per user goal ‚alles ins Payload'."

---

## Global Constraints

- Alle Pfade relativ zum Next-Projektwurzelverzeichnis `hardtertv/`. Alle Befehle aus `hardtertv/` heraus.
- **Niemals `next dev` / `npm run dev`.** Die Neon-Datenbank ist echt und geteilt; `next dev` pusht Schema direkt hinein und hinterlässt eine `dev`-Zeile in `payload_migrations`, die `payload migrate` hängen lässt (realer Vorfall). Verifikation ist immer: `npm run build` → `npx next start -p 3111` (Hintergrund) → `curl` → **eigenen** Server per PID beenden.
- **Port-Hygiene:** immer `-p 3111`. PID merken (`echo $! > "$SCRATCH/server.pid"`), beenden mit `kill "$(cat "$SCRATCH/server.pid")"`. **Niemals** `pkill -f next-server` / `pkill node`.
- `payload.config.ts` hat `push: false` — Schemaänderungen ausschließlich über Migrationen. Reihenfolge für jedes neue/erweiterte Global: Config-Datei schreiben → in `payload.config.ts` registrieren → `npm run migrate:create -- <name>` → `npm run migrate` → `npm run generate:types` → **erst dann** seeden, bauen oder sonst irgendetwas, das Payload gegen die DB hochfährt. **Fragt `migrate` irgendetwas (z. B. nach „dev mode"), SOFORT STOPPEN und BLOCKED melden — die Rückfrage niemals beantworten.**
- Publish-Workflow: sofort live, keine `versions`/Drafts.
- Access: alle hier angefassten Globals sind öffentlicher Seiteninhalt → `read: () => true`, `update` bleibt Payload-Default (authentifiziert). `collections/Users.ts` und `collections/ContactSubmissions.ts` werden **nicht** angefasst.
- Revalidation: jeder `afterChange`-Hook prüft `req.context?.disableRevalidate`; **jeder Seed-Schreibvorgang übergibt `context: { disableRevalidate: true }`** (`revalidatePath` wirft außerhalb eines Next-Requests).
- Seeds: self-contained (Textliterale stehen im Skript), idempotent mit explizitem „already seeded"-Check. **Erweiterungs-Seeds für bereits geseedete Globals prüfen auf ein Feld, das es vorher nicht gab** — sonst überspringen sie sofort.
- **Markup, Klassen und Design bleiben unverändert.** Geändert wird ausschließlich die Datenquelle. Abnahmekriterium jeder Verdrahtungs-Task: der normalisierte sichtbare Text der betroffenen Seite ist **byteidentisch** zur Baseline aus Task 1. Weicht er ab, wird der **Seed** korrigiert — niemals die Baseline.
- JSX-Whitespace ist tückisch: `Unser{" "}<span>Vorstand</span>` ergibt „Unser Vorstand", ein Zeilenumbruch mit Einrückung im JSX-Text kollabiert zu **einem** Leerzeichen. Seed-Strings deshalb immer so notieren, wie sie **gerendert** aussehen (ein Leerzeichen), und die `{" "}`-Trenner im JSX stehen lassen.
- **Was bewusst im Code bleibt** (und warum):
  - die **Navbar** (`components/ui/navbar.tsx`) — Spec-Entscheidung: Navigationseinträge bilden 1:1 reale Routen ab, CMS-Pflege riskiert tote Links ohne Sicherheitsnetz;
  - **Datums-/Lokalisierungsdaten**: Monats- und Wochentagsnamen sowie Datumsformate in `lib/events.ts`, `lib/news.ts` und `app/(frontend)/kalender/kalender-client.tsx` — das ist Lokalisierung, kein Inhalt;
  - **Enum-Werte** aus Collections (`Herren`/`Damen`/`Gemischt`, `Training`/`Turnier`/`Sonstiges`, Legal-Slugs) — die stehen bereits als Select-Optionen im Admin und werden dort gepflegt;
  - **SEO-Metadaten** (`metadata`-Exporte, `layout.tsx`) — unverändert, mit *einer* Ausnahme: die Saison-Angabe in `generateMetadata` von `/mannschaften/[slug]` wird aus dem gleichen Payload-Feld gespeist wie die sichtbare Angabe, damit beide nicht auseinanderlaufen (Task 7);
  - das `title`-Attribut des Buchungs-iframes in `components/ui/eis-widget.tsx` („Eisstockschießen online buchen") — reines Screenreader-Attribut des eingebetteten Fremdwidgets, kein sichtbarer Seiteninhalt;
  - `components/ui/location-section.tsx` bezieht die Texte der gesperrten Karten-Kachel („Google Maps nicht aktiviert" / „Einstellungen") aus `cookie-texte` (`maps.titel`, `banner.einstellungenLabel`) statt eigener Felder;
  - der Admin-Hinweistext in `components/ui/eis-widget.tsx` („Online-Buchung coming soon … im Payload-Admin eintragen") — er erscheint nur, solange ein Redakteur die URL *nicht* gepflegt hat, und erklärt genau diese Pflege; ihn editierbar zu machen wäre zirkulär.
- Node: System-Node genügt (`"type": "module"` gesetzt). Commit mit **gezieltem `git add`** — nie `git add -A`, nie `.env.local` stagen, nie `--amend`; nur neue Commits.
- Wegwerf-Prüfskripte/-routen liegen **außerhalb** des Repos und werden vor dem Commit gelöscht; sie werden nie committet.
- Lange Kommandos (Builds, DB) im Hintergrund mit Ausgabe in eine Datei starten und pollen (die Maschine stockt sonst).
- Heutiges Datum: **2026-09-20**.

### Scratch-Verzeichnis (von jedem Verifikationsschritt benutzt)

```bash
export SCRATCH="${TMPDIR:-/tmp}/htv-plan6"
mkdir -p "$SCRATCH"
```

---

## File Structure

```
hardtertv/
  globals/
    SeitenTexte.ts                 # neu — Global "seiten-texte", Tabs pro Unterseite
    TermineSection.ts              # neu
    VorstandSection.ts             # neu
    NewsSection.ts                 # neu
    CookieTexte.ts                 # neu
    Footer.ts                      # erweitert — Schnelle Links, Spaltentitel, Rechtslinks
    KontaktSection.ts              # erweitert — Gruppe "formular" + Gruppe "fehlermeldungen"
  lib/
    seiten-texte.ts                # neu — getSeitenTexte() Helper
    interne-links.ts               # neu — erlaubte interne Routen (Select-Optionen, kein React-Import)
    vorstand-gruppen.ts            # geändert — value + adminLabel (Titel/Beschreibung kommen aus Payload)
    kontakt-validation.ts          # geändert — Meldungen als Parameter + STANDARD_MELDUNGEN
    cookie-consent.ts              # neu — localStorage-Helfer, aus cookie-banner.tsx herausgelöst
    actions/kontakt.ts             # geändert — lädt Meldungen aus dem Global (mit Fallback)
  scripts/
    seed-seiten-texte.ts           # neu
    seed-startseite-abschnitte.ts  # neu (termine/vorstand/news-section in einem Skript)
    seed-footer-links.ts           # neu (Erweiterungs-Seed für das bestehende footer-Global)
    seed-kontakt-formular.ts       # neu (Erweiterungs-Seed für kontakt-section)
    seed-cookie-texte.ts           # neu
  migrations/                      # +5 generierte Migrationen
  payload.config.ts                # geändert — 5 neue Globals
  package.json                     # geändert — 5 Seed-Skripte
  payload-types.ts                 # neu generiert
  app/(frontend)/
    vorstand/page.tsx              # geändert
    kalender/page.tsx              # geändert
    kalender/kalender-client.tsx   # geändert (Props)
    galerie/page.tsx               # geändert
    galerie/galerie-client.tsx     # geändert (Props)
    mannschaften/page.tsx          # geändert
    mannschaften/mannschaften-client.tsx  # geändert (Props)
    mannschaften/[slug]/page.tsx   # geändert
    impressum/page.tsx             # geändert
    datenschutz/page.tsx           # geändert
    cookies/page.tsx               # geändert
    page.tsx                       # geändert — 3 zusätzliche Globals
    layout.tsx                     # UNVERÄNDERT (CookieBanner bleibt ein Default-Import)
  components/ui/
    termine-section.tsx            # geändert (Props)
    vorstand-section.tsx           # geändert (Props)
    news-section.tsx               # geändert (Props)
    footer.tsx                     # geändert
    kontakt-section.tsx            # geändert (Props)
    maps-consent-gate.tsx          # geändert (Props)
    cookie-banner.tsx              # geändert — async Server-Wrapper, holt cookie-texte
    cookie-banner-client.tsx       # neu — der bisherige Client-Code mit Props
    cookie-settings.tsx            # geändert (Props)
  hooks/use-cookie-consent.ts      # geändert — Import aus lib/cookie-consent
```

---

### Task 1: Baseline-Aufnahme aller Seiten

Läuft **vor jeder Umverdrahtung** und ändert nichts Sichtbares. Ohne diese Baseline gibt es kein Abnahmekriterium.

**Files:**
- Außerhalb des Repos: `$SCRATCH/normalize.mjs`, `$SCRATCH/baseline-*.html|txt`, `$SCRATCH/team-slug.txt`

**Interfaces:**
- Produziert (von Tasks 3–14 genutzt): `$SCRATCH/normalize.mjs` und `$SCRATCH/baseline-<name>.txt` für: `home`, `vorstand`, `kalender`, `galerie`, `mannschaften`, `team`, `impressum`, `datenschutz`, `cookies`, `training`, `mitgliedschaft`, `eisstock`.

- [ ] **Step 1: Normalisierer anlegen (außerhalb des Repos, nie committen)**

```bash
export SCRATCH="${TMPDIR:-/tmp}/htv-plan6"
mkdir -p "$SCRATCH"
cat > "$SCRATCH/normalize.mjs" <<'EOF'
import { readFileSync } from "node:fs";

const ENTITIES = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
  "&#x27;": "'", "&#39;": "'", "&#x2F;": "/", "&nbsp;": " ",
};

const html = readFileSync(process.argv[2], "utf8");
const text = html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&[a-zA-Z#0-9x]+;/g, (m) => ENTITIES[m] ?? " ")
  .replace(/\s+/g, " ")
  .trim();

// ein Wort pro Zeile, damit `diff` genau auf das geänderte Wort zeigt
process.stdout.write(text.split(" ").join("\n") + "\n");
EOF
```

- [ ] **Step 2: Aktuelle Site bauen und Baseline aufnehmen**

```bash
export SCRATCH="${TMPDIR:-/tmp}/htv-plan6"
npm run build > "$SCRATCH/build.log" 2>&1
npx next start -p 3111 > "$SCRATCH/start.log" 2>&1 &
echo $! > "$SCRATCH/server.pid"
until curl -sf -o /dev/null http://localhost:3111/; do sleep 1; done

# einen realen Team-Slug ermitteln (die Detailseite hängt an den geseedeten Teams)
curl -s http://localhost:3111/mannschaften \
  | grep -o '/mannschaften/[a-z0-9-]\+' | head -1 | sed 's|/mannschaften/||' \
  > "$SCRATCH/team-slug.txt"
test -s "$SCRATCH/team-slug.txt"
TEAM="$(cat "$SCRATCH/team-slug.txt")"

for p in home:/ vorstand:/vorstand kalender:/kalender galerie:/galerie \
         mannschaften:/mannschaften "team:/mannschaften/$TEAM" \
         impressum:/impressum datenschutz:/datenschutz cookies:/cookies \
         training:/training mitgliedschaft:/mitgliedschaft eisstock:/eisstock; do
  name="${p%%:*}"; path="${p#*:}"
  curl -s "http://localhost:3111$path" > "$SCRATCH/baseline-$name.html"
  node "$SCRATCH/normalize.mjs" "$SCRATCH/baseline-$name.html" > "$SCRATCH/baseline-$name.txt"
done

kill "$(cat "$SCRATCH/server.pid")"
```

Erwartung: Build grün; alle zwölf `baseline-*.txt` nicht leer; `baseline-vorstand.txt` enthält `Vorstand` und `mitmachen?`; `baseline-mannschaften.txt` enthält `Sportwart`; `baseline-home.txt` enthält `Kommende`, `Termine`, `Neuigkeiten`, `Schnelle`; `baseline-team.txt` enthält `Saison`.

> Hinweis für spätere Tasks: Cookie-Banner und Cookie-Einstellungen rendern serverseitig **nichts** (beide starten mit `visible`/`loaded` = false und setzen den Zustand erst in `useEffect`). Der Baseline-Diff kann sie also nicht prüfen — Task 13 verifiziert sie deshalb ausdrücklich im Browser. Der Maps-Platzhalter *ist* im SSR-HTML enthalten und wird vom Diff abgedeckt.

- [ ] **Step 3: Kein Commit**

Diese Task committet nichts (es entstehen nur Dateien außerhalb des Repos). Im Ledger als „complete, no commit" vermerken.

---

### Task 2: Global `seiten-texte` — Config, Migration, Seed

Legt das gesamte Schema und den gesamten Inhalt für die Unterseiten-Texte an. **Noch keine Verdrahtung** — die Site rendert danach unverändert. Grund für diesen horizontalen Schnitt: alle sechs Tabs liegen in *einem* Global, also in *einer* Tabelle; eine Migration und ein Seed pro Tab würden sechs Migrationen auf dieselbe Tabelle und sechs Idempotenz-Marker erzeugen. Die Verdrahtung bleibt danach pro Seite klein und einzeln prüfbar (Tasks 3–8).

**Files:**
- Create: `globals/SeitenTexte.ts`, `lib/seiten-texte.ts`, `scripts/seed-seiten-texte.ts`
- Modify: `payload.config.ts`, `package.json`
- Generated: `migrations/<timestamp>_add_seiten_texte.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Consumes: `revalidateGlobalLayout` aus `globals/hooks/revalidate.ts`.
- Produces: Global-Slug `"seiten-texte"` mit den benannten Tabs `vorstand`, `kalender`, `galerie`, `mannschaften`, `mannschaftDetail`, `rechtliches`; `lib/seiten-texte.ts` exportiert `getSeitenTexte(): Promise<SeitenTexte>` (Typ aus `payload-types`).

**Design decisions:**
- **Ein Global statt sechs**, weil Redakteure „Seitentexte" als einen Ort erwarten und Tabs im Admin genau diese Gliederung abbilden (gleiches Muster wie `globals/Mitgliedschaft.ts`).
- **Revalidation layout-weit** (`revalidateGlobalLayout()`, also `revalidatePath("/", "layout")`) statt einer Pfadliste: die Texte betreffen sieben statische Routen **plus** die dynamische Route `/mannschaften/[slug]`, für die eine Pfadliste die exakte Pattern-Schreibweise treffen müsste. Die Texte ändern sich selten; ein layout-weites Invalidieren ist der robuste, bereits erprobte Weg (`footer` macht es genauso).
- **Feldnamen** folgen der Konvention der „Seiten"-Globals (`eyebrow`, `titelVorne`, `titelHighlight`, `text`), nicht der Startseiten-Konvention (`headlineTeil1/2`, `intro`) — die neuen Startseiten-Globals in Task 9 verwenden umgekehrt die Startseiten-Konvention, damit jede Admin-Gruppe in sich konsistent bleibt.
- **Vorstandsgruppen als Array mit Select-Schlüssel:** eine Zeile pro Gruppe mit `gruppe` (Select über die fünf festen Schlüssel), `titel`, `beschreibung`. Die Reihenfolge der Zeilen bestimmt die Reihenfolge der Abschnitte auf `/vorstand`. Die Select-*Optionen* einer Payload-Collection müssen statisch sein, deshalb bleibt `lib/vorstand-gruppen.ts` als Schlüsselliste bestehen (Task 3).
- **Mannschafts-Kategorien als Array mit Select-Schlüssel:** eine Zeile je `Herren`/`Damen`/`Gemischt` mit Tab-Beschriftung, Listen-Eyebrow und Badge-Suffix — statt neun Einzelfeldern.
- Alle Textfelder `required: true` mit `maxLength`, damit ein leer gespeichertes Feld nicht unbemerkt eine Überschrift verschwinden lässt.

- [ ] **Step 1: `globals/SeitenTexte.ts` anlegen**

```ts
import type { GlobalConfig } from "payload";

import { VORSTAND_GRUPPEN } from "../lib/vorstand-gruppen";
import { revalidateGlobalLayout } from "./hooks/revalidate";

const TEAM_KATEGORIEN = [
  { label: "Herren", value: "Herren" },
  { label: "Damen", value: "Damen" },
  { label: "Gemischt", value: "Gemischt" },
];

export const SeitenTexte: GlobalConfig = {
  slug: "seiten-texte",
  label: "Seitentexte (Unterseiten)",
  admin: {
    group: "Seiten",
    description:
      "Überschriften und Einleitungen der Unterseiten. Die Inhalte selbst (Vorstandsmitglieder, Termine, Bilder, Mannschaften) werden in den jeweiligen Sammlungen gepflegt.",
  },
  access: {
    read: () => true,
  },
  hooks: {
    // Diese Texte stehen auf sieben festen Seiten UND auf der dynamischen Route
    // /mannschaften/[slug]. Layout-weit invalidieren ist hier der sichere Weg.
    afterChange: [revalidateGlobalLayout()],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "vorstand",
          label: "Vorstand",
          fields: [
            { name: "eyebrow", type: "text", required: true, maxLength: 60, label: "Kleiner Titel über der Überschrift" },
            { name: "titelVorne", type: "text", required: true, maxLength: 60, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, maxLength: 60, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, maxLength: 600, label: "Einleitungstext" },
            {
              name: "badgeSuffix",
              type: "text",
              required: true,
              maxLength: 40,
              label: "Beschriftung der Personen-Zahl",
              admin: { description: 'Die Zahl wird automatisch davorgesetzt, z. B. "17 Mitglieder".' },
            },
            {
              name: "gruppen",
              type: "array",
              required: true,
              minRows: 1,
              maxRows: VORSTAND_GRUPPEN.length,
              label: "Gruppen",
              labels: { singular: "Gruppe", plural: "Gruppen" },
              admin: {
                description:
                  "Reihenfolge der Zeilen = Reihenfolge der Abschnitte auf der Seite. Gruppen ohne Mitglieder werden nicht angezeigt.",
              },
              fields: [
                {
                  name: "gruppe",
                  type: "select",
                  required: true,
                  label: "Gruppe",
                  options: VORSTAND_GRUPPEN.map((g) => ({ label: g.adminLabel, value: g.value })),
                },
                { name: "titel", type: "text", required: true, maxLength: 80, label: "Überschrift" },
                { name: "beschreibung", type: "textarea", required: true, maxLength: 400, label: "Beschreibung" },
              ],
            },
            { name: "ctaTitel", type: "text", required: true, maxLength: 120, label: "Aufruf am Seitenende: Überschrift" },
            { name: "ctaText", type: "textarea", required: true, maxLength: 400, label: "Aufruf am Seitenende: Text" },
            { name: "ctaButtonLabel", type: "text", required: true, maxLength: 60, label: "Aufruf am Seitenende: Button" },
            { name: "ctaEmail", type: "email", required: true, label: "Aufruf am Seitenende: E-Mail-Adresse" },
          ],
        },
        {
          name: "kalender",
          label: "Kalender",
          fields: [
            { name: "eyebrow", type: "text", required: true, maxLength: 60, label: "Kleiner Titel über der Überschrift" },
            { name: "titelVorne", type: "text", required: true, maxLength: 60, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, maxLength: 60, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, maxLength: 600, label: "Einleitungstext" },
            { name: "monatsansichtLabel", type: "text", required: true, maxLength: 40, label: "Umschalter: Monatsansicht" },
            { name: "listenansichtLabel", type: "text", required: true, maxLength: 40, label: "Umschalter: Listenansicht" },
            { name: "filterAlleLabel", type: "text", required: true, maxLength: 40, label: 'Filter: "alle Kategorien"' },
            { name: "ausgewaehlterTagLabel", type: "text", required: true, maxLength: 60, label: "Seitenleiste: ausgewählter Tag" },
            { name: "naechsteTermineLabel", type: "text", required: true, maxLength: 60, label: "Seitenleiste: nächste Termine" },
            { name: "keineTermineTag", type: "text", required: true, maxLength: 120, label: "Hinweis: keine Termine an diesem Tag" },
            { name: "keineTermineListe", type: "text", required: true, maxLength: 120, label: "Hinweis: keine Termine gefunden" },
            {
              name: "uhrzeitSuffix",
              type: "text",
              required: true,
              maxLength: 20,
              label: "Zusatz hinter der Uhrzeit",
              admin: { description: 'Steht hinter jeder Uhrzeit, z. B. "Uhr".' },
            },
          ],
        },
        {
          name: "galerie",
          label: "Galerie",
          fields: [
            { name: "eyebrow", type: "text", required: true, maxLength: 60, label: "Kleiner Titel über der Überschrift" },
            { name: "titelVorne", type: "text", required: true, maxLength: 60, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, maxLength: 60, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, maxLength: 600, label: "Einleitungstext" },
            {
              name: "bilderSuffix",
              type: "text",
              required: true,
              maxLength: 40,
              label: "Beschriftung der Bilder-Zahl",
              admin: { description: 'Die Zahl wird automatisch davorgesetzt, z. B. "84 Bilder".' },
            },
            { name: "leerText", type: "text", required: true, maxLength: 200, label: "Hinweis, wenn keine Bilder online sind" },
          ],
        },
        {
          name: "mannschaften",
          label: "Mannschaften (Übersicht)",
          fields: [
            { name: "eyebrow", type: "text", required: true, maxLength: 60, label: "Kleiner Titel über der Überschrift" },
            { name: "titelVorne", type: "text", required: true, maxLength: 60, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, maxLength: 60, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, maxLength: 600, label: "Einleitungstext" },
            {
              name: "kategorien",
              type: "array",
              required: true,
              minRows: 1,
              maxRows: 3,
              label: "Kategorien",
              labels: { singular: "Kategorie", plural: "Kategorien" },
              admin: {
                description:
                  "Beschriftungen für die drei Reiter. Die Zuordnung der Teams passiert in der Sammlung Mannschaften.",
              },
              fields: [
                { name: "kategorie", type: "select", required: true, options: TEAM_KATEGORIEN, label: "Kategorie" },
                { name: "reiterLabel", type: "text", required: true, maxLength: 40, label: "Beschriftung des Reiters" },
                { name: "listenEyebrow", type: "text", required: true, maxLength: 40, label: "Kleiner Titel über der Liste" },
                {
                  name: "badgeSuffix",
                  type: "text",
                  required: true,
                  maxLength: 40,
                  label: "Beschriftung der Zahl im Hero",
                  admin: { description: 'Die Zahl wird automatisch davorgesetzt, z. B. "9 Herren-Teams".' },
                },
              ],
            },
            {
              name: "teamsSuffix",
              type: "text",
              required: true,
              maxLength: 40,
              label: "Beschriftung der Team-Zahl über der Liste",
              admin: { description: 'Die Zahl wird automatisch davorgesetzt, z. B. "9 Teams".' },
            },
            { name: "kartenUntertitel", type: "text", required: true, maxLength: 60, label: "Untertitel auf jeder Mannschaftskarte" },
            { name: "kontaktEyebrow", type: "text", required: true, maxLength: 60, label: "Kontaktblock: kleiner Titel" },
            { name: "kontaktTitelVorne", type: "text", required: true, maxLength: 60, label: "Kontaktblock: Überschrift – erster Teil" },
            { name: "kontaktTitelHighlight", type: "text", required: true, maxLength: 60, label: "Kontaktblock: Überschrift – unterstrichener Teil" },
            { name: "kontaktText", type: "textarea", required: true, maxLength: 400, label: "Kontaktblock: Text" },
            { name: "kontaktLabel", type: "text", required: true, maxLength: 60, label: "Kontaktblock: Funktionsbezeichnung" },
            { name: "kontaktTelefon", type: "text", required: true, maxLength: 40, label: "Kontaktblock: Telefonnummer (Anzeige)" },
            {
              name: "kontaktTelefonHref",
              type: "text",
              required: true,
              maxLength: 60,
              label: "Kontaktblock: Telefonnummer (Anruf-Link)",
              admin: { description: 'Technische Schreibweise, z. B. "tel:+4915153553355".' },
            },
            { name: "kontaktEmail", type: "email", required: true, label: "Kontaktblock: E-Mail-Adresse" },
          ],
        },
        {
          name: "mannschaftDetail",
          label: "Mannschaften (Detailseite)",
          fields: [
            { name: "zurueckLabel", type: "text", required: true, maxLength: 60, label: "Zurück-Link" },
            {
              name: "saisonLabel",
              type: "text",
              required: true,
              maxLength: 60,
              label: "Saison-Angabe über den Kontaktdaten",
            },
            { name: "vereinBadge", type: "text", required: true, maxLength: 40, label: "Badge links" },
            { name: "verbandBadge", type: "text", required: true, maxLength: 40, label: "Badge rechts" },
            { name: "ligaEyebrow", type: "text", required: true, maxLength: 60, label: "Ligabereich: kleiner Titel" },
            { name: "ligaTitel", type: "text", required: true, maxLength: 80, label: "Ligabereich: Überschrift" },
            {
              name: "ligaSaisonLabel",
              type: "text",
              required: true,
              maxLength: 60,
              label: "Ligabereich: Saison-Angabe neben dem Mannschaftsnamen",
              admin: {
                description:
                  'Erscheint als "<Mannschaft> – <Angabe>" und zusätzlich in der Seitenbeschreibung für Suchmaschinen.',
              },
            },
            { name: "ligaQuelle", type: "text", required: true, maxLength: 60, label: "Ligabereich: Quellenangabe rechts" },
            { name: "abschlussText", type: "text", required: true, maxLength: 120, label: "Text über dem Zurück-Link am Seitenende" },
          ],
        },
        {
          name: "rechtliches",
          label: "Rechtliche Seiten",
          fields: [
            {
              name: "zurueckLabel",
              type: "text",
              required: true,
              maxLength: 60,
              label: "Zurück-Link auf Impressum und Datenschutz",
            },
            { name: "cookiesEyebrow", type: "text", required: true, maxLength: 60, label: "Cookie-Seite: kleiner Titel" },
            {
              name: "cookiesTitelVorne",
              type: "text",
              required: true,
              maxLength: 60,
              label: "Cookie-Seite: Überschrift – erster Teil",
              admin: { description: 'Wird ohne Leerzeichen an den zweiten Teil gehängt (aktuell "Cookie-" + "Einstellungen").' },
            },
            { name: "cookiesTitelHighlight", type: "text", required: true, maxLength: 60, label: "Cookie-Seite: Überschrift – unterstrichener Teil" },
          ],
        },
      ],
    },
  ],
};
```

> `VORSTAND_GRUPPEN` wird hier bereits mit `adminLabel` gelesen — das Feld entsteht in Task 3. Für diese Task genügt es, in `lib/vorstand-gruppen.ts` **zusätzlich** `adminLabel` zu ergänzen (Wert = bisheriger `titel`), ohne `titel`/`beschreibung` zu entfernen; Task 3 räumt dann auf. So bleibt der Baum nach jeder Task kompilierbar.

- [ ] **Step 2: `lib/vorstand-gruppen.ts` um `adminLabel` ergänzen** (nicht-brechende Zwischenstufe)

Jede der fünf Zeilen bekommt zusätzlich `adminLabel: "<bisheriger titel>"`. `titel` und `beschreibung` bleiben vorerst stehen (`app/(frontend)/vorstand/page.tsx` und `collections/BoardMembers.ts` benutzen sie noch).

- [ ] **Step 3: `lib/seiten-texte.ts` anlegen**

```ts
import { getPayload } from "payload";
import config from "@payload-config";

import type { SeitenTexte } from "@/payload-types";

export async function getSeitenTexte(): Promise<SeitenTexte> {
  const payload = await getPayload({ config });
  return payload.findGlobal({ slug: "seiten-texte", depth: 0 });
}
```

- [ ] **Step 4: Registrieren, migrieren, Typen erzeugen**

In `payload.config.ts` importieren (`import { SeitenTexte } from "./globals/SeitenTexte";`) und ans Ende des `globals`-Arrays hängen. Dann:

```bash
npm run migrate:create -- add_seiten_texte
npm run migrate
npm run generate:types
```

Erwartung: neue Migration legt `seiten_texte` plus die Array-Tabellen `seiten_texte_vorstand_gruppen` und `seiten_texte_mannschaften_kategorien` an; `payload-types.ts` bekommt ein `SeitenTexte`-Interface. `migrate` darf nichts fragen — sonst STOPPEN und BLOCKED melden.

- [ ] **Step 5: `scripts/seed-seiten-texte.ts` anlegen**

Aufbau exakt wie `scripts/seed-footer.ts` (Idempotenz-Check → `updateGlobal` mit `context: { disableRevalidate: true }` → `console.log("seeded: seiten-texte")` → `done`). Marker-Check: `if (existing?.vorstand?.titelHighlight) { console.log("skip (already seeded): seiten-texte"); process.exit(0); }`.

Die zu seedenden Werte — **wörtlich aus dem heutigen Code, inklusive Gedankenstrich „—" und typografischer Zeichen:**

```ts
const DATEN = {
  vorstand: {
    eyebrow: "Der Verein",
    titelVorne: "Unser",
    titelHighlight: "Vorstand",
    text: "Lern die Menschen kennen, die unseren Verein leiten, gestalten und am Leben erhalten — ehrenamtlich und mit vollem Herz dabei.",
    badgeSuffix: "Mitglieder",
    gruppen: [
      {
        gruppe: "fuehrung",
        titel: "Führung",
        beschreibung: "Der geschäftsführende Vorstand leitet den Verein und vertritt ihn nach außen.",
      },
      {
        gruppe: "finanzen",
        titel: "Finanzen & Verwaltung",
        beschreibung: "Sie kümmern sich um Finanzen, Organisation und das Vereinsheim.",
      },
      {
        gruppe: "sport",
        titel: "Sport",
        beschreibung: "Die Sportwarte organisieren den Spielbetrieb und koordinieren unsere Mannschaften.",
      },
      {
        gruppe: "events",
        titel: "Events & Kommunikation",
        beschreibung: "Sie gestalten das Vereinsleben, organisieren Events und pflegen die Kommunikation.",
      },
      {
        gruppe: "technik",
        titel: "Technik & Platz",
        beschreibung: "Sie sorgen für die technische Infrastruktur und gepflegte Anlagen.",
      },
    ],
    ctaTitel: "Du möchtest mitmachen?",
    ctaText:
      "Wir freuen uns über engagierte Mitglieder, die den Verein aktiv mitgestalten wollen. Meld dich einfach bei uns.",
    ctaButtonLabel: "Kontakt aufnehmen",
    ctaEmail: "1.vorsitzender@hardt-tennis.de",
  },
  kalender: {
    eyebrow: "Vereinsleben",
    titelVorne: "Termine &",
    titelHighlight: "Kalender",
    text: "Alle Termine des Hardter TV auf einen Blick — von Turnieren und Trainingszeiten bis zu geselligen Vereinsabenden.",
    monatsansichtLabel: "Monatsansicht",
    listenansichtLabel: "Listenansicht",
    filterAlleLabel: "Alle",
    ausgewaehlterTagLabel: "Ausgewählter Tag",
    naechsteTermineLabel: "Nächste Termine",
    keineTermineTag: "Keine Termine an diesem Tag",
    keineTermineListe: "Keine Termine gefunden",
    uhrzeitSuffix: "Uhr",
  },
  galerie: {
    eyebrow: "Galerie",
    titelVorne: "Unsere",
    titelHighlight: "Tennismomente",
    text: "Entdecke die schönsten Momente aus unserem Vereinsleben — von Turnieren über Mannschaftsabende bis zum Saisonabschluss.",
    bilderSuffix: "Bilder",
    leerText: "Aktuell sind keine Bilder online — schau bald wieder vorbei.",
  },
  mannschaften: {
    eyebrow: "Sport",
    titelVorne: "Unsere",
    titelHighlight: "Mannschaften",
    text: "Vom Nachwuchs bis zu den Senioren — der Hardter TV stellt zahlreiche Mannschaften in verschiedenen Altersklassen und Ligen auf.",
    kategorien: [
      { kategorie: "Herren", reiterLabel: "Herren", listenEyebrow: "Herren-Teams", badgeSuffix: "Herren-Teams" },
      { kategorie: "Damen", reiterLabel: "Damen", listenEyebrow: "Damen-Teams", badgeSuffix: "Damen-Teams" },
      { kategorie: "Gemischt", reiterLabel: "Gemischt", listenEyebrow: "Gemischt-Teams", badgeSuffix: "Gemischt-Teams" },
    ],
    teamsSuffix: "Teams",
    kartenUntertitel: "Hardter TV",
    kontaktEyebrow: "Ansprechpartner",
    kontaktTitelVorne: "Fragen zu den",
    kontaktTitelHighlight: "Mannschaften?",
    kontaktText:
      "Unser Sportwart hilft dir bei allen Fragen rund um Anmeldung, Spielbetrieb und Mannschaftseinteilung.",
    kontaktLabel: "Sportwart",
    kontaktTelefon: "0151 53 55 33 55",
    kontaktTelefonHref: "tel:+4915153553355",
    // Wörtlich aus dem Code übernommen: der Block ist mit "Sportwart" beschriftet,
    // trägt aber die Adresse des 1. Vorsitzenden. NICHT stillschweigend korrigiert —
    // siehe "Notes for the user".
    kontaktEmail: "1.vorsitzender@hardt-tennis.de",
  },
  mannschaftDetail: {
    zurueckLabel: "Zurück zur Übersicht",
    saisonLabel: "Saison 2024 / 2025",
    vereinBadge: "Hardter TV",
    verbandBadge: "WTV",
    ligaEyebrow: "Ligadaten",
    ligaTitel: "Tabelle & Ergebnisse",
    ligaSaisonLabel: "Saison 2024/2025",
    ligaQuelle: "wtv.liga.nu",
    abschlussText: "Alle Mannschaften im Überblick",
  },
  rechtliches: {
    zurueckLabel: "Zurück zur Startseite",
    cookiesEyebrow: "Datenschutz",
    cookiesTitelVorne: "Cookie-",
    cookiesTitelHighlight: "Einstellungen",
  },
};
```

> Beachte die **zwei unterschiedlichen Schreibweisen** der Saison im heutigen Code: „Saison 2024 / 2025" (mit Leerzeichen, im Hero) und „Saison 2024/2025" (ohne, in der Ligaleiste und in der Metabeschreibung). Beide werden getrennt geseedet, damit der Diff exakt aufgeht.

In `package.json` bei den `seed:*`-Einträgen ergänzen:

```json
"seed:seiten-texte": "dotenv -e .env.local -- tsx scripts/seed-seiten-texte.ts",
```

- [ ] **Step 6: Seed ausführen und prüfen**

```bash
npm run seed:seiten-texte
npm run seed:seiten-texte   # zweiter Lauf
```

Erwartung: erster Lauf `seeded: seiten-texte` + `done`; zweiter Lauf exakt `skip (already seeded): seiten-texte`.

Danach ein Wegwerf-Check (in `$SCRATCH/check-seiten-texte.ts` schreiben, mit `npx dotenv -e .env.local -- npx tsx …` laufen lassen, **nie** im Repo ablegen, danach löschen): `findGlobal({ slug: "seiten-texte", depth: 0 })` liefert `vorstand.gruppen.length === 5`, `mannschaften.kategorien.length === 3`, `mannschaftDetail.saisonLabel === "Saison 2024 / 2025"`.

- [ ] **Step 7: Build unverändert**

```bash
export SCRATCH="${TMPDIR:-/tmp}/htv-plan6"
npm run build > "$SCRATCH/build.log" 2>&1 && tail -5 "$SCRATCH/build.log"
```

Erwartung: Build grün. Sichtbar ändert sich nichts (noch nichts verdrahtet).

- [ ] **Step 8: Commit**

```bash
git add globals/SeitenTexte.ts lib/seiten-texte.ts lib/vorstand-gruppen.ts scripts/seed-seiten-texte.ts payload.config.ts package.json payload-types.ts migrations
git commit -m "Add seiten-texte global with all subpage texts and seed it"
```

---

### Task 3: `/vorstand` verdrahten (Hero, Gruppen, CTA)

**Files:**
- Modify: `app/(frontend)/vorstand/page.tsx`, `lib/vorstand-gruppen.ts`, `collections/BoardMembers.ts`

**Interfaces:**
- Consumes: `getSeitenTexte()` (Task 2), Tab `vorstand`.
- Produces: `lib/vorstand-gruppen.ts` exportiert nur noch `VORSTAND_GRUPPEN: { value, adminLabel }[]` und `GruppeValue`.

**Design decision — Reihenfolge und Ausfallsicherheit:** Die Abschnitte folgen ab jetzt der Reihenfolge des Payload-Arrays. Damit ein im Admin gelöschter Array-Eintrag keine Personen unsichtbar macht, hängt die Seite nach den gepflegten Gruppen alle in `VORSTAND_GRUPPEN` definierten, aber im Array fehlenden Schlüssel an (Titel = `adminLabel`, Beschreibung leer). Ein Redakteur kann so umsortieren und umbenennen, aber niemanden versehentlich verstecken.

- [ ] **Step 1: `lib/vorstand-gruppen.ts` aufräumen**

`titel` und `beschreibung` entfernen; übrig bleiben `value` und `adminLabel`:

```ts
export const VORSTAND_GRUPPEN = [
  { value: "fuehrung", adminLabel: "Führung" },
  { value: "finanzen", adminLabel: "Finanzen & Verwaltung" },
  { value: "sport", adminLabel: "Sport" },
  { value: "events", adminLabel: "Events & Kommunikation" },
  { value: "technik", adminLabel: "Technik & Platz" },
] as const;

export type GruppeValue = (typeof VORSTAND_GRUPPEN)[number]["value"];
```

- [ ] **Step 2: `collections/BoardMembers.ts` nachziehen**

Die Select-Optionen benutzen `g.adminLabel` statt `g.titel`. **Nur ein Label-Wechsel — kein Schemawechsel, also keine Migration.** (Die `value`s bleiben identisch; falls `npm run migrate:create` doch etwas erzeugen wollte, ist das ein Fehler → stoppen und melden.)

- [ ] **Step 3: `app/(frontend)/vorstand/page.tsx` umstellen**

`getGruppen()` bekommt die Texte übergeben statt sie aus `VORSTAND_GRUPPEN` zu lesen:

```tsx
import { getSeitenTexte } from "@/lib/seiten-texte";
import { VORSTAND_GRUPPEN } from "@/lib/vorstand-gruppen";
```

```tsx
type GruppenText = { gruppe: string; titel: string; beschreibung: string };

function gruppenReihenfolge(gepflegt: GruppenText[]): GruppenText[] {
  const bekannt = new Set(gepflegt.map((g) => g.gruppe));
  const fehlend = VORSTAND_GRUPPEN.filter((g) => !bekannt.has(g.value)).map((g) => ({
    gruppe: g.value,
    titel: g.adminLabel,
    beschreibung: "",
  }));
  return [...gepflegt, ...fehlend];
}
```

`VorstandPage` holt beides parallel (`Promise.all([getSeitenTexte(), payload.find(...)])`) und ersetzt:

| heute im JSX | neu |
|---|---|
| `Der Verein` | `{texte.vorstand.eyebrow}` |
| `Unser{" "}` + `Vorstand` | `{texte.vorstand.titelVorne}{" "}` + `{texte.vorstand.titelHighlight}` |
| der `<p>`-Einleitungstext | `{texte.vorstand.text}` |
| `{total} Mitglieder` | `` {`${total} ${texte.vorstand.badgeSuffix}`} `` |
| `gruppe.titel` / `gruppe.beschreibung` | unverändert, kommen jetzt aus dem Global |
| `Du möchtest mitmachen?` | `{texte.vorstand.ctaTitel}` |
| der CTA-`<p>` | `{texte.vorstand.ctaText}` |
| `Kontakt aufnehmen` | `{texte.vorstand.ctaButtonLabel}` |
| `href="mailto:1.vorsitzender@hardt-tennis.de"` | `` href={`mailto:${texte.vorstand.ctaEmail}`} `` |

Die React-`key`s der Gruppen-Sections wechseln von `gruppe.titel` auf den stabilen Schlüssel `gruppe.gruppe` (Titel sind jetzt editierbar und damit als Key ungeeignet).

- [ ] **Step 4: Verifizieren**

```bash
export SCRATCH="${TMPDIR:-/tmp}/htv-plan6"
npm run build > "$SCRATCH/build.log" 2>&1 && npx next start -p 3111 > "$SCRATCH/start.log" 2>&1 &
echo $! > "$SCRATCH/server.pid"
until curl -sf -o /dev/null http://localhost:3111/; do sleep 1; done
curl -s http://localhost:3111/vorstand > "$SCRATCH/after-vorstand.html"
node "$SCRATCH/normalize.mjs" "$SCRATCH/after-vorstand.html" > "$SCRATCH/after-vorstand.txt"
diff "$SCRATCH/baseline-vorstand.txt" "$SCRATCH/after-vorstand.txt"
kill "$(cat "$SCRATCH/server.pid")"
```

Erwartung: `diff` gibt **nichts** aus.

- [ ] **Step 5: Commit**

```bash
git add "app/(frontend)/vorstand/page.tsx" lib/vorstand-gruppen.ts collections/BoardMembers.ts
git commit -m "Read the vorstand page texts and group titles from Payload"
```

---

### Task 4: `/kalender` verdrahten (Hero + Bedienelemente)

**Files:**
- Modify: `app/(frontend)/kalender/page.tsx`, `app/(frontend)/kalender/kalender-client.tsx`

**Interfaces:**
- Consumes: `getSeitenTexte()`, Tab `kalender`.
- Produces: `KalenderClient` nimmt zusätzlich `texte: KalenderTexte` (Typ im Client exportiert).

- [ ] **Step 1: Server-Seite**

`KalenderPage` holt `getSeitenTexte()` mit und ersetzt Eyebrow (`Vereinsleben`), `Termine &{" "}` / `Kalender` und den Einleitungstext durch die Felder; `texte.kalender` wird als `texte`-Prop an `KalenderClient` weitergereicht (nur die Strings, keine Payload-Objekte).

- [ ] **Step 2: Client-Seite**

In `kalender-client.tsx` ein `export type KalenderTexte = { monatsansichtLabel: string; listenansichtLabel: string; filterAlleLabel: string; ausgewaehlterTagLabel: string; naechsteTermineLabel: string; keineTermineTag: string; keineTermineListe: string; uhrzeitSuffix: string }` ergänzen und ersetzen:

- die Umschalter-Tupel `[["monat", "Monatsansicht", Calendar], ["liste", "Listenansicht", List]]` → Labels aus `texte`;
- der Filter-Chip `"Alle"` → `texte.filterAlleLabel` **nur für die Anzeige**; der interne Wert bleibt der String `"Alle"` (er steuert die Filterlogik). Also: Wert und Beschriftung trennen, z. B. `{(["Alle","Training","Turnier","Sonstiges"] as const).map((k) => …)}` mit `{k === "Alle" ? texte.filterAlleLabel : k}`;
- `Ausgewählter Tag` → `texte.ausgewaehlterTagLabel`;
- `Nächste Termine` → `texte.naechsteTermineLabel`;
- `Keine Termine an diesem Tag` → `texte.keineTermineTag`;
- `Keine Termine gefunden` → `texte.keineTermineListe`;
- beide Vorkommen von `{event.uhrzeit} Uhr` → `` {`${event.uhrzeit} ${texte.uhrzeitSuffix}`} `` (in `EventCard` und `EventListRow`; beide Funktionen bekommen `texte` als zusätzliches Prop).

**Unverändert bleiben** `MONATE`, `WOCHENTAGE`, `formatDatum`, die Kategorienamen und die Abkürzungsliste `["Jan","Feb",…]` — Lokalisierung, kein Inhalt (siehe Global Constraints).

- [ ] **Step 3: Verifizieren** — wie Task 3, Schritt 4, aber mit `/kalender` und `baseline-kalender.txt`. `diff` muss leer sein.

- [ ] **Step 4: Commit**

```bash
git add "app/(frontend)/kalender/page.tsx" "app/(frontend)/kalender/kalender-client.tsx"
git commit -m "Read the kalender page texts and control labels from Payload"
```

---

### Task 5: `/galerie` verdrahten

**Files:**
- Modify: `app/(frontend)/galerie/page.tsx`, `app/(frontend)/galerie/galerie-client.tsx`

- [ ] **Step 1:** `GaleriePage` holt `getSeitenTexte()`; Eyebrow `Galerie`, `Unsere{" "}` / `Tennismomente`, Einleitungstext und `{gesamtBilder} Bilder` (→ `` {`${gesamtBilder} ${texte.galerie.bilderSuffix}`} ``) kommen aus dem Global.
- [ ] **Step 2:** `GalerieClient` bekommt ein zusätzliches Prop `leerText: string`; der hartcodierte Satz „Aktuell sind keine Bilder online — schau bald wieder vorbei." wird dadurch ersetzt.
- [ ] **Step 3: Verifizieren** — `/galerie` gegen `baseline-galerie.txt`, `diff` leer.
- [ ] **Step 4: Commit**

```bash
git add "app/(frontend)/galerie/page.tsx" "app/(frontend)/galerie/galerie-client.tsx"
git commit -m "Read the galerie page texts from Payload"
```

---

### Task 6: `/mannschaften` verdrahten (Hero, Reiter, Sportwart-Block)

**Files:**
- Modify: `app/(frontend)/mannschaften/page.tsx`, `app/(frontend)/mannschaften/mannschaften-client.tsx`

**Interfaces:**
- Consumes: `getSeitenTexte()`, Tab `mannschaften`.
- Produces: `MannschaftenClient` nimmt zusätzlich `texte: { kategorien: { kategorie: string; reiterLabel: string; listenEyebrow: string }[]; teamsSuffix: string; kartenUntertitel: string }`.

**Design decision:** Die drei Reiter werden aus dem Payload-Array aufgebaut; fehlt eine Zeile, fällt die Beschriftung auf den Kategorienamen aus der Collection zurück (gleiche Ausfallsicherheit wie bei den Vorstandsgruppen). Die `TabId`-Logik bleibt an den Kategoriewerten `Herren`/`Damen`/`Gemischt` hängen — sie sind Enum-Werte der Collection, keine redaktionellen Texte.

- [ ] **Step 1: Server-Seite**

Ersetzen: `Sport` → `eyebrow`; `Unsere{" "}` / `Mannschaften` → `titelVorne`/`titelHighlight`; Einleitungstext → `text`; die drei Badges `${herren.length} Herren-Teams` usw. → Zahl + `badgeSuffix` der jeweiligen Kategorie-Zeile. Den Sportwart-Block komplett aus dem Global speisen: `kontaktEyebrow`, `kontaktTitelVorne` + `kontaktTitelHighlight`, `kontaktText`, `kontaktLabel`, `kontaktTelefon`, `href={texte.mannschaften.kontaktTelefonHref}`, `` href={`mailto:${texte.mannschaften.kontaktEmail}`} ``. Die beiden Emoji-Icons (`📞`, `✉`) bleiben im Code (Dekoration).

- [ ] **Step 2: Client-Seite**

`TABS` wird aus `texte.kategorien` abgeleitet (Reihenfolge: die des Arrays, mit Fallback auf die drei bekannten Kategorien); der Eyebrow über der Liste und die `<h2>` kommen aus `listenEyebrow` bzw. `reiterLabel`; `{activeTeams.length} Teams` → `` {`${activeTeams.length} ${texte.teamsSuffix}`} ``; das `Hardter TV` auf jeder Karte → `texte.kartenUntertitel` (als Prop an `TeamCard` durchreichen).

- [ ] **Step 3: Verifizieren** — `/mannschaften` gegen `baseline-mannschaften.txt`, `diff` leer. Zusätzlich prüfen, dass der Reiter-Wechsel im Browser die richtigen Überschriften zeigt (`curl` sieht nur den Default-Reiter „Herren"): kurz mit einem Browser oder `read_page` gegen `http://localhost:3111/mannschaften` klicken und Damen/Gemischt kontrollieren.

- [ ] **Step 4: Commit**

```bash
git add "app/(frontend)/mannschaften/page.tsx" "app/(frontend)/mannschaften/mannschaften-client.tsx"
git commit -m "Read the mannschaften page texts and Sportwart contact from Payload"
```

---

### Task 7: `/mannschaften/[slug]` verdrahten (inkl. Saison-Angabe)

**Files:**
- Modify: `app/(frontend)/mannschaften/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getSeitenTexte()`, Tab `mannschaftDetail`.

- [ ] **Step 1: Texte laden**

`TeamPage` lädt `getSeitenTexte()` parallel zu `getTeam(slug)`. `generateMetadata` lädt es ebenfalls (ein zusätzlicher Global-Read, gecacht durch ISR) und baut die Beschreibung als
`` `${team.name} des Hardter Tennisverein – ${texte.mannschaftDetail.ligaSaisonLabel}` `` — dadurch bleiben sichtbare Saison und Suchmaschinen-Beschreibung automatisch synchron. `generateStaticParams` bleibt unverändert.

- [ ] **Step 2: Ersetzungen**

| heute | neu |
|---|---|
| `Zurück zur Übersicht` (beide Vorkommen) | `{texte.mannschaftDetail.zurueckLabel}` |
| `Saison 2024 / 2025` | `{texte.mannschaftDetail.saisonLabel}` |
| `Hardter TV` (Badge) | `{texte.mannschaftDetail.vereinBadge}` |
| `WTV` (Badge) | `{texte.mannschaftDetail.verbandBadge}` |
| `Ligadaten` | `{texte.mannschaftDetail.ligaEyebrow}` |
| `Tabelle & Ergebnisse` | `{texte.mannschaftDetail.ligaTitel}` |
| `{team.name} – Saison 2024/2025` | `` {`${team.name} – ${texte.mannschaftDetail.ligaSaisonLabel}`} `` |
| `wtv.liga.nu` | `{texte.mannschaftDetail.ligaQuelle}` |
| `Alle Mannschaften im Überblick` | `{texte.mannschaftDetail.abschlussText}` |

Der `title`-Attributwert des `<iframe>` (`` `${team.name} Ligadaten` ``) und der `alt`-Text des Bildes bleiben im Code — beides ist Barrierefreiheits-Metadata, kein Seiteninhalt.

- [ ] **Step 3: Verifizieren** — gegen `baseline-team.txt` (Slug aus `$SCRATCH/team-slug.txt`), `diff` leer. Zusätzlich:

```bash
curl -s "http://localhost:3111/mannschaften/$(cat "$SCRATCH/team-slug.txt")" | grep -c 'Saison 2024/2025'
```

Erwartung: ≥ 2 (Metabeschreibung + Ligaleiste).

- [ ] **Step 4: Commit**

```bash
git add "app/(frontend)/mannschaften/[slug]/page.tsx"
git commit -m "Read the team detail page texts and season label from Payload"
```

---

### Task 8: Rechtliche Seiten verdrahten

**Files:**
- Modify: `app/(frontend)/impressum/page.tsx`, `app/(frontend)/datenschutz/page.tsx`, `app/(frontend)/cookies/page.tsx`

- [ ] **Step 1:** In Impressum und Datenschutz „Zurück zur Startseite" → `texte.rechtliches.zurueckLabel`.
- [ ] **Step 2:** Auf der Cookie-Seite `Datenschutz` (Eyebrow) → `cookiesEyebrow` und die `<h1>` `Cookie-` + `<span>Einstellungen</span>` → `cookiesTitelVorne` + `cookiesTitelHighlight`. **Achtung: zwischen beiden Teilen steht heute kein `{" "}`** — das darf auch nicht hinzukommen, sonst weicht der Diff ab.
- [ ] **Step 3: Verifizieren** — `/impressum`, `/datenschutz`, `/cookies` gegen ihre Baselines, alle drei `diff` leer.
- [ ] **Step 4: Commit**

```bash
git add "app/(frontend)/impressum/page.tsx" "app/(frontend)/datenschutz/page.tsx" "app/(frontend)/cookies/page.tsx"
git commit -m "Read the legal page chrome texts from Payload"
```

---

### Task 9: Startseiten-Abschnitte — drei Globals, Migration, Seed, Verdrahtung

**Files:**
- Create: `globals/TermineSection.ts`, `globals/VorstandSection.ts`, `globals/NewsSection.ts`, `scripts/seed-startseite-abschnitte.ts`
- Modify: `payload.config.ts`, `package.json`, `app/(frontend)/page.tsx`, `components/ui/termine-section.tsx`, `components/ui/vorstand-section.tsx`, `components/ui/news-section.tsx`
- Generated: `migrations/<timestamp>_add_startseite_abschnitte.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Consumes: `revalidateGlobalPaths(["/"])`.
- Produces: Globals `"termine-section"`, `"vorstand-section"`, `"news-section"` (Admin-Gruppe „Startseite"); die drei Komponenten exportieren je einen Props-Typ.

**Design decisions:**
- **Drei kleine Globals statt eines Sammel-Globals**, weil die Startseite im Admin bereits ein Global pro Abschnitt hat (`hero`, `welcome-section`, `location-section`, `kontakt-section`). Ein Redakteur, der „Startseite: Termine" sucht, findet es dort, wo die anderen Abschnitte stehen.
- **Alle drei in einer Migration und einem Seed**: sie werden zusammen registriert, `migrate:create` erzeugt eine Migration für alle drei Tabellen; ein Seed-Skript schreibt alle drei (mit drei getrennten Marker-Checks, damit ein Teil-Fehlschlag nachholbar bleibt).
- **Die Jahreszahl im Termine-Eyebrow bleibt dynamisch:** Feld `eyebrow` = „Veranstaltungen", die Komponente hängt weiterhin `new Date().getFullYear()` an. Eine eingefrorene Jahreszahl im CMS würde still veralten.
- Feldnamen folgen der Startseiten-Konvention: `eyebrow`, `headlineTeil1`, `headlineTeil2`, `intro`, `ctaLabel`.

- [ ] **Step 1: Die drei Global-Dateien anlegen**

Alle drei nach dem Muster von `globals/KontaktSection.ts`: `admin: { group: "Startseite" }`, `access.read: () => true`, `hooks.afterChange: [revalidateGlobalPaths(["/"])]`.

`termine-section` (Label „Startseite: Termine"):
`eyebrow` (text, req, 60, Hinweis: „Die Jahreszahl wird automatisch angehängt."), `headlineTeil1` (60), `headlineTeil2` (60), `intro` (textarea, 400), `ctaLabel` (60, Hinweis: „Der Button verlinkt immer auf /kalender."), `leerTextVor` (text, 300), `leerLinkText` (text, 60, Hinweis: „Verlinkt auf /kalender."), `leerTextNach` (text, 40).

`vorstand-section` (Label „Startseite: Vorstand"):
`eyebrow`, `headlineTeil1`, `headlineTeil2`, `intro`, `ctaLabel` (Hinweis: „Der Button verlinkt immer auf /vorstand.").

`news-section` (Label „Startseite: Neuigkeiten"):
`eyebrow`, `headlineTeil1`, `headlineTeil2`, `intro`.

- [ ] **Step 2: Registrieren, migrieren, Typen**

```bash
npm run migrate:create -- add_startseite_abschnitte
npm run migrate
npm run generate:types
```

- [ ] **Step 3: `scripts/seed-startseite-abschnitte.ts`**

Drei `updateGlobal`-Aufrufe, jeweils mit eigenem Marker-Check (`existing?.headlineTeil2`) und `context: { disableRevalidate: true }`. Werte wörtlich aus dem Code:

```ts
const TERMINE = {
  eyebrow: "Veranstaltungen",
  headlineTeil1: "Kommende",
  headlineTeil2: "Termine",
  intro: "Hier erfahren Sie alles über kommende Termine und Veranstaltungen.",
  ctaLabel: "Zum Kalender",
  leerTextVor: "Aktuell sind keine Termine geplant — schau bald wieder vorbei oder wirf einen Blick in den",
  leerLinkText: "Kalender",
  leerTextNach: ".",
};

const VORSTAND = {
  eyebrow: "Menschen hinter dem HTV",
  headlineTeil1: "Unser",
  headlineTeil2: "Vorstand",
  intro: "Das Team des Hardter TV",
  ctaLabel: "Ganzen Vorstand sehen",
};

const NEWS = {
  eyebrow: "Aus dem Verein",
  headlineTeil1: "Aktuelle",
  headlineTeil2: "Neuigkeiten",
  intro: "Bleiben Sie auf dem Laufenden über die neuesten Entwicklungen in unserem Verein.",
};
```

`package.json`: `"seed:startseite-abschnitte": "dotenv -e .env.local -- tsx scripts/seed-startseite-abschnitte.ts",`. Ausführen, zweiter Lauf muss dreimal „skip" melden.

- [ ] **Step 4: Komponenten auf Props umstellen**

Alle drei Komponenten sind `"use client"` und bekommen die Texte als flache Strings. Muster für die Überschrift exakt wie in `kontakt-section.tsx`:

```tsx
<BlurTextEffect>{`${headlineTeil1} `}</BlurTextEffect>
<span className="relative inline-block">
  <BlurTextEffect>{headlineTeil2}</BlurTextEffect>
  …
```

- `termine-section.tsx`: Eyebrow wird `` {`${eyebrow} ${new Date().getFullYear()}`} ``; Leer-Zustand wird `{leerTextVor}{" "}<Link href="/kalender" className="underline">{leerLinkText}</Link>{leerTextNach}` — **der Satz endet heute direkt hinter dem Link mit einem Punkt ohne Leerzeichen**, also kein `{" "}` vor `leerTextNach`.
- `vorstand-section.tsx`: Eyebrow, Überschrift, Intro, Button-Beschriftung.
- `news-section.tsx`: Eyebrow, Überschrift, Intro. Die frühe Rückgabe `if (news.length === 0) return null;` bleibt.

- [ ] **Step 5: `app/(frontend)/page.tsx`**

Drei zusätzliche `async function get…()` nach dem Muster der vorhandenen, in das bestehende `Promise.all` aufnehmen und die Props spreaden: `<TermineSection termine={termine} {...termineTexte} />` usw. Die bestehenden Fetcher bleiben unangetastet.

- [ ] **Step 6: Verifizieren** — `/` gegen `baseline-home.txt`, `diff` leer. Zusätzlich `grep -o '<img' … | wc -l` gegen die Baseline-Bildzahl (sollte sich nicht ändern).

> Falls `news` aktuell leer ist, rendert `NewsSection` nichts — dann taucht der News-Text auch in der Baseline nicht auf und der Diff prüft ihn nicht. In dem Fall zusätzlich mit dem Wegwerf-Check bestätigen, dass `findGlobal({ slug: "news-section" })` die drei Strings enthält, und das im Bericht vermerken.

- [ ] **Step 7: Commit**

```bash
git add globals/TermineSection.ts globals/VorstandSection.ts globals/NewsSection.ts scripts/seed-startseite-abschnitte.ts payload.config.ts package.json payload-types.ts migrations components/ui/termine-section.tsx components/ui/vorstand-section.tsx components/ui/news-section.tsx "app/(frontend)/page.tsx"
git commit -m "Add globals for the homepage section headings and read them from Payload"
```

---

### Task 10: Footer — Schnelle Links, Spaltenüberschriften, Rechtslinks

**Files:**
- Create: `lib/interne-links.ts`, `scripts/seed-footer-links.ts`
- Modify: `globals/Footer.ts`, `payload.config.ts` (nur falls nötig — das Global ist schon registriert), `package.json`, `components/ui/footer.tsx`
- Generated: `migrations/<timestamp>_add_footer_links.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Produces: `lib/interne-links.ts` exportiert `INTERNE_LINKS: { label: string; value: string }[]` (kein React-, kein lucide-Import — die Datei wird von `payload.config.ts` und damit von `payload migrate`/`tsx` geladen).

**Design decision — Ziel als Select, nicht als Freitext (Abweichung von Plan 5):** Plan 5 hat die Footer-Links bewusst im Code gelassen, weil freie Link-Ziele tote Links ohne Sicherheitsnetz erzeugen. Der Nutzer will sie trotzdem pflegen können. Auflösung: Die **Beschriftung** ist Freitext, das **Ziel** ist ein `select` über eine feste Liste realer Routen (inkl. der Anker `/#about`, `/#termine`, `/#news`, `/#contact`). Redakteure können umbenennen, umsortieren, entfernen und wieder hinzufügen — aber kein Ziel erfinden. Neue Routen kommen weiterhin per Code-Änderung in `lib/interne-links.ts` dazu, genau wie neue Seiten selbst.

- [ ] **Step 1: `lib/interne-links.ts`**

```ts
/** Reale Routen dieser Website. Erweiterung nur zusammen mit einer neuen Seite. */
export const INTERNE_LINKS = [
  { label: "Startseite (/)", value: "/" },
  { label: "Startseite – Über uns (/#about)", value: "/#about" },
  { label: "Startseite – Termine (/#termine)", value: "/#termine" },
  { label: "Startseite – Neuigkeiten (/#news)", value: "/#news" },
  { label: "Startseite – Kontakt (/#contact)", value: "/#contact" },
  { label: "Vorstand (/vorstand)", value: "/vorstand" },
  { label: "Training (/training)", value: "/training" },
  { label: "Mannschaften (/mannschaften)", value: "/mannschaften" },
  { label: "Galerie (/galerie)", value: "/galerie" },
  { label: "Mitgliedschaft (/mitgliedschaft)", value: "/mitgliedschaft" },
  { label: "Kalender (/kalender)", value: "/kalender" },
  { label: "Eisstock (/eisstock)", value: "/eisstock" },
  { label: "Datenschutz (/datenschutz)", value: "/datenschutz" },
  { label: "Impressum (/impressum)", value: "/impressum" },
  { label: "Cookie-Einstellungen (/cookies)", value: "/cookies" },
];
```

- [ ] **Step 2: `globals/Footer.ts` erweitern** (bestehende Felder unverändert lassen, neue anhängen)

- `schnelleLinksTitel` (text, req, 60, Label „Überschrift der Linkspalte")
- `schnelleLinks` (array, req, Labels „Link"/„Links") mit `label` (text, req, 60) und `ziel` (select, req, `options: INTERNE_LINKS`)
- `kontaktTitel` (text, req, 60, Label „Überschrift der Kontaktspalte")
- `emailLabel` (text, req, 60, Label „Beschriftung über der E-Mail-Adresse")
- `copyrightZusatz` (text, req, 120, Hinweis: „Steht hinter Jahr und Vereinsname.")
- `rechtlicheLinks` (array, req, maxRows 6) mit `label` (text, req, 60) und `ziel` (select, req, `options: INTERNE_LINKS`)

- [ ] **Step 3: Migrieren und Typen**

```bash
npm run migrate:create -- add_footer_links
npm run migrate
npm run generate:types
```

- [ ] **Step 4: `scripts/seed-footer-links.ts`**

Eigenes Skript, **Marker `existing?.schnelleLinksTitel`** (das alte `seed:footer` prüft `vereinsname` und würde sofort überspringen). `updateGlobal` schreibt **nur** die neuen Felder — die vorhandenen nicht mitschicken, damit Redakteur-Änderungen daran nicht überschrieben werden.

```ts
const NEU = {
  schnelleLinksTitel: "Schnelle Links",
  schnelleLinks: [
    { label: "Home", ziel: "/" },
    { label: "Über uns", ziel: "/#about" },
    { label: "Termine", ziel: "/#termine" },
    { label: "Vorstand", ziel: "/vorstand" },
    { label: "Neuigkeiten", ziel: "/#news" },
    { label: "Kontakt", ziel: "/#contact" },
    { label: "Training", ziel: "/training" },
    { label: "Mannschaften", ziel: "/mannschaften" },
    { label: "Galerie", ziel: "/galerie" },
    { label: "Mitgliedschaft", ziel: "/mitgliedschaft" },
  ],
  kontaktTitel: "Kontakt",
  emailLabel: "E-Mail",
  copyrightZusatz: "Alle Rechte vorbehalten.",
  rechtlicheLinks: [
    { label: "Datenschutz", ziel: "/datenschutz" },
    { label: "Impressum", ziel: "/impressum" },
    { label: "Cookie-Einstellungen", ziel: "/cookies" },
  ],
};
```

`package.json`: `"seed:footer-links": "dotenv -e .env.local -- tsx scripts/seed-footer-links.ts",`. Ausführen; zweiter Lauf: `skip (already seeded): footer-links`.

- [ ] **Step 5: `components/ui/footer.tsx` umstellen**

Das lokale `links`-Array **löschen** (kein toter Fallback). Ersetzen: `Schnelle Links` → `{data.schnelleLinksTitel}`, die Liste → `(data.schnelleLinks ?? []).map(…)` mit `key={l.id ?? l.ziel}` und `href={l.ziel}`; `Kontakt` → `{data.kontaktTitel}`; `E-Mail` → `{data.emailLabel}`; die Copyright-Zeile → `` {`© ${new Date().getFullYear()} ${data.copyrightName}. ${data.copyrightZusatz}`} ``; die drei festen Rechtslinks → `(data.rechtlicheLinks ?? []).map(…)`.

- [ ] **Step 6: Verifizieren**

Der Footer steht auf **jeder** Seite. Alle zwölf Baselines erneut ziehen und diffen:

```bash
export SCRATCH="${TMPDIR:-/tmp}/htv-plan6"
npm run build > "$SCRATCH/build.log" 2>&1
npx next start -p 3111 > "$SCRATCH/start.log" 2>&1 &
echo $! > "$SCRATCH/server.pid"
until curl -sf -o /dev/null http://localhost:3111/; do sleep 1; done
TEAM="$(cat "$SCRATCH/team-slug.txt")"
fail=0
for p in home:/ vorstand:/vorstand kalender:/kalender galerie:/galerie \
         mannschaften:/mannschaften "team:/mannschaften/$TEAM" \
         impressum:/impressum datenschutz:/datenschutz cookies:/cookies \
         training:/training mitgliedschaft:/mitgliedschaft eisstock:/eisstock; do
  name="${p%%:*}"; path="${p#*:}"
  curl -s "http://localhost:3111$path" > "$SCRATCH/after-$name.html"
  node "$SCRATCH/normalize.mjs" "$SCRATCH/after-$name.html" > "$SCRATCH/after-$name.txt"
  diff "$SCRATCH/baseline-$name.txt" "$SCRATCH/after-$name.txt" || { echo "DIFF: $name"; fail=1; }
done
kill "$(cat "$SCRATCH/server.pid")"
test "$fail" -eq 0
```

Erwartung: kein `DIFF:`-Ausgabe, Exit 0.

- [ ] **Step 7: Commit**

```bash
git add lib/interne-links.ts globals/Footer.ts scripts/seed-footer-links.ts package.json payload-types.ts migrations components/ui/footer.tsx
git commit -m "Make the footer link lists and column headings editable in Payload"
```

---

### Task 11: Kontaktformular — Beschriftungen, Platzhalter, Einwilligungssatz

**Files:**
- Create: `scripts/seed-kontakt-formular.ts`
- Modify: `globals/KontaktSection.ts`, `package.json`, `app/(frontend)/page.tsx`, `components/ui/kontakt-section.tsx`
- Generated: `migrations/<timestamp>_add_kontakt_formular.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Design decision — bewusste Abweichung von Plan 5:** Plan 5 hat Feldbeschriftungen, Platzhalter, Button-Text und den Einwilligungssatz ausdrücklich im Code gelassen („strukturelle Labels", „juristisch geprüfter Wortlaut"). Der Nutzer will sie editierbar haben. Der Einwilligungssatz wird deshalb — wie der Shop-Hinweis im Footer — in **drei Teile** zerlegt (`textVor`, `linkText`, `textNach`), damit der Link auf `/datenschutz` erhalten bleibt und nicht im Fließtext verloren gehen kann. Das Linkziel bleibt fest im Code.

- [ ] **Step 1: `globals/KontaktSection.ts` um die Gruppe `formular` erweitern**

```ts
{
  name: "formular",
  type: "group",
  label: "Formular",
  fields: [
    { name: "adresseLabel", type: "text", required: true, maxLength: 40, label: "Beschriftung der Adress-Kachel" },
    { name: "emailLabel", type: "text", required: true, maxLength: 40, label: "Beschriftung der E-Mail-Kachel" },
    { name: "nameLabel", type: "text", required: true, maxLength: 40 },
    { name: "namePlaceholder", type: "text", required: true, maxLength: 60 },
    { name: "emailFeldLabel", type: "text", required: true, maxLength: 40 },
    { name: "emailPlaceholder", type: "text", required: true, maxLength: 60 },
    { name: "nachrichtLabel", type: "text", required: true, maxLength: 40 },
    { name: "nachrichtPlaceholder", type: "text", required: true, maxLength: 120 },
    { name: "einwilligungTextVor", type: "text", required: true, maxLength: 200, label: "Einwilligung: Text vor dem Link" },
    { name: "einwilligungLinkText", type: "text", required: true, maxLength: 60, label: "Einwilligung: Linktext", admin: { description: "Verlinkt immer auf /datenschutz." } },
    { name: "einwilligungTextNach", type: "text", required: true, maxLength: 300, label: "Einwilligung: Text nach dem Link" },
    { name: "absendenLabel", type: "text", required: true, maxLength: 60, label: "Button: Beschriftung" },
    { name: "sendenLabel", type: "text", required: true, maxLength: 60, label: "Button: Beschriftung während des Sendens" },
    {
      name: "honeypotLabel",
      type: "text",
      required: true,
      maxLength: 80,
      label: "Beschriftung des versteckten Spam-Feldes",
      admin: { description: "Für Menschen unsichtbar, wird nur von Screenreadern vorgelesen." },
    },
  ],
},
```

- [ ] **Step 2: Migrieren und Typen** — `npm run migrate:create -- add_kontakt_formular`, `npm run migrate`, `npm run generate:types`.

- [ ] **Step 3: `scripts/seed-kontakt-formular.ts`** — Marker `existing?.formular?.absendenLabel`; schreibt nur `{ formular: … }`:

```ts
const FORMULAR = {
  adresseLabel: "Adresse",
  emailLabel: "E-Mail",
  nameLabel: "Name",
  namePlaceholder: "Dein Name",
  emailFeldLabel: "E-Mail",
  emailPlaceholder: "deine@email.de",
  nachrichtLabel: "Nachricht",
  nachrichtPlaceholder: "Deine Nachricht an den HTV...",
  einwilligungTextVor: "Ich habe die",
  einwilligungLinkText: "Datenschutzerklärung",
  einwilligungTextNach:
    "gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung meiner Anfrage zu.",
  absendenLabel: "Nachricht senden",
  sendenLabel: "Wird gesendet…",
  honeypotLabel: "Dieses Feld bitte leer lassen",
};
```

> Im JSX stehen heute `{" "}`-Trenner um den Link (`Ich habe die{" "}<a>…</a>{" "}gelesen und …`). Die Seed-Werte enthalten deshalb **keine** führenden/abschließenden Leerzeichen; die Trenner bleiben im JSX.

`package.json`: `"seed:kontakt-formular": "dotenv -e .env.local -- tsx scripts/seed-kontakt-formular.ts",`. Ausführen, zweiter Lauf „skip".

- [ ] **Step 4: Verdrahten**

`getKontaktTexte()` in `app/(frontend)/page.tsx` gibt zusätzlich `formular: { …flache Strings… }` zurück; `KontaktSectionProps` bekommt ein `formular`-Objekt. In `kontakt-section.tsx` ersetzen: die `kontaktInfo`-Labels `"Adresse"`/`"E-Mail"` (der mittlere bleibt `telefonLabel` aus dem Footer-Global), die drei `<label>`-Texte, die drei `placeholder`, den Einwilligungssatz (drei Teile, Link unverändert auf `/datenschutz`), `pending ? "Wird gesendet…" : "Nachricht senden"` und das versteckte `<label htmlFor="htv_hinweis">`.

**Nicht anfassen:** Feldnamen (`name`, `email`, `message`, `datenschutz`, `htv_hinweis`, `gestartetAm`), `id`s, `aria-describedby`-Ziele, `maxLength`-Werte, die Honeypot-Mechanik und die Zeitfalle.

- [ ] **Step 5: Verifizieren** — `/` gegen `baseline-home.txt`, `diff` leer (das Formular ist Teil des SSR-HTML). Zusätzlich im Browser eine Anfrage absenden und prüfen, dass Erfolgsmeldung und Speicherung unverändert funktionieren; den Testdatensatz danach in `/admin` löschen.

- [ ] **Step 6: Commit**

```bash
git add globals/KontaktSection.ts scripts/seed-kontakt-formular.ts package.json payload-types.ts migrations components/ui/kontakt-section.tsx "app/(frontend)/page.tsx"
git commit -m "Make the contact form labels, placeholders and consent sentence editable"
```

---

### Task 12: Kontaktformular — Fehlermeldungen editierbar

**Files:**
- Modify: `globals/KontaktSection.ts`, `lib/kontakt-validation.ts`, `lib/actions/kontakt.ts`, `scripts/seed-kontakt-formular.ts` (zweiter Marker), `payload-types.ts`, `migrations/`

**Design decisions:**
- `validateKontakt` bleibt eine **pure Funktion**; die Meldungen kommen als zweiter Parameter herein. In `lib/kontakt-validation.ts` steht weiterhin ein vollständiger Satz `STANDARD_MELDUNGEN` — er ist kein toter Fallback für *Inhalte*, sondern die Absicherung gegen einen fehlgeschlagenen Global-Read: die Validierung darf nie daran scheitern, dass die DB gerade zickt.
- Meldungen mit Zahlen enthalten Platzhalter `{min}` / `{max}`, die eine kleine Hilfsfunktion ersetzt. Die Zahlen selbst (`KONTAKT_LIMITS`) bleiben Code — sie müssen mit `maxLength` der Felder und der Payload-Validierung übereinstimmen.

- [ ] **Step 1: `globals/KontaktSection.ts` um die Gruppe `fehlermeldungen` erweitern**

Felder (alle `text`, `required: true`, sinnvolle `maxLength`, deutsche Labels): `nameZuKurz` (Hinweis: „`{min}` wird durch die Mindestlänge ersetzt."), `nameZuLang` (`{max}`), `emailFehlt`, `emailZuLang`, `emailUngueltig`, `telefonZuLang`, `nachrichtZuKurz` (`{min}`), `nachrichtZuLang` (`{max}`), `einwilligungFehlt`, `allgemein` (Label „Sammelmeldung über dem Formular"), `speichernFehlgeschlagen` (textarea, 400).

- [ ] **Step 2: Migrieren und Typen** — `npm run migrate:create -- add_kontakt_fehlermeldungen`, `npm run migrate`, `npm run generate:types`.

- [ ] **Step 3: `lib/kontakt-validation.ts`**

```ts
export type KontaktMeldungen = {
  nameZuKurz: string; nameZuLang: string;
  emailFehlt: string; emailZuLang: string; emailUngueltig: string;
  telefonZuLang: string;
  nachrichtZuKurz: string; nachrichtZuLang: string;
  einwilligungFehlt: string; allgemein: string; speichernFehlgeschlagen: string;
};

export const STANDARD_MELDUNGEN: KontaktMeldungen = { /* die heutigen Sätze, mit {min}/{max} */ };

export function fuelleMeldung(text: string, werte: Record<string, number>): string {
  return text.replace(/\{(\w+)\}/g, (treffer, schluessel) =>
    schluessel in werte ? String(werte[schluessel]) : treffer,
  );
}

export function validateKontakt(
  eingabe: KontaktEingabe,
  meldungen: KontaktMeldungen = STANDARD_MELDUNGEN,
): KontaktValidierung { /* unverändert, nur die Strings kommen aus `meldungen` */ }
```

Die heutigen Sätze mit Platzhaltern:

| Schlüssel | Wert |
|---|---|
| `nameZuKurz` | `Bitte gib deinen Namen an (mindestens {min} Zeichen).` |
| `nameZuLang` | `Der Name darf höchstens {max} Zeichen lang sein.` |
| `emailFehlt` | `Bitte gib deine E-Mail-Adresse an.` |
| `emailZuLang` | `Diese E-Mail-Adresse ist zu lang.` |
| `emailUngueltig` | `Diese E-Mail-Adresse sieht nicht gültig aus.` |
| `telefonZuLang` | `Diese Telefonnummer ist zu lang.` |
| `nachrichtZuKurz` | `Bitte schreib uns ein paar Worte (mindestens {min} Zeichen).` |
| `nachrichtZuLang` | `Die Nachricht darf höchstens {max} Zeichen lang sein.` |
| `einwilligungFehlt` | `Bitte stimme der Verarbeitung deiner Daten zu — ohne Einwilligung dürfen wir deine Nachricht nicht speichern.` |
| `allgemein` | `Bitte prüfe die markierten Felder.` |
| `speichernFehlgeschlagen` | `Deine Nachricht konnte gerade nicht gespeichert werden. Bitte versuche es später noch einmal oder schreib uns direkt eine E-Mail.` |

- [ ] **Step 4: `lib/actions/kontakt.ts`**

Vor der Validierung die Meldungen laden, **fail-safe**:

```ts
async function ladeMeldungen(): Promise<KontaktMeldungen> {
  try {
    const payload = await getPayload({ config });
    const data = await payload.findGlobal({ slug: "kontakt-section", depth: 0 });
    const m = data.fehlermeldungen;
    if (!m) return STANDARD_MELDUNGEN;
    return { ...STANDARD_MELDUNGEN, ...(m as Partial<KontaktMeldungen>) };
  } catch {
    return STANDARD_MELDUNGEN;
  }
}
```

Die drei Stellen im `catch`-Block (`emailUngueltig`, `allgemein`, `speichernFehlgeschlagen`) benutzen dieselben Meldungen. Honeypot und Zeitfalle bleiben **vor** dem Laden — ein Bot soll keinen DB-Read auslösen.

- [ ] **Step 5: Seed erweitern**

In `scripts/seed-kontakt-formular.ts` einen **zweiten, unabhängigen** Block mit eigenem Marker (`existing?.fehlermeldungen?.allgemein`) ergänzen, der `{ fehlermeldungen: … }` mit exakt den obigen Werten schreibt. So bleibt das Skript auch dann nachholbar, wenn Task 11 schon gelaufen ist.

- [ ] **Step 6: Verifizieren**

`npm run seed:kontakt-formular` (schreibt nur noch den Meldungsblock), Build, dann im Browser: leeres Formular absenden → Feldfehler erscheinen unverändert; eine Meldung im Admin testweise ändern, speichern, Seite neu laden → geänderte Meldung erscheint; danach zurückändern. `/`-Diff gegen Baseline (die Meldungen sind im Ausgangszustand nicht im HTML) muss leer bleiben.

- [ ] **Step 7: Commit**

```bash
git add globals/KontaktSection.ts lib/kontakt-validation.ts lib/actions/kontakt.ts scripts/seed-kontakt-formular.ts payload-types.ts migrations
git commit -m "Make the contact form validation messages editable in Payload"
```

---

### Task 13: Cookie- und Einwilligungstexte

**Files:**
- Create: `globals/CookieTexte.ts`, `lib/cookie-consent.ts`, `components/ui/cookie-banner-client.tsx`, `scripts/seed-cookie-texte.ts`
- Modify: `payload.config.ts`, `package.json`, `components/ui/cookie-banner.tsx`, `components/ui/cookie-settings.tsx`, `components/ui/maps-consent-gate.tsx`, `components/ui/kontakt-section.tsx`, `app/(frontend)/cookies/page.tsx`, `app/(frontend)/page.tsx`, `hooks/use-cookie-consent.ts`
- Generated: `migrations/<timestamp>_add_cookie_texte.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Design decisions:**
- **`app/(frontend)/layout.tsx` bleibt unverändert.** `components/ui/cookie-banner.tsx` wird — wie schon `footer.tsx` — zu einer **async Server-Komponente**, die das Global lädt und die bisherige Client-Logik als `<CookieBannerClient …props />` rendert. Der Default-Import im Layout bleibt derselbe.
- **Die localStorage-Helfer ziehen um.** `getCookieConsent` und `ConsentState` werden heute aus `cookie-banner.tsx` exportiert und von `hooks/use-cookie-consent.ts` und `cookie-settings.tsx` importiert. Da die Datei zur Server-Komponente wird, wandern beide nach `lib/cookie-consent.ts` (zusammen mit `STORAGE_KEY` und `saveConsent`, die heute doppelt in Banner und Settings stehen). Die Importe in beiden Konsumenten werden nachgezogen. **Der Storage-Key `htv-cookie-consent` und das Event `htv-consent-updated` bleiben exakt gleich** — sonst verlieren alle Besucher ihre gespeicherte Entscheidung.
- **Risikohinweis:** Das sind juristisch relevante Texte. Sie werden editierbar, weil der Nutzer „alles ins Payload" verlangt hat; die Admin-Beschreibung des Globals weist ausdrücklich darauf hin, dass Änderungen datenschutzrechtliche Wirkung haben. Soll das Gegenteil gelten, ist **diese eine Task** ersatzlos streichbar, ohne dass die übrigen zwölf davon betroffen sind.

- [ ] **Step 1: `lib/cookie-consent.ts` herauslösen**

`"use client"` ist hier **nicht** nötig (die Datei enthält nur Funktionen, die ausschließlich in Client-Komponenten aufgerufen werden — sie greifen auf `window` zu und prüfen `typeof window === "undefined"` wie bisher). Exporte: `type ConsentState`, `STORAGE_KEY`, `getCookieConsent()`, `saveConsent(consent)`. Importe in `hooks/use-cookie-consent.ts` und `components/ui/cookie-settings.tsx` umbiegen.

- [ ] **Step 2: `globals/CookieTexte.ts`**

Slug `cookie-texte`, Label „Cookie-Hinweis & Einwilligung", `admin: { group: "Seitenweit", description: "Diese Texte sind datenschutzrechtlich relevant. Bitte nur nach Rücksprache ändern." }`, `access.read: () => true`, `hooks.afterChange: [revalidateGlobalLayout()]` (der Banner steht auf jeder Seite).

Felder:
- Gruppe `banner`: `titel`, `textVor`, `linkText` (Hinweis „Verlinkt immer auf /datenschutz."), `textNach`, `alleAkzeptierenLabel`, `auswahlSpeichernLabel`, `einstellungenLabel`, `nurNotwendigeLabel`
- Gruppe `seite`: `speichernLabel`, `gespeichertLabel`, `alleAkzeptierenLabel`, `nurNotwendigeLabel`
- Array `kategorien` (req, maxRows 3) mit `schluessel` (select: `notwendig` | `maps` | `analyse`), `titel`, `bannerBeschreibung`, `seiteBeschreibung`, `seiteFussnote`, `toggleAriaLabel` (optional — „notwendig" hat keinen Schalter)
- Gruppe `maps`: `titel`, `text`, `buttonLabel` (für `maps-consent-gate.tsx`, Hinweis „Verlinkt immer auf /cookies.")

- [ ] **Step 3: Registrieren, migrieren, Typen** — `npm run migrate:create -- add_cookie_texte`, `npm run migrate`, `npm run generate:types`.

- [ ] **Step 4: `scripts/seed-cookie-texte.ts`** — Marker `existing?.banner?.titel`. Werte wörtlich:

`banner`: titel `Cookies & Datenschutz`; textVor `Wir verwenden Cookies, um externe Dienste wie Google Maps einzubinden. Einige Cookies sind technisch notwendig, andere helfen uns, die Website zu verbessern. Weitere Infos in unserer`; linkText `Datenschutzerklärung`; textNach `.`; Buttons `Alle akzeptieren`, `Auswahl speichern`, `Einstellungen`, `Nur notwendige`.

`seite`: `Einstellungen speichern`, `Gespeichert ✓`, `Alle akzeptieren`, `Nur notwendige`.

`kategorien`:
| schluessel | titel | bannerBeschreibung | seiteBeschreibung | seiteFussnote | toggleAriaLabel |
|---|---|---|---|---|---|
| `notwendig` | `Notwendige Cookies` | `Technisch erforderlich für die Grundfunktionen der Website. Können nicht deaktiviert werden.` | `Diese Cookies sind für den Betrieb der Website technisch notwendig und können nicht deaktiviert werden. Sie speichern keine personenbezogenen Daten.` | `Beispiel: Cookie-Einstellungen speichern (localStorage)` | — |
| `maps` | `Google Maps` | `Ermöglicht die Nutzung von Google Maps zum Anzeigen von Standorten. Google kann dabei Daten erheben.` | `Wir verlinken auf Google Maps für Standortangaben. Beim Klick auf einen Maps-Link gelten die Datenschutzbestimmungen von Google. Google LLC, USA.` | `Anbieter: Google LLC · Zweck: Kartenanzeige & Standort · Datenübertragung in die USA möglich` | `Google Maps togglen` |
| `analyse` | `Analyse` | `Hilft uns zu verstehen, wie Besucher die Website nutzen (z.B. Google Analytics).` | `Analyse-Cookies helfen uns zu verstehen, wie Besucher die Website nutzen, damit wir sie verbessern können (z.B. Google Analytics).` | `Anbieter: Google LLC · Zweck: Websiteanalyse · Datenübertragung in die USA möglich` | `Analyse togglen` |

`maps`: titel `Google Maps nicht aktiviert`; text `Um die Karte anzuzeigen, müssen Google Maps Cookies in den Einstellungen aktiviert werden.`; buttonLabel `Cookie-Einstellungen öffnen`.

`package.json`: `"seed:cookie-texte": "dotenv -e .env.local -- tsx scripts/seed-cookie-texte.ts",`.

- [ ] **Step 5: Komponenten umbauen**

- `components/ui/cookie-banner-client.tsx`: der heutige Inhalt von `cookie-banner.tsx` **ohne** die Storage-Helfer, mit Props für alle Texte. Die drei Kategorieblöcke werden aus dem `kategorien`-Array gerendert (Reihenfolge = Array-Reihenfolge; der Schalter hängt am `schluessel`, nicht an der Position).
- `components/ui/cookie-banner.tsx`: neue async Server-Komponente, lädt `findGlobal({ slug: "cookie-texte", depth: 0 })` und rendert `<CookieBannerClient … />`. **Default-Export beibehalten.**
- `components/ui/cookie-settings.tsx`: bekommt alle Texte als Props; `app/(frontend)/cookies/page.tsx` (bereits Server-Komponente) lädt das Global und reicht sie durch.
- `components/ui/maps-consent-gate.tsx`: drei neue Props `platzhalterTitel`, `platzhalterText`, `buttonLabel`; `components/ui/kontakt-section.tsx` reicht sie durch, `app/(frontend)/page.tsx` lädt sie aus `cookie-texte` (zusätzlicher Fetcher im bestehenden `Promise.all`).

- [ ] **Step 6: Verifizieren**

1. Voller Zwölf-Seiten-Diff wie in Task 10, Schritt 6 — muss leer sein (der Maps-Platzhalter auf `/` ist darin enthalten).
2. Browser (`http://localhost:3111/`): in einem frischen Profil / nach `localStorage.removeItem("htv-cookie-consent")` erscheint der Banner mit identischem Text; „Einstellungen" zeigt die drei Kategorien; „Alle akzeptieren" speichert und blendet aus; `/cookies` zeigt die drei Karten und speichert.
3. `localStorage`-Schlüssel nach dem Speichern prüfen: weiterhin `htv-cookie-consent` mit `{necessary,maps,analytics,decided}`.

- [ ] **Step 7: Commit**

```bash
git add globals/CookieTexte.ts lib/cookie-consent.ts scripts/seed-cookie-texte.ts payload.config.ts package.json payload-types.ts migrations components/ui/cookie-banner.tsx components/ui/cookie-banner-client.tsx components/ui/cookie-settings.tsx components/ui/maps-consent-gate.tsx components/ui/kontakt-section.tsx hooks/use-cookie-consent.ts "app/(frontend)/cookies/page.tsx" "app/(frontend)/page.tsx"
git commit -m "Make the cookie banner, cookie settings and maps placeholder texts editable"
```

---

### Task 14: Abschluss-Sweep — nichts Hartcodiertes übrig

**Files:**
- Ggf. Nachbesserungen an den in den Tasks 3–13 berührten Dateien; kein neues Schema.

- [ ] **Step 1: Erneut nach deutschem Klartext greppen**

```bash
cd hardtertv
grep -rnE '"[^"]*[äöüßÄÖÜ][^"]*"' "app/(frontend)" components lib hooks \
  | grep -vE 'className|aria-hidden|payload-types|^\s*//|/\*' | sort
grep -rnE '>[^<>{}]*[a-zA-ZäöüßÄÖÜ]{3,}[^<>{}]*<' "app/(frontend)" components | sort | head -60
```

Erwartung: Treffer bleiben nur noch in
`components/ui/navbar.tsx` (Spec-Entscheidung), `lib/events.ts` / `lib/news.ts` / `kalender-client.tsx` (Monats-/Wochentagsnamen), `app/(frontend)/layout.tsx` und die `metadata`-Exporte (SEO), `components/ui/eis-widget.tsx` (Admin-Hinweis), `lib/get-legal-page.ts` (Entwickler-Fehlermeldung), `lib/kontakt-validation.ts` (`STANDARD_MELDUNGEN` als Ausfallsicherung), `globals/*.ts` und `collections/*.ts` (Admin-Beschriftungen) sowie `scripts/seed-*.ts` (Seed-Daten). **Jeder andere Treffer ist ein Fund und wird in dieser Task nachgezogen** — passt er in ein bestehendes Global, dort ergänzen (Migration + Seed-Erweiterung nach demselben Muster); ist er strukturell, in der Liste der bewussten Ausnahmen oben dokumentieren.

- [ ] **Step 2: Lint und Build**

```bash
export SCRATCH="${TMPDIR:-/tmp}/htv-plan6"
npm run lint > "$SCRATCH/lint.log" 2>&1; tail -20 "$SCRATCH/lint.log"
npm run build > "$SCRATCH/build.log" 2>&1; tail -10 "$SCRATCH/build.log"
```

Erwartung: Build grün; Lint nicht schlechter als vor dem Plan (Stand `66850a8`) — neue Meldungen werden behoben.

- [ ] **Step 3: Kompletter Diff über alle zwölf Routen** — Skript aus Task 10, Schritt 6. Exit 0.

- [ ] **Step 4: Frische-Test der Seeds**

Jedes der fünf neuen/erweiterten Seed-Skripte noch einmal laufen lassen; jedes muss „skip (already seeded)" melden. Damit ist belegt, dass ein zweiter Deploy keine Redakteursänderungen überschreibt.

```bash
for s in seiten-texte startseite-abschnitte footer-links kontakt-formular cookie-texte; do
  echo "== $s"; npm run "seed:$s"
done
```

- [ ] **Step 5: Redaktions-Rundgang im Admin** (manuell, kurz)

`npx next start -p 3111`, dann in `/admin`: je ein Feld in „Seitentexte", „Startseite: Termine", „Footer & Kontaktdaten" und „Startseite: Kontaktbereich" ändern, speichern, die betroffene Seite neu laden → Änderung sichtbar (Revalidation greift). Danach zurückändern und erneut prüfen.

- [ ] **Step 6: Aufräumen**

`$SCRATCH` löschen (`rm -rf "$SCRATCH"`), sicherstellen, dass `git status` außer den committeten Dateien nichts zeigt und kein Wegwerf-Skript im Repo liegt.

- [ ] **Step 7: Commit (nur falls Step 1 Nachbesserungen ergab)**

```bash
git add <die nachgebesserten Dateien>
git commit -m "Move the last hardcoded page texts into Payload"
```

---

## Notes for the user

1. **Sportwart-Block auf `/mannschaften`:** Der Block ist mit „Sportwart" beschriftet, trägt aber die E-Mail-Adresse des 1. Vorsitzenden (`1.vorsitzender@hardt-tennis.de`) und die Nummer `0151 53 55 33 55`. Beides wird **wörtlich** geseedet und nicht stillschweigend korrigiert — bitte im Admin prüfen und ggf. auf die echte Sportwart-Adresse ändern (Seitentexte → Mannschaften (Übersicht)).
2. **Saison-Angabe:** „Saison 2024 / 2025" bzw. „Saison 2024/2025" steht ab jetzt an *einer* Stelle im Admin (Seitentexte → Mannschaften (Detailseite)) und speist auch die Suchmaschinen-Beschreibung. Zum Saisonwechsel genügt dort eine Änderung.
3. **Footer-Links:** Die Beschriftung ist frei, das Linkziel wird aus einer Liste echter Routen gewählt. Neue Seiten müssen weiterhin im Code ergänzt werden (`lib/interne-links.ts`) — das passiert ohnehin zusammen mit dem Anlegen der Seite.
4. **Cookie-/Einwilligungstexte (Task 13) sind jetzt editierbar.** Das war vorher bewusst nicht so. Änderungen daran haben datenschutzrechtliche Wirkung; wer sie lieber unter Code-Review halten möchte, kann Task 13 ersatzlos streichen.
5. **Nicht editierbar (bewusst):** Navbar (Spec), Monats-/Wochentagsnamen und Datumsformate, Kategorie-Werte der Collections, SEO-Metadaten, der Admin-Hinweis im Eisstock-Buchungswidget.
