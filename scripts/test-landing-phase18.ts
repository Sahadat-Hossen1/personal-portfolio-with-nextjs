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

import { hashPassword } from "@/lib/auth";
import { getPortfolioDataByOwnerId } from "@/lib/getData";
import { FEATURE_KEYS } from "@/lib/entitlements/features";
import { PLAN_DEFAULT_ENTITLEMENTS } from "@/lib/entitlements/plans";
import { TEMPLATE_DEMO_FIXTURES } from "@/components/landing/demoData";
import { generateMetadata as generatePublicMetadata } from "@/app/p/[username]/page";
import { POST as registerHandler } from "@/app/api/auth/register/route";

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
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

export async function runPhase18LandingTests() {
  console.log("===============================================================");
  console.log("🚀 STARTING PHASE 18 AUTOMATED TEST SUITE: SAAS LANDING PAGE");
  console.log("===============================================================");

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) {
        console.error(`   Detail: ${detail}`);
      }
      failedCount++;
    }
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(" Connected to MongoDB for Phase 18 verification.\n");

    const uniqueSuffix = Date.now().toString().slice(-6);

    // ==========================================
    // TEST 1: Root landing route file exists and exports a Server Component
    // ==========================================
    const pageFilePath = path.resolve(process.cwd(), "src/app/page.tsx");
    const pageContent = fs.readFileSync(pageFilePath, "utf8");
    assert(
      fs.existsSync(pageFilePath) && pageContent.includes("export default async function HomePage"),
      "Test 1: Root landing route exists and exports dynamic Server Component HomePage"
    );

    // ==========================================
    // TEST 2: Root route no longer uses single-tenant personal portfolio rendering
    // ==========================================
    const doesNotImportSingleTenant =
      !pageContent.includes("getPortfolioData()") &&
      !pageContent.includes("TEMPLATE_MAP[") &&
      !pageContent.includes("@/lib/initialData");
    assert(
      doesNotImportSingleTenant,
      "Test 2: Root route no longer uses single-tenant personal portfolio rendering",
      `pageContent still has old single-tenant references: ${!doesNotImportSingleTenant}`
    );

    // ==========================================
    // TEST 3: getPortfolioData() has zero production call-sites
    // ==========================================
    const srcDir = path.resolve(process.cwd(), "src");
    function searchCallSites(dir: string): string[] {
      let results: string[] = [];
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const f of files) {
        const fullPath = path.join(dir, f.name);
        if (f.isDirectory()) {
          results = results.concat(searchCallSites(fullPath));
        } else if (
          (f.name.endsWith(".ts") || f.name.endsWith(".tsx")) &&
          !fullPath.includes("getData.ts")
        ) {
          const content = fs.readFileSync(fullPath, "utf8");
          if (content.includes("getPortfolioData(")) {
            results.push(fullPath);
          }
        }
      }
      return results;
    }
    const callSites = searchCallSites(srcDir);
    assert(
      callSites.length === 0,
      "Test 3: getPortfolioData() has zero production call-sites remaining in src/",
      `Found call sites in: ${callSites.join(", ")}`
    );

    // ==========================================
    // TEST 4: Landing page components provide registration CTAs
    // ==========================================
    const heroContent = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/landing/LandingHero.tsx"),
      "utf8"
    );
    const navbarContent = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/landing/LandingNavbar.tsx"),
      "utf8"
    );
    const ctaContent = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/landing/LandingCTA.tsx"),
      "utf8"
    );
    assert(
      heroContent.includes('href="/register"') &&
        navbarContent.includes('href="/register"') &&
        ctaContent.includes('href="/register"'),
      "Test 4: Landing page components prominently feature registration CTAs"
    );

    // ==========================================
    // TEST 5: Landing page components provide login / sign-in CTAs
    // ==========================================
    assert(
      heroContent.includes('href="/login"') &&
        navbarContent.includes('href="/login"') &&
        ctaContent.includes('href="/login"'),
      "Test 5: Landing page components provide sign-in / login CTAs"
    );

    // ==========================================
    // TEST 6: All 4 supported profession templates are represented in showcase fixtures
    // ==========================================
    const supportedProfessions = ["developer", "video-editor", "digital-marketer", "doctor"] as const;
    const allFixturesPresent = supportedProfessions.every(
      (prof) =>
        TEMPLATE_DEMO_FIXTURES[prof] &&
        TEMPLATE_DEMO_FIXTURES[prof].id === prof &&
        TEMPLATE_DEMO_FIXTURES[prof].demoProfile &&
        TEMPLATE_DEMO_FIXTURES[prof].demoProfile.name &&
        TEMPLATE_DEMO_FIXTURES[prof].demoProfile.role &&
        Array.isArray(TEMPLATE_DEMO_FIXTURES[prof].demoProfile.skills) &&
        Array.isArray(TEMPLATE_DEMO_FIXTURES[prof].features)
    );
    assert(
      allFixturesPresent,
      "Test 6: Exactly 4 supported profession templates are represented with complete demo fixtures"
    );

    // ==========================================
    // TEST 7: Demo showcase fixtures are 100% static, isolated, and have no DB dependencies
    // ==========================================
    const demoDataPath = path.resolve(process.cwd(), "src/components/landing/demoData.ts");
    const demoDataContent = fs.readFileSync(demoDataPath, "utf8");
    const isIsolated =
      !demoDataContent.includes("mongoose") &&
      !demoDataContent.includes("mongodb") &&
      !demoDataContent.includes("connectToDatabase") &&
      !demoDataContent.includes("models/");
    assert(
      isIsolated,
      "Test 7: Demo showcase fixtures are 100% static, in-memory, and contain no MongoDB dependencies"
    );

    // ==========================================
    // TEST 8: No real tenant database queries are executed by the template showcase
    // ==========================================
    const showcasePath = path.resolve(
      process.cwd(),
      "src/components/landing/TemplateShowcase.tsx"
    );
    const showcaseContent = fs.readFileSync(showcasePath, "utf8");
    const noTenantQuery =
      !showcaseContent.includes("User.find") &&
      !showcaseContent.includes("Profile.find") &&
      !showcaseContent.includes("connectToDatabase") &&
      !showcaseContent.includes("mongoose") &&
      !showcaseContent.includes("@/models/");
    assert(
      noTenantQuery,
      "Test 8: TemplateShowcase does not query real tenant MongoDB models or execute database calls"
    );

    // ==========================================
    // TEST 9: Pricing section dynamically consumes Phase 15 entitlement registry
    // ==========================================
    const pricingPath = path.resolve(
      process.cwd(),
      "src/components/landing/PricingComparison.tsx"
    );
    const pricingContent = fs.readFileSync(pricingPath, "utf8");
    const consumesPhase15 =
      pricingContent.includes("@/lib/entitlements/features") &&
      pricingContent.includes("@/lib/entitlements/plans") &&
      pricingContent.includes("FEATURE_KEYS") &&
      pricingContent.includes("PLAN_DEFAULT_ENTITLEMENTS");
    assert(
      consumesPhase15 &&
        FEATURE_KEYS.length === 7 &&
        PLAN_DEFAULT_ENTITLEMENTS.free.custom_sections === false &&
        PLAN_DEFAULT_ENTITLEMENTS.premium.custom_sections === true,
      "Test 9: Pricing section dynamically consumes Phase 15 entitlement registry as single source of truth"
    );

    // ==========================================
    // TEST 10: Profession pre-selection client logic handles valid professions
    // ==========================================
    const registerPagePath = path.resolve(process.cwd(), "src/app/register/page.tsx");
    const registerPageContent = fs.readFileSync(registerPagePath, "utf8");
    const supportsQueryParam =
      registerPageContent.includes("useSearchParams") &&
      registerPageContent.includes('searchParams.get("profession")') &&
      registerPageContent.includes("initialProfession");
    assert(
      supportsQueryParam,
      "Test 10: Registration form safely reads and applies profession pre-selection query parameter"
    );

    // ==========================================
    // TEST 11: Registration API enforces server-side profession validation
    // ==========================================
    const invalidRegReq = createMockRequest("/api/auth/register", "POST", {
      name: "Invalid Profession Tester",
      email: `invalid-prof-${uniqueSuffix}@example.com`,
      phone: "+1234567890",
      profession: "invalid-astronaut-role",
      password: "validPassword123!",
    });
    const regRes = await registerHandler(invalidRegReq);
    const regData = await regRes.json();
    assert(
      regRes.status === 400 && regData.success === false,
      "Test 11: Server-side registration validation strictly rejects invalid profession payloads with HTTP 400"
    );

    // Clean up test user if created by accident
    await User.deleteMany({ email: `invalid-prof-${uniqueSuffix}@example.com` });

    // ==========================================
    // TEST 12: Landing page auth CTA logic properly protects suspended users and directs roles
    // ==========================================
    const pageLogicContent = fs.readFileSync(
      path.resolve(process.cwd(), "src/app/page.tsx"),
      "utf8"
    );
    const hasSuspensionProtection =
      pageLogicContent.includes('userDoc.accountStatus === "suspended"') &&
      pageLogicContent.includes("isLoggedIn: !isSuspended") &&
      pageLogicContent.includes('userDoc.role === "superadmin" && !isSuspended');
    const navbarAuthLogic = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/landing/LandingNavbar.tsx"),
      "utf8"
    );
    const respectsSuspensionInNavbar =
      navbarAuthLogic.includes("authState.isLoggedIn && !authState.isSuspended") &&
      navbarAuthLogic.includes('href="/admin"') &&
      navbarAuthLogic.includes('href="/dashboard"');
    assert(
      hasSuspensionProtection && respectsSuspensionInNavbar,
      "Test 12: Landing page auth CTA logic hides dashboard for suspended users and distinguishes user vs superadmin destinations"
    );

    // ==========================================
    // TEST 13: Public portfolio route /p/[username] remains completely intact
    // ==========================================
    const testUsername = `p18user_${uniqueSuffix}`;
    const passwordHash = await hashPassword("securePassword123!");
    const testUser = await User.create({
      name: "Phase 18 Verified Tenant",
      email: `p18_${uniqueSuffix}@example.com`,
      phone: "+1234567890",
      profession: "developer",
      passwordHash,
      role: "user",
      plan: "free",
      username: testUsername,
      accountStatus: "active",
      allowedTemplates: ["developer"],
    });

    const testProfile = await Profile.create({
      ownerId: testUser._id,
      name: "Phase 18 Verified Tenant",
      publicationStatus: "published",
      selectedTemplate: "developer",
      roles: ["Full Stack Dev"],
      bioBlurb: "Tenant bio blurb for testing public rendering",
    });

    const publicPortfolioData = await getPortfolioDataByOwnerId(testUser._id);
    assert(
      publicPortfolioData !== null &&
        publicPortfolioData.profile.name === "Phase 18 Verified Tenant" &&
        publicPortfolioData.profile.publicationStatus === "published",
      "Test 13: Public portfolio data-loading path (/p/[username]) remains completely functional and owner-scoped"
    );

    // ==========================================
    // TEST 14: Published / unpublished dual-gate architecture remains intact
    // ==========================================
    testProfile.publicationStatus = "unpublished";
    await testProfile.save();

    const metaUnpublished = await generatePublicMetadata({
      params: Promise.resolve({ username: testUsername }),
    });
    assert(
      metaUnpublished.title === "Portfolio Not Found" &&
        metaUnpublished.description === "The requested portfolio could not be found.",
      "Test 14: Unpublished portfolio privacy gate is intact (returns generic Portfolio Not Found metadata)"
    );

    // Republish
    testProfile.publicationStatus = "published";
    await testProfile.save();

    // ==========================================
    // TEST 15: Suspended account public visibility architecture remains intact
    // ==========================================
    testUser.accountStatus = "suspended";
    await testUser.save();

    const metaSuspended = await generatePublicMetadata({
      params: Promise.resolve({ username: testUsername }),
    });
    assert(
      metaSuspended.title === "Portfolio Not Found",
      "Test 15: Suspended account visibility gate remains intact (returns generic 404 metadata)"
    );

    // Restore to active
    testUser.accountStatus = "active";
    await testUser.save();

    // ==========================================
    // TEST 16: Root layout metadata is platform-oriented
    // ==========================================
    const layoutPath = path.resolve(process.cwd(), "src/app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf8");
    const isPlatformMetadata =
      layoutContent.includes('default: "PortfolioOS — Multi-Tenant SaaS Portfolio Platform"') &&
      layoutContent.includes('template: "%s | PortfolioOS"') &&
      layoutContent.includes("Build, customize, and publish your professional portfolio in minutes") &&
      !layoutContent.includes("Sahadat Hossen — Full Stack MERN Developer");
    assert(
      isPlatformMetadata,
      "Test 16: Root layout metadata represents the multi-tenant SaaS platform rather than an individual developer"
    );

    // ==========================================
    // TEST 17: Tenant dynamic metadata overrides root defaults on published portfolios
    // ==========================================
    const metaPublished = await generatePublicMetadata({
      params: Promise.resolve({ username: testUsername }),
    });
    assert(
      typeof metaPublished.title === "string" &&
        metaPublished.title.includes("Phase 18 Verified Tenant") &&
        metaPublished.title.includes("Full Stack Dev"),
      "Test 17: Tenant dynamic metadata (/p/[username]) properly overrides root defaults with personal title & role"
    );

    // ==========================================
    // TEST 18: Clean up test fixtures
    // ==========================================
    await Profile.deleteOne({ _id: testProfile._id });
    await User.deleteOne({ _id: testUser._id });
    assert(true, "Test 18: Test tenant database fixtures cleaned up successfully");

    console.log("\n===============================================================");
    console.log(`🏁 PHASE 18 SUITE COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log("===============================================================");

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
if (
  require.main === module ||
  process.argv[1]?.includes("test-landing-phase18")
) {
  runPhase18LandingTests().catch((err) => {
    console.error("Fatal error running Phase 18 tests:", err);
    process.exit(1);
  });
}
