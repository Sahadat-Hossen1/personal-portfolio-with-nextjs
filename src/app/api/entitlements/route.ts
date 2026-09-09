import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth } from "@/lib/authorization";
import User from "@/models/User";
import {
  resolveEffectiveEntitlements,
  extractNormalizedOverrides,
} from "@/lib/entitlements/resolver";
import { getAllFeatureDefinitions } from "@/lib/entitlements/features";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    await connectToDatabase();
    const userDoc = await User.findById(auth.user.ownerId)
      .select("plan role featureOverrides")
      .lean();

    if (!userDoc) {
      return NextResponse.json(
        { success: false, error: "User record not found." },
        { status: 404 }
      );
    }

    const effectiveEntitlements = resolveEffectiveEntitlements(userDoc);
    const overrides = extractNormalizedOverrides(userDoc.featureOverrides);

    return NextResponse.json({
      success: true,
      data: {
        plan: userDoc.plan || "free",
        role: userDoc.role,
        effectiveEntitlements,
        overrides,
        features: getAllFeatureDefinitions(),
      },
    });
  } catch (error) {
    console.error("GET /api/entitlements error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resolve entitlements." },
      { status: 500 }
    );
  }
}
