import { NextRequest, NextResponse } from "next/server";
import { verifyUserRequest, verifyAdminRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // 1. Check for modern User session first
  const userSession = await verifyUserRequest(request);
  if (userSession) {
    return NextResponse.json({
      authenticated: true,
      user: userSession,
    });
  }

  // 2. Fallback check for legacy Admin session
  const adminSession = await verifyAdminRequest(request);
  if (adminSession) {
    return NextResponse.json({
      authenticated: true,
      user: adminSession,
    });
  }

  return NextResponse.json(
    { authenticated: false, user: null },
    { status: 401 }
  );
}
