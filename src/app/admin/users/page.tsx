"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  SlidersHorizontal,
  ExternalLink,
  Check,
  RotateCw,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import {
  FeatureKey,
  getAllFeatureDefinitions,
} from "@/lib/entitlements/features";
import { getPlanDefaultEntitlements } from "@/lib/entitlements/plans";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  username: string;
  profession: string;
  role: "superadmin" | "user";
  plan: "free" | "premium";
  allowedTemplates: string[];
  selectedTemplate: string;
  featureOverrides?: Partial<Record<FeatureKey, boolean>>;
  effectiveEntitlements?: Record<FeatureKey, boolean>;
  createdAt: string;
  updatedAt: string;
}

interface UserDetailCounts {
  projects: number;
  skills: number;
  experiences: number;
  messages: number;
}

interface UserDetailResponse {
  user: AdminUser;
  profile: {
    selectedTemplate: string;
    bioBlurb: string;
    roles: string[];
    avatarUrl: string;
    location: string;
    statusText: string;
    updatedAt: string;
  } | null;
  counts: UserDetailCounts;
}

const TEMPLATE_OPTIONS = [
  { id: "developer", label: "Software Developer", icon: "💻" },
  { id: "video-editor", label: "Video Editor", icon: "🎬" },
  { id: "digital-marketer", label: "Digital Marketer", icon: "📈" },
  { id: "doctor", label: "Medical Doctor", icon: "🩺" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [professionFilter, setProfessionFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Modal State
  const [activeUser, setActiveUser] = useState<AdminUser | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalDetails, setModalDetails] = useState<UserDetailResponse | null>(null);
  const [editPlan, setEditPlan] = useState<"free" | "premium">("free");
  const [editAllowedTemplates, setEditAllowedTemplates] = useState<string[]>([]);
  const [editFeatureOverrides, setEditFeatureOverrides] = useState<
    Record<FeatureKey, boolean | null>
  >({
    projects: null,
    skills: null,
    experience: null,
    messages: null,
    custom_sections: null,
    floating_chat: null,
    advanced_seo: null,
  });
  const [modalSaving, setModalSaving] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      if (search.trim()) params.set("search", search.trim());
      if (professionFilter) params.set("profession", professionFilter);
      if (planFilter) params.set("plan", planFilter);
      if (roleFilter) params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.data) {
        setUsers(data.data.users || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setTotalUsers(data.data.pagination?.totalUsers || 0);
      }
    } catch (err) {
      console.error("Failed to load platform users:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, professionFilter, planFilter, roleFilter]);

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (search.trim()) params.set("search", search.trim());
    if (professionFilter) params.set("profession", professionFilter);
    if (planFilter) params.set("plan", planFilter);
    if (roleFilter) params.set("role", roleFilter);

    fetch(`/api/admin/users?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success && data.data) {
          setUsers(data.data.users || []);
          setTotalPages(data.data.pagination?.totalPages || 1);
          setTotalUsers(data.data.pagination?.totalUsers || 0);
        }
      })
      .catch((err) => {
        console.error("Failed to load platform users:", err);
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [page, limit, search, professionFilter, planFilter, roleFilter]);

  const handleOpenModal = async (user: AdminUser) => {
    setActiveUser(user);
    setEditPlan(user.plan);
    setEditAllowedTemplates([...user.allowedTemplates]);

    const initialOverrides: Record<FeatureKey, boolean | null> = {
      projects: null,
      skills: null,
      experience: null,
      messages: null,
      custom_sections: null,
      floating_chat: null,
      advanced_seo: null,
    };
    if (user.featureOverrides) {
      for (const [k, v] of Object.entries(user.featureOverrides)) {
        if (typeof v === "boolean") {
          initialOverrides[k as FeatureKey] = v;
        }
      }
    }
    setEditFeatureOverrides(initialOverrides);

    setModalFeedback(null);
    setModalLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${user._id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setModalDetails(data.data);
        if (data.data.user?.featureOverrides) {
          const fetchedOverrides = { ...initialOverrides };
          for (const [k, v] of Object.entries(data.data.user.featureOverrides)) {
            if (typeof v === "boolean") {
              fetchedOverrides[k as FeatureKey] = v;
            }
          }
          setEditFeatureOverrides(fetchedOverrides);
        }
      }
    } catch (err) {
      console.error("Failed to load user details:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setActiveUser(null);
    setModalDetails(null);
    setModalFeedback(null);
  };

  const handleToggleTemplate = (templateId: string) => {
    if (editAllowedTemplates.includes(templateId)) {
      if (editAllowedTemplates.length <= 1) {
        setModalFeedback({
          type: "error",
          message: "A user must have at least one allowed template.",
        });
        return;
      }
      setEditAllowedTemplates(editAllowedTemplates.filter((t) => t !== templateId));
    } else {
      setEditAllowedTemplates([...editAllowedTemplates, templateId]);
    }
  };

  const handleSaveEntitlements = async () => {
    if (!activeUser) return;
    if (editAllowedTemplates.length === 0) {
      setModalFeedback({
        type: "error",
        message: "A user must have at least one allowed template.",
      });
      return;
    }

    setModalSaving(true);
    setModalFeedback(null);

    try {
      const res = await fetch(`/api/admin/users/${activeUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: editPlan,
          allowedTemplates: editAllowedTemplates,
          featureOverrides: editFeatureOverrides,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update user entitlements.");
      }

      setModalFeedback({
        type: "success",
        message: "Entitlements updated successfully.",
      });

      // Update local user in table
      setUsers((prev) =>
        prev.map((u) =>
          u._id === activeUser._id
            ? {
                ...u,
                plan: editPlan,
                allowedTemplates: editAllowedTemplates,
                featureOverrides: Object.fromEntries(
                  Object.entries(editFeatureOverrides).filter(
                    ([, v]) => typeof v === "boolean"
                  )
                ) as Partial<Record<FeatureKey, boolean>>,
              }
            : u
        )
      );

      // Refresh list after brief moment
      setTimeout(() => {
        fetchUsers();
      }, 1000);
    } catch (err: unknown) {
      setModalFeedback({
        type: "error",
        message: (err as Error).message || "Failed to save changes.",
      });
    } finally {
      setModalSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users size={22} />
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Platform Tenants & Users
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Superadmin directory: inspect registered tenants, manage subscription plans,
            and grant template access.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-card border border-border text-muted-foreground">
            Total Users: <strong className="text-foreground">{totalUsers}</strong>
          </span>
          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh Users List"
          >
            <RotateCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or @username..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/50"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
          <select
            value={professionFilter}
            onChange={(e) => {
              setProfessionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-indigo-500/50 cursor-pointer"
          >
            <option value="">All Professions</option>
            <option value="developer">Software Developer</option>
            <option value="digital-marketer">Digital Marketer</option>
            <option value="video-editor">Video Editor</option>
            <option value="doctor">Medical Doctor</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-indigo-500/50 cursor-pointer"
          >
            <option value="">All Plans</option>
            <option value="free">Free Plan</option>
            <option value="premium">Premium Plan</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-indigo-500/50 cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Portfolio Link</th>
                <th className="py-3 px-4">Profession</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Selected Template</th>
                <th className="py-3 px-4">Allowed</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <Loader2 size={24} className="animate-spin mx-auto text-indigo-400 mb-2" />
                    <span>Loading platform users...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    No platform users found matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* User Identity */}
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-foreground truncate max-w-[140px]">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Username & Live Link */}
                    <td className="py-3.5 px-4">
                      {user.username ? (
                        <Link
                          href={`/p/${user.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 hover:underline"
                        >
                          <span>/p/{user.username}</span>
                          <ExternalLink size={12} />
                        </Link>
                      ) : (
                        <span className="text-muted-foreground italic">No slug</span>
                      )}
                    </td>

                    {/* Profession */}
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground">
                        {user.profession.replace(/-/g, " ")}
                      </span>
                    </td>

                    {/* Plan */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`capitalize px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          user.plan === "premium"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {user.plan}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`capitalize px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          user.role === "superadmin"
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "text-muted-foreground"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Selected Template */}
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-semibold">
                        {user.selectedTemplate.replace(/-/g, " ")}
                      </span>
                    </td>

                    {/* Allowed Count */}
                    <td className="py-3.5 px-4">
                      <span className="text-muted-foreground text-[11px]">
                        {user.allowedTemplates?.length || 1} templates
                      </span>
                    </td>

                    {/* Registered Date */}
                    <td className="py-3.5 px-4 text-muted-foreground text-[11px] whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-indigo-500 hover:border-indigo-500 hover:text-white text-muted-foreground transition-all text-xs font-semibold cursor-pointer shadow-sm"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            Page <strong className="text-foreground">{page}</strong> of{" "}
            <strong className="text-foreground">{totalPages}</strong> (
            {totalUsers} total users)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* User Entitlements Management Modal */}
      {activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border p-6 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-semibold mb-2">
                <SlidersHorizontal size={12} />
                <span>Superadmin Entitlement Control</span>
              </div>
              <h2 className="text-lg font-black text-foreground tracking-tight">
                Manage {activeUser.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure account tier plan and authorized portfolio presentation templates.
              </p>
            </div>

            {/* Feedback Alert */}
            {modalFeedback && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                  modalFeedback.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                }`}
              >
                {modalFeedback.type === "success" ? (
                  <Check size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>{modalFeedback.message}</span>
              </div>
            )}

            {modalLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                <Loader2 size={24} className="animate-spin mx-auto text-indigo-400 mb-2" />
                <span className="text-xs">Loading tenant statistics...</span>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Resource Stats Strip */}
                {modalDetails?.counts && (
                  <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-muted/40 border border-border text-center">
                    <div>
                      <div className="font-bold text-foreground text-sm">
                        {modalDetails.counts.projects}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Projects</div>
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-sm">
                        {modalDetails.counts.skills}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Skills</div>
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-sm">
                        {modalDetails.counts.experiences}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Experience</div>
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-sm">
                        {modalDetails.counts.messages}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Inquiries</div>
                    </div>
                  </div>
                )}

                {/* Plan Selection */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Account Subscription Plan
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditPlan("free")}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        editPlan === "free"
                          ? "bg-indigo-500/10 border-indigo-500/50 text-foreground shadow-sm"
                          : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">Free Tier</span>
                        {editPlan === "free" && (
                          <div className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                            <Check size={10} />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Standard platform portfolio access
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditPlan("premium")}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        editPlan === "premium"
                          ? "bg-emerald-500/10 border-emerald-500/50 text-foreground shadow-sm"
                          : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-emerald-400">Premium Tier</span>
                        {editPlan === "premium" && (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <Check size={10} />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        All templates & priority platform privileges
                      </p>
                    </button>
                  </div>
                </div>

                {/* Allowed Templates Checkboxes */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Authorized Presentation Templates
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {TEMPLATE_OPTIONS.map((tmpl) => {
                      const isChecked = editAllowedTemplates.includes(tmpl.id);
                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => handleToggleTemplate(tmpl.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isChecked
                              ? "bg-indigo-500/10 border-indigo-500/40 text-foreground font-medium"
                              : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{tmpl.icon}</span>
                            <span className="text-xs">{tmpl.label}</span>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                              isChecked
                                ? "bg-indigo-500 border-indigo-500 text-white"
                                : "border-border"
                            }`}
                          >
                            {isChecked && <Check size={12} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    User can switch between any of these templates in their dashboard.
                  </p>
                </div>

                {/* Feature Access Overrides (Entitlements) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Feature Access Overrides (Entitlements)
                    </label>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      User Override &gt; Plan Default
                    </span>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {getAllFeatureDefinitions().map((feat) => {
                      const planDefaults = getPlanDefaultEntitlements(editPlan);
                      const isDefaultEnabled = planDefaults[feat.key];
                      const currentOverride = editFeatureOverrides[feat.key];

                      return (
                        <div
                          key={feat.key}
                          className="p-2.5 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">
                                {feat.name}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                                  isDefaultEnabled
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-muted text-muted-foreground border border-border"
                                }`}
                              >
                                {editPlan}: {isDefaultEnabled ? "Enabled" : "Disabled"}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                              {feat.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() =>
                                setEditFeatureOverrides((prev) => ({
                                  ...prev,
                                  [feat.key]: null,
                                }))
                              }
                              className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
                                currentOverride === null
                                  ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                                  : "text-muted-foreground hover:text-foreground border border-transparent"
                              }`}
                              title="Inherit state from plan default"
                            >
                              Default
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditFeatureOverrides((prev) => ({
                                  ...prev,
                                  [feat.key]: true,
                                }))
                              }
                              className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
                                currentOverride === true
                                  ? "bg-emerald-500 text-white shadow-xs"
                                  : "text-muted-foreground hover:text-emerald-400 border border-transparent"
                              }`}
                              title="Force enable feature override"
                            >
                              Force ON
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditFeatureOverrides((prev) => ({
                                  ...prev,
                                  [feat.key]: false,
                                }))
                              }
                              className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
                                currentOverride === false
                                  ? "bg-rose-500 text-white shadow-xs"
                                  : "text-muted-foreground hover:text-rose-400 border border-transparent"
                              }`}
                              title="Force disable feature override"
                            >
                              Force OFF
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    Setting an override explicitly forces a feature ON or OFF. &quot;Default&quot; inherits directly from the {editPlan} plan.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEntitlements}
                    disabled={modalSaving}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {modalSaving && <Loader2 size={14} className="animate-spin" />}
                    <span>Save Entitlements</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
