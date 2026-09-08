"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ExternalLink, FileText, Star, Layers, ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { ProjectData } from "@/types/portfolio";
import { trackProjectClick } from "@/lib/gtm";
import CaseStudyModal from "./CaseStudyModal";

interface MarketingProjectsProps {
  projects: ProjectData[];
}

export default function MarketingProjects({ projects }: MarketingProjectsProps) {
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [activeModalProject, setActiveModalProject] = useState<ProjectData | null>(null);

  // Extract unique tags for campaign filtering
  const allTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      p.tags?.forEach((t) => set.add(t));
    });
    return ["All", ...Array.from(set).slice(0, 5)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedTag === "All") return projects;
    return projects.filter(
      (p) => p.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
    );
  }, [projects, selectedTag]);

  return (
    <section id="projects" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950/90 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers size={13} />
              <span>MEASURABLE BUSINESS IMPACT</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Growth Case Studies
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Documented execution across digital acquisition channels, conversion rate optimization, and full-funnel architectures.
            </p>
          </div>

          {/* Filter Pills */}
          {allTags.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedTag === tag
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Case Studies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <article
              key={idx}
              className="group relative flex flex-col rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-emerald-950/20 hover:-translate-y-1"
            >
              {/* Campaign Visual Banner */}
              <div
                className="relative w-full h-52 sm:h-56 bg-slate-950 overflow-hidden cursor-pointer"
                onClick={() => setActiveModalProject(project)}
              >
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 to-slate-950">
                    <Layers size={36} className="text-emerald-400 mb-2 opacity-60" />
                    <span className="text-sm font-semibold text-slate-400">
                      Growth Case Study
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

                {/* Top Floating Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-slate-800">
                    {project.tags?.[0] || "Growth Campaign"}
                  </span>
                  {project.stars !== undefined && project.stars > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 backdrop-blur-md">
                      <Star size={11} className="fill-amber-400" />
                      {project.stars}
                    </span>
                  )}
                </div>

                {/* Hover Indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/50 backdrop-blur-[2px]">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow-lg">
                    Inspect Strategy
                    <ArrowUpRight size={14} className="stroke-[2.5]" />
                  </span>
                </div>
              </div>

              {/* Campaign Content Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <h3
                    onClick={() => setActiveModalProject(project)}
                    className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {project.title}
                  </h3>

                  {/* Challenge & Strategic Scope */}
                  <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                    {project.description ||
                      "Strategic multi-channel initiative focused on acquisition, conversion path optimization, and quantifiable performance."}
                  </p>
                </div>

                {/* Growth Channels / MarTech Tags */}
                <div className="space-y-4 pt-2 border-t border-slate-800/80">
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 4).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-950 text-slate-300 border border-slate-800"
                        >
                          <CheckCircle2 size={10} className="text-emerald-400" />
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 font-medium">
                          +{project.tags.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Link Row */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setActiveModalProject(project)}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                    >
                      Strategic Breakdown
                      <ArrowUpRight size={14} />
                    </button>

                    <div className="flex items-center gap-2">
                      {project.live && (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackProjectClick(project.title, "live_demo", project.live)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                          title="View Live Campaign / Case Study"
                          aria-label={`View live campaign for ${project.title}`}
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackProjectClick(project.title, "github", project.github)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                          title="View Asset / Strategy Deck"
                          aria-label={`View documentation for ${project.title}`}
                        >
                          <FileText size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
            No case studies found for the selected category.
          </div>
        )}
      </div>

        {/* Strategy Breakdown Modal */}
        <CaseStudyModal
          project={activeModalProject}
          isOpen={!!activeModalProject}
          onClose={() => setActiveModalProject(null)}
        />
    </section>
  );
}
