import type { Metadata } from "next";
import "@/styles/globals.css";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Hani | Portfolio",
  description: "Who I am, what I do, where I've worked and what I've built.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
