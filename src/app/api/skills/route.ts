import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAdminRequest } from "@/lib/auth";
import Skill from "@/models/Skill";
import SkillTag from "@/models/SkillTag";

export async function GET() {
  try {
    await connectToDatabase();
    const skills = await Skill.find().sort({ order: 1, createdAt: 1 });
    const tags = await SkillTag.find().sort({ order: 1, createdAt: 1 });
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
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await request.json();

    const maxDoc = await Skill.findOne().sort({ order: -1 });
    const nextOrder = maxDoc ? (maxDoc.order || 0) + 1 : 1;

    const skill = await Skill.create({
      ...body,
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
