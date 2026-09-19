# Startseite (Hero, Willkommen, Standorte, Footer) + funktionierendes Kontaktformular in Payload — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the site-wide/homepage content areas into Payload **Globals** — `hero`, `welcome-section`, `location-section`, `footer` (which also feeds `InstagramCta` and the contact block's address/phone/mail) and `kontakt-section` — and make the contact form real: a private `contact-submissions` collection plus a Next.js **Server Action** that writes through Payload's Local API, with server-side validation, a honeypot and stored proof of consent.

**Architecture:** Five Payload globals (one admin page each, immediate-live, no drafts) with one migration per global, seeded once from the current hardcoded content (including the user's latest uncommitted edits, e.g. the stats `1978` / `200+`). `app/(frontend)/page.tsx` (server component) reads the globals with `payload.findGlobal({ slug, depth: 1 })` and passes plain, serializable props into the existing (mostly `"use client"`) UI components, whose markup/classes stay untouched. The `Footer` component becomes an **async server component that fetches the `footer` global itself**, so `app/(frontend)/layout.tsx` does not have to change at all. Changing a homepage global revalidates `/`; changing the footer revalidates the whole layout (`revalidatePath("/", "layout")`), because the footer is on every page. The contact form posts to a Server Action in `lib/actions/kontakt.ts`; anonymous `create` on `contact-submissions` is denied for REST/GraphQL, the Local API bypasses that via its default `overrideAccess: true`.

**Tech Stack:** Payload 3.89 (`@payloadcms/db-postgres` on Neon, `@payloadcms/storage-vercel-blob`), Next.js 16.2.6 App Router, React 19.2.4 (`useActionState`), TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-17-payload-cms-migration-design.md`
**Builds on:**
- `docs/superpowers/plans/2026-09-17-payload-foundation-teams.md` (done) — Payload/Neon/Blob foundation, `collections/Media.ts`, `collections/Users.ts`.
- `docs/superpowers/plans/2026-09-19-payload-vorstand-termine.md` (done) — the conventions this plan mirrors: `collections/hooks/revalidate.ts`, idempotent self-contained seeds, `app/(frontend)/page.tsx` as an async server component with `export const revalidate = 3600`.

**Runs in parallel with:** plan 3 (`gallery-albums`, `news`, `legal-pages`) and plan 4 (globals `mitgliedschaft`, `training`, `eisstock`). Plan 4 also creates `globals/hooks/revalidate.ts` — Task 1 below handles both cases (file already there vs. not).

---

## Global Constraints

- All paths are relative to the Next.js project root `hardtertv/` unless stated otherwise. Run all commands from `hardtertv/`.
- **Never run `next dev` / `npm run dev`.** The Neon database is shared and real; `next dev` pushes schema directly into it and leaves a stale `dev` row in `payload_migrations` that makes `payload migrate` hang (a real incident). Verification is: `npm run build` → `npx next start -p 3111` (background) → `curl` → kill **your own** server by PID.
- **Port hygiene:** port 3000 may be occupied by a foreign process that is not ours. Always start on `-p 3111`. Record the PID (`echo $! > "$SCRATCH/server.pid"`) and stop it with `kill "$(cat "$SCRATCH/server.pid")"`. **Never** `pkill -f next-server` / `pkill node`.
- `payload.config.ts` has `push: false` — schema changes only through migrations. Strict order for every new global/collection: write the config file → register it in `payload.config.ts` → `npm run migrate:create -- <name>` → `npm run migrate` → `npm run generate:types` → only then seed, build or anything else that boots Payload against the DB. **If `migrate` prompts anything (e.g. about "dev mode"), STOP and report BLOCKED — do not answer the prompt.**
- `payload.config.ts` has no `globals` array yet. Every task says "add to `globals` (create the array if it does not exist yet)" — plan 4 may have created it in the meantime; then just append.
- Publish workflow: immediate/live on save; no `versions`/drafts anywhere.
- Access: the five content globals are public site content → `read: () => true`, `update` stays Payload's default (authenticated). **`contact-submissions` is private personal data** — see Task 7 for the exact rules. Do not touch `collections/Users.ts`.
- Revalidation: guarded by `req.context?.disableRevalidate`; **every seed write passes `context: { disableRevalidate: true }`** (`revalidatePath` throws outside a Next request).
- Seeds: self-contained (data literals live in the script), idempotent with an explicit "already seeded" check, images uploaded with `payload.create({ collection: "media", data: { alt }, filePath })` — `Media.alt` is `required`.
- **Keep all existing markup, classes and design.** Only the data source changes. The only additions anywhere are the contact form's error/pending states (Task 8), which are required by the feature.
- **Editability rule applied consistently in this plan:** every visible German sentence, headline, label-with-content, name, number and link *text* becomes editable. What stays in code: internal route targets (`/mitgliedschaft`, `/training`, `/eisstock`, `/datenschutz`), the footer's "Schnelle Links" and legal link lists (they map 1:1 to real routes — same reasoning the spec uses to keep the Navbar in code), purely structural labels (the form's `Name` / `E-Mail` / `Nachricht` labels and placeholders, the button caption, the tile labels `Adresse` and `E-Mail`), the consent sentence under the form (legally reviewed wording), decorative icons/arrows, and all SEO metadata.
- Icons are stored as a **key** (select) and mapped key → lucide component in the component. `lib/stat-icons.ts` deliberately contains **no** lucide import, so `payload.config.ts` (and `payload migrate` / `tsx` seed scripts) never pull React components into a Node process.
- Images come from `public/images/...`; the files stay in the repo (other pages still use them — plan 3 covers the gallery). Seeded media land in Vercel Blob; `next/image` handles both `/api/media/file/<name>` and `*.public.blob.vercel-storage.com` (already in `next.config.ts` `remotePatterns`).
- Node: the system Node works (`"type": "module"` is set). Commit with **targeted `git add`** — never `git add -A`, never stage `.env.local`, never amend; new commits only.
- Throwaway verification scripts/routes live **outside** the repo where possible and are deleted before the commit; they are never committed.
- Today's date is **2026-09-19**.

### Scratch directory (used by every verification step)

```bash
export SCRATCH="${TMPDIR:-/tmp}/htv-plan5"
mkdir -p "$SCRATCH"
```

---

## File Structure

```
hardtertv/
  globals/
    hooks/revalidate.ts            # new (or extended, if plan 4 created it) — revalidateGlobalPaths, revalidateGlobalLayout
    Hero.ts                        # new
    WelcomeSection.ts              # new
    LocationSection.ts             # new
    Footer.ts                      # new — exports FooterGlobal
    KontaktSection.ts              # new
  collections/
    ContactSubmissions.ts          # new — private, create denied via REST/GraphQL
  lib/
    media.ts                       # new — toBild() media-relation helper
    stat-icons.ts                  # new — icon keys + admin options (no lucide import)
    kontakt-validation.ts          # new — pure, testable server-side validation
    actions/kontakt.ts             # new — "use server" Server Action
  scripts/
    seed-hero.ts                   # new
    seed-welcome-section.ts        # new
    seed-location-section.ts       # new
    seed-footer.ts                 # new
    seed-kontakt-section.ts        # new
  migrations/                      # +6 generated migrations
  payload.config.ts                # modified — globals array + ContactSubmissions
  package.json                     # modified — 5 seed scripts
  payload-types.ts                 # regenerated
  components/ui/
    hero.tsx                       # modified — props
    welcome-section.tsx            # modified — props
    location-section.tsx           # modified — props
    footer.tsx                     # modified — async server component, fetches the footer global
    instagram-cta.tsx              # modified — props (from the footer global)
    kontakt-section.tsx            # modified — props + real Server Action
  app/(frontend)/
    page.tsx                       # modified — fetches the globals, passes props
    layout.tsx                     # UNCHANGED (deliberately)
```

---

### Task 1: Baseline snapshot of the built site + shared global revalidation hooks

This task must run **before any rewiring**, because it records what the site renders today. It changes nothing user-visible.

**Files:**
- Create (or extend): `globals/hooks/revalidate.ts`
- Outside the repo: `$SCRATCH/normalize.mjs`, `$SCRATCH/baseline-*.html|txt`

**Interfaces:**
- Produces (used by Tasks 2–7): `globals/hooks/revalidate.ts` exports `revalidateGlobalPaths(paths: string[]): GlobalAfterChangeHook` and `revalidateGlobalLayout(): GlobalAfterChangeHook`.
- Produces (used by Tasks 2–6, 8): the baseline text files `$SCRATCH/baseline-home.txt`, `$SCRATCH/baseline-impressum.txt`, `$SCRATCH/baseline-mannschaften.txt` and the normalizer `$SCRATCH/normalize.mjs`.

- [ ] **Step 1: Create the normalizer (outside the repo, never committed)**

```bash
export SCRATCH="${TMPDIR:-/tmp}/htv-plan5"
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

// one word per line, so `diff` points at the exact word that changed
process.stdout.write(text.split(" ").join("\n") + "\n");
EOF
```

It strips `<script>` (the RSC payload lives there), `<style>`, all tags and therefore all asset URLs, `src`/`class`/`alt` attributes and Next's build ids — what remains is the visible text in document order.

- [ ] **Step 2: Build the current site and capture the baseline**

```bash
npm run build
npx next start -p 3111 > "$SCRATCH/start.log" 2>&1 &
echo $! > "$SCRATCH/server.pid"
until curl -sf -o /dev/null http://localhost:3111/; do sleep 1; done

for p in home:/ impressum:/impressum mannschaften:/mannschaften; do
  name="${p%%:*}"; path="${p#*:}"
  curl -s "http://localhost:3111$path" > "$SCRATCH/baseline-$name.html"
  node "$SCRATCH/normalize.mjs" "$SCRATCH/baseline-$name.html" > "$SCRATCH/baseline-$name.txt"
done

grep -o '<img' "$SCRATCH/baseline-home.html" | wc -l > "$SCRATCH/baseline-home-imgcount.txt"

kill "$(cat "$SCRATCH/server.pid")"
```

Expected: `npm run build` passes; the three `baseline-*.txt` files are non-empty; `baseline-home.txt` contains `Herzlich`, `Willkommen`, `1978`, `200+`, `Eisstockbahn`, `Isner`; `baseline-home-imgcount.txt` is a number ≥ 13 (hero + 7 partner logos + welcome + 5 location cards; `next/image` may add more). `/impressum` and `/mannschaften` are captured because the **footer** (Task 6) appears on every page.

- [ ] **Step 3: Create `globals/hooks/revalidate.ts`**

If plan 4 already created this file and it exports `revalidateGlobalPaths` with exactly this signature, **do not rewrite it** — only append the `revalidateGlobalLayout` export below. Otherwise create the file with both exports:

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

// The footer is rendered by app/(frontend)/layout.tsx and therefore appears on
// EVERY page — revalidating a list of single paths would leave the rest stale.
export const revalidateGlobalLayout =
  (): GlobalAfterChangeHook =>
  ({ doc, req }) => {
    if (req.context?.disableRevalidate) return doc;
    revalidatePath("/", "layout");
    return doc;
  };
```

- [ ] **Step 4: Commit**

```bash
git add globals/hooks/revalidate.ts
git commit -m "Add revalidation hooks for Payload globals"
```

(If the file already existed and you only appended `revalidateGlobalLayout`, the same command applies.)

---

### Task 2: `hero` global — config, migration, seed, wiring

**Files:**
- Create: `lib/media.ts`, `globals/Hero.ts`, `scripts/seed-hero.ts`
- Modify: `payload.config.ts`, `package.json`, `components/ui/hero.tsx`, `app/(frontend)/page.tsx`
- Generated: `migrations/<timestamp>_add_hero.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Consumes: `revalidateGlobalPaths` (Task 1).
- Produces: global slug `"hero"` with `headline` (text, required), `subtext` (textarea, required), `ctaLabel` (text, required), `bild` (upload → media), `partnerLogos` (array of `{ logo: upload → media (required), alt: text }`). `lib/media.ts` exports `type MediaBild = { url: string; alt: string }` and `toBild(value: unknown): MediaBild | null` — used by Tasks 3, 4, 6. `components/ui/hero.tsx` exports `type HeroProps`.

**Design decisions:**
- Upload fields are **not** `required`. An editor must be able to clear an image without the save failing, and a missing image must not crash a build. Every image has an explicit code fallback: an empty grey block (`bg-black/[0.04]`) of the same size — the same pattern plan 2 used for missing board photos, and consistent with the spec's "no dead hardcoded fallback data".
- Partner logos are an **array of upload relation + optional alt override**. The `alt` override exists because the same logo file could be reused with different wording; when it is empty, the media document's own `alt` is used.

- [ ] **Step 1: Create `lib/media.ts`**

```ts
export type MediaBild = { url: string; alt: string };

/**
 * Turns a Payload upload relation (populated with depth >= 1) into plain,
 * serializable props. Returns null when the relation is empty or not populated.
 */
export function toBild(value: unknown): MediaBild | null {
  if (!value || typeof value !== "object") return null;
  const media = value as { url?: string | null; alt?: string | null };
  if (typeof media.url !== "string" || media.url.length === 0) return null;
  return { url: media.url, alt: media.alt ?? "" };
}
```

- [ ] **Step 2: Create `globals/Hero.ts`**

```ts
import type { GlobalConfig } from "payload";

import { revalidateGlobalPaths } from "./hooks/revalidate";

export const HeroGlobal: GlobalConfig = {
  slug: "hero",
  label: "Startseite: Hero",
  admin: { group: "Startseite" },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalPaths(["/"])],
  },
  fields: [
    {
      name: "headline",
      type: "text",
      required: true,
      maxLength: 160,
      label: "Überschrift",
    },
    {
      name: "subtext",
      type: "textarea",
      required: true,
      maxLength: 500,
      label: "Text unter der Überschrift",
    },
    {
      name: "ctaLabel",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Button-Beschriftung",
      admin: { description: "Der Button verlinkt immer auf /mitgliedschaft." },
    },
    {
      name: "bild",
      type: "upload",
      relationTo: "media",
      label: "Hero-Bild",
      admin: {
        description:
          "Querformat, mindestens 1920×1080. Ohne Bild bleibt die Fläche grau — die Seite bricht nicht.",
      },
    },
    {
      name: "partnerLogos",
      type: "array",
      label: "Partner-Logos",
      labels: { singular: "Logo", plural: "Logos" },
      admin: { description: "Laufen als Endlosband unter dem Text durch." },
      fields: [
        { name: "logo", type: "upload", relationTo: "media", required: true },
        {
          name: "alt",
          type: "text",
          maxLength: 120,
          label: "Alternativtext (optional)",
          admin: { description: "Leer lassen = Alternativtext des Bildes wird verwendet." },
        },
      ],
    },
  ],
};
```

- [ ] **Step 3: Register in `payload.config.ts`, migrate, regenerate types**

In `payload.config.ts` add the import next to the existing collection imports:

```ts
import { HeroGlobal } from "./globals/Hero";
```

and add a `globals` key directly after the `collections: [...]` line — **create the array if it does not exist yet**, otherwise just append `HeroGlobal`:

```ts
  collections: [Users, Media, Teams, BoardMembers, Events],
  globals: [HeroGlobal],
