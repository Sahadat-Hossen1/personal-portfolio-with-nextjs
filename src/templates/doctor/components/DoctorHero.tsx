"use client";

import Image from "next/image";
import { ArrowRight, FileDown, Mail, ShieldCheck } from "lucide-react";
import type { ProfileData } from "@/types/portfolio";

interface DoctorHeroProps {
  profile?: ProfileData;
}

export default function DoctorHero({ profile }: DoctorHeroProps) {
  const name = profile?.name || "Dr. Medical Professional";
  const roles = profile?.roles?.length
    ? profile.roles
    : ["Medical Specialist", "Consultant"];
  const bioBlurb =
    profile?.bioBlurb ||
    "Dedicated to providing exceptional, evidence-based care and clinical excellence.";
  const statusText = profile?.statusText || "Available for consultations";
  const statusAvailable = profile?.statusAvailable ?? true;
  const avatarUrl = profile?.avatarUrl || "/profile.jpg";
  const cvUrl = profile?.cvUrl;
  const floatingBadges = profile?.floatingBadges || [];

  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-32 overflow-hidden"
    >
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-teal-500/10 dark:bg-teal-500/8 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-cyan-500/10 dark:bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text & Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/25 text-xs font-semibold text-teal-700 dark:text-teal-300 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                {statusAvailable && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    statusAvailable ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                ></span>
              </span>
              <span>{statusText}</span>
            </div>

            {/* Main Name & Title */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                {name}
              </h1>

              {/* Roles pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
                {roles.map((role, idx) => (
                  <span
                    key={idx}
                    className="text-xs sm:text-sm font-medium px-3 py-1 rounded-lg bg-card/80 text-foreground border border-border shadow-xs"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Bio Blurb */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {bioBlurb}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/25 hover:shadow-teal-600/35 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
              >
                <Mail size={16} />
                <span>Get in Touch</span>
                <ArrowRight size={16} />
              </a>

              {cvUrl && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-card hover:bg-muted text-foreground border border-border font-semibold text-sm shadow-xs transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                >
                  <FileDown size={16} className="text-teal-600 dark:text-teal-400" />
                  <span>Curriculum Vitae</span>
                </a>
              )}

              <a
                href="#about"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground font-medium text-sm transition-colors"
              >
                <span>Learn More</span>
              </a>
            </div>
          </div>

          {/* Right Column: Physician Portrait & Badges */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[4/5]">
              {/* Frame Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 via-cyan-500/15 to-transparent rounded-3xl -rotate-2 transform scale-102 filter blur-sm"></div>

              {/* Portrait Container */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-teal-500/30 dark:border-teal-500/20 bg-card shadow-xl">
                <Image
                  src={avatarUrl}
                  alt={name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="object-cover object-top hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Subtle bottom gradient overlay for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60"></div>
              </div>

              {/* Verified Professional Badge */}
              <div className="absolute -bottom-4 left-6 right-6 sm:left-8 sm:right-8 p-3 rounded-2xl bg-card/95 backdrop-blur-md border border-teal-500/30 shadow-lg flex items-center gap-3 z-10">
                <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">
                    Verified Professional
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {roles[0] || "Medical Practice"}
                  </div>
                </div>
              </div>

              {/* Floating Badges from Data */}
              {floatingBadges.map((badge, idx) => (
                <div
                  key={idx}
                  style={{
                    top: badge.top,
                    left: badge.left,
                    right: badge.right,
                  }}
                  className={`hidden sm:inline-flex absolute z-10 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md backdrop-blur-md border border-white/20 text-white bg-gradient-to-r ${
                    badge.color || "from-teal-600 to-cyan-600"
                  }`}
                >
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
