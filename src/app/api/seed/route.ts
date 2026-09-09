import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword, verifyAdminRequest } from "@/lib/auth";
import Admin from "@/models/Admin";
import Profile from "@/models/Profile";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import SkillTag from "@/models/SkillTag";
import Experience from "@/models/Experience";
import {
  initialProfile,
  initialSkills,
  initialSkillTags,
  initialProjects,
  initialExperiences,
} from "@/lib/initialData";

export async function POST(request: NextRequest) {
  try {
    // 1. Production Guard: Strictly disable destructive seeding in production
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          error: "Database seeding is strictly disabled in production environments.",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // 2. Authorization Guard:
    // If an Admin already exists in the database, require valid admin authorization.
    // Unauthenticated seeding is only permitted during initial zero-state bootstrap.
    const totalAdmins = await Admin.countDocuments();
    if (totalAdmins > 0) {
      const adminSession = await verifyAdminRequest(request);
      if (!adminSession) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized: Admin session required to seed existing database.",
          },
          { status: 401 }
        );
      }
    }

    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "true";

    // 1. Seed Admin
    const defaultUser = process.env.ADMIN_DEFAULT_USER || "admin";
    const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || "admin123";
    const existingAdmin = await Admin.findOne({ username: defaultUser });

    if (!existingAdmin || force) {
      const passwordHash = await hashPassword(defaultPass);
      if (existingAdmin && force) {
        existingAdmin.passwordHash = passwordHash;
        await existingAdmin.save();
      } else if (!existingAdmin) {
        await Admin.create({
          username: defaultUser,
          passwordHash,
          role: "admin",
        });
      }
    }

    // 2. Seed Profile
    const existingProfile = await Profile.findOne();
    if (!existingProfile || force) {
      if (existingProfile && force) {
        await Profile.deleteMany({});
      }
      await Profile.create(initialProfile);
    }

    // 3. Seed Projects
    const projectCount = await Project.countDocuments();
    if (projectCount === 0 || force) {
      if (force) await Project.deleteMany({});
      await Project.insertMany(initialProjects);
    }

    // 4. Seed Skills
    const skillCount = await Skill.countDocuments();
    if (skillCount === 0 || force) {
      if (force) await Skill.deleteMany({});
      await Skill.insertMany(initialSkills);
    }

    // 5. Seed Skill Tags
    const tagCount = await SkillTag.countDocuments();
    if (tagCount === 0 || force) {
      if (force) await SkillTag.deleteMany({});
      await SkillTag.insertMany(
        initialSkillTags.map((name, index) => ({ name, order: index + 1 }))
      );
    }

    // 6. Seed Experiences
    const expCount = await Experience.countDocuments();
    if (expCount === 0 || force) {
      if (force) await Experience.deleteMany({});
      await Experience.insertMany(initialExperiences);
    }

    return NextResponse.json({
      success: true,
      message: "Database successfully initialized with portfolio data!",
      seeded: {
        admin: defaultUser,
        profile: true,
        projects: initialProjects.length,
        skills: initialSkills.length,
        tags: initialSkillTags.length,
        experiences: initialExperiences.length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to seed database",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Send an authorized POST request to this endpoint to seed database in development.",
  });
}
