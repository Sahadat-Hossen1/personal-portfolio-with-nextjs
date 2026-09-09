"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Film } from "lucide-react";
import { Github, Linkedin, Twitter } from "@/components/icons";
import { trackSocialClick, trackPageView } from "@/lib/gtm";
import { ModeToggle } from "@/components/mode-toggle";

const navLinks = [
  { label: "Showreel", href: "#hero", sectionKey: "hero" as const },
  { label: "Works", href: "#projects", sectionKey: "projects" as const },
  { label: "Suite", href: "#skills", sectionKey: "skills" as const },
  { label: "Credits", href: "#experience", sectionKey: "experience" as const },
  { label: "Vision", href: "#about", sectionKey: "about" as const },
  { label: "Book", href: "#contact", sectionKey: "contact" as const },
];

interface VideoNavbarProps {
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

export default function VideoNavbar({ sections, socials }: VideoNavbarProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const activeNavLinks = navLinks.filter((link) => {
    if (sections && link.sectionKey in sections) {
      return sections[link.sectionKey] !== false;
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
      for (const section of sectionIds.reverse()) {
        const el = document.getElementById(section);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(section);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeNavLinks]);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const id = href.slice(1);
    trackPageView(document.title, window.location.href, id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800 shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Studio Brand & REC Indicator */}
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-3 group"
            aria-label="Editorial Studio Home"
          >
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-red-500/40 shadow-lg shadow-red-950/50 group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/profile.jpg"
                alt="Studio"
                fill
                sizes="36px"
                className="object-cover object-top"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-black tracking-wider uppercase text-white group-hover:text-red-400 transition-colors">
                  Editorial // Studio
                </span>

                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-950/80 border border-red-600/40 text-[9px] font-mono font-bold text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  REC
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                Director // Video Editor
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1.5 bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
            {activeNavLinks.map((link) => {
              const id = link.href.slice(1);
              const isActive = activeSection === id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-red-600 text-white shadow-md shadow-red-900/40"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Right Actions: Socials, Theme, CTA */}
          <div className="hidden md:flex items-center gap-3">
            {githubSocial && githubSocial.enabled !== false && (
              <a
                href={githubSocial.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                onClick={() =>
                  trackSocialClick("github", "navbar", githubSocial.href)
                }
                className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-900"
              >
                <Github size={17} />
              </a>
            )}
            {linkedinSocial && linkedinSocial.enabled !== false && (
              <a
                href={linkedinSocial.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                onClick={() =>
                  trackSocialClick("linkedin", "navbar", linkedinSocial.href)
                }
                className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-900"
              >
                <Linkedin size={17} />
              </a>
            )}
            {twitterSocial && twitterSocial.enabled !== false && (
              <a
                href={twitterSocial.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                onClick={() =>
                  trackSocialClick("twitter", "navbar", twitterSocial.href)
                }
                className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-900"
              >
                <Twitter size={17} />
              </a>
            )}

            <ModeToggle />

            {showContact && (
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("#contact");
                }}
                className="ml-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-950/50 hover:scale-105 transition-all duration-300"
              >
                <Film size={13} />
                Book Production
              </a>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isOpen ? "max-h-96 pb-5" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-1.5 pt-3 border-t border-zinc-800 bg-zinc-950/95 rounded-b-2xl p-4">
            {activeNavLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="px-3 py-2.5 rounded-lg text-xs font-mono tracking-wider uppercase text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800 mt-2">
              <div className="flex items-center gap-3">
                {githubSocial && githubSocial.enabled !== false && (
                  <a
                    href={githubSocial.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-zinc-400 hover:text-white"
                  >
                    <Github size={18} />
                  </a>
                )}
                {linkedinSocial && linkedinSocial.enabled !== false && (
                  <a
                    href={linkedinSocial.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-zinc-400 hover:text-white"
                  >
                    <Linkedin size={18} />
                  </a>
                )}
              </div>
              <ModeToggle />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
