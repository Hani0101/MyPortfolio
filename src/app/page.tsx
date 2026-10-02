import { Hero } from "@/components/hero/Hero";

export default function Home() {
  return (
    <main>
      <Hero />
      {/* Placeholder so the page scrolls past the hero; replace with Projects/Experience */}
      <section id="projects" aria-label="Projects" className="min-h-svh" />
    </main>
  );
}
