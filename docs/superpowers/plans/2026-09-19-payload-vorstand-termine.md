# Vorstand + Termine (Kalender) in Payload — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the board members (Vorstand) and events (Termine/Kalender) into Payload and merge the currently duplicated/diverging data sets into one source each: `board-members` (feeds `/vorstand` and the homepage's 3 featured members) and `events` (feeds the homepage's "Kommende Termine" and the `/kalender` page).

**Architecture:** Two new Payload collections with migrations, seeded once from the existing hardcoded data (using the user's latest uncommitted edits, already carried into this branch). Frontend server components read via the Payload Local API and pass plain props to the existing (mostly client) UI components, which keep their markup. Edits in the admin revalidate the affected pages. The homepage and calendar additionally use time-based revalidation so "upcoming events" rolls over as dates pass.

**Tech Stack:** Payload 3.89 (`@payloadcms/db-postgres` on Neon), Next.js 16 App Router, TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-17-payload-cms-migration-design.md`
**Builds on:** `docs/superpowers/plans/2026-09-17-payload-foundation-teams.md` (done; branch `worktree-payload-cms-foundation`). The collection pattern to follow is `hardtertv/collections/Teams.ts`.

## Global Constraints

- All paths below are relative to the Next.js project root `hardtertv/` unless stated otherwise. Run all commands from `hardtertv/`.
- **Never run `next dev` (or `npm run dev`) in this plan.** The Neon database is shared and real; `next dev` pushes schema changes directly into it and leaves a stale `dev` row in `payload_migrations` that makes `payload migrate` hang in CI (a real incident in the previous plan). Verify with `npm run build` + `npm run start` (background) + `curl` instead. Order for every new collection: add collection → `npm run migrate:create -- <name>` → `npm run migrate` → only then anything that boots Payload.
- Migrations: `npm run migrate:create -- <name>` then `npm run migrate` (scripts load `.env.local` via dotenv-cli; never print, read or commit `.env.local`).
- Publish workflow: immediate/live on save; no `versions`/drafts.
- Access: `read: () => true` on the new collections (public site content, same as `teams`); create/update/delete keep Payload's default (authenticated users). Users collection access is already locked down — do not touch it.
- Revalidation: every new collection revalidates the pages it feeds after change/delete, guarded by `req.context?.disableRevalidate` (seed scripts must pass `context: { disableRevalidate: true }` — `revalidatePath` throws outside a Next request).
- Images come from `public/images/...`: seed scripts upload them to Payload `media` (stored in Vercel Blob) with `payload.create({ collection: "media", data: { alt }, filePath })`. The resulting `url` is a relative `/api/media/file/<name>` and works with `next/image` as-is (proven for teams).
- Keep the existing UI markup/classes; only change where data comes from. No new test framework; verification = build, `next start` + curl, plus Local-API checks.
- Node: the system Node works (`"type": "module"` is set). Commit with targeted `git add` (never `git add -A`; `.env.local` must never be staged). New commits, no amends.
- Known data facts the seeds must honor: real team/member/event data comes from the files as they are in the branch now (they include the user's latest edits). The homepage `vorstand-section.tsx` has phone numbers for Hendrick Büncker and Marco Hohenstein that `/vorstand` lacks — the unified record uses the union (phone from the homepage version). Udo Kahlert's e-mail in the source equals Anni Holzmann's (`annikaholzmann@gmx.de`, likely a copy-paste slip in the source) — seed it as-is and mention it in your report; do not silently "fix" it.
- Today's date is 2026-09-19. All three homepage events in the source (Aug/Sep 2026) are already in the past, so the "upcoming" list will be empty until editors add new events — the UI needs a friendly empty state (Task 4).

---

## File Structure

```
hardtertv/
  lib/
    vorstand-gruppen.ts            # new — the 5 fixed groups: value, titel, beschreibung, order
    events.ts                      # new — date helpers/formatters for events (UTC-safe)
  collections/
    hooks/revalidate.ts            # new — shared afterChange/afterDelete revalidation factories
    BoardMembers.ts                # new
    Events.ts                      # new
  scripts/
    seed-board-members.ts          # new — one-time, idempotent, self-contained data
    seed-events.ts                 # new — one-time, idempotent, self-contained data
  migrations/                      # +2 generated migrations
  payload.config.ts                # modified — register BoardMembers, Events
  package.json                     # modified — seed:board-members, seed:events scripts
  payload-types.ts                 # regenerated
  components/ui/
    vorstand-section.tsx           # modified — data via props
    termine-section.tsx            # modified — data via props + empty state
  app/(frontend)/
    page.tsx                       # modified — async server component, fetches board + events, revalidate 3600
    vorstand/page.tsx              # modified — reads board-members
    kalender/page.tsx              # modified — fetches events, revalidate 3600
    kalender/kalender-client.tsx   # modified — events via props, multi-day support
```

---

### Task 1: `board-members` collection, migration and seed

**Files:**
- Create: `lib/vorstand-gruppen.ts`, `collections/hooks/revalidate.ts`, `collections/BoardMembers.ts`, `scripts/seed-board-members.ts`
- Modify: `payload.config.ts`, `package.json`
- Generated: `migrations/<timestamp>_add_board_members.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Produces (used by Tasks 3): collection slug `"board-members"`; fields `name` (text, required), `titel` (text, required), `gruppe` (select: `fuehrung | finanzen | sport | events | technik`, required), `reihenfolge` (number, required — global running order, lower first), `emails` (array of `{ email: string }`), `telefon` (text), `foto` (upload → `media`), `featured` (checkbox, default false). `lib/vorstand-gruppen.ts` exports `VORSTAND_GRUPPEN: { value: GruppeValue; titel: string; beschreibung: string }[]` (fixed display order) and `type GruppeValue`. `collections/hooks/revalidate.ts` exports `revalidatePathsAfterChange(paths: string[])` and `revalidatePathsAfterDelete(paths: string[])`, reused by Task 2.

- [ ] **Step 1: Create `lib/vorstand-gruppen.ts`**

```ts
export const VORSTAND_GRUPPEN = [
  {
    value: "fuehrung",
    titel: "Führung",
    beschreibung: "Der geschäftsführende Vorstand leitet den Verein und vertritt ihn nach außen.",
  },
  {
    value: "finanzen",
    titel: "Finanzen & Verwaltung",
    beschreibung: "Sie kümmern sich um Finanzen, Organisation und das Vereinsheim.",
  },
  {
    value: "sport",
    titel: "Sport",
    beschreibung: "Die Sportwarte organisieren den Spielbetrieb und koordinieren unsere Mannschaften.",
  },
  {
    value: "events",
    titel: "Events & Kommunikation",
    beschreibung: "Sie gestalten das Vereinsleben, organisieren Events und pflegen die Kommunikation.",
  },
  {
    value: "technik",
    titel: "Technik & Platz",
    beschreibung: "Sie sorgen für die technische Infrastruktur und gepflegte Anlagen.",
  },
] as const;

export type GruppeValue = (typeof VORSTAND_GRUPPEN)[number]["value"];
```

- [ ] **Step 2: Create `collections/hooks/revalidate.ts`**

```ts
import { revalidatePath } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";

export const revalidatePathsAfterChange =
  (paths: string[]): CollectionAfterChangeHook =>
  ({ doc, req }) => {
    if (req.context?.disableRevalidate) return doc;
    for (const path of paths) revalidatePath(path);
    return doc;
  };

export const revalidatePathsAfterDelete =
  (paths: string[]): CollectionAfterDeleteHook =>
  ({ doc, req }) => {
    if (req.context?.disableRevalidate) return doc;
    for (const path of paths) revalidatePath(path);
    return doc;
  };
```

- [ ] **Step 3: Create `collections/BoardMembers.ts`**

```ts
import type { CollectionConfig } from "payload";

import { VORSTAND_GRUPPEN } from "../lib/vorstand-gruppen";
import { revalidatePathsAfterChange, revalidatePathsAfterDelete } from "./hooks/revalidate";

const PATHS = ["/vorstand", "/"];

export const BoardMembers: CollectionConfig = {
  slug: "board-members",
  labels: { singular: "Vorstandsmitglied", plural: "Vorstand" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "titel", "gruppe", "featured", "reihenfolge"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidatePathsAfterChange(PATHS)],
    afterDelete: [revalidatePathsAfterDelete(PATHS)],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "titel", type: "text", required: true, label: "Funktion (z.B. 1. Vorsitzender)" },
    {
      name: "gruppe",
      type: "select",
      required: true,
      options: VORSTAND_GRUPPEN.map((g) => ({ label: g.titel, value: g.value })),
    },
    {
      name: "reihenfolge",
      type: "number",
      required: true,
      defaultValue: 1000,
      label: "Reihenfolge (kleiner = weiter vorne)",
      admin: { description: "Bestimmt die Reihenfolge innerhalb der Gruppe und auf der Startseite." },
    },
    {
      name: "emails",
      type: "array",
      label: "E-Mail-Adressen",
      fields: [{ name: "email", type: "email", required: true }],
    },
    { name: "telefon", type: "text" },
    { name: "foto", type: "upload", relationTo: "media" },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      label: "Auf der Startseite zeigen",
      admin: { description: "Die ersten 3 Markierten (nach Reihenfolge) erscheinen auf der Startseite." },
    },
  ],
};
```

- [ ] **Step 4: Register in `payload.config.ts` and create + run the migration (before anything boots Payload with the new config against the DB)**

In `payload.config.ts` add `import { BoardMembers } from "./collections/BoardMembers";` and change `collections: [Users, Media, Teams]` to `collections: [Users, Media, Teams, BoardMembers]`. Then:

```bash
npm run migrate:create -- add_board_members
npm run migrate
npm run generate:types
```

Expected: a new `migrations/*_add_board_members.ts/.json` (creates `board_members` and `board_members_emails` tables + enum), `migrations/index.ts` updated, `payload-types.ts` gains `BoardMember`. `migrate` must not prompt (if it prompts about "dev mode", stop and report BLOCKED — do not answer it).

- [ ] **Step 5: Create the seed script `scripts/seed-board-members.ts`** (self-contained data, idempotent by `name`)

```ts
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

import config from "../payload.config";
import type { GruppeValue } from "../lib/vorstand-gruppen";

const dirname = path.dirname(fileURLToPath(import.meta.url));

type Seed = {
  name: string;
  titel: string;
  gruppe: GruppeValue;
  emails?: string[];
  telefon?: string;
  bild?: string;
  featured?: boolean;
};

const MEMBERS: Seed[] = [
  { name: "Oliver Wiegand", titel: "1. Vorsitzender", gruppe: "fuehrung", emails: ["1.vorsitzender@hardt-tennis.de"], telefon: "0172 25 80 209", bild: "/images/änderungen/oliver-wiegand.png", featured: true },
  { name: "Volker Schuhmacher", titel: "2. Vorsitzender", gruppe: "fuehrung", telefon: "0160 99 78 94 11", bild: "/images/änderungen/volker-schuhmacher.png" },
  { name: "Hendrick Büncker", titel: "1. Geschäftsführer", gruppe: "fuehrung", telefon: "0151 741 04 202", bild: "/images/änderungen/handrick-bünker.png", featured: true },
  { name: "Holger Arlt", titel: "2. Geschäftsführer", gruppe: "fuehrung", emails: ["woodworm4u@gmail.com"], telefon: "0151 70 09 01 37", bild: "/images/änderungen/holger-arlt.png" },
  { name: "Marco Hohenstein", titel: "Schatzmeister", gruppe: "finanzen", emails: ["schatzmeister@hardt-tennis.de"], telefon: "0176 666 46 288", bild: "/images/änderungen/marco-hohenstein.png", featured: true },
  { name: "Anni Holzmann", titel: "Breitensport- & Clubheimwartin", gruppe: "finanzen", emails: ["annikaholzmann@gmx.de"], bild: "/images/änderungen/anni-holzmann.png" },
  { name: "Tanja Wiegand", titel: "1. Sportwartin", gruppe: "sport", emails: ["1.sportwart@hardt-tennis.de"], bild: "/images/änderungen/tanja-wiegand.png" },
  { name: "Rainer Pieper", titel: "2. Sportwart", gruppe: "sport", bild: "/images/änderungen/rainer-pieper.png" },
  { name: "Tabea Wiegand", titel: "Event & Kommunikationswartin", gruppe: "events", emails: ["tabea.wiegand.tw@gmail.com", "event.HTV@gmail.com"], bild: "/images/änderungen/tabea-wiegand.png" },
  { name: "Valentin Trapp", titel: "Eventmanager", gruppe: "events", emails: ["v.trapp1407@gmail.com", "event.HTV@gmail.com"], bild: "/images/änderungen/valentin-trapp1.png" },
  { name: "Udo Kahlert", titel: "Technikwart", gruppe: "technik", emails: ["annikaholzmann@gmx.de"], bild: "/images/änderungen/udo-kahlert.png" },
  { name: "Jürgen Mertens", titel: "Platzwart", gruppe: "technik", emails: ["juergenmertens62tennis@web.de"], bild: "/images/Jürgen Mertens_1.jpg" },
];

async function run() {
  const payload = await getPayload({ config });

  for (const [index, m] of MEMBERS.entries()) {
    const existing = await payload.find({
      collection: "board-members",
      where: { name: { equals: m.name } },
      limit: 1,
      depth: 0,
    });
    if (existing.docs.length > 0) {
      console.log(`skip (already exists): ${m.name}`);
      continue;
    }

    let fotoId: number | undefined;
    if (m.bild) {
      const filePath = path.resolve(dirname, "..", "public", m.bild.replace(/^\//, ""));
      const media = await payload.create({
        collection: "media",
        data: { alt: m.name },
        filePath,
        context: { disableRevalidate: true },
      });
      fotoId = media.id;
    }

    await payload.create({
      collection: "board-members",
      data: {
        name: m.name,
        titel: m.titel,
        gruppe: m.gruppe,
        reihenfolge: (index + 1) * 10,
        emails: (m.emails ?? []).map((email) => ({ email })),
        telefon: m.telefon,
        foto: fotoId,
        featured: m.featured ?? false,
      },
      context: { disableRevalidate: true },
    });
    console.log(`created: ${m.name}`);
  }

  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Add to `package.json` scripts: `"seed:board-members": "dotenv -e .env.local -- tsx scripts/seed-board-members.ts"`.

- [ ] **Step 6: Run the seed and verify** — `npm run seed:board-members`. Expected: 12 `created:` lines then `done`. Re-run once: 12 `skip` lines (idempotent). Verify via a throwaway Local-API check (delete the script afterwards, don't commit it): exactly 12 members; exactly 3 with `featured: true` (Oliver Wiegand, Hendrick Büncker, Marco Hohenstein); every member has a `foto` (12/12); Tabea Wiegand has 2 emails; `reihenfolge` runs 10…120 in the order above.

- [ ] **Step 7: Build and commit**

```bash
npm run build
git add lib/vorstand-gruppen.ts collections/hooks/revalidate.ts collections/BoardMembers.ts scripts/seed-board-members.ts payload.config.ts package.json payload-types.ts migrations
git commit -m "Add board-members collection and seed it from the Vorstand data"
```

---

### Task 2: `events` collection, date helpers, migration and seed

**Files:**
- Create: `lib/events.ts`, `collections/Events.ts`, `scripts/seed-events.ts`
- Modify: `payload.config.ts`, `package.json`
- Generated: `migrations/<timestamp>_add_events.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Consumes: `revalidatePathsAfterChange/Delete` from `collections/hooks/revalidate.ts` (Task 1).
- Produces (used by Task 4): collection slug `"events"`; fields `titel` (text, required), `datum` (date, required, day only), `datumEnde` (date, optional), `uhrzeit` (text, optional), `ort` (text, optional), `kategorie` (select `Training | Turnier | Sonstiges`, required), `beschreibung` (text, optional). `lib/events.ts` exports `toIsoDay(value: string): string` (first 10 chars, i.e. `YYYY-MM-DD`), `startOfTodayIso(now?: Date): string`, and `formatTerminDatum(datum: string, datumEnde?: string | null): { datum: string; tag: string }` producing the homepage strings, e.g. `("2026-08-08", "2026-08-09")` → `{ datum: "08./09. Aug.", tag: "Sa/So" }` and `("2026-08-15", null)` → `{ datum: "15. Aug.", tag: "Sa" }`.

- [ ] **Step 1: Create `lib/events.ts`** (UTC-safe: Payload stores day-only dates at 12:00 UTC)

```ts
const MONATE = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."];
const WOCHENTAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

export function toIsoDay(value: string): string {
  return value.slice(0, 10);
}

export function startOfTodayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}T00:00:00.000Z`;
}

