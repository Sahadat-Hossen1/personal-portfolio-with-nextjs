import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { NextRequest } from "next/server";

// Load environment variables from .env.local if present
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio";

// Models
import User from "@/models/User";
import Message from "@/models/Message";
import Admin from "@/models/Admin";

// Auth utilities
import {
  signUserToken,
  signAdminToken,
  hashPassword,
  USER_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

// Message Route Handlers
import {
  GET as getMessages,
} from "@/app/api/messages/route";
import {
  GET as getMessageById,
  PATCH as patchMessageById,
  DELETE as deleteMessageById,
} from "@/app/api/messages/[id]/route";

function createMockRequest(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  url: string,
  options: {
    body?: Record<string, unknown>;
    rawBody?: string;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
  } = {}
) {
  const cookieHeader = Object.entries(options.cookies || {})
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  if (cookieHeader) {
    headers["Cookie"] = cookieHeader;
  }

  if (options.body || options.rawBody !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const bodyContent =
    options.rawBody !== undefined
      ? options.rawBody
      : options.body
      ? JSON.stringify(options.body)
      : undefined;

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers,
    body: bodyContent,
  });
}

export async function runMessagesPhase9Tests() {
  console.log("=================================================");
  console.log("      PHASE 9: MESSAGES MANAGEMENT TEST SUITE     ");
  console.log("=================================================");

  await mongoose.connect(MONGODB_URI);

  const testEmailA = "test.usera.phase9@example.com";
  const testEmailB = "test.userb.phase9@example.com";
  const testPassword = "securePassword123";

  // Pre-cleanup of any previous test artifacts
  const existingUsers = await User.find({
    email: { $in: [testEmailA, testEmailB] },
  });
  const existingUserIds = existingUsers.map((u) => u._id);

  if (existingUserIds.length > 0) {
    await Message.deleteMany({ ownerId: { $in: existingUserIds } });
    await User.deleteMany({ _id: { $in: existingUserIds } });
  }
  await Admin.deleteMany({ username: "admin_phase9" });

  // Create isolated Test User A & User B
  const hashedPassword = await hashPassword(testPassword);
  const userA = await User.create({
    name: "Tenant User A",
    email: testEmailA,
    username: "tenant-a-p9",
    passwordHash: hashedPassword,
    role: "user",
    plan: "free",
    profession: "developer",
    allowedTemplates: ["developer"],
  });

  const userB = await User.create({
    name: "Tenant User B",
    email: testEmailB,
    username: "tenant-b-p9",
    passwordHash: hashedPassword,
    role: "user",
    plan: "free",
    profession: "video-editor",
    allowedTemplates: ["video-editor"],
  });

  // Create isolated Superadmin
  const superadmin = await Admin.create({
    username: "admin_phase9",
    passwordHash: hashedPassword,
    role: "superadmin",
  });

  // Generate tokens
  const tokenA = await signUserToken({
    id: userA._id.toString(),
    email: userA.email,
    role: userA.role,
    username: userA.username,
    profession: userA.profession,
  });

  const tokenB = await signUserToken({
    id: userB._id.toString(),
    email: userB.email,
    role: userB.role,
    username: userB.username,
    profession: userB.profession,
  });

  const adminToken = await signAdminToken({
    id: superadmin._id.toString(),
    username: superadmin.username,
  });

  const cookiesA = { [USER_COOKIE_NAME]: tokenA };
  const cookiesB = { [USER_COOKIE_NAME]: tokenB };
  const cookiesAdmin = { [ADMIN_COOKIE_NAME]: adminToken };

  // Seed initial message for User A (unread)
  const msgA1 = await Message.create({
    ownerId: userA._id,
    name: "Client Alice",
    email: "alice@client.com",
    subject: "Project Inquiry: Fullstack App",
    message: "Hi Alex, we would love to hire you for a Next.js project!",
    read: false,
  });

  // Seed second message for User A (read)
  const msgA2 = await Message.create({
    ownerId: userA._id,
    name: "Client Charlie",
    email: "charlie@client.com",
    subject: "Consulting Request",
    message: "Hello, looking for architecture advice.",
    read: true,
  });

  // Seed initial message for User B (unread)
  const msgB1 = await Message.create({
    ownerId: userB._id,
    name: "Client Bob",
    email: "bob@client.com",
    subject: "Video Editing Inquiry",
    message: "Hey Sam, looking for a DaVinci Resolve colorist.",
    read: false,
  });

  const results: { category: string; test: string; status: string; details: string }[] = [];

  function record(category: string, test: string, passed: boolean, details: string) {
    results.push({
      category,
      test,
      status: passed ? "PASSED ✓" : "FAILED ✗",
      details,
    });
    const indicator = passed ? "[✓ PASS]" : "[✗ FAIL]";
    console.log(`${indicator} ${category}: ${test} — ${details}`);
  }

  // --- 1. Unauthenticated GET /api/messages rejected (401) ---
  {
    const req = createMockRequest("GET", "/api/messages");
    const res = await getMessages(req);
    const json = await res.json();
    record(
      "Authentication",
      "1. Unauthenticated GET /api/messages rejected (401)",
      res.status === 401 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // --- 2. User A receives only User A messages (Tenant Isolation) ---
  {
    const req = createMockRequest("GET", "/api/messages", { cookies: cookiesA });
    const res = await getMessages(req);
    const json = await res.json();
    const hasMsgA1 = Array.isArray(json.data) && json.data.some((m: { _id: string }) => m._id === msgA1._id.toString());
    const hasMsgA2 = Array.isArray(json.data) && json.data.some((m: { _id: string }) => m._id === msgA2._id.toString());
    const hasMsgB1 = Array.isArray(json.data) && json.data.some((m: { _id: string }) => m._id === msgB1._id.toString());

    record(
      "Tenant Isolation",
      "2. User A receives only User A messages",
      res.status === 200 && json.success && hasMsgA1 && hasMsgA2 && !hasMsgB1,
      `Messages returned: ${json.data?.length}, contains msgA1: ${hasMsgA1}, contains msgB1: ${hasMsgB1}`
    );
  }

  // --- 3. User A can retrieve their own message by ID (GET /api/messages/[id]) ---
  {
    const req = createMockRequest("GET", `/api/messages/${msgA1._id.toString()}`, {
      cookies: cookiesA,
    });
    const res = await getMessageById(req, {
      params: Promise.resolve({ id: msgA1._id.toString() }),
    });
    const json = await res.json();

    record(
      "Single Message GET",
      "3. User A can retrieve their own message by ID",
      res.status === 200 && json.success && json.data?._id === msgA1._id.toString(),
      `HTTP ${res.status}, ID: ${json.data?._id}, Subject: '${json.data?.subject}'`
    );
  }

  // --- 4. User A cannot retrieve User B's message by ID (404, IDOR protection) ---
  {
    const req = createMockRequest("GET", `/api/messages/${msgB1._id.toString()}`, {
      cookies: cookiesA,
    });
    const res = await getMessageById(req, {
      params: Promise.resolve({ id: msgB1._id.toString() }),
    });
    const json = await res.json();

    // Verify User B CAN retrieve their own message with cookiesB
    const reqB = createMockRequest("GET", `/api/messages/${msgB1._id.toString()}`, {
      cookies: cookiesB,
    });
    const resB = await getMessageById(reqB, {
      params: Promise.resolve({ id: msgB1._id.toString() }),
    });
    const jsonB = await resB.json();

    record(
      "IDOR Protection",
      "4. User A cannot retrieve User B's message by ID (404)",
      res.status === 404 && !json.success && resB.status === 200 && jsonB.success,
      `HTTP ${res.status}: ${json.error}, User B self-access: HTTP ${resB.status}`
    );
  }

  // --- 5. User A can mark their own message read (PATCH read: true) ---
  {
    const req = createMockRequest("PATCH", `/api/messages/${msgA1._id.toString()}`, {
      cookies: cookiesA,
      body: { read: true },
    });
    const res = await patchMessageById(req, {
      params: Promise.resolve({ id: msgA1._id.toString() }),
    });
    const json = await res.json();

    const dbMsg = await Message.findById(msgA1._id);

    record(
      "Read/Unread Support",
      "5. User A can mark their own message read",
      res.status === 200 && json.success && json.data?.read === true && dbMsg?.read === true,
      `HTTP ${res.status}, read state in DB: ${dbMsg?.read}`
    );
  }

  // --- 6. User A can mark their own message unread (PATCH read: false) ---
  {
    const req = createMockRequest("PATCH", `/api/messages/${msgA1._id.toString()}`, {
      cookies: cookiesA,
      body: { read: false },
    });
    const res = await patchMessageById(req, {
      params: Promise.resolve({ id: msgA1._id.toString() }),
    });
    const json = await res.json();

    const dbMsg = await Message.findById(msgA1._id);

    record(
      "Read/Unread Support",
      "6. User A can mark their own message unread",
      res.status === 200 && json.success && json.data?.read === false && dbMsg?.read === false,
      `HTTP ${res.status}, read state in DB: ${dbMsg?.read}`
    );
  }

  // --- 7. User A cannot update User B's message (IDOR -> 404) ---
  {
    const req = createMockRequest("PATCH", `/api/messages/${msgB1._id.toString()}`, {
      cookies: cookiesA,
      body: { read: true },
    });
    const res = await patchMessageById(req, {
      params: Promise.resolve({ id: msgB1._id.toString() }),
    });
    const json = await res.json();

    // Verify User B's message in DB was not altered
    const dbMsgB = await Message.findById(msgB1._id);
    const untouched = dbMsgB?.read === false;

    record(
      "IDOR Protection",
      "7. User A cannot update User B's message (404)",
      res.status === 404 && !json.success && untouched,
      `HTTP ${res.status}: ${json.error}, User B message read state untouched: ${untouched}`
    );
  }

  // --- 8. User A can delete their own message ---
  {
    const req = createMockRequest("DELETE", `/api/messages/${msgA2._id.toString()}`, {
      cookies: cookiesA,
    });
    const res = await deleteMessageById(req, {
      params: Promise.resolve({ id: msgA2._id.toString() }),
    });
    const json = await res.json();

    const dbMsgA2 = await Message.findById(msgA2._id);

    record(
      "Delete Support",
      "8. User A can delete their own message",
      res.status === 200 && json.success && dbMsgA2 === null,
      `HTTP ${res.status}: ${json.message}, deleted from DB: ${dbMsgA2 === null}`
    );
  }

  // --- 9. User A cannot delete User B's message (IDOR -> 404) ---
  {
    const req = createMockRequest("DELETE", `/api/messages/${msgB1._id.toString()}`, {
      cookies: cookiesA,
    });
    const res = await deleteMessageById(req, {
      params: Promise.resolve({ id: msgB1._id.toString() }),
    });
    const json = await res.json();

    const dbMsgB1 = await Message.findById(msgB1._id);

    record(
      "IDOR Protection",
      "9. User A cannot delete User B's message (404)",
      res.status === 404 && !json.success && dbMsgB1 !== null,
      `HTTP ${res.status}: ${json.error}, User B message preserved in DB: ${dbMsgB1 !== null}`
    );
  }

  // --- 10. Client-supplied ownerId cannot override ownership ---
  {
    const req = createMockRequest("PATCH", `/api/messages/${msgA1._id.toString()}`, {
      cookies: cookiesA,
      body: {
        read: true,
        ownerId: userB._id.toString(), // Attacker attempts to hijack ownership
      },
    });
    const res = await patchMessageById(req, {
      params: Promise.resolve({ id: msgA1._id.toString() }),
    });
    const json = await res.json();

    const dbMsgA1 = await Message.findById(msgA1._id);
    const stillOwnedByA = dbMsgA1?.ownerId?.toString() === userA._id.toString();

    record(
      "Security Boundary",
      "10. Client-supplied ownerId cannot override ownership",
      res.status === 200 && json.success && stillOwnedByA,
      `ownerId retained as: ${dbMsgA1?.ownerId}, spoofed ownerId ignored`
    );
  }

  // --- 11. Invalid non-ObjectId safely returns 404 without crashing ---
  {
    const req = createMockRequest("GET", "/api/messages/invalid-object-id-123", {
      cookies: cookiesA,
    });
    const res = await getMessageById(req, {
      params: Promise.resolve({ id: "invalid-object-id-123" }),
    });
    const json = await res.json();

    record(
      "Invalid Input Handling",
      "11. Invalid ObjectId safely returns 404 without crashing",
      res.status === 404 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // --- 12. Malformed PATCH payload safely handled ---
  {
    // Test non-boolean read
    const req = createMockRequest("PATCH", `/api/messages/${msgA1._id.toString()}`, {
      cookies: cookiesA,
      body: { read: "not-a-boolean" as unknown as boolean },
    });
    const res = await patchMessageById(req, {
      params: Promise.resolve({ id: msgA1._id.toString() }),
    });
    const json = await res.json();

    record(
      "Robustness",
      "12. Malformed PATCH payload safely handled (400)",
      res.status === 400 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // --- 13. Ownership remains unchanged after PATCH ---
  {
    const beforeDoc = await Message.findById(msgA1._id);
    const req = createMockRequest("PATCH", `/api/messages/${msgA1._id.toString()}`, {
      cookies: cookiesA,
      body: { read: false },
    });
    await patchMessageById(req, {
      params: Promise.resolve({ id: msgA1._id.toString() }),
    });
    const afterDoc = await Message.findById(msgA1._id);

    const unchanged =
      beforeDoc?.ownerId?.toString() === afterDoc?.ownerId?.toString() &&
      afterDoc?.ownerId?.toString() === userA._id.toString();

    record(
      "Ownership Integrity",
      "13. Ownership remains unchanged after PATCH",
      unchanged,
      `Before: ${beforeDoc?.ownerId}, After: ${afterDoc?.ownerId}`
    );
  }

  // --- 14. Clean client projection: no passwordHash or auth secret leak ---
  {
    const req = createMockRequest("GET", "/api/messages", { cookies: cookiesA });
    const res = await getMessages(req);
    const json = await res.json();
    const hasPasswordHash = json.data?.some(
      (m: Record<string, unknown>) => "passwordHash" in m || "token" in m || "secret" in m
    );

    record(
      "Payload Hygiene",
      "14. Response does not leak credentials or security fields",
      !hasPasswordHash,
      `Credential leak check passed: ${!hasPasswordHash}`
    );
  }

  // --- 15. Superadmin authentication remains compatible ---
  {
    const req = createMockRequest("GET", "/api/messages", { cookies: cookiesAdmin });
    const res = await getMessages(req);
    const json = await res.json();

    record(
      "Superadmin Compatibility",
      "15. Superadmin authentication resolves cleanly",
      res.status === 200 && json.success,
      `HTTP ${res.status}, unreadCount: ${json.unreadCount}`
    );
  }

  // --- 16. unreadCount remains correct ---
  {
    // Create an unread message and a read message for User A
    const extraUnread = await Message.create({
      ownerId: userA._id,
      name: "Sender Unread",
      email: "unread@example.com",
      subject: "Test Unread",
      message: "Unread test payload",
      read: false,
    });

    const req = createMockRequest("GET", "/api/messages", { cookies: cookiesA });
    const res = await getMessages(req);
    const json = await res.json();

    const dbUnreadCount = await Message.countDocuments({
      ownerId: userA._id,
      read: false,
    });

    const countsMatch = json.unreadCount === dbUnreadCount;

    // Clean up extra test message
    await Message.findByIdAndDelete(extraUnread._id);

    record(
      "Authoritative Counts",
      "16. unreadCount accurately reflects database unread messages",
      res.status === 200 && countsMatch,
      `API unreadCount: ${json.unreadCount}, DB count: ${dbUnreadCount}`
    );
  }

  // --- 17. Clean Up Test Artifacts ---
  console.log("\n--- Cleaning Up Temporary Phase 9 Test Records ---");
  await Message.deleteMany({ ownerId: { $in: [userA._id, userB._id, superadmin._id] } });
  await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
  await Admin.deleteMany({ _id: superadmin._id });
  console.log("✓ Cleanup finished. Real portfolio records remain untouched.\n");

  record(
    "Cleanup",
    "17. Complete cleanup of test data performed",
    true,
    "All test users, test messages, and test admin records pruned."
  );

  // Print Summary Table
  console.log("=================================================");
  console.log("             TEST RESULTS SUMMARY                ");
  console.log("=================================================");
  console.table(results);

  const passedCount = results.filter((r) => r.status.includes("PASSED")).length;
  console.log(`\nResults: ${passedCount}/${results.length} tests passed.`);

  if (passedCount === results.length) {
    console.log("✓ ALL PHASE 9 MESSAGES TESTS PASSED!\n");
  } else {
    console.error("✗ SOME PHASE 9 MESSAGES TESTS FAILED!\n");
    process.exit(1);
  }

  await mongoose.disconnect();
}

// Auto-execute if run directly via tsx
if (require.main === module || process.argv[1]?.includes("test-messages-phase9")) {
  runMessagesPhase9Tests().catch((err) => {
    console.error("Test execution error:", err);
    process.exit(1);
  });
}
