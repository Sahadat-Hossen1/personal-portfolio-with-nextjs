import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAdminRequest } from "@/lib/auth";
import SkillTag from "@/models/SkillTag";

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
    const tag = await SkillTag.findByIdAndDelete(id);

    if (!tag) {
      return NextResponse.json(
        { success: false, error: "Tag not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Tag error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
