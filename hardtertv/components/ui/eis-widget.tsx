"use client";

import { EmbedConsentGate } from "@/components/ui/embed-consent-gate";

export function EisWidget({ url }: { url: string }) {
  if (!url) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border-2 border-dashed border-[#e1fcad] bg-[#f9f9f7] p-10 text-center">
        <div>
          <p className="text-sm font-medium text-black/60">Online-Buchung coming soon</p>
          <p className="mt-1 text-xs text-black/35">
            SimplyBook.me-URL im Payload-Admin unter{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 text-[11px]">Eisstock → Buchung</code>{" "}
            eintragen
          </p>
        </div>
      </div>
    );
  }

  return (
    <EmbedConsentGate
      src={url}
      title="Eisstockschießen online buchen"
      className="min-h-[700px] w-full border-none"
      iframeProps={{
        width: "100%",
        height: 700,
        sandbox: "allow-scripts allow-forms allow-same-origin allow-popups",
        allowFullScreen: true,
      }}
      platzhalterTitel="Online-Buchung nicht geladen"
      platzhalterText="Für die Buchung binden wir den Dienst SimplyBook.me ein. Beim Laden werden Daten (u. a. Ihre IP-Adresse) an SimplyBook.me übertragen und Cookies gesetzt. Mehr dazu in unserer"
      buttonLabel="Buchung laden"
      directLinkLabel="Buchungsseite direkt öffnen"
    />
  );
}
