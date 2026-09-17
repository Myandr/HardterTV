import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Impressum – Hardter TV",
};

export default function ImpressumPage() {
  return (
    <main className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-black/40 transition-colors hover:text-black"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          Zurück zur Startseite
        </Link>

        <h1 className="font-kanturmuy text-4xl font-normal tracking-tighter text-black sm:text-5xl">
          Impressum
        </h1>

        <div className="mt-12 flex flex-col gap-10 text-sm leading-relaxed text-black/70">

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Angaben gemäß § 5 DDG
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p className="font-medium text-black">Sitz und Postanschrift des Vereins</p>
              <p className="mt-2">
                Hardter TV e. V.<br />
                Gahlener Str. 204<br />
                46282 Dorsten
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Vertreten durch
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p>
                <span className="font-medium">1. Vorsitzender:</span> Oliver Wiegand<br />
                <span className="font-medium">1. Geschäftsführer:</span> Hendrick Büncker<br />
                <span className="font-medium">Schatzmeister:</span> Marco Hohenstein
              </p>
              <p className="mt-3">
                Telefon:{" "}
                <a
                  href="tel:+4917225800209"
                  className="text-black underline-offset-2 hover:underline"
                >
                  0172 25 80 209
                </a>
              </p>
              <p className="mt-1">
                E-Mail:{" "}
                <a
                  href="mailto:1.vorsitzender@hardt-tennis.de"
                  className="text-black underline-offset-2 hover:underline"
                >
                  1.vorsitzender@hardt-tennis.de
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Registereintrag
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p>
                Eintragung im Vereinsregister<br />
                Registergericht: Gelsenkirchen<br />
                Registernummer: VR 13415
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p>
                Oliver Wiegand<br />
                Teichstr. 14 a<br />
                46282 Dorsten
              </p>
              <p className="mt-3">
                E-Mail:{" "}
                <a
                  href="mailto:1.vorsitzender@hardt-tennis.de"
                  className="text-black underline-offset-2 hover:underline"
                >
                  1.vorsitzender@hardt-tennis.de
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Online-Streitbeilegung
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline-offset-2 hover:underline"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
              </p>
              <p className="mt-3">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Disclaimer – Rechtliche Hinweise
            </h2>
            <div className="flex flex-col gap-4 rounded-2xl border border-black/[0.06] bg-white p-6">
              <div>
                <p className="font-medium text-black">§ 1 Haftungsbeschränkung</p>
                <p className="mt-2">
                  Die Inhalte dieser Website werden mit größtmöglicher Sorgfalt erstellt. Der Anbieter übernimmt
                  jedoch keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten
                  Inhalte. Die Nutzung der Inhalte der Website erfolgt auf eigene Gefahr des Nutzers.
                  Namentlich gekennzeichnete Beiträge geben die Meinung des jeweiligen Autors und nicht immer
                  die Meinung des Anbieters wieder. Mit der reinen Nutzung der Website des Anbieters kommt
                  keinerlei Vertragsverhältnis zwischen dem Nutzer und dem Anbieter zustande.
                </p>
              </div>
              <div className="h-px bg-black/[0.06]" />
              <div>
                <p className="font-medium text-black">§ 2 Externe Links</p>
                <p className="mt-2">
                  Diese Website enthält Verknüpfungen zu Websites Dritter („externe Links"). Diese Websites
                  unterliegen der Haftung der jeweiligen Betreiber. Der Anbieter hat bei der erstmaligen
                  Verknüpfung der externen Links die fremden Inhalte daraufhin überprüft, ob etwaige
                  Rechtsverstöße bestehen. Zu dem Zeitpunkt waren keine Rechtsverstöße ersichtlich. Der Anbieter
                  hat keinerlei Einfluss auf die aktuelle und zukünftige Gestaltung und auf die Inhalte der
                  verknüpften Seiten. Das Setzen von externen Links bedeutet nicht, dass sich der Anbieter die
                  hinter dem Verweis oder Link liegenden Inhalte zu Eigen macht. Eine ständige Kontrolle der
                  externen Links ist für den Anbieter ohne konkrete Hinweise auf Rechtsverstöße nicht zumutbar.
                  Bei Kenntnis von Rechtsverstößen werden jedoch derartige externe Links unverzüglich gelöscht.
                </p>
              </div>
              <div className="h-px bg-black/[0.06]" />
              <div>
                <p className="font-medium text-black">§ 3 Urheber- und Leistungsschutzrechte</p>
                <p className="mt-2">
                  Die auf dieser Website veröffentlichten Inhalte unterliegen dem deutschen Urheber- und
                  Leistungsschutzrecht. Jede vom deutschen Urheber- und Leistungsschutzrecht nicht zugelassene
                  Verwertung bedarf der vorherigen schriftlichen Zustimmung des Anbieters oder jeweiligen
                  Rechteinhabers. Dies gilt insbesondere für Vervielfältigung, Bearbeitung, Übersetzung,
                  Einspeicherung, Verarbeitung bzw. Wiedergabe von Inhalten in Datenbanken oder anderen
                  elektronischen Medien und Systemen. Die unerlaubte Vervielfältigung oder Weitergabe einzelner
                  Inhalte oder kompletter Seiten ist nicht gestattet und strafbar. Lediglich die Herstellung von
                  Kopien und Downloads für den persönlichen, privaten und nicht kommerziellen Gebrauch ist
                  erlaubt. Die Darstellung dieser Website in fremden Frames ist nur mit schriftlicher Erlaubnis
                  zulässig.
                </p>
              </div>
              <div className="h-px bg-black/[0.06]" />
              <div>
                <p className="font-medium text-black">§ 4 Besondere Nutzungsbedingungen</p>
                <p className="mt-2">
                  Soweit besondere Bedingungen für einzelne Nutzungen dieser Website von den vorgenannten
                  Paragraphen abweichen, wird an entsprechender Stelle ausdrücklich darauf hingewiesen. In
                  diesem Falle gelten im jeweiligen Einzelfall die besonderen Nutzungsbedingungen.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
