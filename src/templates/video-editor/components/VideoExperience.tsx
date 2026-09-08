"use client";

import { Film, Calendar, MapPin, ExternalLink } from "lucide-react";
import type { ExperienceData } from "@/types/portfolio";

interface VideoExperienceProps {
  experiences: ExperienceData[];
}

export default function VideoExperience({ experiences }: VideoExperienceProps) {
  return (
    <section id="experience" className="py-24 px-4 bg-zinc-950 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-2 font-mono text-xs text-red-500 uppercase tracking-widest">
            <Film size={14} />
            <span>Commercial History</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white uppercase mb-3">
            Production Credits
          </h2>
          <p className="text-sm text-zinc-400">
            A track record of high-impact commercial campaigns, documentary storytelling, and client deliverables.
          </p>
        </div>

        {/* Film Credits Timeline List */}
        <div className="space-y-6">
          {experiences.map((exp, idx) => (
            <div
              key={exp._id || exp.id || idx}
              className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-red-500/30 transition-all duration-300 relative group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <span className="font-mono text-xs text-red-500 font-bold">
                      CREDIT #{String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold font-mono text-white">
                      {exp.role}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-amber-400 font-mono">
                    {exp.companyUrl ? (
                      <a
                        href={exp.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline inline-flex items-center gap-1"
                      >
                        {exp.company}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span>{exp.company}</span>
                    )}
                    <span className="text-zinc-600">/</span>
                    <span className="text-xs text-zinc-400 font-sans">{exp.type}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1 text-xs font-mono text-zinc-400">
                  <div className="inline-flex items-center gap-1.5">
                    <Calendar size={12} className="text-red-500" />
                    <span>{exp.period}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-zinc-500">
                    <MapPin size={12} />
                    <span>{exp.location}</span>
                  </div>
                </div>
              </div>

              {/* Bullets / Key Achievements */}
              <ul className="space-y-2 mb-5">
                {exp.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {/* Delivery Tags / Tools */}
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-zinc-800/80">
                {exp.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
