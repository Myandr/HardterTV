# Payload Foundation + Teams Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up Payload 3 (integrated into the existing Next.js app) on a Neon Postgres database with Vercel Blob media storage, prove the whole pipeline end-to-end by migrating the `teams` (Mannschaften) collection, and deploy it to a Vercel preview.

**Architecture:** Payload 3 installs directly into `hardtertv/app` alongside the existing site via Next.js route groups — `(frontend)` for the public site (unchanged behavior, just relocated) and `(payload)` for the admin UI/API. Frontend pages read content through Payload's in-process Local API. Postgres schema changes go through Payload's migration system (`payload migrate`), run as part of the Vercel build.

**Tech Stack:** Payload 3, `@payloadcms/db-postgres` (Neon), `@payloadcms/storage-vercel-blob`, `@payloadcms/richtext-lexical`, Next.js 16 App Router (existing), TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-17-payload-cms-migration-design.md`

## Global Constraints

- Payload installs directly into the existing `hardtertv/` Next.js project — no separate repo/service.
- Database: Neon Postgres, provisioned via Vercel Marketplace (`vercel integration add neon`), adapter `@payloadcms/db-postgres`.
- Media: Vercel Blob via `@payloadcms/storage-vercel-blob` (Neon cannot store files).
- Publish workflow: immediate/live on save — no draft/publish versioning.
- Roles: `admin` (full access) and `editor` (content only, no user management) on the `users` collection.
- Payload 3 requires Next.js 15.2.9+/15.3.9+/15.4.11+/16.2.6+ and Node.js 20.9.0+. This project is on Next.js 16.2.6 (the floor) and Node 25.2.1 locally — compatible, no upgrade needed.
- No new automated test framework. Verification is manual (dev server + admin UI checks) plus `next build` / `tsc` as smoke tests, per the approved spec's Testing section.
- All commands that touch Vercel (`vercel ...`) run from the `hardtertv/` directory, where this project is already linked (`hardtertv/.vercel/project.json`, project `hardt-tennis`).

---

## File Structure

```
hardtertv/
  payload.config.ts              # new — Payload config (DB, collections, plugins)
  collections/
    Users.ts                     # new — auth collection + role field
    Media.ts                     # new — upload collection (backed by Vercel Blob)
    Teams.ts                     # new — Mannschaften collection
  scripts/
    seed-teams.ts                # new — one-time migration of lib/mannschaften-data.ts → Payload
  app/
    favicon.ico                  # stays at true app root (Next.js convention)
    (frontend)/                  # new route group — all existing pages move here unchanged
      layout.tsx
      globals.css
      page.tsx
      cookies/…
      datenschutz/…
      eisstock/…
      galerie/…
      impressum/…
      kalender/…
      mannschaften/
        page.tsx                 # modified — fetches from Payload instead of lib/
        mannschaften-client.tsx  # modified — local Team type instead of lib/ import
        [slug]/page.tsx          # modified — fetches from Payload instead of lib/
      mitgliedschaft/…
      training/…
      vorstand/…
    (payload)/                   # new route group — Payload admin + API
      layout.tsx
      custom.css
      admin/
        importMap.js
        [[...segments]]/page.tsx
        [[...segments]]/not-found.tsx
      api/
        [...slug]/route.ts
        graphql/route.ts
        graphql-playground/route.ts
  next.config.ts                 # modified — withPayload wrapper + Blob image domain
  tsconfig.json                  # modified — @payload-config path alias
  package.json                   # modified — Payload deps + scripts
  lib/
    mannschaften-data.ts         # deleted at the end of Task 5 (superseded by Teams collection)
