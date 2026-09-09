"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Plus,
  Edit2,
  Trash2,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowLeft,
  Sliders,
  Palette,
  Sparkles,
} from "lucide-react";

export interface DashboardSkill {
  _id: string;
  name: string;
  icon: string;
  level: number;
  color: string;
  category: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardSkillTag {
  _id: string;
  name: string;
  order: number;
}

interface SkillFormValues {
  name: string;
  icon: string;
  level: number;
  color: string;
  category: string;
  order: number;
}

const defaultSkillForm: SkillFormValues = {
  name: "",
  icon: "⚡",
  level: 80,
  color: "#38bdf8",
  category: "Web Development",
  order: 1,
};

const COLOR_PRESETS = [
  "#38bdf8", // Sky
  "#3b82f6", // Blue
  "#818cf8", // Indigo
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#84cc16", // Lime
  "#eab308", // Yellow
  "#f97316", // Orange
  "#f43f5e", // Rose
  "#06b6d4", // Cyan
  "#64748b", // Slate
];

const CATEGORY_SUGGESTIONS = [
  "Web Development",
  "Frontend",
  "Backend",
  "Analytics & Tracking",
  "Design & Media",
  "DevOps & Cloud",
  "Tools & Frameworks",
];

interface SkillsClientProps {
  initialSkills: DashboardSkill[];
  initialTags: DashboardSkillTag[];
}

export default function SkillsClient({ initialSkills, initialTags }: SkillsClientProps) {
  const [skills, setSkills] = useState<DashboardSkill[]>(initialSkills);
  const [tags, setTags] = useState<DashboardSkillTag[]>(initialTags);
  const [activeTab, setActiveTab] = useState<"skills" | "tags">("skills");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Skill modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [form, setForm] = useState<SkillFormValues>(defaultSkillForm);
  const [submittingSkill, setSubmittingSkill] = useState(false);

  // Skill delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<DashboardSkill | null>(null);
  const [deletingSkill, setDeletingSkill] = useState(false);

  // Tag creation state
  const [newTagName, setNewTagName] = useState("");
  const [submittingTag, setSubmittingTag] = useState(false);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

  // User feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Derive unique categories
  const existingCategories = Array.from(new Set(skills.map((s) => s.category).filter(Boolean)));
  const allCategories = ["All", ...existingCategories];

  const filteredSkills =
    selectedCategory === "All"
      ? skills
      : skills.filter((s) => s.category === selectedCategory);

  // Skill Modal handlers
  const handleOpenCreateSkill = () => {
    setModalMode("create");
    setEditingSkillId(null);
    setForm({
      ...defaultSkillForm,
      category: selectedCategory !== "All" ? selectedCategory : "Web Development",
      order: skills.length + 1,
    });
    setModalOpen(true);
  };

  const handleOpenEditSkill = (skill: DashboardSkill) => {
    setModalMode("edit");
    setEditingSkillId(skill._id);
    setForm({
      name: skill.name || "",
      icon: skill.icon || "⚡",
      level: typeof skill.level === "number" ? skill.level : 80,
      color: skill.color || "#38bdf8",
      category: skill.category || "Web Development",
      order: typeof skill.order === "number" ? skill.order : 1,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submittingSkill) return;
    setModalOpen(false);
  };

  const handleSubmitSkill = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = form.name.trim();
    if (!name) {
      showFeedback("error", "Skill name is required.");
      return;
    }

    const level = Math.max(0, Math.min(100, Number(form.level) || 0));
    const category = form.category.trim() || "Web Development";
    const icon = form.icon.trim() || "⚡";
    const color = form.color.trim() || "#38bdf8";
    const order = Number(form.order) || 1;

    setSubmittingSkill(true);

    const payload = {
      name,
      icon,
      level,
      color,
      category,
      order,
    };

    try {
      if (modalMode === "create") {
        const res = await fetch("/api/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to create skill");
        }

        const newSkill: DashboardSkill = {
          _id: data.data._id,
          name: data.data.name,
          icon: data.data.icon,
          level: data.data.level,
          color: data.data.color,
          category: data.data.category,
          order: data.data.order,
          createdAt: data.data.createdAt,
          updatedAt: data.data.updatedAt,
        };

        setSkills((prev) => [...prev, newSkill].sort((a, b) => (a.order || 0) - (b.order || 0)));
        showFeedback("success", `Skill "${newSkill.name}" created successfully!`);
        setModalOpen(false);
      } else if (modalMode === "edit" && editingSkillId) {
        const res = await fetch(`/api/skills/${editingSkillId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to update skill");
        }

        const updatedSkill: DashboardSkill = {
          _id: data.data._id,
          name: data.data.name,
          icon: data.data.icon,
          level: data.data.level,
          color: data.data.color,
          category: data.data.category,
          order: data.data.order,
          createdAt: data.data.createdAt,
          updatedAt: data.data.updatedAt,
        };

        setSkills((prev) =>
          prev
            .map((s) => (s._id === editingSkillId ? updatedSkill : s))
            .sort((a, b) => (a.order || 0) - (b.order || 0))
        );
        showFeedback("success", `Skill "${updatedSkill.name}" updated successfully!`);
        setModalOpen(false);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to save skill";
      showFeedback("error", errMsg);
    } finally {
      setSubmittingSkill(false);
    }
  };

  const handleOpenDeleteSkill = (skill: DashboardSkill) => {
    setSkillToDelete(skill);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteSkill = async () => {
    if (!skillToDelete) return;
    setDeletingSkill(true);

    try {
      const res = await fetch(`/api/skills/${skillToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete skill");
      }

      setSkills((prev) => prev.filter((s) => s._id !== skillToDelete._id));
      showFeedback("success", `Skill "${skillToDelete.name}" deleted.`);
      setDeleteModalOpen(false);
      setSkillToDelete(null);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to delete skill";
      showFeedback("error", errMsg);
    } finally {
      setDeletingSkill(false);
    }
  };

  // Tag handlers
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTagName.trim();
    if (!trimmed) return;

    setSubmittingTag(true);

    try {
      const res = await fetch("/api/skills/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create tag");
      }

      const newTag: DashboardSkillTag = {
        _id: data.data._id,
        name: data.data.name,
        order: data.data.order,
      };

      setTags((prev) => [...prev, newTag]);
      setNewTagName("");
      showFeedback("success", `Tag "${newTag.name}" added successfully!`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to add tag";
      showFeedback("error", errMsg);
    } finally {
      setSubmittingTag(false);
    }
  };

  const handleDeleteTag = async (tagId: string, tagName: string) => {
    setDeletingTagId(tagId);

    try {
      const res = await fetch(`/api/skills/tags/${tagId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete tag");
      }

      setTags((prev) => prev.filter((t) => t._id !== tagId));
      showFeedback("success", `Tag "${tagName}" deleted.`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to delete tag";
      showFeedback("error", errMsg);
    } finally {
      setDeletingTagId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Main Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Back to Overview"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">Skills & Proficiencies</h1>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  {skills.length} skills
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  {tags.length} tags
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your technical competencies, proficiency levels, and concept tags.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="p-1 rounded-xl bg-muted/60 border border-border/50 flex items-center gap-1">
            <button
              onClick={() => setActiveTab("skills")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "skills"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Skills ({skills.length})
            </button>
            <button
              onClick={() => setActiveTab("tags")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "tags"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tags ({tags.length})
            </button>
          </div>

          {activeTab === "skills" && (
            <button
              onClick={handleOpenCreateSkill}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Plus size={16} />
              <span>Add Skill</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating feedback alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 border transition-all animate-fade-in ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 size={16} className="shrink-0" />
            ) : (
              <AlertCircle size={16} className="shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* TAB 1: SKILLS */}
      {activeTab === "skills" && (
        <div className="space-y-6">
          {/* Category Filter Pills (if categories exist) */}
          {allCategories.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 shrink-0 mr-1">
                <Sliders size={13} />
                <span>Filter:</span>
              </span>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 border ${
                    selectedCategory === cat
                      ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-400 font-semibold"
                      : "bg-card/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Skills Grid or Empty State */}
          {filteredSkills.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card border border-border text-center space-y-4 max-w-xl mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
                <Cpu size={32} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {skills.length === 0 ? "No skills yet" : `No skills under "${selectedCategory}"`}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {skills.length === 0
                    ? "Add your core technical proficiencies, programming languages, and tools to showcase on your portfolio."
                    : "Try selecting a different category or add a new skill to this category."}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleOpenCreateSkill}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <Plus size={16} />
                  <span>Add Your First Skill</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.map((skill) => (
                <div
                  key={skill._id}
                  className="group p-5 rounded-2xl bg-card/70 border border-border hover:border-cyan-500/40 hover:bg-card transition-all duration-200 flex flex-col justify-between shadow-sm relative space-y-4"
                >
                  {/* Top: Icon, Name, Category & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl p-2 rounded-xl bg-muted/60 border border-border/50 inline-flex items-center justify-center leading-none shrink-0">
                        {skill.icon || "⚡"}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-foreground truncate group-hover:text-cyan-400 transition-colors">
                          {skill.name}
                        </h3>
                        <span className="inline-block text-[11px] text-muted-foreground px-2 py-0.5 rounded-md bg-muted/50 border border-border/40 mt-1 truncate">
                          {skill.category}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditSkill(skill)}
                        className="p-1.5 rounded-lg border border-border bg-card/80 text-muted-foreground hover:text-cyan-400 hover:border-cyan-500/40 transition-colors cursor-pointer"
                        title="Edit skill"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteSkill(skill)}
                        className="p-1.5 rounded-lg border border-border bg-card/80 text-muted-foreground hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
                        title="Delete skill"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Proficiency Level Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-muted-foreground">Proficiency</span>
                      <span className="font-mono text-xs font-bold text-foreground">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden border border-border/40">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(0, Math.min(100, skill.level))}%`,
                          backgroundColor: skill.color || "#38bdf8",
                        }}
                      />
                    </div>
                  </div>

                  {/* Footer: Order & Color indicator */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Order: #{skill.order ?? 0}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: skill.color || "#38bdf8" }}
                      />
                      <span className="font-mono text-[10px]">{skill.color}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SKILL TAGS */}
      {activeTab === "tags" && (
        <div className="space-y-6">
          {/* Tag Creation Form Card */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Tag size={16} />
              </div>
              <div>
                <h2 className="font-bold text-sm text-foreground">Add New Concept Tag</h2>
                <p className="text-[11px] text-muted-foreground">
                  Tags represent technologies, frameworks, and libraries you have experience with.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateTag} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g. Next.js, Docker, Tailwind CSS, GraphQL"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={submittingTag || !newTagName.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingTag ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    <span>Add Tag</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Tags Cloud / Pill List */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="font-bold text-sm text-foreground">Your Skill Tags ({tags.length})</h2>
              <span className="text-[11px] text-muted-foreground">
                Hover tag to reveal delete action
              </span>
            </div>

            {tags.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No tags added yet. Use the form above to add your first concept tag.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5 pt-2">
                {tags.map((tag) => (
                  <span
                    key={tag._id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/70 text-xs font-medium text-foreground hover:border-indigo-500/40 transition-all group"
                  >
                    <Tag size={12} className="text-indigo-400" />
                    <span>{tag.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTag(tag._id, tag.name)}
                      disabled={deletingTagId === tag._id}
                      className="p-0.5 rounded hover:bg-rose-500/20 hover:text-rose-400 text-muted-foreground/60 transition-colors cursor-pointer"
                      title={`Delete tag "${tag.name}"`}
                    >
                      {deletingTagId === tag._id ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <X size={11} />
                      )}
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT SKILL MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl p-6 sm:p-7 space-y-5 my-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Cpu size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-base text-foreground">
                    {modalMode === "create" ? "Add New Skill" : "Edit Skill"}
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {modalMode === "create"
                      ? "Add a technical proficiency and rating to your portfolio."
                      : "Update your skill name, category, or proficiency."}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                disabled={submittingSkill}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitSkill} className="space-y-4 text-xs">
              {/* Name & Emoji Icon */}
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="block font-semibold text-muted-foreground mb-1.5">
                    Skill Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. React, TypeScript, Python, Docker"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-muted-foreground mb-1.5">Emoji Icon</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="⚡"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-transparent text-sm text-center text-foreground focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              </div>

              {/* Category with suggestions */}
              <div>
                <label className="block font-semibold text-muted-foreground mb-1.5">
                  Category <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="category-suggestions"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Web Development, Frontend, Backend"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                />
                <datalist id="category-suggestions">
                  {CATEGORY_SUGGESTIONS.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              {/* Proficiency Level (0 - 100) */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles size={14} className="text-cyan-400" />
                    <span>Proficiency Level</span>
                  </label>
                  <span className="font-mono text-sm font-bold text-cyan-400">
                    {form.level}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: Number(e.target.value) || 0 })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>Beginner (0%)</span>
                  <span>Intermediate (50%)</span>
                  <span>Expert (100%)</span>
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <label className="block font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Palette size={14} />
                  <span>Accent Color</span>
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className="w-8 h-8 rounded-xl border border-border shrink-0 shadow-inner"
                    style={{ backgroundColor: form.color }}
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    placeholder="#38bdf8"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-border bg-transparent text-xs text-foreground font-mono focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>

                {/* Color preset swatches */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {COLOR_PRESETS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setForm({ ...form, color: hex })}
                      className={`w-6 h-6 rounded-lg transition-transform cursor-pointer border ${
                        form.color === hex
                          ? "scale-115 border-foreground shadow-md ring-2 ring-cyan-500/40"
                          : "border-border/40 hover:scale-105"
                      }`}
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Display Sort Order</label>
                <input
                  type="number"
                  min={1}
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-transparent text-xs text-foreground focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submittingSkill}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSkill}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingSkill ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{modalMode === "create" ? "Create Skill" : "Save Changes"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SKILL MODAL */}
      {deleteModalOpen && skillToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-foreground">Delete Skill</h3>
              <p className="text-xs text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">&quot;{skillToDelete.name}&quot;</span>? This will remove it from your live portfolio.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (deletingSkill) return;
                  setDeleteModalOpen(false);
                  setSkillToDelete(null);
                }}
                disabled={deletingSkill}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSkill}
                disabled={deletingSkill}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingSkill ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Skill</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
