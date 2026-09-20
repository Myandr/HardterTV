import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Teams } from "./collections/Teams";
import { BoardMembers } from "./collections/BoardMembers";
import { Events } from "./collections/Events";
import { GalleryAlbums } from "./collections/GalleryAlbums";
import { News } from "./collections/News";
import { LegalPages } from "./collections/LegalPages";
import { Mitgliedschaft } from "./globals/Mitgliedschaft";
import { Training } from "./globals/Training";
import { Eisstock } from "./globals/Eisstock";
import { HeroGlobal } from "./globals/Hero";
import { WelcomeSectionGlobal } from "./globals/WelcomeSection";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Teams, BoardMembers, Events, GalleryAlbums, News, LegalPages],
  globals: [Mitgliedschaft, Training, Eisstock, HeroGlobal, WelcomeSectionGlobal],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    push: false,
    pool: {
      connectionString: process.env.DATABASE_URL || "",
      // Neon closes idle connections; drop them first and never hang forever.
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 15_000,
      query_timeout: 120_000,
      keepAlive: true,
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
