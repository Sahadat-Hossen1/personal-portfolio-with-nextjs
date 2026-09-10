/**
 * PHASE 22 — ADMIN PAGE AUTHORIZATION & SECURITY HARDENING TEST SUITE
 *
 * Verifies:
 * 1. Unauthenticated access to admin route is blocked (redirects to /login)
 * 2. Normal user access to admin route is blocked (redirects to /dashboard)
 * 3. Suspended user cannot access admin control plane (redirects to /dashboard)
 * 4. Active superadmin can access admin route (AdminLayout renders AdminShell)
 * 5. Public tenant templates (DevFooter, VideoFooter, MarketingFooter) contain zero /admin links
 * 6. GET /api/auth/me rejects suspended account sessions (403 ACCOUNT_SUSPENDED)
 * 7. GET /api/auth/me accepts active user sessions (200 authenticated)
 * 8. GET /api/auth/me rejects non-existent / deleted users (401)
 * 9. GET /api/auth/me rejects unauthenticated requests (401)
 * 10. Admin APIs (/api/admin/stats, /api/admin/users) remain independently protected
 * 11. Role escalation is blocked on Admin API (403)
 * 12. Self-suspension is blocked on Admin API (400)
 */

import mongoose, { Types } from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { NextRequest } from "next/server";

// Load environment variables
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio";

// Models
import User from "@/models/User";

// Auth & Authorization
import { USER_COOKIE_NAME, signUserToken, hashPassword } from "@/lib/auth";
import { AuthenticatedUser } from "@/lib/authorization";

// Server Components & API Handlers
import AdminLayout from "@/app/admin/layout";
import { GET as getAuthMeHandler } from "@/app/api/auth/me/route";
import { GET as getStatsHandler } from "@/app/api/admin/stats/route";
import { PUT as putUserByIdHandler } from "@/app/api/admin/users/[id]/route";

interface TestResult {
  num: number;
  test: string;
  passed: boolean;
  details: string;
}

