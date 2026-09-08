"use client";

import { Briefcase, Calendar, MapPin, CheckCircle2, Award } from "lucide-react";
import type { ExperienceData } from "@/types/portfolio";

interface MarketingExperienceProps {
  experiences: ExperienceData[];
}

export default function MarketingExperience({ experiences }: MarketingExperienceProps) {
  // Sort experiences by order or reverse chronology
  const sortedExperiences = [...experiences].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <section id="experience" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950/80 relative">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Briefcase size={13} />
            <span>GROWTH TRACK RECORD</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Strategic Engagements &amp; Leadership
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Professional track record across corporate roles, growth consultancy, and high-impact marketing initiatives.
          </p>
        </div>

        {/* Timeline List */}
        <div className="relative border-l border-slate-800 ml-4 sm:ml-8 space-y-12">
          {sortedExperiences.map((exp, idx) => (
            <div key={idx} className="relative pl-8 sm:pl-10 group">
              {/* Timeline Node Icon */}
              <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Award size={14} />
              </div>

              {/* Engagement Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 transition-all duration-300 space-y-4 shadow-xl shadow-black/20">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {exp.role}
                    </h3>
                    <p className="text-base font-semibold text-emerald-400 mt-0.5">
                      {exp.company}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {exp.type && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {exp.type}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Calendar size={13} />
                      {exp.period}
                    </span>
                  </div>
                </div>

                {/* Location if available */}
                {exp.location && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin size={13} className="text-slate-500" />
                    <span>{exp.location}</span>
                  </div>
                )}

                {/* Key Deliverables & Achievements from bullets */}
                {exp.bullets && exp.bullets.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Key Milestones &amp; Deliverables
                    </h4>
                    <ul className="space-y-2">
                      {exp.bullets.map((item, aIdx) => (
                        <li
                          key={aIdx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed"
                        >
                          <CheckCircle2
                            size={16}
                            className="text-emerald-400 shrink-0 mt-0.5"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags if available */}
                {exp.tags && exp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
                    {exp.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-950 text-slate-400 border border-slate-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
