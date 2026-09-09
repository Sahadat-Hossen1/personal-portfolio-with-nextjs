import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth, sanitizeRequestBody } from "@/lib/authorization";
import Experience from "@/models/Experience";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    await connectToDatabase();
    const experiences = await Experience.find({
      ownerId: auth.user.ownerId,
    }).sort({ order: 1, createdAt: -1 });

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
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    await connectToDatabase();
    const rawBody = await request.json();
    const body = sanitizeRequestBody(rawBody, { allowRole: true });

    const maxDoc = await Experience.findOne({
      ownerId: auth.user.ownerId,
    }).sort({ order: -1 });
    const nextOrder = maxDoc ? (maxDoc.order || 0) + 1 : 1;

    const experience = await Experience.create({
      ...body,
      ownerId: auth.user.ownerId,
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
