import Link from "next/link";
import { Sliders, ArrowLeft, Clock } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/authorization";
import { redirect } from "next/navigation";

export default async function DashboardSettingsPage() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) redirect("/login");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Account & Portfolio Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage account preferences, credentials, and portfolio options
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
          <Sliders size={32} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Settings Foundation
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Account security, password updates, and advanced portfolio configurations will
            be available in Phase 6.
          </p>
        </div>
        <div className="pt-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
            <Clock size={12} />
            <span>Settings modules coming in Phase 6</span>
          </span>
        </div>
      </div>
    </div>
  );
}
