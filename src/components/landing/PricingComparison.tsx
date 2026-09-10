import Link from "next/link";
import { Check, X, ArrowRight, Sparkles } from "lucide-react";
import {
  FEATURE_KEYS,
  FEATURE_DEFINITIONS,
} from "@/lib/entitlements/features";
import { PLAN_DEFAULT_ENTITLEMENTS } from "@/lib/entitlements/plans";

export default function PricingComparison() {
  const freeDefaults = PLAN_DEFAULT_ENTITLEMENTS.free;
  const premiumDefaults = PLAN_DEFAULT_ENTITLEMENTS.premium;

  return (
    <section id="pricing" className="py-20 border-t border-border/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles size={13} />
            <span>Transparent Plan Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Simple, Transparent <span className="gradient-text">Feature Tiers</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Get started for free or unlock complete customization with premium entitlements.
            No credit card required.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Free Tier Card */}
          <div className="p-8 rounded-3xl bg-card/70 border border-border flex flex-col justify-between relative shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 py-1 rounded-full bg-muted/60">
                  Starter
                </span>
              </div>
              <h3 className="text-2xl font-black text-foreground">Free Tier</h3>
              <p className="text-xs text-muted-foreground mt-2">
                Ideal for students, developers, and creators launching their initial public showcase.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-foreground">$0</span>
                <span className="text-xs text-muted-foreground">/ free forever</span>
              </div>

              {/* Core Feature Bullet Highlights */}
              <div className="mt-8 space-y-3 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Included Capabilities:
                </span>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>Personalized Public URL (/p/username)</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>Projects, Skills, & Career Showcase</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>Direct Client Inquiries & Dashboard Inbox</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>Instant Publication Control (Phase 17)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <Link
                href="/register"
                className="w-full py-3 px-4 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Create Free Account</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Premium Tier Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/30 via-card to-purple-950/20 border border-indigo-500/40 flex flex-col justify-between relative shadow-2xl shadow-indigo-500/10">
            {/* Featured Pill */}
            <div className="absolute -top-3 right-6">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full shadow-md">
                Full Power
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30">
                  Professional
                </span>
              </div>
              <h3 className="text-2xl font-black text-foreground">Premium Plan</h3>
              <p className="text-xs text-muted-foreground mt-2">
                For established freelancers and agency leaders who demand advanced customization and quick messaging.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black gradient-text">Pro</span>
                <span className="text-xs text-muted-foreground ml-1">/ full capability tier</span>
              </div>

              {/* Pro Feature Bullet Highlights */}
              <div className="mt-8 space-y-3 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                  Everything in Free, plus:
                </span>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Check size={16} className="text-indigo-400 shrink-0" />
                  <span className="font-medium">All 4 Profession Presentation Themes</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Check size={16} className="text-indigo-400 shrink-0" />
                  <span className="font-medium">Section Visibility Customization</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Check size={16} className="text-indigo-400 shrink-0" />
                  <span className="font-medium">Floating WhatsApp & Messenger Quick Chat</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Check size={16} className="text-indigo-400 shrink-0" />
                  <span className="font-medium">Priority Indexing & Enhanced SEO Cards</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/80">
              <Link
                href="/register"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <span>Get Started with Pro</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Feature Entitlements Comparison Table */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-card/50 overflow-hidden shadow-lg">
          <div className="p-5 border-b border-border bg-muted/20">
            <h4 className="text-sm font-bold text-foreground">
              Official Platform Entitlement Breakdown
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Derived directly from the platform&apos;s authoritative feature entitlement registry.
            </p>
          </div>

          <div className="divide-y divide-border/60 text-xs">
            {FEATURE_KEYS.map((key) => {
              const def = FEATURE_DEFINITIONS[key];
              const isFree = freeDefaults[key];
              const isPremium = premiumDefaults[key];

              return (
                <div
                  key={key}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <span>{def.name}</span>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50">
                        {def.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate sm:whitespace-normal">
                      {def.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-8 shrink-0">
                    <div className="w-16 text-center">
                      <span className="text-[10px] text-muted-foreground block mb-1 lg:hidden">
                        Free
                      </span>
                      {isFree ? (
                        <Check size={16} className="text-emerald-400 mx-auto" />
                      ) : (
                        <X size={15} className="text-muted-foreground/40 mx-auto" />
                      )}
                    </div>

                    <div className="w-16 text-center">
                      <span className="text-[10px] text-indigo-400 block mb-1 lg:hidden">
                        Pro
                      </span>
                      {isPremium ? (
                        <Check size={16} className="text-indigo-400 mx-auto font-bold" />
                      ) : (
                        <X size={15} className="text-muted-foreground/40 mx-auto" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
