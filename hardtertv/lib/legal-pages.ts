export const LEGAL_SLUGS = ["impressum", "datenschutz", "cookies"] as const;

export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export const LEGAL_SLUG_OPTIONS = LEGAL_SLUGS.map((slug) => ({ label: slug, value: slug }));
