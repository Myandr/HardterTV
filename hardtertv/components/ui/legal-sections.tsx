import type { LegalPage } from "@/payload-types";
import RichTextBody from "@/components/ui/rich-text";

export default function LegalSections({
  abschnitte,
}: {
  abschnitte: NonNullable<LegalPage["abschnitte"]>;
}) {
  return (
    <div className="mt-12 flex flex-col gap-10 text-sm leading-relaxed text-black/70">
      {abschnitte.map((abschnitt) => (
        <section key={abschnitt.id ?? abschnitt.titel}>
          <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
            {abschnitt.titel}
          </h2>
          <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
            <RichTextBody data={abschnitt.inhalt} />
          </div>
        </section>
      ))}
    </div>
  );
}
