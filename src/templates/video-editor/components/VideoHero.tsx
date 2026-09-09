"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Film, ArrowDown, ExternalLink } from "lucide-react";
import type { ProfileData, ProjectData } from "@/types/portfolio";
import VideoModal from "./VideoModal";

interface VideoHeroProps {
  profile: ProfileData;
  featuredProject?: ProjectData;
  onOpenReel?: () => void;
}

export default function VideoHero({
  profile,
  featuredProject,
}: VideoHeroProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const displayName = profile?.name || "Video Editor & Filmmaker";
  const statusText = profile?.statusText || "Available for Commercial & Indie Projects";
  const bioBlurb =
    profile?.bioBlurb ||
    "Crafting cinematic narratives, high-energy commercial edits, and polished color grading. Transforming raw footage into compelling visual experiences.";

  const reelThumbnail =
    featuredProject?.image || "/assets/images/projects/project-1.jpg";
  const reelTitle =
    featuredProject?.title || "2026 Commercial & Narrative Showreel";

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-28 pb-20 px-4 flex flex-col justify-center overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-zinc-950"
    >
      {/* Cinematic Ambient Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(220, 38, 38, 0.4) 0%, rgba(245, 158, 11, 0.15) 45%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Top Production Badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-300 shadow-xl backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>POST-PRODUCTION &amp; COLOR SUITE</span>
            <span className="text-zinc-600">|</span>
            <span className="text-amber-400 font-semibold">{statusText}</span>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-4 uppercase font-mono">
            {displayName}
          </h1>
          <p className="text-lg sm:text-2xl font-semibold bg-gradient-to-r from-red-400 via-amber-300 to-amber-500 bg-clip-text text-transparent mb-6 tracking-wide">
            Creative Video Editor &amp; Visual Storyteller
          </p>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {bioBlurb}
          </p>
        </div>

        {/* Cinematic 16:9 Showreel Player Banner */}
        <div className="relative max-w-4xl mx-auto mb-12 group">
          {/* Subtle Outer Glowing Border */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 opacity-30 group-hover:opacity-60 blur-lg transition duration-500" />

          <div
            onClick={() => setModalOpen(true)}
            className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl cursor-pointer group"
          >
            {/* Showreel Poster */}
            <Image
              src={reelThumbnail}
              alt={reelTitle}
              fill
              unoptimized
              priority
              className="object-cover opacity-75 group-hover:scale-105 transition-transform duration-700 filter contrast-105"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

            {/* Top Film Slate Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-red-600 text-white font-mono text-[10px] font-bold tracking-widest uppercase">
                  OFFICIAL SHOWREEL
                </span>
                <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-zinc-700 text-zinc-300 font-mono text-[10px]">
                  4K // 24 FPS
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                TIMECODE 00:02:14:18
              </div>
            </div>

            {/* Center Radiant Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-24 h-24 rounded-full bg-red-600/30 animate-ping pointer-events-none" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center shadow-2xl shadow-red-900/60 group-hover:scale-110 transition-transform duration-300">
                  <Play size={32} className="fill-white translate-x-0.5" />
                </div>
              </div>
            </div>

            {/* Bottom Title Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
                  Featured Cut
                </span>
                <h3 className="text-base sm:text-xl font-bold text-white line-clamp-1">
                  {reelTitle}
                </h3>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-xs font-mono text-zinc-300">
                Click to Play
                <ExternalLink size={12} />
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-red-950/60 hover:scale-105 transition-all duration-300"
          >
            <Play size={15} className="fill-white" />
            Watch Full Showreel
          </button>

          <a
            href="#projects"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300"
          >
            <Film size={15} />
            Explore Video Portfolio
          </a>
        </div>

        {/* Production Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm">
          {[
            { label: "Commercial Edits", value: "25+" },
            { label: "Resolution Standard", value: "4K UHD" },
            { label: "Client Satisfaction", value: "100%" },
            { label: "Turnaround Time", value: "24-48h" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black font-mono text-white mb-1">
                {item.value}
              </div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Down Arrow */}
      <div className="flex justify-center mt-12">
        <a
          href="#projects"
          aria-label="Scroll to projects"
          className="text-zinc-500 hover:text-white transition-colors animate-bounce"
        >
          <ArrowDown size={20} />
        </a>
      </div>

      {/* Showreel Lightbox Modal */}
      {featuredProject && (
        <VideoModal
          project={featuredProject}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </section>
  );
}
