import Link from "next/link";
import { Briefcase, ArrowLeft, Clock } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/authorization";
import { connectToDatabase } from "@/lib/mongodb";
import Experience from "@/models/Experience";
import { redirect } from "next/navigation";

export default async function DashboardExperiencePage() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) redirect("/login");

  await connectToDatabase();
  const experienceCount = await Experience.countDocuments({
    ownerId: authUser.ownerId,
  });

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
            Experience Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your employment history and career milestones
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
          <Briefcase size={32} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Experience Management Foundation
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            You currently have{" "}
            <span className="font-semibold text-emerald-400">{experienceCount}</span> career
            experience record{experienceCount === 1 ? "" : "s"} saved. Interactive editor
            will be added in Phase 6.
          </p>
        </div>
        <div className="pt-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
            <Clock size={12} />
            <span>Interactive CRUD coming in Phase 6</span>
          </span>
        </div>
      </div>
    </div>
  );
}
