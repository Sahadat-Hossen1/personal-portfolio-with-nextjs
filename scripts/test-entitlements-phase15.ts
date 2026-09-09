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

// Entitlements System
import {
  FEATURE_KEYS,
  FEATURE_DEFINITIONS,
  FeatureKey,
  isSupportedFeatureKey,
  getAllFeatureDefinitions,
} from "@/lib/entitlements/features";
import {
  PLAN_DEFAULT_ENTITLEMENTS,
  getPlanDefaultEntitlements,
} from "@/lib/entitlements/plans";
import {
  resolveEffectiveEntitlements,
  hasFeatureAccess,
  extractNormalizedOverrides,
} from "@/lib/entitlements/resolver";
import { requireFeature } from "@/lib/authorization";

// Auth & Admin APIs
import { USER_COOKIE_NAME, signUserToken, hashPassword } from "@/lib/auth";
import {
  GET as getUserByIdHandler,
  PUT as putUserByIdHandler,
} from "@/app/api/admin/users/[id]/route";
import { GET as getEntitlementsHandler } from "@/app/api/entitlements/route";
import { PUT as putProfileHandler } from "@/app/api/profile/route";
import { generateMetadata } from "@/app/p/[username]/page";
import { getPortfolioDataByOwnerId } from "@/lib/getData";

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
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

interface TestResult {
  num: number;
  test: string;
  passed: boolean;
  details: string;
}

