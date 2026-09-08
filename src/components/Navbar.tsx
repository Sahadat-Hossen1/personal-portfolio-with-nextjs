"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Github, Linkedin, Twitter } from "@/components/icons";
import { trackSocialClick, trackPageView } from "@/lib/gtm";
import { ModeToggle } from "@/components/mode-toggle";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Track active section
      const sections = navLinks.map((l) => l.href.slice(1));
      for (const section of sections.reverse()) {
        const el = document.getElementById(section);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(section);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const id = href.slice(1);
    trackPageView(document.title, window.location.href, id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-2.5 group"
            aria-label="Sahadat Hossen Portfolio Home"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-indigo-500/50 shadow-md group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-110">
              <Image
                src="/profile.jpg"
                alt="Sahadat Hossen"
                fill
                sizes="32px"
                className="object-cover object-top"
              />
            </div>
            <span className="font-bold text-lg tracking-tight gradient-text">
              Sahadat.dev
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const id = link.href.slice(1);
              const isActive = activeSection === id;
              return (
                <a
                  key={link.href}
                  id={`nav-${id}`}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20" />
                  )}
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Social + ModeToggle + CTA */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="https://github.com/Sahadat-Hossen1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              onClick={() => trackSocialClick("github", "navbar", "https://github.com/Sahadat-Hossen1")}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
            >
              <Github size={18} />
            </a>
            <a
              href="https://linkedin.com/in/sahadathossen"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              onClick={() => trackSocialClick("linkedin", "navbar", "https://linkedin.com/in/sahadathossen")}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
            >
              <Linkedin size={18} />
            </a>

            {/* shadcn Dark/Light Mode Toggle */}
            <ModeToggle />

            <a
              id="nav-contact-btn"
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("#contact");
              }}
              className="ml-2 inline-flex items-center justify-center h-8 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.03]"
            >
              Hire Me
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isOpen ? "max-h-96 pb-4" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-1 pt-2 border-t border-border">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center justify-between px-4 pt-3 border-t border-border mt-2">
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/Sahadat-Hossen1"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  onClick={() => trackSocialClick("github", "navbar", "https://github.com/Sahadat-Hossen1")}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github size={18} />
                </a>
                <a
                  href="https://linkedin.com/in/sahadathossen"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  onClick={() => trackSocialClick("linkedin", "navbar", "https://linkedin.com/in/sahadathossen")}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  onClick={() => trackSocialClick("twitter", "navbar", "https://twitter.com")}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter size={18} />
                </a>
              </div>
              <ModeToggle />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
