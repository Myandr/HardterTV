import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_footer_schnelle_links_ziel" AS ENUM('/', '/#about', '/#termine', '/#news', '/#contact', '/vorstand', '/training', '/mannschaften', '/galerie', '/mitgliedschaft', '/kalender', '/eisstock', '/datenschutz', '/impressum', '/cookies');
  CREATE TYPE "public"."enum_footer_rechtliche_links_ziel" AS ENUM('/', '/#about', '/#termine', '/#news', '/#contact', '/vorstand', '/training', '/mannschaften', '/galerie', '/mitgliedschaft', '/kalender', '/eisstock', '/datenschutz', '/impressum', '/cookies');
  CREATE TABLE "footer_schnelle_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"ziel" "enum_footer_schnelle_links_ziel" NOT NULL
  );
  
  CREATE TABLE "footer_rechtliche_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"ziel" "enum_footer_rechtliche_links_ziel" NOT NULL
  );
  
  ALTER TABLE "footer" ADD COLUMN "schnelle_links_titel" varchar NOT NULL DEFAULT '';
  ALTER TABLE "footer" ALTER COLUMN "schnelle_links_titel" DROP DEFAULT;
  ALTER TABLE "footer" ADD COLUMN "kontakt_titel" varchar NOT NULL DEFAULT '';
  ALTER TABLE "footer" ALTER COLUMN "kontakt_titel" DROP DEFAULT;
  ALTER TABLE "footer" ADD COLUMN "email_label" varchar NOT NULL DEFAULT '';
  ALTER TABLE "footer" ALTER COLUMN "email_label" DROP DEFAULT;
  ALTER TABLE "footer" ADD COLUMN "copyright_zusatz" varchar NOT NULL DEFAULT '';
  ALTER TABLE "footer" ALTER COLUMN "copyright_zusatz" DROP DEFAULT;
  ALTER TABLE "footer_schnelle_links" ADD CONSTRAINT "footer_schnelle_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rechtliche_links" ADD CONSTRAINT "footer_rechtliche_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "footer_schnelle_links_order_idx" ON "footer_schnelle_links" USING btree ("_order");
  CREATE INDEX "footer_schnelle_links_parent_id_idx" ON "footer_schnelle_links" USING btree ("_parent_id");
  CREATE INDEX "footer_rechtliche_links_order_idx" ON "footer_rechtliche_links" USING btree ("_order");
  CREATE INDEX "footer_rechtliche_links_parent_id_idx" ON "footer_rechtliche_links" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "footer_schnelle_links" CASCADE;
  DROP TABLE "footer_rechtliche_links" CASCADE;
  ALTER TABLE "footer" DROP COLUMN "schnelle_links_titel";
  ALTER TABLE "footer" DROP COLUMN "kontakt_titel";
  ALTER TABLE "footer" DROP COLUMN "email_label";
  ALTER TABLE "footer" DROP COLUMN "copyright_zusatz";
  DROP TYPE "public"."enum_footer_schnelle_links_ziel";
  DROP TYPE "public"."enum_footer_rechtliche_links_ziel";`)
}
