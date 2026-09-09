import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth, isValidObjectId } from "@/lib/authorization";
import SkillTag from "@/models/SkillTag";

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
        { success: false, error: "Tag not found" },
        { status: 404 }
      );
    }

    await connectToDatabase();
    const tag = await SkillTag.findOneAndDelete({
      _id: id,
      ownerId: auth.user.ownerId,
    });

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
