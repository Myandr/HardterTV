# Mitgliedschaft, Training und Eisstock als Payload-Globals — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the three page-level singletons `/mitgliedschaft`, `/training` and `/eisstock` fully editable in Payload. Each page becomes one Payload **Global** (one fixed admin page per global, per spec), seeded once with the exact content that is hardcoded in the page files today. The rendered pages must look and read exactly as they do now — only the data source changes.

**Architecture:** Three new Payload globals (`mitgliedschaft`, `training`, `eisstock`), each with a migration, a shared `afterChange` revalidation helper for globals, and a one-time idempotent seed script that also uploads the referenced PDFs and images into the `media` collection (Vercel Blob). The page components become async server components that read their global through the Payload Local API (`payload.findGlobal`) and render the same markup. Icons cannot live in the database, so each icon-bearing array stores a string key from a fixed `select` and the page maps key → lucide component.

**Tech Stack:** Payload 3.89 (`@payloadcms/db-postgres` on Neon, `@payloadcms/storage-vercel-blob`), Next.js 16 App Router, React 19, TypeScript, lucide-react 1.14.

**Spec:** `docs/superpowers/specs/2026-09-17-payload-cms-migration-design.md` (globals `mitgliedschaft` and `training`). `eisstock` is **not** in the spec — the user has since decided that *every* page must be editable, so this plan adds it with the same pattern.

**Builds on:**
- `docs/superpowers/plans/2026-09-17-payload-foundation-teams.md` (done)
- `docs/superpowers/plans/2026-09-19-payload-vorstand-termine.md` (done) — the collection/seed/rewire pattern to follow is `hardtertv/collections/BoardMembers.ts`, `hardtertv/scripts/seed-board-members.ts`, `hardtertv/app/(frontend)/vorstand/page.tsx`.

**Runs in parallel with:** a plan for `gallery-albums` / `news` / `legal-pages` and a plan for the homepage sections + contact form. Both may touch `payload.config.ts`, `package.json` and possibly create `globals/hooks/revalidate.ts`. Every shared-file edit below is therefore described as an *addition* relative to whatever is in the file at the time.

---

## Global Constraints

- All paths below are relative to the Next.js project root `hardtertv/` unless stated otherwise. Run all commands from `hardtertv/`.
- **Never run `next dev` (or `npm run dev`).** The Neon database is shared and real; `next dev` pushes schema changes straight into it and leaves a stale `dev` row in `payload_migrations` that makes `payload migrate` hang (a real incident in an earlier phase). Verification is: `npm run build` → `npx next start -p 3111` (background) → `curl` → throwaway Local-API scripts.
- **Port and process hygiene:** port 3000 may be occupied by a foreign process that is *not* ours. Always start on **3111**. Record the PID (`echo $! > /tmp/htv-plan4/server.pid`) and stop the server with `kill "$(cat /tmp/htv-plan4/server.pid)"`. **Never** `pkill -f next-server` / `pkill -f next` — that kills other people's servers.
- **`payload.config.ts` has `push: false`** — schema changes only happen through migrations. The order for every new global is strictly:
  1. create the global file under `globals/`
  2. register it in `payload.config.ts` in the `globals` array (**create the array if it does not exist yet**, right after `collections`)
  3. `npm run migrate` (apply anything a parallel plan may have committed first — must be a no-op or apply cleanly)
  4. `npm run migrate:create -- <name>`
  5. `npm run migrate`
  6. `npm run generate:types`
  7. only then run anything that seeds or boots Payload against the new schema.
  If `migrate` ever **prompts** (e.g. about dev mode / accepting data loss): **STOP and report BLOCKED.** Do not answer the prompt.
- Migration/seed scripts load `.env.local` via `dotenv-cli`. **Never print, read, edit or commit `.env.local`.**
- Publish workflow: immediate/live on save. No `versions`, no drafts (spec decision).
- Access: `read: () => true` on all three globals (public page content). `update` keeps Payload's default (authenticated users). Do not touch the `users` collection.
- Revalidation: every global revalidates the page it feeds via an `afterChange` hook, guarded by `req.context?.disableRevalidate`. Seed scripts must pass `context: { disableRevalidate: true }` on every write (`revalidatePath` throws outside a Next request).
- Seeds are **idempotent** (explicit marker check, see each task), **self-contained** (all data embedded in the script), and upload their assets with `payload.create({ collection: "media", data: { alt }, filePath })`. The `media` collection is `upload: true` with no `mimeTypes` restriction, so it accepts PDFs; `alt` is `required`, so PDFs get a descriptive title as their alt text.
- Media `url` is a **relative Payload route**: `disablePayloadAccessControl` is not set in the blob plugin config, so `@payloadcms/plugin-cloud-storage` keeps `/api/media/file/<filename>` (the filename is `encodeURIComponent`-encoded by Payload, so `HTV-SchnupperCard-Antrag 2026.pdf` becomes `…/HTV-SchnupperCard-Antrag%202026.pdf`). That URL works for `next/image` (proven for teams/board members) and, because it is same-origin, the HTML `download` attribute on PDF links keeps working.
- Pages that read Payload are statically generated. On-demand revalidation comes from the hooks; `export const revalidate = 3600` stays as a time-based fallback.
- Keep **all** existing markup, classes, ids and design. Only the data source changes. Where a card array unifies two slightly different hardcoded cards, any dropped class must be provably inert (noted in the steps).
- **Editability rule (applied consistently):** every string that a board member could plausibly want to change is a field — headings, eyebrows, body copy, list items, card titles/descriptions, button and link *labels*, phone/e-mail/PDF/external-URL *targets*, numbers and stats. These stay in code: CSS classes and colors, section order and `id` anchors, internal route targets (`/`, `#buchen` — same argument the spec uses to keep the navbar in code: they map 1:1 to real routes), decorative icons that are not part of a repeatable card, `alt=""` on purely decorative images, and iframe `title`/`sandbox` attributes.
- **Rich text:** none of the three pages has inline formatting (no bold/links inside a paragraph). All prose is therefore a plain `textarea`; multi-paragraph copy (trainer bio) is split on blank lines, two-line copy (hall address) on single newlines. Simplest thing that reproduces today's rendering exactly — no Lexical needed here.
- Commit with **targeted `git add`** only. Never `git add -A`. New commits, no amends. Throwaway verification scripts and the temporary revalidation route are deleted before committing and never staged.
- Implementers have **no browser**. Every visual/behavioural claim is verified with `curl` against the started production server or with a Local-API script.
- Scratch space for this plan: `/tmp/htv-plan4/` (outside the repo). Create it once with `mkdir -p /tmp/htv-plan4`.

---

## File Structure

```
hardtertv/
  globals/
    hooks/revalidate.ts            # new (or reused) — revalidateGlobalPaths(paths)
    Mitgliedschaft.ts              # new
    Training.ts                    # new
    Eisstock.ts                    # new
  scripts/
    seed-mitgliedschaft.ts         # new — one-time, idempotent, self-contained
    seed-training.ts               # new
    seed-eisstock.ts               # new
  migrations/                      # +3 generated migrations
  payload.config.ts                # modified — globals: [Mitgliedschaft, Training, Eisstock]
  package.json                     # modified — 3 seed scripts
  payload-types.ts                 # regenerated
  app/(frontend)/
    mitgliedschaft/page.tsx        # rewritten — reads the mitgliedschaft global
    training/page.tsx              # rewritten — reads the training global
    eisstock/page.tsx              # rewritten — reads the eisstock global
  components/ui/
    eis-widget.tsx                 # modified — booking URL via prop
```

---

## Task 1: `globals/hooks/revalidate.ts`, the `mitgliedschaft` global, migration and seed

**Files:**
- Create: `globals/hooks/revalidate.ts` (only if it does not exist yet), `globals/Mitgliedschaft.ts`, `scripts/seed-mitgliedschaft.ts`
- Modify: `payload.config.ts`, `package.json`
- Generated: `migrations/<timestamp>_add_mitgliedschaft.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Consumes: the existing `media` collection (`collections/Media.ts`, `upload: true`, `alt` required); the PDFs in `public/`.
- Produces:
  - `globals/hooks/revalidate.ts` exports `revalidateGlobalPaths(paths: string[]): GlobalAfterChangeHook` — **reused by Tasks 3 and 5 and possibly by a parallel plan**.
  - Global slug `"mitgliedschaft"` with named tabs `hero`, `vorteile`, `dokumente`, `prozess`, `cta` (exact field list in Step 2), consumed by Task 2.
  - `package.json` script `seed:mitgliedschaft`.

- [ ] **Step 1: Create `globals/hooks/revalidate.ts`**

If the file already exists and already exports `revalidateGlobalPaths` with this signature (a parallel plan may have created it), **do not touch it** — reuse it as-is and skip to Step 2. Otherwise create it:

```ts
import { revalidatePath } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";

export const revalidateGlobalPaths =
  (paths: string[]): GlobalAfterChangeHook =>
  ({ doc, req }) => {
    if (req.context?.disableRevalidate) return doc;
    for (const path of paths) revalidatePath(path);
    return doc;
  };
```

(`GlobalAfterChangeHook` is exported from `payload` — verified in `node_modules/payload/dist/index.d.ts`. The collection equivalent stays where it is, in `collections/hooks/revalidate.ts`.)

- [ ] **Step 2: Create `globals/Mitgliedschaft.ts`**

```ts
import type { GlobalConfig } from "payload";

import { revalidateGlobalPaths } from "./hooks/revalidate";