```

Then:

```bash
npm run migrate:create -- add_hero
npm run migrate
npm run generate:types
```

Expected: a new `migrations/*_add_hero.ts/.json` creating the `hero` and `hero_partner_logos` tables, `migrations/index.ts` updated, `payload-types.ts` gains a `Hero` interface and a `globals` entry. `migrate` must not prompt — if it does, STOP and report BLOCKED.

- [ ] **Step 4: Create `scripts/seed-hero.ts`**

```ts
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

import config from "../payload.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const HEADLINE = "Herzlich Willkommen beim Hardter TV";
const SUBTEXT =
  "Erlebe die Freude am Tennis und die Kraft der Gemeinschaft. Verbinde dich mit Gleichgesinnten und wachse gemeinsam im Sport.";
const CTA_LABEL = "Mitglied werden";

const HERO_BILD = { pfad: "images/hero-new.png", alt: "Tennisplatz Hardter Tennisverein" };

const LOGOS = [5, 6, 7, 8, 9, 10, 11].map((i) => ({
  pfad: `images/image copy ${i}.png`,
  alt: `Partner Logo ${i}`,
}));

async function run() {
  const payload = await getPayload({ config });

  const existing = await payload.findGlobal({ slug: "hero", depth: 0 });
  if (existing?.headline) {
    console.log("skip (already seeded): hero");
    process.exit(0);
  }

  const upload = async ({ pfad, alt }: { pfad: string; alt: string }) => {
    const media = await payload.create({
      collection: "media",
      data: { alt },
      filePath: path.resolve(dirname, "..", "public", pfad),
      context: { disableRevalidate: true },
    });
    console.log(`uploaded: ${pfad}`);
    return media.id;
  };

  const bildId = await upload(HERO_BILD);

  const logoIds: number[] = [];
  for (const logo of LOGOS) {
    logoIds.push(await upload(logo));
  }

  await payload.updateGlobal({
    slug: "hero",
    data: {
      headline: HEADLINE,
      subtext: SUBTEXT,
      ctaLabel: CTA_LABEL,
      bild: bildId,
      partnerLogos: LOGOS.map((logo, i) => ({ logo: logoIds[i], alt: logo.alt })),
    },
    context: { disableRevalidate: true },
  });

  console.log("seeded: hero");
  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Add to `package.json` `scripts` (next to the existing `seed:*` entries):

```json
"seed:hero": "dotenv -e .env.local -- tsx scripts/seed-hero.ts",
```

- [ ] **Step 5: Run the seed and verify**

```bash
npm run seed:hero
```

Expected: 8 `uploaded:` lines, then `seeded: hero`, then `done`. Run it a second time: exactly `skip (already seeded): hero`.

Then a throwaway Local-API check (write it to `$SCRATCH/check-hero.ts`, run with `cd hardtertv && npx dotenv -e .env.local -- npx tsx "$SCRATCH/check-hero.ts"` — **never** put it inside the repo, never commit it): `findGlobal({ slug: "hero", depth: 1 })` returns `headline === "Herzlich Willkommen beim Hardter TV"`, `partnerLogos.length === 7`, every `partnerLogos[i].logo.url` is a non-empty string, `partnerLogos[i].alt === "Partner Logo " + (i + 5)`, and `bild.alt === "Tennisplatz Hardter Tennisverein"`. Delete the file afterwards.

> The script must import the config by absolute path, e.g. `import config from "/Users/.../hardtertv/payload.config.ts";` — or simply place it in `hardtertv/` temporarily and `rm` it before committing. Do not leave it in git.

- [ ] **Step 6: Rewire `components/ui/hero.tsx`**

Delete nothing but the hardcoded strings/`src`s. Add the props type and destructure; the JSX keeps every class.

Replace the top of the file (imports stay as they are) and the component signature with:

```tsx
export type HeroProps = {
  headline: string;
  subtext: string;
  ctaLabel: string;
  bild: { url: string; alt: string } | null;
  partnerLogos: { id: string; url: string; alt: string }[];
};

export default function Hero({ headline, subtext, ctaLabel, bild, partnerLogos }: HeroProps) {
```

Inside, make exactly these four replacements:

1. The hero image block:

```tsx
          <div className="h-56 w-full sm:h-72 md:col-span-6 md:h-full">
            {bild ? (
              <Image
                alt={bild.alt}
                className="h-full w-full overflow-hidden object-cover object-center"
                height={1080}
                src={bild.url}
                width={1920}
                priority
              />
            ) : (
              <div className="h-full w-full bg-black/[0.04]" />
            )}
          </div>
```

2. The `<h1>` content: `Herzlich Willkommen beim Hardter TV` → `{headline}`.
3. The `<p>` content: the two sentences → `{subtext}`.
4. The button caption `Mitglied werden` → `{ctaLabel}`, and the marquee:

```tsx
                  <Marquee className="[--duration:25s]" pauseOnHover repeat={2}>
                    {partnerLogos.map((logo) => (
                      <div
                        className="flex items-center justify-center px-3 md:px-5"
                        key={logo.id}
                      >
                        <Image
                          alt={logo.alt}
                          className="h-8 md:h-12 object-contain"
                          style={{ width: 'auto' }}
                          height={48}
                          src={logo.url}
                          width={120}
                        />
                      </div>
                    ))}
                  </Marquee>
```

- [ ] **Step 7: Fetch in `app/(frontend)/page.tsx`**

The file already is an async server component with `export const revalidate = 3600;`, `getVorstand()` and `getTermine()`. Add the import and the fetcher, and pass the props — leave the existing functions untouched:

```tsx
import { toBild } from "@/lib/media";
```

```tsx
async function getHero() {
  const payload = await getPayload({ config });
  const data = await payload.findGlobal({ slug: "hero", depth: 1 });
  return {
    headline: data.headline ?? "",
    subtext: data.subtext ?? "",
    ctaLabel: data.ctaLabel ?? "",
    bild: toBild(data.bild),
    partnerLogos: (data.partnerLogos ?? []).flatMap((row, i) => {
      const bild = toBild(row.logo);
      if (!bild) return [];
      return [{ id: row.id ?? String(i), url: bild.url, alt: row.alt || bild.alt }];
    }),
  };
}
```

In `Home`, extend the existing `Promise.all` and the JSX:

```tsx
export default async function Home() {
  const [hero, vorstand, termine] = await Promise.all([getHero(), getVorstand(), getTermine()]);
  return (
    <main>
      <Hero {...hero} />
      {/* ...unchanged sections... */}
```

- [ ] **Step 8: Verify visual/textual equivalence**

```bash
export SCRATCH="${TMPDIR:-/tmp}/htv-plan5"
npm run build
npx next start -p 3111 > "$SCRATCH/start.log" 2>&1 &
echo $! > "$SCRATCH/server.pid"
until curl -sf -o /dev/null http://localhost:3111/; do sleep 1; done

curl -s http://localhost:3111/ > "$SCRATCH/after-home.html"
node "$SCRATCH/normalize.mjs" "$SCRATCH/after-home.html" > "$SCRATCH/after-home.txt"
diff "$SCRATCH/baseline-home.txt" "$SCRATCH/after-home.txt"
grep -o '<img' "$SCRATCH/after-home.html" | wc -l

kill "$(cat "$SCRATCH/server.pid")"
```

Expected: `diff` prints **nothing** (the visible text is byte-identical), and the `<img` count equals `$SCRATCH/baseline-home-imgcount.txt`. Image URLs changed from `/images/...` to Payload/Blob URLs — that difference is invisible to the normalizer by design; confirm it happened with `grep -c 'blob.vercel-storage.com\|/api/media/file/' "$SCRATCH/after-home.html"` (> 0). If `diff` is not empty, fix the seed string (do **not** adjust the baseline).

- [ ] **Step 9: Commit**

```bash
git add lib/media.ts globals/Hero.ts scripts/seed-hero.ts payload.config.ts package.json payload-types.ts migrations components/ui/hero.tsx "app/(frontend)/page.tsx"
git commit -m "Add hero global, seed it and read the homepage hero from Payload"
```

---

### Task 3: `welcome-section` global — config, migration, seed, wiring

**Files:**
- Create: `lib/stat-icons.ts`, `globals/WelcomeSection.ts`, `scripts/seed-welcome-section.ts`
- Modify: `payload.config.ts`, `package.json`, `components/ui/welcome-section.tsx`, `app/(frontend)/page.tsx`
- Generated: `migrations/<timestamp>_add_welcome_section.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Consumes: `revalidateGlobalPaths` (Task 1), `toBild` (Task 2).
- Produces: global slug `"welcome-section"`; `lib/stat-icons.ts` exports `type StatIconKey = "trophy" | "users" | "mapPin" | "zap"` and `STAT_ICON_OPTIONS: { label: string; value: StatIconKey }[]`.

**Design decision — textarea instead of Lexical richText (deviation from the spec):** the spec names Lexical richText for the Begrüßungstext. The current markup is four plain `<p>` elements inside `<div className="space-y-4 …">` plus a signature paragraph with a `<br />` — no bold, italics, links or lists anywhere. Rendering Lexical output would require `RichText`/a JSX converter whose wrapper markup is *not* byte-identical to the current one, which would break the "renders identically" requirement of this migration, and it would give board members a formatting toolbar whose options the design cannot honour. Therefore: **one `textarea` field, paragraphs separated by a blank line**, split with `/\n\s*\n/` in the server component. The signature is two separate text fields (`signaturName`, `signaturRolle`), which reproduces `Oliver Wiegand<br />1. Vorsitzender HTV` exactly. If the board later wants inline links in this text, switching this one field to richText is a small, isolated follow-up.

- [ ] **Step 1: Create `lib/stat-icons.ts`** (deliberately without a lucide import — see Global Constraints)

