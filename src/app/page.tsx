import { Experience } from "@/components/experience/Experience";
import { Hero } from "@/components/hero/Hero";
import { Projects } from "@/components/projects/Projects";
import { ProjectsIndex } from "@/components/projects/ProjectsIndex";

export default function Home() {
  return (
    <main>
      <Hero />
      <Experience />
      <Projects />
      {/* TODO: second Projects layout, shown for comparison; keep one and remove the other */}
      <ProjectsIndex id="projects-index" />
    </main>
  );
}