function parts(iso: string) {
  const day = toIsoDay(iso);
  const date = new Date(`${day}T12:00:00.000Z`);
  return {
    tag: String(date.getUTCDate()).padStart(2, "0"),
    monat: MONATE[date.getUTCMonth()],
    wochentag: WOCHENTAGE[date.getUTCDay()],
  };
}

export function formatTerminDatum(datum: string, datumEnde?: string | null) {
  const start = parts(datum);
  if (datumEnde && toIsoDay(datumEnde) !== toIsoDay(datum)) {
    const ende = parts(datumEnde);
    return {
      datum: `${start.tag}./${ende.tag}. ${ende.monat}`,
      tag: `${start.wochentag}/${ende.wochentag}`,
    };
  }
  return { datum: `${Number(start.tag)}. ${start.monat}`, tag: start.wochentag };
}
```

Note: single-day format has no leading zero (`"15. Aug."`), multi-day keeps the source's two-digit style (`"08./09. Aug."`), matching the current homepage strings exactly. `startOfTodayIso` uses the local calendar day so that events of "today" still count as upcoming.

- [ ] **Step 2: Create `collections/Events.ts`**

```ts
import type { CollectionConfig } from "payload";

import { revalidatePathsAfterChange, revalidatePathsAfterDelete } from "./hooks/revalidate";