```ts
export type StatIconKey = "trophy" | "users" | "mapPin" | "zap";

export const STAT_ICON_OPTIONS: { label: string; value: StatIconKey }[] = [
  { label: "Pokal", value: "trophy" },
  { label: "Personen", value: "users" },
  { label: "Standort-Nadel", value: "mapPin" },
  { label: "Blitz", value: "zap" },
];
```

- [ ] **Step 2: Create `globals/WelcomeSection.ts`**

```ts
import type { GlobalConfig } from "payload";

import { STAT_ICON_OPTIONS } from "../lib/stat-icons";
import { revalidateGlobalPaths } from "./hooks/revalidate";

export const WelcomeSectionGlobal: GlobalConfig = {
  slug: "welcome-section",
  label: "Startseite: Willkommen",
  admin: { group: "Startseite" },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalPaths(["/"])],
  },
  fields: [
    { name: "eyebrow", type: "text", required: true, maxLength: 60, label: "Kleine Überschrift" },
    { name: "headline", type: "text", required: true, maxLength: 200, label: "Überschrift" },
    { name: "intro", type: "textarea", required: true, maxLength: 500, label: "Einleitungstext" },
    {
      name: "stats",
      type: "array",
      label: "Zahlen-Kacheln",
      labels: { singular: "Kachel", plural: "Kacheln" },
      minRows: 1,
      maxRows: 4,
      admin: { description: "Vier Kacheln passen genau in eine Zeile." },
      fields: [
        {
          name: "icon",
          type: "select",
          required: true,
          defaultValue: "trophy",
          options: STAT_ICON_OPTIONS,
        },
        { name: "wert", type: "text", required: true, maxLength: 20, label: "Zahl" },
        { name: "label", type: "text", required: true, maxLength: 40, label: "Beschriftung" },
      ],
    },
    {
      name: "bild",
      type: "upload",
      relationTo: "media",
      label: "Bild",
      admin: { description: "Ohne Bild bleibt die Fläche grau." },
    },
    {
      name: "bildBadge",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Text im Badge auf dem Bild",
    },
    {
      name: "text",
      type: "textarea",
      required: true,
      maxLength: 6000,
      label: "Begrüßungstext",
      admin: { description: "Absätze durch eine Leerzeile voneinander trennen." },
    },
    { name: "signaturName", type: "text", required: true, maxLength: 80, label: "Unterschrift: Name" },
    { name: "signaturRolle", type: "text", required: true, maxLength: 80, label: "Unterschrift: Funktion" },
    {
      name: "ctaLabel",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Button-Beschriftung",
      admin: { description: "Der Button verlinkt immer auf /mitgliedschaft." },
    },
    {
      name: "sekundaerLabel",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Textlink-Beschriftung",
      admin: { description: "Verlinkt auf /training. Der Pfeil wird automatisch angehängt." },
    },
  ],
};
```

- [ ] **Step 3: Register, migrate, types**

In `payload.config.ts`: `import { WelcomeSectionGlobal } from "./globals/WelcomeSection";` and extend `globals` to `[HeroGlobal, WelcomeSectionGlobal]`. Then:

```bash
npm run migrate:create -- add_welcome_section
npm run migrate
npm run generate:types
```

`migrate` must not prompt (if it does: STOP, report BLOCKED).

- [ ] **Step 4: Create `scripts/seed-welcome-section.ts`**

```ts
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

import config from "../payload.config";
import type { StatIconKey } from "../lib/stat-icons";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const STATS: { icon: StatIconKey; wert: string; label: string }[] = [
  { icon: "trophy", wert: "1978", label: "Gegründet" },
  { icon: "users", wert: "200+", label: "Mitglieder" },
  { icon: "mapPin", wert: "6", label: "Tennisplätze" },
  { icon: "zap", wert: "2", label: "Flutlichtplätze" },
];

const BILD = { pfad: "images/Tennisball an Linie groß.jpg", alt: "Tennisball an der Linie" };

const ABSAETZE = [
  "Gerne zeigen wir Ihnen unsere 6-Platzanlage mit Clubhaus direkt am Kanal gelegen. Die Anlage ist im Normalfall von Mitte April bis Ende Oktober geöffnet. Bei uns kann Tennis als Hobby-, Mannschafts- oder Leistungssport betrieben werden.",
  "Zum gemütlichen Beisammensein vor und nach dem Tennisspielen lädt die großzügig angelegte Terrasse ein. Von dieser aus können Sie die gesamte Anlage überblicken und sie ist zu einem beliebten Treffpunkt geworden.",
  "Für alle diejenigen, die das Tennisspielen beim HTV einmal ausprobieren wollen, bieten wir die sogenannte Greencard an. Mit dieser kann Jeder erst einmal für wenig Geld ab Saisonbeginn bis zum 31.7. des jeweiligen Jahres schnuppern. Denn bevor Jemand Mitglied werden muss, soll er sich sicher sein, dass der Tennissport und insbesondere der HTV genau das Richtige sind, um in der Freizeit aktiv zu sein.",
  "Wir wünschen viel Spaß beim virtuellen Rundgang auf unserer Homepage und bemühen uns die Internetseite nach Möglichkeit immer aktuell zu halten. Für Anmerkungen, Anregungen, Kommunikation etc. steht Ihnen unser Kontaktformular zur Verfügung! Ansonsten freuen wir uns auf Ihren Besuch auf unserer Anlage.",
];

async function run() {
  const payload = await getPayload({ config });

  const existing = await payload.findGlobal({ slug: "welcome-section", depth: 0 });
  if (existing?.headline) {
    console.log("skip (already seeded): welcome-section");
    process.exit(0);
  }

  const media = await payload.create({
    collection: "media",
    data: { alt: BILD.alt },
    filePath: path.resolve(dirname, "..", "public", BILD.pfad),
    context: { disableRevalidate: true },
  });
  console.log(`uploaded: ${BILD.pfad}`);

  await payload.updateGlobal({
    slug: "welcome-section",
    data: {
      eyebrow: "Über den Verein",
      headline: "Hardter TV, ein Verein für Jedermann mit bezahlbaren Beiträgen!",
      intro:
        "Herzlich willkommen beim Hardter Tennisverein in Dorsten. Erlebe die Freude am Tennis und werde Teil unserer aktiven Gemeinschaft.",
      stats: STATS,
      bild: media.id,
      bildBadge: "Hardter TV Dorsten",
      text: ABSAETZE.join("\n\n"),
      signaturName: "Oliver Wiegand",
      signaturRolle: "1. Vorsitzender HTV",
      ctaLabel: "Jetzt Mitglied werden",
      sekundaerLabel: "Training entdecken",
    },
    context: { disableRevalidate: true },
  });

  console.log("seeded: welcome-section");
  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Add to `package.json` scripts: `"seed:welcome-section": "dotenv -e .env.local -- tsx scripts/seed-welcome-section.ts",`

- [ ] **Step 5: Run the seed and verify**

`npm run seed:welcome-section` → 1 `uploaded:`, `seeded: welcome-section`, `done`; second run → `skip (already seeded)`. Throwaway Local-API check (deleted afterwards): `stats.length === 4` with values `1978 / 200+ / 6 / 2` and icons `trophy / users / mapPin / zap`; `text.split(/\n\s*\n/).length === 4`; `bild.url` non-empty.

- [ ] **Step 6: Rewire `components/ui/welcome-section.tsx`**

Keep `"use client"` and all markup. Replace the module-level `stats` constant and the `StatCard` signature; add props.

Top of file — replace the `const stats = [...]` block with:

```tsx
import type { StatIconKey } from "@/lib/stat-icons";

const ICONS: Record<StatIconKey, typeof Trophy> = {
  trophy: Trophy,
  users: Users,
  mapPin: MapPin,
  zap: Zap,
};

export type WelcomeSectionProps = {
  eyebrow: string;
  headline: string;
  intro: string;
  stats: { id: string; icon: StatIconKey; wert: string; label: string }[];
  bild: { url: string; alt: string } | null;
  bildBadge: string;
  absaetze: string[];
  signaturName: string;
  signaturRolle: string;
  ctaLabel: string;
  sekundaerLabel: string;
};

