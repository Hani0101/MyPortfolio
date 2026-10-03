import { Inter, Playfair_Display } from "next/font/google";

// Headings: Playfair Display (variable font, weights 400-900), self-hosted by next/font as subset WOFF2
export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// Italic: its own family so it isn't preloaded; it only sets one line deep in the
// page, so it shouldn't compete with the hero's fonts. Use font-heading-italic.
export const playfairItalic = Playfair_Display({
  subsets: ["latin"],
  style: "italic",
  variable: "--font-playfair-italic",
  display: "swap",
  preload: false,
});

// Body: Inter
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Apply to <html> so tokens.css can resolve --font-playfair / --font-playfair-italic / --font-inter
export const fontVariables = `${playfair.variable} ${playfairItalic.variable} ${inter.variable}`;
