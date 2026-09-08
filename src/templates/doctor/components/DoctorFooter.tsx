"use client";

import { ArrowUp, Activity } from "lucide-react";
import type { ProfileData, SectionVisibilityData } from "@/types/portfolio";

const footerLinks = [
  { label: "About", href: "#about", key: "about" },
  { label: "Expertise", href: "#skills", key: "skills" },
  { label: "Projects", href: "#projects", key: "projects" },
  { label: "Experience", href: "#experience", key: "experience" },
  { label: "Contact", href: "#contact", key: "contact" },
];

interface DoctorFooterProps {
  profile?: ProfileData;
  sections?: SectionVisibilityData;
}

export default function DoctorFooter({
  profile,
  sections,
}: DoctorFooterProps) {
  const name = profile?.name || "Professional";
  const currentYear = new Date().getFullYear();

  const activeLinks = footerLinks.filter((link) => {
    if (sections && link.key in sections) {
      return sections[link.key as keyof SectionVisibilityData] !== false;
    }
    return true;
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Activity size={18} />
            </div>
            <span className="font-bold text-sm sm:text-base text-foreground">
              {name}
            </span>
          </div>

          {/* Dynamic Section Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-muted-foreground">
            {activeLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById(link.href.slice(1))
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
            aria-label="Back to top"
          >
            <span>Top</span>
            <ArrowUp size={14} />
          </button>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground text-center sm:text-left">
          <p>
            © {currentYear} {name}. All rights reserved. Professional portfolio presentation.
          </p>
          <p className="max-w-md text-muted-foreground/80 text-[10px]">
            The information presented on this website is for professional representation and informational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
