"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  BarChart3,
  ShieldCheck,
  FolderGit2,
  ArrowUpRight,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  RotateCw,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface PlatformSummaryData {
  users: {
    total: number;
    superadmins: number;
    normalUsers: number;
    byPlan: Record<string, number>;
    byProfession: Record<string, number>;
  };
  templates: {
    adoption: Record<string, number>;
  };
  content: {
    profiles: number;
    publicPortfolios: number;
    projects: number;
    skills: number;
    experiences: number;
    messages: number;
  };
  recentUsers: Array<{
    _id: string;
    name: string;
    username: string;
    email: string;
    profession: string;
    plan: string;
    createdAt: string;
  }>;
}

export default function AdminExecutiveDashboardPage() {
  const [data, setData] = useState<PlatformSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleRefresh = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to load platform overview");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to platform administration"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.success && json.data) {
          setData(json.data);
        } else if (!ignore) {
          setError(json.error || "Failed to load platform overview");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to connect to platform administration"
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (loading && !data) {
    return (
      <div className="py-24 text-center text-muted-foreground animate-fade-in">
        <Loader2 size={32} className="animate-spin mx-auto text-indigo-400 mb-3" />
        <span className="text-sm font-medium">
          Loading platform executive dashboard...
        </span>
      </div>
    );
  }

  const totalTenants = data?.users.total || 0;
  const freeTenants = data?.users.byPlan?.free || 0;
  const premiumTenants = data?.users.byPlan?.premium || 0;
  const totalPortfolios = data?.content.publicPortfolios || 0;
  const totalContent =
    (data?.content.projects || 0) +
    (data?.content.skills || 0) +
    (data?.content.experiences || 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Executive Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-card via-card to-indigo-950/20 border border-border shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <ShieldCheck size={14} />
              <span>Platform Executive Control Plane</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              SaaS Administration Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
              Central executive center for supervising multi-tenant platform health,
              managing tenant accounts, configuring entitlements, and tracking adoption.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <RotateCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>

            <Link
              href="/admin/users"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <span>Manage Tenants</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Tenants */}
        <Link
          href="/admin/users"
          className="group p-5 rounded-2xl bg-card border border-border hover:border-indigo-500/40 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Tenants
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-foreground">{totalTenants}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>{premiumTenants} Premium · {freeTenants} Free</span>
              <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity text-[11px]">
                Users →
              </span>
            </p>
          </div>
        </Link>

        {/* Public Portfolios */}
        <Link
          href="/admin/stats"
          className="group p-5 rounded-2xl bg-card border border-border hover:border-emerald-500/40 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Portfolios
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-foreground">
              {totalPortfolios}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>Published /p/[slug] sites</span>
              <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity text-[11px]">
                Stats →
              </span>
            </p>
          </div>
        </Link>

        {/* Content Items */}
        <Link
          href="/admin/stats"
          className="group p-5 rounded-2xl bg-card border border-border hover:border-purple-500/40 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Showcase Content
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderGit2 size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-foreground">{totalContent}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>Projects, skills, milestones</span>
              <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity text-[11px]">
                Details →
              </span>
            </p>
          </div>
        </Link>

        {/* Platform Inquiries */}
        <Link
          href="/admin/stats"
          className="group p-5 rounded-2xl bg-card border border-border hover:border-cyan-500/40 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Client Inquiries
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-foreground">
              {data?.content.messages || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>Across all tenants</span>
              <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity text-[11px]">
                Analytics →
              </span>
            </p>
          </div>
        </Link>
      </div>

      {/* Control Plane Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tenant Users Management */}
        <div className="p-6 rounded-3xl bg-card border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
              <Users size={20} />
            </div>
            <h2 className="text-base font-bold text-foreground">Tenant Directory</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Supervise tenant users, manage plan tiers (Free vs Premium), configure
              allowed templates, toggle individual feature overrides, and enact account
              suspensions.
            </p>
          </div>
          <Link
            href="/admin/users"
            className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl border border-border hover:border-indigo-500/40 bg-muted/30 hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer"
          >
            <span>Open User Management</span>
            <ArrowUpRight size={14} className="text-indigo-400" />
          </Link>
        </div>

        {/* Platform Analytics */}
        <div className="p-6 rounded-3xl bg-card border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <BarChart3 size={20} />
            </div>
            <h2 className="text-base font-bold text-foreground">Platform Analytics</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Inspect platform adoption metrics, template popularity distributions,
              profession breakdowns, and content generation rates across the ecosystem.
            </p>
          </div>
          <Link
            href="/admin/stats"
            className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl border border-border hover:border-emerald-500/40 bg-muted/30 hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer"
          >
            <span>Open Analytics Center</span>
            <ArrowUpRight size={14} className="text-emerald-400" />
          </Link>
        </div>

        {/* Personal Portfolio Management */}
        <div className="p-6 rounded-3xl bg-card border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
              <LayoutDashboard size={20} />
            </div>
            <h2 className="text-base font-bold text-foreground">
              My Portfolio Dashboard
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Manage your personal portfolio content, showcase projects, update skills,
              and select your active public presentation template using the tenant dashboard.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl border border-border hover:border-purple-500/40 bg-muted/30 hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer"
          >
            <span>Go to Portfolio Dashboard</span>
            <ArrowUpRight size={14} className="text-purple-400" />
          </Link>
        </div>
      </div>

      {/* Recent Platform Tenants */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <h3 className="font-bold text-sm text-foreground">
              Recent Tenant Registrations
            </h3>
          </div>
          <Link
            href="/admin/users"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            View all tenants →
          </Link>
        </div>

        {data?.recentUsers && data.recentUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border/60">
                  <th className="pb-2.5 font-semibold">User</th>
                  <th className="pb-2.5 font-semibold">Username</th>
                  <th className="pb-2.5 font-semibold">Profession</th>
                  <th className="pb-2.5 font-semibold">Plan</th>
                  <th className="pb-2.5 font-semibold text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {data.recentUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium text-foreground">
                      {user.name}
                    </td>
                    <td className="py-3 font-mono text-indigo-400">
                      @{user.username}
                    </td>
                    <td className="py-3 capitalize text-muted-foreground">
                      {user.profession.replace("-", " ")}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          user.plan === "premium"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {user.plan}
                      </span>
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No tenant registrations recorded yet.
          </p>
        )}
      </div>
    </div>
  );
}