```

---

### Task 1: Restructure `app/` into a `(frontend)` route group

Payload's admin panel needs its own root `<html>/<body>` layout. Next.js only allows one layout per URL branch to own those tags, so the existing site layout and the future Payload layout must live in separate route groups. This task is pure file-moving — no behavior change — so it's a safe, independently verifiable first step before Payload exists at all.

**Files:**
- Move: `app/layout.tsx` → `app/(frontend)/layout.tsx`
- Move: `app/page.tsx` → `app/(frontend)/page.tsx`
- Move: `app/globals.css` → `app/(frontend)/globals.css`
- Move: `app/cookies/` → `app/(frontend)/cookies/`
- Move: `app/datenschutz/` → `app/(frontend)/datenschutz/`
- Move: `app/eisstock/` → `app/(frontend)/eisstock/`
- Move: `app/galerie/` → `app/(frontend)/galerie/`
- Move: `app/impressum/` → `app/(frontend)/impressum/`
- Move: `app/kalender/` → `app/(frontend)/kalender/`
- Move: `app/mannschaften/` → `app/(frontend)/mannschaften/`
- Move: `app/mitgliedschaft/` → `app/(frontend)/mitgliedschaft/`
- Move: `app/training/` → `app/(frontend)/training/`
- Move: `app/vorstand/` → `app/(frontend)/vorstand/`
- Keep in place: `app/favicon.ico` (Next.js requires this metadata file at the true `app/` root — it does not work inside a route group)

**Interfaces:**
- Consumes: nothing (no Payload dependency yet)
- Produces: `app/(frontend)/` as the home for all public routes — every later task that touches a page file uses this path

- [ ] **Step 1: Move all files with `git mv`**

Run from `hardtertv/`:

```bash
mkdir -p "app/(frontend)"
git mv app/layout.tsx "app/(frontend)/layout.tsx"
git mv app/page.tsx "app/(frontend)/page.tsx"
git mv app/globals.css "app/(frontend)/globals.css"
git mv app/cookies "app/(frontend)/cookies"
git mv app/datenschutz "app/(frontend)/datenschutz"
git mv app/eisstock "app/(frontend)/eisstock"
git mv app/galerie "app/(frontend)/galerie"
git mv app/impressum "app/(frontend)/impressum"
git mv app/kalender "app/(frontend)/kalender"
git mv app/mannschaften "app/(frontend)/mannschaften"
git mv app/mitgliedschaft "app/(frontend)/mitgliedschaft"
git mv app/training "app/(frontend)/training"
git mv app/vorstand "app/(frontend)/vorstand"
```

- [ ] **Step 2: Confirm nothing outside `app/` imports from `app/` by path**

```bash
grep -rn "from [\"']@/app" --include="*.tsx" --include="*.ts" . || echo "no matches (expected)"
```

Expected: `no matches (expected)`. If matches appear, update them to the new `app/(frontend)/...` path before continuing.

- [ ] **Step 3: Verify the build still succeeds**

```bash
npm run build
```

Expected: build completes successfully, same routes listed in the output as before the move (`/`, `/mannschaften`, `/mannschaften/[slug]`, `/training`, `/vorstand`, `/kalender`, `/galerie`, `/mitgliedschaft`, `/eisstock`, `/impressum`, `/datenschutz`, `/cookies`).

- [ ] **Step 4: Manual check in dev server**

```bash
npm run dev
```

Open `http://localhost:3000/` and `http://localhost:3000/mannschaften/herren-1` — both must render exactly as before (nav, footer, cookie banner, content). Stop the dev server (Ctrl+C) once confirmed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Move existing site into (frontend) route group

