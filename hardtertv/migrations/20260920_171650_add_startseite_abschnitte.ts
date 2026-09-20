import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "termine_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"headline_teil1" varchar NOT NULL,
  	"headline_teil2" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"cta_label" varchar NOT NULL,
  	"leer_text_vor" varchar NOT NULL,
  	"leer_link_text" varchar NOT NULL,
  	"leer_text_nach" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "vorstand_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"headline_teil1" varchar NOT NULL,
  	"headline_teil2" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"cta_label" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "news_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"headline_teil1" varchar NOT NULL,
  	"headline_teil2" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "termine_section" CASCADE;
  DROP TABLE "vorstand_section" CASCADE;
  DROP TABLE "news_section" CASCADE;`)
}
