"use client";

import { ArrowUpRight, TrendingUp, BarChart3, CheckCircle2, ShieldCheck } from "lucide-react";
import type { ProfileData, ProjectData } from "@/types/portfolio";

interface MarketingHeroProps {
  profile: ProfileData;
  projectsCount: number;
  skillsCount: number;
  experienceCount: number;
  featuredProject?: ProjectData;
}

export default function MarketingHero({
  profile,
  projectsCount,
  skillsCount,
  experienceCount,
  featuredProject,
}: MarketingHeroProps) {
  const roles = profile?.roles && profile.roles.length > 0
    ? profile.roles
    : ["Growth Marketing Strategist", "Performance Media Specialist"];

  const primaryRole = roles[0];
  const secondaryRoles = roles.slice(1);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden bg-slate-950 text-slate-100"
    >
      {/* Background Decorative Gradients & Grid Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-3xl" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-sky-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #10B981 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 space-y-8 text-left">
            {/* Positioning Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm">
              <TrendingUp size={14} className="stroke-[2.5]" />
              <span>DATA-INFORMED STRATEGY &amp; PERFORMANCE</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Turning Market Signals Into{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                  Predictable Growth.
                </span>
              </h1>
              <p className="text-lg sm:text-xl font-medium text-slate-300">
                {profile?.name || "Growth Strategist"} &mdash;{" "}
                <span className="text-white font-semibold">{primaryRole}</span>
              </p>
            </div>

            {/* Strategic Subtitle / Bio */}
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              {profile?.bioBlurb ||
                "Specializing in full-funnel acquisition, paid media optimization, analytics attribution, and conversion architecture. Delivering quantifiable business impact through disciplined experimentation."}
            </p>

            {/* Secondary Specializations Strip */}
            {secondaryRoles.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Focus:
                </span>
                {secondaryRoles.map((role, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300"
                  >
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    {role}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, "#contact")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
              >
                Request Growth Audit
                <ArrowUpRight size={18} className="stroke-[2.5]" />
              </a>
              <a
                href="#projects"
                onClick={(e) => scrollToSection(e, "#projects")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 text-slate-200 hover:text-white font-semibold text-sm transition-all border border-slate-800 shadow-sm"
              >
                Explore Case Studies
                <BarChart3 size={16} />
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Audited Methodologies</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{profile?.statusText || "Available for Advisory & Campaigns"}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Performance Dashboard Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Growth Analytics Trajectory
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Attribution &amp; Experimentation Model
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Index
                </span>
              </div>

              {/* Data-Driven Real Portfolio KPI Strip */}
              <div className="grid grid-cols-3 gap-3 my-5">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">
                    {projectsCount}
                    <span className="text-emerald-400">+</span>
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                    Case Studies
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">
                    {skillsCount}
                    <span className="text-teal-400">+</span>
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                    MarTech Tools
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">
                    {experienceCount}
                    <span className="text-sky-400">+</span>
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                    Engagements
                  </div>
                </div>
              </div>

              {/* Upward Growth Trendline Chart Graphic */}
              <div className="relative p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">
                    Campaign Velocity Index
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">
                    Optimized Trendline
                  </span>
                </div>

                {/* SVG Trendline Graphic */}
                <div className="w-full h-28 relative">
                  <svg
                    viewBox="0 0 320 100"
                    className="w-full h-full overflow-visible"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="growthGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="100"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area under curve */}
                    <path
                      d="M 10 80 Q 80 75, 120 55 T 220 30 T 310 12 L 310 95 L 10 95 Z"
                      fill="url(#growthGradient)"
                    />

                    {/* Dashed baseline */}
                    <line
                      x1="10"
                      y1="85"
                      x2="310"
                      y2="85"
                      stroke="#334155"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />

                    {/* Trend curve */}
                    <path
                      d="M 10 80 Q 80 75, 120 55 T 220 30 T 310 12"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Target End Point Node */}
                    <circle cx="310" cy="12" r="5" fill="#10B981" />
                    <circle
                      cx="310"
                      cy="12"
                      r="9"
                      stroke="#10B981"
                      strokeWidth="1.5"
                      opacity="0.5"
                    />
                  </svg>
                </div>

                {/* Funnel Stage Badges */}
                <div className="grid grid-cols-4 gap-1 text-center pt-1 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Attribution
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Acquisition
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Conversion
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Retention
                  </span>
                </div>
              </div>

              {/* Featured Case Study Quick Link if available */}
              {featuredProject && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 truncate max-w-[200px]">
                    Featured: <strong className="text-white">{featuredProject.title}</strong>
                  </span>
                  <a
                    href="#projects"
                    onClick={(e) => scrollToSection(e, "#projects")}
                    className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                  >
                    Inspect <ArrowUpRight size={13} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