export const Mitgliedschaft: GlobalConfig = {
  slug: "mitgliedschaft",
  label: "Mitgliedschaft (Seite)",
  admin: { group: "Seiten" },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalPaths(["/mitgliedschaft"])],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "hero",
          label: "Hero",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel (über der Überschrift)" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, label: "Einleitungstext" },
            { name: "antragButtonLabel", type: "text", required: true, label: "Beschriftung Download-Button" },
            {
              name: "antragPdf",
              type: "upload",
              relationTo: "media",
              label: "Aufnahmeantrag (PDF)",
              admin: { description: "Wird vom Button im Hero heruntergeladen." },
            },
            { name: "kontaktLinkLabel", type: "text", required: true, label: "Beschriftung Kontakt-Link" },
            { name: "kontaktEmail", type: "email", required: true, label: "E-Mail-Adresse für den Kontakt-Link" },
          ],
        },
        {
          name: "vorteile",
          label: "Vorteile & Zahlen",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            { name: "titelHinten", type: "text", label: "Überschrift – letzter Teil" },
            { name: "text", type: "textarea", required: true, label: "Einleitungstext" },
            {
              name: "liste",
              type: "array",
              label: "Vorteile",
              required: true,
              labels: { singular: "Vorteil", plural: "Vorteile" },
              fields: [{ name: "text", type: "text", required: true }],
            },
            {
              name: "stats",
              type: "array",
              label: "Zahlen-Kacheln",
              required: true,
              labels: { singular: "Kachel", plural: "Kacheln" },
              fields: [
                { name: "wert", type: "text", required: true, label: "Große Zahl" },
                { name: "label", type: "text", required: true, label: "Bezeichnung" },
                { name: "zusatz", type: "text", required: true, label: "Zusatztext" },
              ],
            },
          ],
        },
        {
          name: "dokumente",
          label: "Dokumente",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            {
              name: "karten",
              type: "array",
              label: "Dokumenten-Karten",
              required: true,
              labels: { singular: "Karte", plural: "Karten" },
              fields: [
                {
                  name: "icon",
                  type: "select",
                  required: true,
                  defaultValue: "fileText",
                  label: "Symbol",
                  options: [
                    { label: "Personen", value: "users" },
                    { label: "Stern", value: "star" },
                    { label: "Dokument", value: "fileText" },
                  ],
                },
                { name: "titel", type: "text", required: true },
                { name: "beschreibung", type: "textarea", required: true },
                { name: "datei", type: "upload", relationTo: "media", label: "PDF-Datei" },
                { name: "downloadLabel", type: "text", required: true, label: "Beschriftung Download-Button" },
                { name: "mailLabel", type: "text", label: "Beschriftung E-Mail-Button (leer = kein Button)" },
                { name: "mailAdresse", type: "email", label: "E-Mail-Adresse" },
                { name: "mailBetreff", type: "text", label: "Betreff der E-Mail" },
              ],
            },
          ],
        },
        {
          name: "prozess",
          label: "Ablauf",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            {
              name: "schritte",
              type: "array",
              label: "Schritte",
              required: true,
              labels: { singular: "Schritt", plural: "Schritte" },
              fields: [
                { name: "nr", type: "text", required: true, label: "Nummer (z.B. 01)" },
                { name: "titel", type: "text", required: true },
                { name: "text", type: "textarea", required: true },
              ],
            },
          ],
        },
        {
          name: "cta",
          label: "Abschluss-Box",
          fields: [
            { name: "titel", type: "text", required: true },
            { name: "text", type: "textarea", required: true },
            { name: "buttonLabel", type: "text", required: true, label: "Beschriftung E-Mail-Button" },
            { name: "email", type: "email", required: true },
            { name: "telefonLabel", type: "text", required: true, label: "Telefonnummer (Anzeige)" },
            {
              name: "telefonHref",
              type: "text",
              required: true,
              label: "Telefonnummer (Wählformat)",
              admin: { description: 'Wird als tel:-Link verwendet, z.B. "+4917225802099".' },
            },
          ],
        },
      ],
    },
  ],
};
```

- [ ] **Step 3: Register in `payload.config.ts`, then migrate and regenerate types**

In `payload.config.ts` add the import next to the existing collection imports:

```ts
import { Mitgliedschaft } from "./globals/Mitgliedschaft";
```

and add a `globals` array directly after the `collections: [...]` line. The file currently has **no** `globals` key — create it. If a parallel plan has already added one, append to it instead:

```ts
  collections: [Users, Media, Teams, BoardMembers, Events],
  globals: [Mitgliedschaft],
```

Then, in this order:

```bash
npm run migrate
npm run migrate:create -- add_mitgliedschaft
npm run migrate
npm run generate:types
```

Expected: the first `migrate` is a no-op (`Done.` / nothing to migrate) or applies a parallel plan's migration; `migrate:create` writes `migrations/<timestamp>_add_mitgliedschaft.ts/.json` (creating the `mitgliedschaft` table plus the `mitgliedschaft_vorteile_liste`, `mitgliedschaft_vorteile_stats`, `mitgliedschaft_dokumente_karten`, `mitgliedschaft_prozess_schritte` array tables and the icon enum) and updates `migrations/index.ts`; `generate:types` adds a `Mitgliedschaft` interface to `payload-types.ts`. **No prompts.** If `migrate` prompts → STOP, report BLOCKED.

- [ ] **Step 4: Create `scripts/seed-mitgliedschaft.ts`**

```ts
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import type { Payload } from "payload";

import config from "../payload.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const mediaCache = new Map<string, number>();

