import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

/**
 * Payload's generierter richText-Typ ist strukturell identisch mit Lexicals
 * SerializedEditorState, aber (wegen fehlender Index-Signatur auf Interfaces)
 * nicht direkt zuweisbar. Der Cast passiert deshalb genau einmal — hier.
 */
type PayloadRichText = { root: unknown; [k: string]: unknown };

/** Bildet das Aussehen der bisherigen Rechtsseiten-Karten 1:1 nach. */
const LEGAL_RICHTEXT_CLASS = [
  "text-sm leading-relaxed text-black/70",
  "[&>*:first-child]:mt-0",
  "[&_p]:mt-3",
  "[&_strong]:font-medium [&_strong]:text-black",
  "[&_a]:text-black [&_a]:underline-offset-2 [&_a:hover]:underline",
  "[&_blockquote]:mt-3 [&_blockquote]:text-xs [&_blockquote]:text-black/40",
  "[&_h2]:mt-6 [&_h2]:font-medium [&_h2]:text-black",
  "[&_h3]:mt-4 [&_h3]:border-t [&_h3]:border-black/[0.06] [&_h3]:pt-4 [&_h3]:font-medium [&_h3]:text-black",
  "[&_h3:first-child]:mt-0 [&_h3:first-child]:border-t-0 [&_h3:first-child]:pt-0",
  "[&_ul]:mt-3 [&_ul]:flex [&_ul]:list-none [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-0",
  "[&_ul>li]:relative [&_ul>li]:pl-6",
  "[&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:text-black/30 [&_ul>li]:before:content-['—']",
  "[&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol>li]:mt-1",
].join(" ");

export default function RichTextBody({
  data,
  className,
}: {
  data: PayloadRichText;
  className?: string;
}) {
  return (
    <RichText
      className={className ?? LEGAL_RICHTEXT_CLASS}
      data={data as unknown as SerializedEditorState}
    />
  );
}
