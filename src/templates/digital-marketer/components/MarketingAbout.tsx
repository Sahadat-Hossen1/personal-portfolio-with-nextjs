"use client";

import Image from "next/image";
import { Compass, Target, BarChart2, Repeat, MapPin, Clock } from "lucide-react";
import type { ProfileData } from "@/types/portfolio";

interface MarketingAboutProps {
  profile: ProfileData;
}

const methodologyPillars = [
  {
    icon: Target,
    title: "Hypothesis-Driven Design",
    description:
      "Every campaign starts with an unambiguous, measurable hypothesis grounded in consumer psychology and historical attribution data.",
  },
  {
    icon: BarChart2,
    title: "Full-Funnel Architecture",
    description:
      "Unifying paid acquisition, organic touchpoints, on-site conversion paths, and post-purchase retention into a cohesive ecosystem.",
  },
  {
    icon: Compass,
    title: "Unit Economics Alignment",
    description:
      "Ensuring marketing efficiency scales with lifetime value (LTV) and contribution margin rather than chasing vanity volume metrics.",
  },
  {
    icon: Repeat,
    title: "Rapid Experimentation Cadence",
    description:
      "Systematic A/B and multivariate testing on ad creatives, value propositions, and landing page funnels to accelerate learning velocity.",
  },
];

export default function MarketingAbout({ profile }: MarketingAboutProps) {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Compass size={13} />
            <span>GROWTH PHILOSOPHY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Data-Informed Strategic Vision
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Sustainable growth is engineered through rigorous data discipline, deep channel literacy, and relentless funnel optimization.
          </p>
        </div>

        {/* Profile Card & Narrative Grid */}
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Executive Portrait & Status */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl shadow-emerald-950/20 space-y-6">
              {profile.avatarUrl && (
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                </div>
              )}

              <div className="space-y-3 text-center sm:text-left">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {profile.name}
                  </h3>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Growth Partner
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {profile.roles?.[0] || "Growth Marketing Strategist"}
                </p>

                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-emerald-400" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.statusText && (
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-emerald-400" />
                      <span>{profile.statusText}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Core Narrative & Pillars */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {profile.aboutTitle || "Architecting Measurable Growth"}
              </h3>
              <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-3">
                <p>
                  {profile.aboutP1 ||
                    profile.bioBlurb ||
                    "Marketing is not guesswork. It is a systematic process of identifying high-leverage growth channels, testing creative and messaging variations, and scaling winning initiatives with strict fiscal discipline."}
                </p>
                {profile.aboutP2 && <p>{profile.aboutP2}</p>}
              </div>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {methodologyPillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-emerald-400">
                      <Icon size={18} />
                      <h4 className="text-sm font-bold text-white">
                        {pillar.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
