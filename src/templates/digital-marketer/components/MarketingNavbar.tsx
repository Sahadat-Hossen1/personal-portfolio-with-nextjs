"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, TrendingUp, ArrowUpRight } from "lucide-react";
import { Github, Linkedin, Twitter } from "@/components/icons";
import { trackSocialClick } from "@/lib/gtm";
import { ModeToggle } from "@/components/mode-toggle";

const navLinks = [
  { label: "Overview", href: "#hero" },
  { label: "Case Studies", href: "#projects" },
  { label: "Growth Stack", href: "#skills" },
  { label: "Track Record", href: "#experience" },
  { label: "Strategy", href: "#about" },
  { label: "Consult", href: "#contact" },
];

interface MarketingNavbarProps {
  name?: string;
  avatar?: string;
  sections?: {
    hero?: boolean;
    about?: boolean;
    skills?: boolean;
    projects?: boolean;
    experience?: boolean;
    contact?: boolean;
    floatingChat?: boolean;
  };
  socials?: {
    platform: string;
    label?: string;
    href: string;
    enabled?: boolean;
  }[];
}

export default function MarketingNavbar({
  name = "Growth Marketing",
  avatar,
  sections,
  socials,
}: MarketingNavbarProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const activeNavLinks = navLinks.filter((link) => {
    const key = link.href.slice(1);
    if (key === "hero") {
      return sections?.hero !== false;
    }
    if (key === "projects") {
      return sections?.projects !== false;
    }
    if (key === "skills") {
      return sections?.skills !== false;
    }
    if (key === "experience") {
      return sections?.experience !== false;
    }
    if (key === "about") {
      return sections?.about !== false;
    }
    if (key === "contact") {
      return sections?.contact !== false;
    }
    return true;
  });

  const showContact = sections ? sections.contact !== false : true;

  const githubSocial = socials?.find((s) => s.platform === "github");
  const linkedinSocial = socials?.find((s) => s.platform === "linkedin");
  const twitterSocial = socials?.find((s) => s.platform === "twitter");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sectionIds = activeNavLinks.map((l) => l.href.slice(1));
      const current = sectionIds.find((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= 120 && rect.bottom >= 120;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeNavLinks]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <Link
            href="/"
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            {avatar ? (
              <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-emerald-500/40 group-hover:ring-emerald-400 transition-all">
                <Image
                  src={avatar}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
                <TrendingUp size={18} className="stroke-[2.5]" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                {name}
                <span className="hidden sm:inline-block text-[11px] font-mono font-medium text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  GROWTH
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Performance &amp; Advisory
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-900/60 backdrop-blur-md rounded-full border border-slate-800/80">
            {activeNavLinks.map((link) => {
              const isActive = activeSection === link.href.slice(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Action Stack: Socials + Theme + CTA */}
          <div className="hidden sm:flex items-center gap-2.5">
            {linkedinSocial && linkedinSocial.enabled !== false && (
              <a
                href={linkedinSocial.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackSocialClick(
                    linkedinSocial.platform as "linkedin" | "github" | "twitter",
                    "navbar"
                  )
                }
                className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors"
                aria-label="LinkedIn Profile"
              >
                <Linkedin size={18} />
              </a>
            )}
            {twitterSocial && twitterSocial.enabled !== false && (
              <a
                href={twitterSocial.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackSocialClick(
                    twitterSocial.platform as "linkedin" | "github" | "twitter",
                    "navbar"
                  )
                }
                className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors"
                aria-label="Twitter Profile"
              >
                <Twitter size={18} />
              </a>
            )}
            {githubSocial && githubSocial.enabled !== false && (
              <a
                href={githubSocial.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackSocialClick(
                    githubSocial.platform as "linkedin" | "github" | "twitter",
                    "navbar"
                  )
                }
                className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors"
                aria-label="GitHub Profile"
              >
                <Github size={18} />
              </a>
            )}

            <ModeToggle />

            {showContact && (
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, "#contact")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md shadow-emerald-500/20 active:scale-95"
              >
                Request Audit
                <ArrowUpRight size={14} className="stroke-[2.5]" />
              </a>
            )}
          </div>

          {/* Mobile Hamburger & Controls */}
          <div className="flex sm:hidden items-center gap-2">
            <ModeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="lg:hidden mt-3 p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl animate-fade-in space-y-3">
            <div className="flex flex-col space-y-1">
              {activeNavLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight size={14} className="text-slate-500" />
                </a>
              ))}
            </div>

            {showContact && (
              <div className="pt-2 border-t border-slate-800">
                <a
                  href="#contact"
                  onClick={(e) => scrollToSection(e, "#contact")}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20"
                >
                  Request Growth Audit
                  <ArrowUpRight size={16} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
