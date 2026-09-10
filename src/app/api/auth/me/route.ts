import { NextRequest, NextResponse } from "next/server";
import { verifyUserRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Check modern User session
  const userSession = await verifyUserRequest(request);
  if (userSession) {
    return NextResponse.json({
      authenticated: true,
      user: userSession,
    });
  }

  return NextResponse.json(
    { authenticated: false, user: null },
    { status: 401 }
  );
}

