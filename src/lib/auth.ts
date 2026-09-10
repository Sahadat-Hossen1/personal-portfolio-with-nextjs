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