function StatCard({ icon, value, label }: { icon: StatIconKey; value: string; label: string }) {
  const Icon = ICONS[icon] ?? Trophy;
  return (
    <div className="flex flex-col items-start gap-2 border-t border-black/10 pt-5">
      <Icon className="size-5 text-black/40" strokeWidth={1.5} />
      <span className="font-kanturmuy text-3xl font-normal tracking-tight sm:text-4xl">{value}</span>
      <span className="text-sm text-black/50 uppercase tracking-widest">{label}</span>
    </div>
  );
}
```

(The lucide imports `ArrowUpRight, Trophy, Users, MapPin, Zap` stay exactly as they are — `Trophy` is still used for the badge on the image.)

Component signature and body changes:

```tsx
export default function WelcomeSection({
  eyebrow,
  headline,
  intro,
  stats,
  bild,
  bildBadge,
  absaetze,
  signaturName,
  signaturRolle,
  ctaLabel,
  sekundaerLabel,
}: WelcomeSectionProps) {
```

- eyebrow `<span>`: `Über den Verein` → `{eyebrow}`
- `<BlurTextEffect>Hardter TV, …</BlurTextEffect>` → `<BlurTextEffect>{headline}</BlurTextEffect>`
- intro `<p>` content → `{intro}`
- stats grid:

```tsx
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:mt-14 md:grid-cols-4">
          {stats.map((stat, i) => (
            <FadeIn key={stat.id} delay={0.1 + i * 0.08}>
              <StatCard icon={stat.icon} value={stat.wert} label={stat.label} />
            </FadeIn>
          ))}
        </div>
```

- image block:

```tsx
          <div className="relative overflow-hidden rounded-2xl">
            {bild ? (
              <Image
                src={bild.url}
                alt={bild.alt}
                width={900}
                height={700}
                className="h-full w-full object-cover object-center"
                style={{ minHeight: "260px" }}
              />
            ) : (
              <div className="h-full w-full bg-black/[0.04]" style={{ minHeight: "260px" }} />
            )}
            <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-[#e1fcad] px-4 py-2">
              <Trophy className="size-4 text-black" strokeWidth={1.5} />
              <span className="text-sm font-medium text-black">
                {bildBadge}
              </span>
            </div>
          </div>
```

- the four hardcoded `<p>` paragraphs plus signature:

```tsx
            <div className="space-y-4 text-base font-light leading-relaxed text-black/70 md:text-lg">
              {absaetze.map((absatz, i) => (
                <p key={i}>{absatz}</p>
              ))}
              <p className="font-normal text-black/80">
                {signaturName}<br />
                {signaturRolle}
              </p>
            </div>
```

- button caption `Jetzt Mitglied werden` → `{ctaLabel}`; the secondary link text `Training entdecken →` → `{sekundaerLabel} →`.

- [ ] **Step 7: Fetch in `app/(frontend)/page.tsx`**

```tsx
async function getWelcome() {
  const payload = await getPayload({ config });
  const data = await payload.findGlobal({ slug: "welcome-section", depth: 1 });
  return {
    eyebrow: data.eyebrow ?? "",
    headline: data.headline ?? "",
    intro: data.intro ?? "",
    stats: (data.stats ?? []).map((row, i) => ({
      id: row.id ?? String(i),
      icon: row.icon,
      wert: row.wert,
      label: row.label,
    })),
    bild: toBild(data.bild),
    bildBadge: data.bildBadge ?? "",
    absaetze: (data.text ?? "")
      .split(/\n\s*\n/)
      .map((absatz) => absatz.trim())
      .filter((absatz) => absatz.length > 0),
    signaturName: data.signaturName ?? "",
    signaturRolle: data.signaturRolle ?? "",
    ctaLabel: data.ctaLabel ?? "",
    sekundaerLabel: data.sekundaerLabel ?? "",
  };
}
```

Extend `Promise.all` to `const [hero, welcome, vorstand, termine] = await Promise.all([getHero(), getWelcome(), getVorstand(), getTermine()]);` and render `<WelcomeSection {...welcome} />`.

- [ ] **Step 8: Verify** — same procedure as Task 2 Step 8 (`npm run build`, start on 3111, curl `/`, normalize, `diff` against `$SCRATCH/baseline-home.txt` → **empty**, `<img` count unchanged, kill the server by PID).

- [ ] **Step 9: Commit**

```bash
git add lib/stat-icons.ts globals/WelcomeSection.ts scripts/seed-welcome-section.ts payload.config.ts package.json payload-types.ts migrations components/ui/welcome-section.tsx "app/(frontend)/page.tsx"
git commit -m "Add welcome-section global, seed it and read the homepage welcome block from Payload"
```

---

### Task 4: `location-section` global — config, migration, seed, wiring

**Files:**
- Create: `globals/LocationSection.ts`, `scripts/seed-location-section.ts`
- Modify: `payload.config.ts`, `package.json`, `components/ui/location-section.tsx`, `app/(frontend)/page.tsx`
- Generated: `migrations/<timestamp>_add_location_section.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Consumes: `revalidateGlobalPaths` (Task 1), `toBild` (Task 2).
- Produces: global slug `"location-section"`; `karten` array of `{ titel, untertitel, bild, href }`.

**Design decision:** `href` stays a free text field, because the cards mix external Google-Maps links with the internal `/eisstock` route, and the component's existing behaviour (`href.startsWith("http")` → new tab + Maps consent gate) must keep working. The field description tells editors exactly that. The cookie/Maps consent logic (`useCookieConsent`, the "Google Maps nicht aktiviert" overlay) stays entirely in code — it is behaviour, not content.

- [ ] **Step 1: Create `globals/LocationSection.ts`**

```ts
import type { GlobalConfig } from "payload";

import { revalidateGlobalPaths } from "./hooks/revalidate";

export const LocationSectionGlobal: GlobalConfig = {
  slug: "location-section",
  label: "Startseite: Standorte",
  admin: { group: "Startseite" },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalPaths(["/"])],
  },
  fields: [
    { name: "eyebrow", type: "text", required: true, maxLength: 60, label: "Kleine Überschrift" },
    {
      name: "headlineTeil1",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Überschrift (erster Teil)",
    },
    {
      name: "headlineTeil2",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Überschrift (unterstrichener Teil)",
    },
    { name: "intro", type: "textarea", required: true, maxLength: 600, label: "Einleitungstext" },
    {
      name: "ctaLabel",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Button-Beschriftung",
      admin: { description: "Der Button verlinkt immer auf /mitgliedschaft." },
    },
    {
      name: "karten",
      type: "array",
      label: "Standort-Karten",
      labels: { singular: "Karte", plural: "Karten" },
      minRows: 1,
      admin: { description: "Fünf Karten passen am besten in das Raster." },
      fields: [
        { name: "titel", type: "text", required: true, maxLength: 80 },
        {
          name: "untertitel",
          type: "textarea",
          maxLength: 160,
          label: "Untertitel",
          admin: { description: "Zeilenumbrüche bleiben erhalten." },
        },
        {
          name: "bild",
          type: "upload",
          relationTo: "media",
          admin: { description: "Ohne Bild bleibt die Fläche grau." },
        },
        {
          name: "href",
          type: "text",
          required: true,
          maxLength: 500,
          label: "Link",
          admin: {
            description:
              'Externe Links (beginnen mit "http") öffnen in einem neuen Tab und liegen hinter der Google-Maps-Einwilligung. Interne Links beginnen mit "/", z. B. /eisstock.',
          },
        },
      ],
    },
  ],
};
```

- [ ] **Step 2: Register, migrate, types**

`import { LocationSectionGlobal } from "./globals/LocationSection";`, extend `globals` to `[HeroGlobal, WelcomeSectionGlobal, LocationSectionGlobal]`, then:

```bash
npm run migrate:create -- add_location_section
npm run migrate
npm run generate:types
```

- [ ] **Step 3: Create `scripts/seed-location-section.ts`**

```ts
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

import config from "../payload.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const MAPS_URL = "https://maps.google.com/?q=Hardter+TV+Gahlener+Str.+204+46282+Dorsten";

const KARTEN = [
  {
    titel: "6 Ascheplätze",
    untertitel: "Zwei mit Flutlichtanlage",
    pfad: "images/hero-new.png",
    href: MAPS_URL,
  },
  {
    titel: "Clubheim Hardt",
    untertitel: "Vermietung nur an Mitglieder",
    pfad: "images/image copy 2.png",
    href: MAPS_URL,
  },
  {
    titel: "Flutlichtanlage",
    untertitel: "Auf 2 Plätzen",
    pfad: "images/image.png",
    href: MAPS_URL,
  },
  {
    titel: "Kletter- und Spielgerüst",
    untertitel: "Für die jüngsten Mitglieder",
    pfad: "images/image copy 3.png",
    href: MAPS_URL,
  },
  {
    titel: "Eisstockbahn",
    untertitel: "Vermietung nur an Mitglieder",
    pfad: "images/änderungen/eis.png",
    href: "/eisstock",
  },
];

async function run() {
  const payload = await getPayload({ config });

  const existing = await payload.findGlobal({ slug: "location-section", depth: 0 });
  if (existing?.eyebrow) {
    console.log("skip (already seeded): location-section");
    process.exit(0);
  }

  const bildIds: number[] = [];
  for (const karte of KARTEN) {
    const media = await payload.create({
      collection: "media",
      data: { alt: karte.titel },
      filePath: path.resolve(dirname, "..", "public", karte.pfad),
      context: { disableRevalidate: true },
    });
    console.log(`uploaded: ${karte.pfad}`);
    bildIds.push(media.id);
  }

  await payload.updateGlobal({
    slug: "location-section",
    data: {
      eyebrow: "Standorte",
      headlineTeil1: "Unsere",
      headlineTeil2: "Tennisanlage",
      intro:
        "Erleben Sie Tennis vom Feinsten mit unserer erstklassig gepflegten Anlage und dem Überblick aller 6 Plätze von unserer überdachten Terrasse. Egal, ob Anfänger oder erfahrener Profi, wir haben den perfekten Platz für Ihr Spiel.",
      ctaLabel: "Mitgliedschaft",
      karten: KARTEN.map((karte, i) => ({
        titel: karte.titel,
        untertitel: karte.untertitel,
        bild: bildIds[i],
        href: karte.href,
      })),
    },
    context: { disableRevalidate: true },
  });

  console.log("seeded: location-section");
  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Add to `package.json` scripts: `"seed:location-section": "dotenv -e .env.local -- tsx scripts/seed-location-section.ts",`

- [ ] **Step 4: Run the seed and verify** — `npm run seed:location-section` → 5 `uploaded:`, `seeded:`, `done`; re-run → `skip`. Throwaway Local-API check: `karten.length === 5`, titles in the order `6 Ascheplätze, Clubheim Hardt, Flutlichtanlage, Kletter- und Spielgerüst, Eisstockbahn`, `karten[4].href === "/eisstock"`, the other four `href` values equal the Maps URL, every `karten[i].bild.url` non-empty.

- [ ] **Step 5: Rewire `components/ui/location-section.tsx`**

Delete the module-level `locations` constant. Add the props type, change `LocationCard`'s `location` type, and swap the five hardcoded strings.

```tsx
export type StandortKarte = {
  id: string;
  titel: string;
  untertitel: string;
  bild: { url: string; alt: string } | null;
  href: string;
};

export type LocationSectionProps = {
  eyebrow: string;
  headlineTeil1: string;
  headlineTeil2: string;
  intro: string;
  ctaLabel: string;
  karten: StandortKarte[];
};
```

`LocationCard` — signature `function LocationCard({ location, mapsAllowed }: { location: StandortKarte; mapsAllowed: boolean })`, and inside the image block:

```tsx
      <div className="relative h-52 overflow-hidden">
        {location.bild ? (
          <Image
            src={location.bild.url}
            alt={location.bild.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
            className={`object-cover object-center transition-transform duration-700 ease-out ${!blocked ? "group-hover:scale-105" : "blur-sm"}`}
          />
        ) : (
          <div className="absolute inset-0 bg-black/[0.04]" />
        )}
```

(the rest of the card body — the blocked overlay, hover circle, underline bar — is unchanged). Replace `{location.title}` with `{location.titel}` and `{location.subtitle && (…{location.subtitle}…)}` with `{location.untertitel && (…{location.untertitel}…)}`.

Component:

```tsx
export default function LocationSection({
  eyebrow,
  headlineTeil1,
  headlineTeil2,
  intro,
  ctaLabel,
  karten,
}: LocationSectionProps) {
  const consent = useCookieConsent();
  const mapsAllowed = consent?.maps ?? false;
```

- eyebrow `Standorte` → `{eyebrow}`
- headline:

```tsx
            <h2 className="font-kanturmuy max-w-xl text-4xl font-normal tracking-tighter md:text-5xl lg:text-6xl">
              <BlurTextEffect>{`${headlineTeil1} `}</BlurTextEffect>
              <span className="relative inline-block">
                <BlurTextEffect>{headlineTeil2}</BlurTextEffect>
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
```

> The trailing space is intentional: `BlurTextEffect` does `children.split(" ")`, so `"Unsere "` produces the word span **plus** a trailing empty span. Reproducing it keeps the HTML identical to the baseline.

- intro `<p>` → `{intro}`; button caption `Mitgliedschaft` → `{ctaLabel}`
- grid:

```tsx
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {karten.map((karte, i) => (
            <FadeIn key={karte.id} delay={0.1 + i * 0.08}>
              <LocationCard location={karte} mapsAllowed={mapsAllowed} />
            </FadeIn>
          ))}
        </div>
```

- [ ] **Step 6: Fetch in `app/(frontend)/page.tsx`**

```tsx
async function getStandorte() {
  const payload = await getPayload({ config });
  const data = await payload.findGlobal({ slug: "location-section", depth: 1 });
  return {
    eyebrow: data.eyebrow ?? "",
    headlineTeil1: data.headlineTeil1 ?? "",
    headlineTeil2: data.headlineTeil2 ?? "",
    intro: data.intro ?? "",
    ctaLabel: data.ctaLabel ?? "",
    karten: (data.karten ?? []).map((row, i) => ({
      id: row.id ?? String(i),
      titel: row.titel,
      untertitel: row.untertitel ?? "",
      bild: toBild(row.bild),
      href: row.href,
    })),
  };
}
```

Extend `Promise.all` and render `<LocationSection {...standorte} />`.

- [ ] **Step 7: Verify** — same as Task 2 Step 8: `diff` against `$SCRATCH/baseline-home.txt` must be **empty**, `<img` count unchanged.

- [ ] **Step 8: Commit**

```bash
git add globals/LocationSection.ts scripts/seed-location-section.ts payload.config.ts package.json payload-types.ts migrations components/ui/location-section.tsx "app/(frontend)/page.tsx"
git commit -m "Add location-section global, seed it and read the homepage Standorte from Payload"
```

---

### Task 5: `footer` global — config, migration, seed, wiring (site-wide + InstagramCta)

**Files:**
- Create: `globals/Footer.ts`, `scripts/seed-footer.ts`
- Modify: `payload.config.ts`, `package.json`, `components/ui/footer.tsx`, `components/ui/instagram-cta.tsx`, `app/(frontend)/page.tsx`
- **Not** modified: `app/(frontend)/layout.tsx`
- Generated: `migrations/<timestamp>_add_footer.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Consumes: `revalidateGlobalLayout` (Task 1).
- Produces: global slug `"footer"` — the **single source of the club's contact data** (used by the footer on every page, by `InstagramCta`, and by the contact block in Task 7). `components/ui/instagram-cta.tsx` exports `type InstagramCtaProps`.

**Design decisions:**
- `Footer` becomes an **async server component that fetches the global itself**. That keeps `app/(frontend)/layout.tsx` completely untouched — important because plans 3 and 4 run concurrently — and avoids threading props through the root layout.
- Because the footer renders on every page, its `afterChange` hook calls `revalidatePath("/", "layout")`, not a path list.
- The footer's "Schnelle Links" and the bottom-bar legal links stay hardcoded: they map 1:1 to real routes and CMS-managing them risks dead links with no safety net — the same argument the spec uses for the Navbar.
- The copyright year becomes `new Date().getFullYear()` (only the club name is editable), following the precedent from plan 2 (`Veranstaltungen {year}`). In 2026 this renders identically to the current `© 2026`.

- [ ] **Step 1: Create `globals/Footer.ts`**

```ts
import type { GlobalConfig } from "payload";

import { revalidateGlobalLayout } from "./hooks/revalidate";

export const FooterGlobal: GlobalConfig = {
  slug: "footer",
  label: "Footer & Kontaktdaten",
  admin: {
    group: "Seitenweit",
    description:
      "Diese Daten erscheinen im Footer jeder Seite, im Instagram-Banner und im Kontaktbereich der Startseite.",
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalLayout()],
  },
  fields: [
    { name: "vereinsname", type: "text", required: true, maxLength: 80 },
    {
      name: "beschreibung",
      type: "textarea",
      required: true,
      maxLength: 300,
      label: "Kurzbeschreibung im Footer",
    },
    { name: "strasse", type: "text", required: true, maxLength: 120, label: "Straße und Hausnummer" },
    { name: "plz", type: "text", required: true, maxLength: 10, label: "PLZ" },
    { name: "ort", type: "text", required: true, maxLength: 80, label: "Ort" },
    { name: "email", type: "email", required: true, label: "Allgemeine E-Mail-Adresse" },
    {
      name: "telefonLabel",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Beschriftung der Telefonnummer",
      admin: { description: 'Steht im Kontaktbereich über der Nummer, z. B. "Vorsitzender".' },
    },
    { name: "telefon", type: "text", required: true, maxLength: 40, label: "Telefonnummer (Anzeige)" },
    {
      name: "telefonHref",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Telefonnummer (Anruf-Link)",
      admin: { description: 'Technische Schreibweise, z. B. "tel:+491722580209".' },
    },
    {
      name: "kontaktpersonen",
      type: "array",
      label: "Kontaktpersonen im Footer",
      labels: { singular: "Person", plural: "Personen" },
      fields: [
        { name: "label", type: "text", required: true, maxLength: 60, label: "Funktion" },
        { name: "name", type: "text", required: true, maxLength: 80 },
        { name: "email", type: "email", required: true, label: "E-Mail für den Link" },
      ],
    },
    { name: "funFactTitel", type: "text", required: true, maxLength: 60 },
    { name: "funFact", type: "textarea", required: true, maxLength: 600, label: "Fun Fact" },
    {
      name: "shop",
      type: "group",
      label: "Shop-Hinweis",
      fields: [
        { name: "textVor", type: "text", required: true, maxLength: 80, label: "Text vor dem Link" },
        { name: "linkText", type: "text", required: true, maxLength: 60, label: "Linktext" },
        { name: "url", type: "text", required: true, maxLength: 500, label: "Shop-Adresse" },
        { name: "textNach", type: "text", required: true, maxLength: 120, label: "Text nach dem Link" },
      ],
    },
    {
      name: "instagram",
      type: "group",
      label: "Instagram",
      fields: [
        { name: "handle", type: "text", required: true, maxLength: 60, admin: { description: 'Mit @, z. B. "@hardtertv".' } },
        { name: "url", type: "text", required: true, maxLength: 500, label: "Profil-Adresse" },
        { name: "ctaEyebrow", type: "text", required: true, maxLength: 60, label: "Banner: kleine Überschrift" },
        { name: "ctaHeadline", type: "text", required: true, maxLength: 120, label: "Banner: Überschrift" },
        {
          name: "ctaText",
          type: "textarea",
          required: true,
          maxLength: 300,
          label: "Banner: Text",
          admin: { description: "Der Instagram-Name wird automatisch dahinter gesetzt." },
        },
      ],
    },
    {
      name: "copyrightName",
      type: "text",
      required: true,
      maxLength: 80,
      label: "Name in der Copyright-Zeile",
      admin: { description: "Das Jahr wird automatisch eingesetzt." },
    },
  ],
};
```

- [ ] **Step 2: Register, migrate, types**

`import { FooterGlobal } from "./globals/Footer";`, extend `globals` to `[HeroGlobal, WelcomeSectionGlobal, LocationSectionGlobal, FooterGlobal]`, then:

```bash
npm run migrate:create -- add_footer
npm run migrate
npm run generate:types
```

- [ ] **Step 3: Create `scripts/seed-footer.ts`**

```ts
import { getPayload } from "payload";

import config from "../payload.config";

const EMAIL = "1.vorsitzender@hardt-tennis.de";

async function run() {
  const payload = await getPayload({ config });

  const existing = await payload.findGlobal({ slug: "footer", depth: 0 });
  if (existing?.vereinsname) {
    console.log("skip (already seeded): footer");
    process.exit(0);
  }

  await payload.updateGlobal({
    slug: "footer",
    data: {
      vereinsname: "Hardter TV",
      beschreibung: "Ihr Tennisverein für Sport, Spaß und Gemeinschaft in Dorsten.",
      strasse: "Gahlener Str. 204",
      plz: "46282",
      ort: "Dorsten",
      email: EMAIL,
      telefonLabel: "Vorsitzender",
      telefon: "0172 25 80 209",
      // Übernommen wie im bisherigen Code (siehe "Notes for the user" — die Nummer
      // enthält vermutlich eine Null zu viel; sie wird hier NICHT stillschweigend korrigiert).
      telefonHref: "tel:+4917225800209",
      kontaktpersonen: [
        { label: "1. Vorsitzender", name: "Oliver Wiegand", email: EMAIL },
        { label: "1. Geschäftsführer", name: "Hendrick Büncker", email: EMAIL },
        { label: "Schatzmeister", name: "Marco Hohenstein", email: EMAIL },
      ],
      funFactTitel: "Wusstest du schon?",
      funFact:
        "Der längste Tennismatch der Geschichte dauerte über 11 Stunden — John Isner gegen Nicolas Mahut in Wimbledon 2010.",
      shop: {
        textVor: "Mitglied im",
        linkText: "HTV-Shop",
        url: "https://matchpoint24.de/collections/tennisclub-hardter-tv",
        textNach: "— Ausrüstung direkt vom Verein.",
      },
      instagram: {
        handle: "@hardtertv",
        url: "https://www.instagram.com/hardtertv/",
        ctaEyebrow: "Social Media",
        ctaHeadline: "Folge uns auf Instagram",
        ctaText: "Aktuelle Bilder, Spielberichte und Vereinsleben — immer live auf",
      },
      copyrightName: "Hardter TV",
    },
    context: { disableRevalidate: true },
  });

  console.log("seeded: footer");
  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Add to `package.json` scripts: `"seed:footer": "dotenv -e .env.local -- tsx scripts/seed-footer.ts",`

- [ ] **Step 4: Run the seed and verify** — `npm run seed:footer` → `seeded: footer`, `done`; re-run → `skip`. Throwaway Local-API check: `kontaktpersonen.length === 3`, all three `email` equal `1.vorsitzender@hardt-tennis.de`, `instagram.handle === "@hardtertv"`, `shop.linkText === "HTV-Shop"`, `telefonHref === "tel:+4917225800209"`.

- [ ] **Step 5: Rewire `components/ui/footer.tsx`** (async server component, fetches itself)

Keep the `links` array and the whole markup. New top of file and signature:

```tsx
import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";

const links = [
  { label: "Home", href: "/" },
  { label: "Über uns", href: "/#about" },
  { label: "Termine", href: "/#termine" },
  { label: "Vorstand", href: "/vorstand" },
  { label: "Neuigkeiten", href: "/#news" },
  { label: "Kontakt", href: "/#contact" },
  { label: "Training", href: "/training" },
  { label: "Mannschaften", href: "/mannschaften" },
  { label: "Galerie", href: "/galerie" },
  { label: "Mitgliedschaft", href: "/mitgliedschaft" },
];

export default async function Footer() {
  const payload = await getPayload({ config });
  const data = await payload.findGlobal({ slug: "footer", depth: 0 });

  const kontaktpersonen = (data.kontaktpersonen ?? []).map((person, i) => ({
    id: person.id ?? String(i),
    label: person.label,
    name: person.name,
    email: person.email,
  }));

  return (
```

Then, inside the markup:

- brand name `Hardter TV` → `{data.vereinsname}`
- brand paragraph text → `{data.beschreibung}`
- the Instagram chip: `href="https://www.instagram.com/hardtertv/"` → `href={data.instagram?.url ?? "#"}`, and the visible `@hardtertv` → `{data.instagram?.handle}`
- the address paragraph:

```tsx
            <p className="mb-4 text-sm font-light leading-relaxed text-white/50">
              {data.vereinsname}<br />
              {data.strasse}<br />
              {data.plz} {data.ort}
            </p>
```

- the contact list (the three persons from the array, then the general e-mail entry whose label `E-Mail` is structural):

```tsx
            <ul className="flex flex-col gap-2.5">
              {kontaktpersonen.map((k) => (
                <li key={k.id} className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-widest text-white/25">{k.label}</span>
                  <a
                    href={`mailto:${k.email}`}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {k.name}
                  </a>
                </li>
              ))}
              <li className="flex flex-col">
                <span className="text-[11px] uppercase tracking-widest text-white/25">E-Mail</span>
                <a
                  href={`mailto:${data.email}`}
                  className="text-sm text-white/50 transition-colors hover:text-white"
                >
                  {data.email}
                </a>
              </li>
            </ul>
```

- fun fact heading → `{data.funFactTitel}`, fun fact paragraph → `{data.funFact}`
- the shop sentence:

```tsx
              <p className="mt-4 text-sm font-light leading-relaxed text-white/40">
                {data.shop?.textVor}{" "}
                <a
                  href={data.shop?.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e1fcad]/70 transition-colors hover:text-[#e1fcad]"
                >
                  {data.shop?.linkText}
                </a>{" "}
                {data.shop?.textNach}
              </p>
```

- copyright line: `<p>© {new Date().getFullYear()} {data.copyrightName}. Alle Rechte vorbehalten.</p>`

The bottom-bar legal links stay exactly as they are.

- [ ] **Step 6: Rewire `components/ui/instagram-cta.tsx`** (props from the footer global)

```tsx
export type InstagramCtaProps = {
  eyebrow: string;
  headline: string;
  text: string;
  handle: string;
  url: string;
};

export default function InstagramCta({ eyebrow, headline, text, handle, url }: InstagramCtaProps) {
```

- eyebrow `Social Media` → `{eyebrow}`
- `<BlurTextEffect>Folge uns auf Instagram</BlurTextEffect>` → `<BlurTextEffect>{headline}</BlurTextEffect>`
- the paragraph:

```tsx
          <p className="max-w-sm text-sm font-light text-white/50">
            {text}{" "}
            <span className="text-white/70">{handle}</span>
          </p>
```

- the anchor: `href={url}` and the caption `@hardtertv auf Instagram` → `{handle} auf Instagram` (the words "auf Instagram" stay in code — structural).

- [ ] **Step 7: Fetch in `app/(frontend)/page.tsx`**

```tsx
async function getFooterDaten() {
  const payload = await getPayload({ config });
  const data = await payload.findGlobal({ slug: "footer", depth: 0 });
  return {
    instagram: {
      eyebrow: data.instagram?.ctaEyebrow ?? "",
      headline: data.instagram?.ctaHeadline ?? "",
      text: data.instagram?.ctaText ?? "",
      handle: data.instagram?.handle ?? "",
      url: data.instagram?.url ?? "#",
    },
    kontakt: {
      adresse: `${data.strasse ?? ""}\n${data.plz ?? ""} ${data.ort ?? ""}`.trim(),
      telefonLabel: data.telefonLabel ?? "",
      telefon: data.telefon ?? "",
      telefonHref: data.telefonHref ?? "",
      email: data.email ?? "",
    },
  };
}
```

(`kontakt` is consumed in Task 7 — add it now so the shape is stable; until then only `instagram` is used.)

Extend `Promise.all` with `getFooterDaten()` and render `<InstagramCta {...footerDaten.instagram} />`.

- [ ] **Step 8: Verify — including the site-wide effect and revalidation**

```bash
export SCRATCH="${TMPDIR:-/tmp}/htv-plan5"
npm run build
npx next start -p 3111 > "$SCRATCH/start.log" 2>&1 &
echo $! > "$SCRATCH/server.pid"
until curl -sf -o /dev/null http://localhost:3111/; do sleep 1; done

for p in home:/ impressum:/impressum mannschaften:/mannschaften; do
  name="${p%%:*}"; path="${p#*:}"
  curl -s "http://localhost:3111$path" > "$SCRATCH/after-$name.html"
  node "$SCRATCH/normalize.mjs" "$SCRATCH/after-$name.html" > "$SCRATCH/after-$name.txt"
  echo "--- $name ---"
  diff "$SCRATCH/baseline-$name.txt" "$SCRATCH/after-$name.txt" && echo "identical"
done
```

Expected: all three diffs print `identical`. Then prove layout-wide revalidation with the server still running: run a throwaway Local-API script (outside the repo, deleted afterwards) that calls `payload.updateGlobal({ slug: "footer", data: { funFact: "REVALIDIERUNGSTEST" } })` **without** `disableRevalidate` — note that this runs in a separate process, so the hook cannot reach the running server's cache; instead verify revalidation the way plan 2 did: add a temporary route inside the app that performs the same `updateGlobal` in the server process, `curl` it, then `curl -s http://localhost:3111/impressum | grep -c REVALIDIERUNGSTEST` → `1` (i.e. a *page that is not the homepage* picked the change up without a rebuild). Restore the original fun fact through the same route, confirm it is gone, delete the temporary route, and finally `kill "$(cat "$SCRATCH/server.pid")"` and `npm run build` again so the committed tree contains no test route.

- [ ] **Step 9: Commit**

```bash
git add globals/Footer.ts scripts/seed-footer.ts payload.config.ts package.json payload-types.ts migrations components/ui/footer.tsx components/ui/instagram-cta.tsx "app/(frontend)/page.tsx"
git commit -m "Add footer global, seed it and read the site-wide footer and Instagram banner from Payload"
```

---

### Task 6: `kontakt-section` global — the contact block's own copy

**Files:**
- Create: `globals/KontaktSection.ts`, `scripts/seed-kontakt-section.ts`
- Modify: `payload.config.ts`, `package.json`, `components/ui/kontakt-section.tsx`, `app/(frontend)/page.tsx`
- Generated: `migrations/<timestamp>_add_kontakt_section.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Consumes: `revalidateGlobalPaths` (Task 1), `getFooterDaten().kontakt` (Task 5).
- Produces: global slug `"kontakt-section"`; `components/ui/kontakt-section.tsx` exports `type KontaktSectionProps` (extended in Task 8 by nothing — the form wiring keeps the same props).

**Deviation from the spec (justified):** the spec's global table does not list a `kontakt-section` global — it was written before the contact section got its GDPR consent checkbox and its current copy. The overall goal is that *every* content area is editable, and this section contains a headline, an intro, a Maps embed URL and the success message, all of which a board member would plausibly want to change. The club's address/phone/e-mail are **not** duplicated here — they come from the `footer` global, so the site keeps exactly one source for contact data (the spec's core complaint about the old code was duplicated, diverging data).

- [ ] **Step 1: Create `globals/KontaktSection.ts`**

```ts
import type { GlobalConfig } from "payload";

import { revalidateGlobalPaths } from "./hooks/revalidate";

export const KontaktSectionGlobal: GlobalConfig = {
  slug: "kontakt-section",
  label: "Startseite: Kontaktbereich",
  admin: {
    group: "Startseite",
    description:
      "Adresse, Telefon und E-Mail stammen aus „Footer & Kontaktdaten“ — hier stehen nur die Texte dieses Abschnitts.",
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalPaths(["/"])],
  },
  fields: [
    { name: "eyebrow", type: "text", required: true, maxLength: 60, label: "Kleine Überschrift" },
    { name: "headlineTeil1", type: "text", required: true, maxLength: 60, label: "Überschrift (erster Teil)" },
    {
      name: "headlineTeil2",
      type: "text",
      required: true,
      maxLength: 60,
      label: "Überschrift (unterstrichener Teil)",
    },
    { name: "intro", type: "textarea", required: true, maxLength: 400, label: "Einleitungstext" },
    {
      name: "mapsEmbedUrl",
      type: "text",
      required: true,
      maxLength: 1000,
      label: "Google-Maps-Einbettungsadresse",
      admin: {
        description:
          'In Google Maps: Teilen → Karte einbetten → die Adresse aus dem src="…" kopieren. Die Karte wird erst nach Cookie-Einwilligung geladen.',
      },
    },
    { name: "mapsTitel", type: "text", required: true, maxLength: 120, label: "Titel der Karte (Barrierefreiheit)" },
    { name: "erfolgTitel", type: "text", required: true, maxLength: 80, label: "Bestätigung: Überschrift" },
    { name: "erfolgText", type: "text", required: true, maxLength: 200, label: "Bestätigung: Text" },
  ],
};
```

- [ ] **Step 2: Register, migrate, types**

`import { KontaktSectionGlobal } from "./globals/KontaktSection";`, extend `globals` to `[HeroGlobal, WelcomeSectionGlobal, LocationSectionGlobal, FooterGlobal, KontaktSectionGlobal]`, then:

```bash
npm run migrate:create -- add_kontakt_section
npm run migrate
npm run generate:types
```

- [ ] **Step 3: Create `scripts/seed-kontakt-section.ts`**

```ts
import { getPayload } from "payload";

import config from "../payload.config";

const MAPS_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2474.959200775651!2d6.927527713413548!3d51.6605833717312!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b8f26e657412d9%3A0x9088105a5549feb5!2sHardter%20TV!5e0!3m2!1sde!2sde!4v1737024831814!5m2!1sde!2sde";

async function run() {
  const payload = await getPayload({ config });

  const existing = await payload.findGlobal({ slug: "kontakt-section", depth: 0 });
  if (existing?.eyebrow) {
    console.log("skip (already seeded): kontakt-section");
    process.exit(0);
  }

  await payload.updateGlobal({
    slug: "kontakt-section",
    data: {
      eyebrow: "Kontakt",
      headlineTeil1: "Schreibe",
      headlineTeil2: "uns direkt",
      intro: "Nehmt direkt Kontakt mit uns auf — wir melden uns so schnell wie möglich.",
      mapsEmbedUrl: MAPS_EMBED,
      mapsTitel: "Standort Hardter TV",
      erfolgTitel: "Nachricht gesendet!",
      erfolgText: "Wir melden uns bald bei dir.",
    },
    context: { disableRevalidate: true },
  });

  console.log("seeded: kontakt-section");
  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Add to `package.json` scripts: `"seed:kontakt-section": "dotenv -e .env.local -- tsx scripts/seed-kontakt-section.ts",`

- [ ] **Step 4: Run the seed and verify** — `npm run seed:kontakt-section` → `seeded:`, `done`; re-run → `skip`. Throwaway check: `mapsEmbedUrl` starts with `https://www.google.com/maps/embed?pb=`, `erfolgTitel === "Nachricht gesendet!"`.

- [ ] **Step 5: Rewire `components/ui/kontakt-section.tsx`** (content only — the form still uses the existing fake handler; Task 8 replaces it)

Delete the module-level `kontaktInfo` constant. Add props and build the info tiles from them:

```tsx
export type KontaktSectionProps = {
  eyebrow: string;
  headlineTeil1: string;
  headlineTeil2: string;
  intro: string;
  mapsEmbedUrl: string;
  mapsTitel: string;
  erfolgTitel: string;
  erfolgText: string;
  adresse: string;
  telefonLabel: string;
  telefon: string;
  telefonHref: string;
  email: string;
};

export default function KontaktSection({
  eyebrow,
  headlineTeil1,
  headlineTeil2,
  intro,
  mapsEmbedUrl,
  mapsTitel,
  erfolgTitel,
  erfolgText,
  adresse,
  telefonLabel,
  telefon,
  telefonHref,
  email,
}: KontaktSectionProps) {
  const [sent, setSent] = useState(false);

  const kontaktInfo = [
    { icon: MapPin, label: "Adresse", wert: adresse, href: undefined as string | undefined },
    { icon: Phone, label: telefonLabel, wert: telefon, href: telefonHref },
    { icon: Mail, label: "E-Mail", wert: email, href: `mailto:${email}` },
  ];
```

Then in the markup:

- eyebrow `Kontakt` → `{eyebrow}`
- headline: `<BlurTextEffect>{`${headlineTeil1} `}</BlurTextEffect>` and `<BlurTextEffect>{headlineTeil2}</BlurTextEffect>` (trailing space intentional, see Task 4)
- intro `<p>` → `{intro}`
- success block: `Nachricht gesendet!` → `{erfolgTitel}`, `Wir melden uns bald bei dir.` → `{erfolgText}`
- the map: `src={mapsEmbedUrl}` and `title={mapsTitel}`

Everything else (the `kontaktInfo.map(...)` block, the whole form, the consent checkbox) stays byte-identical.

- [ ] **Step 6: Fetch in `app/(frontend)/page.tsx`**

```tsx
async function getKontaktTexte() {
  const payload = await getPayload({ config });
  const data = await payload.findGlobal({ slug: "kontakt-section", depth: 0 });
  return {
    eyebrow: data.eyebrow ?? "",
    headlineTeil1: data.headlineTeil1 ?? "",
    headlineTeil2: data.headlineTeil2 ?? "",
    intro: data.intro ?? "",
    mapsEmbedUrl: data.mapsEmbedUrl ?? "",
    mapsTitel: data.mapsTitel ?? "",
    erfolgTitel: data.erfolgTitel ?? "",
    erfolgText: data.erfolgText ?? "",
  };
}
```

Extend `Promise.all` and render:

```tsx
      <KontaktSection {...kontaktTexte} {...footerDaten.kontakt} />
```

- [ ] **Step 7: Verify** — `npm run build`, start on 3111, curl `/`, normalize, `diff` against `$SCRATCH/baseline-home.txt` → **empty**. Kill the server by PID.

- [ ] **Step 8: Commit**

```bash
git add globals/KontaktSection.ts scripts/seed-kontakt-section.ts payload.config.ts package.json payload-types.ts migrations components/ui/kontakt-section.tsx "app/(frontend)/page.tsx"
git commit -m "Add kontakt-section global and read the homepage contact block from Payload"
```

---

### Task 7: `contact-submissions` collection — private storage for form messages

**Files:**
- Create: `collections/ContactSubmissions.ts`
- Modify: `payload.config.ts`
- Generated: `migrations/<timestamp>_add_contact_submissions.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Produces (used by Task 8): collection slug `"contact-submissions"` with `name` (text, required, max 120), `email` (email, required), `telefon` (text, optional, max 60), `nachricht` (textarea, required, max 5000), `einwilligung` (checkbox, must be `true`), `einwilligungAm` (date, required), `gelesen` (checkbox, default false). `createdAt`/`updatedAt` come from Payload automatically.

**Access rules and why:**
- `create: () => false` — **nobody** may create a submission through REST or GraphQL. The form writes through the **Local API** inside a Server Action, and `payload.create()` defaults to `overrideAccess: true`, so the deny rule does not affect it. This closes the public write endpoint that a `create: () => true` would otherwise open to the whole internet.
- `read: authenticated` and `update: authenticated` — any logged-in board member (admin *or* editor) may read messages and tick `gelesen`; that is the whole point of the inbox. Submissions are never rendered on the public site and never fetched by a page.
- `delete: admin only` — deleting a message is irreversible and touches a record that may have to be produced as proof of consent; restrict it to admins.
- Every content field additionally carries `access: { update: () => false }` and `admin: { readOnly: true }`, so the submitted text and the consent record cannot be edited after the fact — only `gelesen` is mutable.

- [ ] **Step 1: Create `collections/ContactSubmissions.ts`**

```ts
import type { Access, CollectionConfig } from "payload";

const isAuthenticated: Access = ({ req }) => Boolean(req.user);
const isAdmin: Access = ({ req }) => req.user?.role === "admin";

export const ContactSubmissions: CollectionConfig = {
  slug: "contact-submissions",
  labels: { singular: "Kontaktanfrage", plural: "Kontaktanfragen" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "gelesen", "createdAt"],
    group: "Kontakt",
    description:
      "Nachrichten aus dem Kontaktformular. Personenbezogene Daten — nur für angemeldete Benutzer sichtbar.",
  },
  defaultSort: "-createdAt",
  access: {
    // Anlegen ausschließlich über die Server Action (Local API, overrideAccess: true).
    // Über REST/GraphQL ist das Anlegen für alle gesperrt.
    create: () => false,
    read: isAuthenticated,
    update: isAuthenticated,
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      maxLength: 120,
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "email",
      type: "email",
      required: true,
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "telefon",
      type: "text",
      maxLength: 60,
      access: { update: () => false },
      admin: { readOnly: true, description: "Wird vom aktuellen Formular nicht abgefragt." },
    },
    {
      name: "nachricht",
      type: "textarea",
      required: true,
      maxLength: 5000,
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "einwilligung",
      type: "checkbox",
      required: true,
      label: "Einwilligung in die Datenverarbeitung",
      validate: (value) =>
        value === true ||
        "Ohne Einwilligung in die Datenverarbeitung darf die Anfrage nicht gespeichert werden.",
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "einwilligungAm",
      type: "date",
      required: true,
      label: "Einwilligung erteilt am",
      access: { update: () => false },
      admin: {
        readOnly: true,
        date: { pickerAppearance: "dayAndTime", displayFormat: "dd.MM.yyyy HH:mm" },
      },
    },
    {
      name: "gelesen",
      type: "checkbox",
      defaultValue: false,
      label: "Gelesen / bearbeitet",
    },
  ],
};
```

- [ ] **Step 2: Register, migrate, types**

In `payload.config.ts`: `import { ContactSubmissions } from "./collections/ContactSubmissions";` and extend `collections` to `[Users, Media, Teams, BoardMembers, Events, ContactSubmissions]` (append at the end; plan 3 appends its own collections — keep your entry last relative to what is there when you edit). Then:

```bash
npm run migrate:create -- add_contact_submissions
npm run migrate
npm run generate:types
```

Expected: a `contact_submissions` table; `payload-types.ts` gains `ContactSubmission`.

- [ ] **Step 3: Prove the collection is private — anonymous access must be rejected**

```bash
export SCRATCH="${TMPDIR:-/tmp}/htv-plan5"
npm run build
npx next start -p 3111 > "$SCRATCH/start.log" 2>&1 &
echo $! > "$SCRATCH/server.pid"
until curl -sf -o /dev/null http://localhost:3111/; do sleep 1; done

echo -n "POST:  "; curl -s -o "$SCRATCH/post.json" -w "%{http_code}\n" \
  -X POST http://localhost:3111/api/contact-submissions \
  -H 'Content-Type: application/json' \
  -d '{"name":"Angreifer","email":"a@b.de","nachricht":"spam","einwilligung":true,"einwilligungAm":"2026-09-19T10:00:00.000Z"}'
echo -n "GET:   "; curl -s -o "$SCRATCH/get.json" -w "%{http_code}\n" http://localhost:3111/api/contact-submissions
cat "$SCRATCH/post.json"; echo; cat "$SCRATCH/get.json"; echo

kill "$(cat "$SCRATCH/server.pid")"
```

Expected: **both** status codes are `401` or `403` and the bodies contain a Payload "Forbidden"/"Unauthorized" error — never `201`/`200` with data. Additionally confirm with a throwaway Local-API script that the collection is still empty (`totalDocs === 0`), i.e. the rejected POST really did not write anything.

Also confirm nothing leaks into the public site: `git grep -n "contact-submissions" -- app components lib` must show **no** page/component reading the collection (Task 8 adds exactly one hit in `lib/actions/kontakt.ts`, which only writes).

- [ ] **Step 4: Commit**

```bash
git add collections/ContactSubmissions.ts payload.config.ts payload-types.ts migrations
git commit -m "Add private contact-submissions collection with authenticated-only access"
```

---

### Task 8: Server Action + real contact form

**Files:**
- Create: `lib/kontakt-validation.ts`, `lib/actions/kontakt.ts`
- Modify: `components/ui/kontakt-section.tsx`
- Temporary (deleted before the commit): `app/(frontend)/kontakt-test/route.ts`

**Interfaces:**
- Consumes: `contact-submissions` (Task 7), `KontaktSectionProps` (Task 6).
- Produces: `lib/kontakt-validation.ts` exports `validateKontakt(eingabe): { ok: true; data } | { ok: false; error; fieldErrors }` plus `KONTAKT_LIMITS`; `lib/actions/kontakt.ts` exports `sendeKontaktanfrage(prev, formData): Promise<KontaktResult>` with `KontaktResult = { ok: true } | { ok: false; error: string; fieldErrors?: … }`.

**Design decisions:**
- The **pure validation** lives in a separate, non-`"use server"` module so it can be executed directly by a throwaway `tsx` script — a Server Action module cannot be imported into plain Node.
- **Abuse protection without new infrastructure:** (a) a honeypot text field `website` that is visually hidden and `aria-hidden`; (b) a hidden `gestartetAm` timestamp written by `useEffect` after hydration — submissions faster than 2 s are treated as bots; (c) hard length caps in validation *and* in the collection's field config. Both bot paths return `{ ok: true }` **without storing anything**, so a bot learns nothing. No captcha, no third-party anti-spam service, no rate-limit store — those would need infrastructure that is out of scope.
- **Data minimization:** IP address and user agent are **not** stored. They would be personal data whose only purpose would be abuse defence, which the honeypot/timing checks already cover well enough for a club website with a handful of messages per month; storing them would need its own legal basis and a retention rule. What *is* stored is the consent flag plus its timestamp (`einwilligung`, `einwilligungAm`) — the GDPR proof of consent.
- **No e-mail notification** (explicitly out of scope per the spec) — board members see new messages in `/admin`. See "Notes for the user".

- [ ] **Step 1: Create `lib/kontakt-validation.ts`**

```ts
export type KontaktFeld = "name" | "email" | "telefon" | "nachricht" | "datenschutz";

export type KontaktEingabe = {
  name: string;
  email: string;
  telefon: string;
  nachricht: string;
  datenschutz: boolean;
};

export type KontaktFeldFehler = Partial<Record<KontaktFeld, string>>;

export type KontaktValidierung =
  | { ok: true; data: { name: string; email: string; telefon: string; nachricht: string } }
  | { ok: false; error: string; fieldErrors: KontaktFeldFehler };

export const KONTAKT_LIMITS = {
  nameMin: 2,
  nameMax: 120,
  emailMax: 200,
  telefonMax: 60,
  nachrichtMin: 10,
  nachrichtMax: 5000,
};

const EMAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export function validateKontakt(eingabe: KontaktEingabe): KontaktValidierung {
  const name = eingabe.name.trim();
  const email = eingabe.email.trim();
  const telefon = eingabe.telefon.trim();
  const nachricht = eingabe.nachricht.trim();

  const fieldErrors: KontaktFeldFehler = {};

  if (name.length < KONTAKT_LIMITS.nameMin) {
    fieldErrors.name = `Bitte gib deinen Namen an (mindestens ${KONTAKT_LIMITS.nameMin} Zeichen).`;
  } else if (name.length > KONTAKT_LIMITS.nameMax) {
    fieldErrors.name = `Der Name darf höchstens ${KONTAKT_LIMITS.nameMax} Zeichen lang sein.`;
  }

  if (email.length === 0) {
    fieldErrors.email = "Bitte gib deine E-Mail-Adresse an.";
  } else if (email.length > KONTAKT_LIMITS.emailMax) {
    fieldErrors.email = "Diese E-Mail-Adresse ist zu lang.";
  } else if (!EMAIL_MUSTER.test(email)) {
    fieldErrors.email = "Diese E-Mail-Adresse sieht nicht gültig aus.";
  }

  if (telefon.length > KONTAKT_LIMITS.telefonMax) {
    fieldErrors.telefon = "Diese Telefonnummer ist zu lang.";
  }

  if (nachricht.length < KONTAKT_LIMITS.nachrichtMin) {
    fieldErrors.nachricht = `Bitte schreib uns ein paar Worte (mindestens ${KONTAKT_LIMITS.nachrichtMin} Zeichen).`;
  } else if (nachricht.length > KONTAKT_LIMITS.nachrichtMax) {
    fieldErrors.nachricht = `Die Nachricht darf höchstens ${KONTAKT_LIMITS.nachrichtMax} Zeichen lang sein.`;
  }

  if (!eingabe.datenschutz) {
    fieldErrors.datenschutz =
      "Bitte stimme der Verarbeitung deiner Daten zu — ohne Einwilligung dürfen wir deine Nachricht nicht speichern.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Bitte prüfe die markierten Felder.", fieldErrors };
  }

  return { ok: true, data: { name, email, telefon, nachricht } };
}
```

- [ ] **Step 2: Create `lib/actions/kontakt.ts`**

```ts
"use server";

import { getPayload } from "payload";
import config from "@payload-config";

import { validateKontakt, type KontaktFeldFehler } from "@/lib/kontakt-validation";

export type KontaktResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: KontaktFeldFehler };

/** Schneller als das ist kein Mensch — dann ist es ein Bot. */
const MINDESTDAUER_MS = 2000;

export async function sendeKontaktanfrage(
  _prev: KontaktResult | null,
  formData: FormData,
): Promise<KontaktResult> {
  // 1. Honeypot: ein für Menschen unsichtbares Feld. Ausgefüllt = Bot.
  //    Wir melden trotzdem Erfolg, damit der Bot nichts lernt — speichern aber nichts.
  if (String(formData.get("website") ?? "").trim().length > 0) {
    return { ok: true };
  }

  // 2. Zeitfalle: das Formular wurde in unter 2 Sekunden abgeschickt.
  //    Fehlt der Wert (kein JavaScript), wird die Prüfung übersprungen.
  const gestartetAm = Number(formData.get("gestartetAm"));
  if (
    Number.isFinite(gestartetAm) &&
    gestartetAm > 0 &&
    Date.now() - gestartetAm < MINDESTDAUER_MS
  ) {
    return { ok: true };
  }

  // 3. Serverseitige Validierung.
  const validierung = validateKontakt({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    telefon: String(formData.get("telefon") ?? ""),
    nachricht: String(formData.get("message") ?? ""),
    datenschutz: formData.get("datenschutz") != null,
  });

  if (!validierung.ok) {
    return { ok: false, error: validierung.error, fieldErrors: validierung.fieldErrors };
  }

  // 4. Speichern über die Local API. `create` ist für REST/GraphQL gesperrt;
  //    die Local API läuft standardmäßig mit overrideAccess: true.
  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "contact-submissions",
      data: {
        name: validierung.data.name,
        email: validierung.data.email,
        telefon: validierung.data.telefon.length > 0 ? validierung.data.telefon : undefined,
        nachricht: validierung.data.nachricht,
        einwilligung: true,
        einwilligungAm: new Date().toISOString(),
        gelesen: false,
      },
    });
  } catch (error) {
    console.error("[kontakt] Anfrage konnte nicht gespeichert werden:", error);
    return {
      ok: false,
      error:
        "Deine Nachricht konnte gerade nicht gespeichert werden. Bitte versuche es später noch einmal oder schreib uns direkt eine E-Mail.",
    };
  }

  return { ok: true };
}
```

- [ ] **Step 3: Wire the form in `components/ui/kontakt-section.tsx`**

Replace the React import, drop `useState`/`handleSubmit`, and add the action state. All existing classes stay; the only new markup is the honeypot, the hidden timestamp, the field error paragraphs and the general error box.

```tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";
import { FadeIn } from "@/components/ui/fade-in";
import { MapsConsentGate } from "@/components/ui/maps-consent-gate";
import { sendeKontaktanfrage, type KontaktResult } from "@/lib/actions/kontakt";
```

Inside the component, replace `const [sent, setSent] = useState(false);` and `handleSubmit` with:

```tsx
  const [result, formAction, pending] = useActionState<KontaktResult | null, FormData>(
    sendeKontaktanfrage,
    null,
  );
  const sent = result?.ok === true;
  const fieldErrors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  const generalError = result && !result.ok ? result.error : null;

  const startRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startRef.current) startRef.current.value = String(Date.now());
  }, []);
