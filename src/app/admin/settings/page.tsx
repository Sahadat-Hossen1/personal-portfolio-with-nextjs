"use client";

import { useEffect, useState } from "react";
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Share2,
  Sparkles,
  User,
  Cpu,
  FolderGit2,
  Briefcase,
} from "lucide-react";
import { Github, Linkedin, Twitter, Whatsapp, Messenger } from "@/components/icons";

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

const socialPlatformIcons: Record<string, any> = {
  github: Github,
  linkedin: Linkedin,
  whatsapp: Whatsapp,
  email: Mail,
  twitter: Twitter,
};

export default function SettingsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    email: "",
    phone: "",
    location: "",
    whatsappNumber: "",
    whatsappMessage: "",
    messengerUrl: "",
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
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success && data.data) {
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
          socials: data.data.socials?.length
            ? data.data.socials.map((s: any) => ({
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
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
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
    val: any
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
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update settings" });
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
        <div className="glass rounded-3xl p-6 border border-border space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <MessageSquare size={16} className="text-emerald-500 dark:text-emerald-400" />
            2. Floating Chat Widget (Bottom-right Popup)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                WhatsApp Phone Number (Numbers only with country code)
              </label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={(e) =>
                  setForm({ ...form, whatsappNumber: e.target.value })
                }
                className={inputClass}
                placeholder="8801606081657"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Facebook Messenger URL
              </label>
              <input
                type="text"
                value={form.messengerUrl}
                onChange={(e) =>
                  setForm({ ...form, messengerUrl: e.target.value })
                }
                className={inputClass}
                placeholder="https://m.me/sahadat.hossen.1435"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              WhatsApp Prefilled Welcome Message
            </label>
            <input
              type="text"
              value={form.whatsappMessage}
              onChange={(e) =>
                setForm({ ...form, whatsappMessage: e.target.value })
              }
              className={inputClass}
              placeholder="Hi Sahadat, I visited your portfolio and would like to connect!"
            />
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
