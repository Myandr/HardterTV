import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_seiten_texte_vorstand_gruppen_gruppe" AS ENUM('fuehrung', 'finanzen', 'sport', 'events', 'technik');
  CREATE TYPE "public"."enum_seiten_texte_mannschaften_kategorien_kategorie" AS ENUM('Herren', 'Damen', 'Gemischt');
  CREATE TABLE "seiten_texte_vorstand_gruppen" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"gruppe" "enum_seiten_texte_vorstand_gruppen_gruppe" NOT NULL,
  	"titel" varchar NOT NULL,
  	"beschreibung" varchar NOT NULL
  );
  
  CREATE TABLE "seiten_texte_mannschaften_kategorien" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kategorie" "enum_seiten_texte_mannschaften_kategorien_kategorie" NOT NULL,
  	"reiter_label" varchar NOT NULL,
  	"listen_eyebrow" varchar NOT NULL,
  	"badge_suffix" varchar NOT NULL
  );
  
  CREATE TABLE "seiten_texte" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"vorstand_eyebrow" varchar NOT NULL,
  	"vorstand_titel_vorne" varchar NOT NULL,
  	"vorstand_titel_highlight" varchar NOT NULL,
  	"vorstand_text" varchar NOT NULL,
  	"vorstand_badge_suffix" varchar NOT NULL,
  	"vorstand_cta_titel" varchar NOT NULL,
  	"vorstand_cta_text" varchar NOT NULL,
  	"vorstand_cta_button_label" varchar NOT NULL,
  	"vorstand_cta_email" varchar NOT NULL,
  	"kalender_eyebrow" varchar NOT NULL,
  	"kalender_titel_vorne" varchar NOT NULL,
  	"kalender_titel_highlight" varchar NOT NULL,
  	"kalender_text" varchar NOT NULL,
  	"kalender_monatsansicht_label" varchar NOT NULL,
  	"kalender_listenansicht_label" varchar NOT NULL,
  	"kalender_filter_alle_label" varchar NOT NULL,
  	"kalender_ausgewaehlter_tag_label" varchar NOT NULL,
  	"kalender_naechste_termine_label" varchar NOT NULL,
  	"kalender_keine_termine_tag" varchar NOT NULL,
  	"kalender_keine_termine_liste" varchar NOT NULL,
  	"kalender_uhrzeit_suffix" varchar NOT NULL,
  	"galerie_eyebrow" varchar NOT NULL,
  	"galerie_titel_vorne" varchar NOT NULL,
  	"galerie_titel_highlight" varchar NOT NULL,
  	"galerie_text" varchar NOT NULL,
  	"galerie_bilder_suffix" varchar NOT NULL,
  	"galerie_leer_text" varchar NOT NULL,
  	"mannschaften_eyebrow" varchar NOT NULL,
  	"mannschaften_titel_vorne" varchar NOT NULL,
  	"mannschaften_titel_highlight" varchar NOT NULL,
  	"mannschaften_text" varchar NOT NULL,
  	"mannschaften_teams_suffix" varchar NOT NULL,
  	"mannschaften_karten_untertitel" varchar NOT NULL,
  	"mannschaften_kontakt_eyebrow" varchar NOT NULL,
  	"mannschaften_kontakt_titel_vorne" varchar NOT NULL,
  	"mannschaften_kontakt_titel_highlight" varchar NOT NULL,
  	"mannschaften_kontakt_text" varchar NOT NULL,
  	"mannschaften_kontakt_label" varchar NOT NULL,
  	"mannschaften_kontakt_telefon" varchar NOT NULL,
  	"mannschaften_kontakt_telefon_href" varchar NOT NULL,
  	"mannschaften_kontakt_email" varchar NOT NULL,
  	"mannschaft_detail_zurueck_label" varchar NOT NULL,
  	"mannschaft_detail_saison_label" varchar NOT NULL,
  	"mannschaft_detail_verein_badge" varchar NOT NULL,
  	"mannschaft_detail_verband_badge" varchar NOT NULL,
  	"mannschaft_detail_liga_eyebrow" varchar NOT NULL,
  	"mannschaft_detail_liga_titel" varchar NOT NULL,
  	"mannschaft_detail_liga_saison_label" varchar NOT NULL,
  	"mannschaft_detail_liga_quelle" varchar NOT NULL,
  	"mannschaft_detail_abschluss_text" varchar NOT NULL,
  	"rechtliches_zurueck_label" varchar NOT NULL,
  	"rechtliches_cookies_eyebrow" varchar NOT NULL,
  	"rechtliches_cookies_titel_vorne" varchar NOT NULL,
  	"rechtliches_cookies_titel_highlight" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "seiten_texte_vorstand_gruppen" ADD CONSTRAINT "seiten_texte_vorstand_gruppen_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."seiten_texte"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seiten_texte_mannschaften_kategorien" ADD CONSTRAINT "seiten_texte_mannschaften_kategorien_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."seiten_texte"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "seiten_texte_vorstand_gruppen_order_idx" ON "seiten_texte_vorstand_gruppen" USING btree ("_order");
  CREATE INDEX "seiten_texte_vorstand_gruppen_parent_id_idx" ON "seiten_texte_vorstand_gruppen" USING btree ("_parent_id");
  CREATE INDEX "seiten_texte_mannschaften_kategorien_order_idx" ON "seiten_texte_mannschaften_kategorien" USING btree ("_order");
  CREATE INDEX "seiten_texte_mannschaften_kategorien_parent_id_idx" ON "seiten_texte_mannschaften_kategorien" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "seiten_texte_vorstand_gruppen" CASCADE;
  DROP TABLE "seiten_texte_mannschaften_kategorien" CASCADE;
  DROP TABLE "seiten_texte" CASCADE;
  DROP TYPE "public"."enum_seiten_texte_vorstand_gruppen_gruppe";
  DROP TYPE "public"."enum_seiten_texte_mannschaften_kategorien_kategorie";`)
}
