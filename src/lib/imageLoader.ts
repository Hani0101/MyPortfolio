"use client";

/**
 * next/image loader for the static export. With no server to resize images,
 * `npm run images` writes a WebP copy of each source at every width in
 * imageWidths.json, and this points each srcset entry at its copy:
 *   /project_images/ecom_mockup.png at 1200 → /project_images/ecom_mockup-1200.webp
 */
export default function imageLoader({ src, width }: { src: string; width: number }) {
  return `${src.replace(/\.[^./]+$/, "")}-${width}.webp`;
}
