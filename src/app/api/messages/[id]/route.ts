import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAdminRequest } from "@/lib/auth";
import Message from "@/models/Message";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectToDatabase();
    const body = await request.json();

    const message = await Message.findByIdAndUpdate(
      id,
      { read: body.read },
      { new: true }
    );

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message updated",
      data: message,
    });
  } catch (error) {
    console.error("PATCH Message error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update message" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectToDatabase();
    const message = await Message.findByIdAndDelete(id);

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Message error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
