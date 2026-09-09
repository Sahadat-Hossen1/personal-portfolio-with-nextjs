import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth, sanitizeRequestBody, isValidObjectId } from "@/lib/authorization";
import Skill from "@/models/Skill";

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
        { success: false, error: "Skill not found" },
        { status: 404 }
      );
    }

    await connectToDatabase();
    const skill = await Skill.findOne({ _id: id, ownerId: auth.user.ownerId });

    if (!skill) {
      return NextResponse.json(
        { success: false, error: "Skill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: skill });
  } catch (error) {
    console.error("GET Skill by id error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch skill" },
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
        { success: false, error: "Skill not found" },
        { status: 404 }
      );
    }

    await connectToDatabase();
    const rawBody = await request.json();
    const body = sanitizeRequestBody(rawBody);

    const skill = await Skill.findOneAndUpdate(
      { _id: id, ownerId: auth.user.ownerId },
      body,
      {
        new: true,
        runValidators: true,
      }
    );

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
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Skill not found" },
        { status: 404 }
      );
    }

    await connectToDatabase();
    const skill = await Skill.findOneAndDelete({
      _id: id,
      ownerId: auth.user.ownerId,
    });

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
