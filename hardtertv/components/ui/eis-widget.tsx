"use client";

const SIMPLYBOOK_URL = "https://hartdertv.simplybook.it/v2/#book";

const IS_PLACEHOLDER = SIMPLYBOOK_URL.includes("DEIN-VEREIN");

export function EisWidget() {
  if (IS_PLACEHOLDER) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border-2 border-dashed border-[#e1fcad] bg-[#f9f9f7] p-10 text-center">
        <div>
          <p className="text-sm font-medium text-black/60">Online-Buchung coming soon</p>
          <p className="mt-1 text-xs text-black/35">
            SimplyBook.me-URL in{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 text-[11px]">
              components/ui/eis-widget.tsx
            </code>{" "}
            eintragen
          </p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={SIMPLYBOOK_URL}
      width="100%"
      height="700"
      className="min-h-[700px] border-none"
      title="Eisstockschießen online buchen"
      sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
      allowFullScreen
    />
  );
}
