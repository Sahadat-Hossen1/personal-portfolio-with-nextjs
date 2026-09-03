import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAdminRequest } from "@/lib/auth";
import Message from "@/models/Message";

// Public endpoint: Contact form submission
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const newMessage = await Message.create({
      name: name.trim(),
      email: email.trim(),
      subject: (subject || "").trim(),
      message: message.trim(),
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

// Admin endpoint: List messages
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const messages = await Message.find().sort({ createdAt: -1 });
    const unreadCount = await Message.countDocuments({ read: false });

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
