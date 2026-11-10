import { hashString } from "@/lib/random";

/**
 * Slide images for a carousel post. Mock data only has the cover, so the other slides are
 * stable placeholder images; the real provider returns the post's own slide URLs.
 */
export function carouselSlides(shortcode: string, cover: string): string[] {
  const count = 2 + (hashString(shortcode) % 5);
  return [
    cover,
    ...Array.from(
      { length: count - 1 },
      (_, i) => `https://picsum.photos/seed/${shortcode}-${i + 2}/360/450`,
    ),
  ];
}