```

Form element: `<form onSubmit={handleSubmit} …>` → `<form action={formAction} className="flex flex-col gap-4">`, and directly after the opening tag:

```tsx
                  <input ref={startRef} type="hidden" name="gestartetAm" defaultValue="" />
                  <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                    <label htmlFor="website">Dieses Feld bitte leer lassen</label>
                    <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
                  </div>
```

Under the name input, the e-mail input, the textarea and the checkbox row, add (each inside the existing wrapper `div`, as the last child):

```tsx
                      {fieldErrors.name && (
                        <p className="text-xs text-red-600">{fieldErrors.name}</p>
                      )}
```

…analogously `fieldErrors.email`, `fieldErrors.nachricht` and — placed directly after the checkbox row's closing `</div>` — :

```tsx
                  {fieldErrors.datenschutz && (
                    <p className="text-xs text-red-600">{fieldErrors.datenschutz}</p>
                  )}
                  {generalError && (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {generalError}
                    </p>
                  )}
```

The submit button keeps every class; add the pending state:

```tsx
                  <button
                    type="submit"
                    disabled={pending}
                    aria-busy={pending}
                    className="group flex cursor-pointer items-center gap-0 self-start rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                      {pending ? "Wird gesendet…" : "Nachricht senden"}
                    </span>
