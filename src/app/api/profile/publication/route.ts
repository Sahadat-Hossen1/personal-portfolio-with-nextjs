import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth } from "@/lib/authorization";
import Profile from "@/models/Profile";
import User from "@/models/User";
import type { PortfolioPublicationStatus } from "@/models/Profile";

const VALID_PUBLICATION_STATUSES: ReadonlySet<PortfolioPublicationStatus> = new Set([
  "published",
  "unpublished",
]);

/**
 * GET /api/profile/publication
 * Returns the authenticated owner's current publication status.
 * Resolves missing (legacy) publicationStatus to "published".
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    await connectToDatabase();
    const profile = await Profile.findOne({ ownerId: auth.user.ownerId })
      .select("publicationStatus")
      .lean();

    // Legacy profiles without publicationStatus resolve to "published"
    const publicationStatus: PortfolioPublicationStatus =
      profile?.publicationStatus === "unpublished" ? "unpublished" : "published";

    return NextResponse.json({
      success: true,
      data: { publicationStatus },
    });
  } catch (error) {
    console.error("GET /api/profile/publication error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch publication status" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile/publication
 * Updates the authenticated owner's portfolio publication status.
 *
 * Security:
 * - requireAuth enforces authenticated session + active account
 * - ownerId is resolved server-side from the JWT; client cannot supply it
 * - Only "published" or "unpublished" are accepted; all other values return 400
 * - accountStatus, plan, featureOverrides, allowedTemplates are never touched
 * - Portfolio content (projects, skills, experience, messages) is never modified
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const { publicationStatus } = rawBody as Record<string, unknown>;

    // Strictly validate — reject anything that is not a known enum value
    if (
      publicationStatus === undefined ||
      publicationStatus === null ||
      !VALID_PUBLICATION_STATUSES.has(publicationStatus as PortfolioPublicationStatus)
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

    await connectToDatabase();

    // Find-or-create profile for the authenticated owner
    let profile = await Profile.findOne({ ownerId: auth.user.ownerId });
    if (!profile) {
      // Profile should exist after registration, but create a minimal one if missing
      const user = await User.findById(auth.user.ownerId);
      profile = await Profile.create({
        ownerId: auth.user.ownerId,
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        publicationStatus: publicationStatus as PortfolioPublicationStatus,
      });
    } else {
      // Only update publicationStatus — portfolio content is never touched
      profile.publicationStatus = publicationStatus as PortfolioPublicationStatus;
      // Ensure ownerId cannot be tampered with
      profile.ownerId = auth.user.ownerId;
      await profile.save();
    }

    return NextResponse.json({
      success: true,
      message:
        publicationStatus === "published"
          ? "Portfolio published successfully."
          : "Portfolio unpublished successfully.",
      data: {
        publicationStatus: profile.publicationStatus,
      },
    });
  } catch (error) {
    console.error("PATCH /api/profile/publication error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update publication status" },
      { status: 500 }
    );
  }
}

export const PUT = PATCH;
