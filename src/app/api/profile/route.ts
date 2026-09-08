import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAdminRequest } from "@/lib/auth";
import Profile from "@/models/Profile";
import { initialProfile } from "@/lib/initialData";
import { isSupportedTemplateId, SUPPORTED_TEMPLATE_IDS } from "@/templates/index";

export async function GET() {
  try {
    await connectToDatabase();
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create(initialProfile);
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
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await request.json();

    if (
      body.selectedTemplate !== undefined &&
      !isSupportedTemplateId(body.selectedTemplate)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid template identifier. Supported templates: ${SUPPORTED_TEMPLATE_IDS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile({
        ...initialProfile,
        ...body,
        sections: {
          ...initialProfile.sections,
          ...(body.sections || {}),
        },
      });
    } else {
      if (body.sections) {
        const existingSections = profile.sections
          ? JSON.parse(JSON.stringify(profile.sections))
          : initialProfile.sections;
        profile.sections = {
          ...initialProfile.sections,
          ...existingSections,
          ...body.sections,
        };
        profile.markModified("sections");
        delete body.sections;
      }
      Object.assign(profile, body);
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
