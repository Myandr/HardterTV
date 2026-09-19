import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_board_members_gruppe" AS ENUM('fuehrung', 'finanzen', 'sport', 'events', 'technik');
  CREATE TABLE "board_members_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "board_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"titel" varchar NOT NULL,
  	"gruppe" "enum_board_members_gruppe" NOT NULL,
  	"reihenfolge" numeric DEFAULT 1000 NOT NULL,
  	"telefon" varchar,
  	"foto_id" integer,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "board_members_id" integer;
  ALTER TABLE "board_members_emails" ADD CONSTRAINT "board_members_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."board_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "board_members" ADD CONSTRAINT "board_members_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "board_members_emails_order_idx" ON "board_members_emails" USING btree ("_order");
  CREATE INDEX "board_members_emails_parent_id_idx" ON "board_members_emails" USING btree ("_parent_id");
  CREATE INDEX "board_members_foto_idx" ON "board_members" USING btree ("foto_id");
  CREATE INDEX "board_members_updated_at_idx" ON "board_members" USING btree ("updated_at");
  CREATE INDEX "board_members_created_at_idx" ON "board_members" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_board_members_fk" FOREIGN KEY ("board_members_id") REFERENCES "public"."board_members"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_board_members_id_idx" ON "payload_locked_documents_rels" USING btree ("board_members_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "board_members_emails" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "board_members" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "board_members_emails" CASCADE;
  DROP TABLE "board_members" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_board_members_fk";
  
  DROP INDEX "payload_locked_documents_rels_board_members_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "board_members_id";
  DROP TYPE "public"."enum_board_members_gruppe";`)
}
