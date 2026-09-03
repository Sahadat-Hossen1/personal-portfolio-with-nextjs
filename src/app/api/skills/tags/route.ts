import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAdminRequest } from "@/lib/auth";
import SkillTag from "@/models/SkillTag";

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Tag name is required" },
        { status: 400 }
      );
    }

    const maxDoc = await SkillTag.findOne().sort({ order: -1 });
    const nextOrder = maxDoc ? (maxDoc.order || 0) + 1 : 1;

    const tag = await SkillTag.create({
      name: name.trim(),
      order: nextOrder,
    });

    return NextResponse.json(
      { success: true, message: "Tag created", data: tag },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Tag error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
