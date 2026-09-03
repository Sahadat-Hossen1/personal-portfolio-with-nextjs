import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAdminRequest } from "@/lib/auth";
import Experience from "@/models/Experience";

export async function GET() {
  try {
    await connectToDatabase();
    const experiences = await Experience.find().sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, data: experiences });
  } catch (error) {
    console.error("GET Experiences error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch experiences" },
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

    const maxDoc = await Experience.findOne().sort({ order: -1 });
    const nextOrder = maxDoc ? (maxDoc.order || 0) + 1 : 1;

    const experience = await Experience.create({
      ...body,
      order: body.order ?? nextOrder,
    });

    return NextResponse.json(
      { success: true, message: "Experience created", data: experience },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Experience error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create experience" },
      { status: 500 }
    );
  }
}
