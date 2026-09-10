import { NextRequest, NextResponse } from "next/server";
import { verifyUserRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { isValidObjectId } from "@/lib/authorization";

export async function GET(request: NextRequest) {
  const userPayload = await verifyUserRequest(request);
  if (!userPayload || !userPayload.id || !isValidObjectId(userPayload.id)) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 401 }
    );
  }

  await connectToDatabase();
  const userDoc = await User.findById(userPayload.id)
    .select("accountStatus role plan username name email profession")
    .lean();

  if (!userDoc) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 401 }
    );
  }

  if (userDoc.accountStatus === "suspended") {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: "Your account has been suspended.",
        code: "ACCOUNT_SUSPENDED",
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: userPayload,
  });
}