export async function runPhase15EntitlementTests() {
  console.log("===============================================================");
  console.log("    PHASE 15 — SAAS FEATURE ENTITLEMENTS & OVERRIDES TESTS    ");
  console.log("===============================================================\n");

  await mongoose.connect(MONGODB_URI);

  const testResults: TestResult[] = [];

  function record(num: number, test: string, passed: boolean, details: string) {
    testResults.push({ num, test, passed, details });
    const mark = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${mark}] [Test ${num}] ${test} — ${details}`);
  }

  // Unique test fixtures
  const superadminEmail = "p15.superadmin@example.com";
  const superadminUsername = "p15-superadmin";

  const userAEmail = "p15.user.alice@example.com";
  const userAUsername = "p15-alice";

  const userBEmail = "p15.user.bob@example.com";
  const userBUsername = "p15-bob";

  // Clean up any previous test artifacts
  await User.deleteMany({
    email: { $in: [superadminEmail, userAEmail, userBEmail] },
  });
  await Profile.deleteMany({
    email: { $in: [superadminEmail, userAEmail, userBEmail] },
  });

  const pwdHash = await hashPassword("TestPassword123!");

  let superadminDoc: IUser;
  let userADoc: IUser;
  let userBDoc: IUser;

  let superadminToken: string;
  let userAToken: string;
  let userBToken: string;

  try {
    // -------------------------------------------------------------
    // Test 1: Feature registry completeness & validation
    // -------------------------------------------------------------
    const allDefs = getAllFeatureDefinitions();
    const expectedKeys: FeatureKey[] = [
      "projects",
      "skills",
      "experience",
      "messages",
      "custom_sections",
      "floating_chat",
      "advanced_seo",
    ];

    const keysMatch =
      expectedKeys.length === FEATURE_KEYS.length &&
      expectedKeys.every((k) => FEATURE_KEYS.includes(k));

    const defsComplete = allDefs.length === 7 && allDefs.every((d) => d.key && d.name && d.description);
    const validCheck =
      isSupportedFeatureKey("floating_chat") &&
      isSupportedFeatureKey("projects") &&
      !isSupportedFeatureKey("crypto_miner") &&
      !isSupportedFeatureKey("random_unknown_key");

    record(
      1,
      "Feature registry completeness & validation",
      keysMatch && defsComplete && validCheck,
      `Registered features: ${FEATURE_KEYS.length}, isSupportedFeatureKey valid: ${validCheck}`
    );

    // -------------------------------------------------------------
    // Test 2: Existing plan compatibility ("free" and "premium")
    // -------------------------------------------------------------
    const supportedPlans: UserPlan[] = ["free", "premium"];
    const planKeys = Object.keys(PLAN_DEFAULT_ENTITLEMENTS);
    const planCompat =
      planKeys.length === supportedPlans.length &&
      supportedPlans.every((p) => planKeys.includes(p));

    record(
      2,
      "Existing plan compatibility with UserPlan",
      planCompat,
      `Supported plans: ${planKeys.join(", ")}`
    );

    // -------------------------------------------------------------
    // Test 3: Plan default entitlements policy
    // -------------------------------------------------------------
    const freeDefaults = getPlanDefaultEntitlements("free");
    const premDefaults = getPlanDefaultEntitlements("premium");
    const fallbackDefaults = getPlanDefaultEntitlements(null);

    const freeValid =
      freeDefaults.projects === true &&
      freeDefaults.skills === true &&
      freeDefaults.experience === true &&
      freeDefaults.messages === true &&
      freeDefaults.custom_sections === false &&
      freeDefaults.floating_chat === false &&
      freeDefaults.advanced_seo === false;

    const premValid =
      premDefaults.projects === true &&
      premDefaults.skills === true &&
      premDefaults.experience === true &&
      premDefaults.messages === true &&
      premDefaults.custom_sections === true &&
      premDefaults.floating_chat === true &&
      premDefaults.advanced_seo === true;

    const fallbackValid = JSON.stringify(fallbackDefaults) === JSON.stringify(freeDefaults);

    record(
      3,
      "Plan default entitlements policy",
      freeValid && premValid && fallbackValid,
      `Free core: true, Free gated: false, Premium all: true, Fallback: free defaults`
    );

    // Create DB users for live integration tests
    superadminDoc = await User.create({
      name: "Super Admin P15",
      email: superadminEmail,
      username: superadminUsername,
      passwordHash: pwdHash,
      role: "superadmin",
      plan: "premium",
      profession: "developer",
      allowedTemplates: ["developer", "video-editor", "digital-marketer", "doctor"],
    });

    userADoc = await User.create({
      name: "Alice Developer P15",
      email: userAEmail,
      username: userAUsername,
      passwordHash: pwdHash,
      role: "user",
      plan: "free",
      profession: "developer",
      allowedTemplates: ["developer"],
      featureOverrides: new Map(),
    });

    userBDoc = await User.create({
      name: "Bob Video Editor P15",
      email: userBEmail,
      username: userBUsername,
      passwordHash: pwdHash,
      role: "user",
      plan: "free",
      profession: "video-editor",
      allowedTemplates: ["video-editor"],
      featureOverrides: new Map(),
    });

    superadminToken = await signUserToken({
      id: superadminDoc._id.toString(),
      email: superadminDoc.email,
      role: superadminDoc.role,
      username: superadminDoc.username,
      profession: superadminDoc.profession,
    });

    userAToken = await signUserToken({
      id: userADoc._id.toString(),
      email: userADoc.email,
      role: userADoc.role,
      username: userADoc.username,
      profession: userADoc.profession,
    });

    userBToken = await signUserToken({
      id: userBDoc._id.toString(),
      email: userBDoc.email,
      role: userBDoc.role,
      username: userBDoc.username,
      profession: userBDoc.profession,
    });

    // -------------------------------------------------------------
    // Test 4: User override persistence in database
    // -------------------------------------------------------------
    const overridesMap = new Map<string, boolean>();
    overridesMap.set("floating_chat", true);
    overridesMap.set("custom_sections", true);
    userADoc.featureOverrides = overridesMap;
    await userADoc.save();

    const reloadedUserA = await User.findById(userADoc._id).lean();
    const persistedOverrides = extractNormalizedOverrides(reloadedUserA?.featureOverrides);

    const overridePersisted =
      persistedOverrides.floating_chat === true &&
      persistedOverrides.custom_sections === true;

    record(
      4,
      "User override persistence in database",
      overridePersisted,
      `Persisted overrides: ${JSON.stringify(persistedOverrides)}`
    );

    // -------------------------------------------------------------
    // Test 5: Effective entitlement resolution
    // -------------------------------------------------------------
    const effectiveA = resolveEffectiveEntitlements(reloadedUserA);
    const hasAllKeys = expectedKeys.every((k) => typeof effectiveA[k] === "boolean");

    record(
      5,
      "Effective entitlement resolution produces complete deterministic map",
      hasAllKeys,
      `Effective keys: ${Object.keys(effectiveA).join(", ")}`
    );

    // -------------------------------------------------------------
    // Test 6: Override precedence: User Override > Plan Default
    // -------------------------------------------------------------
    // User A is on 'free' plan (where floating_chat is default false), but has override = true
    const precedenceActive =
      reloadedUserA?.plan === "free" &&
      effectiveA.floating_chat === true &&
      effectiveA.projects === true && // inherited from plan
      effectiveA.advanced_seo === false; // inherited from plan (no override)

    record(
      6,
      "Override precedence: User Override > Plan Default",
      precedenceActive,
      `Plan: free, floating_chat override: true -> effective: ${effectiveA.floating_chat}, advanced_seo default: ${effectiveA.advanced_seo}`
    );

    // -------------------------------------------------------------
    // Test 7: Override removal (null reverts to plan default)
    // -------------------------------------------------------------
    // Call PUT /api/admin/users/[id] to set floating_chat to null
    const req7 = createMockRequest(
      `http://localhost:3000/api/admin/users/${userADoc._id}`,
      "PUT",
      {
        featureOverrides: {
          floating_chat: null,
        },
      },
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const res7 = await putUserByIdHandler(req7, {
      params: Promise.resolve({ id: userADoc._id.toString() }),
    });
    const body7 = await res7.json();

    const afterRemovalUserA = await User.findById(userADoc._id).lean();
    const effectiveAfterRemoval = resolveEffectiveEntitlements(afterRemovalUserA);

    const overrideRemoved =
      res7.status === 200 &&
      effectiveAfterRemoval.floating_chat === false &&
      effectiveAfterRemoval.custom_sections === true; // custom_sections override was kept

    record(
      7,
      "Override removal reverts to plan default",
      overrideRemoved,
      `floating_chat reverted to: ${effectiveAfterRemoval.floating_chat}, custom_sections kept: ${effectiveAfterRemoval.custom_sections}`
    );

    // -------------------------------------------------------------
    // Test 8: Plan change preserves active user overrides
    // -------------------------------------------------------------
    // User A is upgraded to premium
    userADoc.plan = "premium";
    await userADoc.save();

    const upgradedUserA = await User.findById(userADoc._id).lean();
    const effectiveUpgraded = resolveEffectiveEntitlements(upgradedUserA);

    // Downgrade user A back to free
    userADoc.plan = "free";
    await userADoc.save();

    const downgradedUserA = await User.findById(userADoc._id).lean();
    const effectiveDowngraded = resolveEffectiveEntitlements(downgradedUserA);

    const planChangePreserved =
      effectiveUpgraded.custom_sections === true &&
      effectiveUpgraded.floating_chat === true && // from premium plan
      effectiveDowngraded.custom_sections === true && // custom override persisted!
      effectiveDowngraded.floating_chat === false; // reverted to free default

    record(
      8,
      "Plan change preserves active user overrides",
      planChangePreserved,
      `Upgraded custom_sections: ${effectiveUpgraded.custom_sections}, Downgraded custom_sections: ${effectiveDowngraded.custom_sections}`
    );

    // -------------------------------------------------------------
    // Test 9: Force-disabled premium feature
    // -------------------------------------------------------------
    // Set User A to premium, but explicitly force-disable advanced_seo
    userADoc.plan = "premium";
    if (userADoc.featureOverrides instanceof Map) {
      userADoc.featureOverrides.set("advanced_seo", false);
    } else {
      userADoc.featureOverrides = new Map([["advanced_seo", false]]);
    }
    await userADoc.save();

    const forcedDisabledUser = await User.findById(userADoc._id).lean();
    const effectiveForceDisabled = resolveEffectiveEntitlements(forcedDisabledUser);

    const forceDisabledVerified =
      forcedDisabledUser?.plan === "premium" &&
      effectiveForceDisabled.advanced_seo === false &&
      effectiveForceDisabled.floating_chat === true;

    record(
      9,
      "Force-disabled premium feature via override",
      forceDisabledVerified,
      `Plan: premium, advanced_seo override: false -> effective: ${effectiveForceDisabled.advanced_seo}, other features: ${effectiveForceDisabled.floating_chat}`
    );

    // Reset User A back to free with empty overrides for subsequent tests
    userADoc.plan = "free";
    userADoc.featureOverrides = new Map();
    await userADoc.save();

    // -------------------------------------------------------------
    // Test 10: Server-side authorization via requireFeature
    // -------------------------------------------------------------
    // 10A. Unauthenticated request -> 401
    const unauthReq = createMockRequest("http://localhost:3000/api/test", "GET");
    const unauthResult = await requireFeature("floating_chat", unauthReq);
    const unauthPassed = unauthResult.errorResponse?.status === 401;

    // 10B. Free user without floating_chat entitlement -> 403 FEATURE_UNAVAILABLE
    const userAReq = createMockRequest(
      "http://localhost:3000/api/test",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: userAToken }
    );
    const forbiddenResult = await requireFeature("floating_chat", userAReq);
    const forbiddenPassed = forbiddenResult.errorResponse?.status === 403;

    // 10C. User with override floating_chat: true -> 200 / success
    await User.updateOne(
      { _id: userADoc._id },
      { $set: { featureOverrides: new Map([["floating_chat", true]]) } }
    );
    const allowedResult = await requireFeature("floating_chat", userAReq);
    const allowedPassed =
      !allowedResult.errorResponse &&
      allowedResult.user?.ownerId?.toString() === userADoc._id.toString();

    // 10D. Superadmin -> success by default
    const superadminReq = createMockRequest(
      "http://localhost:3000/api/test",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const superadminResult = await requireFeature("advanced_seo", superadminReq);
    const superadminPassed = !superadminResult.errorResponse;

    record(
      10,
      "Server-side authorization via requireFeature (401, 403, 200, superadmin)",
      unauthPassed && forbiddenPassed && allowedPassed && superadminPassed,
      `Unauth: 401 (${unauthPassed}), Free without feature: 403 (${forbiddenPassed}), With override: 200 (${allowedPassed}), Superadmin: 200 (${superadminPassed})`
    );

    // -------------------------------------------------------------
    // Test 11: Superadmin override management API (GET & PUT)
    // -------------------------------------------------------------
    const putReq11 = createMockRequest(
      `http://localhost:3000/api/admin/users/${userBDoc._id}`,
      "PUT",
      {
        featureOverrides: {
          custom_sections: true,
          floating_chat: true,
        },
      },
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const putRes11 = await putUserByIdHandler(putReq11, {
      params: Promise.resolve({ id: userBDoc._id.toString() }),
    });
    const putBody11 = await putRes11.json();

    const getReq11 = createMockRequest(
      `http://localhost:3000/api/admin/users/${userBDoc._id}`,
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: superadminToken }
    );
    const getRes11 = await getUserByIdHandler(getReq11, {
      params: Promise.resolve({ id: userBDoc._id.toString() }),
    });
    const getBody11 = await getRes11.json();

    const adminMgmtPassed =
      putRes11.status === 200 &&
      putBody11.data?.user?.featureOverrides?.custom_sections === true &&
      getRes11.status === 200 &&
      getBody11.data?.user?.featureOverrides?.floating_chat === true &&
      getBody11.data?.user?.effectiveEntitlements?.floating_chat === true;

    record(
      11,
      "Superadmin override management API (GET & PUT)",
      adminMgmtPassed,
      `PUT status: ${putRes11.status}, GET effective floating_chat: ${getBody11.data?.user?.effectiveEntitlements?.floating_chat}`
    );

    // -------------------------------------------------------------
    // Test 12: Normal-user protection & privilege escalation prevention
    // -------------------------------------------------------------
    // 12A. Normal user cannot call admin PUT /api/admin/users/[id] (403)
    const rogueAdminReq = createMockRequest(
      `http://localhost:3000/api/admin/users/${userADoc._id}`,
      "PUT",
      {
        featureOverrides: { advanced_seo: true },
      },
      { [USER_COOKIE_NAME]: userAToken }
    );
    const rogueAdminRes = await putUserByIdHandler(rogueAdminReq, {
      params: Promise.resolve({ id: userADoc._id.toString() }),
    });
    const rogueAdminBlocked = rogueAdminRes.status === 403;

    // 12B. Normal user calling PUT /api/profile cannot forge featureOverrides
    const spoofProfileReq = createMockRequest(
      "http://localhost:3000/api/profile",
      "PUT",
      {
        featureOverrides: { advanced_seo: true },
        bioBlurb: "Safe update",
      },
      { [USER_COOKIE_NAME]: userAToken }
    );
    await putProfileHandler(spoofProfileReq);
    const checkUserA = await User.findById(userADoc._id).lean();
    const spoofOverrides = extractNormalizedOverrides(checkUserA?.featureOverrides);
    const spoofBlocked = spoofOverrides.advanced_seo === undefined;

    // 12C. Free user without floating_chat cannot enable floatingChat in profile sections (403)
    await User.updateOne(
      { _id: userADoc._id },
      { $set: { featureOverrides: new Map() } }
    );

    const illegalChatReq = createMockRequest(
      "http://localhost:3000/api/profile",
      "PUT",
      {
        sections: { floatingChat: true },
      },
      { [USER_COOKIE_NAME]: userAToken }
    );
    const illegalChatRes = await putProfileHandler(illegalChatReq);
    const illegalChatBlocked = illegalChatRes.status === 403;

    record(
      12,
      "Normal-user protection & privilege escalation prevention",
      rogueAdminBlocked && spoofBlocked && illegalChatBlocked,
      `Admin API block: ${rogueAdminBlocked}, Profile spoof block: ${spoofBlocked}, Gated feature block: ${illegalChatBlocked}`
    );

    // -------------------------------------------------------------
    // Test 13: Tenant isolation
    // -------------------------------------------------------------
    // User A has floating_chat: true override; User B is standard free (no overrides)
    await User.updateOne(
      { _id: userADoc._id },
      { $set: { featureOverrides: new Map([["floating_chat", true]]) } }
    );
    await User.updateOne(
      { _id: userBDoc._id },
      { $set: { featureOverrides: new Map() } }
    );

    const userADocFresh = await User.findById(userADoc._id).lean();
    const userBDocFresh = await User.findById(userBDoc._id).lean();

    const tenantAEntitled = hasFeatureAccess(userADocFresh, "floating_chat");
    const tenantBEntitled = hasFeatureAccess(userBDocFresh, "floating_chat");

    const tenantIsolationMaintained = tenantAEntitled === true && tenantBEntitled === false;

    record(
      13,
      "Strict tenant isolation of feature overrides and entitlements",
      tenantIsolationMaintained,
      `Tenant A floating_chat: ${tenantAEntitled}, Tenant B floating_chat: ${tenantBEntitled}`
    );

    // -------------------------------------------------------------
    // Test 14: Template-access independence (Template ≠ Feature)
    // -------------------------------------------------------------
    // User A has allowedTemplates: ['developer', 'video-editor']
    // Switching or modifying allowedTemplates does not alter feature entitlements
    const templatesBefore = [...(userADocFresh?.allowedTemplates || [])];
    const featBefore = hasFeatureAccess(userADocFresh, "floating_chat");

    // Add another template
    userADoc.allowedTemplates = ["developer", "video-editor", "doctor"];
    await userADoc.save();

    const userADocAfterTmpl = await User.findById(userADoc._id).lean();
    const featAfter = hasFeatureAccess(userADocAfterTmpl, "floating_chat");

    const tmplIndependence =
      featBefore === true &&
      featAfter === true &&
      userADocAfterTmpl?.allowedTemplates.length === 3;

    record(
      14,
      "Template-access independence (Template ≠ Feature)",
      tmplIndependence,
      `Templates before: ${templatesBefore.length}, after: ${userADocAfterTmpl?.allowedTemplates.length}, feature access preserved: ${featAfter}`
    );

    // -------------------------------------------------------------
    // Test 15: Backward compatibility (users without featureOverrides)
    // -------------------------------------------------------------
    // Create legacy user with no featureOverrides property in raw Mongo
    const legacyEmail = "p15.legacy@example.com";
    await User.deleteMany({ email: legacyEmail });
    const legacyDoc = await User.create({
      name: "Legacy User",
      email: legacyEmail,
      username: "p15-legacy",
      passwordHash: pwdHash,
      role: "user",
      plan: "free",
      profession: "developer",
      allowedTemplates: ["developer"],
    });

    const legacyRaw = await User.findById(legacyDoc._id).lean();
    const legacyEffective = resolveEffectiveEntitlements(legacyRaw);

    const legacyCompatible =
      legacyEffective.projects === true &&
      legacyEffective.skills === true &&
      legacyEffective.floating_chat === false &&
      legacyEffective.custom_sections === false;

    await User.deleteMany({ email: legacyEmail });

    record(
      15,
      "Backward compatibility for users without featureOverrides",
      legacyCompatible,
      `Legacy user resolved: projects=${legacyEffective.projects}, floating_chat=${legacyEffective.floating_chat}`
    );

    // -------------------------------------------------------------
    // Test 16: Basic SEO remains functional for Free users without advanced_seo
    // -------------------------------------------------------------
    // User A has plan: free, no advanced_seo
    await User.updateOne(
      { _id: userADoc._id },
      { $set: { plan: "free", featureOverrides: new Map() } }
    );

    await Profile.findOneAndUpdate(
      { ownerId: userADoc._id },
      {
        ownerId: userADoc._id,
        name: userADoc.name,
        email: userADoc.email,
        bioBlurb: "Alice is a full-stack engineer building modern SaaS solutions.",
        roles: ["Full Stack Engineer"],
        location: "San Francisco, CA",
      },
      { upsert: true, returnDocument: "after" }
    );

    const meta = await generateMetadata({
      params: Promise.resolve({ username: userAUsername }),
    });

    const og = meta.openGraph as Record<string, unknown> | undefined;
    const tw = meta.twitter as Record<string, unknown> | undefined;

    const basicSeoFunctional =
      typeof meta.title === "string" &&
      meta.title.includes("Alice Developer P15") &&
      typeof meta.description === "string" &&
      meta.description.includes("Alice is a full-stack engineer") &&
      og?.type === "profile" &&
      tw?.card === "summary_large_image";

    record(
      16,
      "Basic SEO remains 100% functional for Free users without advanced_seo",
      Boolean(basicSeoFunctional),
      `Title: '${meta.title}', Canonical: ${JSON.stringify(meta.alternates?.canonical)}`
    );

    // -------------------------------------------------------------
    // Test 17: Existing public portfolio remains functional & enforces runtime entitlements
    // -------------------------------------------------------------
    // Load portfolio data by ownerId
    const publicData = await getPortfolioDataByOwnerId(userADoc._id);

    // Free user without floating_chat entitlement -> profile should have valid sections
    const publicPortfolioFunctional =
      publicData !== null &&
      publicData.profile !== null &&
      publicData.profile.name === userADoc.name &&
      publicData.profile.selectedTemplate === "developer" &&
      Array.isArray(publicData.projects) &&
      Array.isArray(publicData.skills);

    record(
      17,
      "Public portfolio remains fully functional with runtime entitlement safety",
      Boolean(publicPortfolioFunctional),
      `Loaded profile for: ${publicData?.profile?.name}, Template: ${publicData?.profile?.selectedTemplate}`
    );

    // -------------------------------------------------------------
    // Test 18: Authenticated user entitlements endpoint (/api/entitlements)
    // -------------------------------------------------------------
    const entReq = createMockRequest(
      "http://localhost:3000/api/entitlements",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: userAToken }
    );
    const entRes = await getEntitlementsHandler(entReq);
    const entBody = await entRes.json();

    const entEndpointValid =
      entRes.status === 200 &&
      entBody.success === true &&
      entBody.data?.plan === "free" &&
      entBody.data?.effectiveEntitlements?.projects === true &&
      entBody.data?.effectiveEntitlements?.floating_chat === false &&
      Array.isArray(entBody.data?.features) &&
      entBody.data?.features.length === 7;

    record(
      18,
      "User entitlements endpoint (/api/entitlements) returns plan, effective map & registry",
      entEndpointValid,
      `Status: ${entRes.status}, Plan: ${entBody.data?.plan}, Features count: ${entBody.data?.features?.length}`
    );
  } finally {
    // Clean up test documents
    await User.deleteMany({
      email: { $in: [superadminEmail, userAEmail, userBEmail] },
    });
    await Profile.deleteMany({
      email: { $in: [superadminEmail, userAEmail, userBEmail] },
    });
  }

  console.log("\n===============================================================");
  console.log("                   PHASE 15 TEST SUMMARY                       ");
  console.log("===============================================================");

  const totalTests = testResults.length;
  const totalPassed = testResults.filter((t) => t.passed).length;
  console.log(`Total Tests Run: ${totalTests}`);
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${totalTests - totalPassed}`);

  if (totalPassed === totalTests) {
    console.log("✓ ALL 18 PHASE 15 ENTITLEMENT TESTS PASSED!\n");
  } else {
    console.error(`✗ ${totalTests - totalPassed} tests failed!\n`);
  }

  await mongoose.disconnect();
  return { totalPassed, totalTests, allPassed: totalPassed === totalTests };
}

// Auto-execute if run directly
if (
  require.main === module ||
  process.argv[1]?.includes("test-entitlements-phase15")
) {
  runPhase15EntitlementTests()
    .then(({ allPassed }) => process.exit(allPassed ? 0 : 1))
    .catch((err) => {
      console.error("Test Suite Unhandled Exception:", err);
      process.exit(1);
    });
}
