"use client";

import { useEffect, useState } from "react";
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  MessageSquare,
  Share2,
  Sparkles,
  User,
  Cpu,
  FolderGit2,
  Briefcase,
  LayoutTemplate,
  Code2,
  Video,
  TrendingUp,
  Check,
  ExternalLink,
} from "lucide-react";
import { Github, Linkedin, Twitter, Whatsapp, Messenger } from "@/components/icons";
import type { TemplateId } from "@/types/portfolio";
import { isSupportedTemplateId } from "@/templates/index";

interface TemplateOption {
  id: TemplateId;
  name: string;
  tag: string;
  desc: string;
  icon: typeof Code2;
  previewUrl: string;
  features: string[];
  themeSummary: string;
  badgeClass: string;
  activeBorderClass: string;
  activeBgClass: string;
  activeGlowClass: string;
}

const templateOptions: TemplateOption[] = [
  {
    id: "developer",
    name: "Developer",
    tag: "Engineering & Software",
    desc: "Code-centric portfolio featuring a terminal typewriter hero, interactive skill proficiency bars, GitHub repository cards with star counts, and engineering timeline.",
    icon: Code2,
    previewUrl: "/?template=developer",
    features: ["Typewriter Hero", "GitHub Repos & Stars", "Tech Proficiency Bars"],
    themeSummary: "Modern Tech / Dark Accent",
    badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    activeBorderClass: "border-indigo-500 ring-2 ring-indigo-500/40",
    activeBgClass: "bg-indigo-500/[0.06]",
    activeGlowClass: "shadow-lg shadow-indigo-500/20",
  },
  {
    id: "video-editor",
    name: "Video Editor",
    tag: "Cinematic & Post-Production",
    desc: "Cinematic media-heavy showcase featuring full-width showreel hero banner, 16:9 widescreen video gallery with interactive video modal player, and post-production software toolkit.",
    icon: Video,
    previewUrl: "/?template=video-editor",
    features: ["Showreel Hero Player", "16:9 Video Gallery & Modal", "Editing Software Suite"],
    themeSummary: "Cinematic Zinc-950 / Red Highlights",
    badgeClass: "bg-red-500/10 text-red-400 border-red-500/30",
    activeBorderClass: "border-red-500 ring-2 ring-red-500/40",
    activeBgClass: "bg-red-500/[0.06]",
    activeGlowClass: "shadow-lg shadow-red-500/20",
  },
  {
    id: "digital-marketer",
    name: "Digital Marketer",
    tag: "Executive & Growth Strategy",
    desc: "Data-driven executive consulting portfolio featuring live KPI metric counters, Problem → Strategy → Results case study cards with detail modal, and MarTech growth stack.",
    icon: TrendingUp,
    previewUrl: "/?template=digital-marketer",
    features: ["KPI Metric Counters", "Case Study Modals", "MarTech Growth Stack"],
    themeSummary: "Executive Slate-950 / Emerald Accents",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    activeBorderClass: "border-emerald-500 ring-2 ring-emerald-500/40",
    activeBgClass: "bg-emerald-500/[0.06]",
    activeGlowClass: "shadow-lg shadow-emerald-500/20",
  },
];

const sectionConfigs = [
  {
    key: "hero",
    title: "Hero Section",
    icon: Sparkles,
    desc: "Top introductory banner with typewriter effect, bio blurb, and avatar photo.",
  },
  {
    key: "about",
    title: "About Me Section",
    icon: User,
    desc: "Detailed background story, currently building badge, metric cards, and key highlights.",
  },
  {
    key: "skills",
    title: "Skills & Tech Stack",
    icon: Cpu,
    desc: "Skill proficiency cards, category filter tabs, and familiar technologies pills.",
  },
  {
    key: "projects",
    title: "Projects Showcase",
    icon: FolderGit2,
    desc: "Featured case studies, GitHub repo links, live demo buttons, and project grid.",
  },
  {
    key: "experience",
    title: "Experience Timeline",
    icon: Briefcase,
    desc: "Work history journey, role details, company links, and achievement bullets.",
  },
  {
    key: "contact",
    title: "Contact Section",
    icon: Mail,
    desc: "Interactive inquiry form, primary email/phone details, and location card.",
  },
  {
    key: "floatingChat",
    title: "Floating Chat Widget",
    icon: MessageSquare,
    desc: "Bottom-right corner WhatsApp & Messenger instant messaging popup bubble.",
  },
];

const socialPlatformIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  whatsapp: Whatsapp,
  email: Mail,
  twitter: Twitter,
};

