import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import {
  verifyUserRequest,
  verifyAdminRequest,
  getUserSession,
  getAdminSession,
} from "@/lib/auth";
import User, { UserRole } from "@/models/User";
import type { FeatureKey } from "@/lib/entitlements/features";
import { hasFeatureAccess } from "@/lib/entitlements/resolver";

// ==========================================
// 1. Authenticated User Interface
// ==========================================
export interface AuthenticatedUser {
  userId: string;
  ownerId: Types.ObjectId;
  role: UserRole;
  email: string;
  username: string;
  isLegacyAdmin?: boolean;
}

// Fields that clients must NEVER be allowed to set or overwrite
const FORBIDDEN_FIELDS = [
  "ownerId",
  "_id",
  "id",
  "role",
  "plan",
  "allowedTemplates",
  "featureOverrides",
  "createdAt",
  "updatedAt",
  "__v",
];

// ==========================================
// 2. Utility Helpers
// ==========================================

/**
 * Validates whether a string is a valid 24-character hex MongoDB ObjectId.
 */
export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id;
}

/**
 * Sanitizes client request bodies by stripping forbidden fields such as
 * ownerId, role, plan, and internal database identifiers.
 * Optional flag allowRole allows the 'role' field when used in models where
 * 'role' represents a job position (e.g. Experience) rather than a system privilege.
 */
export function sanitizeRequestBody<T extends Record<string, unknown>>(
  body: T,
  options?: { allowRole?: boolean }
): Partial<T> {
  if (!body || typeof body !== "object") return {};
  const sanitized = { ...body };
  for (const field of FORBIDDEN_FIELDS) {
    if (field === "role" && options?.allowRole) {
      continue;
    }
    delete (sanitized as Record<string, unknown>)[field];
  }
  return sanitized;
}

// ==========================================
// 3. User & Admin Authentication Resolvers
// ==========================================

/**
 * Resolves the authenticated user from either the modern user JWT (portfolio_user_token)
 * or the legacy admin JWT (portfolio_admin_token) compatibility bridge.
 */
export async function getAuthenticatedUser(
  request?: NextRequest
): Promise<AuthenticatedUser | null> {
  // 1. Check modern User session first
  const userPayload = request
    ? await verifyUserRequest(request)
    : await getUserSession();

  if (userPayload && Types.ObjectId.isValid(userPayload.id)) {
    return {
      userId: userPayload.id,
      ownerId: new Types.ObjectId(userPayload.id),
      role: userPayload.role,
      email: userPayload.email,
      username: userPayload.username,
      isLegacyAdmin: false,
    };
  }

  // 2. Fallback to legacy Admin session (Compatibility Bridge)
  const adminPayload = request
    ? await verifyAdminRequest(request)
    : await getAdminSession();

  if (adminPayload) {
    await connectToDatabase();
    let superadminUser = null;

    if (Types.ObjectId.isValid(adminPayload.id)) {
      superadminUser = await User.findById(adminPayload.id);
    }
    if (!superadminUser && adminPayload.username) {
      superadminUser = await User.findOne({ username: adminPayload.username });
    }
    if (!superadminUser) {
      superadminUser = await User.findOne({ role: "superadmin" });
    }

    if (superadminUser) {
      return {
        userId: superadminUser._id.toString(),
        ownerId: superadminUser._id as Types.ObjectId,
        role: superadminUser.role,
        email: superadminUser.email,
        username: superadminUser.username,
        isLegacyAdmin: true,
      };
    }
  }

  return null;
}

// ==========================================
// 4. Authorization Enforcement Guards
// ==========================================

export type AuthResult =
  | { user: AuthenticatedUser; errorResponse?: never }
  | { user?: never; errorResponse: NextResponse };

/**
 * Requires an authenticated user session.
 * Returns { user } if valid, or { errorResponse: 401 } if unauthenticated.
 */
export async function requireAuth(request?: NextRequest): Promise<AuthResult> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
  return { user };
}

/**
 * Requires an authenticated user with the 'superadmin' role.
 * Returns 401 if unauthenticated, 403 if authenticated but not superadmin.
 */
export async function requireSuperadmin(request?: NextRequest): Promise<AuthResult> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "superadmin") {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Forbidden: Superadmin access required" },
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Requires an authenticated user with active entitlement access to the specified feature.
 * Returns 401 if unauthenticated, 403 if authenticated but feature access is not enabled.
 */
export async function requireFeature(
  feature: FeatureKey,
  request?: NextRequest
): Promise<AuthResult> {
  const auth = await requireAuth(request);
  if (auth.errorResponse) {
    return auth;
  }

  // Superadmin has access to all features by default
  if (auth.user.role === "superadmin") {
    return { user: auth.user };
  }

  await connectToDatabase();
  const userDoc = await User.findById(auth.user.ownerId)
    .select("plan role featureOverrides")
    .lean();

  if (!userDoc || !hasFeatureAccess(userDoc, feature)) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: `Feature '${feature}' is not available on your current plan.`,
          code: "FEATURE_UNAVAILABLE",
          feature,
        },
        { status: 403 }
      ),
    };
  }

  return { user: auth.user };
}

