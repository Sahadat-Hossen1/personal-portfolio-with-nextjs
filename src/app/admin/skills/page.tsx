"use client";

import { useEffect, useState } from "react";
import {
  Cpu,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Tag,
  Sliders,
} from "lucide-react";

interface SkillItem {
  _id?: string;
  name: string;
  icon: string;
  level: number;
  color: string;
  category: string;
  order: number;
}

interface TagItem {
  _id: string;
  name: string;
  order: number;
}

const emptySkill: SkillItem = {
  name: "",
  icon: "⚡",
  level: 85,
  color: "#38bdf8",
  category: "Web Development",
  order: 1,
};

const colorPresets = [
  "#38bdf8", // Sky
  "#3b82f6", // Blue
  "#818cf8", // Indigo
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#84cc16", // Lime
  "#eab308", // Yellow
  "#f97316", // Orange
  "#ea4335", // Red (GA4)
  "#4285f4", // Google Blue
  "#00c7b7", // Teal
  "#94a3b8", // Slate
];

export default function SkillsAdminPage() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [form, setForm] = useState<SkillItem>(emptySkill);
  const [newTagInput, setNewTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchSkillsData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/skills");
      const data = await res.json();
      if (data.success && data.data) {
        setSkills(data.data.skills || []);
        setTags(data.data.tags || []);
      }
    } catch (err) {
      console.error("Fetch skills error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillsData();
  }, []);

  const handleOpenCreate = () => {
    setEditingSkill(null);
    setForm({
      ...emptySkill,
      order: skills.length + 1,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (skill: SkillItem) => {
    setEditingSkill(skill);
    setForm({ ...skill });
    setModalOpen(true);
  };

  const handleDeleteSkill = async (id: string, name: string) => {
    if (!confirm(`Delete skill "${name}"?`)) return;
    try {
      const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Skill deleted successfully" });
        fetchSkillsData();
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete skill" });
    }
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const handleSubmitSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      let res;
      if (editingSkill && editingSkill._id) {
        res = await fetch(`/api/skills/${editingSkill._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch("/api/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to save");

      setMessage({
        type: "success",
        text: editingSkill ? "Skill updated!" : "Skill created!",
      });
      setModalOpen(false);
      fetchSkillsData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save skill" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;

    try {
      const res = await fetch("/api/skills/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewTagInput("");
        fetchSkillsData();
      } else {
        alert(data.error || "Failed to add tag");
      }
    } catch {
      alert("Error adding tag");
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      const res = await fetch(`/api/skills/tags/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTags(tags.filter((t) => t._id !== id));
      }
    } catch {
      alert("Error deleting tag");
    }
  };

  const categories = Array.from(new Set(skills.map((s) => s.category)));
  if (!categories.includes("Web Development")) categories.push("Web Development");
  if (!categories.includes("Analytics & Tracking")) categories.push("Analytics & Tracking");

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl glass border border-border bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Cpu size={14} /> Technology Stack
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Skills & <span className="gradient-text">Proficiencies</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your technical skills, proficiency levels, categories, and familiar concept tags.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Skill</span>
        </button>
      </div>

      {/* Message Alert */}
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
      ) : (
        <div className="space-y-8">
          {/* Categorized Skills */}
          {categories.map((cat) => {
            const catSkills = skills.filter((s) => s.category === cat);
            if (catSkills.length === 0) return null;
            return (
              <div
                key={cat}
                className="glass rounded-3xl p-6 border border-border space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Sliders size={16} className="text-indigo-400" />
                    {cat}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {catSkills.length} skills
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catSkills.map((skill) => (
                    <div
                      key={skill._id}
                      className="p-3.5 rounded-2xl glass border border-border hover:border-primary/30 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                        <span className="text-xl flex-shrink-0">{skill.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-xs font-bold text-foreground">
                            <span className="truncate">{skill.name}</span>
                            <span style={{ color: skill.color }}>{skill.level}%</span>
                          </div>
                          {/* Mini progress bar */}
                          <div className="w-full h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${skill.level}%`,
                                backgroundColor: skill.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => handleOpenEdit(skill)}
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(skill._id!, skill.name)}
                          className="p-1 rounded-md text-muted-foreground hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Section: Also Familiar With Tags */}
          <div className="glass rounded-3xl p-6 border border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Tag size={16} className="text-indigo-400" />
                  &quot;Also Familiar With&quot; Tech Tags
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Small pill tags shown below the skills progress cards
                </p>
              </div>

              {/* Add tag form */}
              <form onSubmit={handleAddTag} className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="New tag e.g. Docker"
                  className="px-3 py-1.5 rounded-xl glass border border-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/60"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus size={13} /> Add Tag
                </button>
              </form>
            </div>

            {/* Tags Pills List */}
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag) => (
                <span
                  key={tag._id}
                  className="px-3 py-1.5 rounded-full text-xs font-medium glass border border-border text-foreground/85 flex items-center gap-2 group hover:border-primary/30"
                >
                  <span>{tag.name}</span>
                  <button
                    onClick={() => handleDeleteTag(tag._id)}
                    className="text-muted-foreground hover:text-rose-400 transition-colors"
                    title="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Skill */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md glass rounded-3xl p-6 sm:p-8 border border-border shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <h2 className="text-lg font-bold text-foreground">
                {editingSkill ? "Edit Skill" : "Add New Skill"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitSkill} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Skill Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                    placeholder="React"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Icon / Emoji
                  </label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className={inputClass}
                    placeholder="⚛️"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass border border-border bg-card text-sm text-foreground focus:outline-none focus:border-indigo-500/60"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Analytics & Tracking">Analytics & Tracking</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Database">Database</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Proficiency Level
                  </label>
                  <span className="text-xs font-bold text-indigo-400">
                    {form.level}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.level}
                  onChange={(e) =>
                    setForm({ ...form, level: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Color Presets */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-lg border border-border"
                    style={{ backgroundColor: form.color }}
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className={inputClass}
                    placeholder="#38bdf8"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        form.color === c ? "scale-110 border-primary ring-2 ring-primary/30" : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
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

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass border border-border text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingSkill ? "Update Skill" : "Create Skill"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