async function uploadMedia(payload: Payload, relPath: string, alt: string): Promise<number> {
  const cached = mediaCache.get(relPath);
  if (cached !== undefined) return cached;
  const filePath = path.resolve(dirname, "..", "public", relPath.replace(/^\//, ""));
  const doc = await payload.create({
    collection: "media",
    data: { alt },
    filePath,
    context: { disableRevalidate: true },
  });
  mediaCache.set(relPath, doc.id);
  console.log(`media uploaded: ${relPath} -> id ${doc.id}`);
  return doc.id;
}

async function run() {
  const payload = await getPayload({ config });

  // Idempotency marker: the "Dokumente" cards are only ever written by this seed.
  const current = await payload.findGlobal({ slug: "mitgliedschaft", depth: 0 });
  if ((current.dokumente?.karten?.length ?? 0) > 0) {
    console.log("skip (already seeded): mitgliedschaft");
    process.exit(0);
  }

  const aufnahmeantrag = await uploadMedia(
    payload,
    "/aufnahmeantrag.pdf",
    "Aufnahmeantrag Hardter TV (PDF)",
  );
  const schnuppercard = await uploadMedia(
    payload,
    "/HTV-SchnupperCard-Antrag 2026.pdf",
    "HTV SchnupperCard Antrag 2026 (PDF)",
  );
  const beitragsordnung = await uploadMedia(
    payload,
    "/beitragsordnung.pdf",
    "Beitragsordnung Hardter TV (PDF)",
  );

  await payload.updateGlobal({
    slug: "mitgliedschaft",
    context: { disableRevalidate: true },
    data: {
      hero: {
        eyebrow: "Mitmachen",
        titelVorne: "Werde",
        titelHighlight: "Mitglied",
        text: "Ob jung, ob alt, ob Profi oder Anfänger, ob Männlein oder Weiblein — jeder ist willkommen beim Hardter TV.",
        antragButtonLabel: "Antrag herunterladen",
        antragPdf: aufnahmeantrag,
        kontaktLinkLabel: "Fragen? Schreib uns →",
        kontaktEmail: "1.vorsitzender@hardt-tennis.de",
      },
      vorteile: {
        eyebrow: "Deine Vorteile",
        titelVorne: "Was du als",
        titelHighlight: "Mitglied",
        titelHinten: "bekommst",
        text: "Als Mitglied des Hardter TV bist du Teil einer lebendigen Tennisgemeinschaft mit allem, was dazu gehört.",
        liste: [
          { text: "Nutzung aller 6 Tennisplätze (inkl. 2 Flutlichtplätze)" },
          { text: "Teilnahme am Mannschaftsspielbetrieb" },
          { text: "Zugang zu Vereinsturnieren & Events" },
          { text: "Professionelles Training durch André Albert" },
          { text: "Aktives Vereinsleben mit Gemeinschaft" },
          { text: "Günstige Mitgliedsbeiträge für alle Altersgruppen" },
        ],
        stats: [
          { wert: "200+", label: "Aktive Mitglieder", zusatz: "aus Dorsten und Umgebung" },
          { wert: "1978", label: "Vereinsgründung", zusatz: "über 45 Jahre Tennistradition" },
          { wert: "6", label: "Tennisplätze", zusatz: "inkl. 2 Flutlichtplätze" },
        ],
      },
      dokumente: {
        eyebrow: "Dokumente",
        titelVorne: "Alle",
        titelHighlight: "Unterlagen",
        karten: [
          {
            icon: "users",
            titel: "Mitglied werden",
            beschreibung:
              "Fülle den Aufnahmeantrag aus und schick ihn per E-Mail an uns. Wir melden uns schnellstmöglich bei dir.",
            datei: aufnahmeantrag,
            downloadLabel: "Antrag herunterladen",
            mailLabel: "Per E-Mail einreichen",
            mailAdresse: "1.vorsitzender@hardt-tennis.de",
            mailBetreff: "Mitgliedschaft Hardter TV",
          },
          {
            icon: "star",
            titel: "HTV Schnuppercard",
            beschreibung:
              "Du möchtest Tennis beim HTV erst ausprobieren? Mit unserer Greencard kannst du für wenig Geld eine komplette Sommersaison schnuppern — ganz unverbindlich.",
            datei: schnuppercard,
            downloadLabel: "Schnuppercard laden",
            mailLabel: "Per E-Mail einreichen",
            mailAdresse: "1.vorsitzender@hardt-tennis.de",
            mailBetreff: "Schnuppercard Hardter TV",
          },
          {
            icon: "fileText",
            titel: "Beitragsordnung",
            beschreibung:
              "Alle Informationen zu Beiträgen, Altersgruppen und Konditionen findest du in unserer Beitragsordnung als PDF-Dokument.",
            datei: beitragsordnung,
            downloadLabel: "Beitragsordnung laden",
          },
        ],
      },
      prozess: {
        eyebrow: "Anmeldung",
        titelVorne: "So einfach",
        titelHighlight: "geht's",
        schritte: [
          {
            nr: "01",
            titel: "Antrag herunterladen",
            text: "Lade den Aufnahmeantrag oder die Schnuppercard als PDF herunter und drucke ihn aus.",
          },
          {
            nr: "02",
            titel: "Ausfüllen & unterschreiben",
            text: "Fülle den Antrag vollständig aus und unterschreibe ihn.",
          },
          {
            nr: "03",
            titel: "Einreichen",
            text: "Schick den ausgefüllten Antrag per E-Mail an 1.vorsitzender@hardt-tennis.de — fertig!",
          },
        ],
      },
      cta: {
        titel: "Noch Fragen?",
        text: "Unser 1. Vorsitzender Oliver Wiegand hilft dir gerne weiter — per E-Mail oder telefonisch.",
        buttonLabel: "E-Mail schreiben",
        email: "1.vorsitzender@hardt-tennis.de",
        telefonLabel: "0172 25 80 209 →",
        telefonHref: "+4917225802099",
      },
    },
  });

  console.log("seeded: mitgliedschaft");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Add to `package.json` `scripts` (next to the existing `seed:board-members` / `seed:events` entries):

```json
"seed:mitgliedschaft": "dotenv -e .env.local -- tsx scripts/seed-mitgliedschaft.ts",
```

- [ ] **Step 5: Run the seed and verify the data**

```bash
npm run seed:mitgliedschaft
```

Expected: three `media uploaded:` lines, then `seeded: mitgliedschaft`. Run it a second time: exactly one line, `skip (already seeded): mitgliedschaft`, and **no** new media documents (check the media count before/after in the script below).

Then a throwaway Local-API check — write it to `/tmp/htv-plan4/check-mitgliedschaft.ts`, run it with `npx dotenv -e .env.local -- tsx /tmp/htv-plan4/check-mitgliedschaft.ts` from `hardtertv/`, and **delete it afterwards** (it lives outside the repo, so it can never be committed):

```ts
import { getPayload } from "payload";
import config from "/Users/paulspengler/Webdesign/HardterTV/.claude/worktrees/payload-cms-foundation/hardtertv/payload.config";

const payload = await getPayload({ config });
const g = await payload.findGlobal({ slug: "mitgliedschaft", depth: 1 });
console.log("vorteile:", g.vorteile.liste?.length);
console.log("stats:", g.vorteile.stats?.map((s) => `${s.wert}/${s.label}`).join(" | "));
console.log("karten:", g.dokumente.karten?.length);
console.log("schritte:", g.prozess.schritte?.length);
console.log(
  "pdfs:",
  g.dokumente.karten?.map((k) => (typeof k.datei === "object" && k.datei ? k.datei.url : null)).join(" | "),
);
console.log("hero pdf:", typeof g.hero.antragPdf === "object" && g.hero.antragPdf ? g.hero.antragPdf.url : null);
console.log("cta:", g.cta.titel, g.cta.telefonLabel, g.cta.telefonHref);
process.exit(0);
```

Expected: `vorteile: 6`, `stats: 200+/Aktive Mitglieder | 1978/Vereinsgründung | 6/Tennisplätze`, `karten: 3`, `schritte: 3`, three PDF urls of the form `/api/media/file/…pdf` (the Schnuppercard one URL-encoded as `HTV-SchnupperCard-Antrag%202026.pdf`), `hero pdf` equal to the first card's url (the aufnahmeantrag is uploaded **once** and reused), and the CTA line `Noch Fragen? 0172 25 80 209 → +4917225802099`.

- [ ] **Step 6: Build and commit**

```bash
npm run build
git add globals/hooks/revalidate.ts globals/Mitgliedschaft.ts scripts/seed-mitgliedschaft.ts payload.config.ts package.json payload-types.ts migrations
git commit -m "Add mitgliedschaft global and seed it from the Mitgliedschaft page"
```

(If `globals/hooks/revalidate.ts` already existed and was not modified, drop it from the `git add` list.)

---

## Task 2: Rewire `/mitgliedschaft` onto the global

**Files:**
- Modify: `app/(frontend)/mitgliedschaft/page.tsx`
- Temporary (created and deleted inside this task, never committed): `app/(frontend)/__revalidate-test/route.ts`, `/tmp/htv-plan4/*`

**Interfaces:**
- Consumes: global `"mitgliedschaft"` (Task 1), `Media` from `@/payload-types`.
- Produces: `/mitgliedschaft` rendered entirely from Payload; `export const revalidate = 3600`. Establishes the `fileUrl()` + icon-map pattern that Tasks 4 and 6 copy.

- [ ] **Step 1: Capture the current rendering BEFORE changing anything**

```bash
mkdir -p /tmp/htv-plan4
cat > /tmp/htv-plan4/visible-text.sh <<'SH'
#!/bin/bash
# usage: visible-text.sh <url> <outfile>   — visible page text, one word per line
curl -s "$1" | perl -0777 -pe '
  s{<script\b.*?</script>}{ }gsi;
  s{<style\b.*?</style>}{ }gsi;
  s{<!--.*?-->}{ }gs;
  s{<[^>]+>}{ }g;
  s{&#x27;}{\x27}g; s{&#39;}{\x27}g; s{&quot;}{"}g; s{&lt;}{<}g; s{&gt;}{>}g; s{&nbsp;}{ }g; s{&amp;}{&}g;
  s{\s+}{\n}g;
' | sed '/^$/d' > "$2"
SH
chmod +x /tmp/htv-plan4/visible-text.sh

npm run build
npx next start -p 3111 > /tmp/htv-plan4/server.log 2>&1 &
echo $! > /tmp/htv-plan4/server.pid
curl -s --retry 20 --retry-delay 1 --retry-connrefused -o /dev/null http://localhost:3111/
/tmp/htv-plan4/visible-text.sh http://localhost:3111/mitgliedschaft /tmp/htv-plan4/mitgliedschaft-before.txt
wc -l /tmp/htv-plan4/mitgliedschaft-before.txt
kill "$(cat /tmp/htv-plan4/server.pid)"
```

The script strips `<script>`/`<style>` blocks (so the Next flight payload does not leak in), drops every tag (so image/PDF URLs never reach the comparison) and decodes the five entities React emits. Expected: a few hundred lines, containing `Mitmachen`, `200+`, `1978`, `geht's`, `Noch`, `Fragen?`.

- [ ] **Step 2: Rewrite `app/(frontend)/mitgliedschaft/page.tsx`**

Replace the whole file with the following. The unused `import Link from "next/link"` of the current file is dropped (it is imported but never used — verified with `grep -n "Link" app/\(frontend\)/mitgliedschaft/page.tsx`, only the import line matches). All classes, sections and the order are unchanged.

```tsx
import { ArrowUpRight, Download, FileText, Mail, Star, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Media } from "@/payload-types";

export const revalidate = 3600;

const DOKUMENT_ICONS: Record<string, LucideIcon> = {
  users: Users,
  star: Star,
  fileText: FileText,
};

function dokumentIcon(key: string | null | undefined): LucideIcon {
  return DOKUMENT_ICONS[key ?? ""] ?? FileText;
}

function fileUrl(value: number | Media | null | undefined): string | null {
  return typeof value === "object" && value ? value.url ?? null : null;
}

function mailtoHref(email: string, betreff?: string | null): string {
  return betreff ? `mailto:${email}?subject=${encodeURIComponent(betreff)}` : `mailto:${email}`;
}

export default async function MitgliedschaftPage() {
  const payload = await getPayload({ config });
  const { hero, vorteile, dokumente, prozess, cta } = await payload.findGlobal({
    slug: "mitgliedschaft",
    depth: 1,
  });

  const antragUrl = fileUrl(hero.antragPdf);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#122023] px-6 py-24 md:px-12 lg:px-20 lg:py-36">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-[#e1fcad]" />
          <div className="absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-[#e1fcad]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-white/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">{hero.eyebrow}</span>
          </div>

          <h1 className="font-kanturmuy max-w-3xl text-4xl font-normal tracking-tighter text-white sm:text-5xl md:text-7xl">
            {hero.titelVorne}{" "}
            <span className="relative inline-block">
              {hero.titelHighlight}
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light text-white/60 md:text-lg">{hero.text}</p>

          <div className="mt-10 flex flex-wrap gap-4">
            {antragUrl && (
              <a href={antragUrl} download>
                <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                  <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-white group-hover:text-black">
                    {hero.antragButtonLabel}
                  </span>
                  <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover:bg-white group-hover:text-black">
                    <Download className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" strokeWidth={1.5} />
                    <Download className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" strokeWidth={1.5} />
                  </div>
                </button>
              </a>
            )}
            <a
              href={`mailto:${hero.kontaktEmail}`}
              className="flex items-center text-sm font-light text-white/50 underline-offset-4 hover:underline"
            >
              {hero.kontaktLinkLabel}
            </a>
          </div>
        </div>
      </section>

      {/* Vorteile */}
      <section className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-black/30" />
                <span className="text-xs uppercase tracking-[0.2em] text-black/50">{vorteile.eyebrow}</span>
              </div>
              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
                {vorteile.titelVorne}{" "}
                <span className="relative inline-block">
                  {vorteile.titelHighlight}
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
                </span>
                {vorteile.titelHinten ? <> {vorteile.titelHinten}</> : null}
              </h2>
              <p className="mt-5 text-base font-light leading-relaxed text-black/60">{vorteile.text}</p>

              <ul className="mt-8 space-y-3">
                {(vorteile.liste ?? []).map((v) => (
                  <li key={v.text} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e1fcad]">
                      <Star className="size-3 text-black" strokeWidth={2} />
                    </span>
                    <span className="text-sm font-light text-black/70">{v.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stat block */}
            <div className="flex flex-col justify-center gap-6">
              {(vorteile.stats ?? []).map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-6 rounded-2xl border border-black/[0.06] bg-[#f9f9f7] p-6"
                >
                  <span className="font-kanturmuy text-4xl font-normal tracking-tight text-black">
                    {s.wert}
                  </span>
                  <div>
                    <p className="font-medium text-black">{s.label}</p>
                    <p className="text-sm font-light text-black/50">{s.zusatz}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 Karten */}
      <section className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-black/30" />
              <span className="text-xs uppercase tracking-[0.2em] text-black/50">{dokumente.eyebrow}</span>
            </div>
            <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
              {dokumente.titelVorne}{" "}
              <span className="relative inline-block">
                {dokumente.titelHighlight}
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {(dokumente.karten ?? []).map((karte) => {
              const Icon = dokumentIcon(karte.icon);
              const dateiUrl = fileUrl(karte.datei);
              return (
                <div
                  key={karte.titel}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-shadow duration-300 hover:shadow-lg"
                >
                  <div className="flex flex-1 flex-col p-7">
                    <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-[#e1fcad]">
                      <Icon className="size-5 text-black" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-kanturmuy text-2xl font-normal tracking-tight text-black">
                      {karte.titel}
                    </h3>
                    <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-black/55">
                      {karte.beschreibung}
                    </p>
                    <div className="mt-6 space-y-3 border-t border-black/[0.06] pt-5">
                      {dateiUrl && (
                        <a href={dateiUrl} download>
                          <button className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#f9f9f7] px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-[#e1fcad]">
                            <span>{karte.downloadLabel}</span>
                            <Download className="size-4" strokeWidth={1.5} />
                          </button>
                        </a>
                      )}
                      {karte.mailAdresse && karte.mailLabel && (
                        <a
                          href={mailtoHref(karte.mailAdresse, karte.mailBetreff)}
                          className="flex items-center justify-between rounded-xl border border-black/[0.06] px-4 py-3 text-sm text-black/50 transition-colors hover:text-black"
                        >
                          <span>{karte.mailLabel}</span>
                          <Mail className="size-4" strokeWidth={1.5} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* So läuft es ab */}
      <section className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-black/30" />
              <span className="text-xs uppercase tracking-[0.2em] text-black/50">{prozess.eyebrow}</span>
            </div>
            <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
              {prozess.titelVorne}{" "}
              <span className="relative inline-block">
                {prozess.titelHighlight}
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {(prozess.schritte ?? []).map((s) => (
              <div key={s.nr} className="flex flex-col gap-4 rounded-2xl border border-black/[0.06] bg-[#f9f9f7] p-7">
                <span className="font-kanturmuy text-4xl font-normal text-black/10">{s.nr}</span>
                <h3 className="font-kanturmuy text-xl font-normal tracking-tight text-black">
                  {s.titel}
                </h3>
                <p className="text-sm font-light leading-relaxed text-black/55">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#e1fcad] px-6 py-20 md:px-12 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter text-black sm:text-4xl md:text-5xl">
                {cta.titel}
              </h2>
              <p className="mt-3 max-w-md text-base font-light text-black/60">{cta.text}</p>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0">
              <a href={`mailto:${cta.email}`}>
                <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                  <span className="rounded-full bg-[#122023] px-6 py-3 text-sm font-medium text-[#e1fcad] duration-500 ease-in-out group-hover:bg-black group-hover:text-white">
                    {cta.buttonLabel}
                  </span>
                  <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#122023] text-[#e1fcad] duration-500 ease-in-out group-hover:bg-black group-hover:text-white">
                    <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                    <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                  </div>
                </button>
              </a>
              <a
                href={`tel:${cta.telefonHref}`}
                className="flex items-center text-sm font-light text-black/60 underline-offset-4 hover:underline"
              >
                {cta.telefonLabel}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
```

Two intentional, invisible markup simplifications (both verified inert before applying):
- The first document card's download button loses the `group/btn` class. `grep -rn "group-hover/btn" app components` returns nothing, so the class had no effect.
- The third card's button wrapper gains `space-y-3`. With a single child, `space-y-*` adds no margin, so the rendering is identical.

- [ ] **Step 3: Rebuild, capture the new rendering and diff it against the baseline**

```bash
npm run build
npx next start -p 3111 > /tmp/htv-plan4/server.log 2>&1 &
echo $! > /tmp/htv-plan4/server.pid
curl -s --retry 20 --retry-delay 1 --retry-connrefused -o /dev/null http://localhost:3111/
/tmp/htv-plan4/visible-text.sh http://localhost:3111/mitgliedschaft /tmp/htv-plan4/mitgliedschaft-after.txt
diff -u /tmp/htv-plan4/mitgliedschaft-before.txt /tmp/htv-plan4/mitgliedschaft-after.txt && echo "IDENTICAL"
```

Expected: `IDENTICAL`. **Any** difference must be explained and fixed (in practice: a typo in the seed data) before continuing — the visible text of the page must not change.

- [ ] **Step 4: Verify the PDF links actually resolve**

Still with the server running:

```bash
curl -s http://localhost:3111/mitgliedschaft | grep -o 'href="/api/media/file/[^"]*"' | sort -u
curl -sI "http://localhost:3111/api/media/file/aufnahmeantrag.pdf" | head -n 5
curl -sI "http://localhost:3111/api/media/file/HTV-SchnupperCard-Antrag%202026.pdf" | head -n 5
curl -sI "http://localhost:3111/api/media/file/beitragsordnung.pdf" | head -n 5
```

Expected: exactly **3 unique** `href="/api/media/file/…"` lines (hero + three cards = four links, but the Aufnahmeantrag is used twice and collapses), and each `HEAD` returns `HTTP/1.1 200 OK` with `content-type: application/pdf`. If a URL 404s, the filename in the media doc differs from the guess — take the exact url from the check script in Task 1 Step 5 and re-run.

- [ ] **Step 5: Prove the revalidation hook works (one-time, for all three globals)**

The hook helper is shared, so this is proven once here. Stop the server, create a **temporary** route, rebuild, and drive it:

```bash
kill "$(cat /tmp/htv-plan4/server.pid)"
mkdir -p "app/(frontend)/__revalidate-test"
cat > "app/(frontend)/__revalidate-test/route.ts" <<'TS'
// TEMPORARY — created and deleted inside Task 2 Step 5. Never commit this file.
import { getPayload } from "payload";
import config from "@payload-config";

export async function GET(request: Request) {
  const value = new URL(request.url).searchParams.get("value") ?? "";
  const payload = await getPayload({ config });
  const current = await payload.findGlobal({ slug: "mitgliedschaft", depth: 0 });
  await payload.updateGlobal({
    slug: "mitgliedschaft",
    data: { cta: { ...current.cta, titel: value } },
  });
  return Response.json({ ok: true, value });
}
TS

npm run build
npx next start -p 3111 > /tmp/htv-plan4/server.log 2>&1 &
echo $! > /tmp/htv-plan4/server.pid
curl -s --retry 20 --retry-delay 1 --retry-connrefused -o /dev/null http://localhost:3111/
curl -s http://localhost:3111/mitgliedschaft | grep -c "Noch Fragen?"
curl -s "http://localhost:3111/__revalidate-test?value=Revalidierung%20funktioniert"
curl -s http://localhost:3111/mitgliedschaft | grep -c "Revalidierung funktioniert"
curl -s "http://localhost:3111/__revalidate-test?value=Noch%20Fragen%3F"
curl -s http://localhost:3111/mitgliedschaft | grep -c "Noch Fragen?"
kill "$(cat /tmp/htv-plan4/server.pid)"
rm -rf "app/(frontend)/__revalidate-test"
```

Expected: `1`, then `{"ok":true,...}`, then `1` for the new title **without a rebuild** (proving `revalidateGlobalPaths` fired), then the restore, then `1` again for `Noch Fragen?`. Confirm the temp route is gone: `git status --short` must show only `app/(frontend)/mitgliedschaft/page.tsx` as modified.

- [ ] **Step 6: Build and commit**

```bash
npm run build
git add "app/(frontend)/mitgliedschaft/page.tsx"
git commit -m "Read the Mitgliedschaft page from Payload"
```

---

## Task 3: The `training` global, migration and seed

**Files:**
- Create: `globals/Training.ts`, `scripts/seed-training.ts`
- Modify: `payload.config.ts`, `package.json`
- Generated: `migrations/<timestamp>_add_training.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Consumes: `revalidateGlobalPaths` from `globals/hooks/revalidate.ts` (Task 1).
- Produces: global slug `"training"` with named tabs `hero`, `trainer`, `angebote`, `halle`, `cta`; the `angebote.karten[].icon` select accepts exactly `userCheck | users | trophy | dumbbell | star | calendar` (consumed by Task 4). `package.json` script `seed:training`.

- [ ] **Step 1: Create `globals/Training.ts`**

```ts
import type { GlobalConfig } from "payload";

import { revalidateGlobalPaths } from "./hooks/revalidate";

export const Training: GlobalConfig = {
  slug: "training",
  label: "Training (Seite)",
  admin: { group: "Seiten" },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalPaths(["/training"])],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "hero",
          label: "Hero",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, label: "Einleitungstext" },
            { name: "buttonLabel", type: "text", required: true, label: "Beschriftung Anruf-Button" },
            {
              name: "telefonHref",
              type: "text",
              required: true,
              label: "Telefonnummer (Wählformat)",
              admin: { description: 'Wird als tel:-Link verwendet, z.B. "+4917559049030".' },
            },
          ],
        },
        {
          name: "trainer",
          label: "Trainer",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "foto", type: "upload", relationTo: "media", label: "Foto des Trainers" },
            { name: "badge", type: "text", required: true, label: "Text auf dem Foto-Badge" },
            { name: "name", type: "text", required: true },
            { name: "rolle", type: "text", required: true, label: "Funktion" },
            {
              name: "bio",
              type: "textarea",
              required: true,
              label: "Beschreibung",
              admin: { description: "Leerzeile = neuer Absatz." },
            },
            {
              name: "fakten",
              type: "array",
              label: "Eckdaten",
              required: true,
              labels: { singular: "Eckdatum", plural: "Eckdaten" },
              fields: [
                { name: "wert", type: "text", required: true, label: "Wert" },
                { name: "label", type: "text", required: true, label: "Bezeichnung" },
              ],
            },
            { name: "telefonLabel", type: "text", required: true, label: "Telefonnummer (Anzeige)" },
            { name: "telefonHref", type: "text", required: true, label: "Telefonnummer (Wählformat)" },
          ],
        },
        {
          name: "angebote",
          label: "Angebote",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, label: "Text rechts neben der Überschrift" },
            {
              name: "karten",
              type: "array",
              label: "Angebots-Karten",
              required: true,
              labels: { singular: "Angebot", plural: "Angebote" },
              fields: [
                {
                  name: "icon",
                  type: "select",
                  required: true,
                  defaultValue: "star",
                  label: "Symbol",
                  options: [
                    { label: "Person mit Haken", value: "userCheck" },
                    { label: "Personen", value: "users" },
                    { label: "Pokal", value: "trophy" },
                    { label: "Hantel", value: "dumbbell" },
                    { label: "Stern", value: "star" },
                    { label: "Kalender", value: "calendar" },
                  ],
                },
                { name: "titel", type: "text", required: true },
                { name: "beschreibung", type: "textarea", required: true },
              ],
            },
          ],
        },
        {
          name: "halle",
          label: "Halle",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, label: "Beschreibung" },
            {
              name: "stats",
              type: "array",
              label: "Zahlen",
              required: true,
              labels: { singular: "Zahl", plural: "Zahlen" },
              fields: [
                { name: "wert", type: "text", required: true },
                { name: "label", type: "text", required: true },
              ],
            },
            { name: "websiteLabel", type: "text", required: true, label: "Beschriftung Website-Button" },
            { name: "websiteUrl", type: "text", required: true, label: "Website der Halle" },
            { name: "anrufLabel", type: "text", required: true, label: "Beschriftung Anruf-Link" },
            { name: "telefonHref", type: "text", required: true, label: "Telefonnummer (Wählformat)" },
            { name: "standortTitel", type: "text", required: true, label: "Überschrift Standort-Box" },
            {
              name: "adresse",
              type: "textarea",
              required: true,
              label: "Adresse",
              admin: { description: "Jede Zeile wird als eigene Zeile ausgegeben." },
            },
            { name: "kontaktTitel", type: "text", required: true, label: "Überschrift Kontakt-Box" },
            { name: "kontaktText", type: "textarea", required: true, label: "Text der Kontakt-Box" },
            { name: "kontaktTelefonLabel", type: "text", label: "Telefonnummer (Anzeige)" },
            { name: "kontaktTelefonHref", type: "text", label: "Telefonnummer (Wählformat)" },
            { name: "kontaktEmail", type: "email", label: "E-Mail-Adresse (leer = kein E-Mail-Link)" },
          ],
        },
        {
          name: "cta",
          label: "Abschluss-Box",
          fields: [
            { name: "titel", type: "text", required: true },
            { name: "text", type: "textarea", required: true },
            { name: "buttonLabel", type: "text", required: true, label: "Beschriftung Anruf-Button" },
            { name: "telefonHref", type: "text", required: true, label: "Telefonnummer (Wählformat)" },
            { name: "zurueckLabel", type: "text", required: true, label: "Beschriftung Link zur Startseite" },
          ],
        },
      ],
    },
  ],
};
```

- [ ] **Step 2: Register, migrate, regenerate types**

In `payload.config.ts` add `import { Training } from "./globals/Training";` and extend the `globals` array to `globals: [Mitgliedschaft, Training],` (append if a parallel plan added entries).

```bash
npm run migrate
npm run migrate:create -- add_training
npm run migrate
npm run generate:types
```

`migrate` must not prompt (if it does → STOP, report BLOCKED).

- [ ] **Step 3: Create `scripts/seed-training.ts`**

```ts
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import type { Payload } from "payload";

