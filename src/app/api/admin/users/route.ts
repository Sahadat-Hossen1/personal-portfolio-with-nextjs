import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireSuperadmin } from "@/lib/authorization";
import User, { UserRole, UserPlan, UserProfession } from "@/models/User";
import Profile from "@/models/Profile";
import {
  resolveEffectiveEntitlements,
  extractNormalizedOverrides,
} from "@/lib/entitlements/resolver";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperadmin(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    // 1. Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10)
    );
    const skip = (page - 1) * limit;

    // 2. Search parameter
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const filterQuery: Record<string, unknown> = {};

    if (search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(sanitizedSearch, "i");
      filterQuery.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { username: searchRegex },
      ];
    }

    // 3. Structured Filters
    const roleFilter = searchParams.get("role");
    if (roleFilter && (roleFilter === "superadmin" || roleFilter === "user")) {
      filterQuery.role = roleFilter as UserRole;
    }

    const planFilter = searchParams.get("plan");
    if (planFilter && (planFilter === "free" || planFilter === "premium")) {
      filterQuery.plan = planFilter as UserPlan;
    }

    const professionFilter = searchParams.get("profession");
    if (
      professionFilter &&
      ["developer", "digital-marketer", "video-editor", "doctor"].includes(
        professionFilter
      )
    ) {
      filterQuery.profession = professionFilter as UserProfession;
    }

    const statusFilter = searchParams.get("status") || searchParams.get("accountStatus");
    if (statusFilter === "suspended") {
      filterQuery.accountStatus = "suspended";
    } else if (statusFilter === "active") {
      filterQuery.accountStatus = { $ne: "suspended" };
    }


    // 4. Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const allowedSortFields = ["createdAt", "name", "username", "email", "plan"];
    const validSortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    // 5. Query execution with safe projection (NEVER expose passwordHash)
    const [totalUsers, userDocs] = await Promise.all([
      User.countDocuments(filterQuery),
      User.find(filterQuery)
        .select(
          "_id name email username profession role plan allowedTemplates featureOverrides accountStatus createdAt updatedAt"
        )
        .sort({ [validSortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // 6. Enrich with selectedTemplate and publicationStatus from Profile
    const userIds = userDocs.map((u) => u._id);
    const profileDocs = await Profile.find({ ownerId: { $in: userIds } })
      .select("ownerId selectedTemplate publicationStatus")
      .lean();

    const profileTemplateMap = new Map<string, string>();
    const profilePublicationMap = new Map<string, string>();
    for (const p of profileDocs) {
      if (p.ownerId) {
        profileTemplateMap.set(p.ownerId.toString(), p.selectedTemplate || "developer");
        profilePublicationMap.set(
          p.ownerId.toString(),
          p.publicationStatus === "unpublished" ? "unpublished" : "published"
        );
      }
    }

    const users = userDocs.map((u) => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      username: u.username,
      profession: u.profession,
      role: u.role,
      plan: u.plan,
      accountStatus: u.accountStatus || "active",
      publicationStatus:
        profilePublicationMap.get(u._id.toString()) || "published",
      allowedTemplates: u.allowedTemplates || [u.profession || "developer"],
      selectedTemplate:
        profileTemplateMap.get(u._id.toString()) ||
        u.allowedTemplates?.[0] ||
        u.profession ||
        "developer",
      featureOverrides: extractNormalizedOverrides(u.featureOverrides),
      effectiveEntitlements: resolveEffectiveEntitlements(u),
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    const totalPages = Math.ceil(totalUsers / limit) || 1;

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          totalUsers,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch platform users." },
      { status: 500 }
    );
  }
}
