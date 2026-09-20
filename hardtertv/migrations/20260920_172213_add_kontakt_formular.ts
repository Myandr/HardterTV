import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "kontakt_section" ADD COLUMN "formular_adresse_label" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "formular_adresse_label" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "formular_email_label" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "formular_email_label" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "formular_name_label" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "formular_name_label" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "formular_name_placeholder" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "formular_name_placeholder" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "formular_email_feld_label" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "formular_email_feld_label" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "formular_email_placeholder" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "formular_email_placeholder" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "formular_nachricht_label" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "formular_nachricht_label" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "formular_nachricht_placeholder" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "formular_nachricht_placeholder" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "formular_einwilligung_text_vor" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "formular_einwilligung_text_vor" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "formular_einwilligung_link_text" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "formular_einwilligung_link_text" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "formular_einwilligung_text_nach" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "formular_einwilligung_text_nach" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "formular_absenden_label" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "formular_absenden_label" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "formular_senden_label" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "formular_senden_label" DROP DEFAULT;
  ALTER TABLE "kontakt_section" ADD COLUMN "formular_honeypot_label" varchar NOT NULL DEFAULT '';
  ALTER TABLE "kontakt_section" ALTER COLUMN "formular_honeypot_label" DROP DEFAULT;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "kontakt_section" DROP COLUMN "formular_adresse_label";
  ALTER TABLE "kontakt_section" DROP COLUMN "formular_email_label";
  ALTER TABLE "kontakt_section" DROP COLUMN "formular_name_label";
  ALTER TABLE "kontakt_section" DROP COLUMN "formular_name_placeholder";
  ALTER TABLE "kontakt_section" DROP COLUMN "formular_email_feld_label";
  ALTER TABLE "kontakt_section" DROP COLUMN "formular_email_placeholder";
  ALTER TABLE "kontakt_section" DROP COLUMN "formular_nachricht_label";
  ALTER TABLE "kontakt_section" DROP COLUMN "formular_nachricht_placeholder";
  ALTER TABLE "kontakt_section" DROP COLUMN "formular_einwilligung_text_vor";
  ALTER TABLE "kontakt_section" DROP COLUMN "formular_einwilligung_link_text";
  ALTER TABLE "kontakt_section" DROP COLUMN "formular_einwilligung_text_nach";
  ALTER TABLE "kontakt_section" DROP COLUMN "formular_absenden_label";
  ALTER TABLE "kontakt_section" DROP COLUMN "formular_senden_label";
  ALTER TABLE "kontakt_section" DROP COLUMN "formular_honeypot_label";`)
}
