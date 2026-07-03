import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Datenschutz – Hardter TV",
};

export default function DatenschutzPage() {
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
          Datenschutzerklärung
        </h1>

        <div className="mt-12 flex flex-col gap-10 text-sm leading-relaxed text-black/70">

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Verantwortlicher
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p>
                Hardter TV e. V.<br />
                Gahlener Str. 204<br />
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
              Hosting
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p>
                Diese Website wird gehostet von Vercel Inc., 340 Pine Street, Suite 701,
                San Francisco, CA 94104, USA. Beim Aufruf der Website werden IP-Adressen
                und Zugriffsdaten auf Servern von Vercel verarbeitet. Mit Vercel wurde ein
                Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO abgeschlossen. Datentransfers
                in die USA erfolgen auf Basis von Standardvertragsklauseln (SCCs) gemäß
                Art. 46 Abs. 2 lit. c DSGVO.
              </p>
              <p className="mt-3 text-xs text-black/40">
                Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem
                zuverlässigen Websitebetrieb) · Speicherdauer: Logfiles werden nach spätestens
                30 Tagen automatisch gelöscht
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Erhebung und Verarbeitung personenbezogener Daten
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p>
                Wir erheben und verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung
                unserer Angebote erforderlich ist. Personenbezogene Daten sind alle Daten, die sich auf
                eine identifizierte oder identifizierbare natürliche Person beziehen.
              </p>
              <p className="mt-3">
                Beim Besuch unserer Website werden automatisch technische Informationen (z. B. IP-Adresse,
                Browsertyp, Betriebssystem, Uhrzeit des Zugriffs) in Server-Logfiles gespeichert. Diese
                Daten sind nicht einer bestimmten Person zuordenbar und werden nicht mit anderen
                Datenquellen zusammengeführt.
              </p>
              <p className="mt-3 text-xs text-black/40">
                Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am sicheren
                Websitebetrieb)
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Kontaktformular
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p>
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem
                Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung
                der Anfrage bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
              </p>
              <p className="mt-3 text-xs text-black/40">
                Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) bzw. Art. 6 Abs. 1 lit. f
                DSGVO (berechtigtes Interesse an der Beantwortung von Anfragen) · Speicherdauer: bis zur
                abschließenden Bearbeitung der Anfrage, längstens 3 Jahre
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Cookies
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p>
                Unsere Website verwendet technisch notwendige Cookies, die für den Betrieb der Website
                erforderlich sind (z. B. zum Speichern Ihrer Cookie-Einstellungen). Darüber hinaus werden
                Cookies von Google Maps erst nach Ihrer ausdrücklichen Einwilligung gesetzt. Technisch
                notwendige Cookies können nicht deaktiviert werden.
              </p>
              <p className="mt-3">
                Ihre Einwilligung für optionale Cookies können Sie jederzeit über die{" "}
                <Link href="/cookies" className="text-black underline-offset-2 hover:underline">
                  Cookie-Einstellungen
                </Link>{" "}
                widerrufen.
              </p>
              <p className="mt-3 text-xs text-black/40">
                Rechtsgrundlage technisch notwendige Cookies: Art. 6 Abs. 1 lit. f DSGVO ·
                Rechtsgrundlage optionale Cookies: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Google Maps
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p>
                Auf unserer Website wird Google Maps eingebunden (Google Ireland Limited, Gordon House,
                Barrow Street, Dublin 4, Irland). Google Maps wird erst nach Ihrer ausdrücklichen
                Einwilligung über die Cookie-Einstellungen aktiviert. Vor Aktivierung werden keine
                Daten an Google übertragen.
              </p>
              <p className="mt-3">
                Nach Aktivierung können Daten (u. a. IP-Adresse, Standortdaten, Browserinformationen)
                an Server von Google in den USA übertragen werden. Google unterliegt dem
                EU-US Data Privacy Framework; zusätzlich gelten Standardvertragsklauseln (SCCs) gemäß
                Art. 46 Abs. 2 DSGVO. Weitere Informationen:{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline-offset-2 hover:underline"
                >
                  Google Datenschutzerklärung
                </a>
                .
              </p>
              <p className="mt-3 text-xs text-black/40">
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) · Ihre Einwilligung
                können Sie jederzeit über die Cookie-Einstellungen widerrufen
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Liga-Daten (nuLiga / wtv.liga.nu)
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p>
                Diese Website verlinkt auf Ligadaten des Westfälischen Tennis-Verbands (WTV), die über
                den Dienst nuLiga (Anbieter: Ediscom GmbH, Otto-Hahn-Str. 1, 97204 Höchberg) bereitgestellt
                werden. Beim Klick auf einen nuLiga-Link verlassen Sie unsere Website; es gelten die
                Datenschutzbestimmungen von nuLiga. Es werden keine Daten automatisch an nuLiga übertragen,
                solange Sie keinen Link anklicken.
              </p>
              <p className="mt-3">
                Weitere Informationen:{" "}
                <a
                  href="https://www.nuliga.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline-offset-2 hover:underline"
                >
                  nuLiga Datenschutz
                </a>
                .
              </p>
              <p className="mt-3 text-xs text-black/40">
                Rechtsgrundlage für die Verlinkung: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
                an der Information unserer Mitglieder über aktuelle Ligadaten)
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Instagram
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p>
                Auf unserer Website ist ein Link zu unserem Instagram-Profil (@hardtertv) eingebunden.
                Der Link führt zu einer externen Website, die von Meta Platforms Ireland Limited,
                4 Grand Canal Square, Dublin 2, Irland, betrieben wird. Beim Klick auf den Link
                verlassen Sie unsere Website; es gelten die Datenschutzbestimmungen von Instagram/Meta.
                Es werden keine Daten automatisch an Instagram übertragen, solange Sie keinen Link anklicken
                — es ist kein Plug-in oder Widget eingebettet.
              </p>
              <p className="mt-3">
                Weitere Informationen:{" "}
                <a
                  href="https://privacycenter.instagram.com/policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline-offset-2 hover:underline"
                >
                  Instagram Datenschutzrichtlinie
                </a>
                .
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Externe Links (Shop)
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p>
                Diese Website enthält einen Link zum externen Tennisshop matchpoint24.de. Beim Klick
                auf diesen Link verlassen Sie unsere Website. Für die Datenverarbeitung auf der
                verlinkten Website ist der jeweilige Betreiber verantwortlich.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Ihre Rechte gemäß DSGVO
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p className="mb-4">
                Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden
                personenbezogenen Daten:
              </p>
              <ul className="flex flex-col gap-2">
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-black/30">—</span>
                  <span><span className="font-medium text-black">Auskunft</span> über die bei uns gespeicherten Daten (Art. 15 DSGVO)</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-black/30">—</span>
                  <span><span className="font-medium text-black">Berichtigung</span> unrichtiger Daten (Art. 16 DSGVO)</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-black/30">—</span>
                  <span><span className="font-medium text-black">Löschung</span> Ihrer gespeicherten Daten (Art. 17 DSGVO)</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-black/30">—</span>
                  <span><span className="font-medium text-black">Einschränkung der Verarbeitung</span> Ihrer Daten (Art. 18 DSGVO)</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-black/30">—</span>
                  <span><span className="font-medium text-black">Datenübertragbarkeit</span> (Art. 20 DSGVO)</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-black/30">—</span>
                  <span><span className="font-medium text-black">Widerspruch</span> gegen die Verarbeitung Ihrer Daten (Art. 21 DSGVO)</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-black/30">—</span>
                  <span><span className="font-medium text-black">Widerruf einer Einwilligung</span> jederzeit mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</span>
                </li>
              </ul>
              <p className="mt-4">
                Zur Geltendmachung Ihrer Rechte wenden Sie sich bitte an die im Impressum angegebene
                E-Mail-Adresse.
              </p>
              <div className="mt-4 border-t border-black/[0.06] pt-4">
                <p className="font-medium text-black">Beschwerderecht bei der Aufsichtsbehörde</p>
                <p className="mt-2">
                  Sie haben das Recht, sich bei der zuständigen Datenschutz-Aufsichtsbehörde zu
                  beschweren (Art. 77 DSGVO):
                </p>
                <p className="mt-2">
                  Landesbeauftragte für Datenschutz und Informationsfreiheit NRW (LDI NRW)<br />
                  Postfach 20 04 44<br />
                  40102 Düsseldorf<br />
                  Telefon: 0211 / 38424-0<br />
                  E-Mail:{" "}
                  <a
                    href="mailto:poststelle@ldi.nrw.de"
                    className="text-black underline-offset-2 hover:underline"
                  >
                    poststelle@ldi.nrw.de
                  </a>
                </p>
              </div>
            </div>
          </section>

        </div>

        <p className="mt-10 text-xs text-black/30">
          Stand: Juni 2026
        </p>
      </div>
    </main>
  );
}
