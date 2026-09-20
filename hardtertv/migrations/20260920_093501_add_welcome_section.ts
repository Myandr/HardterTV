import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_welcome_section_stats_icon" AS ENUM('trophy', 'users', 'mapPin', 'zap');
  CREATE TABLE "welcome_section_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_welcome_section_stats_icon" DEFAULT 'trophy' NOT NULL,
  	"wert" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "welcome_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"headline" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"bild_id" integer,
  	"bild_badge" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"signatur_name" varchar NOT NULL,
  	"signatur_rolle" varchar NOT NULL,
  	"cta_label" varchar NOT NULL,
  	"sekundaer_label" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "welcome_section_stats" ADD CONSTRAINT "welcome_section_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."welcome_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "welcome_section" ADD CONSTRAINT "welcome_section_bild_id_media_id_fk" FOREIGN KEY ("bild_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "welcome_section_stats_order_idx" ON "welcome_section_stats" USING btree ("_order");
  CREATE INDEX "welcome_section_stats_parent_id_idx" ON "welcome_section_stats" USING btree ("_parent_id");
  CREATE INDEX "welcome_section_bild_idx" ON "welcome_section" USING btree ("bild_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "welcome_section_stats" CASCADE;
  DROP TABLE "welcome_section" CASCADE;
  DROP TYPE "public"."enum_welcome_section_stats_icon";`)
}
