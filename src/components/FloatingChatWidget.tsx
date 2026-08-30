"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, ExternalLink, Sparkles } from "lucide-react";
import { Whatsapp, Messenger } from "@/components/icons";

interface FloatingChatWidgetProps {
  whatsappNumber?: string;
  whatsappMessage?: string;
  messengerUrl?: string;
}

export default function FloatingChatWidget({
  whatsappNumber = "8801606081657",
  whatsappMessage = "Hi Sahadat, I visited your portfolio and would like to connect!",
  messengerUrl = "https://m.me/sahadat.hossen.1435",
}: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Close on click outside or ESC key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto select-none"
    >
      {/* Uncollapsed Chat Box */}
      {isOpen && (
        <div
          id="chat-widget-popover"
          className="mb-4 w-[320px] sm:w-[350px] glass rounded-3xl p-5 border border-white/10 shadow-2xl shadow-purple-950/40 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                  SH
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-background animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  Sahadat Hossen
                  <Sparkles size={14} className="text-amber-400" />
                </h4>
                <p className="text-[11px] text-emerald-400 font-medium">
                  ● Available on WhatsApp & Messenger
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat options"
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Need to talk about a project or hire me? Select your preferred messaging channel below:
          </p>

          {/* Action Links */}
          <div className="space-y-3">
            {/* WhatsApp Button */}
            <a
              id="chat-widget-whatsapp"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 text-emerald-400 transition-all duration-200 group hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Whatsapp size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                    WhatsApp
                  </span>
                  <ExternalLink size={14} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  Chat directly via WhatsApp
                </p>
              </div>
            </a>

            {/* Messenger Button */}
            <a
              id="chat-widget-messenger"
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 hover:border-blue-500/40 text-blue-400 transition-all duration-200 group hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <Messenger size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground group-hover:text-blue-400 transition-colors">
                    Messenger
                  </span>
                  <ExternalLink size={14} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  Send a Facebook message
                </p>
              </div>
            </a>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-center">
            <span className="text-[10px] text-muted-foreground/70 uppercase tracking-widest font-mono">
              Direct Contact Hub
            </span>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        id="floating-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close messaging options" : "Open messaging options"}
        className="relative group w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
      >
        {/* Glow pulse animation ring when collapsed */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 opacity-40 group-hover:opacity-75 blur animate-pulse" />
        )}

        <div className="relative z-10">
          {isOpen ? (
            <X size={26} className="transition-transform duration-200 rotate-0 hover:rotate-90" />
          ) : (
            <MessageSquare size={26} className="transition-transform duration-200 group-hover:scale-110" />
          )}
        </div>

        {/* Floating Tooltip when collapsed */}
        {!isOpen && (
          <span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl glass text-xs font-semibold text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md border border-white/10">
            Message Me 💬
          </span>
        )}
      </button>
    </div>
  );
}
