import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_news_kategorie" AS ENUM('Vereinsnews', 'Vereinsleben', 'Turnier', 'Training');
  CREATE TABLE "news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"datum" timestamp(3) with time zone NOT NULL,
  	"titel" varchar NOT NULL,
  	"excerpt" varchar NOT NULL,
  	"content" jsonb,
  	"bild_id" integer,
  	"kategorie" "enum_news_kategorie" DEFAULT 'Vereinsnews' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "news_id" integer;
  ALTER TABLE "news" ADD CONSTRAINT "news_bild_id_media_id_fk" FOREIGN KEY ("bild_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "news_bild_idx" ON "news" USING btree ("bild_id");
  CREATE INDEX "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload_locked_documents_rels" USING btree ("news_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "news" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "news" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_news_fk";
  
  DROP INDEX "payload_locked_documents_rels_news_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "news_id";
  DROP TYPE "public"."enum_news_kategorie";`)
}
