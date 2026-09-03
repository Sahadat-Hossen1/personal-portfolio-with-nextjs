"use client";

import { useEffect, useRef, useState } from "react";
import { trackSkillClick } from "@/lib/gtm";

type Skill = {
  name: string;
  icon: string;
  level: number;
  color: string;
  category: string;
};

const skills: Skill[] = [
  // Web Development Stack
  { name: "React", icon: "⚛️", level: 95, color: "#38bdf8", category: "Web Development" },
  { name: "Next.js", icon: "▲", level: 90, color: "#e2e8f0", category: "Web Development" },
  { name: "JavaScript", icon: "🟡", level: 97, color: "#eab308", category: "Web Development" },
  { name: "TypeScript", icon: "🔷", level: 88, color: "#3b82f6", category: "Web Development" },
  { name: "Node.js", icon: "🟢", level: 93, color: "#84cc16", category: "Web Development" },
  { name: "Express.js", icon: "⚡", level: 90, color: "#94a3b8", category: "Web Development" },
  { name: "MongoDB", icon: "🍃", level: 92, color: "#10b981", category: "Web Development" },
  { name: "Tailwind CSS", icon: "🎨", level: 92, color: "#06b6d4", category: "Web Development" },
  { name: "Redux", icon: "🔮", level: 82, color: "#7c3aed", category: "Web Development" },
  { name: "REST APIs", icon: "🔗", level: 95, color: "#f59e0b", category: "Web Development" },
  { name: "Git & GitHub", icon: "🐙", level: 95, color: "#a78bfa", category: "Web Development" },
  { name: "Vercel & Netlify", icon: "▲", level: 90, color: "#00c7b7", category: "Web Development" },

  // Web Analytics & Tracking Stack
  { name: "Google Tag Manager", icon: "🏷️", level: 95, color: "#4285f4", category: "Analytics & Tracking" },
  { name: "Google Analytics 4", icon: "📊", level: 92, color: "#ea4335", category: "Analytics & Tracking" },
  { name: "Meta Pixel & CAPI", icon: "♾️", level: 90, color: "#0081fb", category: "Analytics & Tracking" },
  { name: "Google Ads Tracking", icon: "🎯", level: 88, color: "#fbbc04", category: "Analytics & Tracking" },
  { name: "LinkedIn Insight Tag", icon: "💼", level: 85, color: "#0a66c2", category: "Analytics & Tracking" },
  { name: "TikTok Pixel Tracking", icon: "🎵", level: 85, color: "#fe2c55", category: "Analytics & Tracking" },
];

const alsoFamiliarTags = [
  "DataLayer Architecture",
  "Server-Side Tracking",
  "E-commerce Purchase Tracking",
  "Enhanced Conversions",
  "Custom Event Triggers",
  "Consent Mode (v2)",
  "Mongoose",
  "JWT",
  "Postman",
  "Vite",
  "Figma",
  "ESLint",
];

interface SkillsSectionProps {
  skills?: Skill[];
  tags?: string[];
}

export default function SkillsSection({
  skills: propSkills,
  tags: propTags,
}: SkillsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const activeSkills = propSkills && propSkills.length > 0 ? propSkills : skills;
  const activeTags = propTags && propTags.length > 0 ? propTags : alsoFamiliarTags;

  const categories = ["All", ...Array.from(new Set(activeSkills.map((s) => s.category)))];
  const [activeTab, setActiveTab] = useState<string>("All");

  const filteredSkills = activeTab === "All" 
    ? activeSkills 
    : activeSkills.filter((skill) => skill.category === activeTab);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 60);
            });
            // Animate progress bars
            entry.target.querySelectorAll<HTMLElement>("[data-progress]").forEach((el) => {
              const target = el.dataset.progress || "0";
              setTimeout(() => {
                el.style.width = `${target}%`;
              }, 300);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [activeTab]);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="py-24 lg:py-32 px-4 relative overflow-hidden"
    >
      {/* Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto">
        {/* Section Label */}
        <div className="reveal flex items-center gap-3 mb-4">
          <span className="text-cyan-400 text-sm font-mono font-semibold tracking-widest uppercase">
            02. Skills
          </span>
          <div className="h-px flex-1 max-w-16 bg-cyan-500/40" />
        </div>

        {/* Title */}
        <h2 className="reveal text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
          My <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">Tech Stack</span>
        </h2>
        <p className="reveal text-slate-400 max-w-2xl mb-8 leading-relaxed">
          A robust blend of modern full-stack development technologies and precision web analytics tools to build, deploy, and accurately track user interactions.
        </p>

        {/* Category Tabs */}
        <div className="reveal flex flex-wrap gap-2 mb-10">
          {categories.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 border ${
                activeTab === tab
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Skill Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.name}
              onClick={() => trackSkillClick(skill.name, skill.category)}
              className="reveal group bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col items-center text-center cursor-pointer"
            >
              <div
                className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300"
                role="img"
                aria-label={skill.name}
              >
                {skill.icon}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-200 mb-2 line-clamp-1">
                {skill.name}
              </span>

              {/* Proficiency Bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-auto">
                <div
                  data-progress={skill.level}
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${skill.level}%`,
                    background: `linear-gradient(90deg, ${skill.color}88, ${skill.color})`,
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1.5">{skill.level}%</span>
            </div>
          ))}
        </div>

        {/* Extra Competency Tags */}
        <div className="reveal mt-16 text-center">
          <p className="text-xs text-slate-500 font-mono mb-4 tracking-widest uppercase">
            Also Familiar With & Tracking Methods
          </p>
          <div className="flex flex-wrap gap-2.5 justify-center max-w-4xl mx-auto">
            {activeTags.map((tag) => (
              <span
                key={tag}
                onClick={() => trackSkillClick(tag, "Familiarity & Tracking")}
                className="text-xs px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-all duration-200 cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}