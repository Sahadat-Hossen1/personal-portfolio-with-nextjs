"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Star,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowLeft,
  Tag,
  Globe,
  Code2,
} from "lucide-react";
import { Github } from "@/components/icons";

export interface DashboardProject {
  _id: string;
  title: string;
  description: string;
  longDesc?: string;
  image?: string;
  tags?: string[];
  github?: string;
  live?: string;
  emoji?: string;
  featured?: boolean;
  stars?: number;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectFormValues {
  title: string;
  description: string;
  longDesc: string;
  image: string;
  tagsInput: string;
  github: string;
  live: string;
  emoji: string;
  featured: boolean;
  stars: number;
  order: number;
}

const defaultFormValues: ProjectFormValues = {
  title: "",
  description: "",
  longDesc: "",
  image: "/assets/images/projects/project-1.jpg",
  tagsInput: "React, TypeScript, Next.js",
  github: "https://github.com",
  live: "https://example.com",
  emoji: "🚀",
  featured: false,
  stars: 0,
  order: 1,
};

interface ProjectsClientProps {
  initialProjects: DashboardProject[];
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [projects, setProjects] = useState<DashboardProject[]>(initialProjects);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectFormValues>(defaultFormValues);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<DashboardProject | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleOpenCreate = () => {
    setModalMode("create");
    setEditingProjectId(null);
    setForm({
      ...defaultFormValues,
      order: projects.length + 1,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (proj: DashboardProject) => {
    setModalMode("edit");
    setEditingProjectId(proj._id);
    setForm({
      title: proj.title || "",
      description: proj.description || "",
      longDesc: proj.longDesc || "",
      image: proj.image || "/assets/images/projects/project-1.jpg",
      tagsInput: Array.isArray(proj.tags) ? proj.tags.join(", ") : "",
      github: proj.github || "",
      live: proj.live || "",
      emoji: proj.emoji || "🚀",
      featured: Boolean(proj.featured),
      stars: typeof proj.stars === "number" ? proj.stars : 0,
      order: typeof proj.order === "number" ? proj.order : projects.length + 1,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      showFeedback("error", "Project title is required.");
      return;
    }
    if (!description) {
      showFeedback("error", "Project description is required.");
      return;
    }

    setSubmitting(true);

    const tagsArray = form.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Payload containing ONLY editable project fields (Never sends ownerId/userId/role)
    const payload = {
      title,
      description,
      longDesc: form.longDesc.trim(),
      image: form.image.trim() || "/assets/images/projects/project-1.jpg",
      tags: tagsArray,
      github: form.github.trim(),
      live: form.live.trim(),
      emoji: form.emoji.trim() || "🚀",
      featured: form.featured,
      stars: Number(form.stars) || 0,
      order: Number(form.order) || 1,
    };

    try {
      if (modalMode === "create") {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to create project");
        }

        const newProject: DashboardProject = {
          _id: data.data._id,
          title: data.data.title,
          description: data.data.description,
          longDesc: data.data.longDesc,
          image: data.data.image,
          tags: data.data.tags,
          github: data.data.github,
          live: data.data.live,
          emoji: data.data.emoji,
          featured: data.data.featured,
          stars: data.data.stars,
          order: data.data.order,
          createdAt: data.data.createdAt,
          updatedAt: data.data.updatedAt,
        };

        setProjects((prev) => [...prev, newProject].sort((a, b) => (a.order || 0) - (b.order || 0)));
        showFeedback("success", "Project created successfully!");
        setModalOpen(false);
      } else if (modalMode === "edit" && editingProjectId) {
        const res = await fetch(`/api/projects/${editingProjectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to update project");
        }

        const updatedProject: DashboardProject = {
          _id: data.data._id,
          title: data.data.title,
          description: data.data.description,
          longDesc: data.data.longDesc,
          image: data.data.image,
          tags: data.data.tags,
          github: data.data.github,
          live: data.data.live,
          emoji: data.data.emoji,
          featured: data.data.featured,
          stars: data.data.stars,
          order: data.data.order,
          createdAt: data.data.createdAt,
          updatedAt: data.data.updatedAt,
        };

        setProjects((prev) =>
          prev
            .map((p) => (p._id === editingProjectId ? updatedProject : p))
            .sort((a, b) => (a.order || 0) - (b.order || 0))
        );
        showFeedback("success", "Project updated successfully!");
        setModalOpen(false);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to save project";
      showFeedback("error", errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (proj: DashboardProject) => {
    setProjectToDelete(proj);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/projects/${projectToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete project");
      }

      setProjects((prev) => prev.filter((p) => p._id !== projectToDelete._id));
      showFeedback("success", `Project "${projectToDelete.title}" deleted.`);
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to delete project";
      showFeedback("error", errMsg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Actions */}
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
              <h1 className="text-2xl font-black text-foreground tracking-tight">Projects</h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                {projects.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showcase your portfolio applications, code repositories, and case studies.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer hover:scale-[1.02]"
        >
          <Plus size={16} />
          <span>Add Project</span>
        </button>
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

      {/* Projects List / Empty State */}
      {projects.length === 0 ? (
        <div className="p-12 rounded-3xl bg-card border border-border text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <FolderGit2 size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">No projects yet</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              You haven&apos;t added any projects to your portfolio. Create your first project showcase to display on your public portfolio.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Plus size={16} />
              <span>Create Your First Project</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="group p-5 rounded-2xl bg-card/70 border border-border hover:border-indigo-500/40 hover:bg-card transition-all duration-200 flex flex-col justify-between shadow-sm relative"
            >
              <div className="space-y-3">
                {/* Top badges & controls */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl p-1.5 rounded-xl bg-muted/60 border border-border/50 inline-block leading-none">
                      {proj.emoji || "🚀"}
                    </span>
                    {proj.featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">
                        <Sparkles size={10} />
                        Featured
                      </span>
                    )}
                    {typeof proj.stars === "number" && proj.stars > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        {proj.stars}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-1.5 rounded-lg border border-border bg-card/80 text-muted-foreground hover:text-indigo-400 hover:border-indigo-500/40 transition-colors cursor-pointer"
                      title="Edit project"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(proj)}
                      className="p-1.5 rounded-lg border border-border bg-card/80 text-muted-foreground hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Title & Short Description */}
                <div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-indigo-400 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {proj.description}
                  </p>
                </div>

                {/* Long description snippet if provided */}
                {proj.longDesc && (
                  <p className="text-[11px] text-muted-foreground/80 line-clamp-2 bg-muted/30 p-2 rounded-lg border border-border/40 font-mono">
                    {proj.longDesc}
                  </p>
                )}

                {/* Tags */}
                {Array.isArray(proj.tags) && proj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 border border-border/50 text-[10px] text-muted-foreground font-medium"
                      >
                        <Tag size={9} />
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom links & sorting */}
              <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-[10px] text-muted-foreground font-medium">
                  Order: #{proj.order ?? 0}
                </span>

                <div className="flex items-center gap-3">
                  {proj.github && (
                    <a
                      href={proj.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-[11px]"
                      title="GitHub Repository"
                    >
                      <Github size={13} />
                      <span>Code</span>
                    </a>
                  )}

                  {proj.live && (
                    <a
                      href={proj.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors text-[11px] font-semibold"
                      title="Live Demo"
                    >
                      <ExternalLink size={12} />
                      <span>Live</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl border border-border bg-card shadow-2xl p-6 sm:p-8 space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <FolderGit2 size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-base text-foreground">
                    {modalMode === "create" ? "Add New Project" : "Edit Project"}
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {modalMode === "create"
                      ? "Add a showcased application or repository to your portfolio."
                      : "Update your showcased project details."}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Title & Emoji */}
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="block font-semibold text-muted-foreground mb-1.5">
                    Project Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. SaaS Analytics Platform"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-muted-foreground mb-1.5">Emoji</label>
                  <input
                    type="text"
                    value={form.emoji}
                    onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                    placeholder="🚀"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-transparent text-sm text-center text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block font-semibold text-muted-foreground mb-1.5">
                  Short Description <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="High-level summary of what this project accomplishes"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Detailed / Long Description */}
              <div>
                <label className="block font-semibold text-muted-foreground mb-1.5">
                  Extended Description / Architecture Summary (Optional)
                </label>
                <textarea
                  rows={2}
                  value={form.longDesc}
                  onChange={(e) => setForm({ ...form, longDesc: e.target.value })}
                  placeholder="More context on the technical challenges, architecture, or features..."
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-transparent text-xs text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block font-semibold text-muted-foreground mb-1.5">
                  Technologies / Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.tagsInput}
                  onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
                  placeholder="React, Next.js, TypeScript, Tailwind"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-semibold text-muted-foreground mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="/assets/images/projects/project-1.jpg or https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-xs text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>

              {/* Links: Live & GitHub */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Globe size={13} />
                    <span>Live Demo URL</span>
                  </label>
                  <input
                    type="url"
                    value={form.live}
                    onChange={(e) => setForm({ ...form, live: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-transparent text-xs text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Code2 size={13} />
                    <span>GitHub Repository URL</span>
                  </label>
                  <input
                    type="url"
                    value={form.github}
                    onChange={(e) => setForm({ ...form, github: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-transparent text-xs text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Order, Stars, Featured */}
              <div className="grid grid-cols-3 gap-3 items-center pt-2">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-transparent text-xs text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">GitHub Stars</label>
                  <input
                    type="number"
                    min={0}
                    value={form.stars}
                    onChange={(e) => setForm({ ...form, stars: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-transparent text-xs text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <span className="block font-semibold text-muted-foreground mb-1">Featured</span>
                  <label className="inline-flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="w-4 h-4 rounded border-border text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs text-foreground font-medium">Spotlight</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{modalMode === "create" ? "Create Project" : "Save Changes"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-foreground">Delete Project</h3>
              <p className="text-xs text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">&quot;{projectToDelete.title}&quot;</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (deleting) return;
                  setDeleteModalOpen(false);
                  setProjectToDelete(null);
                }}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Project</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
