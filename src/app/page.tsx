import { Footer } from "@/components/Footer";
import { Experience } from "@/components/experience/Experience";
import { Hero } from "@/components/hero/Hero";
import { ProjectsShowcase } from "@/components/projects/ProjectsShowcase";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Experience />
        <ProjectsShowcase />
      </main>
      <Footer />
    </>
  );
}
