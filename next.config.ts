import type { NextConfig } from "next";

// Static assets the page loads on every visit. They keep their names when replaced,
// so they can't be cached forever: fresh for a day, then served from cache while
// the browser revalidates in the background for up to a week.
const CACHED_DIRS = ["models", "textures", "logos"];
const CACHE_CONTROL = "public, max-age=86400, stale-while-revalidate=604800";

const nextConfig: NextConfig = {
  async headers() {
    return CACHED_DIRS.map((dir) => ({
      source: `/${dir}/:file*`,
      headers: [{ key: "Cache-Control", value: CACHE_CONTROL }],
    }));
  },
};

export default nextConfig;
