// Converts every image in assets/project_images into WebP copies in
// public/project_images, one per width next/image asks for (src/lib/imageWidths.json),
// so the static export needs no image server. src/lib/imageLoader.ts maps to these names.
// Usage: npm run images
import { mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import widths from "../src/lib/imageWidths.json" with { type: "json" };

const SOURCE = "assets/project_images";
const TARGET = "public/project_images";
const QUALITY = 75; // next/image's default

mkdirSync(TARGET, { recursive: true });

for (const file of readdirSync(SOURCE).filter((name) => /\.(png|jpe?g|webp)$/i.test(name))) {
  const { name } = path.parse(file);
  for (const width of widths) {
    const out = path.join(TARGET, `${name}-${width}.webp`);
    // A width above the source's own is written at its own size, so every srcset entry still resolves
    const { size } = await sharp(path.join(SOURCE, file))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(out);
    console.log(`${out} (${Math.round(size / 1024)} KB)`);
  }
}
