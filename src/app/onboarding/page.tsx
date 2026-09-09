"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  FileText,
  Activity,
  ArrowRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export default function OnboardingPage() {
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    username: string;
    profession: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    bioBlurb: "",
    location: "",
    statusText: "Available for opportunities",
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!res.ok || !data.authenticated || !data.user) {
          router.push("/login");
          return;
        }
        setUser(data.user);
      } catch {
        router.push("/login");
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Reuses the existing /api/profile architecture.
      // Client strictly NEVER provides ownerId, userId, role, plan, or allowedTemplates.
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bioBlurb: formData.bioBlurb.trim(),
          location: formData.location.trim(),
          statusText: formData.statusText.trim(),
        }),
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
    router.refresh();
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background text-foreground">
      {/* Background radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle, #818cf8, #a855f7, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Top Bar Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ModeToggle />
      </div>

      <div className="relative z-10 w-full max-w-lg my-8 animate-fade-in">
        <div className="rounded-3xl p-8 border border-border bg-card/90 shadow-2xl backdrop-blur-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/25 mb-4">
              <Sparkles size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Welcome, <span className="gradient-text">{user?.name}</span>!
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5">
              Your tenant portfolio has been provisioned. Let&apos;s personalize your basic details.
            </p>
          </div>

          {/* Provisioned Link Card */}
          {user?.username && (
            <div className="mb-6 p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                  Your Public Portfolio URL
                </span>
                <span className="text-xs font-mono text-indigo-400 truncate block mt-0.5">
                  /p/{user.username}
                </span>
              </div>
              <Link
                href={`/p/${user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-2 rounded-xl bg-card border border-border hover:border-indigo-500/50 text-foreground transition-colors"
                title="Preview Portfolio"
              >
                <ExternalLink size={15} />
              </Link>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Short Bio / Headline (bioBlurb)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none text-muted-foreground">
                  <FileText size={16} />
                </div>
                <textarea
                  rows={3}
                  value={formData.bioBlurb}
                  onChange={(e) => setFormData({ ...formData, bioBlurb: e.target.value })}
                  placeholder="e.g. Building robust web systems and scalable digital products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <MapPin size={16} />
                </div>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full pl-10 pr-2.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Availability Status (statusText)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Activity size={16} />
                </div>
                <input
                  type="text"
                  value={formData.statusText}
                  onChange={(e) => setFormData({ ...formData, statusText: e.target.value })}
                  placeholder="e.g. Available for opportunities"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Setup & Go to Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={saving}
                className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Skip for now &rarr;
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
