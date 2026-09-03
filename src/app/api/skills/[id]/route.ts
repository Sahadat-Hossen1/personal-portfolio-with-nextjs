import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAdminRequest } from "@/lib/auth";
import Skill from "@/models/Skill";

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

    const skill = await Skill.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!skill) {
      return NextResponse.json(
        { success: false, error: "Skill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Skill updated successfully",
      data: skill,
    });
  } catch (error) {
    console.error("PUT Skill error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update skill" },
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
    const skill = await Skill.findByIdAndDelete(id);

    if (!skill) {
      return NextResponse.json(
        { success: false, error: "Skill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Skill error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}
