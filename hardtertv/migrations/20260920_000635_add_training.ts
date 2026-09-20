import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_training_angebote_karten_icon" AS ENUM('userCheck', 'users', 'trophy', 'dumbbell', 'star', 'calendar');
  CREATE TABLE "training_trainer_fakten" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"wert" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "training_angebote_karten" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_training_angebote_karten_icon" DEFAULT 'star' NOT NULL,
  	"titel" varchar NOT NULL,
  	"beschreibung" varchar NOT NULL
  );
  
  CREATE TABLE "training_halle_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"wert" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "training" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar NOT NULL,
  	"hero_titel_vorne" varchar NOT NULL,
  	"hero_titel_highlight" varchar NOT NULL,
  	"hero_text" varchar NOT NULL,
  	"hero_button_label" varchar NOT NULL,
  	"hero_telefon_href" varchar NOT NULL,
  	"trainer_eyebrow" varchar NOT NULL,
  	"trainer_foto_id" integer,
  	"trainer_badge" varchar NOT NULL,
  	"trainer_name" varchar NOT NULL,
  	"trainer_rolle" varchar NOT NULL,
  	"trainer_bio" varchar NOT NULL,
  	"trainer_telefon_label" varchar NOT NULL,
  	"trainer_telefon_href" varchar NOT NULL,
  	"angebote_eyebrow" varchar NOT NULL,
  	"angebote_titel_vorne" varchar NOT NULL,
  	"angebote_titel_highlight" varchar NOT NULL,
  	"angebote_text" varchar NOT NULL,
  	"halle_eyebrow" varchar NOT NULL,
  	"halle_titel_vorne" varchar NOT NULL,
  	"halle_titel_highlight" varchar NOT NULL,
  	"halle_text" varchar NOT NULL,
  	"halle_website_label" varchar NOT NULL,
  	"halle_website_url" varchar NOT NULL,
  	"halle_anruf_label" varchar NOT NULL,
  	"halle_telefon_href" varchar NOT NULL,
  	"halle_standort_titel" varchar NOT NULL,
  	"halle_adresse" varchar NOT NULL,
  	"halle_kontakt_titel" varchar NOT NULL,
  	"halle_kontakt_text" varchar NOT NULL,
  	"halle_kontakt_telefon_label" varchar,
  	"halle_kontakt_telefon_href" varchar,
  	"halle_kontakt_email" varchar,
  	"cta_titel" varchar NOT NULL,
  	"cta_text" varchar NOT NULL,
  	"cta_button_label" varchar NOT NULL,
  	"cta_telefon_href" varchar NOT NULL,
  	"cta_zurueck_label" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "training_trainer_fakten" ADD CONSTRAINT "training_trainer_fakten_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."training"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "training_angebote_karten" ADD CONSTRAINT "training_angebote_karten_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."training"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "training_halle_stats" ADD CONSTRAINT "training_halle_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."training"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "training" ADD CONSTRAINT "training_trainer_foto_id_media_id_fk" FOREIGN KEY ("trainer_foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "training_trainer_fakten_order_idx" ON "training_trainer_fakten" USING btree ("_order");
  CREATE INDEX "training_trainer_fakten_parent_id_idx" ON "training_trainer_fakten" USING btree ("_parent_id");
  CREATE INDEX "training_angebote_karten_order_idx" ON "training_angebote_karten" USING btree ("_order");
  CREATE INDEX "training_angebote_karten_parent_id_idx" ON "training_angebote_karten" USING btree ("_parent_id");
  CREATE INDEX "training_halle_stats_order_idx" ON "training_halle_stats" USING btree ("_order");
  CREATE INDEX "training_halle_stats_parent_id_idx" ON "training_halle_stats" USING btree ("_parent_id");
  CREATE INDEX "training_trainer_trainer_foto_idx" ON "training" USING btree ("trainer_foto_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "training_trainer_fakten" CASCADE;
  DROP TABLE "training_angebote_karten" CASCADE;
  DROP TABLE "training_halle_stats" CASCADE;
  DROP TABLE "training" CASCADE;
  DROP TYPE "public"."enum_training_angebote_karten_icon";`)
}
