import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/authorization";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import AdminShell from "@/components/AdminShell";

export default async function AdminLayout({
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
    .select("role accountStatus")
    .lean();

  if (!userDoc) {
    redirect("/login");
  }

  if (userDoc.accountStatus === "suspended") {
    redirect("/dashboard");
  }

  if (userDoc.role !== "superadmin") {
    redirect("/dashboard");
  }

  return <AdminShell>{children}</AdminShell>;
}