Prepares for Payload's (payload) route group, which needs its own
root layout and cannot share <html>/<body> with the site layout."
```

---

### Task 2: Provision Neon Postgres and Vercel Blob

**Files:** none (infrastructure only — produces `hardtertv/.env.local`, gitignored)

**Interfaces:**
- Consumes: nothing
- Produces: `DATABASE_URL` (Neon, pooled connection string) and `BLOB_READ_WRITE_TOKEN` (Vercel Blob) in `hardtertv/.env.local`, consumed by Task 3's `payload.config.ts`

- [ ] **Step 1: Install the Vercel CLI (if not already installed)**

```bash
npm i -g vercel
vercel --version
```

- [ ] **Step 2: Confirm the project is linked**

Run from `hardtertv/`:

```bash
vercel whoami
vercel project ls
```

The project is already linked (`hardtertv/.vercel/project.json` points at `hardt-tennis`). If `vercel whoami` fails, run `vercel login` first.

- [ ] **Step 3: Provision Neon via the Vercel Marketplace**

```bash
vercel integration add neon --yes
```

This may hand off to a browser step to finish choosing a Neon plan/region — if it does, complete that in the browser, then continue. This auto-creates a database and injects `DATABASE_URL` (and related vars) into the linked Vercel project's environment variables.

- [ ] **Step 4: Create a Vercel Blob store**

```bash
vercel blob create-store hardtertv-media --access public
```

Confirm in the Vercel dashboard (Storage tab) that the new store is connected to the `hardt-tennis` project — if it isn't connected automatically, connect it there manually. This injects `BLOB_READ_WRITE_TOKEN` into the project's environment variables.

- [ ] **Step 5: Pull the env vars locally**

```bash
vercel env pull .env.local --yes
```

- [ ] **Step 6: Verify (without printing secret values)**

```bash
grep -c "DATABASE_URL" .env.local
grep -c "BLOB_READ_WRITE_TOKEN" .env.local
```

Expected: both print `1`. `.env.local` is already covered by the project's `.gitignore` (`.env*`) — confirm it does not show up in `git status`.

- [ ] **Step 7: Generate and append `PAYLOAD_SECRET`**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Append the output to `.env.local` as a new line: `PAYLOAD_SECRET=<generated value>`.

No commit for this task — `.env.local` is gitignored and there are no other file changes.

---

### Task 3: Install and wire up Payload core (Users, Media, admin panel)

**Files:**
- Create: `hardtertv/collections/Users.ts`
- Create: `hardtertv/collections/Media.ts`
- Create: `hardtertv/payload.config.ts`
- Create: `hardtertv/app/(payload)/layout.tsx`
- Create: `hardtertv/app/(payload)/custom.css`
- Create: `hardtertv/app/(payload)/admin/importMap.js`
- Create: `hardtertv/app/(payload)/admin/[[...segments]]/page.tsx`
- Create: `hardtertv/app/(payload)/admin/[[...segments]]/not-found.tsx`
- Create: `hardtertv/app/(payload)/api/[...slug]/route.ts`
- Create: `hardtertv/app/(payload)/api/graphql/route.ts`
- Create: `hardtertv/app/(payload)/api/graphql-playground/route.ts`
- Modify: `hardtertv/next.config.ts`
- Modify: `hardtertv/tsconfig.json`
- Modify: `hardtertv/package.json`

**Interfaces:**
- Consumes: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `PAYLOAD_SECRET` from `.env.local` (Task 2)
- Produces: a working `/admin` panel; `payload.config.ts` default-exports the config later tasks import (`import config from "@payload-config"` or relative `"../payload.config"`); `Users.slug === "users"`, `Media.slug === "media"`

- [ ] **Step 1: Install dependencies**

```bash
npm i payload @payloadcms/next @payloadcms/richtext-lexical @payloadcms/db-postgres @payloadcms/storage-vercel-blob sharp graphql
npm i -D tsx dotenv-cli
```

- [ ] **Step 2: Create `collections/Users.ts`**

```ts
import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      access: {
        // Only admins can change a user's role — editors can't promote themselves.
        update: ({ req }) => req.user?.role === "admin",
      },
    },
  ],
};
```

- [ ] **Step 3: Create `collections/Media.ts`**

```ts
import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: true,
};
```

- [ ] **Step 4: Create `payload.config.ts` at the `hardtertv/` root**

```ts
import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // Vercel serverless functions cap request bodies well under typical
      // photo sizes for admin-UI uploads — upload straight from the browser.
      clientUploads: true,
    }),
  ],
});
```

- [ ] **Step 5: Add the `@payload-config` path alias to `tsconfig.json`**

In `hardtertv/tsconfig.json`, change:

```json
"paths": {
  "@/*": ["./*"]
}
```

to:

```json
"paths": {
  "@/*": ["./*"],
  "@payload-config": ["./payload.config.ts"]
}
```

- [ ] **Step 6: Wrap `next.config.ts` with `withPayload` and add the Blob image domain**

Replace the contents of `hardtertv/next.config.ts` with:

```ts
import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.cnippet.dev" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default withPayload(nextConfig);
```

- [ ] **Step 7: Create the `(payload)` route group files**

Create `hardtertv/app/(payload)/custom.css` (empty file — Payload's convention for admin CSS overrides, left blank for now):

```css
```

Create `hardtertv/app/(payload)/layout.tsx`:

```tsx
import config from "@payload-config";
import "@payloadcms/next/css";
import type { ServerFunctionClient } from "payload";
import {
  generatePayloadViewport,
  handleServerFunctions,
  RootLayout,
} from "@payloadcms/next/layouts";
import React from "react";

