"use client";

import { useEffect, useRef, ComponentType } from "react";
import Image from "next/image";
import { MapPin, Coffee, Briefcase, Star } from "lucide-react";

const defaultStats = [
  { icon: Briefcase, value: "1+", label: "Years of Experience" },
  { icon: Star, value: "10+", label: "Projects Delivered" },
  { icon: Coffee, value: "1k+", label: "Cups of Coffee" },
  { icon: MapPin, value: "Remote", label: "Work Style" },
];

const defaultHighlights = [
  { emoji: "⚡", text: "Building real-time apps with Node.js & WebSocket" },
  { emoji: "🌐", text: "RESTful API design and development" },
  { emoji: "🚀", text: "CI/CD pipelines with GitHub Actions & Docker" },
  { emoji: "🎨", text: "Pixel-perfect UIs with React & Next.js" },
];

const iconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  Briefcase,
  Star,
  Coffee,
  MapPin,
};

interface DevAboutProps {
  profile?: {
    name?: string;
    avatarUrl?: string;
    aboutTitle?: string;
    aboutP1?: string;
    aboutP2?: string;
    currentlyBuilding?: string;
    location?: string;
    stats?: { iconName: string; value: string; label: string }[];
    highlights?: { emoji: string; text: string }[];
  };
}

export default function DevAbout({ profile }: DevAboutProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const title = profile?.aboutTitle || "Crafting digital experiences";
  const avatarSrc = profile?.avatarUrl || "/profile.jpg";
  const buildingText = profile?.currentlyBuilding || "SaaS Dashboard App";
  const loc = profile?.location || "Dhaka, Bangladesh";
  const p1 = profile?.aboutP1;
  const p2 = profile?.aboutP2;
  const activeHighlights =
    profile?.highlights && profile.highlights.length > 0
      ? profile.highlights
      : defaultHighlights;
  const activeStats =
    profile?.stats && profile.stats.length > 0
      ? profile.stats.map((s) => ({
          icon: iconMap[s.iconName] || Briefcase,
          value: s.value,
          label: s.label,
        }))
      : defaultStats;

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
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-24 lg:py-32 px-4 relative overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-5"
        style={{
          background: "radial-gradient(circle, #818cf8, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <div className="reveal flex items-center gap-3 mb-4">
          <span className="text-primary text-sm font-mono font-semibold tracking-widest uppercase">
            01. About
          </span>
          <div className="h-px flex-1 max-w-16 bg-primary/40" />
        </div>

        <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-16">
          {title.includes(" ") ? (
            <>
              {title.substring(0, title.lastIndexOf(" "))}{" "}
              <span className="gradient-text">
                {title.substring(title.lastIndexOf(" ") + 1)}
              </span>
            </>
          ) : (
            <span className="gradient-text">{title}</span>
          )}
        </h2>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Avatar + decoration */}
          <div className="reveal reveal-delay-2 relative flex justify-center lg:justify-start">
            {/* Glow ring behind avatar */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-72 h-72 rounded-full opacity-20 animate-pulse-glow"
                style={{
                  background:
                    "radial-gradient(circle, #818cf8, #7c3aed, transparent 70%)",
                }}
              />
            </div>

            {/* Avatar container */}
            <div className="relative">
              <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl glass gradient-border overflow-hidden shadow-2xl group relative">
                <Image
                  src={avatarSrc}
                  alt={profile?.name || "Profile Photo"}
                  fill
                  sizes="(max-width: 640px) 256px, 288px"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>

              {/* Floating card: Currently */}
              <div className="absolute -bottom-6 -right-6 glass rounded-2xl px-4 py-3 shadow-xl border border-border animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-muted-foreground">
                    Currently building:
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {buildingText}
                </p>
              </div>

              {/* Floating card: Location */}
              <div className="absolute -top-4 -left-6 glass rounded-2xl px-4 py-3 shadow-xl border border-border animate-float-delayed">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {loc}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Bio */}
          <div className="space-y-6">
            <div className="reveal reveal-delay-3">
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
                {p1 || (
                  <>
                    I&apos;m a passionate{" "}
                    <span className="text-foreground font-semibold">
                      Full Stack MERN Developer
                    </span>{" "}
                    with 1+ years of experience building production-ready web
                    applications. I specialize in creating scalable,
                    high-performance applications with a focus on developer
                    experience and end-user satisfaction.
                  </>
                )}
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                {p2 || (
                  <>
                    When I&apos;m not writing code, you&apos;ll find me
                    contributing to open-source projects, writing technical
                    blog posts, or exploring the latest in web technology. I
                    believe great software is built at the intersection of
                    elegant code and intuitive design.
                  </>
                )}
              </p>
            </div>

            {/* Highlights */}
            <div className="reveal reveal-delay-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeHighlights.map((item) => (
                <div
                  key={item.text}
                  className="flex items-start gap-3 glass rounded-xl px-4 py-3 border border-border hover:border-primary/30 transition-colors duration-300"
                >
                  <span className="text-lg flex-shrink-0">{item.emoji}</span>
                  <span className="text-sm text-muted-foreground leading-snug">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="reveal reveal-delay-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {activeStats.map((stat) => (
                <div
                  key={stat.label}
                  className="glass rounded-2xl p-4 text-center border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <stat.icon
                    size={20}
                    className="mx-auto mb-2 text-primary group-hover:scale-110 transition-transform"
                  />
                  <div className="text-xl font-black gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
