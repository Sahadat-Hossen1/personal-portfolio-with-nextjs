import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/authorization";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import ProjectsClient, { DashboardProject } from "./ProjectsClient";

export default async function DashboardProjectsPage() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    redirect("/login");
  }

  await connectToDatabase();

  // Query only projects belonging to the authenticated tenant owner
  const projects = await Project.find({ ownerId: authUser.ownerId })
    .sort({ order: 1, createdAt: -1 })
    .lean();

  // Serialize Mongoose docs into plain JSON-safe objects (omitting ownerId)
  const serializedProjects: DashboardProject[] = projects.map((p) => ({
    _id: p._id.toString(),
    title: p.title,
    description: p.description,
    longDesc: p.longDesc || "",
    image: p.image || "/assets/images/projects/project-1.jpg",
    tags: Array.isArray(p.tags) ? [...p.tags] : [],
    github: p.github || "",
    live: p.live || "",
    emoji: p.emoji || "🚀",
    featured: Boolean(p.featured),
    stars: typeof p.stars === "number" ? p.stars : 0,
    order: typeof p.order === "number" ? p.order : 0,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
  }));

  return <ProjectsClient initialProjects={serializedProjects} />;
}