import { importMap } from "./admin/importMap.js";
import "./custom.css";

export const generateViewport = generatePayloadViewport;

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
);

export default Layout;
```

Create `hardtertv/app/(payload)/admin/importMap.js` as a placeholder (Step 9 regenerates it for real):

```js
/** @type import('payload').ImportMap */
export const importMap = {};
```

Create `hardtertv/app/(payload)/admin/[[...segments]]/page.tsx`:

```tsx
import type { Metadata } from "next";

import config from "@payload-config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import { importMap } from "../importMap";

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, params, searchParams, importMap });

export default Page;
```

Create `hardtertv/app/(payload)/admin/[[...segments]]/not-found.tsx`:

```tsx
import type { Metadata } from "next";

import config from "@payload-config";
import { NotFoundPage, generatePageMetadata } from "@payloadcms/next/views";
import { importMap } from "../importMap";

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

const NotFound = ({ params, searchParams }: Args) =>
  NotFoundPage({ config, params, searchParams, importMap });

export default NotFound;
```

Create `hardtertv/app/(payload)/api/[...slug]/route.ts`:

```ts
import config from "@payload-config";
import "@payloadcms/next/css";
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from "@payloadcms/next/routes";

export const GET = REST_GET(config);
export const POST = REST_POST(config);
export const DELETE = REST_DELETE(config);
export const PATCH = REST_PATCH(config);
export const PUT = REST_PUT(config);
export const OPTIONS = REST_OPTIONS(config);
```

Create `hardtertv/app/(payload)/api/graphql/route.ts`:

```ts
import config from "@payload-config";
import { GRAPHQL_POST, REST_OPTIONS } from "@payloadcms/next/routes";

export const POST = GRAPHQL_POST(config);

export const OPTIONS = REST_OPTIONS(config);
```

Create `hardtertv/app/(payload)/api/graphql-playground/route.ts`:

```ts
import config from "@payload-config";
import "@payloadcms/next/css";
import { GRAPHQL_PLAYGROUND_GET } from "@payloadcms/next/routes";

