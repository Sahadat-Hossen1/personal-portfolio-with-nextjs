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
  Building,
} from "lucide-react";

interface ExperienceItem {
  _id?: string;
  role: string;
  company: string;
  companyUrl?: string;
  location?: string;
  period: string;
  type: string;
  bullets: string[];
  tags: string[];
  current?: boolean;
  order?: number;
}

const emptyExperience: ExperienceItem = {
  role: "",
  company: "",
  companyUrl: "",
  location: "Dhaka, Bangladesh",
  period: "2026 – Present",
  type: "Full-time",
  bullets: [
    "Developing responsive web applications using React, Next.js, and Node.js.",
  ],
  tags: ["React", "Next.js", "Node.js", "MongoDB"],
  current: true,
  order: 1,
};

const typeColors: Record<string, string> = {
  "Full-time": "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Contract: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  Freelance: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  "Part-time": "text-purple-400 bg-purple-500/10 border-purple-500/30",
};

export default function ExperienceAdminPage() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [form, setForm] = useState<ExperienceItem>(emptyExperience);
  const [tagsInput, setTagsInput] = useState("");
  const [bulletInputs, setBulletInputs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [experienceVisible, setExperienceVisible] = useState(true);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
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
    fetch("/api/profile")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.data?.sections) {
          setExperienceVisible(d.data.sections.experience ?? true);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleExperienceVisibility = async () => {
    const nextVal = !experienceVisible;
    setExperienceVisible(nextVal);
    setTogglingVisibility(true);
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: { experience: nextVal } }),
      });
      setMessage({
        type: "success",
        text: `Experience timeline is now ${nextVal ? "visible on" : "hidden from"} public portfolio.`,
      });
    } catch {
      setExperienceVisible(!nextVal);
      setMessage({ type: "error", text: "Failed to update visibility." });
    } finally {
      setTogglingVisibility(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3500);
    }
  };

  const handleOpenCreate = () => {
    setEditingExp(null);
    setForm({
      ...emptyExperience,
      order: experiences.length + 1,
    });
    setBulletInputs([
      "Developing responsive web applications using React, Next.js, and Node.js.",
    ]);
    setTagsInput("React, Next.js, Node.js, MongoDB");
    setModalOpen(true);
  };

  const handleOpenEdit = (exp: ExperienceItem) => {
    setEditingExp(exp);
    setForm({ ...exp });
    setBulletInputs(exp.bullets && exp.bullets.length > 0 ? [...exp.bullets] : [""]);
    setTagsInput(exp.tags ? exp.tags.join(", ") : "");
    setModalOpen(true);
  };

  const handleDelete = async (id: string, role: string, company: string) => {
    if (!confirm(`Delete experience entry for "${role}" at "${company}"?`)) return;
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
    setBulletInputs([...bulletInputs, ""]);
  };

  const handleBulletChange = (index: number, val: string) => {
    const updated = [...bulletInputs];
    updated[index] = val;
    setBulletInputs(updated);
  };

  const handleRemoveBullet = (index: number) => {
    setBulletInputs(bulletInputs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const validBullets = bulletInputs
      .map((b) => b.trim())
      .filter(Boolean);

    const payload = {
      ...form,
      bullets: validBullets,
      tags: tagsArray,
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
        throw new Error(data.error || "Failed to save experience");
      }

      setMessage({
        type: "success",
        text: editingExp
          ? "Experience updated successfully!"
          : "New experience added successfully!",
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
    "w-full px-3.5 py-2.5 rounded-xl glass border border-border bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Briefcase size={14} /> Career & Timeline
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Work <span className="gradient-text">Experiences</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your career history, roles, key accomplishments, and skill tags.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Section Visibility Quick Toggle */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl glass border border-border">
            <span className={`text-[11px] font-bold ${experienceVisible ? "text-emerald-500 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {experienceVisible ? "Public: Live" : "Public: Hidden"}
            </span>
            {!experienceVisible && (
              <button
                type="button"
                disabled={togglingVisibility}
                onClick={handleToggleExperienceVisibility}
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
              >
                Enable
              </button>
            )}
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={experienceVisible}
                disabled={togglingVisibility}
                onChange={handleToggleExperienceVisibility}
                className="sr-only peer"
              />
              <div className="w-10 h-5.5 bg-zinc-300 dark:bg-zinc-700 border border-zinc-400/50 dark:border-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all after:shadow-md peer-checked:bg-emerald-600 dark:peer-checked:bg-emerald-500 peer-checked:border-emerald-600"></div>
            </label>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Experience</span>
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

      {/* Experience List */}
      {loading ? (
        <div className="py-24 flex justify-center text-muted-foreground">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
        </div>
      ) : experiences.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border border-border space-y-3">
          <Briefcase size={40} className="mx-auto text-muted-foreground/40" />
          <h3 className="text-base font-bold text-foreground">No Experience Items Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You don&apos;t have any experience items recorded yet. Click &quot;Add Experience&quot; or sync default data from the admin dashboard.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-2 px-4 py-2 rounded-xl glass border border-indigo-500/40 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/10 cursor-pointer"
          >
            Add First Experience
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp._id}
              className="glass rounded-3xl p-6 border border-border transition-all duration-300 hover:border-indigo-500/40 flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-lg font-bold text-foreground">{exp.role}</h3>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
                      typeColors[exp.type] ||
                      "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
                    }`}
                  >
                    {exp.type}
                  </span>
                  {exp.current && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Current Role
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-foreground font-semibold">
                    <Building size={14} className="text-indigo-400" />
                    {exp.companyUrl ? (
                      <a
                        href={exp.companyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        {exp.company}
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span>{exp.company}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Calendar size={13} />
                    <span>{exp.period}</span>
                  </div>

                  {exp.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={13} />
                      <span>{exp.location}</span>
                    </div>
                  )}
                </div>

                {/* Bullets */}
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="space-y-1.5 pt-2 text-xs text-muted-foreground">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Tags */}
                {exp.tags && exp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {exp.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-2.5 py-0.5 rounded-lg glass border border-border text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end md:self-start">
                <button
                  onClick={() => handleOpenEdit(exp)}
                  className="p-2 rounded-xl glass border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(exp._id!, exp.role, exp.company)}
                  className="p-2 rounded-xl glass border border-border text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add/Edit Experience */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl glass rounded-3xl p-6 sm:p-8 border border-border shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {editingExp ? "Edit Experience" : "Add New Experience"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Fill in your role, company, and timeline details.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    placeholder="Full-Stack Developer & Analytics Specialist"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Company / Organization *
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
                    Company Website URL
                  </label>
                  <input
                    type="text"
                    value={form.companyUrl}
                    onChange={(e) => setForm({ ...form, companyUrl: e.target.value })}
                    className={inputClass}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className={inputClass}
                    placeholder="Dhaka, Bangladesh"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Period / Dates *
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Employment Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass border border-border bg-card text-sm text-foreground focus:outline-none focus:border-indigo-500/60"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Display Order
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
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  <span className="ml-3 text-xs font-semibold text-muted-foreground">
                    Current Position (Highlights node on live timeline)
                  </span>
                </label>
              </div>

              {/* Responsibilities / Accomplishments */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Bullet Points (Responsibilities & Impact)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> Add Bullet
                  </button>
                </div>

                <div className="space-y-2">
                  {bulletInputs.map((b, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={b}
                        onChange={(e) => handleBulletChange(idx, e.target.value)}
                        className={inputClass}
                        placeholder="Key responsibility or achievement..."
                      />
                      {bulletInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBullet(idx)}
                          className="p-2 text-muted-foreground hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Tech Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className={inputClass}
                  placeholder="React, Next.js, Node.js, MongoDB, GTM, GA4"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl glass border border-border text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingExp ? "Update Experience" : "Create Experience"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
