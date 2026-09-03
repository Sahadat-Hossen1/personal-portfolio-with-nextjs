import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyAdminRequest } from "@/lib/auth";
import Project from "@/models/Project";

export async function GET() {
  try {
    await connectToDatabase();
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
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
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await request.json();

    const maxOrderDoc = await Project.findOne().sort({ order: -1 });
    const nextOrder = maxOrderDoc ? (maxOrderDoc.order || 0) + 1 : 1;

    const project = await Project.create({
      ...body,
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
