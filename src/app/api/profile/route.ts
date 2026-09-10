import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth, sanitizeRequestBody } from "@/lib/authorization";
import Profile from "@/models/Profile";
import User from "@/models/User";
import type { TemplateId } from "@/types/portfolio";
import { isSupportedTemplateId, SUPPORTED_TEMPLATE_IDS } from "@/templates/index";
import { hasFeatureAccess } from "@/lib/entitlements/resolver";

/**
 * Constructs a clean, zero-state Profile root for a user without copying
 * any demo data, fake stats, or another user's personal information.
 */
function createCleanProfileData(
  ownerId: Types.ObjectId,
  user?: {
    name?: string;
    email?: string;
    phone?: string;
    profession?: string;
    allowedTemplates?: string[];
  } | null
) {
  const name = user?.name || "";
  const email = user?.email || "";
  const phone = user?.phone || "";
  const defaultTemplate: TemplateId =
    (user?.allowedTemplates?.[0] as TemplateId) ||
    (user?.profession as TemplateId) ||
    "developer";

  return {
    ownerId,
    name,
    email,
    phone,
    roles: [] as string[],
    bioBlurb: "",
    statusText: "Available for opportunities",
    statusAvailable: true,
    avatarUrl: "",
    cvUrl: "",
    floatingBadges: [],
    aboutTitle: "",
    aboutP1: "",
    aboutP2: "",
    currentlyBuilding: "",
    stats: [],
    highlights: [],
    whatsappNumber: phone,
    whatsappMessage: name
      ? `Hi ${name}, I visited your portfolio and would like to connect!`
      : "Hi, I visited your portfolio and would like to connect!",
    messengerUrl: "",
    location: "",
    socials: [],
    sections: {
      hero: true,
      about: true,
      skills: true,
      projects: true,
      experience: true,
      contact: true,
      floatingChat: false,
    },
    selectedTemplate: defaultTemplate,
    publicationStatus: "published" as const,
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    await connectToDatabase();
    let profile = await Profile.findOne({ ownerId: auth.user.ownerId });
    if (!profile) {
      const user = await User.findById(auth.user.ownerId);
      const cleanData = createCleanProfileData(auth.user.ownerId, user);
      profile = await Profile.create(cleanData);
    }
    const profileData = profile.toObject ? profile.toObject() : { ...profile };
    // Legacy profiles without publicationStatus resolve to "published"
    if (!profileData.publicationStatus) {
      profileData.publicationStatus = "published";
    }
    delete (profileData as any).__v;

    return NextResponse.json({ success: true, data: profileData });
  } catch (error) {
    console.error("GET Profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    await connectToDatabase();
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }
    const body = sanitizeRequestBody(
      rawBody && typeof rawBody === "object" ? (rawBody as Record<string, unknown>) : {}
    );

    // Enforce publicationStatus validation
    if (body.publicationStatus !== undefined) {
      if (
        body.publicationStatus !== "published" &&
        body.publicationStatus !== "unpublished"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid publicationStatus. Supported values: 'published', 'unpublished'.",
          },
          { status: 400 }
        );
      }
    }

    let userDoc = null;

    // Enforce selectedTemplate authorization against user's allowedTemplates
    if (body.selectedTemplate !== undefined) {
      if (!isSupportedTemplateId(body.selectedTemplate)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid template identifier. Supported templates: ${SUPPORTED_TEMPLATE_IDS.join(", ")}`,
          },
          { status: 400 }
        );
      }

      userDoc = await User.findById(auth.user.ownerId);
      if (!userDoc) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      const isAllowed =
        userDoc.role === "superadmin" ||
        (Array.isArray(userDoc.allowedTemplates) &&
          userDoc.allowedTemplates.includes(body.selectedTemplate));

      if (!isAllowed) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden: You do not have access to this template",
          },
          { status: 403 }
        );
      }
    }

    // Enforce feature entitlements on profile sections
    if (body.sections && typeof body.sections === "object") {
      const sec = body.sections as Record<string, unknown>;

      // 1. floating_chat entitlement check
      if (sec.floatingChat === true) {
        if (!userDoc) {
          userDoc = await User.findById(auth.user.ownerId);
        }
        if (!hasFeatureAccess(userDoc, "floating_chat")) {
          return NextResponse.json(
            {
              success: false,
              error: "Feature 'floating_chat' is not available on your current plan.",
              code: "FEATURE_UNAVAILABLE",
              feature: "floating_chat",
            },
            { status: 403 }
          );
        }
      }

      // 2. custom_sections entitlement check (hiding any standard section requires custom_sections)
      const standardKeys = ["hero", "about", "skills", "projects", "experience", "contact"];
      const triesToHideSection = standardKeys.some((k) => sec[k] === false);

      if (triesToHideSection) {
        if (!userDoc) {
          userDoc = await User.findById(auth.user.ownerId);
        }
        if (!hasFeatureAccess(userDoc, "custom_sections")) {
          return NextResponse.json(
            {
              success: false,
              error: "Feature 'custom_sections' is not available on your current plan.",
              code: "FEATURE_UNAVAILABLE",
              feature: "custom_sections",
            },
            { status: 403 }
          );
        }
      }
    }

    let profile = await Profile.findOne({ ownerId: auth.user.ownerId });
    if (!profile) {
      if (!userDoc) {
        userDoc = await User.findById(auth.user.ownerId);
      }
      const cleanData = createCleanProfileData(auth.user.ownerId, userDoc);
      profile = new Profile({
        ...cleanData,
        ...body,
        ownerId: auth.user.ownerId,
        sections: {
          ...cleanData.sections,
          ...(body.sections || {}),
        },
      });
    } else {
      if (body.sections) {
        const defaultSections = {
          hero: true,
          about: true,
          skills: true,
          projects: true,
          experience: true,
          contact: true,
          floatingChat: false,
        };
        const existingSections = profile.sections
          ? JSON.parse(JSON.stringify(profile.sections))
          : defaultSections;
        profile.sections = {
          ...defaultSections,
          ...existingSections,
          ...body.sections,
        };
        profile.markModified("sections");
        delete body.sections;
      }
      Object.assign(profile, body);
      // Ensure ownerId cannot be tampered with
      profile.ownerId = auth.user.ownerId;
      if (body.socials) {
        profile.markModified("socials");
      }
    }

    await profile.save();
    const profileData = profile.toObject ? profile.toObject() : { ...profile };
    delete (profileData as Record<string, unknown>).__v;

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: profileData,
    });
  } catch (error) {
    console.error("PUT Profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;

