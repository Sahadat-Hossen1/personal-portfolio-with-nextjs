"use client";

import { Mail, Code2, Heart } from "lucide-react";
import { Github, Linkedin, Twitter } from "@/components/icons";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

const socials = [
  { icon: Github, href: "https://github.com/Sahadat-Hossen1", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/sahadathossen", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Mail, href: "mailto:sahadat.hossen1435@gmail.com", label: "Email" },
];

const socialIconMap: Record<string, any> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  email: Mail,
};

interface FooterProps {
  profile?: {
    name?: string;
    socials?: { platform: string; label: string; href: string }[];
  };
}

export default function Footer({ profile }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const displayName = profile?.name || "Sahadat Hossen";
  const activeSocials = profile?.socials && profile.socials.length > 0
    ? profile.socials.map((s) => ({
        icon: socialIconMap[s.platform] || Mail,
        href: s.href,
        label: s.label,
      }))
    : socials;

  return (
    <footer className="relative border-t border-white/5 mt-8">
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-64 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, #818cf8, #a78bfa, transparent)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-8">
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-2 group"
            aria-label="Sahadat Hossen - Back to top"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-110">
              <Code2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight gradient-text">Sahadat.dev</span>
          </a>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center justify-center gap-6">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {activeSocials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-9 h-9 rounded-xl glass border border-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/15 transition-all duration-200 hover:-translate-y-0.5"
              >
                <social.icon size={16} />
              </a>
            ))}
          </div>

          {/* Copyright & Admin Link */}
          <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground/60 text-center">
            <p className="flex items-center gap-1.5">
              © {currentYear} {displayName}. Built with{" "}
              <Heart size={11} className="text-rose-400 fill-rose-400 inline" /> using Next.js, MongoDB & Tailwind CSS
            </p>
            <a
              href="/admin"
              className="text-[11px] text-muted-foreground/40 hover:text-indigo-400 transition-colors"
            >
              Admin Portal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
