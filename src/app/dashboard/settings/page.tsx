import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sliders } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/authorization";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
import TemplateSwitcher from "@/components/dashboard/TemplateSwitcher";
import PublicationControl from "@/components/dashboard/PublicationControl";
import { SUPPORTED_TEMPLATE_IDS } from "@/templates/index";
import type { TemplateId } from "@/types/portfolio";

export default async function DashboardSettingsPage() {
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
    .select("selectedTemplate publicationStatus")
    .lean();

  const publicationStatus =
    profileDoc?.publicationStatus === "unpublished" ? "unpublished" : "published";

  // Superadmins have access to all supported templates; normal users are authorized via userDoc.allowedTemplates
  const allowedTemplates: TemplateId[] = (
    userDoc.role === "superadmin"
      ? [...SUPPORTED_TEMPLATE_IDS]
      : userDoc.allowedTemplates && userDoc.allowedTemplates.length > 0
      ? userDoc.allowedTemplates
      : [userDoc.profession || "developer"]
  ) as TemplateId[];

  const selectedTemplate: TemplateId =
    (profileDoc?.selectedTemplate as TemplateId) ||
    allowedTemplates[0] ||
    "developer";

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sliders size={18} />
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Portfolio & Template Settings
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure your active portfolio presentation template and visual appearance
          </p>
        </div>
      </div>

      {/* Publication Control */}
      <PublicationControl
        initialStatus={publicationStatus}
        username={userDoc.username}
      />

      {/* Interactive Template Switcher */}
      <TemplateSwitcher
        initialSelectedTemplate={selectedTemplate}
        allowedTemplates={allowedTemplates}
        userRole={userDoc.role}
      />
    </div>
  );
}
