"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Cpu,
  Briefcase,
  Mail,
  User,
  ExternalLink,
  RotateCw,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Database,
  Sparkles,
  AlertCircle,
  Loader2,
  Sliders,
} from "lucide-react";

interface DashboardStats {
  projects: number;
  skills: number;
  tags: number;
  experiences: number;
  messages: number;
  unreadMessages: number;
}

interface RecentMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    skills: 0,
    tags: 0,
    experiences: 0,
    messages: 0,
    unreadMessages: 0,
  });
  const [sections, setSections] = useState<{
    hero?: boolean;
    about?: boolean;
    skills?: boolean;
    projects?: boolean;
    experience?: boolean;
    contact?: boolean;
    floatingChat?: boolean;
  }>({
    hero: true,
    about: true,
    skills: true,
    projects: true,
    experience: true,
    contact: true,
    floatingChat: true,
  });
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, skillRes, expRes, msgRes, profileRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/skills"),
        fetch("/api/experiences"),
        fetch("/api/messages"),
        fetch("/api/profile"),
      ]);

      const projData = await projRes.json();
      const skillData = await skillRes.json();
      const expData = await expRes.json();
      const msgData = await msgRes.json();
      const profileData = await profileRes.json();

      setStats({
        projects: projData.data?.length || 0,
        skills: skillData.data?.skills?.length || 0,
        tags: skillData.data?.tags?.length || 0,
        experiences: expData.data?.length || 0,
        messages: msgData.data?.length || 0,
        unreadMessages: msgData.unreadCount || 0,
      });

      if (profileData.data?.sections) {
        setSections(profileData.data.sections);
      }

      if (msgData.data) {
        setRecentMessages(msgData.data.slice(0, 5));
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeed = async (force: boolean = false) => {
    setSeedLoading(true);
    setSeedMessage("");
    try {
      const res = await fetch(`/api/seed${force ? "?force=true" : ""}`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setSeedMessage("Database synced with portfolio defaults!");
        fetchData();
      } else {
        setSeedMessage(data.error || "Failed to seed database");
      }
    } catch {
      setSeedMessage("Error connecting to seed endpoint");
    } finally {
      setSeedLoading(false);
      setTimeout(() => setSeedMessage(""), 5000);
    }
  };

  const statCards = [
    {
      label: "Live Projects",
      value: stats.projects,
      sub: "Portfolio works",
      href: "/admin/projects",
      icon: FolderGit2,
      color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400",
    },
    {
      label: "Technical Skills",
      value: `${stats.skills} (${stats.tags} tags)`,
      sub: "Web dev & tracking",
      href: "/admin/skills",
      icon: Cpu,
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
    },
    {
      label: "Experience Items",
      value: stats.experiences,
      sub: "Work timeline",
      href: "/admin/experience",
      icon: Briefcase,
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
    },
    {
      label: "Inquiries & Messages",
      value: stats.messages,
      sub: `${stats.unreadMessages} unread`,
      href: "/admin/messages",
      icon: Mail,
      color: stats.unreadMessages > 0
        ? "from-rose-500/20 to-amber-500/20 border-rose-500/40 text-rose-400"
        : "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass rounded-3xl p-6 border border-border relative overflow-hidden">
        <div
          className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full pointer-events-none opacity-10"
          style={{ background: "radial-gradient(circle, #818cf8, #7c3aed)" }}
        />
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Sparkles size={14} /> Control Center Overview
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Welcome to your <span className="gradient-text">Portfolio Admin</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            Manage your hero intro, skills, project showcase, work experience, and review incoming contact messages in real-time.
          </p>
        </div>

        {/* Action button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleSeed(false)}
            disabled={seedLoading}
            title="Populate MongoDB with default portfolio data if empty"
            className="px-4 py-2.5 rounded-xl glass border border-border hover:border-indigo-500/50 text-xs font-semibold text-foreground flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            {seedLoading ? (
              <Loader2 size={14} className="animate-spin text-indigo-400" />
            ) : (
              <Database size={14} className="text-indigo-400" />
            )}
            <span>Sync Portfolio Data</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-xs font-semibold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
          >
            <span>Live Portfolio.</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* Seed alert notification */}
      {seedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{seedMessage}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className={`p-5 rounded-2xl glass border ${card.color} transition-all duration-300 hover:scale-[1.02] group flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-muted-foreground">
                  {card.label}
                </span>
                <div className="w-9 h-9 rounded-xl glass flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon size={18} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-foreground">
                  {loading ? "..." : card.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                  <span>{card.sub}</span>
                  <ArrowUpRight
                    size={13}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Quick Actions & Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick section editors */}
        <div className="glass rounded-3xl p-6 border border-border space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400" />
            Quick Section Nav
          </h2>
          <p className="text-xs text-muted-foreground">
            Direct shortcuts to customize each section of your portfolio:
          </p>

          <div className="space-y-2">
            <Link
              href="/admin/hero-about"
              className="flex items-center justify-between p-3.5 rounded-xl glass border border-border hover:border-border hover:bg-muted transition-all text-xs font-medium text-foreground group"
            >
              <div className="flex items-center gap-3">
                <User size={16} className="text-indigo-400" />
                <span>Hero & About Details</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    sections.hero !== false && sections.about !== false
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      sections.hero !== false && sections.about !== false ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                  {sections.hero !== false && sections.about !== false
                    ? "Live"
                    : sections.hero === false && sections.about === false
                    ? "Hidden"
                    : "Partial"}
                </span>
                <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-foreground" />
              </div>
            </Link>

            <Link
              href="/admin/projects"
              className="flex items-center justify-between p-3.5 rounded-xl glass border border-border hover:border-border hover:bg-muted transition-all text-xs font-medium text-foreground group"
            >
              <div className="flex items-center gap-3">
                <FolderGit2 size={16} className="text-blue-400" />
                <span>Projects & Case Studies</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    sections.projects !== false
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      sections.projects !== false ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                  {sections.projects !== false ? "Live" : "Hidden"}
                </span>
                <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-foreground" />
              </div>
            </Link>

            <Link
              href="/admin/skills"
              className="flex items-center justify-between p-3.5 rounded-xl glass border border-border hover:border-border hover:bg-muted transition-all text-xs font-medium text-foreground group"
            >
              <div className="flex items-center gap-3">
                <Cpu size={16} className="text-purple-400" />
                <span>Skills & Familiar Tags</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    sections.skills !== false
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      sections.skills !== false ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                  {sections.skills !== false ? "Live" : "Hidden"}
                </span>
                <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-foreground" />
              </div>
            </Link>

            <Link
              href="/admin/experience"
              className="flex items-center justify-between p-3.5 rounded-xl glass border border-border hover:border-border hover:bg-muted transition-all text-xs font-medium text-foreground group"
            >
              <div className="flex items-center gap-3">
                <Briefcase size={16} className="text-emerald-400" />
                <span>Experience Timeline</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    sections.experience !== false
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      sections.experience !== false ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                  {sections.experience !== false ? "Live" : "Hidden"}
                </span>
                <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-foreground" />
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center justify-between p-3.5 rounded-xl glass border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all text-xs font-medium text-foreground group"
            >
              <div className="flex items-center gap-3">
                <Sliders size={16} className="text-indigo-400" />
                <div>
                  <span className="font-semibold text-indigo-300">Section Visibility Manager</span>
                  <p className="text-[11px] text-muted-foreground">Toggle any section on / off</p>
                </div>
              </div>
              <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-foreground" />
            </Link>
          </div>
        </div>

        {/* Recent Inquiries feed */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Mail size={16} className="text-indigo-400" />
                Recent Contact Messages
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Inquiries submitted directly through your portfolio contact form
              </p>
            </div>
            <Link
              href="/admin/messages"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center text-muted-foreground">
              <Loader2 size={24} className="animate-spin text-indigo-400" />
            </div>
          ) : recentMessages.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-border p-6">
              <Mail size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">
                No contact messages yet. Submissions from the public form will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div
                  key={msg._id}
                  className={`p-4 rounded-2xl glass border transition-all ${
                    msg.read
                      ? "border-border bg-card/40"
                      : "border-indigo-500/30 bg-indigo-500/5 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="text-xs font-bold text-foreground">{msg.name}</span>
                      <span className="text-[11px] text-muted-foreground ml-2">
                        &lt;{msg.email}&gt;
                      </span>
                    </div>
                    {!msg.read && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        New
                      </span>
                    )}
                  </div>
                  {msg.subject && (
                    <div className="text-xs font-semibold text-indigo-300 mb-1">
                      {msg.subject}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