```

(the two `ArrowUpRight` icons below it are unchanged).

The success block (`sent ? … : …`) already renders `{erfolgTitel}` / `{erfolgText}` from Task 6 — nothing to change there.

- [ ] **Step 4: Test the pure validation (throwaway, outside the repo)**

Write `$SCRATCH/check-validation.ts` importing `validateKontakt` from the repo by absolute path and assert:

| input | expectation |
|---|---|
| valid name/email/message, consent `true` | `ok === true`, trimmed values |
| name `"A"` | `ok === false`, `fieldErrors.name` set |
| email `"keine-mail"` | `fieldErrors.email` set |
| message `"kurz"` | `fieldErrors.nachricht` set |
| consent `false` | `fieldErrors.datenschutz` set |
| name of 200 chars | `fieldErrors.name` set |
| message of 6000 chars | `fieldErrors.nachricht` set |

Run with `npx tsx "$SCRATCH/check-validation.ts"`; every assertion must pass. Delete the file.

- [ ] **Step 5: End-to-end test of the Server Action through a temporary route**

Create `app/(frontend)/kontakt-test/route.ts` **temporarily** (it is deleted in Step 7):

```ts
import { sendeKontaktanfrage } from "@/lib/actions/kontakt";

const TEST_NAME = "PLAN5 Testanfrage";

