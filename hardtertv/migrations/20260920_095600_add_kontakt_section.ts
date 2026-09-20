import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "kontakt_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"headline_teil1" varchar NOT NULL,
  	"headline_teil2" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"maps_embed_url" varchar NOT NULL,
  	"maps_titel" varchar NOT NULL,
  	"erfolg_titel" varchar NOT NULL,
  	"erfolg_text" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "kontakt_section" CASCADE;`)
}
