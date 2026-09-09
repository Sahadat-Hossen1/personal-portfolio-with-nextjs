import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth, sanitizeRequestBody } from "@/lib/authorization";
import Profile from "@/models/Profile";
import User from "@/models/User";
import type { TemplateId } from "@/types/portfolio";
import { isSupportedTemplateId, SUPPORTED_TEMPLATE_IDS } from "@/templates/index";

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
    return NextResponse.json({ success: true, data: profile });
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
    const rawBody = await request.json();
    const body = sanitizeRequestBody(rawBody);

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
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    console.error("PUT Profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

