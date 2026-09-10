import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth } from "@/lib/authorization";
import Message from "@/models/Message";
import User from "@/models/User";
import Profile from "@/models/Profile";

// Public endpoint: Contact form submission
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const rawBody = await request.json().catch(() => null);

    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const { name, email, subject, message, username } = rawBody;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    let recipientOwnerId: Types.ObjectId | null = null;

    // Phase 11 & 17: Public tenant portfolio contact resolution (/p/[username])
    if (username !== undefined) {
      if (typeof username !== "string" || !username.trim()) {
        return NextResponse.json(
          { success: false, error: "A valid username is required" },
          { status: 400 }
        );
      }

      const normalizedUsername = username.trim().toLowerCase();
      const targetUser = await User.findOne({ username: normalizedUsername })
        .select("_id accountStatus")
        .lean();

      if (!targetUser || targetUser.accountStatus === "suspended") {
        return NextResponse.json(
          { success: false, error: "Recipient portfolio not found" },
          { status: 404 }
        );
      }

      // Phase 17: Verify recipient portfolio is published
      const targetProfile = await Profile.findOne({ ownerId: targetUser._id })
        .select("publicationStatus")
        .lean();

      const publicationStatus =
        targetProfile?.publicationStatus === "unpublished"
          ? "unpublished"
          : "published";

      if (publicationStatus === "unpublished") {
        return NextResponse.json(
          { success: false, error: "Recipient portfolio not found" },
          { status: 404 }
        );
      }

      recipientOwnerId = targetUser._id as Types.ObjectId;
    } else {
      // Legacy root "/" compatibility fallback: resolve to system default owner (superadmin)
      const defaultOwner =
        (await User.findOne({ role: "superadmin" })) ||
        (await User.findOne().sort({ createdAt: 1 }));

      if (defaultOwner) {
        if (defaultOwner.accountStatus === "suspended") {
          return NextResponse.json(
            { success: false, error: "Recipient portfolio not found" },
            { status: 404 }
          );
        }

        const defaultProfile = await Profile.findOne({ ownerId: defaultOwner._id })
          .select("publicationStatus")
          .lean();

        const defaultPubStatus =
          defaultProfile?.publicationStatus === "unpublished"
            ? "unpublished"
            : "published";

        if (defaultPubStatus === "unpublished") {
          return NextResponse.json(
            { success: false, error: "Recipient portfolio not found" },
            { status: 404 }
          );
        }

        recipientOwnerId = defaultOwner._id as Types.ObjectId;
      }
    }

    if (!recipientOwnerId) {
      return NextResponse.json(
        { success: false, error: "Unable to determine message recipient" },
        { status: 500 }
      );
    }

    // SECURITY: Client-supplied ownerId and userId are NEVER trusted, accepted, or stored.
    const newMessage = await Message.create({
      ownerId: recipientOwnerId,
      name: String(name).trim(),
      email: String(email).trim(),
      subject: (subject ? String(subject) : "").trim(),
      message: String(message).trim(),
      read: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message received successfully! I will get back to you soon.",
        data: { id: newMessage._id },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Message error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit message" },
      { status: 500 }
    );
  }
}


// Private endpoint: List messages for authenticated user's inbox
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    await connectToDatabase();
    const messages = await Message.find({
      ownerId: auth.user.ownerId,
    }).sort({ createdAt: -1 });

    const unreadCount = await Message.countDocuments({
      ownerId: auth.user.ownerId,
      read: false,
    });

    return NextResponse.json({
      success: true,
      unreadCount,
      data: messages,
    });
  } catch (error) {
    console.error("GET Messages error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
