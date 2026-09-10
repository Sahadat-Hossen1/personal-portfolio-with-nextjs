import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Code2,
  Video,
  TrendingUp,
  Stethoscope,
} from "lucide-react";
import type { LandingAuthState } from "./LandingNavbar";

export default function LandingHero({
  authState,
}: {
  authState: LandingAuthState;
}) {
  const showActiveDashboard = authState.isLoggedIn && !authState.isSuspended;

  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[450px] rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, #818cf8 0%, #a855f7 40%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles size={14} className="text-indigo-400 animate-pulse" />
          <span>Multi-Tenant SaaS Portfolio Platform</span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span className="text-muted-foreground font-normal">Next-Gen Templates</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Build & Publish Your{" "}
          <span className="gradient-text">Profession-Tailored</span> Portfolio in
          Minutes.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Stop struggling with generic builders. PortfolioOS delivers customized
          presentation architectures designed specifically for Software Engineers, Video
          Editors, Digital Marketers, and Medical Doctors.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          {showActiveDashboard ? (
            <Link
              href={authState.isSuperadmin ? "/admin" : "/dashboard"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02]"
            >
              <span>{authState.isSuperadmin ? "Enter Admin Center" : "Open Your Dashboard"}</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02]"
              >
                <span>Create Your Free Portfolio</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-border bg-card/60 hover:bg-muted text-foreground font-semibold text-sm transition-all"
              >
                <span>Sign In to Existing Account</span>
              </Link>
            </>
          )}

          <a
            href="#templates"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Explore All 4 Templates &darr;</span>
          </a>
        </div>

        {/* Core Value Pillars Chips */}
        <div className="mt-12 pt-8 border-t border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Code2 size={16} className="text-indigo-400 shrink-0" />
            <span className="font-medium text-foreground">Developer</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Video size={16} className="text-rose-400 shrink-0" />
            <span className="font-medium text-foreground">Video Editor</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <TrendingUp size={16} className="text-emerald-400 shrink-0" />
            <span className="font-medium text-foreground">Digital Marketer</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Stethoscope size={16} className="text-cyan-400 shrink-0" />
            <span className="font-medium text-foreground">Medical Doctor</span>
          </div>
        </div>
      </div>
    </section>
  );
}
