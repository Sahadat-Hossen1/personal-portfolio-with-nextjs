"use client";

import React from "react";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { useEntitlements } from "./EntitlementsContext";
import { UserPlan } from "@/models/User";

interface PlanBadgeProps {
  plan?: UserPlan;
  size?: "sm" | "md";
  showUpgradeButton?: boolean;
}

export default function PlanBadge({
  plan: explicitPlan,
  size = "md",
  showUpgradeButton = false,
}: PlanBadgeProps) {
  const { plan: contextPlan, openUpgradeModal } = useEntitlements();
  const currentPlan = explicitPlan || contextPlan;

  const isPremium = currentPlan === "premium";

  if (isPremium) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 border-indigo-500/30 text-indigo-400 dark:text-indigo-300 shadow-sm ${
          size === "sm"
            ? "px-2 py-0.5 text-[10px]"
            : "px-2.5 py-1 text-xs"
        }`}
      >
        <Sparkles size={size === "sm" ? 11 : 13} className="text-purple-400" />
        <span>Premium Tier</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 font-semibold uppercase tracking-wider rounded-full border bg-muted/60 border-border text-muted-foreground ${
          size === "sm"
            ? "px-2 py-0.5 text-[10px]"
            : "px-2.5 py-1 text-xs"
        }`}
      >
        <span>Free Tier</span>
      </span>

      {showUpgradeButton && (
        <button
          type="button"
          onClick={() => openUpgradeModal()}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
        >
          <span>Upgrade</span>
          <ArrowUpRight size={12} />
        </button>
      )}
    </div>
  );
}
