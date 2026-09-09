import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/authorization";
import { connectToDatabase } from "@/lib/mongodb";
import Skill from "@/models/Skill";
import SkillTag from "@/models/SkillTag";
import SkillsClient, { DashboardSkill, DashboardSkillTag } from "./SkillsClient";

export default async function DashboardSkillsPage() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    redirect("/login");
  }

  await connectToDatabase();

  // Query only skills and tags belonging to the authenticated tenant owner
  const [skills, tags] = await Promise.all([
    Skill.find({ ownerId: authUser.ownerId }).sort({ order: 1, createdAt: 1 }).lean(),
    SkillTag.find({ ownerId: authUser.ownerId }).sort({ order: 1, createdAt: 1 }).lean(),
  ]);

  // Serialize Mongoose docs into plain JSON-safe objects (omitting ownerId)
  const serializedSkills: DashboardSkill[] = skills.map((s) => ({
    _id: s._id.toString(),
    name: s.name,
    icon: s.icon || "⚡",
    level: typeof s.level === "number" ? s.level : 80,
    color: s.color || "#38bdf8",
    category: s.category || "Web Development",
    order: typeof s.order === "number" ? s.order : 0,
    createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : undefined,
    updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : undefined,
  }));

  const serializedTags: DashboardSkillTag[] = tags.map((t) => ({
    _id: t._id.toString(),
    name: t.name,
    order: typeof t.order === "number" ? t.order : 0,
  }));

  return <SkillsClient initialSkills={serializedSkills} initialTags={serializedTags} />;
}
