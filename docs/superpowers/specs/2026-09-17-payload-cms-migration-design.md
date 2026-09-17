# HardterTV — Payload CMS Migration Design

**Date:** 2026-09-17
**Status:** Approved for planning

## Goal

Move all currently hardcoded website content (teams, board members, training info,
events/calendar, gallery, news, membership info, legal pages, homepage sections) into
a Payload CMS backend, backed by a Neon Postgres database, so board members can edit
content without a code change/deploy. Also make the contact form actually functional.

## Context

The site (`hardtertv/`, Next.js 16 App Router, React 19, Tailwind 4) currently has zero
backend: no `app/api/`, no `middleware.ts`, no database. Content is hardcoded across
page/component files, with two notable existing problems this migration fixes:

- **Duplicated, diverging data:** board members appear both in `app/vorstand/page.tsx`
  (full list) and `components/ui/vorstand-section.tsx` (3-item homepage excerpt), and
  events appear both in `components/ui/termine-section.tsx` (3 items) and
  `app/kalender/kalender-client.tsx` (7 items) — the two event lists are not synced.
- **Non-functional contact form:** `kontakt-section.tsx`'s `handleSubmit` only calls
  `preventDefault()` and shows a fake "sent" state; nothing is persisted or emailed.

The only existing structured data layer is `lib/mannschaften-data.ts` (17 teams,
typed, with `getTeamBySlug()` and category filters) — used as the template for how
new collections should be modeled.

## Architecture & Tech Stack

- **Payload 3**, integrated directly into the existing Next.js App Router project
  (not a separate service/repo). Admin UI at `/admin`. One Vercel deployment.
- **Database:** Neon Postgres, provisioned via `vercel integration add neon`
  (Vercel Marketplace — auto env vars, e.g. `DATABASE_URI`). Adapter:
  `@payloadcms/db-postgres`.
- **Media storage:** Vercel Blob via `@payloadcms/storage-vercel-blob`. Neon is
  SQL-only and cannot store files; Payload's Media collection uploads directly to
  Blob through this adapter.
- **Rich text:** Payload's Lexical editor, for freeform fields (welcome text, trainer
  bio, legal page bodies).
- **Auth/roles:** Payload's built-in `Users` collection, extended with a `role` field:
  `admin` (full access incl. user management) and `editor` (all content
  collections/globals, no access to Users). Multiple board members get `editor`.
- **Publish workflow:** immediate/live on save — no draft/publish versioning system.
  (Explicitly decided: simplicity over a review gate, including for legal pages.)
- **Frontend data access:** Next.js Server Components call Payload's **Local API**
  in-process (no REST/GraphQL round trip needed since both run in the same server).

## Content Model

### Collections (repeatable content — admin list view, "add new")

| Collection | Key fields | Replaces |
|---|---|---|
| `teams` | slug, name, kategorie (Herren/Damen/Gemischt), kontakt, bild (Media rel), ligaUrl | `lib/mannschaften-data.ts` |
| `board-members` | name, titel, gruppe (5 fixed options), email(s), telefon, foto (Media rel), `featured` (bool) | `app/vorstand/page.tsx` + `vorstand-section.tsx` — `featured=true` filtered/limited to 3 feeds the homepage, single source of truth |
| `events` | titel, datum, uhrzeit, ort, kategorie (Training/Turnier/Sonstiges), beschreibung | Unifies the two currently-separate event lists (homepage 3-item, kalender 7-item) into one collection — homepage queries "next 3 upcoming", kalender queries "all in month" |
| `gallery-albums` | titel (e.g. "Rückblick 2024"), jahr, bilder (hasMany Media rel) | Filename-interpolation hack in `app/galerie/page.tsx` — new years addable by editors without code changes |
| `news` | datum, titel, excerpt, content (richtext), bild (Media rel), kategorie | Reactivates the currently-disabled `news-section.tsx` with real data |
| `legal-pages` | slug (fixed: `impressum`\|`datenschutz`\|`cookies`), titel, content (richtext) | Impressum/Datenschutz/Cookies pages. Access control disables create/delete — only `update` on the 3 seeded docs, to prevent accidental duplication/deletion of legally required pages |
| `contact-submissions` | name, email, nachricht, telefon, gelesen (bool), createdAt (auto) | Makes the contact form real |
| `media` | Payload default (image/PDF upload → Vercel Blob) | `public/images/*`, PDFs in `public/` |
| `users` | Payload default + `role` (admin/editor) | — |

### Globals (singleton content — one fixed admin page per global)

| Global | Content | Replaces |
|---|---|---|
| `hero` | Headline, subtext, hero image, partner logo list | `components/ui/hero.tsx` |
| `welcome-section` | Stats (4 tiles), welcome text (richtext), signature, image | `components/ui/welcome-section.tsx` |
| `location-section` | 5 facility cards (title, image, link) | `components/ui/location-section.tsx` |
| `footer` | Contact people, address, Instagram, shop link, fun fact | `components/ui/footer.tsx` (also feeds `InstagramCta`) |
| `training` | Trainer profile, offers (array, 6 cards), facility info | `app/training/page.tsx` (entire page) |
| `mitgliedschaft` | Benefits, stats, documents (PDF Media rels), process steps, contact CTA | `app/mitgliedschaft/page.tsx` |

**Deliberately excluded from Payload:** the **Navbar** stays in code — nav entries map
1:1 to real routes, and CMS-managing them risks dead links with no safety net.

## Migration Strategy

Incremental, not big-bang — de-risks the Neon/Blob/Payload setup before modeling
everything:

1. Set up Payload + Neon + Vercel Blob. Build one vertical slice end-to-end
   (`teams` collection, chosen because it's already cleanly typed) — admin edit →
   seed migration → frontend rendering → deploy — and verify the whole pipeline works.
2. Roll out remaining collections/globals one at a time: `board-members`, `events`,
   `gallery-albums`, `news`, `legal-pages`, `mitgliedschaft`, `training`, then the
   homepage globals (`hero`, `welcome-section`, `location-section`, `footer`).
3. A one-time seed script imports existing hardcoded content and images from
   `public/images/` into Payload/Blob. Once verified, the old hardcoded
   arrays/components are deleted (not left as dead fallback code).

## Access Control

Two roles: `admin` (full access + user management) and `editor` (all content
collections/globals, no `users` access). `legal-pages` additionally disables
`create`/`delete` in its access control — only existing documents can be `update`d.

## Contact Form

`kontakt-section.tsx` moves from a fake client-side-only handler to a Next.js Server
Action that calls Payload's Local API (`payload.create({ collection:
'contact-submissions', ... })`), persisting directly to Neon. Submissions are visible
in `/admin`. Server-side validation via Payload's field config (required fields, email
field type) — no duplicate frontend validation logic. Email notification (e.g. via
Resend) is explicitly out of scope for this migration; noted as a possible later
addition.

## Error Handling

Validation lives in Payload collection/global field config (`required: true`, typed
fields like `email`) rather than duplicated in frontend code. Missing media
relations fall back to a default placeholder image in the Media collection
(replacing the current ad hoc "Foto Person fehlt.png" pattern).

## Testing

No test infrastructure exists in the project today, and none is being introduced as
part of this migration (YAGNI). Verification is manual per migrated
collection/global: create/edit an entry in `/admin`, confirm it renders correctly on
the corresponding frontend page. `next build` serves as a pre-deploy smoke test.

## Explicit Non-Goals

- No draft/publish versioning workflow (decided: immediate-live for simplicity).
- No email notifications on contact form submission (noted as future addition).
- No new automated test suite.
- Navbar remains code, not CMS-managed.
