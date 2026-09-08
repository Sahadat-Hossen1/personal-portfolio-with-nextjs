"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, ExternalLink, FileText, CheckCircle2, Star, Layers } from "lucide-react";
import type { ProjectData } from "@/types/portfolio";
import { trackProjectClick } from "@/lib/gtm";

interface CaseStudyModalProps {
  project: ProjectData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CaseStudyModal({
  project,
  isOpen,
  onClose,
}: CaseStudyModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-emerald-950/20 text-slate-100 z-10 flex flex-col">
        {/* Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers size={13} />
              Growth Case Study
            </span>
            {project.stars !== undefined && project.stars > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Star size={12} className="fill-amber-400" />
                {project.stars} Rating
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Visual Banner */}
          {project.image && (
            <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 800px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {project.title}
                </h3>
              </div>
            </div>
          )}

          {!project.image && (
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {project.title}
            </h3>
          )}

          {/* Strategic Challenge / Context */}
          {project.description && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Strategic Challenge & Objective
              </h4>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {project.description}
              </p>
            </div>
          )}

          {/* Deep Strategy & Execution */}
          {project.longDesc && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                Execution & Methodology
              </h4>
              <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 whitespace-pre-line">
                {project.longDesc}
              </div>
            </div>
          )}

          {/* Marketing Channels & MarTech */}
          {project.tags && project.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Growth Channels & MarTech Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700/60"
                  >
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions & Deliverables Links */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackProjectClick(project.title, "live_demo", project.live)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
                >
                  <ExternalLink size={16} />
                  Live Campaign / Case Study
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackProjectClick(project.title, "github", project.github)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors border border-slate-700"
                >
                  <FileText size={16} />
                  Strategy & Assets Deck
                </a>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
