import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "footer_kontaktpersonen" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"vereinsname" varchar NOT NULL,
  	"beschreibung" varchar NOT NULL,
  	"strasse" varchar NOT NULL,
  	"plz" varchar NOT NULL,
  	"ort" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"telefon_label" varchar NOT NULL,
  	"telefon" varchar NOT NULL,
  	"telefon_href" varchar NOT NULL,
  	"fun_fact_titel" varchar NOT NULL,
  	"fun_fact" varchar NOT NULL,
  	"shop_text_vor" varchar NOT NULL,
  	"shop_link_text" varchar NOT NULL,
  	"shop_url" varchar NOT NULL,
  	"shop_text_nach" varchar NOT NULL,
  	"instagram_handle" varchar NOT NULL,
  	"instagram_url" varchar NOT NULL,
  	"instagram_cta_eyebrow" varchar NOT NULL,
  	"instagram_cta_headline" varchar NOT NULL,
  	"instagram_cta_text" varchar NOT NULL,
  	"copyright_name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "footer_kontaktpersonen" ADD CONSTRAINT "footer_kontaktpersonen_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "footer_kontaktpersonen_order_idx" ON "footer_kontaktpersonen" USING btree ("_order");
  CREATE INDEX "footer_kontaktpersonen_parent_id_idx" ON "footer_kontaktpersonen" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "footer_kontaktpersonen" CASCADE;
  DROP TABLE "footer" CASCADE;`)
}
