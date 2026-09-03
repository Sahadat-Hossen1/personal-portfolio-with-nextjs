"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
} from "lucide-react";
import { Github } from "@/components/icons";

interface ProjectItem {
  _id?: string;
  title: string;
  description: string;
  longDesc: string;
  image: string;
  tags: string[];
  github: string;
  live: string;
  emoji: string;
  featured: boolean;
  stars: number;
  order: number;
}

const emptyProject: ProjectItem = {
  title: "",
  description: "",
  longDesc: "",
  image: "/assets/images/projects/project-1.jpg",
  tags: ["React", "Node.js"],
  github: "https://github.com",
  live: "https://example.com",
  emoji: "🚀",
  featured: false,
  stars: 0,
  order: 1,
};

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [form, setForm] = useState<ProjectItem>(emptyProject);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success && data.data) {
        setProjects(data.data);
      }
    } catch (err) {
      console.error("Fetch projects error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setForm({
      ...emptyProject,
      order: projects.length + 1,
    });
    setTagsInput("React, Node.js, MongoDB");
    setModalOpen(true);
  };

  const handleOpenEdit = (proj: ProjectItem) => {
    setEditingProject(proj);
    setForm({ ...proj });
    setTagsInput(proj.tags ? proj.tags.join(", ") : "");
    setModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Project deleted successfully" });
        fetchProjects();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete" });
      }
    } catch {
      setMessage({ type: "error", text: "Error deleting project" });
    }
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
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
      stars: Number(form.stars) || 0,
      order: Number(form.order) || 1,
    };

    try {
      let res;
      if (editingProject && editingProject._id) {
        res = await fetch(`/api/projects/${editingProject._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/projects", {
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
        text: editingProject
          ? "Project updated successfully!"
          : "New project created successfully!",
      });
      setModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to save project",
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
            <FolderGit2 size={14} /> Showcase Manager
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Projects & <span className="gradient-text">Case Studies</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Add, update, or reorder your portfolio projects and showcase badges.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Project</span>
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

      {/* Project list */}
      {loading ? (
        <div className="py-24 flex justify-center text-muted-foreground">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
        </div>
      ) : projects.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border border-white/10 space-y-3">
          <FolderGit2 size={40} className="mx-auto text-muted-foreground/40" />
          <h3 className="text-base font-bold text-white">No Projects Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You don&apos;t have any projects in your database yet. Click &quot;Add New Project&quot; or sync default data from the dashboard.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-2 px-4 py-2 rounded-xl glass border border-indigo-500/40 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/10"
          >
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="glass rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between transition-all duration-300 hover:border-white/20 group"
            >
              {/* Preview image banner */}
              <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                {proj.image ? (
                  <Image
                    src={proj.image}
                    alt={proj.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-2xl">
                    {proj.emoji}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg glass flex items-center justify-center text-sm shadow-md">
                    {proj.emoji}
                  </span>
                  {proj.featured && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <Sparkles size={10} /> Featured
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md glass text-white/80">
                  #{proj.order}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {proj.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {proj.tags?.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 border border-white/5 text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer bar */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {proj.github && (
                      <a
                        href={proj.github}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-white"
                        title="GitHub"
                      >
                        <Github size={15} />
                      </a>
                    )}
                    {proj.live && (
                      <a
                        href={proj.live}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-white"
                        title="Live URL"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    {proj.stars ? (
                      <span className="flex items-center gap-1 text-[11px] text-amber-400">
                        <Star size={12} fill="currentColor" /> {proj.stars}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                      title="Edit project"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(proj._id!, proj.title)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add/Edit Project */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl glass rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingProject ? "Edit Project" : "Add New Project"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Fill in the project details to display in the showcase
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={inputClass}
                    placeholder="ShopFlow E-Commerce"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Emoji Icon
                  </label>
                  <input
                    type="text"
                    value={form.emoji}
                    onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                    className={inputClass}
                    placeholder="🛒"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Short Tagline / Description *
                </label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className={inputClass}
                  placeholder="MERN Stack E-Commerce with GTM & GA4"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Full Detailed Description (Modal / deep view)
                </label>
                <textarea
                  rows={3}
                  value={form.longDesc}
                  onChange={(e) =>
                    setForm({ ...form, longDesc: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Detailed explanation of the project, architecture, and tracking setup..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Image File Path / URL
                  </label>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className={inputClass}
                    placeholder="/assets/images/projects/project-1.jpg"
                  />
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
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Tech Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className={inputClass}
                  placeholder="Next.js, Node.js, MongoDB, GTM, GA4"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="text"
                    value={form.github}
                    onChange={(e) => setForm({ ...form, github: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Live Demo URL
                  </label>
                  <input
                    type="text"
                    value={form.live}
                    onChange={(e) => setForm({ ...form, live: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Star Count
                  </label>
                  <input
                    type="number"
                    value={form.stars}
                    onChange={(e) =>
                      setForm({ ...form, stars: Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  <span className="ml-3 text-xs font-semibold text-muted-foreground">
                    Highlight as &quot;Featured Project&quot; (Special badge & placement)
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl glass border border-white/10 text-xs font-semibold text-muted-foreground hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingProject ? "Update Project" : "Create Project"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
