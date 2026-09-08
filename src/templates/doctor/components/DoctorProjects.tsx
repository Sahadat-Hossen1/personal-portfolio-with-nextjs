"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { FolderGit2, ExternalLink, ArrowUpRight, Star } from "lucide-react";
import { Github } from "@/components/icons";
import type { ProjectData } from "@/types/portfolio";
import DoctorProjectModal from "./DoctorProjectModal";

interface DoctorProjectsProps {
  projects?: ProjectData[];
}

export default function DoctorProjects({
  projects = [],
}: DoctorProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null
  );
  const [activeTag, setActiveTag] = useState("all");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      p.tags?.forEach((t) => set.add(t));
    });
    return ["all", ...Array.from(set).slice(0, 6)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeTag === "all") return projects;
    return projects.filter((p) => p.tags?.includes(activeTag));
  }, [projects, activeTag]);

  return (
    <section
      id="projects"
      className="py-16 sm:py-24 bg-muted/30 border-y border-border/60"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
            <FolderGit2 size={13} />
            <span>Featured Work & Portfolio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Projects & Initiatives
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            A showcase of recent initiatives, digital tools, research, and featured projects.
          </p>
        </div>

        {/* Tag Filters */}
        {allTags.length > 2 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold capitalize transition-all cursor-pointer ${
                  activeTag === tag
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border hover:bg-muted/60"
                }`}
              >
                {tag === "all" ? "All Projects" : tag}
              </button>
            ))}
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => (
            <div
              key={project._id || project.id || idx}
              onClick={() => setSelectedProject(project)}
              className="rounded-3xl bg-card border border-border/80 shadow-xs hover:border-teal-500/40 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
            >
              {/* Image Banner */}
              <div className="relative w-full h-48 sm:h-52 bg-muted overflow-hidden">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-teal-500/5 text-teal-600 dark:text-teal-400 font-bold text-lg">
                    {project.title}
                  </div>
                )}

                {/* Badges on Image */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  {project.featured ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-600/90 text-white backdrop-blur-md shadow-sm">
                      Featured
                    </span>
                  ) : (
                    <span />
                  )}

                  {typeof project.stars === "number" && project.stars > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-card/90 backdrop-blur-md text-foreground border border-border shadow-sm">
                      <Star size={11} className="text-amber-500 fill-amber-500" />
                      <span>{project.stars}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {project.title}
                    </h3>
                    <ArrowUpRight
                      size={18}
                      className="text-muted-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0"
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-4 pt-2 border-t border-border/50">
                  {project.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted/80 text-muted-foreground border border-border/40"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Links / Action row */}
                  <div
                    className="flex items-center justify-between pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:underline">
                      View Details
                    </span>

                    <div className="flex items-center gap-2">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub Repository"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Github size={15} />
                        </a>
                      )}
                      {project.live && (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Live Demo"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 hover:bg-muted transition-colors"
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <DoctorProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
