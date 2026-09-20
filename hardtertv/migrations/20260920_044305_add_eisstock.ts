import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_eisstock_angebot_kacheln_icon" AS ENUM('mapPin', 'users', 'euro', 'calendarDays');
  CREATE TABLE "eisstock_angebot_kacheln" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_eisstock_angebot_kacheln_icon" DEFAULT 'mapPin' NOT NULL,
  	"titel" varchar NOT NULL,
  	"beschreibung" varchar NOT NULL
  );
  
  CREATE TABLE "eisstock_galerie_bilder" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"bild_id" integer NOT NULL
  );
  
  CREATE TABLE "eisstock" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_bild_id" integer,
  	"hero_eyebrow" varchar NOT NULL,
  	"hero_titel_vorne" varchar NOT NULL,
  	"hero_titel_highlight" varchar NOT NULL,
  	"hero_text" varchar NOT NULL,
  	"hero_button_label" varchar NOT NULL,
  	"angebot_eyebrow" varchar NOT NULL,
  	"angebot_titel_vorne" varchar NOT NULL,
  	"angebot_titel_highlight" varchar NOT NULL,
  	"angebot_text" varchar NOT NULL,
  	"buchung_eyebrow" varchar NOT NULL,
  	"buchung_titel_vorne" varchar NOT NULL,
  	"buchung_titel_highlight" varchar NOT NULL,
  	"buchung_text" varchar NOT NULL,
  	"buchung_widget_url" varchar DEFAULT 'https://hartdertv.simplybook.it/v2/#book' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "eisstock_angebot_kacheln" ADD CONSTRAINT "eisstock_angebot_kacheln_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."eisstock"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "eisstock_galerie_bilder" ADD CONSTRAINT "eisstock_galerie_bilder_bild_id_media_id_fk" FOREIGN KEY ("bild_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "eisstock_galerie_bilder" ADD CONSTRAINT "eisstock_galerie_bilder_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."eisstock"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "eisstock" ADD CONSTRAINT "eisstock_hero_bild_id_media_id_fk" FOREIGN KEY ("hero_bild_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "eisstock_angebot_kacheln_order_idx" ON "eisstock_angebot_kacheln" USING btree ("_order");
  CREATE INDEX "eisstock_angebot_kacheln_parent_id_idx" ON "eisstock_angebot_kacheln" USING btree ("_parent_id");
  CREATE INDEX "eisstock_galerie_bilder_order_idx" ON "eisstock_galerie_bilder" USING btree ("_order");
  CREATE INDEX "eisstock_galerie_bilder_parent_id_idx" ON "eisstock_galerie_bilder" USING btree ("_parent_id");
  CREATE INDEX "eisstock_galerie_bilder_bild_idx" ON "eisstock_galerie_bilder" USING btree ("bild_id");
  CREATE INDEX "eisstock_hero_hero_bild_idx" ON "eisstock" USING btree ("hero_bild_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "eisstock_angebot_kacheln" CASCADE;
  DROP TABLE "eisstock_galerie_bilder" CASCADE;
  DROP TABLE "eisstock" CASCADE;
  DROP TYPE "public"."enum_eisstock_angebot_kacheln_icon";`)
}