const PATHS = ["/kalender", "/"];

export const Events: CollectionConfig = {
  slug: "events",
  labels: { singular: "Termin", plural: "Termine" },
  admin: {
    useAsTitle: "titel",
    defaultColumns: ["titel", "datum", "kategorie", "ort"],
  },
  defaultSort: "-datum",
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidatePathsAfterChange(PATHS)],
    afterDelete: [revalidatePathsAfterDelete(PATHS)],
  },
  fields: [
    { name: "titel", type: "text", required: true },
    {
      name: "datum",
      type: "date",
      required: true,
      label: "Datum (Beginn)",
      admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } },
    },
    {
      name: "datumEnde",
      type: "date",
      label: "Datum (Ende, nur bei mehrtägigen Terminen)",
      admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } },
    },
    { name: "uhrzeit", type: "text", admin: { description: 'z.B. "10:00" oder "Ganztägig"' } },
    { name: "ort", type: "text" },
    {
      name: "kategorie",
      type: "select",
      required: true,
      defaultValue: "Sonstiges",
      options: [
        { label: "Training", value: "Training" },
        { label: "Turnier", value: "Turnier" },
        { label: "Sonstiges", value: "Sonstiges" },
      ],
    },
    { name: "beschreibung", type: "text" },
  ],
};
```

- [ ] **Step 3: Register, migrate, types** — in `payload.config.ts` add `import { Events } from "./collections/Events";` and extend `collections` to `[Users, Media, Teams, BoardMembers, Events]`. Then:

```bash
npm run migrate:create -- add_events
npm run migrate
npm run generate:types
```

`migrate` must not prompt (if it does: stop, report BLOCKED).

- [ ] **Step 4: Create `scripts/seed-events.ts`** (self-contained, idempotent by `titel` + `datum`)

```ts
import { getPayload } from "payload";

