"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { Github, Linkedin, Twitter, Whatsapp } from "@/components/icons";
import { trackContactSubmit, trackSocialClick } from "@/lib/gtm";
import type { ProfileData } from "@/types/portfolio";

interface DoctorContactProps {
  profile?: ProfileData;
  username?: string;
}

export default function DoctorContact({ profile, username }: DoctorContactProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const email = profile?.email;
  const phone = profile?.phone;
  const location = profile?.location || "Consulting Rooms";
  const socials = (profile?.socials || []).filter((s) => s.enabled !== false);

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("github")) return <Github size={18} />;
    if (p.includes("linkedin")) return <Linkedin size={18} />;
    if (p.includes("twitter") || p.includes("x")) return <Twitter size={18} />;
    if (p.includes("whatsapp")) return <Whatsapp size={18} />;
    return <Mail size={18} />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      trackContactSubmit({
        name: form.name,
        email: form.email,
        subject: form.subject,
      });

      const payload = username ? { ...form, username } : form;
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to send message. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again later.");
    } finally {
      setTimeout(() => {
        if (status === "success") setStatus("idle");
      }, 6000);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-2xl bg-card border border-border/80 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm";

  return (
    <section
      id="contact"
      className="py-16 sm:py-24 bg-muted/30 border-t border-border/60"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
            <MessageSquare size={13} />
            <span>Consultation & Inquiries</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Get in Touch
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Inquire about consultations, professional collaborations, or general questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Contact Details & Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              {/* Email Card */}
              <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email Address
                  </div>
                  <a
                    href={`mailto:${email}`}
                    className="text-sm sm:text-base font-bold text-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors mt-0.5 inline-block break-all"
                  >
                    {email}
                  </a>
                </div>
              </div>

              {/* Phone Card */}
              {phone && (
                <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Contact Line
                    </div>
                    <a
                      href={`tel:${phone}`}
                      className="text-sm sm:text-base font-bold text-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors mt-0.5 inline-block"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Location Card */}
              {location && (
                <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Practice Location
                    </div>
                    <div className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                      {location}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            {socials.length > 0 && (
              <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Professional Profiles & Networks
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {socials.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        const validPlatforms: Record<string, "github" | "linkedin" | "whatsapp" | "messenger" | "twitter" | "email"> = {
                          github: "github",
                          linkedin: "linkedin",
                          whatsapp: "whatsapp",
                          messenger: "messenger",
                          twitter: "twitter",
                          email: "email",
                        };
                        const platformKey = validPlatforms[s.platform.toLowerCase()] || "email";
                        trackSocialClick(
                          platformKey,
                          "contact_section",
                          s.href
                        );
                      }}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-muted/60 hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400 border border-border/60 text-xs font-semibold text-foreground transition-all"
                    >
                      {getSocialIcon(s.platform)}
                      <span>{s.label || s.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-md space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  Send a Direct Inquiry
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Please provide your details below and you will receive a prompt response.
                </p>
              </div>

              {/* Status Alert */}
              {status === "success" && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="flex-shrink-0" />
                  <span>Thank you! Your message has been sent successfully.</span>
                </div>
              )}

              {status === "error" && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-2.5">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{errorMessage || "Failed to send message. Please try again."}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Jane Doe"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Your Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="jane@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    placeholder="Consultation Inquiry / General Question"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder="Describe your inquiry or question..."
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/25 hover:shadow-teal-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01]"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
