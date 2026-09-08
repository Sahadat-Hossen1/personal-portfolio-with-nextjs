"use client";

import { useEffect } from "react";
import { X, Play, ExternalLink } from "lucide-react";
import type { ProjectData } from "@/types/portfolio";
import Image from "next/image";

interface VideoModalProps {
  project: ProjectData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ project, isOpen, onClose }: VideoModalProps) {
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

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  };

  const embedUrl = project.live ? getEmbedUrl(project.live) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-xl transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Header Bar with Timecode Aesthetic */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/70">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase">
              PREVIEW // {project.title}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors"
            aria-label="Close preview"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video / Player Container (16:9 Aspect Ratio) */}
        <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={project.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full group">
              <Image
                src={project.image}
                alt={project.title}
                fill
                unoptimized
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs px-2.5 py-1 rounded bg-red-600/90 text-white font-mono font-bold tracking-wider uppercase">
                    4K PRORES 422 HQ
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    TIMECODE: 00:03:42:12
                  </span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white mb-2">
                  {project.title}
                </h4>
                <p className="text-sm text-zinc-300 line-clamp-2 max-w-2xl mb-4">
                  {project.longDesc || project.description}
                </p>

                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all self-start shadow-lg shadow-red-900/30 hover:scale-105"
                  >
                    <Play size={14} className="fill-white" />
                    Open Live Showcase
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Details */}
        <div className="p-5 bg-zinc-950 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-900">
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Production Assets / Repo →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