export const GET = GRAPHQL_PLAYGROUND_GET(config);
```

- [ ] **Step 8: Add Payload npm scripts**

In `hardtertv/package.json`, add to `"scripts"` (local dev scripts load `.env.local` via `dotenv-cli`, since only `next dev`/`next build` do that automatically — the standalone `payload` CLI does not):

```json
"payload": "dotenv -e .env.local -- payload",
"generate:types": "dotenv -e .env.local -- payload generate:types",
"generate:importmap": "dotenv -e .env.local -- payload generate:importmap",
"migrate:create": "dotenv -e .env.local -- payload migrate:create",
"migrate": "dotenv -e .env.local -- payload migrate",
"ci": "payload migrate && next build"
```

Note: `ci` deliberately does **not** go through `dotenv-cli` — it runs on Vercel, where env vars are already injected natively; `.env.local` doesn't exist there. This script is wired to Vercel's build command in Task 6.

- [ ] **Step 9: Generate the real import map**

```bash
npm run generate:importmap
```

Expected: `app/(payload)/admin/importMap.js` is overwritten with real content (imports from `@payloadcms/ui` etc.). Confirm it's no longer the empty placeholder:

```bash
cat "app/(payload)/admin/importMap.js"
```

- [ ] **Step 10: Create and run the first migration**

```bash
npm run migrate:create -- init
npm run migrate
```

Expected: both commands succeed; a new folder appears under `hardtertv/migrations/`.

- [ ] **Step 11: Start the dev server and create the first admin user**

```bash
npm run dev
```

Open `http://localhost:3000/admin` — Payload shows a "Create first user" screen. Create an account with your own email (this becomes the first `admin`-role... actually default role is `editor` — see note below).

**Note:** the `role` field defaults to `editor` and only an existing admin can change it (Step 2's access control). For this very first user, temporarily remove the `access.update` restriction from `collections/Users.ts`, save, let the dev server hot-reload, set your user's role to `admin` in the admin UI (`/admin/collections/users`), then restore the `access.update` restriction and save again. This bootstraps exactly one admin without permanently weakening the access rule.

- [ ] **Step 12: Confirm the existing site still works unchanged**

With the dev server still running, open `http://localhost:3000/` and `http://localhost:3000/mannschaften` — both render exactly as before Task 3 (Payload and the frontend coexist without interfering). Stop the dev server.

- [ ] **Step 13: Run a full build as a smoke test**

```bash
npm run build
```

Expected: succeeds, now also listing the `(payload)` routes (`/admin/[[...segments]]`, `/api/...`).

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "Install Payload core: Users, Media, admin panel, Neon adapter

Payload now runs at /admin backed by Neon Postgres and Vercel Blob.
No frontend behavior changes yet."
```

(`.env.local` stays untracked per `.gitignore`; do not add it.)

---

### Task 4: Add the `teams` collection and seed it from existing data

**Files:**
- Create: `hardtertv/collections/Teams.ts`
- Modify: `hardtertv/payload.config.ts` (register `Teams`)
- Create: `hardtertv/scripts/seed-teams.ts`
- Modify: `hardtertv/package.json` (add `seed:teams` script)

**Interfaces:**
- Consumes: `teams` array + `Team` type from `lib/mannschaften-data.ts` (still present — deleted in Task 5); `payload.config.ts` default export (Task 3)
- Produces: a `teams` Payload collection with fields `slug, name, kategorie, kontakt, bild (upload→media), ligaUrl` — consumed by Task 5's frontend pages

- [ ] **Step 1: Create `collections/Teams.ts`**

```ts
import type { CollectionConfig } from "payload";

export const Teams: CollectionConfig = {
  slug: "teams",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "kategorie", "slug"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "kategorie",
      type: "select",
      required: true,
      options: [
        { label: "Herren", value: "Herren" },
        { label: "Damen", value: "Damen" },
        { label: "Gemischt", value: "Gemischt" },
      ],
    },
    {
      name: "kontakt",
      type: "text",
      required: true,
    },
    {
      name: "bild",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "ligaUrl",
      type: "text",
      required: true,
      label: "Liga-URL (wtv.liga.nu)",
    },
  ],
};
```

- [ ] **Step 2: Register `Teams` in `payload.config.ts`**

In `hardtertv/payload.config.ts`, add the import and register the collection:

```diff
 import { Users } from "./collections/Users";
 import { Media } from "./collections/Media";
