"use client";

import { useState, ComponentType } from "react";
import { Mail, Send, CheckCircle2, Loader2, Film, MessageSquare } from "lucide-react";
import { Github, Linkedin, Whatsapp } from "@/components/icons";
import { trackContactSubmit, trackSocialClick } from "@/lib/gtm";
import type { ProfileData } from "@/types/portfolio";

interface VideoContactProps {
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

export default function VideoContact({ profile, username }: VideoContactProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "Commercial Video Editing Inquiry",
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
        setForm({ name: "", email: "", subject: "", message: "" });
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
    "w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-xs font-mono transition-all";

  return (
    <section id="contact" className="py-24 px-4 bg-zinc-950 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-2 font-mono text-xs text-red-500 uppercase tracking-widest">
            <Film size={14} />
            <span>Direct Studio Inquiries</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white uppercase mb-3">
            Book a Production
          </h2>
          <p className="text-sm text-zinc-400">
            Have a project, commercial campaign, or raw footage that needs an editorial cut? Let&apos;s build something cinematic together.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Studio Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="flex items-center gap-2 font-mono text-xs text-red-400 font-bold uppercase mb-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Current Production Availability
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                Now accepting bookings for Q3 &amp; Q4 commercial spots, social campaigns, documentary post-production, and color grading finishing.
              </p>

              <div className="space-y-2 pt-3 border-t border-zinc-800/80 text-xs font-mono text-zinc-400">
                <div className="flex justify-between">
                  <span>Turnaround:</span>
                  <span className="text-white">24h – 5 Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Deliverables:</span>
                  <span className="text-white">4K ProRes // Web Ready</span>
                </div>
                <div className="flex justify-between">
                  <span>Revisions:</span>
                  <span className="text-white">Frame.io Collaborative</span>
                </div>
              </div>
            </div>

            {/* Direct Social / Messenger Buttons */}
            <div className="space-y-2">
              {activeSocials.map((social) => {
                const IconComponent = socialIconMap[social.platform] || Mail;
                return (
                  <a
                    key={social.platform}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackSocialClick(
                        social.platform as
                          | "github"
                          | "linkedin"
                          | "whatsapp"
                          | "messenger"
                          | "twitter"
                          | "email",
                        "contact_section",
                        social.href
                      )
                    }
                    className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-zinc-400 group-hover:text-red-400 transition-colors">
                        <IconComponent size={15} />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-mono font-bold text-white uppercase">
                          {social.label}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate max-w-[200px]">
                          {social.value}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-zinc-400 group-hover:text-red-400">
                      →
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right: Booking Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/70 border border-zinc-800/90 shadow-2xl">
              <div className="flex items-center gap-2 mb-6 font-mono text-xs font-bold text-zinc-300 uppercase">
                <MessageSquare size={16} className="text-red-500" />
                <span>Production Briefing &amp; Message</span>
              </div>

              {status === "success" ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="text-lg font-bold font-mono text-white uppercase">
                    Brief Received!
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Thank you for reaching out. I will review your project timeline and reach back within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                        Client / Producer Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="Alex Morgan"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder="alex@studio.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      Production Subject / Type
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      placeholder="e.g. 60s Commercial Spot / YouTube Series / Music Video"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      Project Details &amp; Footage Details *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      placeholder="Describe your footage format, timeline, target duration, reference links..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Transmitting Brief…
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        Dispatch Production Brief
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
