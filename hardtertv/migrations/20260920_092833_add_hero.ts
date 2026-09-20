import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "hero_partner_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"logo_id" integer NOT NULL,
  	"alt" varchar
  );
  
  CREATE TABLE "hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar NOT NULL,
  	"subtext" varchar NOT NULL,
  	"cta_label" varchar NOT NULL,
  	"bild_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "hero_partner_logos" ADD CONSTRAINT "hero_partner_logos_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hero_partner_logos" ADD CONSTRAINT "hero_partner_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hero" ADD CONSTRAINT "hero_bild_id_media_id_fk" FOREIGN KEY ("bild_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "hero_partner_logos_order_idx" ON "hero_partner_logos" USING btree ("_order");
  CREATE INDEX "hero_partner_logos_parent_id_idx" ON "hero_partner_logos" USING btree ("_parent_id");
  CREATE INDEX "hero_partner_logos_logo_idx" ON "hero_partner_logos" USING btree ("logo_id");
  CREATE INDEX "hero_bild_idx" ON "hero" USING btree ("bild_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "hero_partner_logos" CASCADE;
  DROP TABLE "hero" CASCADE;`)
}
