export type MediaBild = { url: string; alt: string };

/**
 * Turns a Payload upload relation (populated with depth >= 1) into plain,
 * serializable props. Returns null when the relation is empty or not populated.
 */
export function toBild(value: unknown): MediaBild | null {
  if (!value || typeof value !== "object") return null;
  const media = value as { url?: string | null; alt?: string | null };
  if (typeof media.url !== "string" || media.url.length === 0) return null;
  return { url: media.url, alt: media.alt ?? "" };
}
