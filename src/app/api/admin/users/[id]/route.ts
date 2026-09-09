import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireSuperadmin, isValidObjectId } from "@/lib/authorization";
import User, { UserPlan } from "@/models/User";
import Profile from "@/models/Profile";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import Experience from "@/models/Experience";
import Message from "@/models/Message";
import { SUPPORTED_TEMPLATE_IDS, isSupportedTemplateId } from "@/templates/index";
import type { TemplateId } from "@/types/portfolio";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireSuperadmin(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { id } = await params;
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID format." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Query user without passwordHash
    const user = await User.findById(id)
      .select(
        "_id name email username profession role plan allowedTemplates createdAt updatedAt"
      )
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    // Query user's profile and resource counts
    const [profile, projectCount, skillCount, experienceCount, messageCount] =
      await Promise.all([
        Profile.findOne({ ownerId: user._id })
          .select("selectedTemplate bioBlurb roles avatarUrl location statusText updatedAt")
          .lean(),
        Project.countDocuments({ ownerId: user._id }),
        Skill.countDocuments({ ownerId: user._id }),
        Experience.countDocuments({ ownerId: user._id }),
        Message.countDocuments({ ownerId: user._id }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          username: user.username,
          profession: user.profession,
          role: user.role,
          plan: user.plan,
          allowedTemplates: user.allowedTemplates || [user.profession || "developer"],
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        profile: profile
          ? {
              selectedTemplate: profile.selectedTemplate || "developer",
              bioBlurb: profile.bioBlurb || "",
              roles: profile.roles || [],
              avatarUrl: profile.avatarUrl || "",
              location: profile.location || "",
              statusText: profile.statusText || "",
              updatedAt: profile.updatedAt,
            }
          : null,
        counts: {
          projects: projectCount,
          skills: skillCount,
          experiences: experienceCount,
          messages: messageCount,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user details." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return handleUpdate(request, params);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return handleUpdate(request, params);
}

async function handleUpdate(
  request: NextRequest,
  paramsPromise: Promise<{ id: string }>
) {
  try {
    const auth = await requireSuperadmin(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { id } = await paramsPromise;
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID format." },
        { status: 400 }
      );
    }

    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    // Check for attempted privilege escalation or immutable field tampering
    if ("role" in rawBody && rawBody.role !== undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Modifying user role through this endpoint is strictly forbidden.",
        },
        { status: 403 }
      );
    }
    if ("password" in rawBody || "passwordHash" in rawBody) {
      return NextResponse.json(
        {
          success: false,
          error: "Passwords cannot be modified through the entitlement management endpoint.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const userDoc = await User.findById(id);

    if (!userDoc) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    let modified = false;

    // 1. Validate and apply 'plan'
    if ("plan" in rawBody && rawBody.plan !== undefined) {
      const plan = rawBody.plan;
      if (plan !== "free" && plan !== "premium") {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid plan identifier. Supported plans: 'free', 'premium'.",
          },
          { status: 400 }
        );
      }
      userDoc.plan = plan as UserPlan;
      modified = true;
    }

    // 2. Validate and apply 'allowedTemplates'
    if ("allowedTemplates" in rawBody && rawBody.allowedTemplates !== undefined) {
      const allowedTemplates = rawBody.allowedTemplates;

      if (!Array.isArray(allowedTemplates) || allowedTemplates.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "allowedTemplates must be a non-empty array of supported template identifiers.",
          },
          { status: 400 }
        );
      }

      // Check that all entries are supported template IDs
      for (const tmpl of allowedTemplates) {
        if (!isSupportedTemplateId(tmpl)) {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid template identifier: '${tmpl}'. Supported templates: ${SUPPORTED_TEMPLATE_IDS.join(
                ", "
              )}.`,
            },
            { status: 400 }
          );
        }
      }

      // Deduplicate
      const uniqueTemplates = Array.from(new Set(allowedTemplates)) as TemplateId[];
      userDoc.allowedTemplates = uniqueTemplates;
      modified = true;
    }

    if (!modified) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid entitlement fields ('plan' or 'allowedTemplates') provided for update.",
        },
        { status: 400 }
      );
    }

    await userDoc.save();

    // 3. Keep Profile.selectedTemplate synchronized if current template is no longer authorized
    if (userDoc.allowedTemplates && userDoc.allowedTemplates.length > 0) {
      const profileDoc = await Profile.findOne({ ownerId: userDoc._id });
      if (
        profileDoc &&
        profileDoc.selectedTemplate &&
        !userDoc.allowedTemplates.includes(profileDoc.selectedTemplate as TemplateId)
      ) {
        profileDoc.selectedTemplate = userDoc.allowedTemplates[0];
        await profileDoc.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: "User entitlements updated successfully.",
      data: {
        user: {
          _id: userDoc._id.toString(),
          name: userDoc.name,
          email: userDoc.email,
          username: userDoc.username,
          profession: userDoc.profession,
          role: userDoc.role,
          plan: userDoc.plan,
          allowedTemplates: userDoc.allowedTemplates,
          updatedAt: userDoc.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("PUT/PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user entitlements." },
      { status: 500 }
    );
  }
}
