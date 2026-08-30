"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ExternalLink, Star } from "lucide-react";
import { Github } from "@/components/icons";
import { trackProjectClick } from "@/lib/gtm";

type Project = {
  id: string;
  title: string;
  description: string;
  longDesc: string;
  image: string;
  tags: string[];
  github: string;
  live: string;
  emoji: string;
  featured?: boolean;
  stars?: number;
};

const projects: Project[] = [
  {
    id: "project-ecommerce-tracking",
    title: "ShopFlow E-Commerce & Full Tracking",
    description: "MERN Stack E-Commerce with GTM, GA4 & Meta Pixel",
    longDesc:
      "A complete full-stack e-commerce platform built with Next.js, Node.js, and MongoDB. Integrated with DataLayer, Google Analytics 4 (GA4) E-commerce tracking, and Meta Pixel Conversion API via Google Tag Manager.",
    image: "/assets/images/projects/project-1.jpg",
    tags: ["Next.js", "Node.js", "MongoDB", "GTM", "GA4", "Meta Pixel", "Tailwind CSS"],
    github: "https://github.com",
    live: "https://example.com",
    emoji: "🛒",
    featured: true,
    stars: 48,
  },
  {
    id: "project-analytics-dashboard",
    title: "DevMetrics & Event Visualizer",
    description: "Full-Stack Web App with Real-Time Event Tracking",
    longDesc:
      "A developer productivity and event metrics portal with interactive dashboards, custom event triggers, TikTok & LinkedIn Tag integration, and automated user journey tracking.",
    image: "/assets/images/projects/project-2.jpg",
    tags: ["React", "Express.js", "Tailwind CSS", "DataLayer", "GA4", "TikTok Pixel"],
    github: "https://github.com",
    live: "https://example.com",
    emoji: "📊",
    featured: true,
    stars: 35,
  },
  {
    id: "project-collabflow",
    title: "CollabFlow Task Manager",
    description: "Collaborative project board with real-time UI",
    longDesc: "Full-stack project management app with interactive boards, responsive UI, and custom analytics event tracking on task completion.",
    image: "/assets/images/projects/project-3.jpg",
    tags: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
    github: "https://github.com",
    live: "https://example.com",
    emoji: "🚀",
    stars: 24,
  },
  {
    id: "project-authkit",
    title: "Auth & User Management",
    description: "JWT Authentication & Custom Event Logging",
    longDesc: "Secure authentication system supporting JWT, OAuth, and conversion tracking for user signups and login flows.",
    image: "/assets/images/projects/project-4.jpg",
    tags: ["Node.js", "Express", "JWT", "GTM"],
    github: "https://github.com",
    live: "https://example.com",
    emoji: "🔐",
    stars: 19,
  },
  {
    id: "project-foodsearch",
    title: "Food Discovery & Recipe App",
    description: "Interactive Recipe Finder with Filter Tracking",
    longDesc: "A responsive React application featuring real-time search, category filtering, and button click event tracking.",
    image: "/assets/images/projects/project-5.jpg",
    tags: ["React", "REST API", "Tailwind CSS", "Meta Pixel"],
    github: "https://github.com",
    live: "https://example.com",
    emoji: "🍲",
    stars: 15,
  },
  {
    id: "project-weather-portal",
    title: "Live Weather & Utility App",
    description: "Location-based real-time weather application",
    longDesc: "Weather app fetching live meteorological data with interactive UI widgets and search analytics tracking.",
    image: "/assets/images/projects/project-6.jpg",
    tags: ["JavaScript", "OpenWeather API", "CSS3", "GA4"],
    github: "https://github.com",
    live: "https://example.com",
    emoji: "🌤️",
    stars: 12,
  },
];

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);

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
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="py-24 lg:py-32 px-4 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <div className="reveal flex items-center gap-3 mb-4">
          <span className="text-primary text-sm font-mono font-semibold tracking-widest uppercase">
            03. Projects
          </span>
          <div className="h-px flex-1 max-w-16 bg-primary/40" />
        </div>

        <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4">
          Things I&apos;ve <span className="gradient-text">built</span>
        </h2>
        <p className="reveal reveal-delay-2 text-muted-foreground max-w-xl mb-16">
          A selection of recent full-stack applications, developer tools, and client projects built with modern web technologies.
        </p>

        {/* Featured Projects Grid */}
        <div className="space-y-12 mb-16">
          {featured.map((project, i) => (
            <article
              key={project.id}
              id={project.id}
              className={`reveal reveal-delay-${i + 1} group glass rounded-3xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-500 grid md:grid-cols-12 gap-0 shadow-2xl hover:shadow-indigo-500/10`}
            >
              {/* Image Column */}
              <div
                className={`md:col-span-7 relative min-h-[260px] sm:min-h-[320px] overflow-hidden bg-slate-900 ${
                  i % 2 === 1 ? "md:order-2" : ""
                }`}
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent md:hidden" />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="glass px-3 py-1 rounded-full text-xs font-semibold text-primary border border-primary/20 backdrop-blur-md">
                    Featured Project
                  </span>
                </div>
              </div>

              {/* Info Column */}
              <div
                className={`md:col-span-5 p-6 sm:p-8 flex flex-col justify-between ${
                  i % 2 === 1 ? "md:order-1" : ""
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{project.emoji}</span>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {project.description}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                    {project.longDesc}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-lg glass border border-white/5 text-muted-foreground font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} GitHub`}
                      onClick={() => trackProjectClick(project.title, "github", project.github)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github size={15} /> Source Code
                    </a>
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} live demo`}
                      onClick={() => trackProjectClick(project.title, "live_demo", project.live)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors ml-auto"
                    >
                      <ExternalLink size={14} /> Live Demo
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Other Projects (Grid) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {others.map((project, i) => (
            <article
              key={project.id}
              id={project.id}
              className={`reveal reveal-delay-${i + 2} group glass rounded-2xl overflow-hidden border border-white/5 hover:border-primary/25 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col`}
            >
              <div className="relative w-full h-36 overflow-hidden bg-slate-900 border-b border-white/5">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute top-2 left-2 w-8 h-8 rounded-lg glass flex items-center justify-center text-base border border-white/10 backdrop-blur-md">
                  {project.emoji}
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} GitHub`}
                      onClick={() => trackProjectClick(project.title, "github", project.github)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github size={14} />
                    </a>
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} live`}
                      onClick={() => trackProjectClick(project.title, "live_demo", project.live)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed flex-1">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-md glass border border-white/5 text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md text-muted-foreground">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All on GitHub */}
        <div className="reveal text-center mt-12">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            id="projects-view-github"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group px-5 py-2.5 rounded-full glass border border-white/5 hover:border-white/15"
          >
            <Github size={16} />
            View all projects on GitHub
            <ExternalLink
              size={13}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </a>
        </div>
      </div>
    </section>
  );
}