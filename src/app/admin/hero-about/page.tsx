"use client";

import { useEffect, useState } from "react";
import {
  User,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  HelpCircle,
} from "lucide-react";

export default function HeroAboutAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    name: "",
    roles: [] as string[],
    bioBlurb: "",
    statusText: "",
    statusAvailable: true,
    avatarUrl: "",
    cvUrl: "",
    aboutTitle: "",
    aboutP1: "",
    aboutP2: "",
    currentlyBuilding: "",
    stats: [] as { iconName: string; value: string; label: string }[],
    highlights: [] as { emoji: string; text: string }[],
  });

  const [roleInput, setRoleInput] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success && data.data) {
        setForm({
          name: data.data.name || "",
          roles: data.data.roles || [],
          bioBlurb: data.data.bioBlurb || "",
          statusText: data.data.statusText || "",
          statusAvailable: data.data.statusAvailable ?? true,
          avatarUrl: data.data.avatarUrl || "/profile.jpg",
          cvUrl: data.data.cvUrl || "/resume.pdf",
          aboutTitle: data.data.aboutTitle || "",
          aboutP1: data.data.aboutP1 || "",
          aboutP2: data.data.aboutP2 || "",
          currentlyBuilding: data.data.currentlyBuilding || "",
          stats: data.data.stats || [],
          highlights: data.data.highlights || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = () => {
    if (!roleInput.trim()) return;
    if (!form.roles.includes(roleInput.trim())) {
      setForm({ ...form, roles: [...form.roles, roleInput.trim()] });
    }
    setRoleInput("");
  };

  const handleRemoveRole = (index: number) => {
    setForm({
      ...form,
      roles: form.roles.filter((_, i) => i !== index),
    });
  };

  const handleStatChange = (
    index: number,
    field: "value" | "label" | "iconName",
    val: string
  ) => {
    const nextStats = [...form.stats];
    nextStats[index] = { ...nextStats[index], [field]: val };
    setForm({ ...form, stats: nextStats });
  };

  const handleHighlightChange = (
    index: number,
    field: "emoji" | "text",
    val: string
  ) => {
    const nextHighs = [...form.highlights];
    nextHighs[index] = { ...nextHighs[index], [field]: val };
    setForm({ ...form, highlights: nextHighs });
  };

  const handleAddHighlight = () => {
    setForm({
      ...form,
      highlights: [...form.highlights, { emoji: "⚡", text: "New Highlight" }],
    });
  };

  const handleRemoveHighlight = (index: number) => {
    setForm({
      ...form,
      highlights: form.highlights.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile");
      }

      setMessage({
        type: "success",
        text: "Hero & About section updated successfully!",
      });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "An error occurred while saving",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl glass border border-white/10 bg-transparent text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all";

  if (loading) {
    return (
      <div className="py-24 flex justify-center text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <User size={14} /> Profile Personalization
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Hero & About <span className="gradient-text">Section Editor</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure your headlines, typewriter titles, bio story, availability status, and badges.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          <span>{saving ? "Saving Changes..." : "Save All Changes"}</span>
        </button>
      </div>

      {/* Status banner */}
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
        {/* Section 1: Hero Settings */}
        <div className="glass rounded-3xl p-6 border border-white/10 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Sparkles size={18} className="text-indigo-400" />
            1. Hero Section Setup
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="Sahadat Hossen"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Avatar Image Path / URL
              </label>
              <input
                type="text"
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                className={inputClass}
                placeholder="/profile.jpg"
              />
            </div>
          </div>

          {/* Typewriter Roles */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Typewriter Roles (Rotates animatedly on hero)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.roles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-medium glass border border-indigo-500/30 text-indigo-300 flex items-center gap-1.5"
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(idx)}
                    className="hover:text-rose-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRole();
                  }
                }}
                placeholder="Add role e.g. Full Stack Developer"
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleAddRole}
                className="px-3.5 py-2 rounded-xl glass border border-white/10 hover:border-indigo-500/50 text-xs font-semibold text-white flex items-center gap-1 hover:bg-white/5 transition-all cursor-pointer"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Bio blurb */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Hero Bio Blurb (Short tagline under headline)
            </label>
            <textarea
              rows={3}
              value={form.bioBlurb}
              onChange={(e) => setForm({ ...form, bioBlurb: e.target.value })}
              className={inputClass}
              placeholder="I build scalable, performant web applications..."
            />
          </div>

          {/* Status Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Availability Status Text
              </label>
              <input
                type="text"
                value={form.statusText}
                onChange={(e) => setForm({ ...form, statusText: e.target.value })}
                className={inputClass}
                placeholder="Available for new opportunities"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.statusAvailable}
                  onChange={(e) =>
                    setForm({ ...form, statusAvailable: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className="ml-3 text-xs font-semibold text-muted-foreground">
                  Show &quot;Available / Open for Work&quot; green indicator
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: About Story Settings */}
        <div className="glass rounded-3xl p-6 border border-white/10 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <User size={18} className="text-indigo-400" />
            2. About Section Story & Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                About Section Heading
              </label>
              <input
                type="text"
                value={form.aboutTitle}
                onChange={(e) =>
                  setForm({ ...form, aboutTitle: e.target.value })
                }
                className={inputClass}
                placeholder="Crafting digital experiences"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                &quot;Currently Building&quot; Floating Card Text
              </label>
              <input
                type="text"
                value={form.currentlyBuilding}
                onChange={(e) =>
                  setForm({ ...form, currentlyBuilding: e.target.value })
                }
                className={inputClass}
                placeholder="SaaS Dashboard App"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Bio Paragraph 1
            </label>
            <textarea
              rows={3}
              value={form.aboutP1}
              onChange={(e) => setForm({ ...form, aboutP1: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Bio Paragraph 2
            </label>
            <textarea
              rows={3}
              value={form.aboutP2}
              onChange={(e) => setForm({ ...form, aboutP2: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* Stats Cards */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <label className="block text-xs font-semibold text-white">
              About Stat Cards (Experience, Projects, Coffee, Work Style)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {form.stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl glass border border-white/10 space-y-2"
                >
                  <div className="text-[11px] font-mono text-indigo-400 font-semibold">
                    Stat #{idx + 1}
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Value</span>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => handleStatChange(idx, "value", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg glass border border-white/10 text-xs text-white"
                      placeholder="1+"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Label</span>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg glass border border-white/10 text-xs text-white"
                      placeholder="Years of Experience"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-white">
                Key Highlights (Bullet cards in About)
              </label>
              <button
                type="button"
                onClick={handleAddHighlight}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus size={14} /> Add Highlight
              </button>
            </div>

            <div className="space-y-2">
              {form.highlights.map((high, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl glass border border-white/10"
                >
                  <input
                    type="text"
                    value={high.emoji}
                    onChange={(e) =>
                      handleHighlightChange(idx, "emoji", e.target.value)
                    }
                    className="w-12 px-2 py-1.5 rounded-lg glass border border-white/10 text-xs text-center"
                    placeholder="⚡"
                  />
                  <input
                    type="text"
                    value={high.text}
                    onChange={(e) =>
                      handleHighlightChange(idx, "text", e.target.value)
                    }
                    className="flex-1 px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-white"
                    placeholder="Highlight description..."
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(idx)}
                    className="p-1.5 text-muted-foreground hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