+import { Teams } from "./collections/Teams";
```

```diff
-  collections: [Users, Media],
+  collections: [Users, Media, Teams],
```

- [ ] **Step 3: Create and run the migration**

```bash
npm run migrate:create -- add-teams
npm run migrate
```

- [ ] **Step 4: Regenerate types**

```bash
npm run generate:types
```

Expected: `hardtertv/payload-types.ts` now includes a `Team` interface.

- [ ] **Step 5: Write the seed script `scripts/seed-teams.ts`**

```ts
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

import config from "../payload.config";
import { teams } from "../lib/mannschaften-data";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

async function run() {
  const payload = await getPayload({ config });

  for (const team of teams) {
    const existing = await payload.find({
      collection: "teams",
      where: { slug: { equals: team.slug } },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      console.log(`skip (already exists): ${team.slug}`);
      continue;
    }

    let mediaId: number | undefined;
    if (team.bild) {
      const filePath = path.resolve(dirname, "..", "public", team.bild.replace(/^\//, ""));
      const media = await payload.create({
        collection: "media",
        data: { alt: `${team.name} Mannschaftsfoto` },
        filePath,
      });
      mediaId = media.id;
    }

    await payload.create({
      collection: "teams",
      data: {
        slug: team.slug,
        name: team.name,
        kategorie: team.kategorie,
        kontakt: team.kontakt,
        ligaUrl: team.ligaUrl,
        bild: mediaId,
      },
    });
    console.log(`created: ${team.slug}`);
  }

  console.log("done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 6: Add the `seed:teams` script**

In `hardtertv/package.json`, add to `"scripts"`:

```json
"seed:teams": "dotenv -e .env.local -- tsx scripts/seed-teams.ts"
```

- [ ] **Step 7: Run the seed script**

```bash
npm run seed:teams
```

Expected: 17 lines of `created: <slug>` (or `skip` on a re-run), ending with `done`.

- [ ] **Step 8: Verify in the admin UI**

```bash
npm run dev
```

Open `http://localhost:3000/admin/collections/teams`:
- Confirm 17 documents exist.
- Open `herren-1` — confirm `kategorie: Herren`, `kontakt: henbue@ymail.com`, and an uploaded image thumbnail for `bild`.
- Open `herren-doppel-60` — confirm the same fields but `bild` empty (this team had `bild: null` in the source data).

Stop the dev server.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Add teams collection and seed it from lib/mannschaften-data.ts

17 teams migrated into Payload, including images uploaded to Vercel
Blob. Frontend still reads from the old data file until Task 5."
```

---

### Task 5: Rewire the Mannschaften pages to Payload, remove the old data file

**Files:**
- Modify: `hardtertv/app/(frontend)/mannschaften/page.tsx`
- Modify: `hardtertv/app/(frontend)/mannschaften/mannschaften-client.tsx`
- Modify: `hardtertv/app/(frontend)/mannschaften/[slug]/page.tsx`
- Delete: `hardtertv/lib/mannschaften-data.ts`

**Interfaces:**
- Consumes: `teams` Payload collection (Task 4)
- Produces: `Team` — a small UI-facing shape `{ slug, name, kategorie, kontakt, bild: string | null, ligaUrl }`, defined locally in `mannschaften-client.tsx` (decoupled from Payload's generated types, so the client component doesn't need to know about Payload at all)

- [ ] **Step 1: Replace the `Team` import in `mannschaften-client.tsx` with a local type**

In `hardtertv/app/(frontend)/mannschaften/mannschaften-client.tsx`, replace:

```ts
import type { Team } from "@/lib/mannschaften-data";
```

with:

```ts
type Team = {
  slug: string;
  name: string;
  kategorie: "Herren" | "Damen" | "Gemischt";
  kontakt: string;
  bild: string | null;
  ligaUrl: string;
};
```

Nothing else in this file changes — `TeamCard` and `MannschaftenClient` already only use `slug`, `name`, `bild`, `kategorie` from this shape.

- [ ] **Step 2: Rewrite `mannschaften/page.tsx` to fetch from Payload**

Replace the top of `hardtertv/app/(frontend)/mannschaften/page.tsx`:

```diff
-import MannschaftenClient from "./mannschaften-client";
-import { herren, damen, gemischt } from "@/lib/mannschaften-data";
-
-export default function MannschaftenPage() {
+import { getPayload } from "payload";
+import config from "@payload-config";
+import MannschaftenClient from "./mannschaften-client";
+
+type Team = {
+  slug: string;
+  name: string;
+  kategorie: "Herren" | "Damen" | "Gemischt";
+  kontakt: string;
+  bild: string | null;
+  ligaUrl: string;
+};
+
+async function getTeams(): Promise<Team[]> {
+  const payload = await getPayload({ config });
+  const { docs } = await payload.find({
+    collection: "teams",
+    depth: 1,
+    limit: 200,
+    sort: "name",
+  });
+
+  return docs.map((doc) => ({
+    slug: doc.slug,
+    name: doc.name,
+    kategorie: doc.kategorie,
+    kontakt: doc.kontakt,
+    bild: typeof doc.bild === "object" && doc.bild ? doc.bild.url ?? null : null,
+    ligaUrl: doc.ligaUrl,
+  }));
+}
+
+export default async function MannschaftenPage() {
+  const teams = await getTeams();
+  const herren = teams.filter((t) => t.kategorie === "Herren");
+  const damen = teams.filter((t) => t.kategorie === "Damen");
+  const gemischt = teams.filter((t) => t.kategorie === "Gemischt");
+
```

The rest of the file (the hero `<section>` and the contact `<section>` further down, plus the final `<MannschaftenClient herren={herren} damen={damen} gemischt={gemischt} />` line) stays exactly as-is — `herren`, `damen`, `gemischt` are now locally computed instead of imported, same names and same shape.

- [ ] **Step 3: Rewrite `mannschaften/[slug]/page.tsx` to fetch from Payload**

Replace the top of `hardtertv/app/(frontend)/mannschaften/[slug]/page.tsx`:

```diff
 import { notFound } from "next/navigation";
 import Image from "next/image";
 import Link from "next/link";
 import { ArrowLeft, Mail, Phone } from "lucide-react";
-import { teams, getTeamBySlug } from "@/lib/mannschaften-data";
+import { getPayload } from "payload";
+import config from "@payload-config";
 import TeamPlaceholder from "@/components/ui/team-placeholder";

-export function generateStaticParams() {
-  return teams.map((t) => ({ slug: t.slug }));
+type Team = {
+  slug: string;
+  name: string;
+  kategorie: "Herren" | "Damen" | "Gemischt";
+  kontakt: string;
+  bild: string | null;
+  ligaUrl: string;
+};
+
+async function getTeam(slug: string): Promise<Team | null> {
+  const payload = await getPayload({ config });
+  const { docs } = await payload.find({
+    collection: "teams",
+    where: { slug: { equals: slug } },
+    depth: 1,
+    limit: 1,
+  });
+  const doc = docs[0];
+  if (!doc) return null;
+  return {
+    slug: doc.slug,
+    name: doc.name,
+    kategorie: doc.kategorie,
+    kontakt: doc.kontakt,
+    bild: typeof doc.bild === "object" && doc.bild ? doc.bild.url ?? null : null,
+    ligaUrl: doc.ligaUrl,
+  };
+}
+
+export async function generateStaticParams() {
+  const payload = await getPayload({ config });
+  const { docs } = await payload.find({ collection: "teams", limit: 200, depth: 0 });
+  return docs.map((t) => ({ slug: t.slug }));
 }

 export async function generateMetadata({
   params,
 }: {
   params: Promise<{ slug: string }>;
 }) {
   const { slug } = await params;
-  const team = getTeamBySlug(slug);
+  const team = await getTeam(slug);
   if (!team) return {};
   return {
     title: `${team.name} – Hardter TV`,
     description: `${team.name} des Hardter Tennisverein – Saison 2024/2025`,
   };
 }
```

And further down:

```diff
 export default async function TeamPage({
   params,
 }: {
   params: Promise<{ slug: string }>;
 }) {
   const { slug } = await params;
-  const team = getTeamBySlug(slug);
+  const team = await getTeam(slug);
   if (!team) notFound();
```

Everything else in the file (the hero, image, contact, liga iframe, back-CTA sections) stays exactly as-is — `team.bild`, `team.name`, `team.kategorie`, `team.kontakt`, `team.ligaUrl` keep the same shape and meaning.

- [ ] **Step 4: Confirm no remaining references to the old data file**

```bash
grep -rn "mannschaften-data" --include="*.tsx" --include="*.ts" .
```

Expected: no matches.

- [ ] **Step 5: Delete the old data file**

```bash
git rm lib/mannschaften-data.ts
```

- [ ] **Step 6: Build and verify**

```bash
npm run build
```

Expected: succeeds, including static generation of all 17 `/mannschaften/[slug]` pages.

```bash
npm run dev
```

Open `http://localhost:3000/mannschaften` — confirm the tab counts (Herren/Damen/Gemischt) match the seeded data, and that team cards with images show them. Open `http://localhost:3000/mannschaften/herren-1` — confirm the photo renders (served from the `*.public.blob.vercel-storage.com` domain) and the liga iframe still loads. Open `http://localhost:3000/mannschaften/herren-doppel-60` — confirm the placeholder graphic shows (no photo) and the page doesn't error. Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Rewire Mannschaften pages to Payload, remove old data file

lib/mannschaften-data.ts is superseded by the teams collection.
Frontend now reads team data and images through Payload's Local API."
```

---

### Task 6: Wire migrations into the Vercel build and deploy a preview

**Files:**
- Modify: `hardtertv/package.json` (already has `ci` script from Task 3 — this task activates it)

**Interfaces:**
- Consumes: everything from Tasks 1–5
- Produces: a live Vercel preview deployment proving the full pipeline (Neon + Blob + Payload admin + migrated frontend) works outside local dev

- [ ] **Step 1: Point Vercel's Build Command at the `ci` script**

This is a dashboard-only step (Vercel project settings), done manually:

In the Vercel dashboard → `hardt-tennis` project → Settings → Build & Development Settings → Build Command → override to `npm run ci`. Save.

This makes every deploy run `payload migrate` against the production/preview database before `next build`, so schema changes ship automatically with the code that needs them.

- [ ] **Step 2: Deploy a preview**

Run from `hardtertv/`:

```bash
vercel deploy
```

Expected: the CLI prints a preview URL once the build (including the migration step) succeeds. If the build fails on the migration step, check that `DATABASE_URL` is set for the "Preview" environment in the Vercel dashboard (the Neon Marketplace integration should have added it to all environments in Task 2 — confirm under Settings → Environment Variables).

- [ ] **Step 3: Verify the preview deployment**

Open the preview URL:
- `/` and `/mannschaften` — same content as local dev.
- `/mannschaften/herren-1` — team photo loads from Vercel Blob.
- `/admin` — log in with the admin user created in Task 3. Confirm the `teams` collection shows all 17 documents.

- [ ] **Step 4: Commit (if Step 1 required no file change, this task has nothing further to commit)**

If `package.json`'s `ci` script needed any adjustment while debugging Step 2, commit it:

```bash
git add hardtertv/package.json
git commit -m "Adjust Vercel build script for Payload migrations"
```

---

## What This Plan Deliberately Does Not Cover

Per the spec's incremental migration strategy, the remaining collections/globals (`board-members`, `events`, `gallery-albums`, `news`, `legal-pages`, `mitgliedschaft`, `training`, and the homepage globals `hero`/`welcome-section`/`location-section`/`footer`) and the contact form (`contact-submissions`) are **out of scope for this plan**. Each will get its own plan, written right before it's executed, building on the foundation this plan lays down.
