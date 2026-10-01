import localFont from "next/font/local";
import { Inter } from "next/font/google";

// Headings: Playfair Display (self-hosted variable font, weights 400-900)
export const playfair = localFont({
  src: [
    { path: "../fonts/PlayfairDisplay-VariableFont_wght.ttf", weight: "400 900", style: "normal" },
    { path: "../fonts/PlayfairDisplay-Italic-VariableFont_wght.ttf", weight: "400 900", style: "italic" },
  ],
  variable: "--font-playfair",
  display: "swap",
});

// Body: Inter
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Apply to <html> so tokens.css can resolve --font-playfair / --font-inter
export const fontVariables = `${playfair.variable} ${inter.variable}`;
