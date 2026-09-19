import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_legal_pages_slug" AS ENUM('impressum', 'datenschutz', 'cookies');
  CREATE TABLE "legal_pages_abschnitte" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titel" varchar NOT NULL,
  	"inhalt" jsonb NOT NULL
  );
  
  CREATE TABLE "legal_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" "enum_legal_pages_slug" NOT NULL,
  	"titel" varchar NOT NULL,
  	"intro" jsonb,
  	"stand" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "legal_pages_id" integer;
  ALTER TABLE "legal_pages_abschnitte" ADD CONSTRAINT "legal_pages_abschnitte_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "legal_pages_abschnitte_order_idx" ON "legal_pages_abschnitte" USING btree ("_order");
  CREATE INDEX "legal_pages_abschnitte_parent_id_idx" ON "legal_pages_abschnitte" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "legal_pages_slug_idx" ON "legal_pages" USING btree ("slug");
  CREATE INDEX "legal_pages_updated_at_idx" ON "legal_pages" USING btree ("updated_at");
  CREATE INDEX "legal_pages_created_at_idx" ON "legal_pages" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_legal_pages_fk" FOREIGN KEY ("legal_pages_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_legal_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("legal_pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "legal_pages_abschnitte" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "legal_pages" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "legal_pages_abschnitte" CASCADE;
  DROP TABLE "legal_pages" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_legal_pages_fk";
  
  DROP INDEX "payload_locked_documents_rels_legal_pages_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "legal_pages_id";
  DROP TYPE "public"."enum_legal_pages_slug";`)
}
