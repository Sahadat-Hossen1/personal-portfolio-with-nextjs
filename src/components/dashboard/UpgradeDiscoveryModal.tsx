"use client";

import React, { useEffect } from "react";
import {
  Sparkles,
  X,
  Lock,
  Check,
  MessageSquare,
  Sliders,
  TrendingUp,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { FeatureKey, FeatureDefinition } from "@/lib/entitlements/features";
import { UserPlan } from "@/models/User";

interface UpgradeDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: UserPlan;
  targetFeatureKey?: FeatureKey | null;
  features?: FeatureDefinition[];
}

export default function UpgradeDiscoveryModal({
  isOpen,
  onClose,
  currentPlan,
  targetFeatureKey,
  features = [],
}: UpgradeDiscoveryModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const targetFeature = features.find((f) => f.key === targetFeatureKey);

  const premiumFeatures = [
    {
      key: "floating_chat" as FeatureKey,
      name: "Interactive Floating Chat Widget",
      description:
        "Enable WhatsApp and Messenger floating quick-contact triggers on your live portfolio.",
      icon: MessageSquare,
    },
    {
      key: "custom_sections" as FeatureKey,
      name: "Section Visibility Customization",
      description:
        "Freely show, hide, or customize any portfolio section (Hero, About, Skills, Projects, Experience, Contact).",
      icon: Sliders,
    },
    {
      key: "advanced_seo" as FeatureKey,
      name: "Advanced SEO & Social Sharing",
      description:
        "Custom OpenGraph preview cards, priority search indexing, and rich social media metadata.",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Gradient Banner */}
        <div className="relative p-6 sm:p-7 bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-transparent border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles size={13} />
            <span>PortfolioOS Plan Capability</span>
          </div>

          <h2
            id="upgrade-modal-title"
            className="text-xl sm:text-2xl font-black text-foreground tracking-tight"
          >
            {targetFeature
              ? `Unlock ${targetFeature.name}`
              : "Explore PortfolioOS Premium"}
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {targetFeature
              ? targetFeature.description
              : "Upgrade your account to unlock advanced communication, customization, and growth capabilities."}
          </p>

          {/* Current Plan Indicator */}
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Your Current Plan:</span>
            <span className="font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-full bg-muted border border-border text-foreground">
              {currentPlan} Tier
            </span>
          </div>
        </div>

        {/* Target Feature Highlight (if triggered by a specific locked feature) */}
        {targetFeature && (
          <div className="p-4 mx-6 mt-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Lock size={16} />
            </div>
            <div className="text-xs">
              <div className="font-bold text-amber-300">
                Premium Feature Gated
              </div>
              <p className="text-muted-foreground mt-0.5">
                The control you selected requires the{" "}
                <strong className="text-foreground">Premium</strong> plan. On
                the Free tier, this capability is disabled.
              </p>
            </div>
          </div>
        )}

        {/* Premium Capabilities Catalog */}
        <div className="p-6 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Premium Platform Capabilities
          </div>

          {premiumFeatures.map((feat) => {
            const isTarget = feat.key === targetFeatureKey;
            const Icon = feat.icon;
            return (
              <div
                key={feat.key}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isTarget
                    ? "bg-indigo-500/10 border-indigo-500/40 shadow-sm"
                    : "bg-muted/20 border-border/70"
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isTarget
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground truncate">
                      {feat.name}
                    </span>
                    {isTarget && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
                <div className="shrink-0 text-emerald-400 mt-1">
                  <Check size={16} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Honest Commercial Status Disclaimer */}
        <div className="px-6 pb-2">
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground block mb-0.5">
                Plan Provisioning Information
              </span>
              Automated self-service billing is currently in development. To
              activate Premium capabilities or request plan upgrades, contact the
              platform administrator.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border bg-muted/10 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Close
          </button>

          <a
            href="mailto:support@portfolioos.com?subject=PortfolioOS%20Plan%20Upgrade%20Request&body=Hello%20Admin,%0D%0A%0D%0AI%20would%20like%20to%20request%20an%20upgrade%20to%20the%20Premium%20plan%20for%20my%20account.%0D%0A%0D%0AThank%20you!"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Mail size={14} />
            <span>Request Upgrade from Admin</span>
          </a>
        </div>
      </div>
    </div>
  );
}