export async function GET(request: Request) {
  const fall = new URL(request.url).searchParams.get("fall") ?? "gueltig";
  const fd = new FormData();

  fd.set("name", TEST_NAME);
  fd.set("email", "test@example.org");
  fd.set("message", "Dies ist eine automatisierte Prüfung des Kontaktformulars.");
  fd.set("datenschutz", "on");
  fd.set("gestartetAm", String(Date.now() - 60_000));

  if (fall === "ohne-name") fd.set("name", "");
  if (fall === "falsche-mail") fd.set("email", "keine-mail");
  if (fall === "ohne-einwilligung") fd.delete("datenschutz");
  if (fall === "honeypot") fd.set("website", "http://spam.example");
  if (fall === "zu-schnell") fd.set("gestartetAm", String(Date.now()));

  return Response.json({ fall, result: await sendeKontaktanfrage(null, fd) });
}
```

Then:

```bash
export SCRATCH="${TMPDIR:-/tmp}/htv-plan5"
npm run build
npx next start -p 3111 > "$SCRATCH/start.log" 2>&1 &
echo $! > "$SCRATCH/server.pid"
until curl -sf -o /dev/null http://localhost:3111/; do sleep 1; done

for fall in gueltig ohne-name falsche-mail ohne-einwilligung honeypot zu-schnell; do
  echo -n "$fall -> "; curl -s "http://localhost:3111/kontakt-test?fall=$fall"; echo
