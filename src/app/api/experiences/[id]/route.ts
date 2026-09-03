import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAdminRequest } from "@/lib/auth";
import Experience from "@/models/Experience";

export async function PUT(
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

    const experience = await Experience.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

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
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectToDatabase();
    const experience = await Experience.findByIdAndDelete(id);

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
