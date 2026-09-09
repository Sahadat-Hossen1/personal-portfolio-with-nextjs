import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/authorization";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    redirect("/login");
  }

  await connectToDatabase();
  const userDoc = await User.findById(authUser.userId)
    .select("name email username profession allowedTemplates role plan accountStatus")
    .lean();

  if (!userDoc || userDoc.accountStatus === "suspended") {
    redirect("/login");
  }

  const profileDoc = await Profile.findOne({ ownerId: authUser.userId })
    .select("selectedTemplate")
    .lean();

  const selectedTemplate =
    profileDoc?.selectedTemplate ||
    userDoc.allowedTemplates?.[0] ||
    userDoc.profession ||
    "developer";

  return (
    <DashboardShell
      user={{
        name: userDoc.name || authUser.username,
        email: userDoc.email || authUser.email,
        username: userDoc.username || authUser.username,
        profession: userDoc.profession || "developer",
        selectedTemplate,
        allowedTemplates: userDoc.allowedTemplates || [selectedTemplate],
        role: userDoc.role || "user",
      }}
    >
      {children}
    </DashboardShell>
  );
}
