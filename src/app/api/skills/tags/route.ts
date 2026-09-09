import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth } from "@/lib/authorization";
import SkillTag from "@/models/SkillTag";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    await connectToDatabase();
    const tags = await SkillTag.find({ ownerId: auth.user.ownerId }).sort({
      order: 1,
      createdAt: 1,
    });

    return NextResponse.json({ success: true, data: tags });
  } catch (error) {
    console.error("GET Tags error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    await connectToDatabase();
    const body = await request.json();
    const name = body.name;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Tag name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check tenant-scoped uniqueness (ownerId + name)
    const existing = await SkillTag.findOne({
      ownerId: auth.user.ownerId,
      name: trimmedName,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A tag with this name already exists" },
        { status: 409 }
      );
    }

    const maxDoc = await SkillTag.findOne({
      ownerId: auth.user.ownerId,
    }).sort({ order: -1 });
    const nextOrder = maxDoc ? (maxDoc.order || 0) + 1 : 1;

    const tag = await SkillTag.create({
      name: trimmedName,
      order: nextOrder,
      ownerId: auth.user.ownerId,
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
