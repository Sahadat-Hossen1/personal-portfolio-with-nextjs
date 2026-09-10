import Link from "next/link";
import { ArrowRight, Sparkles, LayoutDashboard, ShieldCheck } from "lucide-react";
import type { LandingAuthState } from "./LandingNavbar";

export default function LandingCTA({
  authState,
}: {
  authState: LandingAuthState;
}) {
  const showActiveDashboard = authState.isLoggedIn && !authState.isSuspended;

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-indigo-950/40 via-card to-purple-950/30 border border-indigo-500/30 shadow-2xl relative overflow-hidden text-center">
          {/* Subtle Ambient Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, #818cf8 0%, #a855f7 50%, transparent 75%)",
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles size={13} />
              <span>Launch Your Showcase</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Ready to Publish Your <span className="gradient-text">Portfolio</span>?
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Join creators, developers, and practitioners worldwide. Set up your
              customized presentation, add your best work, and share your unique public link.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              {showActiveDashboard ? (
                <Link
                  href={authState.isSuperadmin ? "/admin" : "/dashboard"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
                >
                  {authState.isSuperadmin ? (
                    <>
                      <ShieldCheck size={16} />
                      <span>Enter Admin Center</span>
                    </>
                  ) : (
                    <>
                      <LayoutDashboard size={16} />
                      <span>Open Your Dashboard</span>
                    </>
                  )}
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-border bg-card/80 hover:bg-muted text-foreground text-xs font-semibold transition-all"
                  >
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
