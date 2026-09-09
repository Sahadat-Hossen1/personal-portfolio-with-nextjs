import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth } from "@/lib/authorization";
import Message from "@/models/Message";
import User from "@/models/User";

// Public endpoint: Contact form submission
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const rawBody = await request.json();
    const { name, email, subject, message } = rawBody;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // SECURITY: Client-supplied ownerId is NEVER trusted or accepted.
    // In Phase 4 (single-portfolio compatibility mode prior to /p/[username]),
    // resolve recipient server-side to the system default portfolio owner (superadmin).
    const defaultOwner =
      (await User.findOne({ role: "superadmin" })) ||
      (await User.findOne().sort({ createdAt: 1 }));

    const newMessage = await Message.create({
      name: String(name).trim(),
      email: String(email).trim(),
      subject: (subject ? String(subject) : "").trim(),
      message: String(message).trim(),
      read: false,
      ...(defaultOwner ? { ownerId: defaultOwner._id } : {}),
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
