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
  Lock,
  ArrowUpRight,
} from "lucide-react";
import type { TemplateId, SectionVisibilityData } from "@/types/portfolio";
import { useEntitlements } from "@/components/dashboard/EntitlementsContext";
import { FeatureKey } from "@/lib/entitlements/features";

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
  const { hasFeature, getFeature, openUpgradeModal } = useEntitlements();

  const canUseFloatingChat = hasFeature("floating_chat");
  const canUseCustomSections = hasFeature("custom_sections");
  const canUseAdvancedSeo = hasFeature("advanced_seo");

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
  const [entitlementErrorKey, setEntitlementErrorKey] = useState<FeatureKey | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");
    setEntitlementErrorKey(null);

    // Entitlement Safeguard: sanitize sections according to verified entitlements
    const safeSections: SectionVisibilityData = { ...formData.sections };
    if (!canUseFloatingChat) {
      safeSections.floatingChat = false;
    }
    if (!canUseCustomSections) {
      safeSections.hero = true;
      safeSections.about = true;
      safeSections.skills = true;
      safeSections.projects = true;
      safeSections.experience = true;
      safeSections.contact = true;
    }

    const payload = {
      ...formData,
      sections: safeSections,
    };

    try {
      // Send safe update payload to /api/profile
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        if (result.code === "FEATURE_UNAVAILABLE") {
          const featureDef = result.feature ? getFeature(result.feature) : undefined;
          const featureName = featureDef?.name || result.feature || "This feature";
          setEntitlementErrorKey((result.feature as FeatureKey) || null);
          throw new Error(
            `The feature "${featureName}" requires the Premium plan. Your changes could not be saved.`
          );
        }
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
    // 1. Floating chat requires floating_chat entitlement
    if (key === "floatingChat" && !canUseFloatingChat) {
      openUpgradeModal("floating_chat");
      return;
    }

    // 2. Hiding standard sections requires custom_sections entitlement
    const standardKeys: (keyof SectionVisibilityData)[] = [
      "hero",
      "about",
      "skills",
      "projects",
      "experience",
      "contact",
    ];

    if (standardKeys.includes(key) && formData.sections[key] === true && !canUseCustomSections) {
      openUpgradeModal("custom_sections");
      return;
    }

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
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
          {entitlementErrorKey && (
            <button
              type="button"
              onClick={() => openUpgradeModal(entitlementErrorKey)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <Sparkles size={13} />
              <span>Explore Premium</span>
            </button>
          )}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-foreground">Section Visibility</h3>
            <p className="text-xs text-muted-foreground">
              Configure which sections appear on your live portfolio
            </p>
          </div>
          {!canUseCustomSections && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border self-start sm:self-auto">
              Standard Sections Default On
            </span>
          )}
        </div>

        {/* Free tier policy banner */}
        {(!canUseCustomSections || !canUseFloatingChat) && (
          <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-start sm:items-center gap-2">
              <Sparkles size={15} className="text-indigo-400 shrink-0 mt-0.5 sm:mt-0" />
              <span className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Plan Policy:</strong> Standard portfolio sections remain visible by default on the Free tier. Upgrade to customize visibility or enable the floating chat widget.
              </span>
            </div>
            <button
              type="button"
              onClick={() => openUpgradeModal()}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline shrink-0 cursor-pointer self-start sm:self-auto"
            >
              Explore Premium →
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {(Object.keys(formData.sections) as (keyof SectionVisibilityData)[]).map((sec) => {
            const isEnabled = formData.sections[sec];
            const isFloatingChat = sec === "floatingChat";
            const isStandardSection = !isFloatingChat;

            // Locked state evaluations
            const isFloatingChatLocked = isFloatingChat && !canUseFloatingChat;
            const isCustomSectionLocked = isStandardSection && !canUseCustomSections;

            if (isFloatingChatLocked) {
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => handleSectionToggle(sec)}
                  className="p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer bg-muted/15 border-border/80 border-dashed text-muted-foreground hover:border-amber-500/40 hover:bg-amber-500/5"
                  title="Interactive Floating Chat requires Premium plan"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Lock size={14} className="text-amber-400 shrink-0" />
                    <span className="truncate font-semibold">Floating Chat</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    PREMIUM
                  </span>
                </button>
              );
            }

            if (isCustomSectionLocked) {
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => handleSectionToggle(sec)}
                  className="p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer bg-indigo-500/5 border-indigo-500/20 text-foreground hover:border-indigo-500/40"
                  title="Hiding standard sections requires Section Visibility Customization (Premium)"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="capitalize truncate font-semibold">
                      {sec.replace(/([A-Z])/g, " $1")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-muted-foreground font-medium">Always On</span>
                    <ToggleRight size={18} className="text-indigo-400" />
                  </div>
                </button>
              );
            }

            // Normal unlocked state
            return (
              <button
                key={sec}
                type="button"
                onClick={() => handleSectionToggle(sec)}
                className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                  isEnabled
                    ? "bg-indigo-500/10 border-indigo-500/40 text-foreground"
                    : "bg-muted/20 border-border text-muted-foreground"
                }`}
              >
                <span className="capitalize truncate font-semibold">
                  {sec.replace(/([A-Z])/g, " $1")}
                </span>
                {isEnabled ? (
                  <ToggleRight size={18} className="text-indigo-400 shrink-0" />
                ) : (
                  <ToggleLeft size={18} className="text-muted-foreground shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced SEO & Social Sharing Card */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${canUseAdvancedSeo ? "bg-indigo-500/10 text-indigo-400" : "bg-muted text-muted-foreground"}`}>
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Advanced SEO & Social Sharing</h3>
              <p className="text-xs text-muted-foreground">
                Search engine indexing, rich OpenGraph cards, and social preview metadata
              </p>
            </div>
          </div>
          <div>
            {canUseAdvancedSeo ? (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Active on Account</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground inline-flex items-center gap-1">
                <Lock size={12} className="text-amber-400" />
                <span>Requires Premium</span>
              </span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            {canUseAdvancedSeo
              ? "Your public portfolio includes enhanced social preview metadata, rich OpenGraph tags, and priority sitemap indexing."
              : "Standard SEO is fully active. Advanced custom OpenGraph cards, enhanced social previews, and priority indexing are unlocked with the Premium plan."}
          </p>
          {!canUseAdvancedSeo && (
            <button
              type="button"
              onClick={() => openUpgradeModal("advanced_seo")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs transition-all shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <span>Unlock Advanced SEO</span>
              <ArrowUpRight size={13} />
            </button>
          )}
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

