import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth, sanitizeRequestBody } from "@/lib/authorization";
import Project from "@/models/Project";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) return auth.errorResponse;

    await connectToDatabase();
    const projects = await Project.find({ ownerId: auth.user.ownerId }).sort({
      order: 1,
      createdAt: -1,
    });
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("GET Projects error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
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

    const maxOrderDoc = await Project.findOne({
      ownerId: auth.user.ownerId,
    }).sort({ order: -1 });
    const nextOrder = maxOrderDoc ? (maxOrderDoc.order || 0) + 1 : 1;

    const project = await Project.create({
      ...body,
      ownerId: auth.user.ownerId,
      order: body.order ?? nextOrder,
    });

    return NextResponse.json(
      { success: true, message: "Project created", data: project },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Project error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}