import config from "../payload.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

async function uploadMedia(payload: Payload, relPath: string, alt: string): Promise<number> {
  const filePath = path.resolve(dirname, "..", "public", relPath.replace(/^\//, ""));
  const doc = await payload.create({
    collection: "media",
    data: { alt },
    filePath,
    context: { disableRevalidate: true },
  });
  console.log(`media uploaded: ${relPath} -> id ${doc.id}`);
  return doc.id;
}

async function run() {
  const payload = await getPayload({ config });

  // Idempotency marker: the "Angebote" cards are only ever written by this seed.
  const current = await payload.findGlobal({ slug: "training", depth: 0 });
  if ((current.angebote?.karten?.length ?? 0) > 0) {
    console.log("skip (already seeded): training");
    process.exit(0);
  }

  const foto = await uploadMedia(payload, "/images/Andre Albert_1.JPG", "André Albert – Tennislehrer");

  await payload.updateGlobal({
    slug: "training",
    context: { disableRevalidate: true },
    data: {
      hero: {
        eyebrow: "Training",
        titelVorne: "Tennisschule",
        titelHighlight: "André Albert",
        text: "Wir l(i)eben Tennis – das ist das Motto von André Albert und dem Team seiner Tennisschule, mit dem er seit 2005 unseren Verein betreut.",
        buttonLabel: "Jetzt anrufen",
        telefonHref: "+4917559049030",
      },
      trainer: {
        eyebrow: "Euer Trainer",
        foto,
        badge: "Seit 2005 beim HTV",
        name: "André Albert",
        rolle: "Tennislehrer & Vereinstrainer",
        bio:
          "André Albert ist seit 2005 selbstständiger Tennislehrer und betreut den Hardter Tennisverein mit vollem Einsatz. Als ehemaliger Leistungsspieler mit Deutschlandranking bringt er nicht nur technisches Know-how, sondern auch die Leidenschaft für das Spiel mit.\n\nMit seiner B-Trainer-Lizenz des Deutschen Tennisbundes und jahrelanger Erfahrung bietet er maßgeschneidertes Training für Anfänger, Fortgeschrittene und ambitionierte Wettkampfspieler.",
        fakten: [
          { wert: "2005", label: "Selbstständig seit" },
          { wert: "B-Lizenz", label: "DTB Trainer" },
        ],
        telefonLabel: "0175 59 04 903",
        telefonHref: "+4917559049030",
      },
      angebote: {
        eyebrow: "Was wir anbieten",
        titelVorne: "Unsere",
        titelHighlight: "Trainingsangebote",
        text: "Für jedes Alter und jedes Niveau — von der ersten Schnupperstunde bis zum Turnierspieler.",
        karten: [
          {
            icon: "userCheck",
            titel: "Einzelstunden",
            beschreibung: "Individuelles Training abgestimmt auf dein Spielniveau und deine Ziele.",
          },
          {
            icon: "users",
            titel: "Gruppentraining",
            beschreibung: "Gemeinsam mehr Spaß — Training in kleinen Gruppen für alle Altersklassen.",
          },
          {
            icon: "trophy",
            titel: "Mannschaftstraining",
            beschreibung: "Vorbereitung für Vereinsmannschaften auf den Wettkampf.",
          },
          {
            icon: "dumbbell",
            titel: "Spielvorbereitung",
            beschreibung: "Gezielte Einheiten zur taktischen und technischen Matchvorbereitung.",
          },
          {
            icon: "star",
            titel: "Turnierbegleitung",
            beschreibung: "Coaching und Unterstützung bei Turnieren auf allen Niveaus.",
          },
          {
            icon: "calendar",
            titel: "Schnupperstunden",
            beschreibung:
              "Noch nie Tennis gespielt? Lern das Spiel bei einer unverbindlichen Schnupperstunde kennen.",
          },
        ],
      },
      halle: {
        eyebrow: "Anlage",
        titelVorne: "Tennishalle",
        titelHighlight: "Kirchhellen",
        text: "Seit dem 1. Oktober 2022 leitet André Albert auch die Tennishalle Kirchhellen. Die Halle bietet vier Plätze — drei Sandplätze und einen Teppichplatz — und ist damit die ideale Ergänzung für ganzjähriges Training.",
        stats: [
          { wert: "4", label: "Plätze gesamt" },
          { wert: "3", label: "Sandplätze" },
          { wert: "1", label: "Teppichplatz" },
        ],
        websiteLabel: "Zur Website der Halle",
        websiteUrl: "https://www.tennishalle-kirchhellen.com",
        anrufLabel: "Direkt anrufen →",
        telefonHref: "+4917559049030",
        standortTitel: "Standort",
        adresse: "Gahlener Str. 204\n46284 Dorsten",
        kontaktTitel: "Kontakt",
        kontaktText:
          "Ruf André direkt an oder schreib uns eine E-Mail — wir melden uns schnellstmöglich.",
        kontaktTelefonLabel: "0175 59 04 903",
        kontaktTelefonHref: "+4917559049030",
        kontaktEmail: "1.vorsitzender@hardt-tennis.de",
      },
      cta: {
        titel: "Bereit für dein erstes Training?",
        text: "Melde dich jetzt und starte durch — Schnupperstunden jederzeit möglich.",
        buttonLabel: "Anrufen",
        telefonHref: "+4917559049030",
        zurueckLabel: "Zurück zur Startseite →",
      },
    },
  });

  console.log("seeded: training");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Add to `package.json` `scripts`:

```json
"seed:training": "dotenv -e .env.local -- tsx scripts/seed-training.ts",
```

- [ ] **Step 4: Run the seed and verify**

```bash
npm run seed:training
```

Expected: one `media uploaded:` line, then `seeded: training`. Second run: only `skip (already seeded): training` and **no** second upload of the trainer photo.

Throwaway Local-API check in `/tmp/htv-plan4/check-training.ts` (same invocation style as Task 1 Step 5, delete afterwards):

```ts
import { getPayload } from "payload";
import config from "/Users/paulspengler/Webdesign/HardterTV/.claude/worktrees/payload-cms-foundation/hardtertv/payload.config";

const payload = await getPayload({ config });
const g = await payload.findGlobal({ slug: "training", depth: 1 });
console.log("angebote:", g.angebote.karten?.map((k) => `${k.icon}:${k.titel}`).join(" | "));
console.log("fakten:", g.trainer.fakten?.map((f) => `${f.wert}/${f.label}`).join(" | "));
console.log("halle stats:", g.halle.stats?.map((s) => `${s.wert}/${s.label}`).join(" | "));
console.log("foto:", typeof g.trainer.foto === "object" && g.trainer.foto ? g.trainer.foto.url : null);
console.log("bio absätze:", g.trainer.bio.split(/\n\s*\n/).length);
console.log("adresse zeilen:", g.halle.adresse.split("\n").length);
process.exit(0);
```

Expected: 6 angebote in the order `userCheck:Einzelstunden | users:Gruppentraining | trophy:Mannschaftstraining | dumbbell:Spielvorbereitung | star:Turnierbegleitung | calendar:Schnupperstunden`; `fakten: 2005/Selbstständig seit | B-Lizenz/DTB Trainer`; `halle stats: 4/Plätze gesamt | 3/Sandplätze | 1/Teppichplatz`; a `/api/media/file/…` url for the photo; `bio absätze: 2`; `adresse zeilen: 2`.

- [ ] **Step 5: Build and commit**

```bash
npm run build
git add globals/Training.ts scripts/seed-training.ts payload.config.ts package.json payload-types.ts migrations
git commit -m "Add training global and seed it from the Training page"
```

---

## Task 4: Rewire `/training` onto the global

**Files:**
- Modify: `app/(frontend)/training/page.tsx`

**Interfaces:**
- Consumes: global `"training"` (Task 3), `Media` from `@/payload-types`, the `fileUrl()`/icon-map pattern from Task 2.
- Produces: `/training` rendered entirely from Payload.

- [ ] **Step 1: Capture the current rendering BEFORE changing anything**

```bash
npm run build
npx next start -p 3111 > /tmp/htv-plan4/server.log 2>&1 &
echo $! > /tmp/htv-plan4/server.pid
curl -s --retry 20 --retry-delay 1 --retry-connrefused -o /dev/null http://localhost:3111/
/tmp/htv-plan4/visible-text.sh http://localhost:3111/training /tmp/htv-plan4/training-before.txt
wc -l /tmp/htv-plan4/training-before.txt
kill "$(cat /tmp/htv-plan4/server.pid)"
```

(If `/tmp/htv-plan4/visible-text.sh` is missing because this task runs in a fresh session, recreate it from Task 2 Step 1.)

- [ ] **Step 2: Rewrite `app/(frontend)/training/page.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Phone,
  Dumbbell,
  Users,
  Trophy,
  Calendar,
  Star,
  UserCheck,
  MapPin,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Media } from "@/payload-types";

export const revalidate = 3600;

const ANGEBOT_ICONS: Record<string, LucideIcon> = {
  userCheck: UserCheck,
  users: Users,
  trophy: Trophy,
  dumbbell: Dumbbell,
  star: Star,
  calendar: Calendar,
};

function angebotIcon(key: string | null | undefined): LucideIcon {
  return ANGEBOT_ICONS[key ?? ""] ?? Star;
}

function mediaDoc(value: number | Media | null | undefined): Media | null {
  return typeof value === "object" && value ? value : null;
}

export default async function TrainingPage() {
  const payload = await getPayload({ config });
  const { hero, trainer, angebote, halle, cta } = await payload.findGlobal({
    slug: "training",
    depth: 1,
  });

  const foto = mediaDoc(trainer.foto);
  const bioAbsaetze = trainer.bio.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const adresseZeilen = halle.adresse.split("\n").filter((z) => z.trim().length > 0);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#122023] px-6 py-24 md:px-12 lg:px-20 lg:py-36">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-[#e1fcad]" />
          <div className="absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-[#e1fcad]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-white/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">{hero.eyebrow}</span>
          </div>

          <h1 className="font-kanturmuy max-w-3xl text-4xl font-normal tracking-tighter text-white sm:text-5xl md:text-7xl">
            {hero.titelVorne}{" "}
            <span className="relative inline-block">
              {hero.titelHighlight}
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light text-white/60 md:text-lg">{hero.text}</p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a href={`tel:${hero.telefonHref}`}>
              <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-white group-hover:text-black">
                  {hero.buttonLabel}
                </span>
                <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover:bg-white group-hover:text-black">
                  <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                  <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                </div>
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Trainer Profile */}
      <section id="trainer" className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-black/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-black/50">{trainer.eyebrow}</span>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Photo */}
            <div className="group relative overflow-hidden rounded-2xl">
              {foto?.url ? (
                <Image
                  src={foto.url}
                  alt={foto.alt}
                  width={900}
                  height={1100}
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  style={{ minHeight: "420px" }}
                />
              ) : (
                <div className="h-full w-full bg-black/[0.04]" style={{ minHeight: "420px" }} />
              )}
              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-[#e1fcad] px-4 py-2">
                <Trophy className="size-4 text-black" strokeWidth={1.5} />
                <span className="text-sm font-medium text-black">{trainer.badge}</span>
              </div>
              <div className="h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full absolute bottom-0 left-0" />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <h2 className="font-kanturmuy text-4xl font-normal tracking-tight text-black sm:text-5xl">
                {trainer.name}
              </h2>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-[2px] w-5 rounded-full bg-[#e1fcad]" />
                <span className="text-sm font-light text-black/50">{trainer.rolle}</span>
              </div>

              <div className="mt-8 space-y-4 text-base font-light leading-relaxed text-black/70">
                {bioAbsaetze.map((absatz) => (
                  <p key={absatz.slice(0, 40)}>{absatz}</p>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {(trainer.fakten ?? []).map((f) => (
                  <div key={f.label} className="flex flex-col gap-1 border-t border-black/10 pt-4">
                    <span className="font-kanturmuy text-2xl font-normal tracking-tight">{f.wert}</span>
                    <span className="text-xs uppercase tracking-widest text-black/50">{f.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-3 border-t border-black/[0.06] pt-6">
                <a
                  href={`tel:${trainer.telefonHref}`}
                  className="flex items-center gap-3 text-sm text-black/50 transition-colors hover:text-black"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#e1fcad]">
                    <Phone className="size-3.5" strokeWidth={1.5} />
                  </div>
                  {trainer.telefonLabel}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Angebote */}
      <section id="angebote" className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-black/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-black/50">{angebote.eyebrow}</span>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="font-kanturmuy max-w-xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              {angebote.titelVorne}{" "}
              <span className="relative inline-block">
                {angebote.titelHighlight}
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
            <p className="max-w-sm text-base font-light text-black/50">{angebote.text}</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
            {(angebote.karten ?? []).map((item) => {
              const Icon = angebotIcon(item.icon);
              return (
                <div
                  key={item.titel}
                  className="group flex flex-col rounded-2xl border border-black/[0.06] bg-white p-6 transition-shadow duration-300 hover:shadow-lg overflow-hidden relative"
                >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[#e1fcad]">
                    <Icon className="size-5 text-black" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-kanturmuy text-xl font-normal tracking-tight text-black">
                    {item.titel}
                  </h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-black/55">
                    {item.beschreibung}
                  </p>
                  <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tennishalle Kirchhellen */}
      <section id="anlage" className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="flex flex-col justify-center">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-black/30" />
                <span className="text-xs uppercase tracking-[0.2em] text-black/50">{halle.eyebrow}</span>
              </div>

              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
                {halle.titelVorne}{" "}
                <span className="relative inline-block">
                  {halle.titelHighlight}
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
                </span>
              </h2>

              <p className="mt-6 text-base font-light leading-relaxed text-black/70">{halle.text}</p>

              <div className="mt-8 grid grid-cols-3 gap-4">
                {(halle.stats ?? []).map((s) => (
                  <div key={s.label} className="flex flex-col gap-1 border-t border-black/10 pt-4">
                    <span className="font-kanturmuy text-3xl font-normal tracking-tight">{s.wert}</span>
                    <span className="text-xs uppercase tracking-widest text-black/50">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a href={halle.websiteUrl} target="_blank" rel="noopener noreferrer">
                  <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                    <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                      {halle.websiteLabel}
                    </span>
                    <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                      <ExternalLink className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                      <ExternalLink className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                    </div>
                  </button>
                </a>
                <a
                  href={`tel:${halle.telefonHref}`}
                  className="text-sm font-light text-black/50 underline-offset-4 hover:underline"
                >
                  {halle.anrufLabel}
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-[#122023] p-8 text-white">
                <MapPin className="mb-4 size-6 text-[#e1fcad]" strokeWidth={1.5} />
                <h3 className="font-kanturmuy text-2xl font-normal tracking-tight">{halle.standortTitel}</h3>
                <p className="mt-2 text-sm font-light text-white/60">
                  {adresseZeilen.map((zeile, i) => (
                    <span key={zeile}>
                      {i > 0 && <br />}
                      {zeile}
                    </span>
                  ))}
                </p>
              </div>
              <div className="rounded-2xl border border-black/[0.06] bg-[#f9f9f7] p-8">
                <Phone className="mb-4 size-6 text-black/40" strokeWidth={1.5} />
                <h3 className="font-kanturmuy text-2xl font-normal tracking-tight">{halle.kontaktTitel}</h3>
                <p className="mt-2 text-sm font-light text-black/55">{halle.kontaktText}</p>
                <div className="mt-4 space-y-2">
                  {halle.kontaktTelefonLabel && halle.kontaktTelefonHref && (
                    <a href={`tel:${halle.kontaktTelefonHref}`} className="block text-sm text-black/70 hover:text-black">
                      {halle.kontaktTelefonLabel}
                    </a>
                  )}
                  {halle.kontaktEmail && (
                    <a href={`mailto:${halle.kontaktEmail}`} className="block text-sm text-black/70 hover:text-black">
                      {halle.kontaktEmail}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#e1fcad] px-6 py-20 md:px-12 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter text-black sm:text-4xl md:text-5xl">
                {cta.titel}
              </h2>
              <p className="mt-3 text-base font-light text-black/60">{cta.text}</p>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0">
              <a href={`tel:${cta.telefonHref}`}>
                <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                  <span className="rounded-full bg-[#122023] px-6 py-3 text-sm font-medium text-[#e1fcad] duration-500 ease-in-out group-hover:bg-black group-hover:text-white">
                    {cta.buttonLabel}
                  </span>
                  <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#122023] text-[#e1fcad] duration-500 ease-in-out group-hover:bg-black group-hover:text-white">
                    <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                    <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                  </div>
                </button>
              </a>
              <Link
                href="/"
                className="flex items-center text-sm font-light text-black/60 underline-offset-4 hover:underline"
              >
                {cta.zurueckLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
```

Notes on the two non-obvious pieces:
- The trainer photo's `alt` now comes from the **media document's** `alt` field (`"André Albert – Tennislehrer"`, seeded in Task 3) instead of a hardcoded string — same text, and it stays editable in the media library.
- The address is a textarea split on newlines and joined with `<br />`, which reproduces `Gahlener Str. 204<br />46284 Dorsten` exactly.

- [ ] **Step 3: Rebuild, capture and diff**

```bash
npm run build
npx next start -p 3111 > /tmp/htv-plan4/server.log 2>&1 &
echo $! > /tmp/htv-plan4/server.pid
curl -s --retry 20 --retry-delay 1 --retry-connrefused -o /dev/null http://localhost:3111/
/tmp/htv-plan4/visible-text.sh http://localhost:3111/training /tmp/htv-plan4/training-after.txt
diff -u /tmp/htv-plan4/training-before.txt /tmp/htv-plan4/training-after.txt && echo "IDENTICAL"
curl -s http://localhost:3111/training | grep -o 'tel:+4917559049030' | wc -l
curl -s http://localhost:3111/training | grep -o 'https://www.tennishalle-kirchhellen.com' | wc -l
curl -s http://localhost:3111/training | grep -o '%2Fapi%2Fmedia%2Ffile%2F[^"&]*' | head -n 2
kill "$(cat /tmp/htv-plan4/server.pid)"
```

Expected: `IDENTICAL`; `grep -c` counts **lines**, and the whole page is one line, so both `grep -c` calls return `1` — use `grep -o … | wc -l` instead if you want the occurrence counts: the `tel:+4917559049030` link must occur **at least 5 times** (hero, trainer profile, halle "Direkt anrufen", halle contact card, CTA — the inlined RSC payload repeats them, so the raw count is higher) and `https://www.tennishalle-kirchhellen.com` at least once. The authoritative check remains the `IDENTICAL` diff. The trainer photo must be served through `next/image` with a `%2Fapi%2Fmedia%2Ffile%2F…` source.

- [ ] **Step 4: Confirm no hardcoded training content remains and commit**

```bash
git grep -n "B-Trainer-Lizenz\|Tennishalle Kirchhellen\|Turnierbegleitung" -- app components lib
```

Expected: no matches outside `scripts/` (the seed is the only remaining copy).

```bash
npm run build
git add "app/(frontend)/training/page.tsx"
git commit -m "Read the Training page from Payload"
```

---

## Task 5: The `eisstock` global, migration and seed

**Files:**
- Create: `globals/Eisstock.ts`, `scripts/seed-eisstock.ts`
- Modify: `payload.config.ts`, `package.json`
- Generated: `migrations/<timestamp>_add_eisstock.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Consumes: `revalidateGlobalPaths` from `globals/hooks/revalidate.ts` (Task 1).
- Produces: global slug `"eisstock"` with named tabs `hero`, `angebot`, `galerie`, `buchung`; `angebot.kacheln[].icon` accepts exactly `mapPin | users | euro | calendarDays`; `buchung.widgetUrl` is the SimplyBook.me URL (consumed by Task 6). `package.json` script `seed:eisstock`.

- [ ] **Step 1: Create `globals/Eisstock.ts`**

```ts
import type { GlobalConfig } from "payload";

import { revalidateGlobalPaths } from "./hooks/revalidate";

export const Eisstock: GlobalConfig = {
  slug: "eisstock",
  label: "Eisstock (Seite)",
  admin: { group: "Seiten" },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalPaths(["/eisstock"])],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "hero",
          label: "Hero",
          fields: [
            { name: "bild", type: "upload", relationTo: "media", label: "Hintergrundbild" },
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, label: "Einleitungstext" },
            { name: "buttonLabel", type: "text", required: true, label: "Beschriftung Buchungs-Button" },
          ],
        },
        {
          name: "angebot",
          label: "Angebot",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, label: "Text rechts neben der Überschrift" },
            {
              name: "kacheln",
              type: "array",
              label: "Info-Kacheln",
              required: true,
              labels: { singular: "Kachel", plural: "Kacheln" },
              fields: [
                {
                  name: "icon",
                  type: "select",
                  required: true,
                  defaultValue: "mapPin",
                  label: "Symbol",
                  options: [
                    { label: "Ort", value: "mapPin" },
                    { label: "Personen", value: "users" },
                    { label: "Preis", value: "euro" },
                    { label: "Kalender", value: "calendarDays" },
                  ],
                },
                { name: "titel", type: "text", required: true },
                { name: "beschreibung", type: "textarea", required: true },
              ],
            },
          ],
        },
        {
          name: "galerie",
          label: "Galerie",
          fields: [
            {
              name: "bilder",
              type: "array",
              label: "Bilder",
              labels: { singular: "Bild", plural: "Bilder" },
              fields: [{ name: "bild", type: "upload", relationTo: "media", required: true }],
            },
          ],
        },
        {
          name: "buchung",
          label: "Buchung",
          fields: [
            { name: "eyebrow", type: "text", required: true, label: "Kleiner Titel" },
            { name: "titelVorne", type: "text", required: true, label: "Überschrift – erster Teil" },
            { name: "titelHighlight", type: "text", required: true, label: "Überschrift – unterstrichener Teil" },
            { name: "text", type: "textarea", required: true, label: "Text rechts neben der Überschrift" },
            {
              name: "widgetUrl",
              type: "text",
              required: true,
              defaultValue: "https://hartdertv.simplybook.it/v2/#book",
              label: "SimplyBook.me-Buchungslink",
              admin: { description: "Wird als Buchungs-Widget (iframe) eingebunden." },
            },
          ],
        },
      ],
    },
  ],
};
```

- [ ] **Step 2: Register, migrate, regenerate types**

In `payload.config.ts` add `import { Eisstock } from "./globals/Eisstock";` and extend the `globals` array to `globals: [Mitgliedschaft, Training, Eisstock],` (append if a parallel plan added entries).

```bash
npm run migrate
npm run migrate:create -- add_eisstock
npm run migrate
npm run generate:types
```

`migrate` must not prompt (if it does → STOP, report BLOCKED).

- [ ] **Step 3: Create `scripts/seed-eisstock.ts`**

```ts
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import type { Payload } from "payload";

