"use client";

import { useEffect, useRef } from "react";
import { MapPin, ExternalLink } from "lucide-react";

type Experience = {
  id?: string;
  _id?: string;
  role: string;
  company: string;
  companyUrl?: string;
  location?: string;
  period: string;
  type: string;
  bullets: string[];
  tags: string[];
  current?: boolean;
  order?: number;
};

const experiences: Experience[] = [
  {
    id: "exp-inspiresoft",
    role: "Full-Stack Developer & Analytics Specialist",
    company: "Inspire Soft",
    companyUrl: "https://example.com",
    location: "Dhaka, Bangladesh",
    period: "May 2026 – Present (4 Months)",
    type: "Full-time",
    current: true,
    bullets: [
      "Developing responsive, modern web applications using React, Next.js, and Node.js with clean UI and API integrations.",
      "Implementing end-to-end web tracking via Google Tag Manager (GTM), setting up GA4 custom events and DataLayer architecture.",
      "Configuring Meta Pixel and standard/custom conversion tracking to ensure accurate data capture.",
      "Collaborating with team members to optimize code performance, fix UI bugs, and streamline client project workflows.",
    ],
    tags: ["React", "Next.js", "Node.js", "MongoDB", "GTM", "GA4", "Meta Pixel"],
  },
  {
    id: "exp-freelance",
    role: "Freelance Web Developer & Tracking Expert",
    company: "Self-Employed (Freelance)",
    companyUrl: "https://example.com",
    location: "Remote",
    period: "2025 – Present",
    type: "Freelance",
    bullets: [
      "Successfully delivered 5+ full-stack and front-end web development projects with tailored client requirements.",
      "Configured precise tracking setups using GTM, GA4, Meta Pixel, TikTok Pixel, and LinkedIn Insight Tags.",
      "Built custom e-commerce and business websites with interactive UI, secure backends, and full event tracking capabilities.",
      "Ensured high performance, responsive layouts, and cross-browser compatibility across all client deliverables.",
    ],
    tags: ["MERN Stack", "Tailwind CSS", "GTM", "GA4", "Meta Pixel", "TikTok Pixel", "LinkedIn Tag"],
  },
];

const typeColors: Record<string, string> = {
  "Full-time": "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Contract: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  Freelance: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Part-time": "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
};

interface ExperienceSectionProps {
  experiences?: Experience[];
}

export default function ExperienceSection({
  experiences: propExperiences,
}: ExperienceSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const activeExperiences =
    propExperiences && propExperiences.length > 0
      ? propExperiences
      : experiences;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 150);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="py-24 lg:py-32 px-4 relative overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-5"
        style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto">
        {/* Section label */}
        <div className="reveal flex items-center gap-3 mb-4">
          <span className="text-primary text-sm font-mono font-semibold tracking-widest uppercase">
            04. Experience
          </span>
          <div className="h-px flex-1 max-w-16 bg-primary/40" />
        </div>

        <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-16">
          Work <span className="gradient-text">journey</span>
        </h2>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-5 sm:left-8 top-8 bottom-8 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent pointer-events-none"
            aria-hidden="true"
          />

          <div className="space-y-12 sm:space-y-16">
            {activeExperiences.map((exp: Experience, i: number) => (
              <div
                key={exp._id || exp.id || exp.role}
                id={exp._id || exp.id || `exp-${i}`}
                className={`reveal reveal-delay-${Math.min(i + 2, 5)} relative flex gap-6 sm:gap-10`}
              >
                {/* Timeline dot */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center z-10 shadow-lg transition-all duration-300 ${
                      exp.current
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30 animate-pulse-glow"
                        : "glass border border-border"
                    }`}
                  >
                    <span className={`text-sm sm:text-xl font-black ${exp.current ? "text-white" : "text-foreground"}`}>
                      {exp.company.charAt(0)}
                    </span>
                  </div>
                </div>

                {/* Content card */}
                <div className="flex-1 glass rounded-3xl p-6 sm:p-8 border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-lg font-bold text-foreground">
                          {exp.role}
                        </h3>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
                            typeColors[exp.type] ||
                            "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
                          }`}
                        >
                          {exp.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {exp.companyUrl ? (
                          <a
                            href={exp.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm font-semibold flex items-center gap-1 group"
                          >
                            {exp.company}
                            <ExternalLink
                              size={12}
                              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                            />
                          </a>
                        ) : (
                          <span className="text-primary text-sm font-semibold">
                            {exp.company}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <span className="font-mono">{exp.period}</span>
                      <div className="flex items-center gap-1">
                        <MapPin size={11} />
                        {exp.location}
                      </div>
                    </div>
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-2.5 mb-5">
                    {exp.bullets?.map((bullet: string, j: number) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {exp.tags?.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2.5 py-1 rounded-lg glass border border-border text-muted-foreground font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}