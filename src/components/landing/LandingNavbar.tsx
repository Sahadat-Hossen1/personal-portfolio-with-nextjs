"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export interface LandingAuthState {
  isLoggedIn: boolean;
  isSuperadmin: boolean;
  isSuspended?: boolean;
  username?: string;
}

export default function LandingNavbar({
  authState,
}: {
  authState: LandingAuthState;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const showActiveDashboard = authState.isLoggedIn && !authState.isSuspended;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles size={19} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base tracking-tight text-foreground flex items-center gap-1">
              Portfolio<span className="gradient-text">OS</span>
            </span>
            <span className="text-[10px] text-muted-foreground tracking-wider uppercase font-semibold">
              SaaS Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <a
            href="#templates"
            className="px-3.5 py-2 rounded-xl hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            Templates
          </a>
          <a
            href="#features"
            className="px-3.5 py-2 rounded-xl hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="px-3.5 py-2 rounded-xl hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            Pricing & Plans
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          <ModeToggle />

          {showActiveDashboard ? (
            authState.isSuperadmin ? (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
              >
                <ShieldCheck size={15} />
                <span>Admin Center</span>
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
              >
                <LayoutDashboard size={15} />
                <span>My Dashboard</span>
              </Link>
            )
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
              >
                <span>Get Started Free</span>
                <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <ModeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden border-b border-border bg-card/95 backdrop-blur-xl p-4 space-y-3 animate-fade-in">
          <nav className="flex flex-col space-y-1">
            <a
              href="#templates"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Templates
            </a>
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Pricing & Plans
            </a>
          </nav>

          <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
            {showActiveDashboard ? (
              <Link
                href={authState.isSuperadmin ? "/admin" : "/dashboard"}
                onClick={() => setMobileOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-center text-xs font-semibold"
              >
                {authState.isSuperadmin ? "Admin Center" : "Go to Dashboard"}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2 px-4 rounded-xl text-center text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center text-xs font-semibold"
                >
                  Get Started Free &rarr;
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
