import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth, isValidObjectId } from "@/lib/authorization";
import Message from "@/models/Message";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    await connectToDatabase();
    const body = await request.json();

    const message = await Message.findOneAndUpdate(
      { _id: id, ownerId: auth.user.ownerId },
      { read: Boolean(body.read) },
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
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    await connectToDatabase();
    const message = await Message.findOneAndDelete({
      _id: id,
      ownerId: auth.user.ownerId,
    });

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
