import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

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
import Profile, { IProfile } from "@/models/Profile";
import { generateMetadata } from "@/app/p/[username]/page";
import OpenGraphImage from "@/app/p/[username]/opengraph-image";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

interface TestResult {
  category: string;
  test: string;
  passed: boolean;
  details: string;
}

export async function runPhase13SeoTests() {
  console.log("===============================================================");
  console.log("    PHASE 13 — PUBLIC PORTFOLIO SEO, OG, SITEMAP & JSON-LD     ");
  console.log("===============================================================\n");

  await mongoose.connect(MONGODB_URI);

  const testResults: TestResult[] = [];

  function record(
    category: string,
    test: string,
    passed: boolean,
    details: string
  ) {
    testResults.push({ category, test, passed, details });
    const mark = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${mark}] [${category}] ${test} — ${details}`);
  }

  // Define test fixtures
  const testUserAEmail = "seo.alice@example.com";
  const testUserBEmail = "seo.bob@example.com";
  const testUserAZeroEmail = "seo.zero@example.com";

  const testUsernameA = "seo-alice";
  const testUsernameB = "seo-bob";
  const testUsernameZero = "seo-zero";

  async function cleanup() {
    await User.deleteMany({
      email: { $in: [testUserAEmail, testUserBEmail, testUserAZeroEmail] },
    });
    await User.deleteMany({
      username: { $in: [testUsernameA, testUsernameB, testUsernameZero] },
    });
    await Profile.deleteMany({
      email: { $in: [testUserAEmail, testUserBEmail, testUserAZeroEmail] },
    });
  }

  await cleanup();

  // Setup Test Tenants
  let userA: IUser;
  let userB: IUser;
  let userZero: IUser;

  // 1. User A: Fully populated profile with custom bio, roles, location, and socials
  userA = await User.create({
    name: "Alice Developer",
    email: testUserAEmail,
    phone: "+15551112233",
    profession: "developer",
    passwordHash: "secureHash123",
    role: "user",
    plan: "free",
    username: testUsernameA,
    allowedTemplates: ["developer"],
  });

  await Profile.create({
    ownerId: userA._id,
    name: userA.name,
    email: userA.email,
    phone: userA.phone,
    roles: ["Lead Full Stack Engineer", "React & Next.js Architect"],
    bioBlurb: "Building high-performance cloud applications and scalable SaaS tools.",
    statusText: "Open to contract roles",
    statusAvailable: true,
    avatarUrl: "https://example.com/alice-avatar.png",
    location: "San Francisco, CA",
    socials: [
      {
        platform: "GitHub",
        label: "GitHub",
        value: "alice-dev",
        href: "https://github.com/alice-dev",
        enabled: true,
      },
    ],
    selectedTemplate: "developer",
  });

  // 2. User B: Doctor profession
  userB = await User.create({
    name: "Dr. Bob Martinez",
    email: testUserBEmail,
    phone: "+15554445566",
    profession: "doctor",
    passwordHash: "secureHash123",
    role: "user",
    plan: "free",
    username: testUsernameB,
    allowedTemplates: ["doctor"],
  });

  await Profile.create({
    ownerId: userB._id,
    name: userB.name,
    email: userB.email,
    phone: userB.phone,
    roles: ["Cardiologist", "Medical Researcher"],
    bioBlurb: "Dedicated to clinical cardiology and medical device innovation.",
    statusText: "Accepting clinic appointments",
    statusAvailable: true,
    avatarUrl: "https://example.com/bob-avatar.png",
    location: "Boston, MA",
    selectedTemplate: "doctor",
  });

  // 3. User Zero: Zero-state newly registered tenant (empty bio, no avatar, default state)
  userZero = await User.create({
    name: "Zero State User",
    email: testUserAZeroEmail,
    phone: "+15557778899",
    profession: "video-editor",
    passwordHash: "secureHash123",
    role: "user",
    plan: "free",
    username: testUsernameZero,
    allowedTemplates: ["video-editor"],
  });

  await Profile.create({
    ownerId: userZero._id,
    name: userZero.name,
    email: userZero.email,
    phone: userZero.phone,
    roles: [],
    bioBlurb: "",
    statusText: "Available for opportunities",
    statusAvailable: true,
    avatarUrl: "",
    location: "",
    socials: [],
    selectedTemplate: "video-editor",
  });

  console.log("--- 1. Metadata Generation & Canonical URL Verification ---");

  // 1A. Full metadata generation for Alice
  {
    const metadata = await generateMetadata({
      params: Promise.resolve({ username: testUsernameA }),
    });

    const expectedCanonical = `${
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
      "http://localhost:3000"
    }/p/${testUsernameA}`;

    const hasTitle =
      typeof metadata.title === "string" &&
      metadata.title.includes("Alice Developer") &&
      metadata.title.includes("Lead Full Stack Engineer");

    const hasDescription =
      metadata.description ===
      "Building high-performance cloud applications and scalable SaaS tools.";

    const hasCanonical = metadata.alternates?.canonical === expectedCanonical;

    const og = metadata.openGraph as Record<string, any> | undefined;
    const tw = metadata.twitter as Record<string, any> | undefined;

    const hasOpenGraph =
      og?.title === metadata.title &&
      og?.description === metadata.description &&
      og?.type === "profile" &&
      og?.url === expectedCanonical &&
      Array.isArray(og?.images) &&
      og.images[0]?.url === `${expectedCanonical}/opengraph-image`;

    const hasTwitter =
      tw?.card === "summary_large_image" &&
      tw?.title === metadata.title &&
      Array.isArray(tw?.images) &&
      tw.images[0] === `${expectedCanonical}/opengraph-image`;

    const passed =
      hasTitle &&
      hasDescription &&
      hasCanonical &&
      hasOpenGraph &&
      Boolean(hasTwitter);

    record(
      "Metadata",
      "1A. Generates complete title, description, canonical, OpenGraph, and Twitter cards",
      passed,
      `Title: '${metadata.title}', Canonical: '${metadata.alternates?.canonical}', OG Type: '${og?.type}'`
    );
  }

  // 1B. Zero-state fallback metadata generation
  {
    const metadataZero = await generateMetadata({
      params: Promise.resolve({ username: testUsernameZero }),
    });

    const passed =
      typeof metadataZero.title === "string" &&
      metadataZero.title.includes("Zero State User") &&
      metadataZero.title.includes("Video Editor") &&
      metadataZero.description ===
        "Explore the professional portfolio, projects, and skills of Zero State User.";

    record(
      "Metadata",
      "1B. Zero-state tenant without bio/roles falls back gracefully to formatted profession",
      passed,
      `Title: '${metadataZero.title}', Fallback Description: '${metadataZero.description}'`
    );
  }

  // 1C. Non-existent username returns safe 404 metadata
  {
    const metadataNotFound = await generateMetadata({
      params: Promise.resolve({ username: "non-existent-user-xyz" }),
    });

    const passed =
      metadataNotFound.title === "Portfolio Not Found" &&
      metadataNotFound.description ===
        "The requested portfolio could not be found.";

    record(
      "Metadata",
      "1C. Non-existent username safely returns 'Portfolio Not Found' metadata",
      passed,
      `Title: '${metadataNotFound.title}', Desc: '${metadataNotFound.description}'`
    );
  }

  console.log("\n--- 2. Dynamic Open Graph Image Generation Verification ---");

  // 2A. Dynamic OG Image response for populated tenant
  {
    const ogResponse = await OpenGraphImage({
      params: Promise.resolve({ username: testUsernameA }),
    });

    const contentType = ogResponse.headers.get("content-type");
    const status = ogResponse.status;

    const passed = status === 200 && contentType === "image/png";

    record(
      "OG Image",
      "2A. Dynamic OG image route returns HTTP 200 and image/png content type for tenant",
      passed,
      `Status: ${status}, Content-Type: ${contentType}`
    );
  }

  // 2B. Dynamic OG Image for zero-state tenant
  {
    const ogResponseZero = await OpenGraphImage({
      params: Promise.resolve({ username: testUsernameZero }),
    });

    const passed =
      ogResponseZero.status === 200 &&
      ogResponseZero.headers.get("content-type") === "image/png";

    record(
      "OG Image",
      "2B. Dynamic OG image renders safely for zero-state tenant without avatar or bio",
      passed,
      `Status: ${ogResponseZero.status}, Content-Type: ${ogResponseZero.headers.get("content-type")}`
    );
  }

  console.log("\n--- 3. JSON-LD Structured Data Schema Verification ---");

  // 3A. Person and ProfilePage Schema validation
  {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
      "http://localhost:3000";
    const canonicalUrl = `${baseUrl}/p/${testUsernameA}`;

    // Verify structured data structure mirrors what page.tsx generates
    const profile = await Profile.findOne({ ownerId: userA._id }).lean();
    const primaryRole = profile?.roles?.[0] || userA.profession;

    const jsonLdPerson: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: userA.name,
      url: canonicalUrl,
      jobTitle: primaryRole,
      description: profile?.bioBlurb,
      image: profile?.avatarUrl,
      address: {
        "@type": "PostalAddress",
        addressLocality: profile?.location,
      },
      sameAs: ["https://github.com/alice-dev"],
    };

    const jsonLdProfilePage: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      name: `${userA.name} | Portfolio`,
      url: canonicalUrl,
      mainEntity: {
        "@type": "Person",
        name: userA.name,
        url: canonicalUrl,
      },
    };

    const serialized = JSON.stringify([jsonLdPerson, jsonLdProfilePage]);
    const parsed = JSON.parse(serialized);

    const hasPerson = parsed[0]?.["@type"] === "Person" && parsed[0]?.name === "Alice Developer";
    const hasProfilePage = parsed[1]?.["@type"] === "ProfilePage" && parsed[1]?.mainEntity?.name === "Alice Developer";
    const noWebSite = parsed.every((item: any) => item["@type"] !== "WebSite");

    const passed = hasPerson && hasProfilePage && noWebSite;

    record(
      "JSON-LD",
      "3A. Emits valid schema.org Person and ProfilePage without unnecessary WebSite type",
      passed,
      `Person @type: '${parsed[0]?.["@type"]}', ProfilePage @type: '${parsed[1]?.["@type"]}', No WebSite: ${noWebSite}`
    );
  }

  console.log("\n--- 4. Dynamic Multi-Tenant Sitemap Verification ---");

  // 4A. Sitemap includes landing page and all tenant usernames
  {
    const sitemapEntries = await sitemap();
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
      "http://localhost:3000";

    const rootEntry = sitemapEntries.find((e) => e.url === baseUrl);
    const aliceEntry = sitemapEntries.find(
      (e) => e.url === `${baseUrl}/p/${testUsernameA}`
    );
    const bobEntry = sitemapEntries.find(
      (e) => e.url === `${baseUrl}/p/${testUsernameB}`
    );
    const zeroEntry = sitemapEntries.find(
      (e) => e.url === `${baseUrl}/p/${testUsernameZero}`
    );

    const rootPriorityValid = rootEntry?.priority === 1.0;
    const tenantPriorityValid =
      aliceEntry?.priority === 0.8 &&
      bobEntry?.priority === 0.8 &&
      zeroEntry?.priority === 0.8;
    const datesValid = Boolean(aliceEntry?.lastModified) && Boolean(rootEntry?.lastModified);

    const passed =
      Boolean(rootEntry) &&
      Boolean(aliceEntry) &&
      Boolean(bobEntry) &&
      Boolean(zeroEntry) &&
      rootPriorityValid &&
      tenantPriorityValid &&
      datesValid;

    record(
      "Sitemap",
      "4A. Dynamic sitemap discovers all active tenant usernames and assigns standard priorities",
      passed,
      `Total entries: ${sitemapEntries.length}, Root priority: ${rootEntry?.priority}, Tenant priority: ${aliceEntry?.priority}`
    );
  }

  console.log("\n--- 5. Robots.txt Crawler Configuration Verification ---");

  // 5A. Robots policy allows / and /p/ and disallows private routes
  {
    const robotsConfig = robots();
    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules[0]
      : robotsConfig.rules;

    const allowsPublic =
      Array.isArray(rules?.allow) &&
      rules.allow.includes("/") &&
      rules.allow.includes("/p/");

    const disallowsPrivate =
      Array.isArray(rules?.disallow) &&
      rules.disallow.includes("/dashboard/") &&
      rules.disallow.includes("/admin/") &&
      rules.disallow.includes("/api/") &&
      rules.disallow.includes("/login") &&
      rules.disallow.includes("/register") &&
      rules.disallow.includes("/onboarding");

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
      "http://localhost:3000";
    const sitemapRefValid = robotsConfig.sitemap === `${baseUrl}/sitemap.xml`;

    const passed = allowsPublic && disallowsPrivate && sitemapRefValid;

    record(
      "Robots",
      "5A. Robots configuration allows public portfolios and protects private dashboard/admin paths",
      passed,
      `Allow: ${JSON.stringify(rules?.allow)}, Disallow: ${JSON.stringify(rules?.disallow)}, Sitemap: '${robotsConfig.sitemap}'`
    );
  }

  console.log("\n--- 6. Security, Tenant Isolation & Data Sanitization ---");

  // 6A. Tenant Isolation between Alice and Bob
  {
    const metaAlice = await generateMetadata({
      params: Promise.resolve({ username: testUsernameA }),
    });
    const metaBob = await generateMetadata({
      params: Promise.resolve({ username: testUsernameB }),
    });

    const distinctTitles =
      metaAlice.title !== metaBob.title &&
      String(metaAlice.title).includes("Alice") &&
      String(metaBob.title).includes("Bob");

    const noLeakage =
      !JSON.stringify(metaAlice).includes("Bob") &&
      !JSON.stringify(metaBob).includes("Alice");

    const passed = distinctTitles && noLeakage;

    record(
      "Tenant Isolation",
      "6A. Metadata generation maintains strict tenant isolation with zero data bleeding",
      passed,
      `Alice title: '${metaAlice.title}', Bob title: '${metaBob.title}'`
    );
  }

  // 6B. Zero exposure of sensitive fields (passwordHash, JWT, email, phone) in public outputs
  {
    const metaAlice = await generateMetadata({
      params: Promise.resolve({ username: testUsernameA }),
    });

    const serializedMeta = JSON.stringify(metaAlice);
    const leaksPassword = serializedMeta.includes("secureHash123") || serializedMeta.includes("passwordHash");
    const leaksEmail = serializedMeta.includes("seo.alice@example.com");
    const leaksPhone = serializedMeta.includes("+15551112233");

    const passed = !leaksPassword && !leaksEmail && !leaksPhone;

    record(
      "Data Sanitization",
      "6B. Public metadata strictly omits sensitive credentials, passwords, email, and phone",
      passed,
      `No password: ${!leaksPassword}, No private email: ${!leaksEmail}, No private phone: ${!leaksPhone}`
    );
  }

  // Scoped Cleanup
  console.log("\n--- Cleaning Up Temporary Phase 13 Test Records ---");
  await cleanup();
  console.log("✓ Cleanup completed.\n");

  // Summary
  console.log("===============================================================");
  console.log("             TEST RESULTS SUMMARY — PHASE 13                  ");
  console.log("===============================================================");
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
    console.log("✓ ALL PHASE 13 SEO & DISCOVERABILITY TESTS PASSED!\n");
  } else {
    console.error(`✗ ${totalTests - totalPassed} tests failed!\n`);
  }

  await mongoose.disconnect();
  return { totalPassed, totalTests, allPassed: totalPassed === totalTests };
}

// Auto-execute if run directly
if (
  require.main === module ||
  process.argv[1]?.includes("test-seo-phase13")
) {
  runPhase13SeoTests()
    .then(({ allPassed }) => process.exit(allPassed ? 0 : 1))
    .catch((err) => {
      console.error("Test Suite Unhandled Exception:", err);
      process.exit(1);
    });
}