import config from "../payload.config";

type Kategorie = "Training" | "Turnier" | "Sonstiges";
type Seed = {
  titel: string;
  datum: string;
  datumEnde?: string;
  uhrzeit?: string;
  ort?: string;
  kategorie: Kategorie;
  beschreibung?: string;
};

const ORT = "Gahlener Str. 204, Dorsten";

const EVENTS: Seed[] = [
  // Startseite (2026)
  { titel: "LK-Turnier LK 20-25", datum: "2026-08-08", datumEnde: "2026-08-09", uhrzeit: "Ganztägig", ort: ORT, kategorie: "Turnier" },
  { titel: "2. HTV-Tennis Beer Pong Turnier", datum: "2026-08-15", uhrzeit: "noch offen", ort: ORT, kategorie: "Turnier" },
  { titel: "Mixed- und Doppelstadtmeisterschaften", datum: "2026-09-12", datumEnde: "2026-09-13", uhrzeit: "Ganztägig", ort: ORT, kategorie: "Turnier" },
  // Kalender (2025)
  { titel: "Frühjahrinstandsetzung", datum: "2025-04-12", uhrzeit: "10:00", ort: ORT, kategorie: "Sonstiges" },
  { titel: "Saisoneröffnung", datum: "2025-04-26", uhrzeit: "14:00", ort: ORT, kategorie: "Sonstiges" },
  { titel: "LK-Turnier LK 20 – 25", datum: "2025-06-08", ort: ORT, kategorie: "Turnier", beschreibung: "Ganztägig" },
  { titel: "1. HTV-Tennis Beer Pong Turnier", datum: "2025-07-12", uhrzeit: "11:00", ort: ORT, kategorie: "Turnier" },
  { titel: "LK-Turnier LK 20 – 25", datum: "2025-07-13", ort: ORT, kategorie: "Turnier", beschreibung: "Ganztägig" },
  { titel: "Stadtmeisterschaften der Senioren", datum: "2025-09-01", ort: ORT, kategorie: "Turnier", beschreibung: "Mehrtägiges Turnier" },
  { titel: "Doppel-/Mixed Stadtmeisterschaften", datum: "2025-09-20", ort: "TV Feldmark", kategorie: "Turnier", beschreibung: "Mehrtägiges Turnier" },
];

