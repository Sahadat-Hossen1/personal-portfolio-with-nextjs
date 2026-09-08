"use client";

import { useState, useMemo } from "react";
import { Award, Layers } from "lucide-react";
import type { SkillData } from "@/types/portfolio";

interface DoctorSkillsProps {
  skills?: SkillData[];
  tags?: string[];
}

export default function DoctorSkills({
  skills = [],
  tags = [],
}: DoctorSkillsProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    skills.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ["all", ...Array.from(set)];
  }, [skills]);

  const filteredSkills = useMemo(() => {
    if (activeCategory === "all") return skills;
    return skills.filter(
      (s) => s.category?.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [skills, activeCategory]);

  return (
    <section id="skills" className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Award size={13} />
            <span>Areas of Expertise</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Skills & Competencies
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Specialized domain proficiencies, technical capabilities, and core competencies.
          </p>
        </div>

        {/* Category Tabs */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold capitalize transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border hover:bg-muted/60"
                }`}
              >
                {cat === "all" ? "All Expertise" : cat}
              </button>
            ))}
          </div>
        )}

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredSkills.map((skill, idx) => (
            <div
              key={skill._id || skill.id || idx}
              className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs hover:border-teal-500/40 hover:shadow-md transition-all duration-300 space-y-3.5 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                    {skill.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {skill.name}
                    </h3>
                    {skill.category && (
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        {skill.category}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">
                  {skill.level}%
                </span>
              </div>

              {/* Proficiency Level Bar */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, skill.level))}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Additional Tags / Familiar Competencies */}
        {tags.length > 0 && (
          <div className="mt-12 p-6 rounded-3xl bg-muted/40 border border-border/60 text-center space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-2">
              <Layers size={14} className="text-teal-600 dark:text-teal-400" />
              <span>Related Knowledge & Technologies</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium px-3 py-1 rounded-xl bg-card border border-border text-foreground shadow-2xs"
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
