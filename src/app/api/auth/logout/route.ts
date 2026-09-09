import { NextResponse } from "next/server";
import { USER_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Clear ONLY the User authentication cookie.
  // Legacy portfolio_admin_token is preserved to keep legacy Superadmin access active during transition.
  response.cookies.set({
    name: USER_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
