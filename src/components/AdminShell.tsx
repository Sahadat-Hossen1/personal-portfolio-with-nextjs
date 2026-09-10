"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Users,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

const platformNavItems = [
  { label: "Platform Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Tenant Users", href: "/admin/users", icon: Users },
  { label: "Platform Stats", href: "/admin/stats", icon: BarChart3 },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row transition-colors duration-300">
      {/* Mobile Topbar */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <span className="font-bold text-base gradient-text">Platform Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 border-r border-border bg-card/90 backdrop-blur-xl z-50 flex flex-col transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                Control Plane
                <Sparkles size={12} className="text-amber-400" />
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Superadmin Mode
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="hidden lg:block">
              <ModeToggle />
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {/* Platform Management Section */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Platform Control Plane
            </div>
            {platformNavItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-foreground border border-indigo-500/40 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={active ? "text-indigo-400" : "text-muted-foreground"}
                    />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick Return to Personal Dashboard */}
          <div className="pt-2 border-t border-border/50">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
            >
              <ArrowLeft size={18} className="text-indigo-400" />
              <span>Return to My Portfolio Dashboard</span>
            </Link>
          </div>
        </nav>

        {/* Bottom Footer Actions */}
        <div className="p-3 border-t border-border space-y-1 bg-muted/20">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={15} />
              SaaS Landing Page
            </span>
            <span className="text-[10px] text-muted-foreground/60">Opens tab</span>
          </a>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>{isLoggingOut ? "Logging out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
