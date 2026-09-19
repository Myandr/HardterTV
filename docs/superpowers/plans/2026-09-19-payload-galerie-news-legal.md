# Galerie, News und Rechtsseiten in Payload — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the photo gallery, the (currently disabled) news section and the three legal pages (Impressum, Datenschutz, Cookies) into Payload, so the board can add gallery albums, publish news and correct legal texts without a code change. The gallery stops being a filename-interpolation hack, the news section becomes data-driven (and only renders when there is news), and the legal pages keep their exact wording while their bodies become editable rich text.

**Architecture:** Three new Payload collections (`gallery-albums`, `news`, `legal-pages`) with migrations. `gallery-albums` and `legal-pages` are seeded once from the existing hardcoded content; `news` is deliberately **not** seeded (see Task 3 and "Notes for the user"). Frontend server components read via the Payload Local API and pass plain props to the existing (mostly client) UI components, which keep their markup and classes. Legal bodies are stored as Lexical rich text, seeded by converting hand-written Markdown with `convertMarkdownToLexical`, and rendered with `RichText` from `@payloadcms/richtext-lexical/react` through one small styled wrapper. Page shells (hero, headline, back-link, cookie-settings widget) stay in code. Edits in the admin revalidate the affected pages.

**Tech Stack:** Payload 3.89 (`@payloadcms/db-postgres` on Neon, `@payloadcms/storage-vercel-blob`), `@payloadcms/richtext-lexical` 3.89, Next.js 16.2 App Router, React 19, Tailwind 4, TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-17-payload-cms-migration-design.md`
**Builds on:** `docs/superpowers/plans/2026-09-17-payload-foundation-teams.md` and `docs/superpowers/plans/2026-09-19-payload-vorstand-termine.md` (both done; branch `worktree-payload-cms-foundation`). Collection pattern to follow: `hardtertv/collections/Events.ts` + `hardtertv/collections/hooks/revalidate.ts`. Seed pattern: `hardtertv/scripts/seed-board-members.ts`.

## Global Constraints

- All paths below are relative to the Next.js project root `hardtertv/` unless stated otherwise. Run all commands from `hardtertv/`.
- **Never run `next dev` (or `npm run dev`).** The Neon database is shared and real; `next dev` pushes schema changes directly into it and leaves a stale `dev` row in `payload_migrations` that makes `payload migrate` hang (a real incident in an earlier plan). Verification = `npm run build` + a started production server + `curl` + throwaway Local-API scripts.
- **Server port:** port 3000 may be occupied by a foreign process that is not ours. Always start the verification server on 3111: `npx next start -p 3111 > /tmp/htv-verify.log 2>&1 & echo $! > /tmp/htv-verify.pid`. Stop it with `kill "$(cat /tmp/htv-verify.pid)"` — **never** `pkill -f next-server` or `pkill next`, that would kill someone else's server.
- **Never use a foreground `sleep` to wait for the server.** Use curl's retry: `curl -sS --retry 30 --retry-delay 1 --retry-connrefused -o <out> http://localhost:3111<path>`.
- `payload.config.ts` has `push: false` — schema changes only through migrations. Fixed order per collection: write the collection file → register it in `payload.config.ts` → `npm run migrate:create -- <name>` → `npm run migrate` → `npm run generate:types` → only then seed or boot anything else. If `migrate` prompts anything (e.g. about "dev mode"), **stop and report BLOCKED** — do not answer the prompt.
- Publish workflow: immediate/live on save, no `versions`/drafts.
- Access: `read: () => true` on all three new collections (public site content). `create`/`update`/`delete` keep Payload's default (authenticated) **except** `legal-pages`, which additionally sets `create: () => false` and `delete: () => false` so the 3 seeded documents can only be updated, never duplicated or deleted. The `users` collection access is already locked down — do not touch it. `contact-submissions` does not exist yet and is not part of this plan.
- Revalidation: every collection revalidates the pages it feeds after change/delete, guarded by `req.context?.disableRevalidate`. Seed scripts **must** pass `context: { disableRevalidate: true }` on every write (`revalidatePath` throws outside a Next request). Reuse the shared helpers in `collections/hooks/revalidate.ts`. Do not add global helpers — globals come in a later plan.
- Seed scripts are one-time, idempotent and self-contained (all data embedded in the script). Images come from `public/images/...` and are uploaded with `payload.create({ collection: "media", data: { alt }, filePath })` — `alt` is required on `media`. The resulting `url` is a relative `/api/media/file/<name>` and works with `next/image` as-is (proven for teams, board members).
- Seeds use the **Local API**, whose `overrideAccess` defaults to `true` — so `create: () => false` on `legal-pages` does not block the seed. Do not pass `overrideAccess: false`.
- Payload day-only date fields are stored at 12:00 UTC. Use `toIsoDay` from `lib/events.ts` when formatting (see `lib/news.ts` in Task 3).
- Pages that read Payload data are statically generated: add `export const revalidate = 3600` and rely on the collection hooks for on-demand revalidation.
- **Throwaway verification scripts**: put them in `hardtertv/scripts/` with a `tmp-` prefix (e.g. `scripts/tmp-check-gallery.ts`) so that `import config from "../payload.config"` and `../lib/...` resolve exactly like in the committed seeds, run them with `npx dotenv -e .env.local -- tsx scripts/tmp-<name>.ts`, and `rm` them immediately afterwards. They are **never** committed — before every commit, confirm `git status` lists no `scripts/tmp-*` file. Plain Node helper scripts that do not touch Payload (the HTML text extractor) live in `/tmp/`. Targeted `git add` only — never `git add -A`, never stage or read `.env.local`. New commits, no amends.
- Implementers have no browser. Everything is verified through `curl` against the built + started server, plus Local-API scripts run with `npx tsx`.
- Keep all existing markup, classes and design. Only the data source changes. Where this plan deliberately changes markup (rich-text rendering of the legal bodies), the change is spelled out and covered by a text-equality proof in Task 6.
- Today's date is 2026-09-19.

### Repository facts this plan relies on (verified)

