"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, ExternalLink, Star } from "lucide-react";
import { Github } from "@/components/icons";
import type { ProjectData } from "@/types/portfolio";

interface DoctorProjectModalProps {
  project: ProjectData | null;
  onClose: () => void;
}

export default function DoctorProjectModal({
  project,
  onClose,
}: DoctorProjectModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (project) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-3xl shadow-2xl space-y-6 p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Project Image */}
        {project.image && (
          <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden bg-muted border border-border/80">
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        {/* Title & Metadata */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {project.featured && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                Featured Work
              </span>
            )}
            {typeof project.stars === "number" && project.stars > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Star size={12} className="fill-current" />
                <span>{project.stars}</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {project.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Detailed Description */}
        {project.longDesc && (
          <div className="pt-4 border-t border-border/60 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Overview & Details
            </div>
            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {project.longDesc}
            </div>
          </div>
        )}

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div className="pt-4 border-t border-border/60 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Categories & Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-foreground border border-border/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-end gap-3">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border transition-all"
            >
              <Github size={15} />
              <span>Source / Repository</span>
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md shadow-teal-600/20 transition-all"
            >
              <span>Live Preview</span>
              <ExternalLink size={14} />
            </a>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-medium transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
