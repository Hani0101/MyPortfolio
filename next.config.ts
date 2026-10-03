import type { NextConfig } from "next";
import imageWidths from "./src/lib/imageWidths.json";

// Static export served by Cloudflare Workers assets. Cache headers for the dirs the
// page loads on every visit live in public/_headers, since export ignores headers().
const nextConfig: NextConfig = {
  output: "export",
  // No image server in a static export: `npm run images` writes a WebP copy per width
  // ahead of time and the loader points each srcset entry at its copy. imageSizes is
  // emptied so next/image only ever asks for widths that were generated.
  images: {
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
    deviceSizes: imageWidths,
    imageSizes: [],
  },
};

export default nextConfig;
