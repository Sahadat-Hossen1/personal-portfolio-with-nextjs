import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import type { UserRole, UserProfession } from "@/models/User";

// ==========================================
// 1. Cookie Names & Configuration
// ==========================================
export const ADMIN_COOKIE_NAME = "portfolio_admin_token";
export const USER_COOKIE_NAME = "portfolio_user_token";

// ==========================================
// 2. Secret Management (No Hardcoded Fallback for User Auth)
// ==========================================
const LEGACY_JWT_SECRET =
  process.env.JWT_SECRET || "super_secret_portfolio_jwt_key_2026_sahadat_hossen_secure";
const LEGACY_SECRET_KEY = new TextEncoder().encode(LEGACY_JWT_SECRET);

function getUserSecretKey(): Uint8Array {
  const secret = process.env.USER_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "Missing JWT secret: Please set USER_JWT_SECRET or JWT_SECRET in environment variables."
    );
  }
  return new TextEncoder().encode(secret);
}

// ==========================================
// 3. Payload Definitions
// ==========================================
export interface AdminPayload {
  id: string;
  username: string;
}

export interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
  username: string;
  profession?: UserProfession;
}

// ==========================================
// 4. Password Hashing (bcryptjs)
// ==========================================
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ==========================================
// 5. Legacy Admin Authentication Helpers (Preserved)
// ==========================================
export async function signAdminToken(payload: AdminPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(LEGACY_SECRET_KEY);
}

export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, LEGACY_SECRET_KEY);
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyAdminToken(token);
  } catch {
    return null;
  }
}

export async function verifyAdminRequest(req: NextRequest): Promise<AdminPayload | null> {
  // 1. Check legacy admin token (cookie or Authorization header)
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const adminToken = cookieToken || bearerToken;

  if (adminToken) {
    const adminSession = await verifyAdminToken(adminToken);
    if (adminSession) return adminSession;
  }

  // 2. Backward compatibility bridge: Superadmin User session can access admin routes
  const userToken = req.cookies.get(USER_COOKIE_NAME)?.value;
  if (userToken) {
    const userSession = await verifyUserToken(userToken);
    if (userSession && userSession.role === "superadmin") {
      return {
        id: userSession.id,
        username: userSession.username,
      };
    }
  }

  return null;
}

// ==========================================
// 6. New User Authentication Helpers
// ==========================================
export async function signUserToken(payload: UserPayload): Promise<string> {
  const secretKey = getUserSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyUserToken(token: string): Promise<UserPayload | null> {
  try {
    const secretKey = getUserSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

export async function getUserSession(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyUserToken(token);
  } catch {
    return null;
  }
}

export async function verifyUserRequest(req: NextRequest): Promise<UserPayload | null> {
  const cookieToken = req.cookies.get(USER_COOKIE_NAME)?.value;
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const token = cookieToken || bearerToken;

  if (!token) return null;
  return await verifyUserToken(token);
}
