import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FolderGit2,
  Cpu,
  Briefcase,
  Mail,
  ArrowUpRight,
  Sparkles,
  Layers,
  UserCheck,
} from "lucide-react";
import { getAuthenticatedUser } from "@/lib/authorization";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import Experience from "@/models/Experience";
import Message from "@/models/Message";
import PublicationControl from "@/components/dashboard/PublicationControl";

export default async function DashboardPage() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    redirect("/login");
  }

  await connectToDatabase();

  const userDoc = await User.findById(authUser.ownerId)
    .select("name email username profession allowedTemplates role plan")
    .lean();

  if (!userDoc) {
    redirect("/login");
  }

  const profileDoc = await Profile.findOne({ ownerId: authUser.ownerId })
    .select("selectedTemplate bioBlurb aboutTitle publicationStatus")
    .lean();

  const publicationStatus =
    profileDoc?.publicationStatus === "unpublished" ? "unpublished" : "published";

  const [projectCount, skillCount, experienceCount, messageCount, unreadMessageCount] =
    await Promise.all([
      Project.countDocuments({ ownerId: authUser.ownerId }),
      Skill.countDocuments({ ownerId: authUser.ownerId }),
      Experience.countDocuments({ ownerId: authUser.ownerId }),
      Message.countDocuments({ ownerId: authUser.ownerId }),
      Message.countDocuments({ ownerId: authUser.ownerId, read: false }),
    ]);

  const activeTemplate =
    profileDoc?.selectedTemplate ||
    userDoc.allowedTemplates?.[0] ||
    userDoc.profession ||
    "developer";

  const allowedTemplates = userDoc.allowedTemplates || [activeTemplate];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-card via-card to-indigo-950/20 border border-border shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <Sparkles size={13} />
              <span>Personal Portfolio Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Welcome back, {userDoc.name}!
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
              Manage your personal portfolio content, track received messages, and
              configure your active template presentation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <span>Edit Profile</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Portfolio Publication Control */}
      <PublicationControl
        initialStatus={publicationStatus}
        username={userDoc.username}
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Projects Metric */}
        <Link
          href="/dashboard/projects"
          className="group p-5 rounded-2xl bg-card/60 border border-border hover:border-indigo-500/40 hover:bg-card transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Projects
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderGit2 size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-foreground">{projectCount}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>Showcased items</span>
              <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-[11px]">
                Manage →
              </span>
            </p>
          </div>
        </Link>

        {/* Skills Metric */}
        <Link
          href="/dashboard/skills"
          className="group p-5 rounded-2xl bg-card/60 border border-border hover:border-cyan-500/40 hover:bg-card transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Skills
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cpu size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-foreground">{skillCount}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>Technical proficiencies</span>
              <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-[11px]">
                Manage →
              </span>
            </p>
          </div>
        </Link>

        {/* Experience Metric */}
        <Link
          href="/dashboard/experience"
          className="group p-5 rounded-2xl bg-card/60 border border-border hover:border-emerald-500/40 hover:bg-card transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Experience
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-foreground">{experienceCount}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>Career milestones</span>
              <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-[11px]">
                Manage →
              </span>
            </p>
          </div>
        </Link>

        {/* Messages Metric */}
        <Link
          href="/dashboard/messages"
          className="group p-5 rounded-2xl bg-card/60 border border-border hover:border-purple-500/40 hover:bg-card transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Messages
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground">{messageCount}</span>
              {unreadMessageCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {unreadMessageCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>Client inquiries</span>
              <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-[11px]">
                Inbox →
              </span>
            </p>
          </div>
        </Link>
      </div>

      {/* Account & Template Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Identity Details */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <UserCheck size={18} />
            </div>
            <h2 className="font-bold text-base text-foreground">User Identity</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block mb-0.5">Full Name</span>
              <span className="font-semibold text-foreground text-sm">{userDoc.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">Email</span>
              <span className="font-semibold text-foreground">{userDoc.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">Username</span>
              <span className="font-mono text-indigo-400">@{userDoc.username}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">Profession</span>
              <span className="capitalize font-medium px-2.5 py-1 rounded-md bg-muted inline-block">
                {userDoc.profession.replace("-", " ")}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">Account Plan</span>
              <span className="uppercase tracking-wider font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block">
                {userDoc.plan}
              </span>
            </div>
          </div>
        </div>

        {/* Template Status */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Layers size={18} />
              </div>
              <h2 className="font-bold text-base text-foreground">Template Status</h2>
            </div>
            <Link
              href="/dashboard/settings"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Change Template →
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs text-muted-foreground block mb-1">
                Current Active Template
              </span>
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-indigo-400 capitalize">
                    {activeTemplate.replace("-", " ")}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Applied presentation theme for your portfolio
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500 text-white shadow-sm">
                  Active
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block mb-1.5">
                Authorized Templates for Your Account
              </span>
              <div className="flex flex-wrap gap-2">
                {allowedTemplates.map((tmpl) => {
                  const isActive = tmpl === activeTemplate;
                  return (
                    <span
                      key={tmpl}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize border transition-all ${
                        isActive
                          ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-semibold"
                          : "bg-muted/50 border-border text-muted-foreground"
                      }`}
                    >
                      {tmpl.replace("-", " ")}
                      {isActive && " (Current)"}
                    </span>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Template access is authorized server-side based on your account role and
                profession.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
