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
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Cookies
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p>
                Unsere Website verwendet keine Cookies zu Tracking- oder Werbezwecken. Es werden
                ausschließlich technisch notwendige Cookies eingesetzt, die für den Betrieb der Website
                erforderlich sind.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Eingebettete Inhalte (Google Maps, liga.nu)
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p>
                Diese Website bindet Karten von Google Maps sowie Ligadaten von wtv.liga.nu ein.
                Durch die Nutzung dieser Dienste können Daten an die jeweiligen Anbieter übertragen werden.
                Weitere Informationen finden Sie in den Datenschutzerklärungen von{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline-offset-2 hover:underline"
                >
                  Google
                </a>{" "}
                und{" "}
                <a
                  href="https://www.nuliga.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline-offset-2 hover:underline"
                >
                  nuLiga
                </a>
                .
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
              Ihre Rechte
            </h2>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <p>
                Sie haben jederzeit das Recht auf Auskunft über die bei uns gespeicherten personenbezogenen
                Daten, deren Herkunft und Empfänger sowie den Zweck der Datenverarbeitung. Außerdem haben
                Sie das Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Hierzu sowie zu
                weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit unter der im Impressum
                angegebenen Adresse an uns wenden.
              </p>
            </div>
          </section>

        </div>

        <p className="mt-10 text-xs text-black/30">
          Stand: Mai 2026
        </p>
      </div>
    </main>
  );
}
