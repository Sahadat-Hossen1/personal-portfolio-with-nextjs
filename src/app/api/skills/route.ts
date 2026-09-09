import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth, sanitizeRequestBody } from "@/lib/authorization";
import Skill from "@/models/Skill";
import SkillTag from "@/models/SkillTag";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    await connectToDatabase();
    const skills = await Skill.find({ ownerId: auth.user.ownerId }).sort({
      order: 1,
      createdAt: 1,
    });
    const tags = await SkillTag.find({ ownerId: auth.user.ownerId }).sort({
      order: 1,
      createdAt: 1,
    });

    return NextResponse.json({ success: true, data: { skills, tags } });
  } catch (error) {
    console.error("GET Skills error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    await connectToDatabase();
    const rawBody = await request.json();
    const body = sanitizeRequestBody(rawBody);

    const maxDoc = await Skill.findOne({ ownerId: auth.user.ownerId }).sort({
      order: -1,
    });
    const nextOrder = maxDoc ? (maxDoc.order || 0) + 1 : 1;

    const skill = await Skill.create({
      ...body,
      ownerId: auth.user.ownerId,
      order: body.order ?? nextOrder,
    });

    return NextResponse.json(
      { success: true, message: "Skill created", data: skill },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Skill error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create skill" },
      { status: 500 }
    );
  }
}
