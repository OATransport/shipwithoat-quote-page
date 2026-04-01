/**
 * Site URL for metadata, canonicals, and absolute OG URLs.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://quotes.shipwithoat.com).
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://shipwithoat.com";
}

/**
 * Public path to the quote landing share image. Replace the file at this path only;
 * metadata imports this constant so you do not need to edit multiple files.
 *
 * Recommended asset: PNG or JPEG, 1200×630 px (1.91:1), under 8 MB, sRGB.
 */
export const QUOTE_OG_IMAGE_PATH = "/og/oat-quote-social.png" as const;
