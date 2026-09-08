"use client";

import { useMemo } from "react";
import { Zap, Wrench, CheckCircle2 } from "lucide-react";
import type { SkillData } from "@/types/portfolio";

interface MarketingSkillsProps {
  skills: SkillData[];
  tags: string[];
}

export default function MarketingSkills({ skills, tags }: MarketingSkillsProps) {
  // Group skills by category if available, or present cleanly
  const categories = useMemo(() => {
    const map = new Map<string, SkillData[]>();
    skills.forEach((skill) => {
      const cat = skill.category || "General Growth Stack";
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(skill);
    });
    return Array.from(map.entries());
  }, [skills]);

  return (
    <section id="skills" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-teal-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap size={13} />
            <span>GROWTH STACK &amp; MARTECH ARSENAL</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Strategic Marketing Capabilities
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Disciplined execution across attribution, paid acquisition channels, organic search, conversion rate optimization, and lifecycle automation.
          </p>
        </div>

        {/* Grouped Skills Matrix */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(([category, catSkills], cIdx) => (
            <div
              key={cIdx}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-lg shadow-black/20"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {category}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400 font-medium">
                    {catSkills.length} disciplines
                  </span>
                </div>

                <div className="space-y-4">
                  {catSkills.map((skill, sIdx) => {
                    const level = skill.level || 85;
                    return (
                      <div key={sIdx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">
                            {skill.name}
                          </span>
                          <span className="font-mono text-[11px] text-emerald-400 font-bold">
                            {level}%
                          </span>
                        </div>

                        {/* Proficiency Level Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800/80 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 transition-all duration-700"
                            style={{ width: `${level}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>Verified Execution Proficiency</span>
              </div>
            </div>
          ))}
        </div>

        {/* Specialized Tools & Certifications Tag Strip */}
        {tags && tags.length > 0 && (
          <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Wrench size={15} className="text-emerald-400" />
              <span>Specialized Tooling &amp; Platform Competencies</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-950 text-slate-300 border border-slate-800 hover:border-emerald-500/40 hover:text-white transition-all shadow-sm"
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
