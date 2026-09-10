import { NextResponse } from "next/server";
import mongoose from "mongoose";
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
  "doctor",
] as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function supportsMongoTransactions(): boolean {
  try {
    const topologyType = (mongoose.connection as any)?.client?.topology?.description?.type;
    return (
      topologyType === "ReplicaSetWithPrimary" ||
      topologyType === "ReplicaSetNoPrimary" ||
      topologyType === "Sharded"
    );
  } catch {
    return false;
  }
}

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

    // 7. Generate secure password hash
    const passwordHash = await hashPassword(password);

    // 8. Determine initial template assignment based on profession
    const defaultTemplate: TemplateId = profession as TemplateId;
    const allowedTemplates: TemplateId[] = [defaultTemplate];

    // 9. Atomic User + Profile creation with MongoDB transaction session (where supported) and race-safe username retry
    let createdUser: IUser | null = null;
    let createdProfile: IProfile | null = null;
    let lastProvisioningError: any = null;

    const MAX_PROVISIONING_ATTEMPTS = 3;
    let attempt = 0;

    while (attempt < MAX_PROVISIONING_ATTEMPTS && !createdUser) {
      attempt++;
      const username = await generateUniqueUsername(name);

      const canUseTxn = supportsMongoTransactions();
      let session: mongoose.ClientSession | null = null;
      if (canUseTxn) {
        try {
          session = await mongoose.startSession();
          session.startTransaction();
        } catch {
          session = null;
        }
      }

      let attemptUser: IUser | null = null;
      let attemptProfile: IProfile | null = null;

      try {
        // Create User (strictly enforcing server-controlled role & plan)
        const userDoc = new User({
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

        await userDoc.save(session ? { session } : undefined);
        attemptUser = userDoc;

        // Create clean Profile root for this user (NO fake claims, NO fake metrics, NO copied bio)
        const profileDoc = new Profile({
          ownerId: attemptUser._id,
          name: attemptUser.name,
          email: attemptUser.email,
          phone: attemptUser.phone,
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
          whatsappNumber: attemptUser.phone,
          whatsappMessage: `Hi ${attemptUser.name}, I visited your portfolio and would like to connect!`,
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
          publicationStatus: "published",
        });

        await profileDoc.save(session ? { session } : undefined);
        attemptProfile = profileDoc;

        // Commit transaction if session is active
        if (session) {
          await session.commitTransaction();
        }

        createdUser = attemptUser;
        createdProfile = attemptProfile;
      } catch (creationError: any) {
        // Abort transaction on failure to ensure atomicity
        if (session) {
          await session.abortTransaction().catch(() => {});
        }

        // Compensating rollback cleanup guard to prevent orphans
        if (attemptProfile?._id) {
          await Profile.findByIdAndDelete(attemptProfile._id).catch(() => {});
        }
        if (attemptUser?._id) {
          await User.findByIdAndDelete(attemptUser._id).catch(() => {});
        }

        lastProvisioningError = creationError;

        // Check if error is duplicate key error code 11000
        const isDuplicateKey = creationError?.code === 11000;
        const isEmailDuplicate =
          isDuplicateKey &&
          (creationError?.keyPattern?.email ||
            creationError?.message?.includes("email"));
        const isUsernameDuplicate =
          isDuplicateKey &&
          (creationError?.keyPattern?.username ||
            creationError?.message?.includes("username"));

        // If email duplicate race, immediate 409 Conflict
        if (isEmailDuplicate) {
          return NextResponse.json(
            { success: false, error: "An account with this email already exists." },
            { status: 409 }
          );
        }

        // If username race collision, retry with next generated unique slug
        if (isUsernameDuplicate && attempt < MAX_PROVISIONING_ATTEMPTS) {
          console.warn(`Username race collision on '${username}', retrying attempt ${attempt + 1}...`);
          continue;
        }

        break;
      } finally {
        if (session) {
          await session.endSession().catch(() => {});
        }
      }
    }

    if (!createdUser || !createdProfile) {
      if (
        lastProvisioningError?.code === 11000 &&
        (lastProvisioningError?.keyPattern?.username ||
          lastProvisioningError?.message?.includes("username"))
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Username collision occurred during registration. Please try again.",
          },
          { status: 409 }
        );
      }
      console.error("User registration provisioning error:", lastProvisioningError);
      return NextResponse.json(
        { success: false, error: "Internal server error. Please try again later." },
        { status: 500 }
      );
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
