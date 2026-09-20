import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "kontakt_section" ADD COLUMN "fehlermeldungen_name_zu_kurz" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "fehlermeldungen_name_zu_kurz" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "fehlermeldungen_name_zu_lang" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "fehlermeldungen_name_zu_lang" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "fehlermeldungen_email_fehlt" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "fehlermeldungen_email_fehlt" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "fehlermeldungen_email_zu_lang" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "fehlermeldungen_email_zu_lang" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "fehlermeldungen_email_ungueltig" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "fehlermeldungen_email_ungueltig" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "fehlermeldungen_telefon_zu_lang" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "fehlermeldungen_telefon_zu_lang" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "fehlermeldungen_nachricht_zu_kurz" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "fehlermeldungen_nachricht_zu_kurz" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "fehlermeldungen_nachricht_zu_lang" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "fehlermeldungen_nachricht_zu_lang" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "fehlermeldungen_einwilligung_fehlt" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "fehlermeldungen_einwilligung_fehlt" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "fehlermeldungen_allgemein" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "fehlermeldungen_allgemein" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "fehlermeldungen_speichern_fehlgeschlagen" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "fehlermeldungen_speichern_fehlgeschlagen" DROP DEFAULT;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "kontakt_section" DROP COLUMN "fehlermeldungen_name_zu_kurz";
  ALTER TABLE "kontakt_section" DROP COLUMN "fehlermeldungen_name_zu_lang";
  ALTER TABLE "kontakt_section" DROP COLUMN "fehlermeldungen_email_fehlt";
  ALTER TABLE "kontakt_section" DROP COLUMN "fehlermeldungen_email_zu_lang";
  ALTER TABLE "kontakt_section" DROP COLUMN "fehlermeldungen_email_ungueltig";
  ALTER TABLE "kontakt_section" DROP COLUMN "fehlermeldungen_telefon_zu_lang";
  ALTER TABLE "kontakt_section" DROP COLUMN "fehlermeldungen_nachricht_zu_kurz";
  ALTER TABLE "kontakt_section" DROP COLUMN "fehlermeldungen_nachricht_zu_lang";
  ALTER TABLE "kontakt_section" DROP COLUMN "fehlermeldungen_einwilligung_fehlt";
  ALTER TABLE "kontakt_section" DROP COLUMN "fehlermeldungen_allgemein";
  ALTER TABLE "kontakt_section" DROP COLUMN "fehlermeldungen_speichern_fehlgeschlagen";`)
}
