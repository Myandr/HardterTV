import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cookie_texte_kategorien_schluessel" AS ENUM('notwendig', 'maps', 'analyse');
  CREATE TABLE "cookie_texte_kategorien" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"schluessel" "enum_cookie_texte_kategorien_schluessel" NOT NULL,
  	"titel" varchar NOT NULL,
  	"banner_beschreibung" varchar NOT NULL,
  	"seite_beschreibung" varchar NOT NULL,
  	"seite_fussnote" varchar NOT NULL,
  	"toggle_aria_label" varchar
  );
  
  CREATE TABLE "cookie_texte" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"banner_titel" varchar NOT NULL,
  	"banner_text_vor" varchar NOT NULL,
  	"banner_link_text" varchar NOT NULL,
  	"banner_text_nach" varchar NOT NULL,
  	"banner_alle_akzeptieren_label" varchar NOT NULL,
  	"banner_auswahl_speichern_label" varchar NOT NULL,
  	"banner_einstellungen_label" varchar NOT NULL,
  	"banner_nur_notwendige_label" varchar NOT NULL,
  	"seite_speichern_label" varchar NOT NULL,
  	"seite_gespeichert_label" varchar NOT NULL,
  	"seite_alle_akzeptieren_label" varchar NOT NULL,
  	"seite_nur_notwendige_label" varchar NOT NULL,
  	"maps_titel" varchar NOT NULL,
  	"maps_text" varchar NOT NULL,
  	"maps_button_label" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "cookie_texte_kategorien" ADD CONSTRAINT "cookie_texte_kategorien_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cookie_texte"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "cookie_texte_kategorien_order_idx" ON "cookie_texte_kategorien" USING btree ("_order");
  CREATE INDEX "cookie_texte_kategorien_parent_id_idx" ON "cookie_texte_kategorien" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "cookie_texte_kategorien" CASCADE;
  DROP TABLE "cookie_texte" CASCADE;
  DROP TYPE "public"."enum_cookie_texte_kategorien_schluessel";`)
}
