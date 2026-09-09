import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import {
  comparePassword,
  signUserToken,
  signAdminToken,
  USER_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { email, username, password } = body;
    const identifier = (email || username || "").trim().toLowerCase();

    if (!identifier || !password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Authenticate strictly against User collection (never queries legacy Admin collection)
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      // Generic error prevents email enumeration
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      // Generic error prevents password probe leaks
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Generate standard User session token
    const userToken = await signUserToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      username: user.username,
      profession: user.profession,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        profession: user.profession,
        plan: user.plan,
      },
    });

    // Set secure HTTP-only User cookie
    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: userToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Compatibility bridge: if user is Superadmin, also set legacy admin cookie
    // to maintain seamless access to existing admin routes during transition
    if (user.role === "superadmin") {
      const adminToken = await signAdminToken({
        id: user._id.toString(),
        username: user.username,
      });
      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: adminToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error("User login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
