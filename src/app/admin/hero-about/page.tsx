"use client";

import { useEffect, useState } from "react";
import {
  User,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  Briefcase,
  FileText,
} from "lucide-react";

interface StatItem {
  iconName: string;
  value: string;
  label: string;
}

interface HighlightItem {
  emoji: string;
  text: string;
}

export default function HeroAboutAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [name, setName] = useState("");
  const [bioBlurb, setBioBlurb] = useState("");
  const [statusText, setStatusText] = useState("");
  const [statusAvailable, setStatusAvailable] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [newRoleInput, setNewRoleInput] = useState("");

  const [aboutTitle, setAboutTitle] = useState("");
  const [currentlyBuilding, setCurrentlyBuilding] = useState("");
  const [aboutP1, setAboutP1] = useState("");
  const [aboutP2, setAboutP2] = useState("");

  const [stats, setStats] = useState<StatItem[]>([]);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [newHighlightEmoji, setNewHighlightEmoji] = useState("⚡");
  const [newHighlightText, setNewHighlightText] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success && data.data) {
        const p = data.data;
        setName(p.name || "");
        setBioBlurb(p.bioBlurb || "");
        setStatusText(p.statusText || "");
        setStatusAvailable(p.statusAvailable ?? true);
        setAvatarUrl(p.avatarUrl || "");
        setCvUrl(p.cvUrl || "");
        setRoles(p.roles || []);

        setAboutTitle(p.aboutTitle || "");
        setCurrentlyBuilding(p.currentlyBuilding || "");
        setAboutP1(p.aboutP1 || "");
        setAboutP2(p.aboutP2 || "");

        setStats(
          p.stats?.length
            ? p.stats
            : [
                { iconName: "Briefcase", value: "1+", label: "Years of Experience" },
                { iconName: "Star", value: "10+", label: "Projects Delivered" },
                { iconName: "Coffee", value: "1k+", label: "Cups of Coffee" },
                { iconName: "MapPin", value: "Remote", label: "Work Style" },
              ]
        );

        setHighlights(
          p.highlights?.length
            ? p.highlights
            : [
                { emoji: "⚡", text: "Building real-time apps with Node.js & WebSocket" },
                { emoji: "🌐", text: "RESTful API design and development" },
                { emoji: "🚀", text: "CI/CD pipelines with GitHub Actions & Docker" },
                { emoji: "🎨", text: "Pixel-perfect UIs with React & Next.js" },
              ]
        );
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleInput.trim()) return;
    setRoles([...roles, newRoleInput.trim()]);
    setNewRoleInput("");
  };

  const handleRemoveRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleStatChange = (index: number, field: keyof StatItem, val: string) => {
    const updated = [...stats];
    updated[index] = { ...updated[index], [field]: val };
    setStats(updated);
  };

  const handleAddHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHighlightText.trim()) return;
    setHighlights([
      ...highlights,
      { emoji: newHighlightEmoji.trim() || "⚡", text: newHighlightText.trim() },
    ]);
    setNewHighlightText("");
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    const payload = {
      name,
      bioBlurb,
      statusText,
      statusAvailable,
      avatarUrl,
      cvUrl,
      roles,
      aboutTitle,
      currentlyBuilding,
      aboutP1,
      aboutP2,
      stats,
      highlights,
    };

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Save failed");
      }
      setMessage({ type: "success", text: "Hero & About details saved successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl glass border border-border bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all";

  if (loading) {
    return (
      <div className="py-24 flex justify-center text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <User size={14} /> Profile & Intro Content
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Hero & <span className="gradient-text">About Section</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure your introductory bio blurb, typewriter role headlines, about paragraphs, and stat counters.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <a
            href="/#about"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl glass border border-border text-xs font-semibold text-foreground flex items-center gap-1.5 hover:bg-muted transition-colors"
          >
            <Eye size={15} />
            <span>Preview Site</span>
          </a>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Message alert */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Hero Intro */}
        <div className="glass rounded-3xl p-6 border border-border space-y-5">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <Sparkles size={16} className="text-indigo-400" />
            1. Hero Header & Headline Content
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Full Display Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Sahadat Hossen"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Avatar Photo Path / URL
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className={inputClass}
                placeholder="/profile.jpg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Hero Bio Blurb (Short summary under typewriter)
            </label>
            <textarea
              rows={2}
              value={bioBlurb}
              onChange={(e) => setBioBlurb(e.target.value)}
              className={inputClass}
              placeholder="I build scalable, performant web applications..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                CV / Resume Download Link
              </label>
              <input
                type="text"
                value={cvUrl}
                onChange={(e) => setCvUrl(e.target.value)}
                className={inputClass}
                placeholder="/resume.pdf"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Availability Badge Text
              </label>
              <input
                type="text"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                className={inputClass}
                placeholder="Available for new opportunities"
              />
            </div>
          </div>

          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={statusAvailable}
                onChange={(e) => setStatusAvailable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="ml-3 text-xs font-semibold text-muted-foreground">
                Display &quot;Available for opportunities&quot; green pulse indicator
              </span>
            </label>
          </div>

          {/* Typewriter Roles List */}
          <div className="pt-3 border-t border-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Typewriter Animated Roles / Headlines
                </label>
                <p className="text-[11px] text-muted-foreground">
                  These cycle automatically on your hero banner typewriter effect.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRoleInput}
                  onChange={(e) => setNewRoleInput(e.target.value)}
                  placeholder="e.g. Next.js Architect"
                  className="px-3 py-1.5 rounded-xl glass border border-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/60"
                />
                <button
                  type="button"
                  onClick={handleAddRole}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {roles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium glass border border-border text-foreground flex items-center gap-2 group hover:border-indigo-500/40"
                >
                  <span>{role}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(idx)}
                    className="text-muted-foreground hover:text-rose-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: About Me Content */}
        <div className="glass rounded-3xl p-6 border border-border space-y-5">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <FileText size={16} className="text-indigo-400" />
            2. About Section Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Section Heading / Title
              </label>
              <input
                type="text"
                value={aboutTitle}
                onChange={(e) => setAboutTitle(e.target.value)}
                className={inputClass}
                placeholder="Crafting digital experiences"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                &quot;Currently Building&quot; Status Pill
              </label>
              <input
                type="text"
                value={currentlyBuilding}
                onChange={(e) => setCurrentlyBuilding(e.target.value)}
                className={inputClass}
                placeholder="SaaS Dashboard App"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              About Paragraph 1 (Background & core technical stack)
            </label>
            <textarea
              rows={3}
              value={aboutP1}
              onChange={(e) => setAboutP1(e.target.value)}
              className={inputClass}
              placeholder="I'm a full-stack developer with..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              About Paragraph 2 (Analytics, tracking, problem-solving passion)
            </label>
            <textarea
              rows={3}
              value={aboutP2}
              onChange={(e) => setAboutP2(e.target.value)}
              className={inputClass}
              placeholder="Beyond code, I specialize in web analytics..."
            />
          </div>
        </div>

        {/* Section 3: Metric Stat Cards */}
        <div className="glass rounded-3xl p-6 border border-border space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Briefcase size={16} className="text-emerald-500 dark:text-emerald-400" />
              3. About Stats Grid (4 Metric Cards)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cards displayed next to your photo in the About section.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((st, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl glass border border-border space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Card #{idx + 1}</span>
                  <span className="font-mono text-[11px] text-indigo-400">
                    {st.iconName}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground mb-1">
                    Value Display
                  </label>
                  <input
                    type="text"
                    value={st.value}
                    onChange={(e) => handleStatChange(idx, "value", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass border border-border text-xs font-bold text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground mb-1">
                    Label Description
                  </label>
                  <input
                    type="text"
                    value={st.label}
                    onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass border border-border text-xs text-muted-foreground"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Highlights Checklist */}
        <div className="glass rounded-3xl p-6 border border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                4. Key Technical Highlights
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Bullet highlights with emojis shown under the about paragraphs.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newHighlightEmoji}
                onChange={(e) => setNewHighlightEmoji(e.target.value)}
                placeholder="⚡"
                className="w-12 px-2 py-1.5 rounded-xl glass border border-border text-xs text-center text-foreground"
              />
              <input
                type="text"
                value={newHighlightText}
                onChange={(e) => setNewHighlightText(e.target.value)}
                placeholder="Building real-time apps..."
                className="px-3 py-1.5 rounded-xl glass border border-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/60"
              />
              <button
                type="button"
                onClick={handleAddHighlight}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} /> Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {highlights.map((hl, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl glass border border-border flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base">{hl.emoji}</span>
                  <span className="text-xs text-foreground font-medium truncate">
                    {hl.text}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveHighlight(idx)}
                  className="p-1 rounded-md text-muted-foreground hover:text-rose-400 transition-colors flex-shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
