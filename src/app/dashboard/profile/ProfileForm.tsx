"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  User,
  FileText,
  MapPin,
  Phone,
  MessageSquare,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { TemplateId, SectionVisibilityData } from "@/types/portfolio";

interface ProfileFormProps {
  initialProfile: {
    name: string;
    bioBlurb: string;
    statusText: string;
    statusAvailable: boolean;
    aboutTitle: string;
    aboutP1: string;
    aboutP2: string;
    currentlyBuilding: string;
    location: string;
    phone: string;
    whatsappNumber: string;
    selectedTemplate?: TemplateId;
    sections?: SectionVisibilityData;
  };
  allowedTemplates: TemplateId[];
  userEmail: string;
  username: string;
  profession: string;
}

export default function ProfileForm({
  initialProfile,
  allowedTemplates,
  userEmail,
  username,
  profession,
}: ProfileFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: initialProfile.name || "",
    bioBlurb: initialProfile.bioBlurb || "",
    statusText: initialProfile.statusText || "",
    statusAvailable: initialProfile.statusAvailable ?? true,
    aboutTitle: initialProfile.aboutTitle || "",
    aboutP1: initialProfile.aboutP1 || "",
    aboutP2: initialProfile.aboutP2 || "",
    currentlyBuilding: initialProfile.currentlyBuilding || "",
    location: initialProfile.location || "",
    phone: initialProfile.phone || "",
    whatsappNumber: initialProfile.whatsappNumber || "",
    selectedTemplate: (initialProfile.selectedTemplate ||
      allowedTemplates[0] ||
      "developer") as TemplateId,
    sections: {
      hero: initialProfile.sections?.hero ?? true,
      about: initialProfile.sections?.about ?? true,
      skills: initialProfile.sections?.skills ?? true,
      projects: initialProfile.sections?.projects ?? true,
      experience: initialProfile.sections?.experience ?? true,
      contact: initialProfile.sections?.contact ?? true,
      floatingChat: initialProfile.sections?.floatingChat ?? false,
    },
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Send safe update payload to /api/profile
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to update profile");
      }

      setSuccessMessage("Profile updated successfully!");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleSectionToggle = (key: keyof SectionVisibilityData) => {
    setFormData((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [key]: !prev.sections[key],
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      {/* Feedback alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Account Info Card (Read-only System Meta) */}
      <div className="p-6 rounded-3xl bg-muted/20 border border-border space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Sparkles size={14} className="text-indigo-400" />
          <span>Account Authorization Details (Read-Only)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block">Email</span>
            <span className="font-semibold text-foreground">{userEmail}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Username Slug</span>
            <span className="font-mono text-indigo-400">@{username}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Registered Profession</span>
            <span className="font-medium text-foreground capitalize">
              {profession.replace("-", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Template Presentation Card */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground">Template Configuration</h2>
            <p className="text-xs text-muted-foreground">
              Select which presentation theme to apply to your portfolio
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2">
            Selected Template
          </label>
          <select
            value={formData.selectedTemplate}
            onChange={(e) =>
              setFormData({
                ...formData,
                selectedTemplate: e.target.value as TemplateId,
              })
            }
            className="w-full sm:max-w-md px-3.5 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
          >
            {allowedTemplates.map((t) => (
              <option key={t} value={t}>
                {t.replace("-", " ").toUpperCase()}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground mt-2">
            Only templates authorized for your account are displayed. Server authorization
            strictly verifies access upon save.
          </p>
        </div>
      </div>

      {/* Personal Identity Fields */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <User size={18} />
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground">Identity & Bio</h2>
            <p className="text-xs text-muted-foreground">
              Your name and introductory information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Status Tagline
            </label>
            <input
              type="text"
              value={formData.statusText}
              onChange={(e) => setFormData({ ...formData, statusText: e.target.value })}
              placeholder="Available for opportunities"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            Short Bio Blurb
          </label>
          <textarea
            rows={3}
            value={formData.bioBlurb}
            onChange={(e) => setFormData({ ...formData, bioBlurb: e.target.value })}
            placeholder="A brief summary of what you build and what drives you..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            Currently Building
          </label>
          <input
            type="text"
            value={formData.currentlyBuilding}
            onChange={(e) =>
              setFormData({ ...formData, currentlyBuilding: e.target.value })
            }
            placeholder="e.g. SaaS Analytics Dashboard"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* About Section Detailed Content */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <FileText size={18} />
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground">About Section Details</h2>
            <p className="text-xs text-muted-foreground">
              Elaborate story for your about section
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            About Section Title
          </label>
          <input
            type="text"
            value={formData.aboutTitle}
            onChange={(e) => setFormData({ ...formData, aboutTitle: e.target.value })}
            placeholder="e.g. Crafting digital experiences"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            About Paragraph 1
          </label>
          <textarea
            rows={3}
            value={formData.aboutP1}
            onChange={(e) => setFormData({ ...formData, aboutP1: e.target.value })}
            placeholder="Introduction to your background and core technical stack..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            About Paragraph 2
          </label>
          <textarea
            rows={3}
            value={formData.aboutP2}
            onChange={(e) => setFormData({ ...formData, aboutP2: e.target.value })}
            placeholder="Additional details on expertise, focus areas, and goals..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Contact & Location Details */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <MapPin size={18} />
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground">Contact & Location</h2>
            <p className="text-xs text-muted-foreground">
              Direct connection options for portfolio visitors
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <MapPin size={14} /> Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Country"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Phone size={14} /> Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 890"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <MessageSquare size={14} /> WhatsApp Number
            </label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) =>
                setFormData({ ...formData, whatsappNumber: e.target.value })
              }
              placeholder="1234567890"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-transparent text-sm text-foreground focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>

      {/* Section Visibility Toggles */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
        <h3 className="font-bold text-base text-foreground">Section Visibility</h3>
        <p className="text-xs text-muted-foreground">
          Toggle which sections are visible on your live portfolio
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
          {(Object.keys(formData.sections) as (keyof SectionVisibilityData)[]).map((sec) => {
            const isEnabled = formData.sections[sec];
            return (
              <button
                key={sec}
                type="button"
                onClick={() => handleSectionToggle(sec)}
                className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                  isEnabled
                    ? "bg-indigo-500/10 border-indigo-500/40 text-foreground"
                    : "bg-muted/20 border-border text-muted-foreground"
                }`}
              >
                <span className="capitalize">{sec.replace(/([A-Z])/g, " $1")}</span>
                {isEnabled ? (
                  <ToggleRight size={18} className="text-indigo-400" />
                ) : (
                  <ToggleLeft size={18} className="text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Action */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Profile Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
