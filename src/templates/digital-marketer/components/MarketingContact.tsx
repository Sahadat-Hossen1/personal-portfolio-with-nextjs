"use client";

import { useState, ComponentType } from "react";
import { Mail, Send, CheckCircle2, Loader2, Phone, MapPin, TrendingUp } from "lucide-react";
import { Github, Linkedin, Whatsapp } from "@/components/icons";
import { trackContactSubmit, trackSocialClick } from "@/lib/gtm";
import type { ProfileData } from "@/types/portfolio";

interface MarketingContactProps {
  profile: ProfileData;
  username?: string;
}

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type Status = "idle" | "loading" | "success" | "error";

const socialIconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  whatsapp: Whatsapp,
  email: Mail,
};

const inquirySubjects = [
  "Full-Funnel Growth & Attribution Audit",
  "Paid Media & Performance Acquisition Strategy",
  "Analytics & Tracking Infrastructure Setup",
  "Conversion Rate Optimization (CRO) Sprint",
  "General Strategic Advisory Inquiry",
];

export default function MarketingContact({ profile, username }: MarketingContactProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: inquirySubjects[0],
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");

  const activeSocials =
    profile?.socials && profile.socials.length > 0
      ? profile.socials.filter((s) => s.enabled !== false)
      : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    trackContactSubmit({
      name: form.name,
      email: form.email,
      subject: form.subject,
    });

    try {
      const payload = username ? { ...form, username } : form;
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setForm({
          name: "",
          email: "",
          subject: inquirySubjects[0],
          message: "",
        });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 6000);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all";

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp size={13} />
            <span>DIRECT STRATEGIC INQUIRIES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Initiate a Growth Consultation
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Have an ad account in need of an audit, a funnel to optimize, or a new brand to scale? Let&apos;s evaluate opportunities together.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left: Advisory Details & Trust */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl shadow-black/20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Advisory Availability Status
              </div>

              <div className="space-y-4 text-sm text-slate-300">
                <p className="leading-relaxed">
                  Currently accepting select client partnerships, audit engagements, and strategic growth consultations.
                </p>
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Audit Turnaround</span>
                    <span className="font-semibold text-white">3&ndash;5 Business Days</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Initial Response SLA</span>
                    <span className="font-semibold text-emerald-400">&lt; 24 Hours</span>
                  </div>
                </div>
              </div>

              {/* Direct Info */}
              <div className="space-y-3 pt-4 border-t border-slate-800 text-xs sm:text-sm text-slate-300">
                {profile?.email && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-950 text-emerald-400 border border-slate-800">
                      <Mail size={16} />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Direct Inquiries</div>
                      <a
                        href={`mailto:${profile.email}`}
                        className="font-medium hover:text-emerald-400 transition-colors"
                      >
                        {profile.email}
                      </a>
                    </div>
                  </div>
                )}

                {profile?.phone && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-950 text-emerald-400 border border-slate-800">
                      <Phone size={16} />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Direct Phone</div>
                      <span className="font-medium">{profile.phone}</span>
                    </div>
                  </div>
                )}

                {profile?.location && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-950 text-emerald-400 border border-slate-800">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Location</div>
                      <span className="font-medium">{profile.location}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Channels */}
              {activeSocials.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Professional Networks
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeSocials.map((social) => {
                      const Icon = socialIconMap[social.platform.toLowerCase()] || Mail;
                      return (
                        <a
                          key={social.platform}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            trackSocialClick(
                              social.platform as "linkedin" | "github" | "twitter" | "whatsapp",
                              "contact_section"
                            )
                          }
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors"
                        >
                          <Icon size={15} />
                          <span className="capitalize">{social.label || social.platform}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Consultation Request Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl shadow-black/20">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="dm-name"
                      className="text-xs font-semibold uppercase tracking-wider text-slate-300"
                    >
                      Full Name *
                    </label>
                    <input
                      id="dm-name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="dm-email"
                      className="text-xs font-semibold uppercase tracking-wider text-slate-300"
                    >
                      Business Email *
                    </label>
                    <input
                      id="dm-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@company.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="dm-subject"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    Engagement Focus / Subject *
                  </label>
                  <select
                    id="dm-subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className={inputClass}
                  >
                    {inquirySubjects.map((subject, idx) => (
                      <option key={idx} value={subject} className="bg-slate-900 text-slate-200">
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="dm-message"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    Project Context &amp; Growth Objectives *
                  </label>
                  <textarea
                    id="dm-message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Provide details regarding your current channels, monthly ad spend or traffic volume, key performance bottlenecks, and target KPIs..."
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} className="stroke-[2.5]" />
                      <span>Submit Strategic Consultation Request</span>
                    </>
                  )}
                </button>

                {/* Status Messages */}
                {status === "success" && (
                  <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
                    <CheckCircle2 size={18} className="shrink-0" />
                    <span>
                      Inquiry received successfully. Our advisory team will review your objectives and respond within 24 hours.
                    </span>
                  </div>
                )}

                {status === "error" && (
                  <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 text-xs sm:text-sm animate-fade-in">
                    Transmission failed. Please check your network connection or email directly at {profile?.email || "the address on the left"}.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
