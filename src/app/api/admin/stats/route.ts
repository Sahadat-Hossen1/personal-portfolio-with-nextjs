import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireSuperadmin } from "@/lib/authorization";
import User from "@/models/User";
import Profile from "@/models/Profile";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import Experience from "@/models/Experience";
import Message from "@/models/Message";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperadmin(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    await connectToDatabase();

    // Execute efficient parallel aggregations and counts
    const [
      totalUsers,
      totalSuperadmins,
      totalNormalUsers,
      usersByPlanAgg,
      usersByProfessionAgg,
      templateAdoptionAgg,
      totalProfiles,
      publicPortfoliosCount,
      totalMessages,
      totalProjects,
      totalSkills,
      totalExperiences,
      recentUsersDocs,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "superadmin" }),
      User.countDocuments({ role: "user" }),
      User.aggregate([
        { $group: { _id: "$plan", count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $group: { _id: "$profession", count: { $sum: 1 } } },
      ]),
      Profile.aggregate([
        { $group: { _id: "$selectedTemplate", count: { $sum: 1 } } },
      ]),
      Profile.countDocuments({}),
      User.countDocuments({ username: { $exists: true, $ne: "" } }),
      Message.countDocuments({}),
      Project.countDocuments({}),
      Skill.countDocuments({}),
      Experience.countDocuments({}),
      User.find({})
        .select("_id name username email profession plan createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Format Plan breakdown with defaults
    const planCounts: Record<string, number> = { free: 0, premium: 0 };
    for (const item of usersByPlanAgg) {
      if (item._id) {
        planCounts[item._id] = item.count;
      }
    }

    // Format Profession breakdown with defaults
    const professionCounts: Record<string, number> = {
      developer: 0,
      "digital-marketer": 0,
      "video-editor": 0,
      doctor: 0,
    };
    for (const item of usersByProfessionAgg) {
      if (item._id) {
        professionCounts[item._id] = item.count;
      }
    }

    // Format Template Adoption breakdown
    const templateCounts: Record<string, number> = {
      developer: 0,
      "video-editor": 0,
      "digital-marketer": 0,
      doctor: 0,
    };
    for (const item of templateAdoptionAgg) {
      if (item._id) {
        templateCounts[item._id] = item.count;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          superadmins: totalSuperadmins,
          normalUsers: totalNormalUsers,
          byPlan: planCounts,
          byProfession: professionCounts,
        },
        templates: {
          adoption: templateCounts,
        },
        content: {
          profiles: totalProfiles,
          publicPortfolios: publicPortfoliosCount,
          projects: totalProjects,
          skills: totalSkills,
          experiences: totalExperiences,
          messages: totalMessages,
        },
        recentUsers: recentUsersDocs.map((u) => ({
          _id: u._id.toString(),
          name: u.name,
          username: u.username,
          email: u.email,
          profession: u.profession,
          plan: u.plan,
          createdAt: u.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate platform statistics." },
      { status: 500 }
    );
  }
}
