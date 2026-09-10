"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Video,
  TrendingUp,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Layers,
} from "lucide-react";
import { TEMPLATE_DEMO_FIXTURES, TemplateDemoFixture } from "./demoData";

const TEMPLATE_TABS = [
  { id: "developer" as const, label: "Software Developer", icon: Code2 },
  { id: "video-editor" as const, label: "Video Editor", icon: Video },
  { id: "digital-marketer" as const, label: "Digital Marketer", icon: TrendingUp },
  { id: "doctor" as const, label: "Medical Doctor", icon: Stethoscope },
];

export default function TemplateShowcase() {
  const [activeTab, setActiveTab] = useState<
    "developer" | "video-editor" | "digital-marketer" | "doctor"
  >("developer");

  const activeFixture: TemplateDemoFixture = TEMPLATE_DEMO_FIXTURES[activeTab];

  return (
    <section id="templates" className="py-20 border-t border-border/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Layers size={13} />
            <span>DATA ≠ PRESENTATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Four Specialized <span className="gradient-text">Profession Themes</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Each profession has unique storytelling needs. Explore how PortfolioOS
            transforms the same clean portfolio data model into distinct, purpose-built
            presentation designs.
          </p>
        </div>

        {/* Tab Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {TEMPLATE_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-card text-foreground border border-indigo-500/50 shadow-lg shadow-indigo-500/10 scale-105"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-transparent"
                }`}
              >
                <TabIcon size={16} className={isActive ? "text-indigo-400" : ""} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Template Showcase Card */}
        <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden animate-fade-in">
          {/* Subtle Ambient Radial Glow */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-15 blur-3xl"
            style={{
              background:
                activeTab === "developer"
                  ? "radial-gradient(circle, #6366f1, transparent)"
                  : activeTab === "video-editor"
                  ? "radial-gradient(circle, #f43f5e, transparent)"
                  : activeTab === "digital-marketer"
                  ? "radial-gradient(circle, #10b981, transparent)"
                  : "radial-gradient(circle, #06b6d4, transparent)",
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Metadata & Features */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span
                  className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-3 ${activeFixture.badgeBg}`}
                >
                  {activeFixture.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-foreground">
                  {activeFixture.name}
                </h3>
                <p className="text-xs font-medium text-indigo-400 mt-1">
                  {activeFixture.tagline}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                  {activeFixture.description}
                </p>
              </div>

              {/* Layout Features Checklist */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Template Capabilities
                </span>
                {activeFixture.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-foreground">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Direct Pre-Selected Registration CTA */}
              <div className="pt-4">
                <Link
                  href={`/register?profession=${activeFixture.id}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                >
                  <span>Build with this {activeFixture.name} Template</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive Mock Preview Card (Purely static demo) */}
            <div className="lg:col-span-7">
              <div
                className={`rounded-2xl border p-5 sm:p-6 bg-gradient-to-br ${activeFixture.gradient} ${activeFixture.borderActive} shadow-xl relative overflow-hidden`}
              >
                {/* Mock Browser Header Bar */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/40 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                      demo-portfolio.preview/p/{activeFixture.id}-sample
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted/60">
                    Live Layout Preview
                  </span>
                </div>

                {/* Preview Card Inner Content */}
                <div className="space-y-4">
                  {/* Persona Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-foreground">
                          {activeFixture.demoProfile.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Published
                        </span>
                      </div>
                      <div className="text-xs text-indigo-400 font-medium">
                        {activeFixture.demoProfile.role}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                        <MapPin size={12} />
                        <span>{activeFixture.demoProfile.location}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {activeFixture.demoProfile.stats.map((s, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-card/60 border border-border text-center min-w-[64px]"
                        >
                          <div className="text-xs font-black text-foreground">{s.value}</div>
                          <div className="text-[9px] text-muted-foreground uppercase">
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bio Blurb */}
                  <p className="text-xs text-muted-foreground bg-card/40 p-3 rounded-xl border border-border/50 leading-relaxed">
                    &quot;{activeFixture.demoProfile.bio}&quot;
                  </p>

                  {/* Skill Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {activeFixture.demoProfile.skills.slice(0, 6).map((sk, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-muted/50 border border-border/60 text-[10px] font-medium text-muted-foreground"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* Showcase Works Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {activeFixture.demoProfile.sampleWorks.map((work, wIdx) => (
                      <div
                        key={wIdx}
                        className="p-3 rounded-xl bg-card/60 border border-border/60 space-y-1 hover:border-indigo-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-foreground">{work.title}</span>
                          <span className="font-mono text-indigo-400 font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10">
                            {work.metricOrTag}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">
                          {work.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
