/**
 * PHASE 20 — Entitlement UX & Plan Awareness Integration Tests
 * 
 * Verifies the backend/integration behaviors powering the Entitlement UX & Plan Awareness layer:
 * 1. Free user entitlement state (defaults, gated features false, core features true)
 * 2. Premium user entitlement state (all features true)
 * 3. User feature override behavior (granular grants/revocations)
 * 4. Superadmin entitlement behavior (all features granted)
 * 5. API rejection of unavailable premium functionality (403 FEATURE_UNAVAILABLE)
 *    - floating_chat rejection for free tier
 *    - custom_sections rejection when attempting to hide sections on free tier
 * 6. Authorized premium submission (200 OK for premium users & overridden users)
 * 7. Entitlement Ingestion API (/api/entitlements) contract validation
 * 8. Unauthenticated request protection on /api/entitlements
 * 9. Regression check: existing entitlement enforcement and admin contract
 */

import mongoose from "mongoose";
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
import User from "@/models/User";
import Profile from "@/models/Profile";

// Entitlements System
import {
  FEATURE_KEYS,
  FEATURE_DEFINITIONS,
  FeatureKey,
  getAllFeatureDefinitions,
} from "@/lib/entitlements/features";
import {
  PLAN_DEFAULT_ENTITLEMENTS,
  getPlanDefaultEntitlements,
} from "@/lib/entitlements/plans";
import {
  resolveEffectiveEntitlements,
  hasFeatureAccess,
} from "@/lib/entitlements/resolver";

// Auth & APIs
import { USER_COOKIE_NAME, signUserToken, hashPassword } from "@/lib/auth";
import { GET as getEntitlementsHandler } from "@/app/api/entitlements/route";
import { PUT as putProfileHandler } from "@/app/api/profile/route";
import { GET as getUserByIdHandler } from "@/app/api/admin/users/[id]/route";