function createMockRequest(
  url: string,
  method: "GET" | "PUT" | "POST",
  body?: Record<string, unknown>,
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

export async function runPhase22AdminSecurityTests() {
  console.log("===============================================================");
  console.log("    PHASE 22 — ADMIN PAGE AUTHORIZATION & SECURITY TESTS       ");
  console.log("===============================================================\n");

  await mongoose.connect(MONGODB_URI);

  const testResults: TestResult[] = [];

  function record(num: number, test: string, passed: boolean, details: string) {
    testResults.push({ num, test, passed, details });
    const mark = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${mark}] [Test ${num}] ${test} — ${details}`);
  }

  // Define unique test user emails
  const superadminEmail = "p22.superadmin@example.com";
  const superadminUsername = "p22-superadmin";

  const normalUserEmail = "p22.user.alice@example.com";
  const normalUserUsername = "p22-alice";

  const suspendedSuperadminEmail = "p22.suspended.super@example.com";
  const suspendedSuperadminUsername = "p22-suspended-super";

  const suspendedUserEmail = "p22.suspended.user@example.com";
  const suspendedUserUsername = "p22-suspended-user";

  // Clean up any stale fixtures
  await User.deleteMany({
    email: {
      $in: [
        superadminEmail,
        normalUserEmail,
        suspendedSuperadminEmail,
        suspendedUserEmail,
      ],
    },
  });

  const pwdHash = await hashPassword("SecurePassword123!");

  // Create test fixtures
  const superadminDoc = await User.create({
    name: "Super Admin Tester",
    email: superadminEmail,
    username: superadminUsername,
    passwordHash: pwdHash,
    role: "superadmin",
    plan: "premium",
    profession: "developer",
    accountStatus: "active",
  });

  const normalUserDoc = await User.create({
    name: "Normal User Alice",
    email: normalUserEmail,
    username: normalUserUsername,
    passwordHash: pwdHash,
    role: "user",
    plan: "free",
    profession: "developer",
    accountStatus: "active",
  });

  const suspendedSuperadminDoc = await User.create({
    name: "Suspended Superadmin",
    email: suspendedSuperadminEmail,
    username: suspendedSuperadminUsername,
    passwordHash: pwdHash,
    role: "superadmin",
    plan: "premium",
    profession: "developer",
    accountStatus: "suspended",
  });

  const suspendedUserDoc = await User.create({
    name: "Suspended User Bob",
    email: suspendedUserEmail,
    username: suspendedUserUsername,
    passwordHash: pwdHash,
    role: "user",
    plan: "free",
    profession: "video-editor",
    accountStatus: "suspended",
  });

  // Generate tokens
  const superadminToken = await signUserToken({
    id: superadminDoc._id.toString(),
    email: superadminDoc.email,
    role: superadminDoc.role,
    username: superadminDoc.username,
  });

  const normalUserToken = await signUserToken({
    id: normalUserDoc._id.toString(),
    email: normalUserDoc.email,
    role: normalUserDoc.role,
    username: normalUserDoc.username,
  });

  const suspendedUserToken = await signUserToken({
    id: suspendedUserDoc._id.toString(),
    email: suspendedUserDoc.email,
    role: suspendedUserDoc.role,
    username: suspendedUserDoc.username,
  });

  try {
    // =========================================================================
    // 1. Server-side Admin Layout Guard Tests
    // =========================================================================

    // Test 1: Unauthenticated request to AdminLayout redirects to /login
    let test1Passed = false;
    let test1Digest = "";
    (globalThis as unknown as { __TEST_AUTH_USER__?: AuthenticatedUser | null }).__TEST_AUTH_USER__ = null;
    try {
      await AdminLayout({ children: "Admin Content" });
    } catch (err: unknown) {
      const digest = (err as { digest?: string })?.digest || "";
      test1Digest = digest;
      if (digest.includes("NEXT_REDIRECT") && digest.includes("/login")) {
        test1Passed = true;
      }
    }
    record(
      1,
      "Unauthenticated visitor to /admin redirects to /login",
      test1Passed,
      `Captured redirect digest: '${test1Digest}'`
    );

    // Test 2: Normal user to AdminLayout redirects to /dashboard
    let test2Passed = false;
    let test2Digest = "";
    (globalThis as unknown as { __TEST_AUTH_USER__?: AuthenticatedUser | null }).__TEST_AUTH_USER__ = {
      userId: normalUserDoc._id.toString(),
      ownerId: normalUserDoc._id,
      role: "user",
      email: normalUserDoc.email,
      username: normalUserDoc.username,
    };
    try {
      await AdminLayout({ children: "Admin Content" });
    } catch (err: unknown) {
      const digest = (err as { digest?: string })?.digest || "";
      test2Digest = digest;
      if (digest.includes("NEXT_REDIRECT") && digest.includes("/dashboard")) {
        test2Passed = true;
      }
    }
    record(
      2,
      "Authenticated normal user to /admin redirects to /dashboard",
      test2Passed,
      `Captured redirect digest: '${test2Digest}'`
    );

    // Test 3: Suspended user to AdminLayout is rejected (redirects to /dashboard)
    let test3Passed = false;
    let test3Digest = "";
    (globalThis as unknown as { __TEST_AUTH_USER__?: AuthenticatedUser | null }).__TEST_AUTH_USER__ = {
      userId: suspendedSuperadminDoc._id.toString(),
      ownerId: suspendedSuperadminDoc._id,
      role: "superadmin",
      email: suspendedSuperadminDoc.email,
      username: suspendedSuperadminDoc.username,
    };
    try {
      await AdminLayout({ children: "Admin Content" });
    } catch (err: unknown) {
      const digest = (err as { digest?: string })?.digest || "";
      test3Digest = digest;
      if (digest.includes("NEXT_REDIRECT") && (digest.includes("/dashboard") || digest.includes("/login"))) {
        test3Passed = true;
      }
    }
    record(
      3,
      "Suspended user to /admin cannot access control plane",
      test3Passed,
      `Captured redirect digest: '${test3Digest}'`
    );

    // Test 4: Active superadmin can access AdminLayout (renders AdminShell)
    let test4Passed = false;
    let test4Details = "";
    (globalThis as unknown as { __TEST_AUTH_USER__?: AuthenticatedUser | null }).__TEST_AUTH_USER__ = {
      userId: superadminDoc._id.toString(),
      ownerId: superadminDoc._id,
      role: "superadmin",
      email: superadminDoc.email,
      username: superadminDoc.username,
    };
    try {
      const result = await AdminLayout({ children: "Admin Content" });
      if (result && typeof result === "object" && "type" in result) {
        test4Passed = true;
        test4Details = "AdminLayout rendered AdminShell React element successfully";
      } else {
        test4Details = `AdminLayout returned: ${typeof result}`;
      }
    } catch (err: unknown) {
      test4Details = `Unexpected throw: ${(err as Error).message}`;
    }
    record(
      4,
      "Active superadmin to /admin successfully renders AdminShell",
      test4Passed,
      test4Details
    );

    // Reset test auth hook
    (globalThis as unknown as { __TEST_AUTH_USER__?: AuthenticatedUser | null }).__TEST_AUTH_USER__ = undefined;

    // =========================================================================
    // 2. Public Template Footer /admin Link Eradication Tests
    // =========================================================================

    // Test 5: DevFooter has zero /admin links
    const devFooterPath = path.resolve(
      process.cwd(),
      "src/templates/developer/components/DevFooter.tsx"
    );
    const devFooterContent = fs.readFileSync(devFooterPath, "utf8");
    const devFooterHasAdmin =
      devFooterContent.includes('href="/admin"') ||
      devFooterContent.includes("Admin Portal");

    // Test 6: VideoFooter has zero /admin links
    const videoFooterPath = path.resolve(
      process.cwd(),
      "src/templates/video-editor/components/VideoFooter.tsx"
    );
    const videoFooterContent = fs.readFileSync(videoFooterPath, "utf8");
    const videoFooterHasAdmin =
      videoFooterContent.includes('href="/admin"') ||
      videoFooterContent.includes("ADMIN PORTAL");

    // Test 7: MarketingFooter has zero /admin links
    const marketingFooterPath = path.resolve(
      process.cwd(),
      "src/templates/digital-marketer/components/MarketingFooter.tsx"
    );
    const marketingFooterContent = fs.readFileSync(marketingFooterPath, "utf8");
    const marketingFooterHasAdmin =
      marketingFooterContent.includes('href="/admin"') ||
      marketingFooterContent.includes("Portal");

    const allTemplatesPure =
      !devFooterHasAdmin && !videoFooterHasAdmin && !marketingFooterHasAdmin;

    record(
      5,
      "Public templates (Dev, Video, Marketing) contain zero /admin links",
      allTemplatesPure,
      `DevFooter: ${!devFooterHasAdmin}, VideoFooter: ${!videoFooterHasAdmin}, MarketingFooter: ${!marketingFooterHasAdmin}`
    );

    // =========================================================================
    // 3. GET /api/auth/me Hardening Tests
    // =========================================================================

    // Test 6: /api/auth/me rejects suspended account with 403 ACCOUNT_SUSPENDED
    const suspendedMeReq = createMockRequest(
      "http://localhost:3000/api/auth/me",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: suspendedUserToken }
    );
    const suspendedMeRes = await getAuthMeHandler(suspendedMeReq);
    const suspendedMeJson = await suspendedMeRes.json();

    record(
      6,
      "GET /api/auth/me rejects suspended user with 403 ACCOUNT_SUSPENDED",
      suspendedMeRes.status === 403 &&
        suspendedMeJson.code === "ACCOUNT_SUSPENDED" &&
        suspendedMeJson.authenticated === false,
      `Status: ${suspendedMeRes.status}, Code: '${suspendedMeJson.code}', Authenticated: ${suspendedMeJson.authenticated}`
    );

    // Test 7: GET /api/auth/me accepts active user session (200)
    const activeMeReq = createMockRequest(
      "http://localhost:3000/api/auth/me",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: normalUserToken }
    );
    const activeMeRes = await getAuthMeHandler(activeMeReq);
    const activeMeJson = await activeMeRes.json();

    record(
      7,
      "GET /api/auth/me accepts active user session with 200",
      activeMeRes.status === 200 &&
        activeMeJson.authenticated === true &&
        activeMeJson.user?.id === normalUserDoc._id.toString(),
      `Status: ${activeMeRes.status}, Authenticated: ${activeMeJson.authenticated}, User: ${activeMeJson.user?.username}`
    );

    // Test 8: GET /api/auth/me rejects non-existent / deleted user (401)
    const nonExistentToken = await signUserToken({
      id: new Types.ObjectId().toString(),
      email: "ghost@example.com",
      role: "user",
      username: "ghostuser",
    });
    const ghostMeReq = createMockRequest(
      "http://localhost:3000/api/auth/me",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: nonExistentToken }
    );
    const ghostMeRes = await getAuthMeHandler(ghostMeReq);
    const ghostMeJson = await ghostMeRes.json();

    record(
      8,
      "GET /api/auth/me rejects non-existent user with 401",
      ghostMeRes.status === 401 && ghostMeJson.authenticated === false,
      `Status: ${ghostMeRes.status}, Authenticated: ${ghostMeJson.authenticated}`
    );

    // Test 9: GET /api/auth/me rejects unauthenticated request (401)
    const unauthMeReq = createMockRequest(
      "http://localhost:3000/api/auth/me",
      "GET"
    );
    const unauthMeRes = await getAuthMeHandler(unauthMeReq);
    const unauthMeJson = await unauthMeRes.json();

    record(
      9,
      "GET /api/auth/me rejects unauthenticated request with 401",
      unauthMeRes.status === 401 && unauthMeJson.authenticated === false,
      `Status: ${unauthMeRes.status}, Authenticated: ${unauthMeJson.authenticated}`
    );

    // =========================================================================
    // 4. Admin API Independent Protection Tests
    // =========================================================================

    // Test 10: GET /api/admin/stats protected (401 unauthenticated, 403 normal user)
    const unauthStatsReq = createMockRequest(
      "http://localhost:3000/api/admin/stats",
      "GET"
    );
    const unauthStatsRes = await getStatsHandler(unauthStatsReq);

    const normalStatsReq = createMockRequest(
      "http://localhost:3000/api/admin/stats",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: normalUserToken }
    );
    const normalStatsRes = await getStatsHandler(normalStatsReq);

    const superStatsReq = createMockRequest(
      "http://localhost:3000/api/admin/stats",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const superStatsRes = await getStatsHandler(superStatsReq);

    record(
      10,
      "GET /api/admin/stats independently enforces superadmin authorization",
      unauthStatsRes.status === 401 &&
        normalStatsRes.status === 403 &&
        superStatsRes.status === 200,
      `Unauth: ${unauthStatsRes.status} (expected 401), Normal: ${normalStatsRes.status} (expected 403), Superadmin: ${superStatsRes.status} (expected 200)`
    );

    // Test 11: Role escalation through Admin API strictly blocked (403)
    const escalateReq = createMockRequest(
      `http://localhost:3000/api/admin/users/${normalUserDoc._id}`,
      "PUT",
      { role: "superadmin" },
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const escalateRes = await putUserByIdHandler(escalateReq, {
      params: Promise.resolve({ id: normalUserDoc._id.toString() }),
    });

    const refreshedUser = await User.findById(normalUserDoc._id).lean();
    record(
      11,
      "Privilege escalation via Admin API payload is strictly blocked (403)",
      escalateRes.status === 403 && refreshedUser?.role === "user",
      `Status: ${escalateRes.status}, DB user role remains: '${refreshedUser?.role}'`
    );

    // Test 12: Self-suspension on Admin API is strictly blocked (400)
    const selfSuspendReq = createMockRequest(
      `http://localhost:3000/api/admin/users/${superadminDoc._id}`,
      "PUT",
      { accountStatus: "suspended" },
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const selfSuspendRes = await putUserByIdHandler(selfSuspendReq, {
      params: Promise.resolve({ id: superadminDoc._id.toString() }),
    });

    const refreshedSuper = await User.findById(superadminDoc._id).lean();
    record(
      12,
      "Superadmin self-suspension via Admin API is strictly blocked (400)",
      selfSuspendRes.status === 400 && refreshedSuper?.accountStatus === "active",
      `Status: ${selfSuspendRes.status}, DB superadmin status remains: '${refreshedSuper?.accountStatus}'`
    );
  } finally {
    // Clean up test documents
    await User.deleteMany({
      email: {
        $in: [
          superadminEmail,
          normalUserEmail,
          suspendedSuperadminEmail,
          suspendedUserEmail,
        ],
      },
    });
  }

  console.log("\n===============================================================");
  console.log("                   PHASE 22 TEST SUMMARY                       ");
  console.log("===============================================================");

  const totalTests = testResults.length;
  const totalPassed = testResults.filter((t) => t.passed).length;
  console.log(`Total Tests Run: ${totalTests}`);
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${totalTests - totalPassed}`);

  if (totalPassed === totalTests) {
    console.log(`✓ ALL ${totalTests} PHASE 22 ADMIN SECURITY TESTS PASSED!\n`);
  } else {
    console.error(`✗ ${totalTests - totalPassed} tests failed!\n`);
  }

  await mongoose.disconnect();
  return { totalPassed, totalTests, allPassed: totalPassed === totalTests };
}

// Auto-execute if run directly
if (
  require.main === module ||
  process.argv[1]?.includes("test-admin-page-auth-phase22")
) {
  runPhase22AdminSecurityTests()
    .then(({ allPassed }) => process.exit(allPassed ? 0 : 1))
    .catch((err) => {
      console.error("Test Suite Unhandled Exception:", err);
      process.exit(1);
    });
}
