import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "eisstock_galerie_bilder" ALTER COLUMN "bild_id" DROP NOT NULL;
  ALTER TABLE "hero_partner_logos" ALTER COLUMN "logo_id" DROP NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "eisstock_galerie_bilder" ALTER COLUMN "bild_id" SET NOT NULL;
  ALTER TABLE "hero_partner_logos" ALTER COLUMN "logo_id" SET NOT NULL;`)
}
