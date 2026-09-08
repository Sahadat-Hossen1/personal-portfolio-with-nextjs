"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Send,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Github, Linkedin, Whatsapp } from "@/components/icons";
import { trackContactSubmit, trackSocialClick } from "@/lib/gtm";

const socials = [
  {
    id: "contact-github",
    platform: "github" as const,
    icon: Github,
    label: "GitHub",
    value: "github.com/Sahadat-Hossen1",
    href: "https://github.com/Sahadat-Hossen1",
    color: "hover:text-foreground",
  },
  {
    id: "contact-linkedin",
    platform: "linkedin" as const,
    icon: Linkedin,
    label: "LinkedIn",
    value: "linkedin.com/in/sahadathossen",
    href: "https://linkedin.com/in/sahadathossen",
    color: "hover:text-blue-400",
  },
  {
    id: "contact-whatsapp",
    platform: "whatsapp" as const,
    icon: Whatsapp,
    label: "Whatsapp",
    value: "+8801606081657",
    href: "https://wa.me/8801606081657",
    color: "hover:text-green-400",
  },
  {
    id: "contact-email",
    platform: "email" as const,
    icon: Mail,
    label: "Email",
    value: "sahadat.hossen1435@gmail.com",
    href: "mailto:sahadat.hossen1435@gmail.com",
    color: "hover:text-primary",
  },
];

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type Status = "idle" | "loading" | "success" | "error";

const socialIconMap: Record<string, any> = {
  github: Github,
  linkedin: Linkedin,
  whatsapp: Whatsapp,
  email: Mail,
};

interface ContactSectionProps {
  profile?: {
    email?: string;
    phone?: string;
    location?: string;
    socials?: { platform: string; label: string; value: string; href: string }[];
  };
}

export default function ContactSection({ profile }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const activeSocials = profile?.socials && profile.socials.length > 0
    ? profile.socials.map((s) => ({
        id: `contact-${s.platform}`,
        platform: s.platform as any,
        icon: socialIconMap[s.platform] || Mail,
        label: s.label,
        value: s.value,
        href: s.href,
        color: s.platform === "linkedin" ? "hover:text-blue-500 dark:hover:text-blue-400" : s.platform === "whatsapp" ? "hover:text-emerald-500 dark:hover:text-green-400" : "hover:text-foreground",
      }))
    : socials;

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Track GTM form submit event
    trackContactSubmit({
      name: form.name,
      email: form.email,
      subject: form.subject,
    });

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl glass border border-border bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-24 lg:py-32 px-4 relative overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none opacity-6"
        style={{
          background:
            "radial-gradient(ellipse, oklch(0.65 0.22 275 / 0.15) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <div className="reveal flex items-center gap-3 mb-4">
          <span className="text-primary text-sm font-mono font-semibold tracking-widest uppercase">
            05. Contact
          </span>
          <div className="h-px flex-1 max-w-16 bg-primary/40" />
        </div>

        <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4">
          Let&apos;s <span className="gradient-text">work together</span>
        </h2>
        <p className="reveal reveal-delay-2 text-muted-foreground max-w-xl mb-12">
          Have a project in mind or want to discuss opportunities? I&apos;m currently
          open to new roles and freelance projects. Drop me a message!
        </p>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Social + info */}
          <div className="lg:col-span-2 space-y-5 reveal reveal-delay-2">
            {/* Availability card */}
            <div className="glass rounded-2xl p-6 border border-emerald-500/15 gradient-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Available for hire
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Open to full-time roles, contract work, and interesting freelance
                projects. Response time is typically within 24 hours.
              </p>
            </div>

            {/* Location */}
            <div className="glass rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Based in</p>
                  <p className="font-semibold text-foreground text-sm">
                    {profile?.location || "Dhaka, Bangladesh"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Open to remote worldwide
                  </p>
                </div>
              </div>
            </div>

            {/* Socials */}
            <div className="space-y-2">
              {activeSocials.map((social) => (
                <a
                  key={social.id}
                  id={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackSocialClick(social.platform, "contact_section", social.href)}
                  className={`flex items-center gap-4 glass rounded-xl p-4 border border-border hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5 group ${social.color}`}
                >
                  <div className="w-9 h-9 rounded-lg glass flex items-center justify-center flex-shrink-0 border border-border group-hover:border-primary/30 transition-colors">
                    <social.icon size={17} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{social.label}</p>
                    <p className="text-sm font-medium text-foreground">{social.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right: Contact form */}
          <div className="lg:col-span-3 reveal reveal-delay-3">
            <div className="glass rounded-3xl p-6 sm:p-8 border border-border gradient-border">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare size={20} className="text-primary" />
                <h3 className="font-bold text-foreground">Send a message</h3>
              </div>

              {status === "success" ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground">Message sent!</h4>
                  <p className="text-muted-foreground text-sm">
                    Thanks for reaching out. I&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                        Your Name *
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Alex Johnson"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="alex@company.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Project inquiry / Job opportunity / Collaboration"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell me about your project, timeline, and budget..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <Button
                    id="contact-submit"
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.01] text-sm font-semibold rounded-xl disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
