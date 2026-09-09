import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/authorization";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
import ProfileForm from "./ProfileForm";
import type { TemplateId } from "@/types/portfolio";

export default async function DashboardProfilePage() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    redirect("/login");
  }

  await connectToDatabase();

  const userDoc = await User.findById(authUser.ownerId)
    .select("name email username profession allowedTemplates")
    .lean();

  if (!userDoc) {
    redirect("/login");
  }

  let profileDoc = await Profile.findOne({ ownerId: authUser.ownerId }).lean();

  // Allowed templates strictly sourced from User authoritative record
  const allowedTemplates = (userDoc.allowedTemplates || [
    userDoc.profession || "developer",
  ]) as TemplateId[];

  const initialProfile = {
    name: profileDoc?.name || userDoc.name || "",
    bioBlurb: profileDoc?.bioBlurb || "",
    statusText: profileDoc?.statusText || "Available for opportunities",
    statusAvailable: profileDoc?.statusAvailable ?? true,
    aboutTitle: profileDoc?.aboutTitle || "",
    aboutP1: profileDoc?.aboutP1 || "",
    aboutP2: profileDoc?.aboutP2 || "",
    currentlyBuilding: profileDoc?.currentlyBuilding || "",
    location: profileDoc?.location || "",
    phone: profileDoc?.phone || userDoc.phone || "",
    whatsappNumber: profileDoc?.whatsappNumber || userDoc.phone || "",
    selectedTemplate:
      (profileDoc?.selectedTemplate as TemplateId) ||
      allowedTemplates[0] ||
      ("developer" as TemplateId),
    sections: profileDoc?.sections,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Profile & Bio Management
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Update your public profile, about sections, contact details, and presentation
          template.
        </p>
      </div>

      <ProfileForm
        initialProfile={initialProfile}
        allowedTemplates={allowedTemplates}
        userEmail={userDoc.email}
        username={userDoc.username}
        profession={userDoc.profession}
      />
    </div>
  );
}
