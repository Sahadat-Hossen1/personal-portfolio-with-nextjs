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
import User from "@/models/User";
import Profile from "@/models/Profile";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import Experience from "@/models/Experience";
import Message from "@/models/Message";

import { USER_COOKIE_NAME, ADMIN_COOKIE_NAME, signUserToken, hashPassword } from "@/lib/auth";
import { getPortfolioDataByOwnerId } from "@/lib/getData";

// Handlers
import { POST as logoutHandler } from "@/app/api/auth/logout/route";
import { POST as postMessageHandler } from "@/app/api/messages/route";
import { generateMetadata as generatePublicMetadata } from "@/app/p/[username]/page";

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

function getAllSourceFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllSourceFiles(fullPath, fileList);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

interface TestResult {
  num: number;
  description: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(num: number, description: string, condition: boolean, message?: string) {
  if (condition) {
    console.log(`[✓ PASS] [Test ${num}] ${description}`);
    results.push({ num, description, passed: true });
  } else {
    console.error(`[✗ FAIL] [Test ${num}] ${description} — ${message || "Assertion failed"}`);
    results.push({ num, description, passed: false, error: message || "Assertion failed" });
  }
}

async function runTests() {
  console.log("===============================================================");
  console.log("   PHASE 19 — LEGACY DECOMMISSIONING & CONTROL PLANE TESTS     ");
  console.log("===============================================================\n");

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB for Phase 19 verification.\n");

  const srcDir = path.resolve(process.cwd(), "src");
  const allSrcFiles = getAllSourceFiles(srcDir);

  // -------------------------------------------------------------
  // Test 1: logout clears modern user cookie
  // -------------------------------------------------------------
  try {
    const logoutRes = await logoutHandler();
    const userCookie = logoutRes.cookies.get(USER_COOKIE_NAME);
    const passed = !!userCookie && userCookie.value === "" && userCookie.maxAge === 0;
    assert(1, "logout clears modern user cookie", passed, `Value: ${userCookie?.value}, MaxAge: ${userCookie?.maxAge}`);
  } catch (err: unknown) {
    assert(1, "logout clears modern user cookie", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 2: logout clears legacy admin cookie
  // -------------------------------------------------------------
  try {
    const logoutRes = await logoutHandler();
    const adminCookie = logoutRes.cookies.get(ADMIN_COOKIE_NAME);
    const passed = !!adminCookie && adminCookie.value === "" && adminCookie.maxAge === 0;
    assert(2, "logout clears legacy admin cookie", passed, `Value: ${adminCookie?.value}, MaxAge: ${adminCookie?.maxAge}`);
  } catch (err: unknown) {
    assert(2, "logout clears legacy admin cookie", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 3: no active production dependency on legacy Admin model
  // -------------------------------------------------------------
  try {
    const adminModelExists = fs.existsSync(path.join(srcDir, "models", "Admin.ts"));
    let adminImportsInSrc = 0;
    for (const filePath of allSrcFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      if (
        content.includes('from "@/models/Admin"') ||
        content.includes("from '@/models/Admin'") ||
        content.includes('from "./Admin"') ||
        content.includes("from './Admin'")
      ) {
        adminImportsInSrc++;
      }
    }
    const passed = !adminModelExists && adminImportsInSrc === 0;
    assert(
      3,
      "no active production dependency on legacy Admin model",
      passed,
      `adminModelExists: ${adminModelExists}, adminImportsInSrc: ${adminImportsInSrc}`
    );
  } catch (err: unknown) {
    assert(3, "no active production dependency on legacy Admin model", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 4: no active production dependency on signAdminToken
  // -------------------------------------------------------------
  try {
    let signAdminTokenMatches = 0;
    for (const filePath of allSrcFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      if (content.includes("signAdminToken")) {
        signAdminTokenMatches++;
      }
    }
    assert(4, "no active production dependency on signAdminToken", signAdminTokenMatches === 0, `Matches: ${signAdminTokenMatches}`);
  } catch (err: unknown) {
    assert(4, "no active production dependency on signAdminToken", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 5: no active production dependency on verifyAdminRequest
  // -------------------------------------------------------------
  try {
    let verifyAdminMatches = 0;
    for (const filePath of allSrcFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      if (content.includes("verifyAdminRequest")) {
        verifyAdminMatches++;
      }
    }
    assert(5, "no active production dependency on verifyAdminRequest", verifyAdminMatches === 0, `Matches: ${verifyAdminMatches}`);
  } catch (err: unknown) {
    assert(5, "no active production dependency on verifyAdminRequest", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 6: /api/seed is no longer available as a destructive production route
  // -------------------------------------------------------------
  try {
    const seedRoutePath = path.join(srcDir, "app", "api", "seed");
    const seedExists = fs.existsSync(seedRoutePath);
    let seedReferencesInSrc = 0;
    for (const filePath of allSrcFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      if (content.includes("/api/seed")) {
        seedReferencesInSrc++;
      }
    }
    const passed = !seedExists && seedReferencesInSrc === 0;
    assert(
      6,
      "/api/seed is no longer available as a destructive production route",
      passed,
      `seedExists: ${seedExists}, seedReferencesInSrc: ${seedReferencesInSrc}`
    );
  } catch (err: unknown) {
    assert(6, "/api/seed is no longer available as a destructive production route", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 7: legacy admin CMS routes are decommissioned
  // -------------------------------------------------------------
  try {
    const legacyAdminRoutes = [
      "hero-about",
      "projects",
      "skills",
      "experience",
      "messages",
      "settings",
    ];
    const existingRoutes = legacyAdminRoutes.filter((r) =>
      fs.existsSync(path.join(srcDir, "app", "admin", r))
    );
    const passed = existingRoutes.length === 0;
    assert(
      7,
      "legacy admin CMS routes are decommissioned",
      passed,
      `Remaining legacy routes: ${existingRoutes.join(", ")}`
    );
  } catch (err: unknown) {
    assert(7, "legacy admin CMS routes are decommissioned", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 8: /admin is platform-oriented
  // -------------------------------------------------------------
  try {
    const adminPagePath = path.join(srcDir, "app", "admin", "page.tsx");
    const adminPageContent = fs.readFileSync(adminPagePath, "utf-8");
    const hasPlatformControlMessaging =
      adminPageContent.includes("Platform Executive Control Plane") ||
      adminPageContent.includes("SaaS Administration Hub");
    const hasStatsCall = adminPageContent.includes("/api/admin/stats");
    const hasNoSingleTenantFields =
      !adminPageContent.includes("bioBlurb") &&
      !adminPageContent.includes("currentlyBuilding") &&
      !adminPageContent.includes("aboutP1");
    const passed = hasPlatformControlMessaging && hasStatsCall && hasNoSingleTenantFields;
    assert(
      8,
      "/admin is platform-oriented",
      passed,
      `Platform messaging: ${hasPlatformControlMessaging}, Stats call: ${hasStatsCall}, No tenant fields: ${hasNoSingleTenantFields}`
    );
  } catch (err: unknown) {
    assert(8, "/admin is platform-oriented", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 9: /admin links to platform management
  // -------------------------------------------------------------
  try {
    const adminPagePath = path.join(srcDir, "app", "admin", "page.tsx");
    const adminLayoutPath = path.join(srcDir, "app", "admin", "layout.tsx");
    const adminShellPath = path.join(srcDir, "components", "AdminShell.tsx");
    const adminPageContent = fs.readFileSync(adminPagePath, "utf-8");
    const adminLayoutContent = fs.readFileSync(adminLayoutPath, "utf-8");
    const adminShellContent = fs.existsSync(adminShellPath)
      ? fs.readFileSync(adminShellPath, "utf-8")
      : "";
    const combinedLayoutContent = adminLayoutContent + "\n" + adminShellContent;

    const pageLinksUsers = adminPageContent.includes("/admin/users");
    const pageLinksStats = adminPageContent.includes("/admin/stats");
    const layoutLinksUsers = combinedLayoutContent.includes("/admin/users");
    const layoutLinksStats = combinedLayoutContent.includes("/admin/stats");

    const passed = pageLinksUsers && pageLinksStats && layoutLinksUsers && layoutLinksStats;
    assert(
      9,
      "/admin links to platform management",
      passed,
      `Page: users=${pageLinksUsers}, stats=${pageLinksStats} | Layout/Shell: users=${layoutLinksUsers}, stats=${layoutLinksStats}`
    );
  } catch (err: unknown) {
    assert(9, "/admin links to platform management", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 10: /admin has return path to /dashboard
  // -------------------------------------------------------------
  try {
    const adminLayoutPath = path.join(srcDir, "app", "admin", "layout.tsx");
    const adminShellPath = path.join(srcDir, "components", "AdminShell.tsx");
    const adminPagePath = path.join(srcDir, "app", "admin", "page.tsx");
    const adminLayoutContent = fs.readFileSync(adminLayoutPath, "utf-8");
    const adminShellContent = fs.existsSync(adminShellPath)
      ? fs.readFileSync(adminShellPath, "utf-8")
      : "";
    const combinedLayoutContent = adminLayoutContent + "\n" + adminShellContent;
    const adminPageContent = fs.readFileSync(adminPagePath, "utf-8");

    const layoutHasReturn =
      combinedLayoutContent.includes("/dashboard") &&
      combinedLayoutContent.includes("Return to My Portfolio Dashboard");
    const pageHasReturn = adminPageContent.includes("/dashboard");

    const passed = layoutHasReturn && pageHasReturn;
    assert(
      10,
      "/admin has return path to /dashboard",
      passed,
      `Layout/Shell has return link: ${layoutHasReturn}, Page has dashboard link: ${pageHasReturn}`
    );
  } catch (err: unknown) {
    assert(10, "/admin has return path to /dashboard", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 11: superadmin receives Platform Admin navigation
  // -------------------------------------------------------------
  try {
    const shellPath = path.join(srcDir, "components", "dashboard", "DashboardShell.tsx");
    const shellContent = fs.readFileSync(shellPath, "utf-8");
    const hasSuperadminCheck = shellContent.includes('user.role === "superadmin"');
    const hasAdminLink = shellContent.includes('href="/admin"');
    const hasPlatformAdminLabel = shellContent.includes("Platform Admin");

    const passed = hasSuperadminCheck && hasAdminLink && hasPlatformAdminLabel;
    assert(
      11,
      "superadmin receives Platform Admin navigation",
      passed,
      `Superadmin check: ${hasSuperadminCheck}, Admin link: ${hasAdminLink}, Platform Admin label: ${hasPlatformAdminLabel}`
    );
  } catch (err: unknown) {
    assert(11, "superadmin receives Platform Admin navigation", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 12: normal users do not receive Platform Admin navigation
  // -------------------------------------------------------------
  try {
    const shellPath = path.join(srcDir, "components", "dashboard", "DashboardShell.tsx");
    const shellContent = fs.readFileSync(shellPath, "utf-8");
    // Verify that the link to /admin is strictly conditionally guarded by user.role === "superadmin"
    // and NOT present in the unconditional navItems list.
    const navItemsDefinition = shellContent.slice(
      shellContent.indexOf("const navItems = ["),
      shellContent.indexOf("];", shellContent.indexOf("const navItems = [") + 1)
    );
    const inNavItems = navItemsDefinition.includes("/admin");
    const strictlyGuarded =
      shellContent.includes('{user.role === "superadmin" &&') && !inNavItems;

    // Also check dashboard layout guard: suspended accounts are redirected and cannot see shell
    const layoutPath = path.join(srcDir, "app", "dashboard", "layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");
    const guardsSuspended = layoutContent.includes('userDoc.accountStatus === "suspended"');

    const passed = strictlyGuarded && guardsSuspended;
    assert(
      12,
      "normal users do not receive Platform Admin navigation",
      passed,
      `Strictly guarded: ${strictlyGuarded}, In default navItems: ${inNavItems}, Suspended guard: ${guardsSuspended}`
    );
  } catch (err: unknown) {
    assert(12, "normal users do not receive Platform Admin navigation", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 13: getPortfolioData() has zero production call-sites
  // -------------------------------------------------------------
  try {
    const getDataPath = path.join(srcDir, "lib", "getData.ts");
    const getDataContent = fs.readFileSync(getDataPath, "utf-8");
    const exportsUnscoped = getDataContent.includes("function getPortfolioData(");

    let unscopedCallSites = 0;
    for (const filePath of allSrcFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      // Check for calls to getPortfolioData( but not getPortfolioDataByOwnerId(
      const matches = content.match(/getPortfolioData\(/g);
      if (matches) {
        unscopedCallSites += matches.length;
      }
    }
    const passed = !exportsUnscoped && unscopedCallSites === 0;
    assert(
      13,
      "getPortfolioData() has zero production call-sites",
      passed,
      `Exports unscoped: ${exportsUnscoped}, Call-sites in src: ${unscopedCallSites}`
    );
  } catch (err: unknown) {
    assert(13, "getPortfolioData() has zero production call-sites", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 14: getPortfolioDataByOwnerId() remains available
  // -------------------------------------------------------------
  const testUserId = new Types.ObjectId();
  const testUsername = `p19-user-${Date.now()}`;
  try {
    await User.create({
      _id: testUserId,
      name: "Phase 19 User",
      email: `p19-${Date.now()}@example.com`,
      username: testUsername,
      passwordHash: await hashPassword("ValidPass123!"),
      profession: "developer",
      plan: "free",
      role: "user",
      accountStatus: "active",
      allowedTemplates: ["developer"],
    });

    await Profile.create({
      ownerId: testUserId,
      name: "Phase 19 User",
      bioBlurb: "Phase 19 Portfolio Testing",
      selectedTemplate: "developer",
      publicationStatus: "published",
      roles: ["Full Stack Engineer"],
    });

    await Project.create({
      ownerId: testUserId,
      title: "Phase 19 Project",
      description: "Testing getPortfolioDataByOwnerId",
      tags: ["Next.js", "TypeScript"],
      order: 1,
    });

    const data = await getPortfolioDataByOwnerId(testUserId);
    const passed =
      data !== null &&
      data.profile.name === "Phase 19 User" &&
      data.projects.length === 1 &&
      data.projects[0].title === "Phase 19 Project";

    assert(
      14,
      "getPortfolioDataByOwnerId() remains available",
      passed,
      `Data returned: ${!!data}, Projects: ${data?.projects.length}`
    );
  } catch (err: unknown) {
    assert(14, "getPortfolioDataByOwnerId() remains available", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 15: message API no longer has superadmin fallback
  // -------------------------------------------------------------
  try {
    // Send POST with no username provided
    const req = createMockRequest("/api/messages", "POST", {
      name: "Sender",
      email: "sender@example.com",
      message: "Hello superadmin fallback attempt",
    });
    const res = await postMessageHandler(req);
    const json = await res.json();
    const passed =
      res.status === 400 &&
      json.success === false &&
      typeof json.error === "string" &&
      json.error.toLowerCase().includes("username is required");
    assert(
      15,
      "message API no longer has superadmin fallback",
      passed,
      `Status: ${res.status}, Error: ${json.error}`
    );
  } catch (err: unknown) {
    assert(15, "message API no longer has superadmin fallback", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 16: public tenant contact still requires username
  // -------------------------------------------------------------
  try {
    const req = createMockRequest("/api/messages", "POST", {
      username: testUsername,
      name: "Sender Name",
      email: "sender@example.com",
      message: "Valid tenant message submission",
    });
    const res = await postMessageHandler(req);
    const json = await res.json();
    const createdMsg = await Message.findOne({ ownerId: testUserId }).lean();
    const passed = res.status === 201 && json.success === true && !!createdMsg;
    assert(
      16,
      "public tenant contact still requires username",
      passed,
      `Status: ${res.status}, Message saved: ${!!createdMsg}`
    );
  } catch (err: unknown) {
    assert(16, "public tenant contact still requires username", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 17: no broken /?template=developer dependency remains
  // -------------------------------------------------------------
  try {
    let brokenTemplateQueryInSrc = 0;
    for (const filePath of allSrcFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      if (content.includes("/?template=developer")) {
        brokenTemplateQueryInSrc++;
      }
    }
    const publicPagePath = path.join(srcDir, "app", "p", "[username]", "page.tsx");
    const publicPageContent = fs.readFileSync(publicPagePath, "utf-8");
    const ignoresQueryParam = publicPageContent.includes(
      "Query parameters (?template=... or ?p=...) are strictly IGNORED"
    );

    const passed = brokenTemplateQueryInSrc === 0 && ignoresQueryParam;
    assert(
      17,
      "no broken /?template=developer dependency remains",
      passed,
      `Occurrences in src: ${brokenTemplateQueryInSrc}, Ignores query param: ${ignoresQueryParam}`
    );
  } catch (err: unknown) {
    assert(17, "no broken /?template=developer dependency remains", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 18: Phase 16 accountStatus behavior remains intact
  // -------------------------------------------------------------
  try {
    // Suspend the test user
    await User.updateOne({ _id: testUserId }, { accountStatus: "suspended" });

    // Contact submission for suspended user should return 404
    const req = createMockRequest("/api/messages", "POST", {
      username: testUsername,
      name: "Sender Name",
      email: "sender@example.com",
      message: "Message to suspended tenant",
    });
    const res = await postMessageHandler(req);

    // Metadata for suspended user should return "Portfolio Not Found"
    const meta = await generatePublicMetadata({ params: Promise.resolve({ username: testUsername }) });
    const titleIs404 = String(meta.title).includes("Portfolio Not Found");

    const passed = res.status === 404 && titleIs404;
    assert(
      18,
      "Phase 16 accountStatus behavior remains intact",
      passed,
      `Contact status: ${res.status}, Metadata title: ${meta.title}`
    );
  } catch (err: unknown) {
    assert(18, "Phase 16 accountStatus behavior remains intact", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 19: Phase 17 publicationStatus behavior remains intact
  // -------------------------------------------------------------
  try {
    // Reactivate user but make profile unpublished
    await User.updateOne({ _id: testUserId }, { accountStatus: "active" });
    await Profile.updateOne({ ownerId: testUserId }, { publicationStatus: "unpublished" });

    // Contact submission for unpublished user should return 404
    const reqUnpub = createMockRequest("/api/messages", "POST", {
      username: testUsername,
      name: "Sender Name",
      email: "sender@example.com",
      message: "Message to unpublished tenant",
    });
    const resUnpub = await postMessageHandler(reqUnpub);

    // Metadata for unpublished user should return "Portfolio Not Found"
    const metaUnpub = await generatePublicMetadata({ params: Promise.resolve({ username: testUsername }) });
    const titleIs404Unpub = String(metaUnpub.title).includes("Portfolio Not Found");

    // Republish and confirm accessibility is restored
    await Profile.updateOne({ ownerId: testUserId }, { publicationStatus: "published" });
    const metaPub = await generatePublicMetadata({ params: Promise.resolve({ username: testUsername }) });
    const titleIsPublished = String(metaPub.title).includes("Phase 19 User");

    const passed =
      resUnpub.status === 404 && titleIs404Unpub && titleIsPublished;
    assert(
      19,
      "Phase 17 publicationStatus behavior remains intact",
      passed,
      `Unpublished status: ${resUnpub.status}, Unpublished title: ${metaUnpub.title}, Published title: ${metaPub.title}`
    );
  } catch (err: unknown) {
    assert(19, "Phase 17 publicationStatus behavior remains intact", false, String(err));
  }

  // -------------------------------------------------------------
  // Test 20: Phase 18 root landing behavior remains intact
  // -------------------------------------------------------------
  try {
    const rootPagePath = path.join(srcDir, "app", "page.tsx");
    const rootPageContent = fs.readFileSync(rootPagePath, "utf-8");
    const hasLandingComponents =
      rootPageContent.includes("LandingNavbar") &&
      rootPageContent.includes("LandingHero") &&
      rootPageContent.includes("TemplateShowcase") &&
      rootPageContent.includes("FeatureGrid") &&
      rootPageContent.includes("PricingComparison");
    const hasNoTenantLeak =
      !rootPageContent.includes("getPortfolioDataByOwnerId") &&
      !rootPageContent.includes("initialData");

    const passed = hasLandingComponents && hasNoTenantLeak;
    assert(
      20,
      "Phase 18 root landing behavior remains intact",
      passed,
      `Has landing components: ${hasLandingComponents}, No tenant leak: ${hasNoTenantLeak}`
    );
  } catch (err: unknown) {
    assert(20, "Phase 18 root landing behavior remains intact", false, String(err));
  }

  // Cleanup test data
  try {
    await User.deleteOne({ _id: testUserId });
    await Profile.deleteOne({ ownerId: testUserId });
    await Project.deleteMany({ ownerId: testUserId });
    await Message.deleteMany({ ownerId: testUserId });
    console.log("\n✓ Cleaned up temporary Phase 19 test records.");
  } catch (cleanupErr) {
    console.error("Cleanup error:", cleanupErr);
  }

  await mongoose.disconnect();

  console.log("\n===============================================================");
  console.log("             PHASE 19 TEST RESULTS SUMMARY                     ");
  console.log("===============================================================");
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`Results: ${passedCount}/${results.length} tests passed.\n`);

  if (passedCount === 20) {
    console.log("✓ ALL 20 PHASE 19 HARDENING TESTS PASSED!\n");
    process.exit(0);
  } else {
    console.error(`✗ ${results.length - passedCount} TESTS FAILED.`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Fatal test runner failure:", err);
  process.exit(1);
});