function createMockRequest(
  url: string,
  method: "GET" | "PUT" | "POST",
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
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

interface TestResult {
  num: number;
  test: string;
  passed: boolean;
  details: string;
}

export async function runPhase20EntitlementUXTests() {
  console.log("===============================================================");
  console.log("    PHASE 20 — ENTITLEMENT UX & PLAN AWARENESS INTEGRATION TESTS");
  console.log("===============================================================\n");

  await mongoose.connect(MONGODB_URI);

  const testResults: TestResult[] = [];

  function record(num: number, test: string, passed: boolean, details: string) {
    testResults.push({ num, test, passed, details });
    const mark = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${mark}] [Test ${num}] ${test}\n        Details: ${details}`);
  }

  // Unique test fixtures
  const prefix = "p20-test-";
  const freeEmail = `${prefix}free@example.com`;
  const freeUsername = `${prefix}free`;

  const premiumEmail = `${prefix}premium@example.com`;
  const premiumUsername = `${prefix}premium`;

  const superadminEmail = `${prefix}superadmin@example.com`;
  const superadminUsername = `${prefix}superadmin`;

  try {
    // -------------------------------------------------------------
    // Setup & Fixtures
    // -------------------------------------------------------------
    // Clean up past runs
    await User.deleteMany({
      email: { $in: [freeEmail, premiumEmail, superadminEmail] },
    });

    const hashedPassword = await hashPassword("TestPassword123!");

    const freeUser = await User.create({
      name: "Phase20 Free User",
      email: freeEmail,
      username: freeUsername,
      passwordHash: hashedPassword,
      profession: "developer",
      plan: "free",
      role: "user",
      featureOverrides: new Map(),
    });

    const premiumUser = await User.create({
      name: "Phase20 Premium User",
      email: premiumEmail,
      username: premiumUsername,
      passwordHash: hashedPassword,
      profession: "digital-marketer",
      plan: "premium",
      role: "user",
      featureOverrides: new Map(),
    });

    const superadminUser = await User.create({
      name: "Phase20 Superadmin",
      email: superadminEmail,
      username: superadminUsername,
      passwordHash: hashedPassword,
      profession: "developer",
      plan: "free",
      role: "superadmin",
      featureOverrides: new Map(),
    });

    // Create initial profile docs
    await Profile.deleteMany({
      ownerId: { $in: [freeUser._id, premiumUser._id, superadminUser._id] },
    });

    await Profile.create({
      ownerId: freeUser._id,
      bioBlurb: "Free user bio",
      aboutTitle: "About Free User",
      sections: {
        hero: true,
        about: true,
        skills: true,
        projects: true,
        experience: true,
        contact: true,
        floatingChat: false,
      },
    });

    await Profile.create({
      ownerId: premiumUser._id,
      bioBlurb: "Premium user bio",
      aboutTitle: "About Premium User",
      sections: {
        hero: true,
        about: true,
        skills: true,
        projects: true,
        experience: true,
        contact: true,
        floatingChat: false,
      },
    });

    const freeToken = await signUserToken({
      id: freeUser._id.toString(),
      email: freeUser.email,
      username: freeUser.username,
      role: freeUser.role,
      profession: freeUser.profession,
    });

    const premiumToken = await signUserToken({
      id: premiumUser._id.toString(),
      email: premiumUser.email,
      username: premiumUser.username,
      role: premiumUser.role,
      profession: premiumUser.profession,
    });

    const superadminToken = await signUserToken({
      id: superadminUser._id.toString(),
      email: superadminUser.email,
      username: superadminUser.username,
      role: superadminUser.role,
      profession: superadminUser.profession,
    });

    // -------------------------------------------------------------
    // Test 1: Free user entitlement state
    // -------------------------------------------------------------
    const freeResolved = resolveEffectiveEntitlements(freeUser);
    const freeGatedAreFalse =
      freeResolved.floating_chat === false &&
      freeResolved.custom_sections === false &&
      freeResolved.advanced_seo === false;

    const freeCoreAreTrue =
      freeResolved.projects === true &&
      freeResolved.skills === true &&
      freeResolved.experience === true &&
      freeResolved.messages === true;

    record(
      1,
      "Free user entitlement state",
      freeGatedAreFalse && freeCoreAreTrue,
      `Core features true: ${freeCoreAreTrue}, Premium gated features false: ${freeGatedAreFalse}`
    );

    // -------------------------------------------------------------
    // Test 2: Premium user entitlement state
    // -------------------------------------------------------------
    const premiumResolved = resolveEffectiveEntitlements(premiumUser);
    const allFeatures = FEATURE_KEYS;
    const premiumAllTrue = allFeatures.every(
      (feat) => premiumResolved[feat] === true
    );

    record(
      2,
      "Premium user entitlement state",
      premiumAllTrue,
      `All ${allFeatures.length} registered features resolved to true for premium plan: ${premiumAllTrue}`
    );

    // -------------------------------------------------------------
    // Test 3: User feature override behavior
    // -------------------------------------------------------------
    // Grant floating_chat to free user via override
    const freeWithOverride = {
      role: "user" as const,
      plan: "free" as const,
      featureOverrides: { floating_chat: true },
    };
    const resolvedOverrideGrant = resolveEffectiveEntitlements(freeWithOverride);
    const overrideGranted =
      resolvedOverrideGrant.floating_chat === true &&
      resolvedOverrideGrant.custom_sections === false &&
      resolvedOverrideGrant.advanced_seo === false;

    // Revoke messages from premium user via override
    const premiumWithRevoke = {
      role: "user" as const,
      plan: "premium" as const,
      featureOverrides: { messages: false },
    };
    const resolvedOverrideRevoke = resolveEffectiveEntitlements(premiumWithRevoke);
    const overrideRevoked =
      resolvedOverrideRevoke.messages === false &&
      resolvedOverrideRevoke.floating_chat === true;

    record(
      3,
      "User feature override behavior",
      overrideGranted && overrideRevoked,
      `Free user override granted floating_chat: ${overrideGranted}, Premium user override revoked messages: ${overrideRevoked}`
    );

    // -------------------------------------------------------------
    // Test 4: Superadmin entitlement behavior
    // -------------------------------------------------------------
    const superadminResolved = resolveEffectiveEntitlements(superadminUser);
    const superadminAllTrue = allFeatures.every(
      (feat) => superadminResolved[feat] === true
    );

    record(
      4,
      "Superadmin entitlement behavior",
      superadminAllTrue,
      `Superadmin automatically granted access to all ${allFeatures.length} features: ${superadminAllTrue}`
    );

    // -------------------------------------------------------------
    // Test 5: API rejection — Free user attempting to enable floating_chat
    // -------------------------------------------------------------
    const illegalChatReq = createMockRequest(
      "http://localhost:3000/api/profile",
      "PUT",
      {
        sections: { floatingChat: true },
      },
      { [USER_COOKIE_NAME]: freeToken }
    );
    const illegalChatRes = await putProfileHandler(illegalChatReq);
    const illegalChatJson = await illegalChatRes.json();

    const chatRejected =
      illegalChatRes.status === 403 &&
      illegalChatJson.code === "FEATURE_UNAVAILABLE" &&
      illegalChatJson.feature === "floating_chat";

    record(
      5,
      "API rejection: Free user enabling floating_chat",
      chatRejected,
      `HTTP status: ${illegalChatRes.status} (expected 403), code: "${illegalChatJson.code}", feature: "${illegalChatJson.feature}"`
    );

    // -------------------------------------------------------------
    // Test 6: API rejection — Free user attempting to hide custom sections
    // -------------------------------------------------------------
    const illegalSectionReq = createMockRequest(
      "http://localhost:3000/api/profile",
      "PUT",
      {
        sections: { hero: false },
      },
      { [USER_COOKIE_NAME]: freeToken }
    );
    const illegalSectionRes = await putProfileHandler(illegalSectionReq);
    const illegalSectionJson = await illegalSectionRes.json();

    const sectionRejected =
      illegalSectionRes.status === 403 &&
      illegalSectionJson.code === "FEATURE_UNAVAILABLE" &&
      illegalSectionJson.feature === "custom_sections";

    record(
      6,
      "API rejection: Free user hiding standard section (custom_sections)",
      sectionRejected,
      `HTTP status: ${illegalSectionRes.status} (expected 403), code: "${illegalSectionJson.code}", feature: "${illegalSectionJson.feature}"`
    );

    // -------------------------------------------------------------
    // Test 7: Authorized premium submission
    // -------------------------------------------------------------
    const premiumValidReq = createMockRequest(
      "http://localhost:3000/api/profile",
      "PUT",
      {
        bioBlurb: "Updated premium blurb",
        sections: {
          hero: true,
          about: true,
          skills: false, // Premium user hiding a section
          projects: true,
          experience: true,
          contact: true,
          floatingChat: true, // Premium user enabling floating chat
        },
      },
      { [USER_COOKIE_NAME]: premiumToken }
    );
    const premiumValidRes = await putProfileHandler(premiumValidReq);
    const premiumValidJson = await premiumValidRes.json();

    const premiumAccepted =
      premiumValidRes.status === 200 && premiumValidJson.success === true;

    // Verify database state actually persisted
    const updatedPremiumProfile = await Profile.findOne({
      ownerId: premiumUser._id,
    }).lean();

    const premiumPersisted =
      updatedPremiumProfile?.sections?.floatingChat === true &&
      updatedPremiumProfile?.sections?.skills === false;

    record(
      7,
      "Authorized premium submission",
      premiumAccepted && premiumPersisted,
      `HTTP status: ${premiumValidRes.status} (expected 200), floatingChat persisted: ${updatedPremiumProfile?.sections?.floatingChat}, skills hidden persisted: ${updatedPremiumProfile?.sections?.skills === false}`
    );

    // -------------------------------------------------------------
    // Test 8: Entitlement Ingestion API contract (/api/entitlements)
    // -------------------------------------------------------------
    const entitlementsReq = createMockRequest(
      "http://localhost:3000/api/entitlements",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: freeToken }
    );
    const entitlementsRes = await getEntitlementsHandler(entitlementsReq);
    const entitlementsJson = await entitlementsRes.json();

    const hasExpectedContract =
      entitlementsRes.status === 200 &&
      entitlementsJson.success === true &&
      entitlementsJson.data &&
      entitlementsJson.data.plan === "free" &&
      entitlementsJson.data.role === "user" &&
      typeof entitlementsJson.data.effectiveEntitlements === "object" &&
      entitlementsJson.data.effectiveEntitlements.floating_chat === false &&
      Array.isArray(entitlementsJson.data.features) &&
      entitlementsJson.data.features.length === FEATURE_KEYS.length;

    record(
      8,
      "Entitlement Ingestion API contract (/api/entitlements)",
      Boolean(hasExpectedContract),
      `Status: ${entitlementsRes.status}, Plan: ${entitlementsJson.data?.plan}, Features count: ${entitlementsJson.data?.features?.length}, effectiveEntitlements present: ${Boolean(entitlementsJson.data?.effectiveEntitlements)}`
    );

    // -------------------------------------------------------------
    // Test 9: Unauthenticated protection on /api/entitlements
    // -------------------------------------------------------------
    const unauthReq = createMockRequest(
      "http://localhost:3000/api/entitlements",
      "GET"
    );
    const unauthRes = await getEntitlementsHandler(unauthReq);
    const unauthBlocked = unauthRes.status === 401;

    record(
      9,
      "Unauthenticated protection on /api/entitlements",
      unauthBlocked,
      `HTTP status: ${unauthRes.status} (expected 401)`
    );

    // -------------------------------------------------------------
    // Test 10: Regression check — Admin user detail API contract
    // -------------------------------------------------------------
    const adminReq = createMockRequest(
      `http://localhost:3000/api/admin/users/${freeUser._id}`,
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const adminRes = await getUserByIdHandler(adminReq, {
      params: Promise.resolve({ id: freeUser._id.toString() }),
    });
    const adminJson = await adminRes.json();

    const adminContractIntact =
      adminRes.status === 200 &&
      adminJson.success === true &&
      adminJson.data?.user?.effectiveEntitlements !== undefined &&
      adminJson.data?.user?.featureOverrides !== undefined;

    record(
      10,
      "Regression check: Admin user inspection contract preserved",
      Boolean(adminContractIntact),
      `Admin GET user status: ${adminRes.status}, effectiveEntitlements present: ${Boolean(adminJson.data?.user?.effectiveEntitlements)}, featureOverrides present: ${Boolean(adminJson.data?.user?.featureOverrides)}`
    );

    // -------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------
    await User.deleteMany({
      email: { $in: [freeEmail, premiumEmail, superadminEmail] },
    });
    await Profile.deleteMany({
      ownerId: { $in: [freeUser._id, premiumUser._id, superadminUser._id] },
    });

  } finally {
    await mongoose.disconnect();
  }

  // Summary
  console.log("\n===============================================================");
  console.log("                        TEST SUMMARY                           ");
  console.log("===============================================================");
  const passedCount = testResults.filter((r) => r.passed).length;
  const totalCount = testResults.length;
  console.log(`Total tests: ${totalCount} | Passed: ${passedCount} | Failed: ${totalCount - passedCount}`);

  if (passedCount === totalCount) {
    console.log("\n>>> ALL PHASE 20 ENTITLEMENT UX TESTS PASSED SUCCESSFULLY! <<<\n");
  } else {
    console.error("\n>>> SOME TESTS FAILED! <<<\n");
    process.exit(1);
  }
}

// Run when executed directly
if (require.main === module || process.argv[1]?.includes("test-entitlement-ux-phase20")) {
  runPhase20EntitlementUXTests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  });
}