const noon = (day: string) => `${day}T12:00:00.000Z`;

async function run() {
  const payload = await getPayload({ config });

  for (const e of EVENTS) {
    const existing = await payload.find({
      collection: "events",
      where: { and: [{ titel: { equals: e.titel } }, { datum: { equals: noon(e.datum) } }] },
      limit: 1,
      depth: 0,
    });
    if (existing.docs.length > 0) {
      console.log(`skip (already exists): ${e.datum} ${e.titel}`);
      continue;
    }
    await payload.create({
      collection: "events",
      data: {
        titel: e.titel,
        datum: noon(e.datum),
        datumEnde: e.datumEnde ? noon(e.datumEnde) : undefined,
        uhrzeit: e.uhrzeit,
        ort: e.ort,
        kategorie: e.kategorie,
        beschreibung: e.beschreibung,
      },
      context: { disableRevalidate: true },
    });
    console.log(`created: ${e.datum} ${e.titel}`);
  }

  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Add `"seed:events": "dotenv -e .env.local -- tsx scripts/seed-events.ts"` to `package.json` scripts.

- [ ] **Step 5: Run + verify** — `npm run seed:events` → 10 `created:` lines then `done`; re-run → 10 `skip`. Throwaway Local-API check (don't commit): 10 events; the 2026-08-08 event has `datumEnde` on 2026-08-09; querying `datum >= 2026-01-01T00:00:00.000Z` returns exactly the 3 events of 2026; also add a tiny throwaway check that `formatTerminDatum("2026-08-08T12:00:00.000Z","2026-08-09T12:00:00.000Z")` returns `{ datum: "08./09. Aug.", tag: "Sa/So" }`, `formatTerminDatum("2026-08-15T12:00:00.000Z", null)` returns `{ datum: "15. Aug.", tag: "Sa" }`, and `("2026-09-12…","2026-09-13…")` → `{ datum: "12./13. Sep.", tag: "Sa/So" }` (run it with `npx tsx`).

- [ ] **Step 6: Build and commit**

```bash
npm run build
git add lib/events.ts collections/Events.ts scripts/seed-events.ts payload.config.ts package.json payload-types.ts migrations
git commit -m "Add events collection (Termine/Kalender) and seed it"
```

---

### Task 3: Rewire `/vorstand` and the homepage Vorstand section

**Files:**
- Modify: `app/(frontend)/vorstand/page.tsx`, `components/ui/vorstand-section.tsx`, `app/(frontend)/page.tsx`

**Interfaces:**
- Consumes: `board-members` (Task 1), `VORSTAND_GRUPPEN` from `lib/vorstand-gruppen.ts`.
- Produces: `VorstandSection` takes prop `vorstand: { name: string; titel: string; email: string; telefon: string; bild: string | null }[]` (`email` = first address or `""`); `Home` becomes an async server component (Task 4 extends it).

- [ ] **Step 1: `/vorstand` page** — in `app/(frontend)/vorstand/page.tsx` remove the `Person` type and the `gruppen` constant; add a data function and make the page async. The `VorstandCard` markup stays; it now takes `bild: string | null` (render the `<Image>` only when non-null, otherwise a plain grey block of the same size) and `email` as `string[]`:

```tsx
import { getPayload } from "payload";
import config from "@payload-config";
import { VORSTAND_GRUPPEN } from "@/lib/vorstand-gruppen";

export const revalidate = 3600;

type Person = {
  name: string;
  titel: string;
  email: string[];
  telefon?: string;
  bild: string | null;
};

async function getGruppen() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "board-members",
    depth: 1,
    limit: 200,
    sort: "reihenfolge",
  });

  return VORSTAND_GRUPPEN.map((g) => ({
    titel: g.titel,
    beschreibung: g.beschreibung,
    mitglieder: docs
      .filter((d) => d.gruppe === g.value)
      .map(
        (d): Person => ({
          name: d.name,
          titel: d.titel,
          email: (d.emails ?? []).map((e) => e.email),
          telefon: d.telefon ?? undefined,
          bild: typeof d.foto === "object" && d.foto ? d.foto.url ?? null : null,
        }),
      ),
  })).filter((g) => g.mitglieder.length > 0);
}
```

Then `export default async function VorstandPage() { const gruppen = await getGruppen(); const total = ...` (same body as before). In `VorstandCard`, replace `const emails = ...` with `const emails = person.email;` and guard the image: `{person.bild ? <Image ... src={person.bild} .../> : <div className="h-full w-full bg-black/[0.04]" />}`.

- [ ] **Step 2: `VorstandSection`** — in `components/ui/vorstand-section.tsx` delete the hardcoded `vorstand` array, define `type VorstandItem = { name: string; titel: string; email: string; telefon: string; bild: string | null }`, change the signature to `export default function VorstandSection({ vorstand }: { vorstand: VorstandItem[] })`, change `VorstandCard`'s prop type to `VorstandItem` and guard the `<Image>` on `person.bild` the same way (grey placeholder otherwise). Markup/classes otherwise unchanged.

- [ ] **Step 3: Homepage** — turn `app/(frontend)/page.tsx` into an async server component:

```tsx
import { getPayload } from "payload";
import config from "@payload-config";
// ...existing imports unchanged...

export const revalidate = 3600;

async function getVorstand() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "board-members",
    where: { featured: { equals: true } },
    depth: 1,
    limit: 3,
    sort: "reihenfolge",
  });
  return docs.map((d) => ({
    name: d.name,
    titel: d.titel,
    email: d.emails?.[0]?.email ?? "",
    telefon: d.telefon ?? "",
    bild: typeof d.foto === "object" && d.foto ? d.foto.url ?? null : null,
  }));
}

export default async function Home() {
  const vorstand = await getVorstand();
  return (
    <main>
      {/* ...same sections as before, but: */}
      <VorstandSection vorstand={vorstand} />
      {/* ... */}
    </main>
  );
}
```

- [ ] **Step 4: Verify** — `npm run build` must pass. Then `npm run start` in the background and use `curl -s`: `/vorstand` contains all 12 names, the group headings "Führung", "Finanzen & Verwaltung", "Sport", "Events & Kommunikation", "Technik & Platz", both of Tabea Wiegand's mails, `total` badge "12 Mitglieder", and `<img` tags whose `src` contains `%2Fapi%2Fmedia%2Ffile%2F`; `/` contains exactly the three names Oliver Wiegand, Hendrick Büncker, Marco Hohenstein in that order within the Vorstand section and `mailto:1.vorsitzender@hardt-tennis.de`. Stop the server. Also confirm `git grep -n "Oliver Wiegand" -- app components lib` shows no remaining hardcoded member data outside `scripts/`.

- [ ] **Step 5: Commit**

```bash
git add "app/(frontend)/vorstand/page.tsx" components/ui/vorstand-section.tsx "app/(frontend)/page.tsx"
git commit -m "Read Vorstand page and homepage Vorstand section from Payload"
```

---

### Task 4: Rewire the homepage Termine and the Kalender

**Files:**
- Modify: `components/ui/termine-section.tsx`, `app/(frontend)/page.tsx`, `app/(frontend)/kalender/page.tsx`, `app/(frontend)/kalender/kalender-client.tsx`

**Interfaces:**
- Consumes: `events` (Task 2), `formatTerminDatum`, `toIsoDay`, `startOfTodayIso` from `lib/events.ts`.
- Produces: `TermineSection` takes `termine: { datum: string; tag: string; veranstaltung: string; uhrzeit: string; ort: string; kategorie: string }[]`; `KalenderClient` takes `events: Event[]` (shape below).

- [ ] **Step 1: `TermineSection`** — in `components/ui/termine-section.tsx` remove the hardcoded `termine` array; type it: `type Termin = { datum: string; tag: string; veranstaltung: string; uhrzeit: string; ort: string; kategorie: string }`; signature `export default function TermineSection({ termine }: { termine: Termin[] })`; `TerminCard`'s prop type becomes `Termin` (the component keeps splitting `datum` exactly as it does today — the formatter delivers strings in the same format). When `termine.length === 0` render, instead of the grid, a single muted card in the same grid area: `<p className="rounded-2xl border border-black/[0.07] bg-white p-6 text-sm text-black/50 md:col-span-2">Aktuell sind keine Termine geplant — schau bald wieder vorbei oder wirf einen Blick in den <Link href="/kalender" className="underline">Kalender</Link>.</p>`. Also replace the hardcoded eyebrow "Veranstaltungen 2026" with the current year computed at render time: `Veranstaltungen {new Date().getFullYear()}`.

- [ ] **Step 2: Homepage fetch** — extend `app/(frontend)/page.tsx` (from Task 3):

```tsx
import { formatTerminDatum, startOfTodayIso } from "@/lib/events";

async function getTermine() {
  const payload = await getPayload({ config });
  const heute = startOfTodayIso();
  const { docs } = await payload.find({
    collection: "events",
    where: {
      or: [{ datum: { greater_than_equal: heute } }, { datumEnde: { greater_than_equal: heute } }],
    },
    sort: "datum",
    limit: 3,
    depth: 0,
  });
  return docs.map((d) => ({
    ...formatTerminDatum(d.datum, d.datumEnde),
    veranstaltung: d.titel,
    uhrzeit: d.uhrzeit ?? "",
    ort: d.ort ?? "",
    kategorie: d.kategorie,
  }));
}
```

In `Home`: `const [vorstand, termine] = await Promise.all([getVorstand(), getTermine()]);` and `<TermineSection termine={termine} />`. Hide empty `uhrzeit`/`ort` lines in `TerminCard` (render each `<span>` only when the value is non-empty).

- [ ] **Step 3: Kalender** — `app/(frontend)/kalender/page.tsx`: make it `async`, add `export const revalidate = 3600;`, fetch all events (`limit: 1000`, `sort: "datum"`, `depth: 0`) and pass `<KalenderClient events={...} />` where each is `{ id: d.id, titel: d.titel, datum: toIsoDay(d.datum), datumEnde: d.datumEnde ? toIsoDay(d.datumEnde) : undefined, uhrzeit: d.uhrzeit ?? undefined, ort: d.ort ?? undefined, kategorie: d.kategorie, beschreibung: d.beschreibung ?? undefined }`. In `kalender-client.tsx`: delete the hardcoded `EVENTS` constant; add `datumEnde?: string` to the `Event` type; change the signature to `export default function KalenderClient({ events }: { events: Event[] })` and replace every use of `EVENTS` by `events`; make day matching range-aware: `eventsForDay` and `selectedEvents` treat an event as on day `key` when `e.datum <= key && key <= (e.datumEnde ?? e.datum)`. Everything else (views, filters, styling) unchanged.

- [ ] **Step 4: Verify** — `npm run build` passes. `npm run start` (background) + curl: `/` shows the empty-state text ("Aktuell sind keine Termine geplant") because all seeded events are in the past, `/kalender` returns 200 and its server HTML/payload contains "Saisoneröffnung" and "Mixed- und Doppelstadtmeisterschaften"; prove the "upcoming" path with a throwaway Local-API script (do not commit it): create an event dated in the future with `context: { disableRevalidate: true }`, call the same query as `getTermine` (copy the `where`), confirm it is returned, then delete the event. Prove revalidation: with the server running, create (via a throwaway route or `next start`-safe method — the previous plan proved this with a temporary route inside the app, deleted afterwards; do the same) a future event through the normal hooks (no `disableRevalidate`), `curl /` and confirm it appears without a rebuild, then delete it and confirm it disappears. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add components/ui/termine-section.tsx "app/(frontend)/page.tsx" "app/(frontend)/kalender/page.tsx" "app/(frontend)/kalender/kalender-client.tsx"
git commit -m "Read homepage Termine and the Kalender from Payload"
```

---

## What This Plan Deliberately Does Not Cover

Galerie, News, Rechtsseiten, Mitgliedschaft, Training, Eisstock, Startseiten-Bereiche (Hero, Willkommen, Standorte, Footer) and das Kontaktformular follow in their own plans. The Vercel deployment of this phase (preview + production alias) is done by the controller after the final review, not by a task here.
