"use client";

import Image from "next/image";
import { Clapperboard, MapPin } from "lucide-react";
import type { ProfileData } from "@/types/portfolio";

interface VideoAboutProps {
  profile: ProfileData;
}

export default function VideoAbout({ profile }: VideoAboutProps) {
  const avatarSrc = profile?.avatarUrl || "/profile.jpg";
  const displayName = profile?.name || "Creative Editor";
  const aboutTitle = profile?.aboutTitle || "Shaping Emotion Through Cut & Color";
  const p1 =
    profile?.aboutP1 ||
    "Every cut tells a story. I approach video editing as a rhythmic craft where pacing, sound design, and color work together to immerse the viewer and elevate the director's vision.";
  const p2 =
    profile?.aboutP2 ||
    "Whether assembling fast-paced high-conversion commercial promos, corporate brand narratives, or stylized music videos, my focus is always on emotional resonance, visual precision, and pristine delivery standards.";

  return (
    <section id="about" className="py-24 px-4 bg-zinc-900/30 relative overflow-hidden border-t border-zinc-800/80">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left: Cinematic 4:5 Portrait Frame */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-72 sm:w-80 aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl group">
              <Image
                src={avatarSrc}
                alt={displayName}
                fill
                sizes="(max-width: 640px) 288px, 320px"
                className="object-cover object-top filter grayscale contrast-110 group-hover:grayscale-0 transition-all duration-700"
              />

              {/* Film Grain & Letterbox Framing */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

              {/* Bottom Slate Overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-zinc-950/85 backdrop-blur-md border border-zinc-800">
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 mb-1">
                  <span>FRAME: 2.39:1</span>
                  <span className="text-red-400 font-bold">EDITOR // DIRECTOR</span>
                </div>
                <div className="text-sm font-bold text-white font-mono">{displayName}</div>
              </div>
            </div>
          </div>

          {/* Right: Vision & Editorial Approach */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-red-500 uppercase tracking-widest">
              <Clapperboard size={14} />
              <span>Editorial Philosophy</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white uppercase">
              {aboutTitle}
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed">
              <p>{p1}</p>
              <p className="text-zinc-400">{p2}</p>
            </div>

            {/* Editorial Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { title: "Rhythm & Pacing", desc: "Crafting tempo tailored to music & beat." },
                { title: "Visual Flow", desc: "Match cutting and fluid eye-trace direction." },
                { title: "Color Atmosphere", desc: "Mood grading matching narrative intent." },
                { title: "Sound Impact", desc: "Layered Foley and dynamic sonic mastering." },
              ].map((h) => (
                <div key={h.title} className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                  <div className="font-mono text-xs font-bold text-white mb-1 uppercase">{h.title}</div>
                  <div className="text-[11px] text-zinc-400 leading-tight">{h.desc}</div>
                </div>
              ))}
            </div>

            {/* Studio Location & Availability */}
            <div className="flex items-center gap-4 pt-4 border-t border-zinc-800 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-red-500" />
                <span>Studio: {profile?.location || "Dhaka, Bangladesh (Remote Worldwide)"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
