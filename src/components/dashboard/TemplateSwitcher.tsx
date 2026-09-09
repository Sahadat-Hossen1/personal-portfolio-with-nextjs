"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Code2,
  Video,
  TrendingUp,
  Stethoscope,
  Sparkles,
  Check,
  ArrowRight,
} from "lucide-react";
import type { TemplateId } from "@/types/portfolio";

interface TemplateMeta {
  id: TemplateId;
  name: string;
  badge: string;
  description: string;
  features: string[];
  icon: typeof Code2;
  gradient: string;
  borderActive: string;
  badgeBg: string;
}

const TEMPLATE_METADATA: Record<TemplateId, TemplateMeta> = {
  developer: {
    id: "developer",
    name: "Developer Theme",
    badge: "Tech & Engineering",
    description:
      "Modern dark aesthetic with neon accents, code snippets, tech stack tags, and GitHub stats tailored for software engineers.",
    features: ["Syntax Highlights", "Tech Tag Filter", "GitHub & Project Links"],
    icon: Code2,
    gradient: "from-blue-600/20 via-indigo-600/10 to-purple-600/20",
    borderActive: "border-indigo-500 shadow-indigo-500/20",
    badgeBg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  },
  "video-editor": {
    id: "video-editor",
    name: "Video Editor Theme",
    badge: "Cinematic & Motion",
    description:
      "Dark cinematic showcase designed for video editors, motion graphic artists, and colorists with video-centric layouts.",
    features: ["Cinematic Cards", "Showreel Focus", "Visual Showcase"],
    icon: Video,
    gradient: "from-amber-600/20 via-rose-600/10 to-purple-600/20",
    borderActive: "border-amber-500 shadow-amber-500/20",
    badgeBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  "digital-marketer": {
    id: "digital-marketer",
    name: "Digital Marketer Theme",
    badge: "Growth & Analytics",
    description:
      "Performance-focused layout emphasizing KPIs, conversion metrics, campaign case studies, and measurable marketing impact.",
    features: ["Conversion Metrics", "Campaign Badges", "ROI Highlights"],
    icon: TrendingUp,
    gradient: "from-emerald-600/20 via-teal-600/10 to-cyan-600/20",
    borderActive: "border-emerald-500 shadow-emerald-500/20",
    badgeBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  doctor: {
    id: "doctor",
    name: "Medical Doctor Theme",
    badge: "Clinical & Healthcare",
    description:
      "Clean, reassuring medical presentation tailored for physicians, healthcare providers, and medical consultants.",
    features: ["Clinical Profile", "Consultation Focus", "Trustworthy Style"],
    icon: Stethoscope,
    gradient: "from-cyan-600/20 via-blue-600/10 to-teal-600/20",
    borderActive: "border-cyan-500 shadow-cyan-500/20",
    badgeBg: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  },
};

interface TemplateSwitcherProps {
  initialSelectedTemplate: TemplateId;
  allowedTemplates: TemplateId[];
  userRole?: string;
}

export default function TemplateSwitcher({
  initialSelectedTemplate,
  allowedTemplates,
  userRole,
}: TemplateSwitcherProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(
    initialSelectedTemplate
  );
  const [savingTemplateId, setSavingTemplateId] = useState<TemplateId | null>(
    null
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((current) => (current?.message === message ? null : current));
    }, 5000);
  };

  const handleSelectTemplate = async (templateId: TemplateId) => {
    if (templateId === selectedTemplate || savingTemplateId) return;

    setSavingTemplateId(templateId);

    try {
      // Send strictly selectedTemplate in the payload (Payload hygiene)
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedTemplate: templateId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update portfolio template");
      }

      setSelectedTemplate(templateId);
      showFeedback(
        "success",
        `Active presentation template switched to "${TEMPLATE_METADATA[templateId]?.name || templateId}".`
      );

      router.refresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to update portfolio template.";
      showFeedback("error", msg);
    } finally {
      setSavingTemplateId(null);
    }
  };

  // Only render templates that are in allowedTemplates
  const availableTemplates = allowedTemplates
    .map((id) => TEMPLATE_METADATA[id])
    .filter(Boolean);

  const activeMeta = TEMPLATE_METADATA[selectedTemplate] || TEMPLATE_METADATA.developer;
  const ActiveIcon = activeMeta.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dismissible Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-fade-in ${
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
            <span className="font-medium leading-relaxed">
              {feedback.message}
            </span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Dismiss feedback"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Current Active Banner */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <ActiveIcon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Current Active Template
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  LIVE
                </span>
              </div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {activeMeta.name}
              </h2>
            </div>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground transition-colors self-start sm:self-auto"
          >
            <span>Preview Portfolio</span>
            <ArrowRight size={13} />
          </a>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {activeMeta.description}
        </p>

        {userRole === "superadmin" && (
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-semibold">
              <Sparkles size={12} />
              <span>Superadmin Privileges: Unrestricted Template Access</span>
            </span>
          </div>
        )}
      </div>

      {/* Available Templates Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Available Presentation Templates
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select one of your authorized templates to instantly re-theme your portfolio presentation
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {availableTemplates.length} authorized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableTemplates.map((meta) => {
            const isActive = meta.id === selectedTemplate;
            const isSaving = savingTemplateId === meta.id;
            const IconComponent = meta.icon;

            return (
              <div
                key={meta.id}
                className={`relative rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between gap-5 bg-card/60 hover:bg-card ${
                  isActive
                    ? `border-2 ${meta.borderActive} shadow-lg bg-card`
                    : "border-border hover:border-border/80"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon + Badge + Active indicator */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br ${meta.gradient} border border-border`}
                      >
                        <IconComponent size={20} className="text-foreground" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">
                          {meta.name}
                        </h4>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${meta.badgeBg}`}
                        >
                          {meta.badge}
                        </span>
                      </div>
                    </div>

                    {isActive && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500 text-white shadow-sm">
                        <Check size={12} />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {meta.description}
                  </p>

                  {/* Feature Highlights */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {meta.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-0.5 rounded-lg bg-muted text-[11px] text-muted-foreground font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Select Action */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-end">
                  {isActive ? (
                    <button
                      type="button"
                      disabled
                      aria-pressed="true"
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold cursor-default flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} />
                      <span>Currently Applied</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectTemplate(meta.id)}
                      disabled={!!savingTemplateId}
                      aria-label={`Switch to ${meta.name}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-md transition-all disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Applying...</span>
                        </>
                      ) : (
                        <>
                          <Layers size={13} />
                          <span>Apply Template</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
