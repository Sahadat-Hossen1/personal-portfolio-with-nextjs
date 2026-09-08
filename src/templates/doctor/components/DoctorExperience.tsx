"use client";

import { Briefcase, Calendar, MapPin, ExternalLink, Building2 } from "lucide-react";
import type { ExperienceData } from "@/types/portfolio";

interface DoctorExperienceProps {
  experiences?: ExperienceData[];
}

export default function DoctorExperience({
  experiences = [],
}: DoctorExperienceProps) {
  return (
    <section id="experience" className="py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Briefcase size={13} />
            <span>Career Journey</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Professional Experience
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            A chronological timeline of professional appointments, clinical roles, and institutional experience.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative border-l-2 border-teal-500/30 dark:border-teal-500/20 ml-4 sm:ml-6 space-y-10">
          {experiences.map((exp, idx) => (
            <div
              key={exp._id || exp.id || idx}
              className="relative pl-6 sm:pl-8 group"
            >
              {/* Timeline Indicator Dot */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-card border-2 border-teal-500 group-hover:scale-125 group-hover:bg-teal-500 transition-all duration-300" />

              {/* Experience Card */}
              <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-xs hover:border-teal-500/40 hover:shadow-lg transition-all duration-300 space-y-4">
                {/* Header: Role, Period, Current Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {exp.role}
                      </h3>
                      {exp.current && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          Current
                        </span>
                      )}
                      {exp.type && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground border border-border/50">
                          {exp.type}
                        </span>
                      )}
                    </div>

                    {/* Company / Institution */}
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-teal-700 dark:text-teal-300 mt-1">
                      <Building2 size={14} className="flex-shrink-0" />
                      {exp.companyUrl ? (
                        <a
                          href={exp.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{exp.company}</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span>{exp.company}</span>
                      )}
                    </div>
                  </div>

                  {/* Period & Location */}
                  <div className="flex sm:flex-col sm:items-end gap-3 sm:gap-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-teal-600 dark:text-teal-400" />
                      {exp.period}
                    </span>
                    {exp.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {exp.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bullets */}
                {exp.bullets?.length > 0 && (
                  <ul className="space-y-2 pt-1">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li
                        key={bIdx}
                        className="text-xs sm:text-sm text-foreground/85 flex items-start gap-2.5 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0 mt-2" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Tags */}
                {exp.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {exp.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/40"
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
