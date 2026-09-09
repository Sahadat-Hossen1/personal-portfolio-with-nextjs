import mongoose, { Types } from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { NextRequest } from "next/server";

// Load environment
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio";

// Models
import User, { IUser } from "@/models/User";
import Profile from "@/models/Profile";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import Experience from "@/models/Experience";
import Message from "@/models/Message";

// Auth helpers
import { USER_COOKIE_NAME, signUserToken, hashPassword } from "@/lib/auth";

// API Handlers
import { GET as getUsersHandler } from "@/app/api/admin/users/route";
import {
  GET as getUserByIdHandler,
  PUT as putUserByIdHandler,
} from "@/app/api/admin/users/[id]/route";
import { GET as getStatsHandler } from "@/app/api/admin/stats/route";

function createMockRequest(
  url: string,
  method: "GET" | "PUT" | "POST",
  body?: any,
  cookies: Record<string, string> = {}
) {
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

interface TestResult {
  num: number;
  test: string;
  passed: boolean;
  details: string;
}

export async function runPhase14SuperadminTests() {
  console.log("===============================================================");
  console.log("    PHASE 14 — SUPERADMIN PLATFORM CONTROL PLANE TESTS        ");
  console.log("===============================================================\n");

  await mongoose.connect(MONGODB_URI);

  const testResults: TestResult[] = [];

  function record(num: number, test: string, passed: boolean, details: string) {
    testResults.push({ num, test, passed, details });
    const mark = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${mark}] [Test ${num}] ${test} — ${details}`);
  }

  // Define unique test fixtures
  const superadminEmail = "p14.superadmin@example.com";
  const superadminUsername = "p14-superadmin";

  const normalUserAEmail = "p14.user.alice@example.com";
  const normalUserAUsername = "p14-alice";

  const normalUserBEmail = "p14.user.bob@example.com";
  const normalUserBUsername = "p14-bob";

  // Clean up any previous test artifacts
  await User.deleteMany({
    email: { $in: [superadminEmail, normalUserAEmail, normalUserBEmail] },
  });

  const pwdHash = await hashPassword("TestPassword123!");

  // Create Superadmin fixture
  const superadminDoc = await User.create({
    name: "Super Admin Tester",
    email: superadminEmail,
    username: superadminUsername,
    passwordHash: pwdHash,
    role: "superadmin",
    profession: "developer",
    plan: "premium",
    allowedTemplates: ["developer", "video-editor", "digital-marketer", "doctor"],
  });

  // Create Normal User A fixture
  const userADoc = await User.create({
    name: "Tenant Alice",
    email: normalUserAEmail,
    username: normalUserAUsername,
    passwordHash: pwdHash,
    role: "user",
    profession: "developer",
    plan: "free",
    allowedTemplates: ["developer"],
  });

  await Profile.findOneAndUpdate(
    { ownerId: userADoc._id },
    {
      ownerId: userADoc._id,
      selectedTemplate: "developer",
      bioBlurb: "Alice Developer Bio",
      roles: ["Fullstack Engineer"],
      location: "San Francisco, CA",
      statusText: "Available for hire",
    },
    { upsert: true, new: true }
  );

  // Create Normal User B fixture
  const userBDoc = await User.create({
    name: "Tenant Bob Video",
    email: normalUserBEmail,
    username: normalUserBUsername,
    passwordHash: pwdHash,
    role: "user",
    profession: "video-editor",
    plan: "free",
    allowedTemplates: ["video-editor"],
  });

  await Profile.findOneAndUpdate(
    { ownerId: userBDoc._id },
    {
      ownerId: userBDoc._id,
      selectedTemplate: "video-editor",
      bioBlurb: "Bob Video Editor Bio",
      roles: ["Colorist & Editor"],
      location: "New York, NY",
      statusText: "Booking projects",
    },
    { upsert: true, new: true }
  );

  // Sign tokens
  const superadminToken = await signUserToken({
    id: superadminDoc._id.toString(),
    email: superadminDoc.email,
    role: "superadmin",
    username: superadminDoc.username,
    profession: "developer",
  });

  const normalUserAToken = await signUserToken({
    id: userADoc._id.toString(),
    email: userADoc.email,
    role: "user",
    username: userADoc.username,
    profession: "developer",
  });

  try {
    // -------------------------------------------------------------
    // Test 1: Superadmin can GET /api/admin/users
    // -------------------------------------------------------------
    const req1 = createMockRequest(
      "http://localhost:3000/api/admin/users",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res1 = await getUsersHandler(req1);
    const body1 = await res1.json();
    record(
      1,
      "Superadmin can GET /api/admin/users",
      res1.status === 200 && body1.success === true && Array.isArray(body1.data?.users),
      `Status ${res1.status}, users returned: ${body1.data?.users?.length}`
    );

    // -------------------------------------------------------------
    // Test 2: Normal user receives 403 Forbidden
    // -------------------------------------------------------------
    const req2 = createMockRequest(
      "http://localhost:3000/api/admin/users",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: normalUserAToken }
    );
    const res2 = await getUsersHandler(req2);
    const body2 = await res2.json();
    record(
      2,
      "Normal user receives 403 Forbidden",
      res2.status === 403 && body2.success === false,
      `Status ${res2.status}, error: "${body2.error}"`
    );

    // -------------------------------------------------------------
    // Test 3: Unauthenticated request is rejected with 401
    // -------------------------------------------------------------
    const req3 = createMockRequest(
      "http://localhost:3000/api/admin/users",
      "GET"
    );
    const res3 = await getUsersHandler(req3);
    const body3 = await res3.json();
    record(
      3,
      "Unauthenticated request rejected with 401",
      res3.status === 401 && body3.success === false,
      `Status ${res3.status}, error: "${body3.error}"`
    );

    // -------------------------------------------------------------
    // Test 4: Pagination works on /api/admin/users
    // -------------------------------------------------------------
    const req4 = createMockRequest(
      "http://localhost:3000/api/admin/users?page=1&limit=2",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res4 = await getUsersHandler(req4);
    const body4 = await res4.json();
    const pag = body4.data?.pagination;
    record(
      4,
      "Pagination works correctly",
      res4.status === 200 &&
        pag?.page === 1 &&
        pag?.limit === 2 &&
        pag?.totalUsers >= 2 &&
        body4.data.users.length <= 2,
      `Page: ${pag?.page}, limit: ${pag?.limit}, total: ${pag?.totalUsers}, users count: ${body4.data?.users?.length}`
    );

    // -------------------------------------------------------------
    // Test 5: Search works on /api/admin/users
    // -------------------------------------------------------------
    const req5 = createMockRequest(
      `http://localhost:3000/api/admin/users?search=${userADoc.username}`,
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res5 = await getUsersHandler(req5);
    const body5 = await res5.json();
    const searchUsers = body5.data?.users || [];
    const foundAlice = searchUsers.some(
      (u: any) => u.username === userADoc.username
    );
    const foundBob = searchUsers.some(
      (u: any) => u.username === userBDoc.username
    );
    record(
      5,
      "Search filters accurately by username/name/email",
      res5.status === 200 && foundAlice && !foundBob,
      `Search query '${userADoc.username}' found Alice (${foundAlice}), excluded Bob (${!foundBob})`
    );

    // -------------------------------------------------------------
    // Test 6: Sensitive fields (passwordHash) are strictly excluded
    // -------------------------------------------------------------
    const req6 = createMockRequest(
      "http://localhost:3000/api/admin/users",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res6 = await getUsersHandler(req6);
    const body6 = await res6.json();
    const allUsers = body6.data?.users || [];
    const hasSensitive = allUsers.some(
      (u: any) => "passwordHash" in u || "password" in u || "__v" in u
    );
    record(
      6,
      "Sensitive fields (passwordHash) strictly excluded from user list",
      !hasSensitive && allUsers.length > 0,
      `Inspected ${allUsers.length} users, passwordHash completely absent: ${!hasSensitive}`
    );

    // -------------------------------------------------------------
    // Test 7: Superadmin can inspect single user via GET /api/admin/users/[id]
    // -------------------------------------------------------------
    const req7 = createMockRequest(
      `http://localhost:3000/api/admin/users/${userADoc._id}`,
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res7 = await getUserByIdHandler(req7, {
      params: Promise.resolve({ id: userADoc._id.toString() }),
    });
    const body7 = await res7.json();
    const inspectedUser = body7.data?.user;
    const inspectedCounts = body7.data?.counts;
    record(
      7,
      "Superadmin can inspect single user details and counts",
      res7.status === 200 &&
        inspectedUser?.email === normalUserAEmail &&
        inspectedUser?.passwordHash === undefined &&
        typeof inspectedCounts?.projects === "number",
      `Retrieved user ${inspectedUser?.username}, passwordHash excluded: ${inspectedUser?.passwordHash === undefined}, counts present: ${!!inspectedCounts}`
    );

    // -------------------------------------------------------------
    // Test 8: Invalid user ID is rejected
    // -------------------------------------------------------------
    const req8Malformed = createMockRequest(
      "http://localhost:3000/api/admin/users/not-a-valid-id",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res8Malformed = await getUserByIdHandler(req8Malformed, {
      params: Promise.resolve({ id: "not-a-valid-id" }),
    });

    const fakeValidId = new Types.ObjectId().toString();
    const req8NotFound = createMockRequest(
      `http://localhost:3000/api/admin/users/${fakeValidId}`,
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res8NotFound = await getUserByIdHandler(req8NotFound, {
      params: Promise.resolve({ id: fakeValidId }),
    });

    record(
      8,
      "Invalid user ID returns 400, non-existent returns 404",
      res8Malformed.status === 400 && res8NotFound.status === 404,
      `Malformed ID status: ${res8Malformed.status}, Non-existent ID status: ${res8NotFound.status}`
    );

    // -------------------------------------------------------------
    // Test 9: Superadmin can update plan (free -> premium)
    // -------------------------------------------------------------
    const req9 = createMockRequest(
      `http://localhost:3000/api/admin/users/${userADoc._id}`,
      "PUT",
      { plan: "premium" },
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res9 = await putUserByIdHandler(req9, {
      params: Promise.resolve({ id: userADoc._id.toString() }),
    });
    const body9 = await res9.json();
    const updatedUser9 = await User.findById(userADoc._id);
    record(
      9,
      "Superadmin can update user plan to premium",
      res9.status === 200 &&
        body9.success === true &&
        updatedUser9?.plan === "premium",
      `Response status: ${res9.status}, DB user plan: ${updatedUser9?.plan}`
    );

    // -------------------------------------------------------------
    // Test 10: Invalid plan rejected with 400
    // -------------------------------------------------------------
    const req10 = createMockRequest(
      `http://localhost:3000/api/admin/users/${userADoc._id}`,
      "PUT",
      { plan: "enterprise-super-ultra" },
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res10 = await putUserByIdHandler(req10, {
      params: Promise.resolve({ id: userADoc._id.toString() }),
    });
    const body10 = await res10.json();
    record(
      10,
      "Invalid plan rejected with 400",
      res10.status === 400 && body10.success === false,
      `Status ${res10.status}, error: "${body10.error}"`
    );

    // -------------------------------------------------------------
    // Test 11: Superadmin can update allowedTemplates
    // -------------------------------------------------------------
    const req11 = createMockRequest(
      `http://localhost:3000/api/admin/users/${userADoc._id}`,
      "PUT",
      { allowedTemplates: ["developer", "doctor"] },
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res11 = await putUserByIdHandler(req11, {
      params: Promise.resolve({ id: userADoc._id.toString() }),
    });
    const body11 = await res11.json();
    const updatedUser11 = await User.findById(userADoc._id);
    const hasDeveloper = updatedUser11?.allowedTemplates?.includes("developer");
    const hasDoctor = updatedUser11?.allowedTemplates?.includes("doctor");
    record(
      11,
      "Superadmin can update allowedTemplates",
      res11.status === 200 &&
        body11.success === true &&
        hasDeveloper === true &&
        hasDoctor === true,
      `Status: ${res11.status}, allowedTemplates: ${JSON.stringify(updatedUser11?.allowedTemplates)}`
    );

    // -------------------------------------------------------------
    // Test 12: Unsupported template rejected with 400
    // -------------------------------------------------------------
    const req12 = createMockRequest(
      `http://localhost:3000/api/admin/users/${userADoc._id}`,
      "PUT",
      { allowedTemplates: ["cyberpunk-astronaut"] },
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res12 = await putUserByIdHandler(req12, {
      params: Promise.resolve({ id: userADoc._id.toString() }),
    });
    const body12 = await res12.json();

    const req12Empty = createMockRequest(
      `http://localhost:3000/api/admin/users/${userADoc._id}`,
      "PUT",
      { allowedTemplates: [] },
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res12Empty = await putUserByIdHandler(req12Empty, {
      params: Promise.resolve({ id: userADoc._id.toString() }),
    });

    record(
      12,
      "Unsupported template or empty allowedTemplates rejected with 400",
      res12.status === 400 && res12Empty.status === 400,
      `Unsupported tmpl status: ${res12.status} ("${body12.error}"), empty status: ${res12Empty.status}`
    );

    // -------------------------------------------------------------
    // Test 13: Normal user cannot update another user's entitlement
    // -------------------------------------------------------------
    const req13 = createMockRequest(
      `http://localhost:3000/api/admin/users/${userBDoc._id}`,
      "PUT",
      { plan: "premium" },
      { [USER_COOKIE_NAME]: normalUserAToken }
    );
    const res13 = await putUserByIdHandler(req13, {
      params: Promise.resolve({ id: userBDoc._id.toString() }),
    });
    const body13 = await res13.json();
    record(
      13,
      "Normal user cannot update another user's entitlement (403)",
      res13.status === 403 && body13.success === false,
      `Status ${res13.status}, error: "${body13.error}"`
    );

    // -------------------------------------------------------------
    // Test 14: Role cannot be escalated through payload
    // -------------------------------------------------------------
    const req14 = createMockRequest(
      `http://localhost:3000/api/admin/users/${userADoc._id}`,
      "PUT",
      { role: "superadmin" },
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res14 = await putUserByIdHandler(req14, {
      params: Promise.resolve({ id: userADoc._id.toString() }),
    });
    const body14 = await res14.json();
    const userDocAfter14 = await User.findById(userADoc._id);
    record(
      14,
      "Role cannot be escalated through payload (403)",
      res14.status === 403 && userDocAfter14?.role === "user",
      `Status ${res14.status}, DB user role remains: ${userDocAfter14?.role}`
    );

    // -------------------------------------------------------------
    // Test 15: passwordHash cannot be modified through entitlement endpoint
    // -------------------------------------------------------------
    const req15 = createMockRequest(
      `http://localhost:3000/api/admin/users/${userADoc._id}`,
      "PUT",
      { password: "HackedPassword999!", passwordHash: "tampered-hash" },
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res15 = await putUserByIdHandler(req15, {
      params: Promise.resolve({ id: userADoc._id.toString() }),
    });
    const body15 = await res15.json();
    const userDocAfter15 = await User.findById(userADoc._id);
    record(
      15,
      "passwordHash/password tampering strictly rejected (400)",
      res15.status === 400 && userDocAfter15?.passwordHash === pwdHash,
      `Status ${res15.status}, passwordHash untouched in DB: ${userDocAfter15?.passwordHash === pwdHash}`
    );

    // -------------------------------------------------------------
    // Test 16: Stats endpoint requires superadmin (401 unauth, 403 normal user)
    // -------------------------------------------------------------
    const req16Unauth = createMockRequest(
      "http://localhost:3000/api/admin/stats",
      "GET"
    );
    const res16Unauth = await getStatsHandler(req16Unauth);

    const req16Normal = createMockRequest(
      "http://localhost:3000/api/admin/stats",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: normalUserAToken }
    );
    const res16Normal = await getStatsHandler(req16Normal);

    record(
      16,
      "Stats endpoint requires superadmin (401 unauthenticated, 403 normal user)",
      res16Unauth.status === 401 && res16Normal.status === 403,
      `Unauth status: ${res16Unauth.status}, Normal user status: ${res16Normal.status}`
    );

    // -------------------------------------------------------------
    // Test 17: Stats return accurate database-derived values
    // -------------------------------------------------------------
    const req17 = createMockRequest(
      "http://localhost:3000/api/admin/stats",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res17 = await getStatsHandler(req17);
    const body17 = await res17.json();
    const statsData = body17.data;

    const actualTotalUsers = await User.countDocuments({});
    const actualTotalProfiles = await Profile.countDocuments({});

    record(
      17,
      "Stats return accurate database-derived values",
      res17.status === 200 &&
        statsData?.users?.total === actualTotalUsers &&
        statsData?.content?.profiles === actualTotalProfiles &&
        typeof statsData?.users?.byPlan?.free === "number" &&
        typeof statsData?.templates?.adoption?.developer === "number",
      `Total users: ${statsData?.users?.total} (DB: ${actualTotalUsers}), profiles: ${statsData?.content?.profiles} (DB: ${actualTotalProfiles})`
    );

    // -------------------------------------------------------------
    // Test 18: Tenant portfolio data remains isolated
    // -------------------------------------------------------------
    // Verify Profile A vs Profile B
    const profileA = await Profile.findOne({ ownerId: userADoc._id });
    const profileB = await Profile.findOne({ ownerId: userBDoc._id });

    const isolationMaintained =
      profileA?.ownerId?.toString() === userADoc._id.toString() &&
      profileB?.ownerId?.toString() === userBDoc._id.toString() &&
      profileA?.selectedTemplate !== profileB?.selectedTemplate;

    record(
      18,
      "Tenant portfolio data remains isolated by ownerId",
      isolationMaintained,
      `User A ownerId: ${profileA?.ownerId} (${profileA?.selectedTemplate}), User B ownerId: ${profileB?.ownerId} (${profileB?.selectedTemplate})`
    );
  } finally {
    // Clean up test documents
    await User.deleteMany({
      email: { $in: [superadminEmail, normalUserAEmail, normalUserBEmail] },
    });
    await Profile.deleteMany({
      ownerId: { $in: [superadminDoc._id, userADoc._id, userBDoc._id] },
    });
  }

  console.log("\n===============================================================");
  console.log("                   PHASE 14 TEST SUMMARY                       ");
  console.log("===============================================================");

  const totalTests = testResults.length;
  const totalPassed = testResults.filter((t) => t.passed).length;
  console.log(`Total Tests Run: ${totalTests}`);
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${totalTests - totalPassed}`);

  if (totalPassed === totalTests) {
    console.log("✓ ALL 18 PHASE 14 SUPERADMIN TESTS PASSED!\n");
  } else {
    console.error(`✗ ${totalTests - totalPassed} tests failed!\n`);
  }

  await mongoose.disconnect();
  return { totalPassed, totalTests, allPassed: totalPassed === totalTests };
}

// Auto-execute if run directly
if (
  require.main === module ||
  process.argv[1]?.includes("test-superadmin-phase14")
) {
  runPhase14SuperadminTests()
    .then(({ allPassed }) => process.exit(allPassed ? 0 : 1))
    .catch((err) => {
      console.error("Test Suite Unhandled Exception:", err);
      process.exit(1);
    });
}
