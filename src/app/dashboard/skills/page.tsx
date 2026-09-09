import Link from "next/link";
import { Cpu, ArrowLeft, Clock } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/authorization";
import { connectToDatabase } from "@/lib/mongodb";
import Skill from "@/models/Skill";
import SkillTag from "@/models/SkillTag";
import { redirect } from "next/navigation";

export default async function DashboardSkillsPage() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) redirect("/login");

  await connectToDatabase();
  const [skillCount, tagCount] = await Promise.all([
    Skill.countDocuments({ ownerId: authUser.ownerId }),
    SkillTag.countDocuments({ ownerId: authUser.ownerId }),
  ]);

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
            Skills & Tags Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your technical skill bars and categorization tags
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
          <Cpu size={32} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Skills Management Foundation
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            You currently have{" "}
            <span className="font-semibold text-cyan-400">{skillCount}</span> skill
            {skillCount === 1 ? "" : "s"} and{" "}
            <span className="font-semibold text-cyan-400">{tagCount}</span> tag
            {tagCount === 1 ? "" : "s"} saved. Full interactive management interface will be
            unveiled in Phase 6.
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