export default function SettingsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [switchingTemplate, setSwitchingTemplate] = useState<TemplateId | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState<{
    email: string;
    phone: string;
    location: string;
    whatsappNumber: string;
    whatsappMessage: string;
    messengerUrl: string;
    chatWhatsAppEnabled: boolean;
    chatMessengerEnabled: boolean;
    selectedTemplate: TemplateId;
    socials: Array<{
      platform: string;
      label: string;
      value: string;
      href: string;
      enabled?: boolean;
    }>;
    sections: {
      hero: boolean;
      about: boolean;
      skills: boolean;
      projects: boolean;
      experience: boolean;
      contact: boolean;
      floatingChat: boolean;
    };
  }>({
    email: "",
    phone: "",
    location: "",
    whatsappNumber: "",
    whatsappMessage: "",
    messengerUrl: "",
    chatWhatsAppEnabled: true,
    chatMessengerEnabled: true,
    selectedTemplate: "developer",
    socials: [
      { platform: "github", label: "GitHub", value: "", href: "", enabled: true },
      { platform: "linkedin", label: "LinkedIn", value: "", href: "", enabled: true },
      { platform: "whatsapp", label: "Whatsapp", value: "", href: "", enabled: true },
      { platform: "email", label: "Email", value: "", href: "", enabled: true },
      { platform: "twitter", label: "Twitter", value: "", href: "", enabled: true },
    ],
    sections: {
      hero: true,
      about: true,
      skills: true,
      projects: true,
      experience: true,
      contact: true,
      floatingChat: true,
    },
  });

  useEffect(() => {
    let isCancelled = false;

    async function loadSettings() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (!isCancelled && data.success && data.data) {
          setForm({
            email: data.data.email || "",
            phone: data.data.phone || "",
            location: data.data.location || "",
            whatsappNumber: data.data.whatsappNumber || "8801606081657",
            whatsappMessage:
              data.data.whatsappMessage ||
              "Hi Sahadat, I visited your portfolio and would like to connect!",
            messengerUrl:
              data.data.messengerUrl || "https://m.me/sahadat.hossen.1435",
            chatWhatsAppEnabled: data.data.chatWhatsAppEnabled !== false,
            chatMessengerEnabled: data.data.chatMessengerEnabled !== false,
            selectedTemplate: (data.data.selectedTemplate as TemplateId) || "developer",
            socials: data.data.socials?.length
              ? data.data.socials.map((s: { platform: string; label: string; value: string; href: string; enabled?: boolean }) => ({
                  ...s,
                  enabled: s.enabled !== false,
                }))
              : [
                  {
                    platform: "github",
                    label: "GitHub",
                    value: "github.com/Sahadat-Hossen1",
                    href: "https://github.com/Sahadat-Hossen1",
                    enabled: true,
                  },
                  {
                    platform: "linkedin",
                    label: "LinkedIn",
                    value: "linkedin.com/in/sahadathossen",
                    href: "https://linkedin.com/in/sahadathossen",
                    enabled: true,
                  },
                  {
                    platform: "whatsapp",
                    label: "Whatsapp",
                    value: "+8801606081657",
                    href: "https://wa.me/8801606081657",
                    enabled: true,
                  },
                  {
                    platform: "email",
                    label: "Email",
                    value: "sahadat.hossen1435@gmail.com",
                    href: "mailto:sahadat.hossen1435@gmail.com",
                    enabled: true,
                  },
                  {
                    platform: "twitter",
                    label: "Twitter",
                    value: "twitter.com",
                    href: "https://twitter.com",
                    enabled: true,
                  },
                ],
            sections: {
              hero: data.data.sections?.hero ?? true,
              about: data.data.sections?.about ?? true,
              skills: data.data.sections?.skills ?? true,
              projects: data.data.sections?.projects ?? true,
              experience: data.data.sections?.experience ?? true,
              contact: data.data.sections?.contact ?? true,
              floatingChat: data.data.sections?.floatingChat ?? true,
            },
          });
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to load settings:", err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleSelectTemplate = async (templateId: TemplateId) => {
    if (!isSupportedTemplateId(templateId)) return;
    if (form.selectedTemplate === templateId || switchingTemplate) return;

    setSwitchingTemplate(templateId);
    setForm((prev) => ({ ...prev, selectedTemplate: templateId }));
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedTemplate: templateId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to switch template");
      }
      const opt = templateOptions.find((t) => t.id === templateId);
      setMessage({
        type: "success",
        text: `Active template switched to "${opt?.name || templateId}"! The public portfolio (/) now renders this template.`,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to update template selection";
      setMessage({
        type: "error",
        text: errMsg,
      });
    } finally {
      setSwitchingTemplate(null);
    }
  };

  const handleToggleSection = (key: string) => {
    setForm((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [key]: !prev.sections[key as keyof typeof prev.sections],
      },
    }));
  };

  const handleEnableAll = () => {
    setForm((prev) => ({
      ...prev,
      sections: {
        hero: true,
        about: true,
        skills: true,
        projects: true,
        experience: true,
        contact: true,
        floatingChat: true,
      },
    }));
  };

  const handleSocialChange = (
    index: number,
    field: "value" | "href" | "enabled",
    val: string | boolean
  ) => {
    const nextSocials = [...form.socials];
    nextSocials[index] = { ...nextSocials[index], [field]: val };
    setForm({ ...form, socials: nextSocials });
  };

  const handleToggleSocial = (index: number) => {
    const nextSocials = [...form.socials];
    const current = nextSocials[index].enabled !== false;
    nextSocials[index] = { ...nextSocials[index], enabled: !current };
    setForm({ ...form, socials: nextSocials });
  };

  const handleEnableAllSocials = () => {
    const nextSocials = form.socials.map((s) => ({ ...s, enabled: true }));
    setForm({ ...form, socials: nextSocials });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Save failed");
      }
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to update settings";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl glass border border-border bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all";

  if (loading) {
    return (
      <div className="py-24 flex justify-center text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Sliders size={14} /> Configuration
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            General & <span className="gradient-text">Social Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your contact information, floating chat widget, and social profile links.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          <span>{saving ? "Saving..." : "Save Settings"}</span>
        </button>
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section: Active Portfolio Template Switcher */}
        <div className="glass rounded-3xl p-6 border border-border space-y-6">
          <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <LayoutTemplate size={18} className="text-indigo-400" />
                  Active Portfolio Template
                </h2>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  {templateOptions.find((t) => t.id === form.selectedTemplate)?.name || form.selectedTemplate} Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Select the active profession template for your public portfolio (<code className="text-foreground font-mono">/</code>). Changes save directly to MongoDB and take effect immediately.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-card border border-border hover:border-indigo-500/40 text-foreground flex items-center gap-1.5 transition-all hover:scale-[1.02]"
              >
                <span>View Live Site</span>
                <ExternalLink size={13} className="text-indigo-400" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {templateOptions.map((tpl) => {
              const Icon = tpl.icon;
              const isSelected = form.selectedTemplate === tpl.id;
              const isSwitching = switchingTemplate === tpl.id;

              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    if (!isSelected && !switchingTemplate) {
                      handleSelectTemplate(tpl.id);
                    }
                  }}
                  className={`relative p-5 rounded-2xl glass border transition-all duration-300 flex flex-col justify-between group ${
                    isSelected
                      ? `${tpl.activeBorderClass} ${tpl.activeBgClass} ${tpl.activeGlowClass}`
                      : "border-border hover:border-border hover:bg-card/60 cursor-pointer"
                  }`}
                >
                  {/* Active Ribbon Badge */}
                  {isSelected && (
                    <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                      <Check size={11} strokeWidth={3} />
                      <span>ACTIVE TEMPLATE</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Header with Icon and Title */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                            isSelected
                              ? "bg-foreground text-background shadow-md"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                            {tpl.name}
                          </h3>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium border inline-block mt-0.5 ${tpl.badgeClass}`}
                          >
                            {tpl.tag}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tpl.desc}
                    </p>

                    {/* Key features */}
                    <div className="space-y-1.5 pt-2 border-t border-border/60">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Key Features
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tpl.features.map((feat) => (
                          <span
                            key={feat}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between gap-2">
                    <a
                      href={tpl.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 hover:underline"
                      title="Preview this template without switching default"
                    >
                      <span>Preview</span>
                      <ExternalLink size={12} />
                    </a>

                    <button
                      type="button"
                      disabled={isSelected || switchingTemplate !== null}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSelected && !switchingTemplate) {
                          handleSelectTemplate(tpl.id);
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-default ${
                        isSelected
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:scale-105"
                      }`}
                    >
                      {isSwitching ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Switching...</span>
                        </>
                      ) : isSelected ? (
                        <>
                          <Check size={13} strokeWidth={2.5} />
                          <span>Active</span>
                        </>
                      ) : (
                        <span>Activate</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 0: Section Visibility Manager */}
        <div className="glass rounded-3xl p-6 border border-border space-y-5">
          <div className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sliders size={16} className="text-indigo-400" />
                Portfolio Section Visibility (Enable / Disable)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Toggle individual sections on or off. Disabled sections and their navigation links are automatically removed from the public website.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleEnableAll}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                Enable All
              </button>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/30">
                {Object.values(form.sections).filter(Boolean).length} / 7 Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionConfigs.map((sec) => {
              const Icon = sec.icon;
              const isEnabled = form.sections[sec.key as keyof typeof form.sections];
              return (
                <div
                  key={sec.key}
                  className={`p-4 rounded-2xl glass border transition-all flex items-start justify-between gap-3 ${
                    isEnabled
                      ? "border-border hover:border-indigo-500/40"
                      : "border-amber-500/30 dark:border-amber-500/20 bg-amber-500/[0.03]"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isEnabled
                          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {sec.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleSection(sec.key)}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border transition-all cursor-pointer ${
                            isEnabled
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25"
                          }`}
                          title={isEnabled ? "Click to disable" : "Click to enable"}
                        >
                          {isEnabled ? "Visible" : "Hidden (Click to Enable)"}
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        {sec.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                    {!isEnabled && (
                      <button
                        type="button"
                        onClick={() => handleToggleSection(sec.key)}
                        className="text-xs font-bold px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all hover:scale-105 cursor-pointer"
                      >
                        Enable
                      </button>
                    )}
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggleSection(sec.key)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 border border-zinc-400/50 dark:border-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500 peer-checked:border-indigo-600"></div>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 1: Contact Details */}
        <div className="glass rounded-3xl p-6 border border-border space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <Mail size={16} className="text-indigo-400" />
            1. Contact Details (Shown in Contact Section)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Primary Contact Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
                placeholder="sahadat.hossen1435@gmail.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
                placeholder="+8801606081657"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
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
          </div>
        </div>

        {/* Section 2: Floating Chat Widget Settings */}
        <div className="glass rounded-3xl p-6 border border-border space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <MessageSquare size={16} className="text-emerald-500 dark:text-emerald-400" />
                2. Floating Chat Widget Channels (WhatsApp & Messenger)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enable, disable, or remove individual chat channels from the floating popup.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                {[form.chatWhatsAppEnabled, form.chatMessengerEnabled].filter(Boolean).length} / 2 Channels Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WhatsApp Channel Card */}
            <div
              className={`p-4 rounded-2xl glass border transition-all space-y-3.5 ${
                form.chatWhatsAppEnabled
                  ? "border-border hover:border-emerald-500/30"
                  : "border-amber-500/30 dark:border-amber-500/20 bg-amber-500/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      form.chatWhatsAppEnabled
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    <Whatsapp size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">WhatsApp Channel</h3>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          chatWhatsAppEnabled: !form.chatWhatsAppEnabled,
                        })
                      }
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border transition-all cursor-pointer ${
                        form.chatWhatsAppEnabled
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25"
                      }`}
                    >
                      {form.chatWhatsAppEnabled
                        ? "Active (In Popup)"
                        : "Hidden (Click to Enable)"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!form.chatWhatsAppEnabled && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, chatWhatsAppEnabled: true })
                      }
                      className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-105 cursor-pointer"
                    >
                      Enable
                    </button>
                  )}
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.chatWhatsAppEnabled}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          chatWhatsAppEnabled: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 border border-zinc-400/50 dark:border-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md peer-checked:bg-emerald-600 dark:peer-checked:bg-emerald-500 peer-checked:border-emerald-600"></div>
                  </label>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-border/50">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    WhatsApp Phone Number (with country code)
                  </label>
                  <input
                    type="text"
                    value={form.whatsappNumber}
                    onChange={(e) =>
                      setForm({ ...form, whatsappNumber: e.target.value })
                    }
                    className={`w-full px-3 py-1.5 rounded-lg glass border border-border text-xs text-foreground ${
                      !form.chatWhatsAppEnabled ? "opacity-75" : ""
                    }`}
                    placeholder="8801606081657"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Prefilled Welcome Message
                  </label>
                  <input
                    type="text"
                    value={form.whatsappMessage}
                    onChange={(e) =>
                      setForm({ ...form, whatsappMessage: e.target.value })
                    }
                    className={`w-full px-3 py-1.5 rounded-lg glass border border-border text-xs text-foreground ${
                      !form.chatWhatsAppEnabled ? "opacity-75" : ""
                    }`}
                    placeholder="Hi Sahadat, I visited your portfolio..."
                  />
                </div>
              </div>
            </div>

            {/* Messenger Channel Card */}
            <div
              className={`p-4 rounded-2xl glass border transition-all space-y-3.5 flex flex-col justify-between ${
                form.chatMessengerEnabled
                  ? "border-border hover:border-blue-500/30"
                  : "border-amber-500/30 dark:border-amber-500/20 bg-amber-500/[0.02]"
              }`}
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        form.chatMessengerEnabled
                          ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      <Messenger size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">Facebook Messenger</h3>
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            chatMessengerEnabled: !form.chatMessengerEnabled,
                          })
                        }
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border transition-all cursor-pointer ${
                          form.chatMessengerEnabled
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25"
                        }`}
                      >
                        {form.chatMessengerEnabled
                          ? "Active (In Popup)"
                          : "Hidden (Click to Enable)"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!form.chatMessengerEnabled && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm({ ...form, chatMessengerEnabled: true })
                        }
                        className="text-xs font-bold px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:scale-105 cursor-pointer"
                      >
                        Enable
                      </button>
                    )}
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.chatMessengerEnabled}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            chatMessengerEnabled: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 border border-zinc-400/50 dark:border-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 peer-checked:border-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Facebook Messenger URL
                  </label>
                  <input
                    type="text"
                    value={form.messengerUrl}
                    onChange={(e) =>
                      setForm({ ...form, messengerUrl: e.target.value })
                    }
                    className={`w-full px-3 py-1.5 rounded-lg glass border border-border text-xs text-foreground ${
                      !form.chatMessengerEnabled ? "opacity-75" : ""
                    }`}
                    placeholder="https://m.me/sahadat.hossen.1435"
                  />
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                {form.chatMessengerEnabled
                  ? "✓ Users can click to open a direct Messenger chat conversation."
                  : "✕ Messenger button will not appear in the floating popup."}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Social Profile Links */}
        <div className="glass rounded-3xl p-6 border border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Share2 size={16} className="text-purple-400" />
                3. Social Profiles & Links (Navbar, Footer, Contact)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enable or disable individual social icons and update your destination links.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleEnableAllSocials}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                Enable All Socials
              </button>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/30">
                {form.socials.filter((s) => s.enabled !== false).length} / {form.socials.length} Active
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {form.socials.map((social, idx) => {
              const Icon = socialPlatformIcons[social.platform] || Share2;
              const isEnabled = social.enabled !== false;
              return (
                <div
                  key={social.platform}
                  className={`p-4 rounded-2xl glass border transition-all flex flex-col gap-3 ${
                    isEnabled
                      ? "border-border hover:border-purple-500/30"
                      : "border-amber-500/30 dark:border-amber-500/20 bg-amber-500/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          isEnabled
                            ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <span className="font-bold text-xs text-foreground capitalize">
                        {social.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleSocial(idx)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border transition-all cursor-pointer ${
                          isEnabled
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25"
                        }`}
                        title={isEnabled ? "Click to disable" : "Click to enable"}
                      >
                        {isEnabled ? "Visible" : "Hidden (Click to Enable)"}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isEnabled && (
                        <button
                          type="button"
                          onClick={() => handleToggleSocial(idx)}
                          className="text-xs font-bold px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all hover:scale-105 cursor-pointer"
                        >
                          Enable
                        </button>
                      )}
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleToggleSocial(idx)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 border border-zinc-400/50 dark:border-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md peer-checked:bg-purple-600 dark:peer-checked:bg-purple-500 peer-checked:border-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 border-t border-border/50">
                    <div className="sm:col-span-5">
                      <span className="text-[10px] text-muted-foreground block mb-1">
                        Display Handle / Text
                      </span>
                      <input
                        type="text"
                        value={social.value}
                        onChange={(e) =>
                          handleSocialChange(idx, "value", e.target.value)
                        }
                        className={`w-full px-3 py-1.5 rounded-lg glass border border-border text-xs text-foreground ${
                          !isEnabled ? "opacity-75" : ""
                        }`}
                      />
                    </div>
                    <div className="sm:col-span-7">
                      <span className="text-[10px] text-muted-foreground block mb-1">
                        Destination URL
                      </span>
                      <input
                        type="text"
                        value={social.href}
                        onChange={(e) =>
                          handleSocialChange(idx, "href", e.target.value)
                        }
                        className={`w-full px-3 py-1.5 rounded-lg glass border border-border text-xs text-foreground ${
                          !isEnabled ? "opacity-75" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
}
