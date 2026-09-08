"use client";

import { Sliders, Sparkles, Layers, Volume2, Palette } from "lucide-react";
import type { SkillData } from "@/types/portfolio";

interface VideoSkillsProps {
  skills: SkillData[];
  tags: string[];
}

export default function VideoSkills({ skills, tags }: VideoSkillsProps) {
  return (
    <section id="skills" className="py-24 px-4 bg-zinc-900/40 relative overflow-hidden border-t border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-2 font-mono text-xs text-red-500 uppercase tracking-widest">
            <Sliders size={14} />
            <span>Hardware &amp; Software Suite</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white uppercase mb-4">
            Post-Production Suite
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            A specialized toolkit optimized for high-performance 4K timeline editing, seamless visual effects, precision color grading, and dynamic sound design.
          </p>
        </div>

        {/* 4 Creative Pillars */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {[
            {
              title: "NLE Timeline Editing",
              icon: Layers,
              desc: "Story assembly, narrative pacing, multi-cam synchronization, and seamless transitions.",
              color: "border-red-500/30 text-red-400",
            },
            {
              title: "Motion Graphics & VFX",
              icon: Sparkles,
              desc: "Dynamic title animations, lower thirds, track mattes, screen replacements, and 2D/3D elements.",
              color: "border-amber-500/30 text-amber-400",
            },
            {
              title: "Color Grading & LUTs",
              icon: Palette,
              desc: "Color balancing, shot matching, mood grading, ACES workflow, and HDR finishing.",
              color: "border-rose-500/30 text-rose-400",
            },
            {
              title: "Sound Design & Audio",
              icon: Volume2,
              desc: "Foley layering, dialogue cleanup, vocal compression, soundtrack sync, and stereo mastering.",
              color: "border-orange-500/30 text-orange-400",
            },
          ].map((pillar) => (
            <div
              key={pillar.title}
              className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center mb-4 border ${pillar.color}`}>
                <pillar.icon size={20} />
              </div>
              <h3 className="text-base font-bold font-mono text-white mb-2 uppercase">
                {pillar.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Database-Driven Skill Competencies Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-4 hover:border-zinc-700 transition-all"
            >
              <div className="text-2xl w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0">
                {skill.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold text-white uppercase truncate">
                    {skill.name}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {skill.level}%
                  </span>
                </div>

                {/* Level Meter */}
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Extra Plugins & Formats */}
        {tags.length > 0 && (
          <div className="text-center pt-8 border-t border-zinc-800/80">
            <span className="text-xs font-mono text-zinc-400 tracking-wider uppercase mb-4 block">
              Additional Plugins, Formats &amp; Delivery Standards
            </span>
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono px-3 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
