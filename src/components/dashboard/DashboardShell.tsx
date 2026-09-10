"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  User as UserIcon,
  FolderGit2,
  Cpu,
  Briefcase,
  Mail,
  Sliders,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Layers,
  Code2,
  Video,
  TrendingUp,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export interface DashboardUserIdentity {
  name: string;
  email: string;
  username: string;
  profession: string;
  selectedTemplate: string;
  allowedTemplates: string[];
  role: string;
}

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/dashboard/profile", icon: UserIcon },
  { label: "Projects", href: "/dashboard/projects", icon: FolderGit2 },
  { label: "Skills", href: "/dashboard/skills", icon: Cpu },
  { label: "Experience", href: "/dashboard/experience", icon: Briefcase },
  { label: "Messages", href: "/dashboard/messages", icon: Mail },
  { label: "Settings", href: "/dashboard/settings", icon: Sliders },
];

function renderProfessionIcon(profession: string, size: number, className?: string) {
  switch (profession) {
    case "video-editor":
      return <Video size={size} className={className} />;
    case "digital-marketer":
      return <TrendingUp size={size} className={className} />;
    case "doctor":
      return <Stethoscope size={size} className={className} />;
    case "developer":
    default:
      return <Code2 size={size} className={className} />;
  }
}

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: DashboardUserIdentity;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row transition-colors duration-300">
      {/* Mobile Topbar */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            {renderProfessionIcon(user.profession, 18, "text-white")}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-foreground">
              {user.name}
            </span>
            <span className="text-[11px] text-muted-foreground capitalize">
              {user.profession.replace("-", " ")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
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
        {/* Header / Brand */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              {renderProfessionIcon(user.profession, 20, "text-white")}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm tracking-tight text-foreground truncate flex items-center gap-1.5">
                <span>{user.name}</span>
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                @{user.username}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="hidden lg:block">
              <ModeToggle />
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* User Badges & Meta */}
        <div className="px-4 py-3 bg-muted/30 border-b border-border/60 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Profession:</span>
            <span className="font-medium text-foreground capitalize px-2 py-0.5 rounded bg-muted/60 border border-border/50">
              {user.profession.replace("-", " ")}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground flex items-center gap-1">
              <Layers size={12} className="text-indigo-400" />
              Template:
            </span>
            <span className="font-medium text-indigo-500 dark:text-indigo-400 capitalize px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              {user.selectedTemplate}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {/* Superadmin Platform Control Plane Navigation */}
          {user.role === "superadmin" && (
            <div className="pb-2 mb-2 border-b border-border/60">
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-indigo-500/5 text-indigo-400 dark:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-indigo-400" />
                  <span>Platform Admin</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  Control
                </span>
              </Link>
            </div>
          )}

          {navItems.map((item) => {
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
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-border space-y-1 bg-muted/20">
          <Link
            href={user.username ? `/p/${user.username}` : "/"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={15} />
              View Portfolio
            </span>
            <span className="text-[10px] text-muted-foreground/60">Live</span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