import config from "../payload.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

async function uploadMedia(payload: Payload, relPath: string, alt: string): Promise<number> {
  const filePath = path.resolve(dirname, "..", "public", relPath.replace(/^\//, ""));
  const doc = await payload.create({
    collection: "media",
    data: { alt },
    filePath,
    context: { disableRevalidate: true },
  });
  console.log(`media uploaded: ${relPath} -> id ${doc.id}`);
  return doc.id;
}

async function run() {
  const payload = await getPayload({ config });

  // Idempotency marker: the info tiles are only ever written by this seed.
  const current = await payload.findGlobal({ slug: "eisstock", depth: 0 });
  if ((current.angebot?.kacheln?.length ?? 0) > 0) {
    console.log("skip (already seeded): eisstock");
    process.exit(0);
  }

  const heroBild = await uploadMedia(
    payload,
    "/images/änderungen/eis2.png",
    "Eisstockschießen beim Hardter TV",
  );
  const galerie1 = await uploadMedia(payload, "/images/änderungen/eis.png", "Eisstockbahn");
  const galerie2 = await uploadMedia(payload, "/images/änderungen/eis3.png", "Eisstockschießen");

  await payload.updateGlobal({
    slug: "eisstock",
    context: { disableRevalidate: true },
    data: {
      hero: {
        bild: heroBild,
        eyebrow: "Eisstockschießen",
        titelVorne: "Eisstockschießen",
        titelHighlight: "beim HTV",
        text: "Entdecke Eisstockschießen beim Hardter Tennisverein — Demo-Text: Spaß für Gruppen, Vereine und Firmenevents. Jetzt direkt online buchen.",
        buttonLabel: "Jetzt buchen",
      },
      angebot: {
        eyebrow: "Das Angebot",
        titelVorne: "Alles auf einen",
        titelHighlight: "Blick",
        text: "Demo-Text: Alle wichtigen Infos zum Eisstockschießen beim HTV.",
        kacheln: [
          { icon: "mapPin", titel: "Ort", beschreibung: "Demo-Standort, Demo-Adresse" },
          { icon: "users", titel: "Gruppengröße", beschreibung: "Demo: 6–20 Personen" },
          { icon: "euro", titel: "Preis", beschreibung: "Demo: ab X€ pro Person" },
          { icon: "calendarDays", titel: "Saison", beschreibung: "Demo: Oktober – März" },
        ],
      },
      galerie: {
        bilder: [{ bild: galerie1 }, { bild: galerie2 }],
      },
      buchung: {
        eyebrow: "Online buchen",
        titelVorne: "Wähle deinen",
        titelHighlight: "Wunschtermin",
        text: "Buche deinen Termin direkt online — schnell, einfach und ohne Telefonat.",
        widgetUrl: "https://hartdertv.simplybook.it/v2/#book",
      },
    },
  });

  console.log("seeded: eisstock");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Add to `package.json` `scripts`:

```json
"seed:eisstock": "dotenv -e .env.local -- tsx scripts/seed-eisstock.ts",
```

The placeholder strings ("Demo-Standort", "Demo: 6–20 Personen", "Demo: ab X€ pro Person", "Demo: Oktober – März", both "Demo-Text" paragraphs) are migrated **verbatim** — they are what the page shows today. They are now editable in the admin; see "Notes for the user".

- [ ] **Step 4: Run the seed and verify**

```bash
npm run seed:eisstock
```

Expected: three `media uploaded:` lines, then `seeded: eisstock`. Second run: only `skip (already seeded): eisstock`.

Throwaway Local-API check in `/tmp/htv-plan4/check-eisstock.ts` (delete afterwards):

```ts
import { getPayload } from "payload";
import config from "/Users/paulspengler/Webdesign/HardterTV/.claude/worktrees/payload-cms-foundation/hardtertv/payload.config";

const payload = await getPayload({ config });
const g = await payload.findGlobal({ slug: "eisstock", depth: 1 });
console.log("kacheln:", g.angebot.kacheln?.map((k) => `${k.icon}:${k.titel}`).join(" | "));
console.log(
  "galerie:",
  g.galerie.bilder?.map((b) => (typeof b.bild === "object" && b.bild ? `${b.bild.alt}=${b.bild.url}` : null)).join(" | "),
);
console.log("hero bild:", typeof g.hero.bild === "object" && g.hero.bild ? g.hero.bild.url : null);
console.log("widget:", g.buchung.widgetUrl);
process.exit(0);
```

Expected: `kacheln: mapPin:Ort | users:Gruppengröße | euro:Preis | calendarDays:Saison`; two gallery images with alts `Eisstockbahn` and `Eisstockschießen` and `/api/media/file/…` urls; a hero image url; `widget: https://hartdertv.simplybook.it/v2/#book`.

- [ ] **Step 5: Build and commit**

```bash
npm run build
git add globals/Eisstock.ts scripts/seed-eisstock.ts payload.config.ts package.json payload-types.ts migrations
git commit -m "Add eisstock global and seed it from the Eisstock page"
```

---

## Task 6: Rewire `/eisstock` and the booking widget

**Files:**
- Modify: `app/(frontend)/eisstock/page.tsx`, `components/ui/eis-widget.tsx`

**Interfaces:**
- Consumes: global `"eisstock"` (Task 5), `Media` from `@/payload-types`.
- Produces: `EisWidget` takes `{ url }: { url: string }` instead of reading a module-level constant.

- [ ] **Step 1: Capture the current rendering BEFORE changing anything**

```bash
npm run build
npx next start -p 3111 > /tmp/htv-plan4/server.log 2>&1 &
echo $! > /tmp/htv-plan4/server.pid
curl -s --retry 20 --retry-delay 1 --retry-connrefused -o /dev/null http://localhost:3111/
/tmp/htv-plan4/visible-text.sh http://localhost:3111/eisstock /tmp/htv-plan4/eisstock-before.txt
wc -l /tmp/htv-plan4/eisstock-before.txt
kill "$(cat /tmp/htv-plan4/server.pid)"
```

- [ ] **Step 2: Rewrite `components/ui/eis-widget.tsx`**

```tsx
"use client";

export function EisWidget({ url }: { url: string }) {
  if (!url || url.includes("DEIN-VEREIN")) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border-2 border-dashed border-[#e1fcad] bg-[#f9f9f7] p-10 text-center">
        <div>
          <p className="text-sm font-medium text-black/60">Online-Buchung coming soon</p>
          <p className="mt-1 text-xs text-black/35">
            SimplyBook.me-URL im Payload-Admin unter{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 text-[11px]">Eisstock → Buchung</code>{" "}
            eintragen
          </p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={url}
      width="100%"
      height="700"
      className="min-h-[700px] border-none"
      title="Eisstockschießen online buchen"
      sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
      allowFullScreen
    />
  );
}
```

The placeholder branch's hint text changes (it used to point at this source file, which is no longer where the URL lives). That branch is **not** rendered today (the URL is set), so it cannot affect the before/after text comparison. `"use client"` is kept so the diff stays minimal; the component has no hooks, but leaving it client-side changes nothing about the output.

- [ ] **Step 3: Rewrite `app/(frontend)/eisstock/page.tsx`**

```tsx
import { MapPin, Users, Euro, CalendarDays, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { getPayload } from "payload";
import config from "@payload-config";
import { EisWidget } from "@/components/ui/eis-widget";
import type { Media } from "@/payload-types";

export const revalidate = 3600;

const KACHEL_ICONS: Record<string, LucideIcon> = {
  mapPin: MapPin,
  users: Users,
  euro: Euro,
  calendarDays: CalendarDays,
};

function kachelIcon(key: string | null | undefined): LucideIcon {
  return KACHEL_ICONS[key ?? ""] ?? MapPin;
}

function mediaDoc(value: number | Media | null | undefined): Media | null {
  return typeof value === "object" && value ? value : null;
}

export default async function EisPage() {
  const payload = await getPayload({ config });
  const { hero, angebot, galerie, buchung } = await payload.findGlobal({
    slug: "eisstock",
    depth: 1,
  });

  const heroBild = mediaDoc(hero.bild);
  const galerieBilder = (galerie.bilder ?? [])
    .map((b) => mediaDoc(b.bild))
    .filter((m): m is Media => m !== null && Boolean(m.url));

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#122023] px-6 py-24 md:px-12 lg:px-20 lg:py-36">
        {heroBild?.url && (
          <Image src={heroBild.url} alt="" fill className="object-cover opacity-30" priority />
        )}

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-white/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">{hero.eyebrow}</span>
          </div>

          <h1 className="font-kanturmuy max-w-3xl text-4xl font-normal tracking-tighter text-white sm:text-5xl md:text-7xl">
            {hero.titelVorne}{" "}
            <span className="relative inline-block">
              {hero.titelHighlight}
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light text-white/60 md:text-lg">{hero.text}</p>

          <div className="mt-10">
            <a href="#buchen">
              <button className="group flex cursor-pointer items-center gap-0 rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none">
                <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-white group-hover:text-black">
                  {hero.buttonLabel}
                </span>
                <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover:bg-white group-hover:text-black">
                  <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                  <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                </div>
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Info-Kacheln */}
      <section className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-black/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-black/50">{angebot.eyebrow}</span>
          </div>

          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="font-kanturmuy max-w-xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              {angebot.titelVorne}{" "}
              <span className="relative inline-block">
                {angebot.titelHighlight}
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
            <p className="max-w-sm text-base font-light text-black/50">{angebot.text}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(angebot.kacheln ?? []).map((item) => {
              const Icon = kachelIcon(item.icon);
              return (
                <div
                  key={item.titel}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-6 transition-shadow duration-300 hover:shadow-lg"
                >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[#e1fcad]">
                    <Icon className="size-5 text-black" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-kanturmuy text-xl font-normal tracking-tight text-black">
                    {item.titel}
                  </h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-black/55">
                    {item.beschreibung}
                  </p>
                  <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Galerie */}
      <section className="bg-white px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {galerieBilder.map((bild) => (
              <div key={bild.id} className="relative h-72 overflow-hidden rounded-2xl sm:h-96">
                <Image
                  src={bild.url as string}
                  alt={bild.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buchungs-Widget */}
      <section id="buchen" className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-black/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-black/50">{buchung.eyebrow}</span>
          </div>

          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="font-kanturmuy max-w-xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
              {buchung.titelVorne}{" "}
              <span className="relative inline-block">
                {buchung.titelHighlight}
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
            <p className="max-w-sm text-base font-light text-black/50">{buchung.text}</p>
          </div>

          <EisWidget url={buchung.widgetUrl} />
        </div>
      </section>
    </main>
  );
}
```

The hero image keeps `alt=""` in code: it is decorative background art at `opacity-30`, exactly as today. The gallery images take their `alt` from the media documents (`Eisstockbahn`, `Eisstockschießen` — the same strings as before).

- [ ] **Step 4: Rebuild, capture and diff**

```bash
npm run build
npx next start -p 3111 > /tmp/htv-plan4/server.log 2>&1 &
echo $! > /tmp/htv-plan4/server.pid
curl -s --retry 20 --retry-delay 1 --retry-connrefused -o /dev/null http://localhost:3111/
/tmp/htv-plan4/visible-text.sh http://localhost:3111/eisstock /tmp/htv-plan4/eisstock-after.txt
diff -u /tmp/htv-plan4/eisstock-before.txt /tmp/htv-plan4/eisstock-after.txt && echo "IDENTICAL"
curl -s http://localhost:3111/eisstock | grep -c 'https://hartdertv.simplybook.it/v2/#book'
curl -s http://localhost:3111/eisstock | grep -o '%2Fapi%2Fmedia%2Ffile%2F[^"&]*' | sort -u | wc -l
kill "$(cat /tmp/htv-plan4/server.pid)"
```

Expected: `IDENTICAL`; at least `1` occurrence of the SimplyBook URL (iframe `src`); `3` distinct media files (hero + two gallery images).

- [ ] **Step 5: Confirm nothing is left hardcoded, clean up scratch files, commit**

```bash
git grep -n "Demo-Standort\|simplybook\|Eisstockbahn" -- app components lib
git status --short
```

Expected: the only matches are in `scripts/seed-eisstock.ts`; `git status --short` shows exactly `app/(frontend)/eisstock/page.tsx` and `components/ui/eis-widget.tsx` as modified and no untracked files inside the repo (all throwaway scripts live in `/tmp/htv-plan4/`).

```bash
npm run build
git add "app/(frontend)/eisstock/page.tsx" components/ui/eis-widget.tsx
git commit -m "Read the Eisstock page from Payload"
rm -rf /tmp/htv-plan4
```

---

## What This Plan Deliberately Does Not Cover

- **Galerie, News, Rechtsseiten** (`gallery-albums`, `news`, `legal-pages`) — separate, concurrent plan.
- **Startseiten-Bereiche** (`hero`, `welcome-section`, `location-section`, `footer`) and the **contact form** (`contact-submissions` + Server Action) — separate, concurrent plan.
- **Editor roles / `role` field on `users`** — the spec's `admin`/`editor` split is untouched here; these globals use Payload's default authenticated `update` access.
- **Rewriting the placeholder Eisstock copy** with real content — the demo strings are migrated as-is so the club can edit them in the admin.
- **Rich text (Lexical)** anywhere on these three pages — none of the copy needs inline formatting.
- **The Vercel deployment** (preview + production alias) of this phase — done by the controller after the final review, not by a task here.

---

## Notes for the user

- **Eisstock is still placeholder content.** "Demo-Standort, Demo-Adresse", "Demo: 6–20 Personen", "Demo: ab X€ pro Person", "Demo: Oktober – März" and both "Demo-Text" paragraphs were migrated **unchanged** — they are what the live page shows today. They are now editable under *Seiten → Eisstock* in the admin and should be replaced with the real location, group size, price and season before anyone links to the page.
- **The SimplyBook.me booking link** (`https://hartdertv.simplybook.it/v2/#book`) is now an editable field (*Eisstock → Buchung*). Note the domain spells the club "hartdertv" (r before t) — if that subdomain is wrong, the booking iframe stays empty; worth checking once in a browser.
- **A phone-number typo survives verbatim.** On `/mitgliedschaft` the displayed number is `0172 25 80 209` but the underlying link is `tel:+4917225802099` — one digit too many. Both were kept exactly as they are, in two separate fields (`cta.telefonLabel` for the display, `cta.telefonHref` for the link), so you can fix the link without touching the display. Most likely correct: `+491722580209`.
- **`public/schnuppercard.pdf` is unused.** The Mitgliedschaft page links only `HTV-SchnupperCard-Antrag 2026.pdf`; the older `schnuppercard.pdf` is not referenced anywhere and is therefore not imported into Payload. It can be deleted from `public/` once you are sure it is obsolete.
- **PDFs now live in Payload/Vercel Blob**, not in `public/`. The old files stay in `public/` (nothing references them any more after this plan, except the seed script that imported them once). Replacing a document is now an admin upload — no deploy needed.
- **The trainer's e-mail contact** appears only in the Tennishalle "Kontakt" box (`1.vorsitzender@hardt-tennis.de`); the trainer profile block itself has only the phone number. Both were preserved exactly as they are today. The hall contact e-mail is an optional field — clear it in the admin if it should no longer point at the 1. Vorsitzender.
- **Two dead CSS classes were dropped** while unifying the three document cards on `/mitgliedschaft` (`group/btn` with no matching `group-hover/btn:` rule, and an inert `space-y-3` difference). Visual output is unchanged, verified by an exact text diff of the rendered page.
- **Editability rule used:** all visible copy, labels, numbers, phone/e-mail/PDF/external-link targets are fields; CSS, section order, page anchors (`#buchen`), internal route targets (`/`) and decorative one-off icons stay in code. Icons inside repeatable cards are stored as a key from a fixed list (`users`, `star`, `fileText` for documents; `userCheck`, `users`, `trophy`, `dumbbell`, `star`, `calendar` for training offers; `mapPin`, `users`, `euro`, `calendarDays` for Eisstock tiles) — adding a new icon option needs a one-line code change in both the global and the page.
