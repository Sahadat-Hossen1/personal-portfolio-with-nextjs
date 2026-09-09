import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/authorization";
import { connectToDatabase } from "@/lib/mongodb";
import Experience from "@/models/Experience";
import ExperienceClient, { DashboardExperience } from "./ExperienceClient";

export default async function DashboardExperiencePage() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    redirect("/login");
  }

  await connectToDatabase();

  // Query only experiences belonging to the authenticated tenant owner
  const experiences = await Experience.find({ ownerId: authUser.ownerId })
    .sort({ order: 1, createdAt: -1 })
    .lean();

  // Serialize Mongoose docs into plain JSON-safe objects (omitting ownerId)
  const serializedExperiences: DashboardExperience[] = experiences.map((exp) => ({
    _id: exp._id.toString(),
    role: exp.role,
    company: exp.company,
    companyUrl: exp.companyUrl || "",
    location: exp.location || "Remote",
    period: exp.period,
    type: exp.type || "Full-time",
    bullets: Array.isArray(exp.bullets) ? [...exp.bullets] : [],
    tags: Array.isArray(exp.tags) ? [...exp.tags] : [],
    current: Boolean(exp.current),
    order: typeof exp.order === "number" ? exp.order : 0,
    createdAt: exp.createdAt ? new Date(exp.createdAt).toISOString() : undefined,
    updatedAt: exp.updatedAt ? new Date(exp.updatedAt).toISOString() : undefined,
  }));

  return <ExperienceClient initialExperiences={serializedExperiences} />;
}
