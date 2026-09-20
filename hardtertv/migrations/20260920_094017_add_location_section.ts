import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "location_section_karten" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titel" varchar NOT NULL,
  	"untertitel" varchar,
  	"bild_id" integer,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "location_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"headline_teil1" varchar NOT NULL,
  	"headline_teil2" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"cta_label" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "location_section_karten" ADD CONSTRAINT "location_section_karten_bild_id_media_id_fk" FOREIGN KEY ("bild_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "location_section_karten" ADD CONSTRAINT "location_section_karten_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."location_section"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "location_section_karten_order_idx" ON "location_section_karten" USING btree ("_order");
  CREATE INDEX "location_section_karten_parent_id_idx" ON "location_section_karten" USING btree ("_parent_id");
  CREATE INDEX "location_section_karten_bild_idx" ON "location_section_karten" USING btree ("bild_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "location_section_karten" CASCADE;
  DROP TABLE "location_section" CASCADE;`)
}
