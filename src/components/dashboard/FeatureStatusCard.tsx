"use client";

import React from "react";
import {
  Sparkles,
  Lock,
  Check,
  FolderGit2,
  Cpu,
  Briefcase,
  Mail,
  Sliders,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { useEntitlements } from "./EntitlementsContext";
import { FeatureKey } from "@/lib/entitlements/features";
import PlanBadge from "./PlanBadge";

const FEATURE_ICONS: Record<FeatureKey, React.ComponentType<{ size: number; className?: string }>> = {
  projects: FolderGit2,
  skills: Cpu,
  experience: Briefcase,
  messages: Mail,
  custom_sections: Sliders,
  floating_chat: MessageSquare,
  advanced_seo: TrendingUp,
};

export default function FeatureStatusCard() {
  const { plan, features, hasFeature, openUpgradeModal } = useEntitlements();

  const coreFeatures = features.filter((f) => f.isCore);
  const premiumFeatures = features.filter((f) => !f.isCore);

  return (
    <div className="p-6 rounded-3xl bg-card border border-border space-y-6">
      {/* Header & Plan Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <ShieldCheck size={18} />
            </div>
            <h2 className="font-bold text-base text-foreground tracking-tight">
              Account Plan & Feature Entitlements
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Platform capabilities available for your portfolio under your current plan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PlanBadge plan={plan} size="md" showUpgradeButton={plan !== "premium"} />
        </div>
      </div>

      {/* Core Features Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Core Portfolio Capabilities
          </span>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <Check size={13} />
            All Plans Included
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {coreFeatures.map((feat) => {
            const Icon = FEATURE_ICONS[feat.key] || FolderGit2;
            const isEnabled = hasFeature(feat.key);
            return (
              <div
                key={feat.key}
                className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {feat.name}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium Features Grid */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Premium Platform Additions
          </span>
          {plan !== "premium" && (
            <button
              onClick={() => openUpgradeModal()}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={12} />
              <span>Explore All Premium</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {premiumFeatures.map((feat) => {
            const Icon = FEATURE_ICONS[feat.key] || Sliders;
            const isEnabled = hasFeature(feat.key);

            return (
              <div
                key={feat.key}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isEnabled
                    ? "bg-indigo-500/5 border-indigo-500/30"
                    : "bg-muted/15 border-border/80 border-dashed"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isEnabled
                        ? "bg-indigo-500/20 text-indigo-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {feat.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                  {isEnabled ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check size={13} />
                      <span>Active on Account</span>
                    </span>
                  ) : (
                    <>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Lock size={12} className="text-amber-400" />
                        <span>Requires Premium</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => openUpgradeModal(feat.key)}
                        className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                      >
                        Unlock →
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