done

kill "$(cat "$SCRATCH/server.pid")"
```

Expected exactly:

| `fall` | expected JSON `result` |
|---|---|
| `gueltig` | `{"ok":true}` |
| `ohne-name` | `{"ok":false,"error":"Bitte prüfe die markierten Felder.","fieldErrors":{"name":…}}` |
| `falsche-mail` | `ok:false` with `fieldErrors.email` |
| `ohne-einwilligung` | `ok:false` with `fieldErrors.datenschutz` |
| `honeypot` | `{"ok":true}` (but nothing stored — verified next) |
| `zu-schnell` | `{"ok":true}` (but nothing stored) |

- [ ] **Step 6: Prove what was (and was not) stored, then clean up the data**

Throwaway Local-API script (outside the repo, deleted afterwards): `payload.find({ collection: "contact-submissions", where: { name: { equals: "PLAN5 Testanfrage" } }, limit: 100 })` must return **exactly 1** document (only the `gueltig` case) with `email === "test@example.org"`, `einwilligung === true`, a non-empty `einwilligungAm` and `gelesen === false`. Then delete it via `payload.delete({ collection: "contact-submissions", where: { name: { equals: "PLAN5 Testanfrage" } } })` and re-run the find → `totalDocs === 0`. Delete the script.

- [ ] **Step 7: Remove the temporary route, rebuild, final visual check**

```bash
rm "app/(frontend)/kontakt-test/route.ts"
rmdir "app/(frontend)/kontakt-test"
npm run build
npx next start -p 3111 > "$SCRATCH/start.log" 2>&1 &
echo $! > "$SCRATCH/server.pid"
until curl -sf -o /dev/null http://localhost:3111/; do sleep 1; done

curl -s -o /dev/null -w "kontakt-test route gone: %{http_code}\n" http://localhost:3111/kontakt-test
curl -s http://localhost:3111/ > "$SCRATCH/after-home.html"
node "$SCRATCH/normalize.mjs" "$SCRATCH/after-home.html" > "$SCRATCH/after-home.txt"
diff "$SCRATCH/baseline-home.txt" "$SCRATCH/after-home.txt"

kill "$(cat "$SCRATCH/server.pid")"
git status --short
```

Expected: the test route returns `404`; the `diff` shows **only** the honeypot label `Dieses Feld bitte leer lassen` as an addition and nothing else (the error texts and "Wird gesendet…" only appear after an interaction, so they are not in the initial HTML) — explain that single difference in the report. `git status --short` must not list `app/(frontend)/kontakt-test/` or any scratch file.

- [ ] **Step 8: Commit**

```bash
git add lib/kontakt-validation.ts lib/actions/kontakt.ts components/ui/kontakt-section.tsx
git commit -m "Make the contact form real: server action, validation, honeypot and consent storage"
```

---

## Notes for the user

**Inhaltliche Entscheidungen**
- Alle sichtbaren Texte der Startseiten-Bereiche und des Footers sind jetzt im Admin änderbar. Nicht änderbar bleiben bewusst: die Link-Ziele auf interne Seiten, die Linklisten „Schnelle Links“ und die Rechtslinks im Footer (sie bilden echte Routen ab — wie die Navbar laut Spec), die Feldbeschriftungen und der Einwilligungssatz im Formular sowie die Icons.
- Der Begrüßungstext wurde als **Textarea mit Absatz-Trennung durch Leerzeilen** umgesetzt statt als Lexical-Richtext (Abweichung von der Spec, im Plan begründet): das aktuelle Design kennt nur schlichte Absätze, und nur so bleibt das HTML identisch. Ein späterer Wechsel auf Richtext betrifft genau ein Feld.
- Zusätzlich zur Spec gibt es das Global **„Startseite: Kontaktbereich“** (Überschrift, Einleitung, Google-Maps-Adresse, Bestätigungstexte). Adresse, Telefon und E-Mail stehen dort **nicht** — sie kommen aus „Footer & Kontaktdaten“, damit es genau eine Quelle für Vereinskontaktdaten gibt.
- Das Copyright-Jahr im Footer wird jetzt automatisch eingesetzt (nur der Name ist redaktionell). 2026 ändert sich dadurch nichts.

**Auffälligkeiten aus dem Bestand (unverändert übernommen, nicht stillschweigend korrigiert)**
- Der Anruf-Link der Telefonnummer lautet `tel:+4917225800209`; zur angezeigten Nummer `0172 25 80 209` würde `tel:+491722580209` passen — im Link steckt vermutlich eine Null zu viel. Bitte prüfen und im Admin-Feld „Telefonnummer (Anruf-Link)“ korrigieren.
- Alle drei Kontaktpersonen im Footer (Oliver Wiegand, Hendrick Büncker, Marco Hohenstein) verlinken auf dieselbe Adresse `1.vorsitzender@hardt-tennis.de`. Jede Person hat jetzt ein eigenes E-Mail-Feld — die individuellen Adressen können einfach nachgetragen werden.
- Das Hero-Bild `hero-new.png` wird auch von der Standort-Karte „6 Ascheplätze“ benutzt. Beide Seeds laden die Datei hoch, es liegen also zwei Media-Einträge derselben Datei in der Mediathek. Wer das aufräumen will, kann in der Standort-Karte das Hero-Bild auswählen und den doppelten Eintrag löschen.
- Die Dateien unter `public/images/` bleiben im Repo — andere Seiten (Galerie, Mannschaften) benutzen sie noch; Plan 3 räumt dort auf.

**DSGVO / Kontaktanfragen**
- Gespeichert werden ausschließlich: Name, E-Mail, optional Telefon, Nachricht, die Einwilligung und ihr Zeitstempel. **IP-Adresse und Browserkennung werden bewusst nicht gespeichert** (Datenminimierung) — Spamschutz läuft über Honeypot, Zeitfalle und Längenbegrenzungen.
- Anfragen sind **nur für angemeldete Benutzer** sichtbar; das Anlegen über die öffentliche REST-/GraphQL-Schnittstelle ist komplett gesperrt, löschen dürfen nur Admins. Inhalte einer Anfrage sind nachträglich nicht editierbar (nur der Haken „Gelesen“).
- Die Datenschutzerklärung nennt bereits „Speicherdauer: bis zur abschließenden Bearbeitung der Anfrage, längstens 3 Jahre“. Diese Frist wird **technisch nicht automatisch durchgesetzt** — es braucht eine Routine (z. B. einmal jährlich alte Anfragen im Admin löschen). Empfehlung: das im Vorstand festhalten. Ergänzend sollte die Datenschutzerklärung erwähnen, dass die Nachrichten in der Vereinsdatenbank (Neon Postgres) gespeichert werden; bitte auch prüfen, ob Auftragsverarbeitungsverträge mit Vercel und Neon vorliegen und die Datenbankregion in der EU liegt. (Die Datenschutzseite wandert in Plan 3 ins CMS — die Ergänzung am besten dort einpflegen.)
- **Es werden keine E-Mails verschickt** (laut Spec außer Scope). Neue Nachrichten sieht der Vorstand nur unter `/admin` → „Kontaktanfragen“. Wer eine Benachrichtigung will, braucht später einen Mailversand (z. B. Resend) — das ist ein eigener, kleiner Folgeschritt.
- Das Formular fragt weiterhin **keine Telefonnummer** ab (das Design bleibt unangetastet); das Feld existiert in der Sammlung bereits für den Fall, dass es später ergänzt wird.

**Technisch**
- `app/(frontend)/layout.tsx` wurde bewusst nicht angefasst: der Footer lädt seine Daten selbst. Dadurch kollidiert dieser Plan nicht mit den parallel laufenden Plänen 3 und 4.
- Nach einer Änderung am Footer-Global wird der komplette Layout-Cache neu erzeugt (`revalidatePath("/", "layout")`), weil der Footer auf jeder Seite steht — das ist gewollt teurer als eine Pfadliste, aber die einzige korrekte Variante.

---

## What This Plan Deliberately Does Not Cover

- **Galerie, News und Rechtsseiten** (Plan 3) sowie **Mitgliedschaft, Training und Eisstock** (Plan 4).
- **Navbar** — bleibt laut Spec im Code: die Einträge bilden 1:1 reale Routen ab, CMS-Pflege würde tote Links ohne Sicherheitsnetz riskieren. Aus demselben Grund bleiben auch die Footer-Linkliste und die Rechtslinks in der Fußzeile im Code.
- **Cookie-Banner und Maps-Consent-Gate** (`components/ui/cookie-banner.tsx`, `maps-consent-gate.tsx`, `hooks/use-cookie-consent.ts`) — das ist Verhalten und Einwilligungslogik, kein redaktioneller Inhalt. Nur die eingebettete Maps-Adresse ist jetzt redaktionell pflegbar.
- **Die Seiten-Metadaten in `app/(frontend)/layout.tsx`** (title/description/keywords/OpenGraph/Twitter/geo/`verification`/`robots`) bleiben im Code: das ist technische SEO-Konfiguration, keine Vereinsinhalte, und `robots: { index: false }` ist ein bewusster Pre-Launch-Schalter, der genau einmal und mit Bedacht umgelegt wird — er darf nicht versehentlich über ein Admin-Formular kippen. Ein eventuelles `seo`-Global gehört in einen eigenen Plan, zusammen mit der Launch-Entscheidung.
- **E-Mail-Benachrichtigung bei neuen Kontaktanfragen** (Spec: explizit außer Scope), **Captcha / Rate-Limiting / externe Spam-Dienste** (bräuchten neue Infrastruktur) und ein **automatisches Löschen alter Anfragen** nach Ablauf der Aufbewahrungsfrist.
- **Draft-/Publish-Workflow und Versionen** — laut Spec bewusst nicht vorgesehen.
- **Deployment** (Vercel Preview/Production, Migrationen in der Produktionsdatenbank) — macht der Controller nach dem Review, nicht eine Task hier.