- `payload.config.ts` currently has `collections: [Users, Media, Teams, BoardMembers, Events]` and `editor: lexicalEditor()` (no custom feature list → Payload's default feature set).
- `@payloadcms/richtext-lexical@3.89.0` really exports, verified in `node_modules`:
  - `convertMarkdownToLexical` and `editorConfigFactory` from the package root (`node_modules/@payloadcms/richtext-lexical/dist/index.d.ts` lines 23 and 79; implementation `dist/features/converters/markdownToLexical/index.js`, `dist/utilities/editorConfigFactory.js`). Signatures: `convertMarkdownToLexical({ editorConfig: SanitizedServerEditorConfig, markdown: string })` and `editorConfigFactory.default({ config: SanitizedConfig })` (async).
  - `RichText` and `JSXConvertersFunction` from `@payloadcms/richtext-lexical/react` (`dist/exports/react/index.d.ts`). `RichText` has no `"use client"` → it renders in a Server Component. Its default converters include `LinkJSXConverter({})` (`dist/features/converters/lexicalToJSX/converter/defaultConverters.js`).
  - `convertLexicalToPlaintext` from `@payloadcms/richtext-lexical/plaintext` (`dist/exports/plaintext/index.d.ts`) — used only in throwaway verification.
  - `SerializedEditorState` (type) from `@payloadcms/richtext-lexical/lexical` (that subpath is `export * from 'lexical'`).
  - `convertHTMLToLexical` also exists but requires a `JSDOM` constructor argument, and `jsdom` is **not** installed — that is why this plan converts **Markdown**, not HTML, and adds **no** new dependency.
- The default editor features (`dist/lexical/config/server/default.js`) include `BoldFeature` (`**`), `HeadingFeature` (h1–h6, `#`…), `UnorderedListFeature` (`- `), `OrderedListFeature`, `LinkFeature` (`[text](url)`), `BlockquoteFeature` (`> `). All of these register markdown transformers, so all Markdown used below is actually supported.
- Markdown line-break semantics of the bundled importer (`dist/packages/@lexical/markdown/MarkdownImport.js`, `$importBlocks`): a **blank line** starts a new paragraph; a **single newline** between two non-empty plain lines appends the second line to the previous paragraph **with a `linebreak` node in between**. Empty paragraphs are removed at the end of the import. That means Markdown reproduces the `<br />`-separated address blocks of the current legal pages 1:1 — no post-processing needed.
- Markdown links import with `newTab: false` (`dist/features/link/markdownTransformer.js`), i.e. the rendered `<a>` has **no** `target="_blank"`/`rel`. See Task 5, Step 2 for how the external links get their `newTab` back.
- Tailwind has **no** typography plugin: `app/(frontend)/globals.css` only contains `@import "tailwindcss";` and `@import "tw-animate-css";`. The rich-text styling in Task 4 is therefore hand-written with Tailwind arbitrary variants.
- `components/ui/news-section.tsx` links to `/news`, but **no `/news` route exists** (`app/(frontend)/` has cookies, datenschutz, eisstock, galerie, impressum, kalender, mannschaften, mitgliedschaft, training, vorstand). See Task 3.
- The 17 gallery files really exist: `public/images/Rückblick 2024/Rückblick 2024_1.jpg` … `_17.jpg`.
- `payload-types.ts` ids are `number` (Postgres).

---

## File Structure

```
hardtertv/
  lib/
    news.ts                          # new — German long date formatter for news
    legal-pages.ts                   # new — LEGAL_SLUGS constant + LegalSlug type (NO payload import!)
    get-legal-page.ts                # new — server-side fetch helper for the 3 legal pages
  collections/
    GalleryAlbums.ts                 # new
    News.ts                          # new
    LegalPages.ts                    # new
  components/ui/
    rich-text.tsx                    # new — styled RichText wrapper
    legal-sections.tsx               # new — renders abschnitte[] in the existing card look
    news-section.tsx                 # modified — data via props, image/empty guards
  scripts/
    seed-gallery.ts                  # new — one-time, idempotent, 17 images
    seed-legal-pages.ts              # new — one-time, idempotent, Markdown → Lexical
  app/(frontend)/
    galerie/page.tsx                 # modified — reads gallery-albums
    galerie/galerie-client.tsx       # modified — albums via props, one flat lightbox
    page.tsx                         # modified — fetches news, renders NewsSection conditionally
    impressum/page.tsx               # modified — shell in code, body from Payload
    datenschutz/page.tsx             # modified — shell in code, body from Payload
    cookies/page.tsx                 # modified — intro from Payload, CookieSettings stays code
  migrations/                        # +3 generated migrations
  payload.config.ts                  # modified — register GalleryAlbums, News, LegalPages
  package.json                       # modified — seed:gallery, seed:legal-pages scripts
  payload-types.ts                   # regenerated
```

---

### Task 1: `gallery-albums` collection, migration and seed

**Design decisions (justified):**
- The page today builds **one** implicit album ("Rückblick 2024", 17 images) by interpolating filenames. It becomes **N albums**, newest first (`sort: "-jahr"`). With exactly one seeded album the rendered page is identical to today's — that is the acceptance criterion in Task 2.
- `bilder` is an `upload` field with `hasMany: true` (per spec). Payload preserves the row order of a `hasMany` upload field, so the editor's drag order *is* the display order; the seed uploads the 17 files in filename order 1…17.
- **Alt text strategy:** `media.alt` is required. The seed sets `alt = "Rückblick 2024 – Bild N"` — byte-identical to the current `alt` attributes (en dash). The frontend uses `media.alt` and falls back to the album title, so editor-uploaded photos always have a usable alt.
- No `beschreibung` field: the current page has no per-album text and inventing one would be dead weight.

**Files:**
- Create: `collections/GalleryAlbums.ts`, `scripts/seed-gallery.ts`
- Modify: `payload.config.ts`, `package.json`
- Generated: `migrations/<timestamp>_add_gallery_albums.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Consumes: `revalidatePathsAfterChange` / `revalidatePathsAfterDelete` from `collections/hooks/revalidate.ts` (existing).
- Produces (used by Task 2): collection slug `"gallery-albums"`; fields `titel` (text, required), `jahr` (number, required), `bilder` (upload → `media`, `hasMany: true`, required). `defaultSort: "-jahr"`. Revalidates `/galerie`.

- [ ] **Step 1: Create `collections/GalleryAlbums.ts`**

```ts
import type { CollectionConfig } from "payload";

import { revalidatePathsAfterChange, revalidatePathsAfterDelete } from "./hooks/revalidate";

const PATHS = ["/galerie"];

export const GalleryAlbums: CollectionConfig = {
  slug: "gallery-albums",
  labels: { singular: "Galerie-Album", plural: "Galerie" },
  admin: {
    useAsTitle: "titel",
    defaultColumns: ["titel", "jahr"],
  },
  defaultSort: "-jahr",
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidatePathsAfterChange(PATHS)],
    afterDelete: [revalidatePathsAfterDelete(PATHS)],
  },
  fields: [
    {
      name: "titel",
      type: "text",
      required: true,
      admin: { description: 'z.B. "Rückblick 2024" — erscheint als Überschrift über dem Bilderraster.' },
    },
    {
      name: "jahr",
      type: "number",
      required: true,
      min: 1900,
      max: 2100,
      admin: { description: "Bestimmt die Reihenfolge: neuestes Jahr zuerst." },
    },
    {
      name: "bilder",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      required: true,
      label: "Bilder",
      admin: { description: "Die Reihenfolge hier ist die Reihenfolge auf der Website." },
    },
  ],
};
```

- [ ] **Step 2: Register in `payload.config.ts`, create and run the migration**

In `payload.config.ts` add the import line `import { GalleryAlbums } from "./collections/GalleryAlbums";` below the existing `import { Events } from "./collections/Events";`, and **append** `GalleryAlbums` to the existing `collections` array (it currently reads `collections: [Users, Media, Teams, BoardMembers, Events]` → `collections: [Users, Media, Teams, BoardMembers, Events, GalleryAlbums]`). Then:

```bash
npm run migrate:create -- add_gallery_albums
npm run migrate
npm run generate:types
```

Expected: a new `migrations/*_add_gallery_albums.ts/.json` creating the `gallery_albums` table plus the `gallery_albums_rels` relationship table for `bilder`, `migrations/index.ts` updated, and `payload-types.ts` gaining a `GalleryAlbum` interface. `migrate` must not prompt (if it does: stop, report BLOCKED).

- [ ] **Step 3: Create `scripts/seed-gallery.ts`** (self-contained, idempotent by album `titel`)

```ts
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

import config from "../payload.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

type SeedAlbum = {
  titel: string;
  jahr: number;
  /** Ordner unterhalb von public/ */
  ordner: string;
  /** Dateiname-Muster, {n} wird durch 1..anzahl ersetzt */
  dateiMuster: string;
  anzahl: number;
};

const ALBEN: SeedAlbum[] = [
  {
    titel: "Rückblick 2024",
    jahr: 2024,
    ordner: "images/Rückblick 2024",
    dateiMuster: "Rückblick 2024_{n}.jpg",
    anzahl: 17,
  },
];

