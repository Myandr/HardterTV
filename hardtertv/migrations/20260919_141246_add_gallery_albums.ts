import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "gallery_albums" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titel" varchar NOT NULL,
  	"jahr" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gallery_albums_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "gallery_albums_id" integer;
  ALTER TABLE "gallery_albums_rels" ADD CONSTRAINT "gallery_albums_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."gallery_albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gallery_albums_rels" ADD CONSTRAINT "gallery_albums_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "gallery_albums_updated_at_idx" ON "gallery_albums" USING btree ("updated_at");
  CREATE INDEX "gallery_albums_created_at_idx" ON "gallery_albums" USING btree ("created_at");
  CREATE INDEX "gallery_albums_rels_order_idx" ON "gallery_albums_rels" USING btree ("order");
  CREATE INDEX "gallery_albums_rels_parent_idx" ON "gallery_albums_rels" USING btree ("parent_id");
  CREATE INDEX "gallery_albums_rels_path_idx" ON "gallery_albums_rels" USING btree ("path");
  CREATE INDEX "gallery_albums_rels_media_id_idx" ON "gallery_albums_rels" USING btree ("media_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gallery_albums_fk" FOREIGN KEY ("gallery_albums_id") REFERENCES "public"."gallery_albums"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_gallery_albums_id_idx" ON "payload_locked_documents_rels" USING btree ("gallery_albums_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "gallery_albums" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gallery_albums_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "gallery_albums" CASCADE;
  DROP TABLE "gallery_albums_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_gallery_albums_fk";
  
  DROP INDEX "payload_locked_documents_rels_gallery_albums_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "gallery_albums_id";`)
}
