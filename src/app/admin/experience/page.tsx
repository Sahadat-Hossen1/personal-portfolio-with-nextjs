"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ListPlus,
} from "lucide-react";

interface ExperienceItem {
  _id?: string;
  role: string;
  company: string;
  companyUrl: string;
  location: string;
  period: string;
  type: string;
  bullets: string[];
  tags: string[];
  current: boolean;
  order: number;
}

const emptyExperience: ExperienceItem = {
  role: "",
  company: "",
  companyUrl: "https://example.com",
  location: "Dhaka, Bangladesh",
  period: "2026 – Present",
  type: "Full-time",
  bullets: ["Developed scalable web applications."],
  tags: ["React", "Node.js", "MongoDB"],
  current: true,
  order: 1,
};

export default function ExperienceAdminPage() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [form, setForm] = useState<ExperienceItem>(emptyExperience);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/experiences");
      const data = await res.json();
      if (data.success && data.data) {
        setExperiences(data.data);
      }
    } catch (err) {
      console.error("Fetch experiences error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleOpenCreate = () => {
    setEditingExp(null);
    setForm({
      ...emptyExperience,
      order: experiences.length + 1,
    });
    setTagsInput("React, Next.js, Node.js, MongoDB");
    setModalOpen(true);
  };

  const handleOpenEdit = (exp: ExperienceItem) => {
    setEditingExp(exp);
    setForm({ ...exp });
    setTagsInput(exp.tags ? exp.tags.join(", ") : "");
    setModalOpen(true);
  };

  const handleDelete = async (id: string, role: string) => {
    if (!confirm(`Delete experience entry for "${role}"?`)) return;
    try {
      const res = await fetch(`/api/experiences/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Experience deleted successfully" });
        fetchExperiences();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete" });
      }
    } catch {
      setMessage({ type: "error", text: "Error deleting experience" });
    }
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const handleAddBullet = () => {
    setForm({ ...form, bullets: [...form.bullets, ""] });
  };

  const handleBulletChange = (index: number, val: string) => {
    const nextBullets = [...form.bullets];
    nextBullets[index] = val;
    setForm({ ...form, bullets: nextBullets });
  };

  const handleRemoveBullet = (index: number) => {
    setForm({
      ...form,
      bullets: form.bullets.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      ...form,
      tags: tagsArray,
      bullets: form.bullets.filter((b) => b.trim().length > 0),
      order: Number(form.order) || 1,
    };

    try {
      let res;
      if (editingExp && editingExp._id) {
        res = await fetch(`/api/experiences/${editingExp._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/experiences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Save failed");
      }

      setMessage({
        type: "success",
        text: editingExp ? "Experience updated!" : "Experience added!",
      });
      setModalOpen(false);
      fetchExperiences();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to save experience",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 bg-transparent text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Briefcase size={14} /> Career Timeline
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Work <span className="gradient-text">Experience</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your employment history, roles, key accomplishments, and tech stack tags.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Experience</span>
        </button>
      </div>

      {/* Message */}
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

      {loading ? (
        <div className="py-24 flex justify-center text-muted-foreground">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
        </div>
      ) : experiences.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border border-white/10 space-y-3">
          <Briefcase size={40} className="mx-auto text-muted-foreground/40" />
          <h3 className="text-base font-bold text-white">No Experience Entries</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Your career timeline is empty. Add your first position or sync defaults from the dashboard.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp._id}
              className="glass rounded-3xl p-6 border border-white/10 space-y-4 transition-all hover:border-white/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white">{exp.role}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {exp.type}
                    </span>
                    {exp.current && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-4 flex-wrap">
                    <span className="font-semibold text-white/90">
                      {exp.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> {exp.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {exp.period}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenEdit(exp)}
                    className="p-2 rounded-xl glass border border-white/10 text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(exp._id!, exp.role)}
                    className="p-2 rounded-xl glass border border-white/10 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Bullets */}
              <ul className="space-y-1.5 text-xs text-muted-foreground pl-4 list-disc">
                {exp.bullets?.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>

              {/* Tech Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                {exp.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 border border-white/5 text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add/Edit Experience */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl glass rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <h2 className="text-lg font-bold text-white">
                {editingExp ? "Edit Experience Entry" : "Add New Experience"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Job Title / Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className={inputClass}
                    placeholder="Full-Stack Developer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className={inputClass}
                    placeholder="Inspire Soft"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className={inputClass}
                    placeholder="Dhaka, Bangladesh or Remote"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Time Period *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                    className={inputClass}
                    placeholder="May 2026 – Present"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Job Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 bg-[oklch(0.12_0.015_265)] text-sm text-white focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Company Website URL
                  </label>
                  <input
                    type="text"
                    value={form.companyUrl}
                    onChange={(e) =>
                      setForm({ ...form, companyUrl: e.target.value })
                    }
                    className={inputClass}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Order Priority
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.current}
                    onChange={(e) =>
                      setForm({ ...form, current: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ml-3 text-xs font-semibold text-muted-foreground">
                    This is my current position
                  </span>
                </label>
              </div>

              {/* Bullets */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-white">
                    Responsibilities & Achievements (Bullets)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Bullet
                  </button>
                </div>

                {form.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => handleBulletChange(idx, e.target.value)}
                      className={inputClass}
                      placeholder="Describe what you built, optimized, or delivered..."
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveBullet(idx)}
                      className="p-2 text-muted-foreground hover:text-rose-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Skills & Tools Used (Comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className={inputClass}
                  placeholder="React, Next.js, Node.js, MongoDB, GTM, GA4"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass border border-white/10 text-xs font-semibold text-muted-foreground hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingExp ? "Update Entry" : "Create Entry"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
