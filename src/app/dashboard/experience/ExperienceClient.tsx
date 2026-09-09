"use client";

import { useState } from "react";
import Link from "next/link";
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
  ArrowLeft,
  Building,
  Check,
} from "lucide-react";

export interface DashboardExperience {
  _id: string;
  role: string;
  company: string;
  companyUrl?: string;
  location?: string;
  period: string;
  type?: string;
  bullets: string[];
  tags: string[];
  current?: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ExperienceFormValues {
  role: string;
  company: string;
  companyUrl: string;
  location: string;
  period: string;
  type: string;
  bullets: string[];
  tagsInput: string;
  current: boolean;
  order: number;
}

const defaultExperienceForm: ExperienceFormValues = {
  role: "",
  company: "",
  companyUrl: "",
  location: "Remote",
  period: "",
  type: "Full-time",
  bullets: [""],
  tagsInput: "",
  current: false,
  order: 1,
};

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Contract",
  "Part-time",
  "Freelance",
  "Internship",
];

const TYPE_STYLES: Record<string, string> = {
  "Full-time": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Contract: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Part-time": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  Freelance: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Internship: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
};

interface ExperienceClientProps {
  initialExperiences: DashboardExperience[];
}

export default function ExperienceClient({
  initialExperiences,
}: ExperienceClientProps) {
  const [experiences, setExperiences] =
    useState<DashboardExperience[]>(initialExperiences);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [form, setForm] = useState<ExperienceFormValues>(defaultExperienceForm);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expToDelete, setExpToDelete] = useState<DashboardExperience | null>(
    null
  );
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

  // Re-fetch experiences from API
  const refreshExperiences = async () => {
    try {
      const res = await fetch("/api/experiences");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const mapped: DashboardExperience[] = data.data.map((e: DashboardExperience) => ({
          _id: e._id,
          role: e.role,
          company: e.company,
          companyUrl: e.companyUrl || "",
          location: e.location || "Remote",
          period: e.period,
          type: e.type || "Full-time",
          bullets: Array.isArray(e.bullets) ? e.bullets : [],
          tags: Array.isArray(e.tags) ? e.tags : [],
          current: Boolean(e.current),
          order: typeof e.order === "number" ? e.order : 0,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        }));
        setExperiences(mapped);
      }
    } catch (err) {
      console.error("Failed to refresh experiences:", err);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode("create");
    setEditingExpId(null);
    setForm({
      ...defaultExperienceForm,
      bullets: [""],
      order: experiences.length + 1,
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (exp: DashboardExperience) => {
    setModalMode("edit");
    setEditingExpId(exp._id);
    setForm({
      role: exp.role || "",
      company: exp.company || "",
      companyUrl: exp.companyUrl || "",
      location: exp.location || "Remote",
      period: exp.period || "",
      type: exp.type || "Full-time",
      bullets:
        exp.bullets && exp.bullets.length > 0 ? [...exp.bullets] : [""],
      tagsInput: exp.tags ? exp.tags.join(", ") : "",
      current: Boolean(exp.current),
      order: typeof exp.order === "number" ? exp.order : experiences.length + 1,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  // Bullet points handlers
  const handleBulletChange = (index: number, value: string) => {
    const updated = [...form.bullets];
    updated[index] = value;
    setForm({ ...form, bullets: updated });
  };

  const handleAddBullet = () => {
    setForm({ ...form, bullets: [...form.bullets, ""] });
  };

  const handleRemoveBullet = (index: number) => {
    if (form.bullets.length <= 1) {
      setForm({ ...form, bullets: [""] });
      return;
    }
    const updated = form.bullets.filter((_, i) => i !== index);
    setForm({ ...form, bullets: updated });
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const role = form.role.trim();
    const company = form.company.trim();
    const period = form.period.trim();

    if (!role) {
      showFeedback("error", "Job role/title is required.");
      return;
    }
    if (!company) {
      showFeedback("error", "Company name is required.");
      return;
    }
    if (!period) {
      showFeedback("error", "Period is required (e.g. '2023 – Present' or '2021 – 2023').");
      return;
    }

    setSubmitting(true);

    const bulletsArray = form.bullets
      .map((b) => b.trim())
      .filter(Boolean);

    const tagsArray = form.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Payload containing ONLY editable experience fields
    // NOTE: 'role' here is the professional job title, which is legitimate and allowed.
    // Client strictly NEVER sends ownerId, userId, system authorization role, or plan.
    const payload = {
      role,
      company,
      companyUrl: form.companyUrl.trim(),
      location: form.location.trim() || "Remote",
      period,
      type: form.type || "Full-time",
      bullets: bulletsArray,
      tags: tagsArray,
      current: form.current,
      order: Number(form.order) || 1,
    };

    try {
      if (modalMode === "create") {
        const res = await fetch("/api/experiences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to create experience");
        }

        showFeedback("success", `Experience at ${company} created successfully.`);
      } else if (modalMode === "edit" && editingExpId) {
        const res = await fetch(`/api/experiences/${editingExpId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to update experience");
        }

        showFeedback("success", `Experience at ${company} updated successfully.`);
      }

      setModalOpen(false);
      await refreshExperiences();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      showFeedback("error", errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (exp: DashboardExperience) => {
    setExpToDelete(exp);
    setDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!expToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/experiences/${expToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete experience");
      }

      showFeedback(
        "success",
        `Experience "${expToDelete.role} at ${expToDelete.company}" deleted.`
      );
      setDeleteModalOpen(false);
      setExpToDelete(null);
      await refreshExperiences();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete experience";
      showFeedback("error", errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Experience
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {experiences.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your career history, milestones, and employment details
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Add Experience</span>
        </button>
      </div>

      {/* Dismissible Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-fade-in ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle size={16} className="shrink-0 text-red-400" />
            )}
            <span className="font-medium leading-relaxed">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Experience List / Timeline presentation */}
      {experiences.length === 0 ? (
        <div className="p-12 rounded-3xl bg-card border border-border text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <Briefcase size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              No experiences added yet
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Showcase your career history by adding past or current positions, roles, and achievements.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus size={14} />
            <span>Add your first experience</span>
          </button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:top-3 before:bottom-3 before:left-2.5 sm:before:left-3.5 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-border before:to-transparent">
          {experiences.map((exp) => {
            const typeStyle =
              TYPE_STYLES[exp.type || "Full-time"] ||
              "text-muted-foreground bg-muted border-border";

            return (
              <div key={exp._id} className="relative group">
                {/* Timeline node icon / dot */}
                <div className="absolute -left-6 sm:-left-8 top-4 -translate-x-1/2 w-6 h-6 rounded-full bg-card border-2 border-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>

                {/* Experience Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border hover:border-border/80 hover:shadow-lg transition-all space-y-4">
                  {/* Top row: Role, Company, Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-foreground tracking-tight">
                          {exp.role}
                        </h3>

                        {exp.current && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Current Role
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${typeStyle}`}
                        >
                          {exp.type || "Full-time"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-medium text-foreground/90">
                          <Building size={13} className="text-muted-foreground" />
                          <span>{exp.company}</span>
                          {exp.companyUrl && (
                            <a
                              href={exp.companyUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="text-muted-foreground hover:text-emerald-400 transition-colors inline-flex items-center"
                              title="Visit company website"
                            >
                              <ExternalLink size={12} className="ml-0.5" />
                            </a>
                          )}
                        </div>

                        {exp.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={13} className="text-muted-foreground" />
                            <span>{exp.location}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-emerald-400/90 font-medium">
                          <Calendar size={13} />
                          <span>{exp.period}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons & Order badge */}
                    <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        #{exp.order}
                      </span>
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit experience"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(exp)}
                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                        title="Delete experience"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Bullet points list */}
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="space-y-1.5 pt-1">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li
                          key={bIdx}
                          className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0 mt-1.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Technology / skill tags */}
                  {exp.tags && exp.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {exp.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-muted/60 text-[11px] font-medium text-muted-foreground border border-border/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT EXPERIENCE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    {modalMode === "create"
                      ? "Add Professional Experience"
                      : "Edit Experience"}
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {modalMode === "create"
                      ? "Add details about your employment history or career milestone"
                      : "Update this experience entry"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Role & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <span>Role / Job Title</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <span>Company Name</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.company}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value })
                    }
                    placeholder="e.g. Acme Innovations"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Company Website & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Company Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={form.companyUrl}
                    onChange={(e) =>
                      setForm({ ...form, companyUrl: e.target.value })
                    }
                    placeholder="https://company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    placeholder="e.g. Remote, San Francisco, CA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Period & Employment Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <span>Period / Duration</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.period}
                    onChange={(e) =>
                      setForm({ ...form, period: e.target.value })
                    }
                    placeholder="e.g. 2023 – Present or Jan 2022 – Dec 2023"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Format as preferred (e.g. &apos;2023 – Present&apos; or &apos;2021 – 2023&apos;)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Employment Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  >
                    {EMPLOYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Current Role toggle & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.current}
                    onChange={(e) =>
                      setForm({ ...form, current: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500/30 border-border"
                  />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Current Position
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      I currently work in this role
                    </span>
                  </div>
                </label>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Bullet Points / Responsibilities list */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-foreground block">
                      Key Responsibilities & Achievements
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      Add bullet points highlighting your impact
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-[11px] font-medium transition-colors"
                  >
                    <Plus size={12} />
                    <span>Add Bullet</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {form.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 text-[10px] font-medium text-muted-foreground text-center shrink-0">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) =>
                          handleBulletChange(idx, e.target.value)
                        }
                        placeholder="e.g. Led redesign of the checkout flow, improving conversion by 24%..."
                        className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(idx)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                        title="Remove bullet"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technologies / Tags */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <label className="text-xs font-semibold text-foreground">
                  Technologies / Skills Used
                </label>
                <input
                  type="text"
                  value={form.tagsInput}
                  onChange={(e) =>
                    setForm({ ...form, tagsInput: e.target.value })
                  }
                  placeholder="e.g. React, Next.js, TypeScript, Tailwind CSS, GraphQL"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
                <p className="text-[10px] text-muted-foreground">
                  Separate multiple tags with commas
                </p>

                {form.tagsInput.trim() && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {form.tagsInput
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-[11px] font-medium text-emerald-400 border border-emerald-500/20"
                        >
                          {t}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>
                        {modalMode === "create"
                          ? "Create Experience"
                          : "Save Changes"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && expToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-foreground">
                Delete Experience?
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  &ldquo;{expToDelete.role}&rdquo;
                </span>{" "}
                at{" "}
                <span className="font-semibold text-foreground">
                  {expToDelete.company}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setExpToDelete(null);
                }}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