async function run() {
  const payload = await getPayload({ config });

  for (const album of ALBEN) {
    const existing = await payload.find({
      collection: "gallery-albums",
      where: { titel: { equals: album.titel } },
      limit: 1,
      depth: 0,
    });
    if (existing.docs.length > 0) {
      console.log(`skip (already exists): ${album.titel}`);
      continue;
    }

    const bilder: number[] = [];
    for (let i = 1; i <= album.anzahl; i++) {
      const dateiname = album.dateiMuster.replace("{n}", String(i));
      const filePath = path.resolve(dirname, "..", "public", album.ordner, dateiname);
      const media = await payload.create({
        collection: "media",
        data: { alt: `${album.titel} – Bild ${i}` },
        filePath,
        context: { disableRevalidate: true },
      });
      bilder.push(media.id);
      console.log(`uploaded (${i}/${album.anzahl}): ${dateiname}`);
    }

    await payload.create({
      collection: "gallery-albums",
      data: { titel: album.titel, jahr: album.jahr, bilder },
      context: { disableRevalidate: true },
    });
    console.log(`created album: ${album.titel} (${bilder.length} Bilder)`);
  }

  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Add to `package.json` scripts, after the existing `"seed:events"` entry: `"seed:gallery": "dotenv -e .env.local -- tsx scripts/seed-gallery.ts"`.

- [ ] **Step 4: Run the seed and verify**

```bash
npm run seed:gallery
```

Expected: 17 `uploaded (i/17): …` lines, then `created album: Rückblick 2024 (17 Bilder)`, then `done`. Run it a second time: exactly one line `skip (already exists): Rückblick 2024` (idempotent — no second upload).

Then a throwaway Local-API check: write `scripts/tmp-check-gallery.ts` (same imports as the seed), run `npx dotenv -e .env.local -- tsx scripts/tmp-check-gallery.ts`, then `rm scripts/tmp-check-gallery.ts`. It must assert and print:
- exactly 1 document in `gallery-albums`, `titel === "Rückblick 2024"`, `jahr === 2024`;
- `bilder.length === 17` with `depth: 1`;
- the 17 `alt` values are exactly `Rückblick 2024 – Bild 1` … `Rückblick 2024 – Bild 17` **in that order** (this proves the order is preserved);
- every `url` starts with `/api/media/file/`.

- [ ] **Step 5: Build and commit**

```bash
npm run build
git add collections/GalleryAlbums.ts scripts/seed-gallery.ts payload.config.ts package.json payload-types.ts migrations
git commit -m "Add gallery-albums collection and seed it from the Rückblick 2024 images"
```

---

### Task 2: Rewire `/galerie`

**Design decisions (justified):**
- The hero keeps its markup; the single hardcoded pill "Rückblick 2024" becomes **one pill per album** (newest first) and `{images.length} Bilder` becomes the total over all albums. With one album the output is identical to today.
- The grid keeps **one** `<section>` with today's padding; inside it, each album renders its own eyebrow + masonry grid, with `mt-16` on every album after the first. Rendering one `<section>` per album would double the vertical padding between albums.
- The lightbox keeps **one flat image list across all albums** (global `index`), so ←/→ walks the whole gallery exactly as today. The dot indicators stay as they are (existing behaviour).
- Empty state: if there is no album (or no image), a muted card is rendered instead of the grid — editors can delete albums, and the page must not crash or look broken.

**Files:**
- Modify: `app/(frontend)/galerie/page.tsx`, `app/(frontend)/galerie/galerie-client.tsx`

**Interfaces:**
- Consumes: `gallery-albums` (Task 1), `Media` type from `@/payload-types`.
- Produces: `GalerieClient` takes `alben: GalerieAlbum[]` where `GalerieAlbum = { id: number; titel: string; jahr: number; bilder: { src: string; alt: string; index: number }[] }` and `index` is **globally** unique/ascending across all albums.

- [ ] **Step 1: Replace `app/(frontend)/galerie/page.tsx`**

```tsx
import { getPayload } from "payload";
import config from "@payload-config";
import type { Media } from "@/payload-types";
import GalerieClient from "./galerie-client";

export const revalidate = 3600;

export type GalerieAlbum = {
  id: number;
  titel: string;
  jahr: number;
  bilder: { src: string; alt: string; index: number }[];
};

async function getAlben(): Promise<GalerieAlbum[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "gallery-albums",
    depth: 1,
    limit: 100,
    sort: "-jahr",
  });

  let laufenderIndex = 0;
  return docs.map((doc) => ({
    id: doc.id,
    titel: doc.titel,
    jahr: doc.jahr,
    bilder: (doc.bilder ?? [])
      .filter((b): b is Media => typeof b === "object" && b !== null && typeof b.url === "string")
      .map((b) => ({
        src: b.url as string,
        alt: b.alt || doc.titel,
        index: laufenderIndex++,
      })),
  }));
}

export default async function GaleriePage() {
  const alben = await getAlben();
  const gesamtBilder = alben.reduce((summe, album) => summe + album.bilder.length, 0);

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
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Galerie</span>
          </div>

          <h1 className="font-kanturmuy max-w-3xl text-4xl font-normal tracking-tighter text-white sm:text-5xl md:text-7xl">
            Unsere{" "}
            <span className="relative inline-block">
              Tennismomente
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light text-white/60 md:text-lg">
            Entdecke die schönsten Momente aus unserem Vereinsleben — von Turnieren
            über Mannschaftsabende bis zum Saisonabschluss.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {alben.map((album) => (
              <span
                key={album.id}
                className="rounded-full bg-[#e1fcad]/20 px-4 py-2 text-sm font-light text-[#e1fcad]"
              >
                {album.titel}
              </span>
            ))}
            <span className="text-sm text-white/40">{gesamtBilder} Bilder</span>
          </div>
        </div>
      </section>

      <GalerieClient alben={alben} />
    </main>
  );
}
```

Note: the hero wrapper gains `flex-wrap` so several album pills wrap on small screens; with one album nothing changes visually.

- [ ] **Step 2: Rewrite `app/(frontend)/galerie/galerie-client.tsx`**

Only the data plumbing and the album loop change; the lightbox block is byte-identical to today's.

```tsx
"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

type GalerieImage = {
  src: string;
  alt: string;
  index: number;
};

type GalerieAlbum = {
  id: number;
  titel: string;
  jahr: number;
  bilder: GalerieImage[];
};

export default function GalerieClient({ alben }: { alben: GalerieAlbum[] }) {
  const images = React.useMemo(() => alben.flatMap((album) => album.bilder), [alben]);
  const [lightbox, setLightbox] = React.useState<number | null>(null);

  const openLightbox = (index: number) => setLightbox(index);
  const closeLightbox = () => setLightbox(null);

  const prev = () =>
    setLightbox((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  const next = () =>
    setLightbox((i) => (i === null ? null : (i + 1) % images.length));

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <>
      {/* Grid */}
      <section className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          {images.length === 0 && (
            <p className="rounded-2xl border border-black/[0.07] bg-white p-6 text-sm text-black/50">
              Aktuell sind keine Bilder online — schau bald wieder vorbei.
            </p>
          )}

          {alben.map((album, albumIndex) => (
            <div key={album.id} className={albumIndex > 0 ? "mt-16" : undefined}>
              <div className="mb-10 flex items-center gap-3">
                <span className="h-px w-8 bg-black/30" />
                <span className="text-xs uppercase tracking-[0.2em] text-black/50">{album.titel}</span>
              </div>

              <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4">
                {album.bilder.map((img) => (
                  <div
                    key={img.index}
                    className="group mb-4 cursor-pointer overflow-hidden rounded-2xl break-inside-avoid border border-black/[0.06] bg-white"
                    onClick={() => openLightbox(img.index)}
                  >
                    <div className="relative overflow-hidden">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={600}
                        height={400}
                        className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                      <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="size-5" />
            </button>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 z-10 flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <ChevronLeft className="size-6" />
            </button>

            {/* Image */}
            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="relative mx-20 max-h-[90vh] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightbox].src}
                alt={images[lightbox].alt}
                width={1200}
                height={900}
                className="max-h-[90vh] w-auto rounded-xl object-contain"
                priority
              />
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-sm text-white/50">
                  {lightbox + 1} / {images.length}
                </span>
              </div>
            </motion.div>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 z-10 flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <ChevronRight className="size-6" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === lightbox ? "w-6 bg-[#e1fcad]" : "w-1.5 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npm run build
npx next start -p 3111 > /tmp/htv-verify.log 2>&1 & echo $! > /tmp/htv-verify.pid
curl -sS --retry 30 --retry-delay 1 --retry-connrefused -o /tmp/galerie.html http://localhost:3111/galerie
kill "$(cat /tmp/htv-verify.pid)"
```

Assert on `/tmp/galerie.html`:
- contains `Rückblick 2024` at least twice (hero pill + grid eyebrow) and `17 Bilder`;
- `grep -o 'Rückblick 2024 – Bild' /tmp/galerie.html | wc -l` → 17 (all alts present);
- `grep -c '%2Fapi%2Fmedia%2Ffile%2F' /tmp/galerie.html` → ≥ 17 (images served through Payload/Blob via the Next image optimizer);
- no occurrence of `R%C3%BCckblick%202024_` any more (the old filename-interpolation URLs are gone).

Also run `git grep -n "R%C3%BCckblick" -- app components lib` → no hits.

- [ ] **Step 4: Commit**

```bash
git add "app/(frontend)/galerie/page.tsx" "app/(frontend)/galerie/galerie-client.tsx"
git commit -m "Read the Galerie page from Payload"
```

---

### Task 3: `news` collection, migration and homepage wiring (deliberately **not** seeded)

**Design decisions (justified) — read this before writing any code:**

The 5 hardcoded articles in `components/ui/news-section.tsx` were examined article by article. They are **real club texts, but an unusable data set**:

1. Three of the five have `datum: "News"` instead of a date — there is no date to migrate into the required `datum` field, and inventing dates would falsify club communication.
2. Articles 2 ("Saisonabschlussfest 2024") and 4 ("Saisonabschluss 2024 – ein Abend voller Highlights!") describe the **same** event with overlapping text — a duplicate that must not be published twice.
3. The images are generic stock photos (`tennis.jpg`, `wilson-2259352_960_720.jpg`, `tennis-court-1671852_960_720.jpg`) that do not depict the described events.
4. All content is from 2024, i.e. ~2 years stale as of 2026-09-19, and the section is **deliberately commented out** on the homepage today — publishing it now would be a content decision nobody made.

**Therefore: create the collection, seed nothing, and render `NewsSection` only when at least one news document exists.** The homepage keeps looking exactly as it does today until the board writes its first article in `/admin`. The original texts are not lost — they stay in git history in `components/ui/news-section.tsx` as of the commit before this task (`git show HEAD~1:components/ui/news-section.tsx` right after this task's commit). This is flagged in "Notes for the user".

Further decisions:
- **No `/news` detail route and no `/news` archive route in this plan.** The current section has no detail pages, and `news-section.tsx`'s "News-Archiv" button already points at `/news`, which **does not exist** (404). That button is therefore removed with this task rather than shipped as a broken link on a now-live section. A detail route can come in a later plan.
- `content` (Lexical rich text) is still part of the collection per spec, but nothing renders it yet; the field carries an admin hint saying so, so editors are not surprised.
- Sorting/layout: newest first (`-datum`); `docs[0]` gets the large "featured" card, `docs[1]` the small one next to it, the rest the 3-column grid — exactly today's layout, but tolerant of 1 or 2 articles.

**Files:**
- Create: `lib/news.ts`, `collections/News.ts`
- Modify: `payload.config.ts`, `components/ui/news-section.tsx`, `app/(frontend)/page.tsx`
- Generated: `migrations/<timestamp>_add_news.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Consumes: `toIsoDay` from `lib/events.ts`; `revalidatePathsAfterChange/Delete` from `collections/hooks/revalidate.ts`.
- Produces: collection slug `"news"`; fields `datum` (date, required, day only), `titel` (text, required), `excerpt` (textarea, required), `content` (richText), `bild` (upload → `media`), `kategorie` (select `Vereinsnews | Vereinsleben | Turnier | Training`, required, default `Vereinsnews`). `lib/news.ts` exports `formatNewsDatum(datum: string): string` → `"4. Oktober 2024"`. `NewsSection` takes `news: NewsItem[]` with `NewsItem = { datum: string; titel: string; excerpt: string; bild: string | null; kategorie: string }`.

- [ ] **Step 1: Create `lib/news.ts`**

```ts
import { toIsoDay } from "./events";

const MONATE_LANG = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

/** Payload speichert reine Datumsfelder um 12:00 UTC — deshalb konsequent UTC lesen. */
export function formatNewsDatum(datum: string): string {
  const date = new Date(`${toIsoDay(datum)}T12:00:00.000Z`);
  return `${date.getUTCDate()}. ${MONATE_LANG[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
```

- [ ] **Step 2: Create `collections/News.ts`**

```ts
import type { CollectionConfig } from "payload";

import { revalidatePathsAfterChange, revalidatePathsAfterDelete } from "./hooks/revalidate";

const PATHS = ["/"];

export const News: CollectionConfig = {
  slug: "news",
  labels: { singular: "Neuigkeit", plural: "News" },
  admin: {
    useAsTitle: "titel",
    defaultColumns: ["titel", "datum", "kategorie"],
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
    {
      name: "datum",
      type: "date",
      required: true,
      admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } },
    },
    { name: "titel", type: "text", required: true },
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      label: "Kurztext",
      admin: { description: "Wird auf der Startseite unter der Überschrift angezeigt." },
    },
    {
      name: "content",
      type: "richText",
      label: "Ausführlicher Text",
      admin: {
        description:
          "Wird aktuell noch nicht auf der Website angezeigt — eine Detailseite folgt in einem späteren Schritt.",
      },
    },
    { name: "bild", type: "upload", relationTo: "media" },
    {
      name: "kategorie",
      type: "select",
      required: true,
      defaultValue: "Vereinsnews",
      options: [
        { label: "Vereinsnews", value: "Vereinsnews" },
        { label: "Vereinsleben", value: "Vereinsleben" },
        { label: "Turnier", value: "Turnier" },
        { label: "Training", value: "Training" },
      ],
    },
  ],
};
```

- [ ] **Step 3: Register, migrate, types**

In `payload.config.ts` add `import { News } from "./collections/News";` and append `News` to the `collections` array (after `GalleryAlbums` from Task 1). Then:

```bash
npm run migrate:create -- add_news
npm run migrate
npm run generate:types
```

`migrate` must not prompt (if it does: stop, report BLOCKED).

- [ ] **Step 4: Rewrite `components/ui/news-section.tsx`** — drop the hardcoded array, take props, guard missing images, remove the dead "News-Archiv" link

Replace the file's top section (the `const news = [...]` array, lines 9–50 of the current file) and the component signature; everything else keeps its classes. The complete new file:

```tsx
"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";
import { FadeIn } from "@/components/ui/fade-in";

export type NewsItem = {
  datum: string;
  titel: string;
  excerpt: string;
  bild: string | null;
  kategorie: string;
};

const kategorieFarbe: Record<string, string> = {
  Vereinsnews: "bg-black text-white",
  Vereinsleben: "bg-[#e1fcad] text-black",
  Turnier: "bg-orange-50 text-orange-600",
  Training: "bg-blue-50 text-blue-600",
};

function NewsCard({
  artikel,
  featured,
}: {
  artikel: NewsItem;
  featured?: boolean;
}) {
  if (featured) {
    return (
      <div className="group col-span-1 flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-shadow duration-300 hover:shadow-lg lg:col-span-2 lg:flex-row">
        <div className="relative h-56 overflow-hidden lg:h-auto lg:w-1/2">
          {artikel.bild ? (
            <Image
              src={artikel.bild}
              alt={artikel.titel}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-black/[0.04]" />
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between p-5 sm:p-7 lg:p-10">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${kategorieFarbe[artikel.kategorie] ?? "bg-black/5 text-black/60"}`}>
                {artikel.kategorie}
              </span>
              <span className="text-xs text-black/35">{artikel.datum}</span>
            </div>
            <h3 className="font-kanturmuy text-2xl font-normal tracking-tight text-black md:text-3xl">
              {artikel.titel}
            </h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-black/50 md:text-base">
              {artikel.excerpt}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-shadow duration-300 hover:shadow-lg">
      <div className="relative h-44 overflow-hidden">
        {artikel.bild ? (
          <Image
            src={artikel.bild}
            alt={artikel.titel}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-black/[0.04]" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${kategorieFarbe[artikel.kategorie] ?? "bg-black/5 text-black/60"}`}>
            {artikel.kategorie}
          </span>
          <span className="text-xs text-black/35">{artikel.datum}</span>
        </div>
        <h3 className="font-kanturmuy text-lg font-normal tracking-tight text-black">
          {artikel.titel}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm font-light leading-relaxed text-black/50">
          {artikel.excerpt}
        </p>
      </div>

      <div className="h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
    </div>
  );
}

export default function NewsSection({ news }: { news: NewsItem[] }) {
  if (news.length === 0) return null;

  return (
    <section id="news" className="bg-white px-6 py-20 md:px-12 lg:px-20 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-black/30" />
                <span className="text-xs uppercase tracking-[0.2em] text-black/50">
                  Aus dem Verein
                </span>
              </div>

              <h2 className="font-kanturmuy max-w-xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                <BlurTextEffect>Aktuelle </BlurTextEffect>
                <span className="relative inline-block">
                  <BlurTextEffect>Neuigkeiten</BlurTextEffect>
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
                </span>
              </h2>

              <p className="mt-4 max-w-md text-base font-light text-black/50">
                Bleiben Sie auf dem Laufenden über die neuesten Entwicklungen in unserem Verein.
              </p>
            </div>
          </div>
        </FadeIn>

        <div className="mt-8 grid grid-cols-1 gap-6 md:mt-14 lg:grid-cols-3">
          <FadeIn delay={0.1}><NewsCard artikel={news[0]} featured /></FadeIn>
          {news[1] && <FadeIn delay={0.18}><NewsCard artikel={news[1]} /></FadeIn>}
        </div>

        {news.length > 2 && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.slice(2).map((artikel, i) => (
              <FadeIn key={artikel.titel} delay={0.08 + i * 0.08}>
                <NewsCard artikel={artikel} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

Removed on purpose: the `next/link` import and the "News-Archiv" button (dead `/news` route), and the "Weiterlesen" call-to-actions in both card variants — both would lead nowhere without a detail route. This is the one intentional markup reduction in this task; it is listed in "Notes for the user".

- [ ] **Step 5: Wire the homepage** — edit `app/(frontend)/page.tsx` relative to its current state

1. Replace the commented import line `// import NewsSection from "@/components/ui/news-section";` with a real import: `import NewsSection from "@/components/ui/news-section";`.
2. Add `import { formatNewsDatum } from "@/lib/news";` next to the existing `import { formatTerminDatum, startOfTodayIso } from "@/lib/events";`.
3. Add a `getNews()` function next to the existing `getVorstand()` / `getTermine()`:

```tsx
async function getNews() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "news",
    depth: 1,
    limit: 5,
    sort: "-datum",
  });
  return docs.map((d) => ({
    datum: formatNewsDatum(d.datum),
    titel: d.titel,
    excerpt: d.excerpt,
    bild: typeof d.bild === "object" && d.bild ? d.bild.url ?? null : null,
    kategorie: d.kategorie,
  }));
}
```

4. Extend the existing `Promise.all` in `Home` to `const [vorstand, termine, news] = await Promise.all([getVorstand(), getTermine(), getNews()]);` and replace the commented `{/* <NewsSection /> */}` line with `<NewsSection news={news} />` (the component returns `null` when the list is empty, so the homepage is unchanged until there is news).

- [ ] **Step 6: Verify both branches (with and without news)**

Because `NewsSection` must appear *and* disappear, prove both. Write the throwaway script `scripts/tmp-news.ts` that creates one temporary news document with `context: { disableRevalidate: true }` and **no** `bild` (this also exercises the image fallback), and run it with `npx dotenv -e .env.local -- tsx scripts/tmp-news.ts`:

```ts
import { getPayload } from "payload";
import config from "../payload.config";

async function run() {
  const payload = await getPayload({ config });
  const doc = await payload.create({
    collection: "news",
    data: {
      datum: "2026-09-18T12:00:00.000Z",
      titel: "TEMP Verifikationsartikel",
      excerpt: "Temporärer Artikel nur für die Verifikation.",
      kategorie: "Vereinsnews",
    },
    context: { disableRevalidate: true },
  });
  console.log("created", doc.id);
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
```

Then:

```bash
npm run build
npx next start -p 3111 > /tmp/htv-verify.log 2>&1 & echo $! > /tmp/htv-verify.pid
curl -sS --retry 30 --retry-delay 1 --retry-connrefused -o /tmp/home-with-news.html http://localhost:3111/
kill "$(cat /tmp/htv-verify.pid)"
```

`/tmp/home-with-news.html` must contain `TEMP Verifikationsartikel`, `Aktuelle` + `Neuigkeiten`, `18. September 2026` (proves `formatNewsDatum`) and must **not** contain `News-Archiv`.

Then delete the temp document (same script pattern, `payload.delete({ collection: "news", id, context: { disableRevalidate: true } })`), rebuild, and curl `/` again into `/tmp/home-without-news.html`: it must **not** contain `Aus dem Verein` — proving the section disappears cleanly. Then `rm scripts/tmp-news.ts` and confirm `git status` shows only the intended modified/created files.

- [ ] **Step 7: Build and commit**

```bash
npm run build
git add lib/news.ts collections/News.ts payload.config.ts payload-types.ts migrations components/ui/news-section.tsx "app/(frontend)/page.tsx"
git commit -m "Add news collection and wire the homepage news section to it"
```

---

### Task 4: Baseline capture, rich-text renderer and the `legal-pages` collection

**Design decisions (justified):**
- **Model:** the spec lists `legal-pages {slug, titel, content richtext}`. A single flat rich-text blob **cannot** reproduce the current look, which is a sequence of `section`s, each with an uppercase eyebrow heading *outside* a white rounded card and the body *inside* it. Reconstructing that from one blob would need brittle heuristics (split on `h2`). The collection therefore stores `abschnitte` — an array of `{ titel: text, inhalt: richText }` — plus `intro` (richText, for the Cookies page, which has intro text and no cards) and `stand` (text, the "Stand: Juni 2026" line). This is a deliberate, documented deviation from the spec's field list; it renders the existing markup exactly and is much easier to edit.
- **What stays code:** the page shell (back-link, decorated `h1`, wrappers, the `CookieSettings` widget and the cookie banner, `MapsConsentGate`). Only the body text becomes CMS content. The URLs `/impressum`, `/datenschutz`, `/cookies` are unchanged, so every existing link (footer, cookie banner, contact form, `maps-consent-gate.tsx`, `location-section.tsx`, `datenschutz`'s own link to `/cookies`) keeps working.
- **Access:** `read: () => true`, `create: () => false`, `delete: () => false` (nobody can add or remove a legal page through the admin or the REST/GraphQL API), `update` stays default (authenticated). The slug is a 3-value `select`, `unique`, `admin.readOnly`, with an explicit `validate` on top of the select options. The seed uses the Local API (`overrideAccess` defaults to `true`), so `create: () => false` does not block it.
- **Rich-text rendering:** `RichText` from `@payloadcms/richtext-lexical/react` inside a small wrapper `components/ui/rich-text.tsx` that carries the Tailwind arbitrary-variant classes reproducing today's look (`p`, `strong`, `a`, `ul`, `ol`, `h2`, `h3`, `blockquote`). No typography plugin is added — none is installed. Two structural mappings replace ad-hoc markup:
  - `h3` renders with `border-t` + `pt-4` (except as first child), reproducing the hairline `<div className="h-px bg-black/[0.06]" />` separators of the Impressum disclaimer and the `border-t pt-4` sub-block on `/datenschutz`.
  - `ul > li` gets a CSS-generated `—` marker, reproducing today's hand-built em-dash list. Consequence: those 7 em dashes are no longer in the HTML text — the only tolerated difference in the Task 6 text comparison.
- **One cast, one place:** Payload's generated rich-text type and Lexical's `SerializedEditorState` are structurally identical but not mutually assignable (interfaces get no implicit index signature). The cast happens exactly once, inside `components/ui/rich-text.tsx` (and once more, in the opposite direction, in the seed script).

**Files:**
- Create: `lib/legal-pages.ts`, `lib/get-legal-page.ts`, `collections/LegalPages.ts`, `components/ui/rich-text.tsx`, `components/ui/legal-sections.tsx`
- Modify: `payload.config.ts`
- Generated: `migrations/<timestamp>_add_legal_pages.{ts,json}`, `migrations/index.ts`, `payload-types.ts`

**Interfaces:**
- Produces (used by Tasks 5 and 6): collection slug `"legal-pages"`; fields `slug` (select `impressum | datenschutz | cookies`, required, unique, readOnly), `titel` (text, required), `intro` (richText), `abschnitte` (array of `{ titel: text required, inhalt: richText required }`), `stand` (text). `lib/legal-pages.ts` exports `LEGAL_SLUGS` and `type LegalSlug`. `lib/get-legal-page.ts` exports `getLegalPage(slug: LegalSlug): Promise<LegalPage>`. `components/ui/rich-text.tsx` default-exports `RichTextBody`. `components/ui/legal-sections.tsx` default-exports `LegalSections`.

- [ ] **Step 1: Capture the baseline text of the three legal pages — BEFORE anything is rewired**

The pages are still the old hardcoded JSX at this point; this is the reference the Task 6 proof compares against.

```bash
mkdir -p /tmp/htv-legal
npm run build
npx next start -p 3111 > /tmp/htv-verify.log 2>&1 & echo $! > /tmp/htv-verify.pid
curl -sS --retry 30 --retry-delay 1 --retry-connrefused -o /tmp/htv-legal/impressum.before.html   http://localhost:3111/impressum
curl -sS --retry 30 --retry-delay 1 --retry-connrefused -o /tmp/htv-legal/datenschutz.before.html http://localhost:3111/datenschutz
curl -sS --retry 30 --retry-delay 1 --retry-connrefused -o /tmp/htv-legal/cookies.before.html     http://localhost:3111/cookies
kill "$(cat /tmp/htv-verify.pid)"
```

Write the extractor to `/tmp/htv-legal/extract.mjs` (it prints one word per line so `diff` can pinpoint differences):

```js
import fs from "fs";

const file = process.argv[2];
const html = fs.readFileSync(file, "utf8");
const main = html.match(/<main[\s\S]*<\/main>/);
if (!main) {
  console.error(`no <main> found in ${file}`);
  process.exit(1);
}

const text = main[0]
  .replace(/<script[\s\S]*?<\/script>/g, " ")
  .replace(/<style[\s\S]*?<\/style>/g, " ")
  .replace(/<!--[\s\S]*?-->/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&#x2F;/g, "/")
  .replace(/&amp;/g, "&")
  .replace(/\s+/g, " ")
  .trim();

process.stdout.write(text.split(" ").join("\n") + "\n");
```

Produce and keep the baselines:

```bash
for p in impressum datenschutz cookies; do
  node /tmp/htv-legal/extract.mjs /tmp/htv-legal/$p.before.html > /tmp/htv-legal/$p.before.txt
done
wc -l /tmp/htv-legal/*.before.txt
```

Expected: three non-empty files (impressum ≈ 600+ words, datenschutz ≈ 900+ words, cookies ≈ 45 words — the `CookieSettings` widget renders `null` on the server, so the baseline contains only the shell + intro). Sanity check: `grep -c "Haftungsbeschränkung" /tmp/htv-legal/impressum.before.txt` → 1. **Do not delete `/tmp/htv-legal/` until Task 6 is finished.**

- [ ] **Step 2: Create `lib/legal-pages.ts`** (constants only — this file is imported by the collection, so it must **never** import `payload.config`, or the config would import itself in a cycle)

```ts
export const LEGAL_SLUGS = ["impressum", "datenschutz", "cookies"] as const;

export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export const LEGAL_SLUG_OPTIONS = LEGAL_SLUGS.map((slug) => ({ label: slug, value: slug }));
```

- [ ] **Step 3: Create `collections/LegalPages.ts`**

```ts
import type { CollectionConfig } from "payload";

import { LEGAL_SLUGS, LEGAL_SLUG_OPTIONS } from "../lib/legal-pages";
import { revalidatePathsAfterChange, revalidatePathsAfterDelete } from "./hooks/revalidate";

const PATHS = ["/impressum", "/datenschutz", "/cookies"];

export const LegalPages: CollectionConfig = {
  slug: "legal-pages",
  labels: { singular: "Rechtsseite", plural: "Rechtsseiten" },
  admin: {
    useAsTitle: "titel",
    defaultColumns: ["titel", "slug"],
    description:
      "Impressum, Datenschutzerklärung und Cookie-Seite. Diese drei Seiten können bearbeitet, aber nicht neu angelegt oder gelöscht werden.",
  },
  access: {
    read: () => true,
    create: () => false,
    delete: () => false,
  },
  hooks: {
    afterChange: [revalidatePathsAfterChange(PATHS)],
    afterDelete: [revalidatePathsAfterDelete(PATHS)],
  },
  fields: [
    {
      name: "slug",
      type: "select",
      required: true,
      unique: true,
      options: LEGAL_SLUG_OPTIONS,
      admin: {
        readOnly: true,
        description: "Fest verdrahtet — bestimmt die URL der Seite und kann nicht geändert werden.",
      },
      validate: (value: unknown) =>
        typeof value === "string" && (LEGAL_SLUGS as readonly string[]).includes(value)
          ? true
          : "Nur impressum, datenschutz oder cookies sind erlaubt.",
    },
    {
      name: "titel",
      type: "text",
      required: true,
      admin: { description: "Überschrift der Seite und Titel im Browser-Tab." },
    },
    {
      name: "intro",
      type: "richText",
      label: "Einleitung",
      admin: { description: "Optionaler Text direkt unter der Überschrift (wird auf der Cookie-Seite genutzt)." },
    },
    {
      name: "abschnitte",
      type: "array",
      label: "Abschnitte",
      labels: { singular: "Abschnitt", plural: "Abschnitte" },
      admin: { description: "Jeder Abschnitt erscheint als eigene Karte mit kleiner Überschrift darüber." },
      fields: [
        { name: "titel", type: "text", required: true, label: "Überschrift" },
        { name: "inhalt", type: "richText", required: true, label: "Inhalt" },
      ],
    },
    {
      name: "stand",
      type: "text",
      label: "Stand",
      admin: { description: 'z.B. "Stand: Juni 2026" — erscheint klein unter der Seite.' },
    },
  ],
};
```

- [ ] **Step 4: Register, migrate, types**

In `payload.config.ts` add `import { LegalPages } from "./collections/LegalPages";` and append `LegalPages` to the `collections` array (after `News` from Task 3). Then:

```bash
npm run migrate:create -- add_legal_pages
npm run migrate
npm run generate:types
```

Expected: tables `legal_pages` and `legal_pages_abschnitte` (+ the slug enum), `payload-types.ts` gains a `LegalPage` interface with `slug`, `titel`, `intro`, `abschnitte`, `stand`. `migrate` must not prompt (if it does: stop, report BLOCKED).

- [ ] **Step 5: Create `components/ui/rich-text.tsx`**

```tsx
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

/**
 * Payload's generierter richText-Typ ist strukturell identisch mit Lexicals
 * SerializedEditorState, aber (wegen fehlender Index-Signatur auf Interfaces)
 * nicht direkt zuweisbar. Der Cast passiert deshalb genau einmal — hier.
 */
type PayloadRichText = { root: unknown; [k: string]: unknown };

/** Bildet das Aussehen der bisherigen Rechtsseiten-Karten 1:1 nach. */
const LEGAL_RICHTEXT_CLASS = [
  "text-sm leading-relaxed text-black/70",
  "[&>*:first-child]:mt-0",
  "[&_p]:mt-3",
  "[&_strong]:font-medium [&_strong]:text-black",
  "[&_a]:text-black [&_a]:underline-offset-2 [&_a:hover]:underline",
  "[&_blockquote]:mt-3 [&_blockquote]:text-xs [&_blockquote]:text-black/40",
  "[&_h2]:mt-6 [&_h2]:font-medium [&_h2]:text-black",
  "[&_h3]:mt-4 [&_h3]:border-t [&_h3]:border-black/[0.06] [&_h3]:pt-4 [&_h3]:font-medium [&_h3]:text-black",
  "[&_h3:first-child]:mt-0 [&_h3:first-child]:border-t-0 [&_h3:first-child]:pt-0",
  "[&_ul]:mt-3 [&_ul]:flex [&_ul]:list-none [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-0",
  "[&_ul>li]:relative [&_ul>li]:pl-6",
  "[&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:text-black/30 [&_ul>li]:before:content-['—']",
  "[&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol>li]:mt-1",
].join(" ");

export default function RichTextBody({
  data,
  className,
}: {
  data: PayloadRichText;
  className?: string;
}) {
  return (
    <RichText
      className={className ?? LEGAL_RICHTEXT_CLASS}
      data={data as unknown as SerializedEditorState}
    />
  );
}
```

- [ ] **Step 6: Create `components/ui/legal-sections.tsx`** (server component — reproduces today's section/card markup exactly)

```tsx
import type { LegalPage } from "@/payload-types";
import RichTextBody from "@/components/ui/rich-text";

export default function LegalSections({
  abschnitte,
}: {
  abschnitte: NonNullable<LegalPage["abschnitte"]>;
}) {
  return (
    <div className="mt-12 flex flex-col gap-10 text-sm leading-relaxed text-black/70">
      {abschnitte.map((abschnitt) => (
        <section key={abschnitt.id ?? abschnitt.titel}>
          <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
            {abschnitt.titel}
          </h2>
          <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
            <RichTextBody data={abschnitt.inhalt} />
          </div>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Create `lib/get-legal-page.ts`** (server-only fetch helper — kept separate from `lib/legal-pages.ts` so the collection never pulls in `payload.config`)

```ts
import { getPayload } from "payload";
import config from "@payload-config";

import type { LegalSlug } from "./legal-pages";
import type { LegalPage } from "@/payload-types";

export async function getLegalPage(slug: LegalSlug): Promise<LegalPage> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "legal-pages",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });

  const doc = docs[0];
  if (!doc) {
    throw new Error(`Rechtsseite "${slug}" fehlt in Payload — bitte "npm run seed:legal-pages" ausführen.`);
  }
  return doc;
}
```

- [ ] **Step 8: Build and commit** (nothing renders the new pieces yet — this must still compile)

```bash
npm run build
git add lib/legal-pages.ts lib/get-legal-page.ts collections/LegalPages.ts components/ui/rich-text.tsx components/ui/legal-sections.tsx payload.config.ts payload-types.ts migrations
git commit -m "Add legal-pages collection and a styled rich-text renderer"
```

---

### Task 5: Seed the three legal pages (Markdown → Lexical) and prove the wording

**Design decisions (justified):**
- **Conversion method:** the legal texts are hand-transcribed into Markdown inside the seed script and converted with `convertMarkdownToLexical({ editorConfig, markdown })`, where `editorConfig = await editorConfigFactory.default({ config: payload.config })` — i.e. exactly the editor configured in `payload.config.ts`. Both exports were verified in `node_modules` (see "Repository facts"). HTML→Lexical was rejected because `convertHTMLToLexical` requires a `JSDOM` constructor and `jsdom` is not a dependency.
- **Markdown authoring rules** (all verified against the bundled importer):
  - blank line = new paragraph; single newline = `<br />` inside the same paragraph (address blocks);
  - `**bold**` → `<strong>` (the old `font-medium text-black` spans);
  - `### Heading` → `<h3>` (the old bold sub-block headings with hairline separators);
  - `- item` → list item with the CSS em-dash marker;
  - `> text` → `<blockquote>`, styled as the old `text-xs text-black/40` small print ("Rechtsgrundlage: …");
  - `[text](url)` → link. Markdown links import with `newTab: false`; Step 2 restores `target="_blank"` for `http(s)` links so external links behave exactly as before, while `mailto:`, `tel:` and the internal `/cookies` link stay in-tab (as today).
- **Wording is not touched.** Every character of the visible text is transcribed verbatim, including the mixed quotation marks in `(„externe Links")` on the Impressum.
- Idempotent by `slug`: re-running skips existing documents, so a later editor change is never overwritten.

**Files:**
- Create: `scripts/seed-legal-pages.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `legal-pages` collection and `LegalSlug` (Task 4); `convertMarkdownToLexical`, `editorConfigFactory` from `@payloadcms/richtext-lexical`.
- Produces: exactly 3 documents — `impressum` (6 Abschnitte), `datenschutz` (10 Abschnitte + `stand`), `cookies` (0 Abschnitte, `intro` only).

- [ ] **Step 1: Create `scripts/seed-legal-pages.ts`**

```ts
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

Hardter TV e. V.
Gahlener Str. 204
46282 Dorsten`,
    },
    {
      titel: "Vertreten durch",
      markdown: `**1. Vorsitzender:** Oliver Wiegand
**1. Geschäftsführer:** Hendrick Büncker
**Schatzmeister:** Marco Hohenstein

Telefon: [0172 25 80 209](tel:+4917225800209)

E-Mail: [1.vorsitzender@hardt-tennis.de](mailto:1.vorsitzender@hardt-tennis.de)`,
    },
    {
      titel: "Registereintrag",
      markdown: `Eintragung im Vereinsregister
Registergericht: Gelsenkirchen
Registernummer: VR 13415`,
    },
    {
      titel: "Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV",
      markdown: `Oliver Wiegand
Teichstr. 14 a
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
      markdown: `Hardter TV e. V.
Gahlener Str. 204
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

Landesbeauftragte für Datenschutz und Informationsfreiheit NRW (LDI NRW)
Postfach 20 04 44
40102 Düsseldorf
Telefon: 0211 / 38424-0
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
```

Add to `package.json` scripts, after `"seed:gallery"`: `"seed:legal-pages": "dotenv -e .env.local -- tsx scripts/seed-legal-pages.ts"`.

- [ ] **Step 2: Run the seed**

```bash
npm run seed:legal-pages
```

Expected output, in this order:

```
created: impressum (6 Abschnitte)
created: datenschutz (10 Abschnitte)
created: cookies (0 Abschnitte)
done
```

Run it a second time → three `skip (already exists): …` lines. If any `created` line reports a different section count, the transcription is wrong — fix it before continuing.

- [ ] **Step 3: Prove the conversion is lossless (throwaway script, delete afterwards)**

Write `scripts/tmp-check-lexical.ts` and run it with `npx dotenv -e .env.local -- tsx scripts/tmp-check-lexical.ts`. Copy the three page objects (`IMPRESSUM`, `DATENSCHUTZ`, `COOKIES`) into it — the seed keeps them unexported at module scope, and the check script is throwaway. It must, **for every** `abschnitt` of every page:

1. take the seeded `inhalt`, run `convertLexicalToPlaintext({ data: inhalt as unknown as SerializedEditorState })` (from `@payloadcms/richtext-lexical/plaintext`), then `.replace(/\s+/g, " ").trim()`;
2. take the same section's Markdown source and strip Markdown syntax:

```ts
const stripMarkdown = (md: string) =>
  md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s{0,3}-\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
```

3. assert the two strings are **identical**; print the first differing character index for any mismatch.

Additionally assert:
- `payload.find({ collection: "legal-pages" })` returns exactly 3 documents with slugs `impressum`, `datenschutz`, `cookies`;
- the `impressum` document's section titles are, in order: `Angaben gemäß § 5 DDG`, `Vertreten durch`, `Registereintrag`, `Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV`, `Online-Streitbeilegung`, `Disclaimer – Rechtliche Hinweise`;
- the `datenschutz` document has `stand === "Stand: Juni 2026"` and its last section contains a `list` node with 7 `listitem` children;
- the `cookies` document has a non-empty `intro` and `abschnitte` of length 0;
- the JSON of the Impressum's "Vertreten durch" section contains at least 2 `linebreak` nodes (proving the address block kept its `<br />` structure);
- every `link` node with a `url` starting with `http` has `newTab === true`, and every `mailto:`/`tel:`/`/`-link has `newTab === false`.

Then `rm scripts/tmp-check-lexical.ts`.

- [ ] **Step 4: Prove the access rules** (throwaway, delete afterwards)

Assert through the public REST API:

```bash
npm run build
npx next start -p 3111 > /tmp/htv-verify.log 2>&1 & echo $! > /tmp/htv-verify.pid
curl -sS --retry 30 --retry-delay 1 --retry-connrefused -o /dev/null http://localhost:3111/api/legal-pages
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3111/api/legal-pages \
  -H "Content-Type: application/json" \
  -d '{"slug":"impressum","titel":"Hack"}'
ID=$(curl -s "http://localhost:3111/api/legal-pages?where[slug][equals]=impressum" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).docs[0].id))")
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "http://localhost:3111/api/legal-pages/$ID"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3111/api/legal-pages
```

Expected: `403`, `403`, `200` (create and delete are forbidden for everyone; read is public). Afterwards re-check that the document still exists (the delete really did not happen). Stop the server by PID.

- [ ] **Step 5: Build and commit**

```bash
npm run build
git add scripts/seed-legal-pages.ts package.json
git commit -m "Seed the legal pages from Markdown into Lexical"
```

---

### Task 6: Rewire `/impressum`, `/datenschutz`, `/cookies` and prove the text is unchanged

**Design decisions (justified):**
- `titel` drives both the `h1` (Impressum, Datenschutz) and `generateMetadata`. The Cookies page keeps its **decorated** `h1` ("Cookie-" + underlined "Einstellungen") in code, because that split is a design element, not content; its `titel` only feeds the metadata.
- Metadata changes slightly and for the better: `/impressum` currently sets `title: "Impressum – Hardter TV"` while the root layout applies the template `"%s – Hardter TV"`, so the browser tab actually reads "Impressum – Hardter TV – Hardter TV". Driving the title from `titel` ("Impressum") produces the intended "Impressum – Hardter TV". `/datenschutz` likewise becomes "Datenschutzerklärung – Hardter TV" (was "Datenschutz – Hardter TV – Hardter TV"). Metadata lives outside `<main>` and therefore does not affect the text proof.
- The `CookieSettings` component, the cookie banner and `MapsConsentGate` stay untouched code; the Cookies page only moves its intro paragraph into the CMS.

**Files:**
- Modify: `app/(frontend)/impressum/page.tsx`, `app/(frontend)/datenschutz/page.tsx`, `app/(frontend)/cookies/page.tsx`

**Interfaces:**
- Consumes: `getLegalPage` (Task 4), `LegalSections`, `RichTextBody`, the 3 seeded documents (Task 5).

- [ ] **Step 1: Replace `app/(frontend)/impressum/page.tsx`**

```tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getLegalPage } from "@/lib/get-legal-page";
import LegalSections from "@/components/ui/legal-sections";

export const revalidate = 3600;

export async function generateMetadata() {
  const page = await getLegalPage("impressum");
  return { title: page.titel };
}

export default async function ImpressumPage() {
  const page = await getLegalPage("impressum");

  return (
    <main className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-black/40 transition-colors hover:text-black"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          Zurück zur Startseite
        </Link>

        <h1 className="font-kanturmuy text-4xl font-normal tracking-tighter text-black sm:text-5xl">
          {page.titel}
        </h1>

        <LegalSections abschnitte={page.abschnitte ?? []} />

        {page.stand && <p className="mt-10 text-xs text-black/30">{page.stand}</p>}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Replace `app/(frontend)/datenschutz/page.tsx`** — identical shell, different slug

```tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getLegalPage } from "@/lib/get-legal-page";
import LegalSections from "@/components/ui/legal-sections";

export const revalidate = 3600;

export async function generateMetadata() {
  const page = await getLegalPage("datenschutz");
  return { title: page.titel };
}

export default async function DatenschutzPage() {
  const page = await getLegalPage("datenschutz");

  return (
    <main className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-black/40 transition-colors hover:text-black"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          Zurück zur Startseite
        </Link>

        <h1 className="font-kanturmuy text-4xl font-normal tracking-tighter text-black sm:text-5xl">
          {page.titel}
        </h1>

        <LegalSections abschnitte={page.abschnitte ?? []} />

        {page.stand && <p className="mt-10 text-xs text-black/30">{page.stand}</p>}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Replace `app/(frontend)/cookies/page.tsx`** — intro from the CMS, widget stays code

```tsx
import CookieSettings from "@/components/ui/cookie-settings";
import RichTextBody from "@/components/ui/rich-text";
import { getLegalPage } from "@/lib/get-legal-page";

export const revalidate = 3600;

export async function generateMetadata() {
  const page = await getLegalPage("cookies");
  return {
    title: page.titel,
    description: "Verwalte deine Cookie-Einstellungen für hardt-tennis.de",
  };
}

export default async function CookiesPage() {
  const page = await getLegalPage("cookies");

  return (
    <main className="min-h-screen bg-[#f9f9f7] px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-black/30" />
          <span className="text-xs uppercase tracking-[0.2em] text-black/50">Datenschutz</span>
        </div>

        <h1 className="font-kanturmuy text-4xl font-normal tracking-tighter text-black sm:text-5xl">
          Cookie-{" "}
          <span className="relative inline-block">
            Einstellungen
            <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
          </span>
        </h1>

        {page.intro && (
          <RichTextBody
            data={page.intro}
            className="mt-4 text-base font-light leading-relaxed text-black/60 [&>*:first-child]:mt-0 [&_p]:mt-3 [&_a]:text-black [&_a]:underline-offset-2 [&_a:hover]:underline"
          />
        )}

        <CookieSettings />
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Build, capture the "after" text and diff it against the Task 4 baseline**

```bash
npm run build
npx next start -p 3111 > /tmp/htv-verify.log 2>&1 & echo $! > /tmp/htv-verify.pid
for p in impressum datenschutz cookies; do
  curl -sS --retry 30 --retry-delay 1 --retry-connrefused -o /tmp/htv-legal/$p.after.html http://localhost:3111/$p
done
kill "$(cat /tmp/htv-verify.pid)"

for p in impressum datenschutz cookies; do
  node /tmp/htv-legal/extract.mjs /tmp/htv-legal/$p.after.html > /tmp/htv-legal/$p.after.txt
  echo "=== $p"
  diff /tmp/htv-legal/$p.before.txt /tmp/htv-legal/$p.after.txt && echo "IDENTICAL"
done
```

**Acceptance criteria:**
- `/impressum`: `IDENTICAL` — zero differences.
- `/cookies`: `IDENTICAL` — zero differences.
- `/datenschutz`: the **only** allowed difference is the removal of exactly **7** standalone `—` lines (the list bullets, now generated by CSS `::before` and therefore no longer part of the HTML text). Verify precisely:
  `diff /tmp/htv-legal/datenschutz.before.txt /tmp/htv-legal/datenschutz.after.txt | grep '^<' | sort | uniq -c` must print exactly one group: `7 < —`, and `diff … | grep '^>'` must print nothing.
- Any other difference is a transcription error: find it, fix the Markdown in `scripts/seed-legal-pages.ts`, update the affected document (delete it via a throwaway Local-API script using `overrideAccess: true`, re-run the seed), rebuild and re-diff. Do **not** adjust the extractor to hide a difference.

Additionally check the rendered HTML (not just the text):
- `grep -c '<br' /tmp/htv-legal/impressum.after.html` ≥ 8 (address blocks kept their line breaks);
- `grep -c 'target="_blank"' /tmp/htv-legal/datenschutz.after.html` ≥ 4 (external links still open in a new tab) and `grep -c 'rel="noopener noreferrer"'` ≥ 4;
- `grep -c 'href="/cookies"' /tmp/htv-legal/datenschutz.after.html` ≥ 1 (the internal link survives; it is now a plain `<a>`, a full page navigation instead of a client-side transition — an accepted, documented change);
- `grep -c 'href="mailto:1.vorsitzender@hardt-tennis.de"' /tmp/htv-legal/impressum.after.html` ≥ 2.

- [ ] **Step 5: Prove admin edits revalidate** (throwaway, delete afterwards)

`revalidatePath` only works inside a Next request, so drive the update through a temporary route handler (same trick as the previous plan). Create `app/(frontend)/tmp-revalidate/route.ts`:

```ts
import { getPayload } from "payload";
import config from "@payload-config";

export async function GET(request: Request) {
  const stand = new URL(request.url).searchParams.get("stand") ?? "Stand: Juni 2026";
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "legal-pages",
    where: { slug: { equals: "datenschutz" } },
    limit: 1,
    depth: 0,
  });
  await payload.update({ collection: "legal-pages", id: docs[0].id, data: { stand } });
  return Response.json({ ok: true, stand });
}
```

Then:

```bash
npm run build
npx next start -p 3111 > /tmp/htv-verify.log 2>&1 & echo $! > /tmp/htv-verify.pid
curl -sS --retry 30 --retry-delay 1 --retry-connrefused "http://localhost:3111/tmp-revalidate?stand=Stand:%20Juni%202026%20(Test)"
curl -s http://localhost:3111/datenschutz | grep -c "Juni 2026 (Test)"      # → 1, without a rebuild
curl -s "http://localhost:3111/tmp-revalidate?stand=Stand:%20Juni%202026"
curl -s http://localhost:3111/datenschutz | grep -c "Juni 2026 (Test)"      # → 0
kill "$(cat /tmp/htv-verify.pid)"
rm -r "app/(frontend)/tmp-revalidate"
npm run build
```

The second `grep -c` returning `0` proves both directions. Confirm `git status` no longer shows the temporary route.

- [ ] **Step 6: Confirm no legal text is left in code and commit**

```bash
git grep -n "Haftungsbeschränkung\|Registernummer: VR 13415\|poststelle@ldi.nrw.de" -- app components lib
```

Expected: no hits (the only remaining copy is `scripts/seed-legal-pages.ts`, which is not in that path list).

```bash
git add "app/(frontend)/impressum/page.tsx" "app/(frontend)/datenschutz/page.tsx" "app/(frontend)/cookies/page.tsx"
git commit -m "Read Impressum, Datenschutz and Cookies from Payload"
rm -rf /tmp/htv-legal
```

Finally confirm `git status` is clean apart from intentionally untracked nothing — no throwaway scripts, no `.env.local` changes.

---

## What This Plan Deliberately Does Not Cover

- **A `/news` detail or archive route.** No news detail pages exist today; the section stays a teaser list, and the dead "News-Archiv" link is removed rather than shipped. The `news.content` rich-text field is created but not rendered — a later plan can add `/news/[slug]` and render it.
- **Seeding the 5 legacy news articles.** See Task 3 and "Notes for the user" — this is a content decision for the club, not a migration step.
- **Mitgliedschaft, Training, Eisstock, the homepage globals** (Hero, Willkommen, Standorte, Footer), the **Navbar** (stays code by design) and the **contact form / `contact-submissions`** — each gets its own plan.
- **Roles (`admin` vs `editor`) on the Users collection** — unchanged here.
- **Globals revalidation helpers** — no globals are introduced in this plan.
- **The Vercel deployment** (preview + production alias) of this phase is done by the controller after the final review, not by a task here.
- **Legal review of the texts themselves.** This plan moves wording verbatim; it does not check whether the Datenschutzerklärung is still accurate (see the flags below).

---

## Notes for the user

1. **News is created but empty — nothing was published.** The 5 articles hardcoded in `components/ui/news-section.tsx` were *not* seeded, because the data set cannot be migrated honestly: three of them have `"News"` instead of a date, two ("Saisonabschlussfest 2024" and "Saisonabschluss 2024 – ein Abend voller Highlights!") describe the *same* evening with overlapping text, the photos are generic stock images that do not show the described events, and everything is from 2024 while the section has been switched off on the homepage. The news section now appears on the homepage **automatically as soon as the first article is created in `/admin`** — and stays invisible until then. The original texts are not lost: they are in git history, e.g. `git show <commit-before-"Add news collection…">:hardtertv/components/ui/news-section.tsx`. If you want them online, paste the ones you still consider current into the admin with a real date.
2. **Removed dead link.** `news-section.tsx` had a prominent "News-Archiv" button pointing to `/news` — a route that has never existed (it would have 404'd). It and the per-card "Weiterlesen" affordances were removed with the rewiring; they can come back together with a real detail route.
3. **Legal pages: three documents, uneditable in number.** In `/admin` → "Rechtsseiten" you can edit Impressum, Datenschutzerklärung and Cookie-Einstellungen, but you cannot create a fourth one or delete one (the API refuses both with 403). The slug is read-only, so the URLs `/impressum`, `/datenschutz`, `/cookies` can never break — every link in the footer, the cookie banner, the contact form and the Google-Maps consent gate keeps working.
4. **How the legal texts are structured now.** Each page is a list of "Abschnitte"; per section you edit a small heading (the grey uppercase line) and the body (the white card). In the editor, **bold** = the old dark bold labels, a **quote block** = the small grey "Rechtsgrundlage: …" print, **Heading 3** = a sub-section with a hairline above it, and a **bullet list** renders with the em-dash markers of the old "Ihre Rechte" list.
5. **The wording was not changed.** Task 6 diffs the visible text of the old pages against the new ones word by word: Impressum and Cookies are byte-identical, Datenschutz differs only by the 7 em-dash bullets that are now drawn by CSS instead of being text.
6. **Browser-tab titles fixed in passing.** `/impressum` used to render "Impressum – Hardter TV – Hardter TV" (the page title already contained the suffix that the layout template adds again); it now reads "Impressum – Hardter TV". `/datenschutz` now reads "Datenschutzerklärung – Hardter TV" (previously "Datenschutz – Hardter TV – Hardter TV").
7. **Things in the legal texts worth checking (not changed by this migration):**
   - The Datenschutzerklärung says *"Stand: Juni 2026"* and describes a contact form that, today, does not store or send anything (`kontakt-section.tsx` only fakes a success state). Once the contact form actually persists submissions (a later plan), that paragraph becomes accurate — right now it promises processing that does not happen.
   - The Cookie settings page offers an **"Analyse"** toggle (Google Analytics) although no analytics tool is embedded anywhere in the site. Either remove the toggle or keep it as a placeholder consciously.
   - The Datenschutzerklärung's Google-Maps section says Maps *"wird eingebunden"*; the site only ever **links** to Maps behind a consent gate — the wording is stricter than reality, which is harmless but could be simplified.
   - The Impressum contains a typographic slip in `(„externe Links")`: a German opening quote with a straight closing quote. It was transcribed **verbatim** and not silently fixed; correcting it is a one-field edit in the admin.
8. **Gallery.** `/galerie` now renders every album in `gallery-albums`, newest year first, with one shared lightbox across all albums. Adding "Rückblick 2025" is: new album, title, year, drag the photos in — no code change. The 17 images of "Rückblick 2024" were uploaded to Payload/Blob with their original alt texts; the old files in `public/images/Rückblick 2024/` are now unused and could be deleted in a later cleanup (this plan leaves them alone). Also unused and pre-existing: `public/images/gallery/gallery-cover-test-….jpg`, which nothing references.
9. **Deviation from the spec worth knowing.** The spec sketched `legal-pages` as `{slug, titel, content richtext}`. The implemented model is `{slug, titel, intro, abschnitte[{titel, inhalt}], stand}`, because a single rich-text blob cannot reproduce the existing "grey heading above a white card" layout without fragile heuristics. Same content, better editing experience, identical output.
