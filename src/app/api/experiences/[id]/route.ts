import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth, sanitizeRequestBody, isValidObjectId } from "@/lib/authorization";
import Experience from "@/models/Experience";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Experience not found" },
        { status: 404 }
      );
    }

    await connectToDatabase();
    const experience = await Experience.findOne({
      _id: id,
      ownerId: auth.user.ownerId,
    });

    if (!experience) {
      return NextResponse.json(
        { success: false, error: "Experience not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: experience });
  } catch (error) {
    console.error("GET Experience by id error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch experience" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Experience not found" },
        { status: 404 }
      );
    }

    await connectToDatabase();
    const rawBody = await request.json();
    const body = sanitizeRequestBody(rawBody, { allowRole: true });

    const experience = await Experience.findOneAndUpdate(
      { _id: id, ownerId: auth.user.ownerId },
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!experience) {
      return NextResponse.json(
        { success: false, error: "Experience not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Experience updated successfully",
      data: experience,
    });
  } catch (error) {
    console.error("PUT Experience error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update experience" },
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
        { success: false, error: "Experience not found" },
        { status: 404 }
      );
    }

    await connectToDatabase();
    const experience = await Experience.findOneAndDelete({
      _id: id,
      ownerId: auth.user.ownerId,
    });

    if (!experience) {
      return NextResponse.json(
        { success: false, error: "Experience not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Experience deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Experience error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete experience" },
      { status: 500 }
    );
  }
}
