import mongoose, { Types } from "mongoose";
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
import Experience from "@/models/Experience";
import Admin from "@/models/Admin";

// Auth & Authorization utilities
import {
  signUserToken,
  signAdminToken,
  hashPassword,
  USER_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

// Experience Route Handlers
import {
  GET as getExperiences,
  POST as postExperience,
} from "@/app/api/experiences/route";
import {
  GET as getExperienceById,
  PUT as putExperienceById,
  DELETE as deleteExperienceById,
} from "@/app/api/experiences/[id]/route";

function createMockRequest(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  options: {
    body?: Record<string, unknown>;
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

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

export async function runExperiencePhase8Tests() {
  console.log("=================================================");
  console.log("     PHASE 8: EXPERIENCE CRUD TEST SUITE       ");
  console.log("=================================================");

  await mongoose.connect(MONGODB_URI);

  const testEmailA = "test.usera.phase8@example.com";
  const testEmailB = "test.userb.phase8@example.com";
  const testAdminUser = "admin.phase8@example.com";
  const testPassword = "securePassword123";

  // Pre-cleanup of any previous test artifacts
  const existingUsers = await User.find({
    email: { $in: [testEmailA, testEmailB] },
  });
  const existingUserIds = existingUsers.map((u) => u._id);

  if (existingUserIds.length > 0) {
    await Experience.deleteMany({ ownerId: { $in: existingUserIds } });
    await User.deleteMany({ _id: { $in: existingUserIds } });
  }
  await Admin.deleteMany({ username: "admin_phase8" });

  // Create isolated Test User A & User B
  const hashedPassword = await hashPassword(testPassword);
  const userA = await User.create({
    name: "Alex DevP8",
    email: testEmailA,
    username: "alex-dev-p8",
    passwordHash: hashedPassword,
    role: "user",
    plan: "free",
    profession: "developer",
    allowedTemplates: ["developer"],
  });

  const userB = await User.create({
    name: "Sam VideoP8",
    email: testEmailB,
    username: "sam-video-p8",
    passwordHash: hashedPassword,
    role: "user",
    plan: "free",
    profession: "video-editor",
    allowedTemplates: ["video-editor"],
  });

  // Create isolated Superadmin
  const superadmin = await Admin.create({
    username: "admin_phase8",
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

  // Seed initial experience for User A
  const expA1 = await Experience.create({
    ownerId: userA._id,
    role: "Lead Fullstack Engineer",
    company: "Alpha Innovations",
    companyUrl: "https://alpha.example.com",
    location: "Remote",
    period: "2023 – Present",
    type: "Full-time",
    bullets: ["Architected microservices", "Led team of 6 engineers"],
    tags: ["TypeScript", "Next.js", "MongoDB"],
    current: true,
    order: 1,
  });

  // Seed initial experience for User B
  const expB1 = await Experience.create({
    ownerId: userB._id,
    role: "Senior Video Editor",
    company: "Beta Studios",
    companyUrl: "https://beta.example.com",
    location: "Los Angeles, CA",
    period: "2021 – 2023",
    type: "Contract",
    bullets: ["Edited commercial spots", "Color grading in DaVinci Resolve"],
    tags: ["Premiere Pro", "After Effects", "DaVinci"],
    current: false,
    order: 1,
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

  // --- 1. Authentication ---
  {
    const req = createMockRequest("GET", "/api/experiences");
    const res = await getExperiences(req);
    const json = await res.json();
    record(
      "Authentication",
      "1. Unauthenticated GET /api/experiences is rejected (401)",
      res.status === 401 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // --- 2. Authenticated User A can retrieve own experiences ---
  {
    const req = createMockRequest("GET", "/api/experiences", { cookies: cookiesA });
    const res = await getExperiences(req);
    const json = await res.json();
    const hasExpA = Array.isArray(json.data) && json.data.some((e: { _id: string }) => e._id === expA1._id.toString());
    record(
      "Tenant Isolation",
      "2. Authenticated User A can retrieve own experiences",
      res.status === 200 && json.success && hasExpA,
      `User A experiences count: ${json.data?.length}`
    );
  }

  // --- 3. Tenant Isolation: User A cannot retrieve User B's experiences ---
  {
    const req = createMockRequest("GET", "/api/experiences", { cookies: cookiesA });
    const res = await getExperiences(req);
    const json = await res.json();
    const hasExpB = Array.isArray(json.data) && json.data.some((e: { _id: string }) => e._id === expB1._id.toString());
    record(
      "Tenant Isolation",
      "3. User A cannot retrieve User B's experiences",
      res.status === 200 && !hasExpB,
      `User A list isolated from User B: ${!hasExpB}`
    );
  }

  // --- 4. IDOR: User A cannot retrieve User B's experience via GET /api/experiences/[id] ---
  {
    const req = createMockRequest("GET", `/api/experiences/${expB1._id.toString()}`, {
      cookies: cookiesA,
    });
    const res = await getExperienceById(req, {
      params: Promise.resolve({ id: expB1._id.toString() }),
    });
    const json = await res.json();
    record(
      "IDOR Protection",
      "4. User A cannot GET User B's experience by ID (404)",
      res.status === 404 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // --- 5. IDOR: User A cannot update User B's experience via PUT /api/experiences/[id] ---
  {
    const req = createMockRequest("PUT", `/api/experiences/${expB1._id.toString()}`, {
      cookies: cookiesA,
      body: { company: "Hacked Company Name" },
    });
    const res = await putExperienceById(req, {
      params: Promise.resolve({ id: expB1._id.toString() }),
    });
    const json = await res.json();

    // Verify User B's record in DB was not altered
    const freshExpB = await Experience.findById(expB1._id);
    const unchanged = freshExpB?.company === "Beta Studios";

    record(
      "IDOR Protection",
      "5. User A cannot update User B's experience (404)",
      res.status === 404 && !json.success && unchanged,
      `HTTP ${res.status}: ${json.error}, DB company unchanged: '${freshExpB?.company}'`
    );
  }

  // --- 6. IDOR: User A cannot delete User B's experience via DELETE /api/experiences/[id] ---
  {
    const req = createMockRequest("DELETE", `/api/experiences/${expB1._id.toString()}`, {
      cookies: cookiesA,
    });
    const res = await deleteExperienceById(req, {
      params: Promise.resolve({ id: expB1._id.toString() }),
    });
    const json = await res.json();

    // Verify User B's record in DB still exists
    const stillExists = await Experience.findById(expB1._id);

    record(
      "IDOR Protection",
      "6. User A cannot delete User B's experience (404)",
      res.status === 404 && !json.success && !!stillExists,
      `HTTP ${res.status}: ${json.error}, Record exists in DB: ${!!stillExists}`
    );
  }

  // --- 7. Create: User A can create an experience ---
  let createdExpAId = "";
  {
    const req = createMockRequest("POST", "/api/experiences", {
      cookies: cookiesA,
      body: {
        role: "Principal Systems Architect",
        company: "Gamma Cloud Services",
        companyUrl: "https://gamma.example.com",
        location: "San Francisco, CA",
        period: "2024 – Present",
        type: "Full-time",
        bullets: ["Spearheaded multi-tenant cloud migration", "Cut infra costs by 35%"],
        tags: ["Kubernetes", "AWS", "Go", "Docker"],
        current: true,
        order: 2,
      },
    });
    const res = await postExperience(req);
    const json = await res.json();
    createdExpAId = json.data?._id;

    record(
      "Create Experience",
      "7. User A can create an experience with all valid fields",
      res.status === 201 && json.success && !!createdExpAId,
      `Created experience ID: ${createdExpAId}, Role: ${json.data?.role}`
    );
  }

  // --- 8. Server-Enforced Ownership: client-supplied ownerId cannot override server ownership ---
  {
    const req = createMockRequest("POST", "/api/experiences", {
      cookies: cookiesA,
      body: {
        role: "Spoofed Role",
        company: "Spoofed Corp",
        period: "2024 – 2025",
        ownerId: userB._id.toString(), // Attacker attempts to assign to User B
      },
    });
    const res = await postExperience(req);
    const json = await res.json();
    const isOwnerA = json.data?.ownerId?.toString() === userA._id.toString();

    // Cleanup spoofed test doc
    if (json.data?._id) {
      await Experience.findByIdAndDelete(json.data._id);
    }

    record(
      "Security Boundary",
      "8. Client-supplied ownerId cannot override server ownership",
      res.status === 201 && isOwnerA,
      `OwnerId strictly enforced as User A (${json.data?.ownerId}), ignored User B spoof attempt`
    );
  }

  // --- 9. Missing required fields are rejected according to existing API contract ---
  {
    const req = createMockRequest("POST", "/api/experiences", {
      cookies: cookiesA,
      body: {
        // missing role, company, period
        location: "Nowhere",
      },
    });
    const res = await postExperience(req);
    const json = await res.json();
    record(
      "Validation",
      "9. Missing required fields are rejected by API contract",
      !json.success && res.status >= 400,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // --- 10. Update: User A can update their own experience (including role as job title) ---
  {
    const req = createMockRequest("PUT", `/api/experiences/${createdExpAId}`, {
      cookies: cookiesA,
      body: {
        role: "Chief Technology Officer",
        company: "Gamma Global Technologies",
        period: "2024 – Present",
        type: "Full-time",
        bullets: ["Scaled engineering organization to 50+"],
        tags: ["Architecture", "Leadership", "Cloud"],
        current: true,
        order: 3,
      },
    });
    const res = await putExperienceById(req, {
      params: Promise.resolve({ id: createdExpAId }),
    });
    const json = await res.json();

    const dbDoc = await Experience.findById(createdExpAId);
    const updatedRole = dbDoc?.role === "Chief Technology Officer";
    const updatedCompany = dbDoc?.company === "Gamma Global Technologies";

    record(
      "Update Experience",
      "10. User A can update their own experience (role as job title allowed)",
      res.status === 200 && json.success && updatedRole && updatedCompany,
      `Updated role: '${dbDoc?.role}', Updated company: '${dbDoc?.company}'`
    );
  }

  // --- 11. Ownership remains unchanged after update ---
  {
    const req = createMockRequest("PUT", `/api/experiences/${createdExpAId}`, {
      cookies: cookiesA,
      body: {
        company: "Gamma Corp",
        ownerId: userB._id.toString(), // Attacker attempts to change ownership
      },
    });
    const res = await putExperienceById(req, {
      params: Promise.resolve({ id: createdExpAId }),
    });

    const freshDoc = await Experience.findById(createdExpAId);
    const stillOwnedByA = freshDoc?.ownerId?.toString() === userA._id.toString();

    record(
      "Security Boundary",
      "11. Ownership remains unchanged after update",
      stillOwnedByA,
      `ownerId retained as: ${freshDoc?.ownerId}`
    );
  }

  // --- 12. Delete: User A can delete their own experience ---
  {
    const req = createMockRequest("DELETE", `/api/experiences/${createdExpAId}`, {
      cookies: cookiesA,
    });
    const res = await deleteExperienceById(req, {
      params: Promise.resolve({ id: createdExpAId }),
    });
    const json = await res.json();

    const deletedDoc = await Experience.findById(createdExpAId);

    record(
      "Delete Experience",
      "12. User A can delete their own experience",
      res.status === 200 && json.success && !deletedDoc,
      `HTTP ${res.status}: ${json.message}, Doc deleted from DB: ${!deletedDoc}`
    );
  }

  // --- 13. Invalid/non-ObjectId experience ID is handled safely (404, no crash) ---
  {
    const req = createMockRequest("GET", "/api/experiences/invalid-non-objectid-123", {
      cookies: cookiesA,
    });
    const res = await getExperienceById(req, {
      params: Promise.resolve({ id: "invalid-non-objectid-123" }),
    });
    const json = await res.json();
    record(
      "Invalid Input Handling",
      "13. Invalid non-ObjectId experience ID returns 404 without crashing",
      res.status === 404 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // --- 14. Malformed request body does not cause uncontrolled server error ---
  {
    const req = createMockRequest("PUT", `/api/experiences/${expA1._id.toString()}`, {
      cookies: cookiesA,
      body: {} as Record<string, unknown>,
    });
    const res = await putExperienceById(req, {
      params: Promise.resolve({ id: expA1._id.toString() }),
    });
    record(
      "Robustness",
      "14. Empty/minimal update payload is handled safely",
      res.status === 200,
      `HTTP ${res.status}`
    );
  }

  // --- 15. Clean client projection: no passwordHash or auth role leak ---
  {
    const req = createMockRequest("GET", "/api/experiences", { cookies: cookiesA });
    const res = await getExperiences(req);
    const json = await res.json();
    const hasPasswordHash = json.data?.some((e: Record<string, unknown>) => "passwordHash" in e);

    record(
      "Payload Hygiene",
      "15. Response does not leak passwordHash or credential fields",
      !hasPasswordHash,
      `Credential leak check passed: ${!hasPasswordHash}`
    );
  }

  // --- 16. Superadmin can access experience endpoint ---
  {
    const req = createMockRequest("GET", "/api/experiences", { cookies: cookiesAdmin });
    const res = await getExperiences(req);
    record(
      "Superadmin Compatibility",
      "16. Superadmin authentication resolves cleanly",
      res.status === 200,
      `HTTP ${res.status}`
    );
  }

  // --- 17. Schema & Period Format Integrity ---
  {
    const doc = await Experience.findById(expA1._id);
    const isPeriodString = typeof doc?.period === "string";
    const isCurrentBoolean = typeof doc?.current === "boolean";
    const isBulletsArray = Array.isArray(doc?.bullets);
    const isTagsArray = Array.isArray(doc?.tags);

    record(
      "Schema Integrity",
      "17. Experience schema types preserved: period is string, current is boolean, bullets & tags are arrays",
      isPeriodString && isCurrentBoolean && isBulletsArray && isTagsArray,
      `period='${doc?.period}' (string), current=${doc?.current} (boolean), bullets=${doc?.bullets?.length}, tags=${doc?.tags?.length}`
    );
  }

  // --- Clean Up Test Artifacts ---
  console.log("\n--- Cleaning Up Temporary Phase 8 Test Records ---");
  await Experience.deleteMany({ ownerId: { $in: [userA._id, userB._id, superadmin._id] } });
  await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
  await Admin.deleteMany({ _id: superadmin._id });
  console.log("✓ Cleanup finished. Real portfolio records remain untouched.\n");

  // Print Summary Table
  console.log("=================================================");
  console.log("             TEST RESULTS SUMMARY                ");
  console.log("=================================================");
  console.table(results);

  const passedCount = results.filter((r) => r.status.includes("PASSED")).length;
  console.log(`\nResults: ${passedCount}/${results.length} tests passed.`);

  if (passedCount === results.length) {
    console.log("✓ ALL PHASE 8 EXPERIENCE TESTS PASSED!\n");
  } else {
    console.error("✗ SOME PHASE 8 EXPERIENCE TESTS FAILED!\n");
    process.exit(1);
  }

  await mongoose.disconnect();
}

// Auto-execute if run directly via tsx
if (require.main === module || process.argv[1]?.includes("test-experience-phase8")) {
  runExperiencePhase8Tests().catch((err) => {
    console.error("Test execution error:", err);
    process.exit(1);
  });
}
