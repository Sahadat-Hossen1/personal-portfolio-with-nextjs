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
} from "lucide-react";
import { Github, Linkedin, Twitter, Whatsapp, Messenger } from "@/components/icons";

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
      { platform: "github", label: "GitHub", value: "", href: "" },
      { platform: "linkedin", label: "LinkedIn", value: "", href: "" },
      { platform: "whatsapp", label: "Whatsapp", value: "", href: "" },
      { platform: "email", label: "Email", value: "", href: "" },
      { platform: "twitter", label: "Twitter", value: "", href: "" },
    ],
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
            ? data.data.socials
            : [
                {
                  platform: "github",
                  label: "GitHub",
                  value: "github.com/Sahadat-Hossen1",
                  href: "https://github.com/Sahadat-Hossen1",
                },
                {
                  platform: "linkedin",
                  label: "LinkedIn",
                  value: "linkedin.com/in/sahadathossen",
                  href: "https://linkedin.com/in/sahadathossen",
                },
                {
                  platform: "whatsapp",
                  label: "Whatsapp",
                  value: "+8801606081657",
                  href: "https://wa.me/8801606081657",
                },
                {
                  platform: "email",
                  label: "Email",
                  value: "sahadat.hossen1435@gmail.com",
                  href: "mailto:sahadat.hossen1435@gmail.com",
                },
                {
                  platform: "twitter",
                  label: "Twitter",
                  value: "twitter.com",
                  href: "https://twitter.com",
                },
              ],
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialChange = (index: number, field: "value" | "href", val: string) => {
    const nextSocials = [...form.socials];
    nextSocials[index] = { ...nextSocials[index], [field]: val };
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
    "w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 bg-transparent text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all";

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
          <h1 className="text-2xl sm:text-3xl font-black text-white">
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
        {/* Section 1: Contact Details */}
        <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
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
        <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <MessageSquare size={16} className="text-emerald-400" />
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
        <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Share2 size={16} className="text-purple-400" />
            3. Social Profiles & Links (Navbar, Footer, Contact)
          </h2>

          <div className="space-y-3">
            {form.socials.map((social, idx) => (
              <div
                key={social.platform}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-2xl glass border border-white/5 items-center"
              >
                <div className="sm:col-span-2 font-bold text-xs text-white capitalize flex items-center gap-2">
                  <span>{social.label}</span>
                </div>
                <div className="sm:col-span-4">
                  <span className="text-[10px] text-muted-foreground block mb-1">
                    Display Handle / Text
                  </span>
                  <input
                    type="text"
                    value={social.value}
                    onChange={(e) =>
                      handleSocialChange(idx, "value", e.target.value)
                    }
                    className="w-full px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-6">
                  <span className="text-[10px] text-muted-foreground block mb-1">
                    Destination URL
                  </span>
                  <input
                    type="text"
                    value={social.href}
                    onChange={(e) =>
                      handleSocialChange(idx, "href", e.target.value)
                    }
                    className="w-full px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
