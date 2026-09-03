"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowDown, Download, ExternalLink, Sparkles } from "lucide-react";
import { Github } from "@/components/icons";
import { trackDownloadCV, trackSocialClick } from "@/lib/gtm";

const roles = [
  "Full Stack MERN Developer",
  "React Specialist",
  "Node.js Engineer",
  "MongoDB Architect",
  "API Designer",
];

const floatingBadges = [
  { label: "MongoDB", color: "from-green-500 to-emerald-600", delay: "0s", top: "15%", left: "8%" },
  { label: "Express", color: "from-gray-500 to-gray-700", delay: "1.5s", top: "70%", left: "5%" },
  { label: "React", color: "from-cyan-400 to-blue-500", delay: "0.8s", top: "20%", right: "8%" },
  { label: "Node.js", color: "from-green-400 to-lime-600", delay: "2s", top: "65%", right: "6%" },
  { label: "TypeScript", color: "from-blue-500 to-blue-700", delay: "1.2s", top: "45%", left: "3%" },
  { label: "Next.js", color: "from-slate-600 to-slate-800", delay: "2.5s", top: "40%", right: "4%" },
];

interface HeroSectionProps {
  profile?: {
    name?: string;
    roles?: string[];
    bioBlurb?: string;
    statusText?: string;
    statusAvailable?: boolean;
    avatarUrl?: string;
    cvUrl?: string;
    floatingBadges?: typeof floatingBadges;
    socials?: { platform: string; href: string }[];
  };
}

export default function HeroSection({ profile }: HeroSectionProps) {
  const activeRoles = profile?.roles && profile.roles.length > 0 ? profile.roles : roles;
  const activeBadges = profile?.floatingBadges && profile.floatingBadges.length > 0 ? profile.floatingBadges : floatingBadges;
  const displayName = profile?.name || "Sahadat Hossen";
  const bioBlurb = profile?.bioBlurb || "I build scalable, performant web applications from database to deployment. Passionate about clean code, great UX, and the MERN stack.";
  const statusText = profile?.statusText || "Available for new opportunities";
  const isAvailable = profile?.statusAvailable ?? true;
  const avatarSrc = profile?.avatarUrl || "/profile.jpg";
  const githubLink = profile?.socials?.find((s) => s.platform === "github")?.href || "https://github.com/Sahadat-Hossen1";

  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Typewriter effect
  useEffect(() => {
    const current = activeRoles[roleIndex % activeRoles.length] || "Developer";
    const speed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayed(current.slice(0, charIndex + 1));
        if (charIndex + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        } else {
          setCharIndex((c) => c + 1);
        }
      } else {
        setDisplayed(current.slice(0, charIndex - 1));
        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setRoleIndex((i) => (i + 1) % roles.length);
          setCharIndex(0);
        } else {
          setCharIndex((c) => c - 1);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, roleIndex]);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string;
    }

    const particles: Particle[] = [];
    const colors = ["#818cf8", "#a78bfa", "#c084fc", "#e879f9", "#38bdf8"];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownloadCV = () => {
    trackDownloadCV("hero_section");
    // Download action or trigger
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Gradient blobs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 animate-blob pointer-events-none"
        style={{ background: "radial-gradient(circle, #818cf8, #7c3aed)" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full opacity-8 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #c084fc, #db2777)",
          animation: "blob 10s ease-in-out 3s infinite",
        }}
        aria-hidden="true"
      />

      {/* Floating tech badges */}
      {activeBadges.map((badge) => (
        <div
          key={badge.label}
          className="absolute hidden lg:flex items-center gap-1.5 glass px-3 py-1.5 rounded-full text-xs font-semibold text-white/80 pointer-events-none select-none"
          style={{
            top: badge.top,
            left: badge.left,
            right: badge.right,
            animation: `float 6s ease-in-out ${badge.delay || "0s"} infinite`,
          }}
          aria-hidden="true"
        >
          <span
            className={`w-2 h-2 rounded-full bg-gradient-to-br ${badge.color} flex-shrink-0`}
          />
          {badge.label}
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Status badge */}
        <div className="inline-flex items-center gap-2.5 glass px-4 py-1.5 rounded-full text-xs font-medium border border-emerald-500/20 mb-8 animate-fade-up">
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-emerald-400/40 flex-shrink-0">
            <Image
              src={avatarSrc}
              alt={displayName}
              fill
              sizes="24px"
              className="object-cover object-top"
            />
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            {isAvailable && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
            {statusText}
            <Sparkles size={12} className="text-emerald-400/70" />
          </div>
        </div>

        {/* Name */}
        <h1
          className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight mb-4"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="text-foreground">Hi, I&apos;m </span>
          <span className="gradient-text">{displayName}</span>
        </h1>

        {/* Typewriter role */}
        <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-muted-foreground mb-6 h-10 flex items-center justify-center gap-2">
          <span className="shimmer-text">{displayed}</span>
          <span className="w-0.5 h-8 bg-primary animate-pulse rounded-full" />
        </div>

        {/* Bio blurb */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          {bioBlurb}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            id="hero-view-projects"
            onClick={scrollToProjects}
            size="lg"
            className="group w-full sm:w-auto px-8 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.04] text-base font-semibold rounded-xl"
          >
            <ExternalLink size={18} className="group-hover:rotate-12 transition-transform" />
            View My Work
          </Button>
          <Button
            id="hero-download-resume"
            onClick={handleDownloadCV}
            size="lg"
            variant="outline"
            className="group w-full sm:w-auto px-8 h-12 gradient-border border-0 text-foreground hover:text-foreground bg-transparent hover:bg-white/5 transition-all duration-300 hover:scale-[1.04] text-base font-semibold rounded-xl"
          >
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
            Download CV
          </Button>
          <a
            href={githubLink}
            target="_blank"
            rel="noopener noreferrer"
            id="hero-github"
            onClick={() => trackSocialClick("github", "hero", githubLink)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 text-muted-foreground hover:text-foreground glass rounded-xl transition-all duration-300 hover:scale-[1.04] text-base font-semibold border border-white/10 hover:border-white/20"
          >
            <Github size={18} />
            GitHub
          </a>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 sm:gap-12">
          {[
            { value: "3+", label: "Years Exp." },
            { value: "25+", label: "Projects" },
            { value: "10+", label: "Clients" },
            { value: "99%", label: "Satisfaction" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black gradient-text">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll arrow */}
      <button
        id="hero-scroll-down"
        onClick={scrollToAbout}
        aria-label="Scroll to about section"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        style={{ animation: "float 3s ease-in-out infinite" }}
      >
        <ArrowDown size={22} />
      </button>
    </section>
  );
}
