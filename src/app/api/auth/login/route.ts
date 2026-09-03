import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { comparePassword, hashPassword, signAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import Admin from "@/models/Admin";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Auto-create default admin if none exists
    const totalAdmins = await Admin.countDocuments();
    if (totalAdmins === 0) {
      const defaultUser = process.env.ADMIN_DEFAULT_USER || "admin";
      const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || "admin123";
      const hash = await hashPassword(defaultPass);
      await Admin.create({
        username: defaultUser,
        passwordHash: hash,
        role: "admin",
      });
    }

    const admin = await Admin.findOne({ username: username.trim() });
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const token = await signAdminToken({
      id: admin._id.toString(),
      username: admin.username,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: admin._id.toString(),
        username: admin.username,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
