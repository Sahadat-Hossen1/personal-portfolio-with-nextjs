"use client";

import Link from "next/link";
import { TrendingUp, ArrowUp, Lock } from "lucide-react";
import type { ProfileData } from "@/types/portfolio";

interface MarketingFooterProps {
  profile: ProfileData;
}

export default function MarketingFooter({ profile }: MarketingFooterProps) {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 border-t border-slate-900 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand Info */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp size={14} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="font-bold text-white tracking-tight">
              {profile?.name || "Growth Marketing"}
            </div>
            <div className="text-[11px] text-slate-500">
              Data-Informed Performance &amp; Advisory
            </div>
          </div>
        </div>

        {/* Confidentiality & Legal Notice */}
        <div className="text-center text-slate-500 max-w-md">
          &copy; {currentYear} {profile?.name || "Growth Strategist"}. All strategic methodologies and campaign assets protected.
        </div>

        {/* Action links */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Lock size={12} />
            <span>Portal</span>
          </Link>

          <button
            onClick={scrollToTop}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
