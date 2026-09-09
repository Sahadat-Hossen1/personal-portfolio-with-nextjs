import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import {
  hashPassword,
  signUserToken,
  USER_COOKIE_NAME,
} from "@/lib/auth";
import User, {
  IUser,
  generateUniqueUsername,
  UserProfession,
} from "@/models/User";
import Profile, { IProfile } from "@/models/Profile";
import type { TemplateId } from "@/types/portfolio";

const ALLOWED_REGISTRATION_PROFESSIONS: readonly UserProfession[] = [
  "developer",
  "digital-marketer",
  "video-editor",
] as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    const { name, email, phone, profession, password } = body;

    // 1. Validate name
    if (
      !name ||
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 70
    ) {
      return NextResponse.json(
        { success: false, error: "Name must be between 2 and 70 characters." },
        { status: 400 }
      );
    }

    // 2. Validate email
    if (
      !email ||
      typeof email !== "string" ||
      !EMAIL_REGEX.test(email.trim())
    ) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 3. Check for existing email (Conflict)
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // 4. Validate phone
    if (
      !phone ||
      typeof phone !== "string" ||
      phone.trim().length < 7 ||
      phone.trim().length > 25
    ) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid contact phone number." },
        { status: 400 }
      );
    }

    // 5. Validate profession
    if (
      !profession ||
      !ALLOWED_REGISTRATION_PROFESSIONS.includes(profession as UserProfession)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid profession. Allowed professions: ${ALLOWED_REGISTRATION_PROFESSIONS.join(
            ", "
          )}.`,
        },
        { status: 400 }
      );
    }

    // 6. Validate password
    if (
      !password ||
      typeof password !== "string" ||
      password.length < 6 ||
      password.length > 128
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be between 6 and 128 characters.",
        },
        { status: 400 }
      );
    }

    // 7. Generate secure password hash & collision-safe unique username
    const passwordHash = await hashPassword(password);
    const username = await generateUniqueUsername(name);

    // 8. Determine initial template assignment based on profession
    const defaultTemplate: TemplateId = profession as TemplateId;
    const allowedTemplates: TemplateId[] = [defaultTemplate];

    // 9. Atomic User + Profile creation with rollback guard
    let createdUser: IUser | null = null;
    let createdProfile: IProfile | null = null;

    try {
      // Create User (strictly enforcing server-controlled role & plan)
      createdUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        profession: profession as UserProfession,
        passwordHash,
        role: "user", // Client CANNOT set superadmin
        plan: "free", // Client CANNOT upgrade itself
        username,
        allowedTemplates,
      });

      // Create clean Profile root for this user (NO fake claims, NO fake metrics, NO copied bio)
      createdProfile = await Profile.create({
        ownerId: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone,
        roles: [],
        bioBlurb: "",
        statusText: "Available for opportunities",
        statusAvailable: true,
        avatarUrl: "",
        cvUrl: "",
        floatingBadges: [],
        aboutTitle: "",
        aboutP1: "",
        aboutP2: "",
        currentlyBuilding: "",
        stats: [],
        highlights: [],
        whatsappNumber: createdUser.phone,
        whatsappMessage: `Hi ${createdUser.name}, I visited your portfolio and would like to connect!`,
        messengerUrl: "",
        location: "",
        socials: [],
        sections: {
          hero: true,
          about: true,
          skills: true,
          projects: true,
          experience: true,
          contact: true,
          floatingChat: false,
        },
        selectedTemplate: defaultTemplate,
      });
    } catch (creationError) {
      // Rollback newly created entities on failure to prevent orphans
      if (createdProfile?._id) {
        await Profile.findByIdAndDelete(createdProfile._id).catch(() => {});
      }
      if (createdUser?._id) {
        await User.findByIdAndDelete(createdUser._id).catch(() => {});
      }
      console.error("Registration creation error during rollback:", creationError);
      throw creationError;
    }

    // 10. Issue User JWT & session cookie
    const token = await signUserToken({
      id: createdUser._id.toString(),
      email: createdUser.email,
      role: createdUser.role,
      username: createdUser.username,
      profession: createdUser.profession,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: {
          id: createdUser._id.toString(),
          name: createdUser.name,
          email: createdUser.email,
          username: createdUser.username,
          role: createdUser.role,
          profession: createdUser.profession,
          plan: createdUser.plan,
        },
      },
      { status: 201 }
    );

    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("User registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
