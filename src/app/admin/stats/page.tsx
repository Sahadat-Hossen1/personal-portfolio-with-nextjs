"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  UserCheck,
  Mail,
  FolderGit2,
  Layers,
  RotateCw,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface PlatformStatsData {
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

export default function AdminStatsPage() {
  const [data, setData] = useState<PlatformStatsData | null>(null);
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
        setError(json.error || "Failed to load platform stats.");
      }
    } catch (err) {
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
          setError(json.error || "Failed to load platform stats.");
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
        <span className="text-sm">Calculating platform analytics & statistics...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="py-24 text-center space-y-4 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">Failed to Load Platform Statistics</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">{error}</p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
        >
          <RotateCw size={14} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const totalUsers = data.users.total || 1;
  const freeCount = data.users.byPlan?.free || 0;
  const premiumCount = data.users.byPlan?.premium || 0;
  const freePct = Math.round((freeCount / totalUsers) * 100);
  const premiumPct = Math.round((premiumCount / totalUsers) * 100);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <BarChart3 size={22} />
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Platform Analytics & Statistics
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Aggregate insights across registered users, tenant portfolios, and template adoption.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="self-start sm:self-auto p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh Statistics"
        >
          <RotateCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Metric Cards Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase font-bold tracking-wider">Total Accounts</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-foreground">{data.users.total}</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.users.normalUsers} normal tenants, {data.users.superadmins} admins
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase font-bold tracking-wider">Public Portfolios</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-emerald-400">
              {data.content.publicPortfolios}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live indexed at /p/[username]
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase font-bold tracking-wider">Inquiries Received</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Mail size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-purple-400">
              {data.content.messages}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Client messages across all portfolios
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase font-bold tracking-wider">Showcased Projects</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <FolderGit2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-cyan-400">
              {data.content.projects}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Across all user portfolios
            </p>
          </div>
        </div>
      </div>

      {/* Plan Distribution & Profession Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
          <h2 className="text-base font-bold text-foreground">Subscription Plan Distribution</h2>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-foreground">Free Tier</span>
                <span className="text-muted-foreground">
                  {freeCount} users ({freePct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${freePct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-400">Premium Tier</span>
                <span className="text-muted-foreground">
                  {premiumCount} users ({premiumPct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${premiumPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Profession Breakdown */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
          <h2 className="text-base font-bold text-foreground">Users by Profession</h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {Object.entries(data.users.byProfession).map(([prof, count]) => {
              const profPct = Math.round((count / totalUsers) * 100);
              return (
                <div
                  key={prof}
                  className="p-3 rounded-2xl bg-muted/40 border border-border"
                >
                  <span className="capitalize font-bold text-foreground block">
                    {prof.replace(/-/g, " ")}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-black text-indigo-400">{count}</span>
                    <span className="text-[11px] text-muted-foreground">({profPct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Template Adoption & Platform Content Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Adoption */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-card border border-border space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Layers size={18} className="text-indigo-400" />
            <span>Active Template Adoption</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Current presentation templates selected across active tenant profiles.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(data.templates.adoption).map(([tmpl, count]) => (
              <div
                key={tmpl}
                className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-center"
              >
                <div className="text-2xl font-black text-indigo-400">{count}</div>
                <div className="capitalize font-semibold text-xs text-foreground mt-1">
                  {tmpl.replace(/-/g, " ")}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Active Portfolios</div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Content Totals */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
          <h2 className="text-base font-bold text-foreground">Content Totals</h2>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30">
              <span className="text-muted-foreground">Profiles Provisioned</span>
              <strong className="text-foreground">{data.content.profiles}</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30">
              <span className="text-muted-foreground">Technical Skills</span>
              <strong className="text-foreground">{data.content.skills}</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30">
              <span className="text-muted-foreground">Career Milestones</span>
              <strong className="text-foreground">{data.content.experiences}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Recent Registrations</h2>
            <p className="text-xs text-muted-foreground">
              Last 5 users who joined the SaaS platform.
            </p>
          </div>
          <Link
            href="/admin/users"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            View All Users →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">Profession</th>
                <th className="py-2.5 px-3">Plan</th>
                <th className="py-2.5 px-3 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.recentUsers.map((user) => (
                <tr key={user._id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-foreground">{user.name}</td>
                  <td className="py-2.5 px-3 font-mono text-indigo-400 text-[11px]">
                    /p/{user.username}
                  </td>
                  <td className="py-2.5 px-3 capitalize text-muted-foreground">
                    {user.profession.replace(/-/g, " ")}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`capitalize px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.plan === "premium"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.plan}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-muted-foreground text-[11px]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
