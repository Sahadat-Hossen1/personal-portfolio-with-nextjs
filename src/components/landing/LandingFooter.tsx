import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export default function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card/40 text-muted-foreground transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="font-black text-sm text-foreground">
                Portfolio<span className="gradient-text">OS</span>
              </span>
              <p className="text-[11px] text-muted-foreground">
                Multi-Tenant SaaS Portfolio Platform
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <a href="#templates" className="hover:text-foreground transition-colors">
              Templates
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing & Plans
            </a>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-foreground transition-colors">
              Create Account
            </Link>
          </div>

          {/* Theme & Copyright */}
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} PortfolioOS. All rights reserved.
            </span>
            <ModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
