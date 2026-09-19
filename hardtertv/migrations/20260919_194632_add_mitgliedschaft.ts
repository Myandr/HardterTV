import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_mitgliedschaft_dokumente_karten_icon" AS ENUM('users', 'star', 'fileText');
  CREATE TABLE "mitgliedschaft_vorteile_liste" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "mitgliedschaft_vorteile_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"wert" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"zusatz" varchar NOT NULL
  );
  
  CREATE TABLE "mitgliedschaft_dokumente_karten" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_mitgliedschaft_dokumente_karten_icon" DEFAULT 'fileText' NOT NULL,
  	"titel" varchar NOT NULL,
  	"beschreibung" varchar NOT NULL,
  	"datei_id" integer,
  	"download_label" varchar NOT NULL,
  	"mail_label" varchar,
  	"mail_adresse" varchar,
  	"mail_betreff" varchar
  );
  
  CREATE TABLE "mitgliedschaft_prozess_schritte" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nr" varchar NOT NULL,
  	"titel" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "mitgliedschaft" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar NOT NULL,
  	"hero_titel_vorne" varchar NOT NULL,
  	"hero_titel_highlight" varchar NOT NULL,
  	"hero_text" varchar NOT NULL,
  	"hero_antrag_button_label" varchar NOT NULL,
  	"hero_antrag_pdf_id" integer,
  	"hero_kontakt_link_label" varchar NOT NULL,
  	"hero_kontakt_email" varchar NOT NULL,
  	"vorteile_eyebrow" varchar NOT NULL,
  	"vorteile_titel_vorne" varchar NOT NULL,
  	"vorteile_titel_highlight" varchar NOT NULL,
  	"vorteile_titel_hinten" varchar,
  	"vorteile_text" varchar NOT NULL,
  	"dokumente_eyebrow" varchar NOT NULL,
  	"dokumente_titel_vorne" varchar NOT NULL,
  	"dokumente_titel_highlight" varchar NOT NULL,
  	"prozess_eyebrow" varchar NOT NULL,
  	"prozess_titel_vorne" varchar NOT NULL,
  	"prozess_titel_highlight" varchar NOT NULL,
  	"cta_titel" varchar NOT NULL,
  	"cta_text" varchar NOT NULL,
  	"cta_button_label" varchar NOT NULL,
  	"cta_email" varchar NOT NULL,
  	"cta_telefon_label" varchar NOT NULL,
  	"cta_telefon_href" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "mitgliedschaft_vorteile_liste" ADD CONSTRAINT "mitgliedschaft_vorteile_liste_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mitgliedschaft"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mitgliedschaft_vorteile_stats" ADD CONSTRAINT "mitgliedschaft_vorteile_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mitgliedschaft"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mitgliedschaft_dokumente_karten" ADD CONSTRAINT "mitgliedschaft_dokumente_karten_datei_id_media_id_fk" FOREIGN KEY ("datei_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mitgliedschaft_dokumente_karten" ADD CONSTRAINT "mitgliedschaft_dokumente_karten_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mitgliedschaft"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mitgliedschaft_prozess_schritte" ADD CONSTRAINT "mitgliedschaft_prozess_schritte_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mitgliedschaft"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mitgliedschaft" ADD CONSTRAINT "mitgliedschaft_hero_antrag_pdf_id_media_id_fk" FOREIGN KEY ("hero_antrag_pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "mitgliedschaft_vorteile_liste_order_idx" ON "mitgliedschaft_vorteile_liste" USING btree ("_order");
  CREATE INDEX "mitgliedschaft_vorteile_liste_parent_id_idx" ON "mitgliedschaft_vorteile_liste" USING btree ("_parent_id");
  CREATE INDEX "mitgliedschaft_vorteile_stats_order_idx" ON "mitgliedschaft_vorteile_stats" USING btree ("_order");
  CREATE INDEX "mitgliedschaft_vorteile_stats_parent_id_idx" ON "mitgliedschaft_vorteile_stats" USING btree ("_parent_id");
  CREATE INDEX "mitgliedschaft_dokumente_karten_order_idx" ON "mitgliedschaft_dokumente_karten" USING btree ("_order");
  CREATE INDEX "mitgliedschaft_dokumente_karten_parent_id_idx" ON "mitgliedschaft_dokumente_karten" USING btree ("_parent_id");
  CREATE INDEX "mitgliedschaft_dokumente_karten_datei_idx" ON "mitgliedschaft_dokumente_karten" USING btree ("datei_id");
  CREATE INDEX "mitgliedschaft_prozess_schritte_order_idx" ON "mitgliedschaft_prozess_schritte" USING btree ("_order");
  CREATE INDEX "mitgliedschaft_prozess_schritte_parent_id_idx" ON "mitgliedschaft_prozess_schritte" USING btree ("_parent_id");
  CREATE INDEX "mitgliedschaft_hero_hero_antrag_pdf_idx" ON "mitgliedschaft" USING btree ("hero_antrag_pdf_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "mitgliedschaft_vorteile_liste" CASCADE;
  DROP TABLE "mitgliedschaft_vorteile_stats" CASCADE;
  DROP TABLE "mitgliedschaft_dokumente_karten" CASCADE;
  DROP TABLE "mitgliedschaft_prozess_schritte" CASCADE;
  DROP TABLE "mitgliedschaft" CASCADE;
  DROP TYPE "public"."enum_mitgliedschaft_dokumente_karten_icon";`)
}
