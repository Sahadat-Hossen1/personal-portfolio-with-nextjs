import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { POST as logoutHandler } from "@/app/api/auth/logout/route";
import { GET as meHandler } from "@/app/api/auth/me/route";
import { NextRequest } from "next/server";
import User from "@/models/User";
import Profile from "@/models/Profile";
import Admin from "@/models/Admin";
import { USER_COOKIE_NAME, ADMIN_COOKIE_NAME, verifyUserToken } from "@/lib/auth";

// Load environment
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio";

function createMockJsonRequest(url: string, body: Record<string, unknown>, cookies: Record<string, string> = {}) {
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: JSON.stringify(body),
  });
}

function createMockGetRequest(url: string, cookies: Record<string, string> = {}) {
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "GET",
    headers: {
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });
}

export async function runAuthTests() {
  console.log("=================================================");
  console.log("    PHASE 3: MULTI-USER AUTHENTICATION TESTS     ");
  console.log("=================================================");

  await mongoose.connect(MONGODB_URI);

  const testEmail1 = "test.developer@example.com";
  const testEmail2 = "test.developer2@example.com";
  const testPassword = "securePassword123";

  // Clean up any previous test artifacts
  await User.deleteMany({ email: { $in: [testEmail1, testEmail2] } });
  const orphanProfiles = await Profile.find({ email: { $in: [testEmail1, testEmail2] } });
  for (const p of orphanProfiles) {
    await Profile.findByIdAndDelete(p._id);
  }

  const testResults: { test: string; category: string; passed: boolean; details: string }[] = [];

  function record(category: string, test: string, passed: boolean, details: string) {
    testResults.push({ category, test, passed, details });
    const mark = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${mark}] ${category}: ${test} — ${details}`);
  }

  // ----------------------------------------------------
  // SECTION 1: REGISTRATION TESTS
  // ----------------------------------------------------
  console.log("\n--- Section 1: Registration Validation & Behavior ---");

  // 1. Invalid email
  {
    const req = createMockJsonRequest("http://localhost:3000/api/auth/register", {
      name: "Bad Email",
      email: "not-an-email",
      phone: "+1234567890",
      profession: "developer",
      password: testPassword,
    });
    const res = await registerHandler(req);
    const data = await res.json();
    record("Registration", "1. Reject invalid email", res.status === 400 && !data.success, `HTTP ${res.status}: ${data.error}`);
  }

  // 2. Invalid profession
  {
    const req = createMockJsonRequest("http://localhost:3000/api/auth/register", {
      name: "Bad Profession",
      email: "valid@example.com",
      phone: "+1234567890",
      profession: "astronaut",
      password: testPassword,
    });
    const res = await registerHandler(req);
    const data = await res.json();
    record("Registration", "2. Reject invalid profession", res.status === 400 && !data.success, `HTTP ${res.status}: ${data.error}`);
  }

  // 3. Short password
  {
    const req = createMockJsonRequest("http://localhost:3000/api/auth/register", {
      name: "Short Pass",
      email: "shortpass@example.com",
      phone: "+1234567890",
      profession: "developer",
      password: "123",
    });
    const res = await registerHandler(req);
    const data = await res.json();
    record("Registration", "3. Reject short password (< 6 chars)", res.status === 400 && !data.success, `HTTP ${res.status}: ${data.error}`);
  }

  // 4. Client cannot create superadmin or set premium plan
  let testUser1Id = "";
  let user1Cookie = "";
  {
    const req = createMockJsonRequest("http://localhost:3000/api/auth/register", {
      name: "Alex Dev",
      email: testEmail1,
      phone: "+8801711122233",
      profession: "developer",
      password: testPassword,
      role: "superadmin", // Malicious attempt to elevate
      plan: "premium",    // Malicious attempt to self-upgrade
    });
    const res = await registerHandler(req);
    const data = await res.json();
    const cookie = res.cookies.get(USER_COOKIE_NAME)?.value || "";
    user1Cookie = cookie;

    const userDoc = await User.findOne({ email: testEmail1 });
    testUser1Id = userDoc?._id?.toString() || "";

    const passed =
      res.status === 201 &&
      userDoc?.role === "user" &&
      userDoc?.plan === "free" &&
      !data.user?.passwordHash;

    record(
      "Registration",
      "4. Valid registration succeeds with server-enforced role='user' & plan='free'",
      passed,
      `Created user '${userDoc?.username}' with role='${userDoc?.role}', plan='${userDoc?.plan}'`
    );
  }

  // 5. Duplicate email rejection
  {
    const req = createMockJsonRequest("http://localhost:3000/api/auth/register", {
      name: "Alex Duplicate",
      email: testEmail1,
      phone: "+8801711122244",
      profession: "developer",
      password: testPassword,
    });
    const res = await registerHandler(req);
    const data = await res.json();
    record(
      "Registration",
      "5. Duplicate email rejected with 409 Conflict",
      res.status === 409 && !data.success,
      `HTTP ${res.status}: ${data.error}`
    );
  }

  // 6. Username collision handling
  {
    const req = createMockJsonRequest("http://localhost:3000/api/auth/register", {
      name: "Alex Dev", // Identical name -> should yield alex-dev-2
      email: testEmail2,
      phone: "+8801711122255",
      profession: "video-editor",
      password: testPassword,
    });
    const res = await registerHandler(req);
    const userDoc2 = await User.findOne({ email: testEmail2 });
    const passed = res.status === 201 && userDoc2?.username === "alex-dev-2";
    record(
      "Registration",
      "6. Username collision resolved deterministically",
      passed,
      `Second user received slug: '${userDoc2?.username}'`
    );
  }

  // 7. Profile creation & atomicity check
  {
    const profile = await Profile.findOne({ ownerId: testUser1Id });
    const passed =
      !!profile &&
      profile.ownerId?.toString() === testUser1Id &&
      profile.name === "Alex Dev" &&
      profile.roles.length === 0 &&
      profile.stats.length === 0 &&
      profile.bioBlurb === "" &&
      profile.selectedTemplate === "developer";

    record(
      "Registration",
      "7. Clean Profile root created with matching ownerId and ZERO fake content",
      passed,
      `Profile ID: ${profile?._id}, ownerId matches User, roles=[], stats=[], bio=''`
    );
  }

  // ----------------------------------------------------
  // SECTION 2: LOGIN & SESSION TESTS
  // ----------------------------------------------------
  console.log("\n--- Section 2: Login & Session Authentication ---");

  // 8. Invalid password fails generically
  {
    const req = createMockJsonRequest("http://localhost:3000/api/auth/login", {
      email: testEmail1,
      password: "WrongPassword999",
    });
    const res = await loginHandler(req);
    const data = await res.json();
    record(
      "Login",
      "8. Invalid password rejected with generic 401",
      res.status === 401 && data.error === "Invalid email or password.",
      `HTTP ${res.status}: ${data.error}`
    );
  }

  // 9. Nonexistent email fails generically
  {
    const req = createMockJsonRequest("http://localhost:3000/api/auth/login", {
      email: "nobody@doesnotexist.com",
      password: "somePassword",
    });
    const res = await loginHandler(req);
    const data = await res.json();
    record(
      "Login",
      "9. Nonexistent email rejected with identical generic 401",
      res.status === 401 && data.error === "Invalid email or password.",
      `HTTP ${res.status}: ${data.error}`
    );
  }

  // 10. Valid user login succeeds & sets cookie without passwordHash
  let loggedInUserCookie = "";
  {
    const req = createMockJsonRequest("http://localhost:3000/api/auth/login", {
      email: testEmail1,
      password: testPassword,
    });
    const res = await loginHandler(req);
    const data = await res.json();
    loggedInUserCookie = res.cookies.get(USER_COOKIE_NAME)?.value || "";
    const hasAdminCookie = !!res.cookies.get(ADMIN_COOKIE_NAME);

    const passed =
      res.status === 200 &&
      data.success === true &&
      !data.user?.passwordHash &&
      data.user?.email === testEmail1 &&
      !!loggedInUserCookie &&
      !hasAdminCookie; // Normal user MUST NOT receive portfolio_admin_token

    record(
      "Login",
      "10. Valid user credentials issue User cookie (no passwordHash, no admin token)",
      passed,
      `User token issued. Legacy admin cookie present: ${hasAdminCookie}`
    );
  }

  // 11. Session resolution (/api/auth/me)
  {
    const req = createMockGetRequest("http://localhost:3000/api/auth/me", {
      [USER_COOKIE_NAME]: loggedInUserCookie,
    });
    const res = await meHandler(req);
    const data = await res.json();
    const passed =
      res.status === 200 &&
      data.authenticated === true &&
      data.user?.email === testEmail1 &&
      data.user?.role === "user";

    record(
      "Session",
      "11. Valid session resolves typed User identity via /api/auth/me",
      passed,
      `Authenticated: ${data.authenticated}, User: ${data.user?.username} (${data.user?.role})`
    );
  }

  // 12. Invalid/expired token returns 401
  {
    const req = createMockGetRequest("http://localhost:3000/api/auth/me", {
      [USER_COOKIE_NAME]: "invalid.fake.jwt.token",
    });
    const res = await meHandler(req);
    const data = await res.json();
    record(
      "Session",
      "12. Invalid JWT token returns unauthenticated (401)",
      res.status === 401 && data.authenticated === false,
      `HTTP ${res.status}: authenticated=${data.authenticated}`
    );
  }

  // ----------------------------------------------------
  // SECTION 3: LOGOUT TESTS
  // ----------------------------------------------------
  console.log("\n--- Section 3: Logout Behavior ---");

  // 13. Logout clears user cookie and preserves admin cookie
  {
    const res = await logoutHandler();
    const userCookieSet = res.cookies.get(USER_COOKIE_NAME);
    const adminCookieSet = res.cookies.get(ADMIN_COOKIE_NAME);

    const passed =
      userCookieSet?.maxAge === 0 &&
      userCookieSet?.value === "" &&
      adminCookieSet === undefined;

    record(
      "Logout",
      "13. Logout clears portfolio_user_token while preserving portfolio_admin_token",
      passed,
      `User cookie maxAge: ${userCookieSet?.maxAge}, Admin cookie touched: ${!!adminCookieSet}`
    );
  }

  // ----------------------------------------------------
  // SECTION 4: EXISTING SUPERADMIN COMPATIBILITY
  // ----------------------------------------------------
  console.log("\n--- Section 4: Existing Superadmin Compatibility ---");

  // 14. Migrated Superadmin login through User login endpoint
  {
    // Superadmin has username 'admin' and password 'admin123'
    const req = createMockJsonRequest("http://localhost:3000/api/auth/login", {
      username: "admin",
      password: "admin123",
    });
    const res = await loginHandler(req);
    const data = await res.json();
    const superadminUserToken = res.cookies.get(USER_COOKIE_NAME)?.value;
    const superadminAdminToken = res.cookies.get(ADMIN_COOKIE_NAME)?.value;

    const passed =
      res.status === 200 &&
      data.success === true &&
      data.user?.role === "superadmin" &&
      !!superadminUserToken &&
      !!superadminAdminToken; // Superadmin receives both for seamless transition

    record(
      "Superadmin",
      "14. Migrated Superadmin logs in via User login with role='superadmin'",
      passed,
      `User: '${data.user?.username}', Role: '${data.user?.role}', Admin token attached: ${!!superadminAdminToken}`
    );
  }

  // 15. Legacy Admin document remains intact in MongoDB
  {
    const legacyAdmin = await Admin.findOne({ username: "admin" });
    record(
      "Superadmin",
      "15. Legacy Admin record intact in MongoDB",
      !!legacyAdmin && !!legacyAdmin.passwordHash,
      `Found Admin '${legacyAdmin?.username}' with role='${legacyAdmin?.role}'`
    );
  }

  // ----------------------------------------------------
  // CLEANUP TEST DATA
  // ----------------------------------------------------
  console.log("\n--- Cleaning Up Temporary Test Documents ---");
  await User.deleteMany({ email: { $in: [testEmail1, testEmail2] } });
  const cleanedProfiles = await Profile.deleteMany({ email: { $in: [testEmail1, testEmail2] } });
  console.log(`✓ Cleaned up test users and ${cleanedProfiles.deletedCount} test profiles.`);

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log("\n=================================================");
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

  const allPassed = testResults.every((r) => r.passed);
  if (allPassed) {
    console.log("\n✓ ALL 15 PHASE 3 AUTHENTICATION TESTS PASSED!");
  } else {
    console.error("\n❌ SOME TESTS FAILED!");
  }

  await mongoose.disconnect();
  return { allPassed, testResults };
}

if (require.main === module) {
  runAuthTests()
    .then(({ allPassed }) => process.exit(allPassed ? 0 : 1))
    .catch((err) => {
      console.error("Test execution error:", err);
      process.exit(1);
    });
}
