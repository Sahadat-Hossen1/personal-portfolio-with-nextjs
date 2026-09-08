"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Film, ExternalLink } from "lucide-react";
import type { ProjectData } from "@/types/portfolio";
import VideoModal from "./VideoModal";

interface VideoProjectsProps {
  projects: ProjectData[];
}

export default function VideoProjects({ projects }: VideoProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [filter, setFilter] = useState("All");

  const categories = ["All", "Commercial", "Motion & VFX", "Narrative"];

  // Filter projects smoothly
  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((p) => {
          if (filter === "Commercial") return p.featured || p.tags.some((t) => t.toLowerCase().includes("commerce") || t.toLowerCase().includes("business"));
          if (filter === "Motion & VFX") return p.tags.some((t) => t.toLowerCase().includes("react") || t.toLowerCase().includes("tailwind") || t.toLowerCase().includes("ui"));
          if (filter === "Narrative") return !p.featured;
          return true;
        });

  return (
    <section id="projects" className="py-24 px-4 bg-zinc-950 relative overflow-hidden">
      {/* Film Strip Accent Line */}
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-red-500 uppercase tracking-widest">
              <Film size={14} />
              <span>Portfolio // Catalogue</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white uppercase">
              Selected Works
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-200 ${
                  filter === cat
                    ? "bg-red-600 text-white shadow-md shadow-red-950/50"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Video Portfolio Grid (16:9 Aspect Ratio) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, i) => (
            <div
              key={project._id || project.id || i}
              className="group relative rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-red-500/40 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              {/* 16:9 Thumbnail Poster Frame */}
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  unoptimized
                  className="object-cover opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                />

                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/30 group-hover:from-zinc-950/90 transition-colors" />

                {/* Top Corner Badge: Resolution / Aspect Ratio */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md border border-zinc-700 font-mono text-[9px] font-bold text-zinc-300 uppercase">
                    16:9 // 4K
                  </span>
                  {project.featured && (
                    <span className="px-2 py-0.5 rounded bg-red-600/90 font-mono text-[9px] font-bold text-white uppercase tracking-wider">
                      FEATURED
                    </span>
                  )}
                </div>

                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl shadow-red-950/60 group-hover:scale-110 transition-transform">
                    <Play size={22} className="fill-white translate-x-0.5" />
                  </div>
                </div>

                {/* Bottom Duration Badge */}
                <div className="absolute bottom-2.5 right-3 font-mono text-[10px] text-zinc-300 bg-black/70 px-2 py-0.5 rounded border border-zinc-800">
                  03:{String(10 + i * 7).padStart(2, "0")}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 line-clamp-1">
                    {project.description}
                  </span>
                  <span className="text-zinc-500 group-hover:text-red-400 transition-colors">
                    <ExternalLink size={13} />
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1 mb-2">
                  {project.title}
                </h3>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4 flex-1">
                  {project.longDesc || project.description}
                </p>

                {/* Editing Tools / Software Tags */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-zinc-800/80">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/50 text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 text-zinc-400">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal Preview */}
      <VideoModal
        project={selectedProject}
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
