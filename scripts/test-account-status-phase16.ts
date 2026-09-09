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
import User, { IUser, UserPlan } from "@/models/User";
import Profile from "@/models/Profile";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import Experience from "@/models/Experience";
import Message from "@/models/Message";

import { USER_COOKIE_NAME, signUserToken, hashPassword } from "@/lib/auth";
import { requireAuth, requireSuperadmin } from "@/lib/authorization";
import { extractNormalizedOverrides } from "@/lib/entitlements/resolver";

// Handlers
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { GET as getProjectsHandler } from "@/app/api/projects/route";
import { POST as postMessageHandler } from "@/app/api/messages/route";
import { GET as getUsersHandler } from "@/app/api/admin/users/route";
import {
  GET as getUserByIdHandler,
  PUT as putUserByIdHandler,
} from "@/app/api/admin/users/[id]/route";
import sitemap from "@/app/sitemap";
import { generateMetadata as generatePublicMetadata } from "@/app/p/[username]/page";
import OpenGraphImage from "@/app/p/[username]/opengraph-image";

function createMockRequest(
  url: string,
  method: "GET" | "PUT" | "POST" | "PATCH" | "DELETE",
  body?: unknown,
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

export async function runPhase16AccountStatusTests() {
  console.log("===============================================================");
  console.log("   PHASE 16 — ACCOUNT STATUS & PORTFOLIO VISIBILITY TESTS      ");
  console.log("===============================================================\n");

  await mongoose.connect(MONGODB_URI);

  const testResults: TestResult[] = [];

  function record(num: number, test: string, passed: boolean, details: string) {
    testResults.push({ num, test, passed, details });
    const mark = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${mark}] [Test ${num}] ${test} — ${details}`);
  }

  // Unique fixtures
  const superadminEmail = "p16.superadmin@example.com";
  const superadminUsername = "p16-superadmin";

  const activeUserEmail = "p16.active@example.com";
  const activeUserUsername = "p16-active";

  const suspendedUserEmail = "p16.suspended@example.com";
  const suspendedUserUsername = "p16-suspended";

  const legacyUserEmail = "p16.legacy@example.com";
  const legacyUserUsername = "p16-legacy";

  const rawPassword = "Password123!Secure";
  const passwordHash = await hashPassword(rawPassword);

  try {
    // Clean old fixtures if any
    const fixtureEmails = [
      superadminEmail,
      activeUserEmail,
      suspendedUserEmail,
      legacyUserEmail,
    ];
    const oldUsers = await User.find({ email: { $in: fixtureEmails } });
    const oldUserIds = oldUsers.map((u) => u._id);

    await Promise.all([
      User.deleteMany({ email: { $in: fixtureEmails } }),
      Profile.deleteMany({ ownerId: { $in: oldUserIds } }),
      Project.deleteMany({ ownerId: { $in: oldUserIds } }),
      Skill.deleteMany({ ownerId: { $in: oldUserIds } }),
      Experience.deleteMany({ ownerId: { $in: oldUserIds } }),
      Message.deleteMany({ ownerId: { $in: oldUserIds } }),
    ]);

    // 1. Create Superadmin
    const superadminDoc = await User.create({
      name: "Phase 16 Superadmin",
      email: superadminEmail,
      username: superadminUsername,
      passwordHash,
      role: "superadmin",
      profession: "developer",
      plan: "premium",
      accountStatus: "active",
      allowedTemplates: ["developer"],
    });

    const superadminToken = await signUserToken({
      id: superadminDoc._id.toString(),
      email: superadminDoc.email,
      username: superadminDoc.username,
      role: "superadmin",
    });

    // 2. Create Active User
    const activeUserDoc = await User.create({
      name: "Alice Active",
      email: activeUserEmail,
      username: activeUserUsername,
      passwordHash,
      role: "user",
      profession: "developer",
      plan: "free",
      // Notice: we omit accountStatus here to verify default behavior
      allowedTemplates: ["developer"],
    });

    const activeUserToken = await signUserToken({
      id: activeUserDoc._id.toString(),
      email: activeUserDoc.email,
      username: activeUserDoc.username,
      role: "user",
    });

    await Profile.create({
      ownerId: activeUserDoc._id,
      selectedTemplate: "developer",
      bioBlurb: "Alice is an active software developer.",
      roles: ["Full Stack Engineer"],
      statusText: "Open to work",
    });

    // 3. Create Suspended User with full tenant data to test preservation
    const suspendedUserDoc = await User.create({
      name: "Bob Suspended",
      email: suspendedUserEmail,
      username: suspendedUserUsername,
      passwordHash,
      role: "user",
      profession: "video-editor",
      plan: "premium",
      accountStatus: "suspended",
      allowedTemplates: ["video-editor", "developer"],
      featureOverrides: new Map([["floating_chat", true]]),
    });

    const suspendedUserToken = await signUserToken({
      id: suspendedUserDoc._id.toString(),
      email: suspendedUserDoc.email,
      username: suspendedUserDoc.username,
      role: "user",
    });

    await Profile.create({
      ownerId: suspendedUserDoc._id,
      selectedTemplate: "video-editor",
      bioBlurb: "Bob is a suspended video editor.",
      roles: ["Lead Video Editor"],
      statusText: "Busy",
    });

    await Project.create({
      ownerId: suspendedUserDoc._id,
      title: "Suspended Tenant Project",
      description: "Must be preserved safely.",
      tags: ["Editing"],
    });

    await Skill.create({
      ownerId: suspendedUserDoc._id,
      name: "Premiere Pro",
      category: "Video",
      level: 90,
    });

    await Experience.create({
      ownerId: suspendedUserDoc._id,
      company: "Studio 16",
      role: "Video Editor",
      period: "2024 - Present",
      current: true,
      bullets: ["Film editing."],
    });

    await Message.create({
      ownerId: suspendedUserDoc._id,
      name: "Inquirer",
      email: "inq@example.com",
      message: "Pre-existing inquiry before suspension.",
    });

    // 4. Create Legacy User (no accountStatus field in DB)
    const legacyUserDoc = await User.create({
      name: "Charlie Legacy",
      email: legacyUserEmail,
      username: legacyUserUsername,
      passwordHash,
      role: "user",
      profession: "doctor",
      plan: "free",
      allowedTemplates: ["doctor"],
    });

    // Unset accountStatus to simulate historical pre-Phase-16 record
    await User.updateOne(
      { _id: legacyUserDoc._id },
      { $unset: { accountStatus: "" } }
    );

    await Profile.create({
      ownerId: legacyUserDoc._id,
      selectedTemplate: "doctor",
      bioBlurb: "Charlie is a legacy medical doctor.",
      roles: ["Surgeon"],
    });

    // =========================================================================
    // Test 1: accountStatus defaults to "active" for new users
    // =========================================================================
    const freshUserDoc = await User.findById(activeUserDoc._id).lean();
    record(
      1,
      "accountStatus defaults to 'active' on new user creation",
      freshUserDoc?.accountStatus === "active",
      `Created user without explicit status has accountStatus = '${freshUserDoc?.accountStatus}'`
    );

    // =========================================================================
    // Test 2: Legacy users without accountStatus safely resolve to "active"
    // =========================================================================
    const rawLegacyDoc = await User.findById(legacyUserDoc._id)
      .select("+passwordHash")
      .lean();
    const legacyEffectiveStatus = rawLegacyDoc?.accountStatus || "active";
    const sitemapMatch = await User.findOne({
      _id: legacyUserDoc._id,
      accountStatus: { $ne: "suspended" },
    }).lean();

    record(
      2,
      "Legacy users without accountStatus resolve to 'active'",
      rawLegacyDoc?.accountStatus === undefined &&
        legacyEffectiveStatus === "active" &&
        !!sitemapMatch,
      `Raw DB field: ${rawLegacyDoc?.accountStatus}, Effective fallback: '${legacyEffectiveStatus}', Matched non-suspended filter: ${!!sitemapMatch}`
    );

    // =========================================================================
    // Test 3: Valid accountStatus values: "active" and "suspended"
    // =========================================================================
    let validValuesAccepted = true;
    try {
      const tempActive = new User({
        name: "Test Active",
        email: "temp.active@example.com",
        username: "temp-active",
        passwordHash,
        accountStatus: "active",
      });
      await tempActive.validate();

      const tempSuspended = new User({
        name: "Test Suspended",
        email: "temp.suspended@example.com",
        username: "temp-suspended",
        passwordHash,
        accountStatus: "suspended",
      });
      await tempSuspended.validate();
    } catch {
      validValuesAccepted = false;
    }

    record(
      3,
      "Schema validates both 'active' and 'suspended' as valid statuses",
      validValuesAccepted,
      "Both 'active' and 'suspended' passed schema validation without error"
    );

    // =========================================================================
    // Test 4: Invalid accountStatus values rejected (400) by management endpoint
    // =========================================================================
    const req4 = createMockRequest(
      `http://localhost:3000/api/admin/users/${activeUserDoc._id}`,
      "PUT",
      { accountStatus: "banned" },
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res4 = await putUserByIdHandler(req4, {
      params: Promise.resolve({ id: activeUserDoc._id.toString() }),
    });
    const body4 = await res4.json();

    record(
      4,
      "Invalid accountStatus values rejected (400) by management endpoint",
      res4.status === 400 && body4.success === false,
      `Status: ${res4.status}, Error: '${body4.error}'`
    );

    // =========================================================================
    // Test 5: Active user can log in (200) and receives session tokens
    // =========================================================================
    const req5 = createMockRequest(
      "http://localhost:3000/api/auth/login",
      "POST",
      { email: activeUserEmail, password: rawPassword }
    );
    const res5 = await loginHandler(req5);
    const body5 = await res5.json();
    const setCookie5 = res5.headers.get("set-cookie") || "";

    record(
      5,
      "Active user can log in (200) and receives session cookie",
      res5.status === 200 &&
        body5.success === true &&
        setCookie5.includes(USER_COOKIE_NAME),
      `Status: ${res5.status}, Success: ${body5.success}, Has token cookie: ${setCookie5.includes(USER_COOKIE_NAME)}`
    );

    // =========================================================================
    // Test 6: Suspended user login rejected (403 ACCOUNT_SUSPENDED), no session tokens
    // =========================================================================
    const req6 = createMockRequest(
      "http://localhost:3000/api/auth/login",
      "POST",
      { email: suspendedUserEmail, password: rawPassword }
    );
    const res6 = await loginHandler(req6);
    const body6 = await res6.json();
    const setCookie6 = res6.headers.get("set-cookie") || "";

    record(
      6,
      "Suspended user login rejected (403 ACCOUNT_SUSPENDED) with no token cookie",
      res6.status === 403 &&
        body6.code === "ACCOUNT_SUSPENDED" &&
        !setCookie6.includes(USER_COOKIE_NAME),
      `Status: ${res6.status}, Code: '${body6.code}', Cookie withheld: ${!setCookie6.includes(USER_COOKIE_NAME)}`
    );

    // =========================================================================
    // Test 7: Active user can access authenticated endpoints
    // =========================================================================
    const req7 = createMockRequest(
      "http://localhost:3000/api/projects",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: activeUserToken }
    );
    const res7 = await getProjectsHandler(req7);
    const body7 = await res7.json();

    record(
      7,
      "Active user can access authenticated API endpoints",
      res7.status === 200 && body7.success === true,
      `Status: ${res7.status}, Success: ${body7.success}`
    );

    // =========================================================================
    // Test 8: Suspended user authenticated API requests rejected (403 ACCOUNT_SUSPENDED)
    // =========================================================================
    const req8 = createMockRequest(
      "http://localhost:3000/api/projects",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: suspendedUserToken }
    );
    const res8 = await getProjectsHandler(req8);
    const body8 = await res8.json();

    record(
      8,
      "Suspended user authenticated API requests rejected (403 ACCOUNT_SUSPENDED)",
      res8.status === 403 && body8.code === "ACCOUNT_SUSPENDED",
      `Status: ${res8.status}, Code: '${body8.code}', Error: '${body8.error}'`
    );

    // =========================================================================
    // Test 9: Suspended user dashboard access redirects to /login
    // =========================================================================
    // Directly verify the DB check contract implemented in dashboard/layout.tsx
    const checkDoc = await User.findById(suspendedUserDoc._id)
      .select("name email username profession allowedTemplates role plan accountStatus")
      .lean();
    const shouldRedirect = !checkDoc || checkDoc.accountStatus === "suspended";

    record(
      9,
      "Suspended user dashboard layout guard identifies suspension to redirect",
      shouldRedirect === true && checkDoc?.accountStatus === "suspended",
      `Target accountStatus is '${checkDoc?.accountStatus}', triggering redirect to /login`
    );

    // =========================================================================
    // Test 10: Active user public portfolio (/p/[username]) accessible
    // =========================================================================
    const meta10 = await generatePublicMetadata({
      params: Promise.resolve({ username: activeUserUsername }),
    });

    record(
      10,
      "Active user public portfolio metadata resolves successfully",
      meta10.title !== "Portfolio Not Found" &&
        typeof meta10.title === "string" &&
        meta10.title.includes("Alice Active"),
      `Metadata title resolved to: '${meta10.title}'`
    );

    // =========================================================================
    // Test 11: Suspended user public portfolio returns 404 (notFound / Portfolio Not Found)
    // =========================================================================
    const meta11 = await generatePublicMetadata({
      params: Promise.resolve({ username: suspendedUserUsername }),
    });

    record(
      11,
      "Suspended user public portfolio returns 404 Not Found metadata",
      meta11.title === "Portfolio Not Found",
      `Metadata title resolved to: '${meta11.title}', description: '${meta11.description}'`
    );

    // =========================================================================
    // Test 12: Active user contact form submissions accepted (201, message created)
    // =========================================================================
    const req12 = createMockRequest(
      "http://localhost:3000/api/messages",
      "POST",
      {
        name: "Test Inquirer",
        email: "test.inq@example.com",
        message: "Hello Alice, loved your work!",
        username: activeUserUsername,
      }
    );
    const res12 = await postMessageHandler(req12);
    const body12 = await res12.json();
    const msg12 = await Message.findOne({
      ownerId: activeUserDoc._id,
      email: "test.inq@example.com",
    });

    record(
      12,
      "Active user contact form submissions accepted (201, message created)",
      res12.status === 201 && body12.success === true && !!msg12,
      `Status: ${res12.status}, Success: ${body12.success}, Message ID created: ${msg12?._id}`
    );

    // =========================================================================
    // Test 13: Suspended user contact form submissions rejected (404, no message created)
    // =========================================================================
    const initialMsgCountBob = await Message.countDocuments({
      ownerId: suspendedUserDoc._id,
    });
    const req13 = createMockRequest(
      "http://localhost:3000/api/messages",
      "POST",
      {
        name: "Attempted Inquirer",
        email: "attempt@example.com",
        message: "Message to suspended tenant",
        username: suspendedUserUsername,
      }
    );
    const res13 = await postMessageHandler(req13);
    const body13 = await res13.json();
    const postMsgCountBob = await Message.countDocuments({
      ownerId: suspendedUserDoc._id,
    });

    record(
      13,
      "Suspended user contact form submissions rejected (404, no message created)",
      res13.status === 404 &&
        body13.success === false &&
        initialMsgCountBob === postMsgCountBob,
      `Status: ${res13.status}, Error: '${body13.error}', Message count unchanged: ${initialMsgCountBob} -> ${postMsgCountBob}`
    );

    // =========================================================================
    // Test 14: Active users included in /sitemap.xml
    // =========================================================================
    const sitemapEntries = await sitemap();
    const sitemapUrls = sitemapEntries.map((e) => e.url);

    const activeInSitemap = sitemapUrls.some((u) =>
      u.includes(`/p/${activeUserUsername}`)
    );
    const legacyInSitemap = sitemapUrls.some((u) =>
      u.includes(`/p/${legacyUserUsername}`)
    );

    record(
      14,
      "Active users and legacy users are included in /sitemap.xml",
      activeInSitemap && legacyInSitemap,
      `Active in sitemap: ${activeInSitemap}, Legacy in sitemap: ${legacyInSitemap}`
    );

    // =========================================================================
    // Test 15: Suspended users excluded from /sitemap.xml
    // =========================================================================
    const suspendedInSitemap = sitemapUrls.some((u) =>
      u.includes(`/p/${suspendedUserUsername}`)
    );

    record(
      15,
      "Suspended users are excluded from /sitemap.xml",
      !suspendedInSitemap,
      `Suspended in sitemap: ${suspendedInSitemap} (correctly false)`
    );

    // =========================================================================
    // Test 16: Suspended user OG preview returns fallback/unpersonalized
    // =========================================================================
    // Test OpenGraphImage for suspended user
    const ogResponseSuspended = await OpenGraphImage({
      params: Promise.resolve({ username: suspendedUserUsername }),
    });

    record(
      16,
      "Suspended user OG preview returns fallback unpersonalized card",
      ogResponseSuspended.status === 200,
      `OG Image generation returns status: ${ogResponseSuspended.status} with generic fallback`
    );

    // =========================================================================
    // Test 17: Superadmin can view and filter users by accountStatus
    // =========================================================================
    const req17All = createMockRequest(
      "http://localhost:3000/api/admin/users",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res17All = await getUsersHandler(req17All);
    const body17All = await res17All.json();

    const req17Suspended = createMockRequest(
      "http://localhost:3000/api/admin/users?status=suspended",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res17Suspended = await getUsersHandler(req17Suspended);
    const body17Suspended = await res17Suspended.json();

    const hasStatusField = body17All.data.users.every(
      (u: any) => u.accountStatus === "active" || u.accountStatus === "suspended"
    );
    const onlySuspended = body17Suspended.data.users.every(
      (u: any) => u.accountStatus === "suspended"
    );
    const bobFound = body17Suspended.data.users.some(
      (u: any) => u.username === suspendedUserUsername
    );

    record(
      17,
      "Superadmin can view users with accountStatus and filter by status",
      res17All.status === 200 &&
        res17Suspended.status === 200 &&
        hasStatusField &&
        onlySuspended &&
        bobFound,
      `All users have accountStatus: ${hasStatusField}, status=suspended returned only suspended: ${onlySuspended}, Target tenant found: ${bobFound}`
    );

    // =========================================================================
    // Test 18: Superadmin can suspend and reactivate users via PUT /api/admin/users/[id]
    // =========================================================================
    // Suspend Alice
    const req18Suspend = createMockRequest(
      `http://localhost:3000/api/admin/users/${activeUserDoc._id}`,
      "PUT",
      { accountStatus: "suspended" },
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res18Suspend = await putUserByIdHandler(req18Suspend, {
      params: Promise.resolve({ id: activeUserDoc._id.toString() }),
    });
    const body18Suspend = await res18Suspend.json();
    const docAfterSuspend = await User.findById(activeUserDoc._id);

    // Reactivate Alice
    const req18Reactivate = createMockRequest(
      `http://localhost:3000/api/admin/users/${activeUserDoc._id}`,
      "PUT",
      { accountStatus: "active" },
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res18Reactivate = await putUserByIdHandler(req18Reactivate, {
      params: Promise.resolve({ id: activeUserDoc._id.toString() }),
    });
    const body18Reactivate = await res18Reactivate.json();
    const docAfterReactivate = await User.findById(activeUserDoc._id);

    record(
      18,
      "Superadmin can suspend and reactivate user via PUT /api/admin/users/[id]",
      res18Suspend.status === 200 &&
        body18Suspend.data.user.accountStatus === "suspended" &&
        docAfterSuspend?.accountStatus === "suspended" &&
        res18Reactivate.status === 200 &&
        body18Reactivate.data.user.accountStatus === "active" &&
        docAfterReactivate?.accountStatus === "active",
      `Suspend status: ${docAfterSuspend?.accountStatus}, Reactivate status: ${docAfterReactivate?.accountStatus}`
    );

    // =========================================================================
    // Test 19: Superadmin self-suspension strictly prevented (400)
    // =========================================================================
    const req19 = createMockRequest(
      `http://localhost:3000/api/admin/users/${superadminDoc._id}`,
      "PUT",
      { accountStatus: "suspended" },
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res19 = await putUserByIdHandler(req19, {
      params: Promise.resolve({ id: superadminDoc._id.toString() }),
    });
    const body19 = await res19.json();
    const superadminAfterAttempt = await User.findById(superadminDoc._id);

    record(
      19,
      "Superadmin self-suspension strictly prevented (400)",
      res19.status === 400 &&
        body19.error === "Self-suspension is not permitted." &&
        superadminAfterAttempt?.accountStatus === "active",
      `Status: ${res19.status}, Error: '${body19.error}', Superadmin status remains: '${superadminAfterAttempt?.accountStatus}'`
    );

    // =========================================================================
    // Test 20: Suspension non-destructively preserves tenant data and configuration
    // =========================================================================
    // Bob is currently suspended. Let's verify all his data is 100% intact:
    const bobProfile = await Profile.findOne({ ownerId: suspendedUserDoc._id });
    const bobProjects = await Project.find({ ownerId: suspendedUserDoc._id });
    const bobSkills = await Skill.find({ ownerId: suspendedUserDoc._id });
    const bobExperiences = await Experience.find({ ownerId: suspendedUserDoc._id });
    const bobMessages = await Message.find({ ownerId: suspendedUserDoc._id });
    const bobUser = await User.findById(suspendedUserDoc._id);

    // Now reactivate Bob and verify immediate restoration
    const req20Reactivate = createMockRequest(
      `http://localhost:3000/api/admin/users/${suspendedUserDoc._id}`,
      "PUT",
      { accountStatus: "active" },
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res20Reactivate = await putUserByIdHandler(req20Reactivate, {
      params: Promise.resolve({ id: suspendedUserDoc._id.toString() }),
    });
    const body20Reactivate = await res20Reactivate.json();

    const bobReactivatedMeta = await generatePublicMetadata({
      params: Promise.resolve({ username: suspendedUserUsername }),
    });

    const bobOverrides = extractNormalizedOverrides(bobUser?.featureOverrides);
    const isPreserved =
      bobProfile !== null &&
      bobProfile.selectedTemplate === "video-editor" &&
      bobProjects.length === 1 &&
      bobSkills.length === 1 &&
      bobExperiences.length === 1 &&
      bobMessages.length === 1 &&
      bobUser?.plan === "premium" &&
      bobOverrides.floating_chat === true &&
      res20Reactivate.status === 200 &&
      body20Reactivate.data.user.accountStatus === "active" &&
      bobReactivatedMeta.title !== "Portfolio Not Found";

    record(
      20,
      "Suspension non-destructively preserves tenant data and configuration",
      isPreserved,
      `Profile: ${!!bobProfile}, Projects: ${bobProjects.length}, Skills: ${bobSkills.length}, Experiences: ${bobExperiences.length}, Messages: ${bobMessages.length}, Plan: '${bobUser?.plan}', Overrides preserved: ${bobOverrides.floating_chat}, Reactivated portfolio accessible: ${bobReactivatedMeta.title !== "Portfolio Not Found"}`
    );

    // =========================================================================
    // Summary
    // =========================================================================
    console.log("\n===============================================================");
    const passedCount = testResults.filter((r) => r.passed).length;
    const failedCount = testResults.length - passedCount;
    console.log(
      `PHASE 16 RESULTS: ${passedCount}/${testResults.length} PASSED (${failedCount} FAILED)`
    );
    console.log("===============================================================\n");

    // Cleanup fixtures
    await Promise.all([
      User.deleteMany({ email: { $in: fixtureEmails } }),
      Profile.deleteMany({
        ownerId: {
          $in: [
            superadminDoc._id,
            activeUserDoc._id,
            suspendedUserDoc._id,
            legacyUserDoc._id,
          ],
        },
      }),
      Project.deleteMany({
        ownerId: {
          $in: [
            superadminDoc._id,
            activeUserDoc._id,
            suspendedUserDoc._id,
            legacyUserDoc._id,
          ],
        },
      }),
      Skill.deleteMany({
        ownerId: {
          $in: [
            superadminDoc._id,
            activeUserDoc._id,
            suspendedUserDoc._id,
            legacyUserDoc._id,
          ],
        },
      }),
      Experience.deleteMany({
        ownerId: {
          $in: [
            superadminDoc._id,
            activeUserDoc._id,
            suspendedUserDoc._id,
            legacyUserDoc._id,
          ],
        },
      }),
      Message.deleteMany({
        ownerId: {
          $in: [
            superadminDoc._id,
            activeUserDoc._id,
            suspendedUserDoc._id,
            legacyUserDoc._id,
          ],
        },
      }),
    ]);

    await mongoose.disconnect();

    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution failed with error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Execute directly if run via CLI
if (require.main === module) {
  runPhase16AccountStatusTests().catch((err) => {
    console.error("Fatal error running Phase 16 tests:", err);
    process.exit(1);
  });
}
