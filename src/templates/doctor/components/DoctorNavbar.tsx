"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Activity } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Github, Linkedin, Twitter, Whatsapp } from "@/components/icons";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Expertise", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

interface DoctorNavbarProps {
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

export default function DoctorNavbar({
  name = "Physician Portfolio",
  avatar,
  sections,
  socials,
}: DoctorNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const activeNavLinks = navLinks.filter((link) => {
    const key = link.href.slice(1);
    if (sections && key in sections) {
      return sections[key as keyof typeof sections] !== false;
    }
    return true;
  });

  const showContact = sections ? sections.contact !== false : true;

  const enabledSocials = (socials || []).filter((s) => s.enabled !== false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sectionIds = activeNavLinks.map((l) => l.href.slice(1));
      for (const section of sectionIds.reverse()) {
        const el = document.getElementById(section);
        if (el && window.scrollY >= el.offsetTop - 130) {
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
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("github")) return <Github size={16} />;
    if (p.includes("linkedin")) return <Linkedin size={16} />;
    if (p.includes("twitter") || p.includes("x")) return <Twitter size={16} />;
    if (p.includes("whatsapp")) return <Whatsapp size={16} />;
    return null;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border shadow-sm shadow-teal-500/5"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand / Logo */}
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-3 group cursor-pointer"
            aria-label={`${name} Home`}
          >
            {avatar ? (
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-teal-500/30 shadow-sm group-hover:border-teal-500 transition-all duration-300">
                <Image
                  src={avatar}
                  alt={name}
                  fill
                  sizes="40px"
                  className="object-cover object-top"
                />
              </div>
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-sm">
                <Activity size={20} />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base text-foreground tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {name}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block"></span>
                Portfolio
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {activeNavLinks.map((link) => {
              const id = link.href.slice(1);
              const isActive = activeSection === id;
              return (
                <a
                  key={link.href}
                  id={`doctor-nav-${id}`}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer relative ${
                    isActive
                      ? "text-teal-600 dark:text-teal-400 font-semibold bg-teal-500/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-teal-500 rounded-full" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Actions: Socials, ModeToggle, Contact CTA */}
          <div className="hidden md:flex items-center gap-2">
            {enabledSocials.slice(0, 3).map((s, idx) => (
              <a
                key={idx}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label || s.platform}
                className="p-2 text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors rounded-xl hover:bg-muted/60"
              >
                {getSocialIcon(s.platform)}
              </a>
            ))}

            <ModeToggle />

            {showContact && (
              <a
                id="doctor-nav-contact-btn"
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("#contact");
                }}
                className="ml-2 inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 hover:shadow-teal-600/30 transition-all duration-200 cursor-pointer"
              >
                Contact
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <ModeToggle />
            <button
              id="doctor-mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle Navigation"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isOpen ? "max-h-96 pb-4 border-t border-border mt-2" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-1 pt-2">
            {activeNavLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="px-4 py-2.5 text-sm text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-500/10 rounded-xl transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}

            {showContact && (
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("#contact");
                }}
                className="mt-2 text-center px-4 py-2.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-all"
              >
                Contact
              </a>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
