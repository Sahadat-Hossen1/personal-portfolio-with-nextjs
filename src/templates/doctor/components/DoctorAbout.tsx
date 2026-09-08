"use client";

import {
  Briefcase,
  Star,
  Coffee,
  MapPin,
  Award,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import type { ProfileData } from "@/types/portfolio";

interface DoctorAboutProps {
  profile?: ProfileData;
}

export default function DoctorAbout({ profile }: DoctorAboutProps) {
  const aboutTitle = profile?.aboutTitle || "Professional Background & Approach";
  const aboutP1 = profile?.aboutP1 || "";
  const aboutP2 = profile?.aboutP2 || "";
  const currentlyBuilding = profile?.currentlyBuilding;
  const stats = profile?.stats || [];
  const highlights = profile?.highlights || [];

  const getStatIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case "star":
        return <Star size={20} className="text-amber-500" />;
      case "coffee":
        return <Coffee size={20} className="text-teal-500" />;
      case "mappin":
        return <MapPin size={20} className="text-rose-500" />;
      case "award":
        return <Award size={20} className="text-teal-500" />;
      case "briefcase":
      default:
        return <Briefcase size={20} className="text-teal-600 dark:text-teal-400" />;
    }
  };

  return (
    <section id="about" className="py-16 sm:py-24 bg-muted/30 border-y border-border/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>Professional Profile</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            {aboutTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Narrative & Current Focus */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
              {aboutP1 && (
                <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                  {aboutP1}
                </p>
              )}
              {aboutP2 && (
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {aboutP2}
                </p>
              )}

              {currentlyBuilding && (
                <div className="pt-4 border-t border-border/60 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Current Focus & Initiatives
                    </div>
                    <div className="text-sm font-bold text-foreground mt-0.5">
                      {currentlyBuilding}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Highlights List (Rendered dynamically from data) */}
            {highlights.length > 0 && (
              <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-teal-600 dark:text-teal-400" />
                  <span>Key Highlights & Credentials</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs sm:text-sm"
                    >
                      <span className="text-base flex-shrink-0">{item.emoji || "✦"}</span>
                      <span className="text-foreground font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Dynamic Statistics Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs hover:border-teal-500/40 hover:shadow-md transition-all duration-300 space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getStatIcon(stat.iconName)}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground leading-snug">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
