"use client";

import Link from "next/link";
import { Film } from "lucide-react";
import type { ProfileData } from "@/types/portfolio";

interface VideoFooterProps {
  profile: ProfileData;
}

export default function VideoFooter({ profile }: VideoFooterProps) {
  const currentYear = new Date().getFullYear();
  const displayName = profile?.name || "Sahadat Hossen";

  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 py-12 px-4 relative">
      {/* Top Frame Line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-72 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.6), rgba(245, 158, 11, 0.6), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2 font-mono text-sm font-black tracking-wider uppercase text-white hover:text-red-400 transition-colors"
        >
          <Film size={16} className="text-red-500" />
          <span>{displayName} {"//"} EDITORIAL</span>
        </Link>

        {/* Timecode Watermark */}
        <div className="font-mono text-xs text-zinc-500 tracking-widest uppercase">
          FRAME RATE: 24.000 FPS // TC: 23:59:59:00
        </div>

        {/* Copyright & Admin Link */}
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
          <span>© {currentYear} ALL RIGHTS RESERVED</span>
          <span>•</span>
          <Link
            href="/admin"
            className="text-zinc-500 hover:text-red-400 transition-colors"
          >
            ADMIN PORTAL
          </Link>
        </div>
      </div>
    </footer>
  );
}
