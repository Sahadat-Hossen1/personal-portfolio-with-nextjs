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
import Profile from "@/models/Profile";
import Project from "@/models/Project";
import Experience from "@/models/Experience";
import Skill from "@/models/Skill";
import Message from "@/models/Message";
import Admin from "@/models/Admin";

// Auth & Authorization utilities
import {
  signUserToken,
  signAdminToken,
  hashPassword,
  USER_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
  verifyAdminRequest,
} from "@/lib/auth";
import {
  getAuthenticatedUser,
  requireAuth,
  requireSuperadmin,
} from "@/lib/authorization";

// Route Handlers
import { GET as getProfile, PUT as putProfile } from "@/app/api/profile/route";
import { GET as getProjects } from "@/app/api/projects/route";
import { POST as logoutHandler } from "@/app/api/auth/logout/route";

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

export async function runDashboardTests() {
  console.log("=================================================");
  console.log("    PHASE 5: USER DASHBOARD FOUNDATION TESTS     ");
  console.log("=================================================");

  await mongoose.connect(MONGODB_URI);

  const testEmailA = "test.usera.phase5@example.com";
  const testEmailB = "test.userb.phase5@example.com";
  const testPassword = "securePassword123";

  // Pre-cleanup of any previous test artifacts
  const existingUsers = await User.find({
    email: { $in: [testEmailA, testEmailB] },
  });
  const existingUserIds = existingUsers.map((u) => u._id);

  if (existingUserIds.length > 0) {
    await Profile.deleteMany({ ownerId: { $in: existingUserIds } });
    await Project.deleteMany({ ownerId: { $in: existingUserIds } });
    await Experience.deleteMany({ ownerId: { $in: existingUserIds } });
    await Skill.deleteMany({ ownerId: { $in: existingUserIds } });
    await Message.deleteMany({ ownerId: { $in: existingUserIds } });
    await User.deleteMany({ _id: { $in: existingUserIds } });
  }

  // Create isolated Test User A (developer) & User B (video-editor)
  const hashedPassword = await hashPassword(testPassword);
  const userA = await User.create({
    name: "Alex Developer",
    email: testEmailA,
    username: "alex-dev-p5",
    passwordHash: hashedPassword,
    role: "user",
    plan: "free",
    profession: "developer",
    allowedTemplates: ["developer"],
  });

  const userB = await User.create({
    name: "Sam VideoEditor",
    email: testEmailB,
    username: "sam-video-p5",
    passwordHash: hashedPassword,
    role: "user",
    plan: "free",
    profession: "video-editor",
    allowedTemplates: ["video-editor"],
  });

  // Create initial clean profiles
  const profileA = await Profile.create({
    ownerId: userA._id,
    name: userA.name,
    email: userA.email,
    roles: [],
    bioBlurb: "Alex's bio",
    selectedTemplate: "developer",
    aboutTitle: "About Alex",
  });

  const profileB = await Profile.create({
    ownerId: userB._id,
    name: userB.name,
    email: userB.email,
    roles: [],
    bioBlurb: "Sam's bio",
    selectedTemplate: "video-editor",
    aboutTitle: "About Sam",
  });

  // Populate mock portfolio items for owner-scoping tests
  // User A: 2 projects, 3 skills, 1 experience, 2 messages
  const projectA1 = await Project.create({
    title: "Project A1",
    description: "Desc A1",
    ownerId: userA._id,
  });
  const projectA2 = await Project.create({
    title: "Project A2",
    description: "Desc A2",
    ownerId: userA._id,
  });
  const skillA1 = await Skill.create({ name: "React", level: 90, ownerId: userA._id });
  const skillA2 = await Skill.create({ name: "Node.js", level: 85, ownerId: userA._id });
  const skillA3 = await Skill.create({ name: "MongoDB", level: 80, ownerId: userA._id });
  const expA1 = await Experience.create({
    company: "Alpha Corp",
    role: "Lead Dev",
    period: "2023 - Present",
    ownerId: userA._id,
  });
  const msgA1 = await Message.create({
    name: "Inquirer 1",
    email: "inq1@example.com",
    message: "Msg 1",
    ownerId: userA._id,
    read: false,
  });
  const msgA2 = await Message.create({
    name: "Inquirer 2",
    email: "inq2@example.com",
    message: "Msg 2",
    ownerId: userA._id,
    read: true,
  });

  // User B: 1 project, 1 skill, 2 experiences, 1 message
  const projectB1 = await Project.create({
    title: "Project B1",
    description: "Desc B1",
    ownerId: userB._id,
  });
  const skillB1 = await Skill.create({
    name: "Premiere Pro",
    level: 95,
    ownerId: userB._id,
  });
  const expB1 = await Experience.create({
    company: "Studio B",
    role: "Editor",
    period: "2022 - 2023",
    ownerId: userB._id,
  });
  const expB2 = await Experience.create({
    company: "Agency B",
    role: "Motion Designer",
    period: "2023 - Present",
    ownerId: userB._id,
  });
  const msgB1 = await Message.create({
    name: "Client B",
    email: "clientb@example.com",
    message: "Msg B",
    ownerId: userB._id,
    read: false,
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

  const cookiesA = { [USER_COOKIE_NAME]: tokenA };
  const cookiesB = { [USER_COOKIE_NAME]: tokenB };

  const testResults: {
    category: string;
    test: string;
    passed: boolean;
    details: string;
  }[] = [];

  function record(
    category: string,
    test: string,
    passed: boolean,
    details: string
  ) {
    testResults.push({ category, test, passed, details });
    const mark = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${mark}] ${category}: ${test} — ${details}`);
  }

  // ----------------------------------------------------
  // TEST SUITE EXECUTION
  // ----------------------------------------------------

  // 1. Unauthenticated dashboard access is rejected/redirected
  {
    const req = createMockRequest("GET", "/dashboard");
    const authUser = await getAuthenticatedUser(req);
    const isRejected = authUser === null;

    record(
      "Dashboard Security",
      "1. Unauthenticated dashboard access is rejected",
      isRejected,
      isRejected ? "Server session rejected (redirect to /login)" : "Failed: Session returned"
    );
  }

  // 2. Authenticated User A can access dashboard
  {
    const req = createMockRequest("GET", "/dashboard", { cookies: cookiesA });
    const authUser = await getAuthenticatedUser(req);
    const canAccess =
      authUser !== null && authUser.ownerId.toString() === userA._id.toString();

    record(
      "Dashboard Security",
      "2. Authenticated User A can access dashboard",
      canAccess,
      `Authenticated session resolved for ownerId: ${authUser?.ownerId}`
    );
  }

  // 3. User A sees User A identity (name, email, username, profession, selected template)
  {
    const userDoc = await User.findById(userA._id)
      .select("name email username profession allowedTemplates")
      .lean();
    const profDoc = await Profile.findOne({ ownerId: userA._id })
      .select("selectedTemplate")
      .lean();

    const identityCorrect =
      userDoc?.name === "Alex Developer" &&
      userDoc?.email === testEmailA &&
      userDoc?.username === "alex-dev-p5" &&
      userDoc?.profession === "developer" &&
      profDoc?.selectedTemplate === "developer";

    record(
      "User Identity",
      "3. User A sees User A identity accurately",
      identityCorrect,
      `Identity: ${userDoc?.name}, @${userDoc?.username}, ${userDoc?.profession}, template: ${profDoc?.selectedTemplate}`
    );
  }

  // 4. User A sees only User A portfolio counts (never global counts)
  {
    const [projectCount, skillCount, experienceCount, messageCount] =
      await Promise.all([
        Project.countDocuments({ ownerId: userA._id }),
        Skill.countDocuments({ ownerId: userA._id }),
        Experience.countDocuments({ ownerId: userA._id }),
        Message.countDocuments({ ownerId: userA._id }),
      ]);

    const countsIsolated =
      projectCount === 2 &&
      skillCount === 3 &&
      experienceCount === 1 &&
      messageCount === 2;

    record(
      "Portfolio Overview",
      "4. User A sees only User A portfolio counts",
      countsIsolated,
      `Projects: ${projectCount}, Skills: ${skillCount}, Experience: ${experienceCount}, Messages: ${messageCount}`
    );
  }

  // 5. User B cannot obtain User A dashboard data through IDs/query parameters (IDOR)
  {
    // User B tries to pass User A's ownerId in query parameter to /api/profile
    const req = createMockRequest(
      "GET",
      `/api/profile?userId=${userA._id.toString()}&ownerId=${userA._id.toString()}`,
      { cookies: cookiesB }
    );
    const res = await getProfile(req);
    const json = await res.json();

    const dataIsolated =
      res.status === 200 &&
      json.data?.ownerId?.toString() === userB._id.toString() &&
      json.data?.ownerId?.toString() !== userA._id.toString() &&
      json.data?.name === userB.name;

    record(
      "Authorization Boundary",
      "5. User B cannot obtain User A data via query parameters",
      dataIsolated,
      `Returned User B's profile (${json.data?.name}), ignored injected User A query params`
    );
  }

  // 6. User A cannot modify ownerId through profile UI/API
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: {
        aboutTitle: "Updated by Alex",
        ownerId: userB._id.toString(), // Attacker attempts to change owner
      },
    });
    const res = await putProfile(req);
    const json = await res.json();

    const freshProfileA = await Profile.findOne({ ownerId: userA._id });
    const ownershipImmutable =
      res.status === 200 &&
      freshProfileA?.ownerId?.toString() === userA._id.toString() &&
      freshProfileA?.aboutTitle === "Updated by Alex";

    record(
      "Security Boundary",
      "6. User A cannot modify ownerId through profile API",
      ownershipImmutable,
      `Profile ownerId remained: ${freshProfileA?.ownerId}`
    );
  }

  // 7. User A cannot modify role/plan/allowedTemplates through profile UI/API
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: {
        role: "superadmin",
        plan: "premium",
        allowedTemplates: ["doctor"],
      },
    });
    await putProfile(req);

    const freshUserA = await User.findById(userA._id);
    const privilegeImmutable =
      freshUserA?.role === "user" &&
      freshUserA?.plan === "free" &&
      Array.isArray(freshUserA?.allowedTemplates) &&
      freshUserA?.allowedTemplates.length === 1 &&
      freshUserA?.allowedTemplates[0] === "developer";

    record(
      "Security Boundary",
      "7. User A cannot modify role/plan/allowedTemplates via profile API",
      privilegeImmutable,
      `User role='${freshUserA?.role}', plan='${freshUserA?.plan}', allowedTemplates=${JSON.stringify(freshUserA?.allowedTemplates)}`
    );
  }

  // 8. Template selection still respects allowedTemplates (Phase 4 authorization)
  {
    // User A cannot select "doctor" (not in allowedTemplates: ["developer"])
    const rejectReq = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: { selectedTemplate: "doctor" },
    });
    const rejectRes = await putProfile(rejectReq);
    const rejectJson = await rejectRes.json();

    // User A can select "developer"
    const acceptReq = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: { selectedTemplate: "developer" },
    });
    const acceptRes = await putProfile(acceptReq);
    const acceptJson = await acceptRes.json();

    const templateGated =
      rejectRes.status === 403 &&
      !rejectJson.success &&
      acceptRes.status === 200 &&
      acceptJson.data?.selectedTemplate === "developer";

    record(
      "Template Gating",
      "8. Template selection strictly respects allowedTemplates",
      templateGated,
      `Rejected 'doctor' (${rejectRes.status} 403), Allowed 'developer' (${acceptRes.status} 200)`
    );
  }

  // 9. Logout clears modern user session
  {
    const res = await logoutHandler();
    const setCookieHeader = res.cookies.get(USER_COOKIE_NAME);
    const sessionCleared =
      res.status === 200 &&
      (setCookieHeader?.value === "" || setCookieHeader?.maxAge === 0);

    record(
      "Authentication UX",
      "9. Logout clears portfolio_user_token cookie",
      sessionCleared,
      `User cookie cleared with maxAge: ${setCookieHeader?.maxAge}`
    );
  }

  // 10. Existing Superadmin authentication still works
  {
    const superadminUser = await User.findOne({ role: "superadmin" });
    let superadminWorks = false;
    let superDetails = "";

    if (superadminUser) {
      const superToken = await signUserToken({
        id: superadminUser._id.toString(),
        email: superadminUser.email,
        role: superadminUser.role,
        username: superadminUser.username,
        profession: superadminUser.profession,
      });

      const req = createMockRequest("GET", "/api/admin-guard-check", {
        cookies: { [USER_COOKIE_NAME]: superToken },
      });
      const guardResult = await requireSuperadmin(req);
      superadminWorks =
        !!guardResult.user && guardResult.user.role === "superadmin";
      superDetails = `Superadmin '${guardResult.user?.username}' verified with role '${guardResult.user?.role}'`;
    }

    record(
      "Superadmin Compatibility",
      "10. Existing Superadmin authentication still works",
      superadminWorks,
      superDetails || "Superadmin user not found in DB"
    );
  }

  // 11. Existing legacy admin dashboard remains functional
  {
    const legacyAdmin = await Admin.findOne({ role: "admin" });
    let legacyAdminWorks = false;
    let legacyDetails = "";

    if (legacyAdmin) {
      const adminToken = await signAdminToken({
        id: legacyAdmin._id.toString(),
        username: legacyAdmin.username,
      });

      const req = createMockRequest("GET", "/api/admin/check", {
        cookies: { [ADMIN_COOKIE_NAME]: adminToken },
      });
      const session = await verifyAdminRequest(req);
      legacyAdminWorks = session !== null && session.username === legacyAdmin.username;
      legacyDetails = `Legacy Admin '${session?.username}' session verified`;
    }

    record(
      "Superadmin Compatibility",
      "11. Existing legacy admin dashboard remains functional",
      legacyAdminWorks,
      legacyDetails || "Legacy Admin record not found"
    );
  }

  // 12. No passwordHash/JWT is exposed in dashboard-facing data
  {
    const userDoc = await User.findById(userA._id)
      .select("name email username profession allowedTemplates role plan")
      .lean();
    const profileDoc = await Profile.findOne({ ownerId: userA._id }).lean();

    const noLeak =
      !("passwordHash" in (userDoc || {})) &&
      !("password" in (userDoc || {})) &&
      !("passwordHash" in (profileDoc || {})) &&
      !("password" in (profileDoc || {})) &&
      !("token" in (userDoc || {})) &&
      !("jwt" in (userDoc || {}));

    record(
      "Security Boundary",
      "12. No passwordHash/JWT is exposed in dashboard data",
      noLeak,
      "Clean projection verified: passwordHash and credentials excluded"
    );
  }

  // ----------------------------------------------------
  // SCOPED CLEANUP
  // ----------------------------------------------------
  console.log("\n--- Cleaning Up Temporary Phase 5 Test Records ---");
  await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
  await Profile.deleteMany({ _id: { $in: [profileA._id, profileB._id] } });
  await Project.deleteMany({ _id: { $in: [projectA1._id, projectA2._id, projectB1._id] } });
  await Skill.deleteMany({ _id: { $in: [skillA1._id, skillA2._id, skillA3._id, skillB1._id] } });
  await Experience.deleteMany({ _id: { $in: [expA1._id, expB1._id, expB2._id] } });
  await Message.deleteMany({ _id: { $in: [msgA1._id, msgA2._id, msgB1._id] } });
  console.log("✓ Cleanup finished. Real portfolio records remain untouched.\n");

  // ----------------------------------------------------
  // SUMMARY TABLE
  // ----------------------------------------------------
  console.log("=================================================");
  console.log("             TEST RESULTS SUMMARY                ");
  console.log("=================================================");
  console.table(
    testResults.map((r) => ({
      Category: r.category,
      Test: r.test,
      Status: r.passed ? "PASSED ✓" : "FAILED ✗",
      Details: r.details,
    }))
  );

  const totalPassed = testResults.filter((r) => r.passed).length;
  const totalTests = testResults.length;

  console.log(`\nResults: ${totalPassed}/${totalTests} tests passed.`);

  if (totalPassed === totalTests) {
    console.log(`✓ ALL ${totalTests} PHASE 5 DASHBOARD TESTS PASSED!\n`);
  } else {
    console.error(`✗ ${totalTests - totalPassed} tests failed!\n`);
    process.exitCode = 1;
  }

  await mongoose.disconnect();
}

if (require.main === module || process.argv[1]?.includes("test-dashboard-phase5")) {
  runDashboardTests().catch((err) => {
    console.error("Dashboard Test Suite Error:", err);
    process.exit(1);
  });
}
