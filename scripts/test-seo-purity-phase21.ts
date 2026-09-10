/**
 * PHASE 21 — Multi-Tenant SEO Purity & Platform Identity Remediation Integration Tests
 *
 * Verifies that:
 * 1. Tenant A public structured data reflects exclusively Tenant A identity (no Tenant B, no platform creator).
 * 2. Tenant B public structured data reflects exclusively Tenant B identity (no Tenant A, no platform creator).
 * 3. Zero-state tenant public structured data has zero creator identity, and Profile schema defaults are neutral.
 * 4. Root layout is free of global/person JSON-LD, and platform landing page emits platform-appropriate structured data.
 * 5. Template presentation components (DevNavbar, DevHero) render tenant-owned data without creator fallbacks.
 * 6. Decommissioned legacy components and initialData.ts are completely removed.
 */

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

/* eslint-disable @typescript-eslint/no-explicit-any */

import User from "@/models/User";
import Profile from "@/models/Profile";
import PublicPortfolioPage from "@/app/p/[username]/page";

interface TestResult {
  category: string;
  test: string;
  passed: boolean;
  details: string;
}

const FORBIDDEN_CREATOR_TOKENS = [
  "Sahadat",
  "Hossen",
  "sahadathossen",
  "sahadat.hossen1435@gmail.com",
  "1606081657",
  "8801606081657",
  "Dhaka",
  "Full Stack MERN Developer",
  "/profile.jpg",
  "sahadathossen.dev",
  "Inspire Soft",
];

export async function runPhase21SeoPurityTests() {
  console.log("===============================================================");
  console.log("    PHASE 21 — PLATFORM IDENTITY REMEDIATION & SEO PURITY      ");
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

  const timestamp = Date.now();
  const usernameA = `purity-alice-${timestamp}`;
  const usernameB = `purity-bob-${timestamp}`;
  const usernameZero = `purity-zero-${timestamp}`;

  let userA: any = null;
  let userB: any = null;
  let userZero: any = null;
  let profileA: any = null;
  let profileB: any = null;
  let profileZero: any = null;

  try {
    // -------------------------------------------------------------
    // Setup Test Fixtures
    // -------------------------------------------------------------
    userA = await User.create({
      name: "Alice Montgomery",
      email: `alice.${timestamp}@example.com`,
      phone: "+15551234567",
      profession: "developer",
      passwordHash: "hash123",
      role: "user",
      plan: "free",
      username: usernameA,
      allowedTemplates: ["developer"],
    });

    profileA = await Profile.create({
      ownerId: userA._id,
      name: "Alice Montgomery",
      roles: ["Cloud Solutions Architect", "Distributed Systems Engineer"],
      bioBlurb: "Alice builds planetary-scale backend systems.",
      statusText: "Consulting for enterprise clients",
      statusAvailable: true,
      avatarUrl: "https://example.com/alice.jpg",
      location: "Seattle, WA",
      socials: [
        {
          platform: "github",
          label: "GitHub",
          value: "alice-cloud",
          href: "https://github.com/alice-cloud",
          enabled: true,
        },
      ],
      publicationStatus: "published",
    });

    userB = await User.create({
      name: "Dr. Robert Chen",
      email: `bob.${timestamp}@example.com`,
      phone: "+15559876543",
      profession: "doctor",
      passwordHash: "hash456",
      role: "user",
      plan: "premium",
      username: usernameB,
      allowedTemplates: ["doctor"],
    });

    profileB = await Profile.create({
      ownerId: userB._id,
      name: "Dr. Robert Chen",
      roles: ["Interventional Cardiologist", "Clinical Researcher"],
      bioBlurb: "Dr. Chen specializes in advanced cardiovascular diagnostics.",
      statusText: "Accepting new hospital patients",
      statusAvailable: true,
      avatarUrl: "https://example.com/bob.jpg",
      location: "Boston, MA",
      socials: [
        {
          platform: "linkedin",
          label: "LinkedIn",
          value: "dr-robert-chen",
          href: "https://linkedin.com/in/dr-robert-chen",
          enabled: true,
        },
      ],
      publicationStatus: "published",
    });

    userZero = await User.create({
      name: "Zero State User",
      email: `zero.${timestamp}@example.com`,
      phone: "+15550000000",
      profession: "video-editor",
      passwordHash: "hash789",
      role: "user",
      plan: "free",
      username: usernameZero,
      allowedTemplates: ["video-editor"],
    });

    // Profile Zero created using schema defaults ONLY
    profileZero = await Profile.create({
      ownerId: userZero._id,
      name: userZero.name,
      publicationStatus: "published",
    });

    console.log("--- 1. Tenant A SEO Purity & Structured Data Verification ---");
    {
      const jsxA = await PublicPortfolioPage({
        params: Promise.resolve({ username: usernameA }),
      });

      const scriptElement = jsxA.props.children[0];
      const jsonRaw = scriptElement?.props?.dangerouslySetInnerHTML?.__html;
      const parsed = JSON.parse(jsonRaw || "[]");

      const personSchema = parsed.find((item: any) => item["@type"] === "Person");
      const profilePageSchema = parsed.find((item: any) => item["@type"] === "ProfilePage");

      const hasAliceName = personSchema?.name === "Alice Montgomery" && profilePageSchema?.name?.includes("Alice Montgomery");
      const hasAliceRole = personSchema?.jobTitle === "Cloud Solutions Architect";
      const hasAliceDesc = personSchema?.description === "Alice builds planetary-scale backend systems.";
      const hasAliceImage = personSchema?.image === "https://example.com/alice.jpg";
      const hasAliceLoc = personSchema?.address?.addressLocality === "Seattle, WA";
      const hasAliceSameAs = Array.isArray(personSchema?.sameAs) && personSchema?.sameAs.includes("https://github.com/alice-cloud");

      const noBobName = !jsonRaw.includes("Robert Chen") && !jsonRaw.includes("Cardiologist");

      // Verify ZERO platform creator contamination
      const creatorContaminants = FORBIDDEN_CREATOR_TOKENS.filter((token) =>
        jsonRaw.toLowerCase().includes(token.toLowerCase())
      );

      const passed =
        Boolean(personSchema) &&
        Boolean(profilePageSchema) &&
        hasAliceName &&
        hasAliceRole &&
        hasAliceDesc &&
        hasAliceImage &&
        hasAliceLoc &&
        hasAliceSameAs &&
        noBobName &&
        creatorContaminants.length === 0;

      record(
        "Tenant A JSON-LD",
        "1. Tenant A structured data contains only Tenant A identity without contamination",
        passed,
        `Person: ${personSchema?.name}, Role: '${personSchema?.jobTitle}', Creator Contaminants: ${JSON.stringify(creatorContaminants)}`
      );
    }

    console.log("\n--- 2. Tenant B SEO Purity & Tenant Isolation Verification ---");
    {
      const jsxB = await PublicPortfolioPage({
        params: Promise.resolve({ username: usernameB }),
      });

      const scriptElement = jsxB.props.children[0];
      const jsonRaw = scriptElement?.props?.dangerouslySetInnerHTML?.__html;
      const parsed = JSON.parse(jsonRaw || "[]");

      const personSchema = parsed.find((item: any) => item["@type"] === "Person");
      const profilePageSchema = parsed.find((item: any) => item["@type"] === "ProfilePage");

      const hasBobName = personSchema?.name === "Dr. Robert Chen" && profilePageSchema?.name?.includes("Dr. Robert Chen");
      const hasBobRole = personSchema?.jobTitle === "Interventional Cardiologist";
      const hasBobDesc = personSchema?.description === "Dr. Chen specializes in advanced cardiovascular diagnostics.";
      const hasBobImage = personSchema?.image === "https://example.com/bob.jpg";
      const hasBobLoc = personSchema?.address?.addressLocality === "Boston, MA";
      const hasBobSameAs = Array.isArray(personSchema?.sameAs) && personSchema?.sameAs.includes("https://linkedin.com/in/dr-robert-chen");

      const noAliceName = !jsonRaw.includes("Alice Montgomery") && !jsonRaw.includes("Cloud Solutions Architect");

      const creatorContaminants = FORBIDDEN_CREATOR_TOKENS.filter((token) =>
        jsonRaw.toLowerCase().includes(token.toLowerCase())
      );

      const passed =
        Boolean(personSchema) &&
        Boolean(profilePageSchema) &&
        hasBobName &&
        hasBobRole &&
        hasBobDesc &&
        hasBobImage &&
        hasBobLoc &&
        hasBobSameAs &&
        noAliceName &&
        creatorContaminants.length === 0;

      record(
        "Tenant B JSON-LD",
        "2. Tenant B structured data contains only Tenant B identity without Tenant A or Creator data",
        passed,
        `Person: ${personSchema?.name}, Role: '${personSchema?.jobTitle}', Creator Contaminants: ${JSON.stringify(creatorContaminants)}`
      );
    }

    console.log("\n--- 3. Zero-State Tenant Structured Data & Schema Default Purity ---");
    {
      // Verify Profile Schema defaults stored in MongoDB
      const zeroDbProfile = await Profile.findOne({ ownerId: userZero._id }).lean();

      const defaultsPure =
        zeroDbProfile?.bioBlurb === "" &&
        zeroDbProfile?.avatarUrl === "" &&
        zeroDbProfile?.location === "" &&
        zeroDbProfile?.email === "" &&
        zeroDbProfile?.phone === "" &&
        zeroDbProfile?.whatsappNumber === "" &&
        zeroDbProfile?.whatsappMessage === "" &&
        zeroDbProfile?.messengerUrl === "" &&
        Array.isArray(zeroDbProfile?.roles) &&
        zeroDbProfile.roles.length === 0 &&
        Array.isArray(zeroDbProfile?.stats) &&
        zeroDbProfile.stats.length === 0 &&
        Array.isArray(zeroDbProfile?.floatingBadges) &&
        zeroDbProfile.floatingBadges.length === 0;

      const jsxZero = await PublicPortfolioPage({
        params: Promise.resolve({ username: usernameZero }),
      });

      const scriptElement = jsxZero.props.children[0];
      const jsonRaw = scriptElement?.props?.dangerouslySetInnerHTML?.__html;
      const parsed = JSON.parse(jsonRaw || "[]");

      const personSchema = parsed.find((item: any) => item["@type"] === "Person");
      const profilePageSchema = parsed.find((item: any) => item["@type"] === "ProfilePage");

      const hasZeroName = personSchema?.name === "Zero State User";
      const hasZeroProfilePage = Boolean(profilePageSchema) && profilePageSchema?.name?.includes("Zero State User");
      const hasProfessionFallback = personSchema?.jobTitle === "video editor";
      const noImage = personSchema?.image === undefined;
      const noAddress = personSchema?.address === undefined;
      const noBio = personSchema?.description === undefined;

      const creatorContaminants = FORBIDDEN_CREATOR_TOKENS.filter((token) =>
        jsonRaw.toLowerCase().includes(token.toLowerCase())
      );

      const passed =
        defaultsPure &&
        Boolean(personSchema) &&
        hasZeroName &&
        hasZeroProfilePage &&
        hasProfessionFallback &&
        noImage &&
        noAddress &&
        noBio &&
        creatorContaminants.length === 0;

      record(
        "Zero-State Purity",
        "3. Zero-state tenant schema defaults and structured data contain zero creator identity",
        passed,
        `Defaults Pure: ${defaultsPure}, Role fallback: '${personSchema?.jobTitle}', Contaminants: ${JSON.stringify(creatorContaminants)}`
      );
    }

    console.log("\n--- 4. Root Layout Decoupling & Platform Landing JSON-LD Verification ---");
    {
      const rootLayoutPath = path.resolve(process.cwd(), "src/app/layout.tsx");
      const rootLayoutContent = fs.readFileSync(rootLayoutPath, "utf-8");

      const noGlobalJsonLdImport = !rootLayoutContent.includes("import JsonLd");
      const noGlobalHeadJsonLd = !rootLayoutContent.includes("<JsonLd");
      const noCreatorDomainFallback = !rootLayoutContent.includes("https://sahadathossen.dev");

      // Verify Landing page imports Platform JsonLd
      const landingPagePath = path.resolve(process.cwd(), "src/app/page.tsx");
      const landingPageContent = fs.readFileSync(landingPagePath, "utf-8");
      const landingHasJsonLd = landingPageContent.includes("import JsonLd") && landingPageContent.includes("<JsonLd");

      // Verify Platform JsonLd component emits only SoftwareApplication & WebSite (no Person)
      const platformJsonLdPath = path.resolve(process.cwd(), "src/components/JsonLd.tsx");
      const platformJsonLdContent = fs.readFileSync(platformJsonLdPath, "utf-8");
      const platformHasSoftwareApp = platformJsonLdContent.includes("SoftwareApplication");
      const platformHasWebSite = platformJsonLdContent.includes("WebSite");
      const platformHasNoPerson = !platformJsonLdContent.includes('"@type": "Person"');
      const platformHasNoCreator = FORBIDDEN_CREATOR_TOKENS.every(
        (token) => !platformJsonLdContent.includes(token)
      );

      const passed =
        noGlobalJsonLdImport &&
        noGlobalHeadJsonLd &&
        noCreatorDomainFallback &&
        landingHasJsonLd &&
        platformHasSoftwareApp &&
        platformHasWebSite &&
        platformHasNoPerson &&
        platformHasNoCreator;

      record(
        "Root & Platform JSON-LD",
        "4. Root layout is decoupled from Person JSON-LD, platform structured data is isolated to landing page",
        passed,
        `No Global JsonLd: ${noGlobalHeadJsonLd}, Landing Has Platform JsonLd: ${landingHasJsonLd}, No Person in Platform: ${platformHasNoPerson}`
      );
    }

    console.log("\n--- 5. Template Presentation Fallback Purity Verification ---");
    {
      const devHeroPath = path.resolve(process.cwd(), "src/templates/developer/components/DevHero.tsx");
      const devHeroContent = fs.readFileSync(devHeroPath, "utf-8");

      const devNavbarPath = path.resolve(process.cwd(), "src/templates/developer/components/DevNavbar.tsx");
      const devNavbarContent = fs.readFileSync(devNavbarPath, "utf-8");

      const devAboutPath = path.resolve(process.cwd(), "src/templates/developer/components/DevAbout.tsx");
      const devAboutContent = fs.readFileSync(devAboutPath, "utf-8");

      const devExperiencePath = path.resolve(process.cwd(), "src/templates/developer/components/DevExperience.tsx");
      const devExperienceContent = fs.readFileSync(devExperiencePath, "utf-8");

      const devProjectsPath = path.resolve(process.cwd(), "src/templates/developer/components/DevProjects.tsx");
      const devProjectsContent = fs.readFileSync(devProjectsPath, "utf-8");

      const devSkillsPath = path.resolve(process.cwd(), "src/templates/developer/components/DevSkills.tsx");
      const devSkillsContent = fs.readFileSync(devSkillsPath, "utf-8");

      const noProfileJpg =
        !devHeroContent.includes("/profile.jpg") &&
        !devNavbarContent.includes("/profile.jpg") &&
        !devAboutContent.includes("/profile.jpg");

      const noHardcodedMernRoles = !devHeroContent.includes("Full Stack MERN Developer");
      const noHardcodedFloatingBadges = !devHeroContent.includes("from-green-500 to-emerald-600");
      const noFakeStats = !devHeroContent.includes("99%");
      const noDhakaInAbout = !devAboutContent.includes("Dhaka, Bangladesh");
      const noInspireSoft = !devExperienceContent.includes("Inspire Soft");
      const noDefaultShopFlow = !devProjectsContent.includes("ShopFlow");
      const noDefaultGtmSkill = !devSkillsContent.includes("Google Tag Manager");

      const passed =
        noProfileJpg &&
        noHardcodedMernRoles &&
        noHardcodedFloatingBadges &&
        noFakeStats &&
        noDhakaInAbout &&
        noInspireSoft &&
        noDefaultShopFlow &&
        noDefaultGtmSkill;

      record(
        "Template Purity",
        "5. Developer template components render only tenant-owned data with zero creator fallbacks",
        passed,
        `No /profile.jpg: ${noProfileJpg}, No MERN roles: ${noHardcodedMernRoles}, No fake stats: ${noFakeStats}, No InspireSoft: ${noInspireSoft}`
      );
    }

    console.log("\n--- 6. Decommissioned Legacy Code Verification ---");
    {
      const deadFiles = [
        "src/lib/initialData.ts",
        "src/components/Navbar.tsx",
        "src/components/HeroSection.tsx",
        "src/components/AboutSection.tsx",
        "src/components/ProjectsSection.tsx",
        "src/components/SkillsSection.tsx",
        "src/components/ExperienceSection.tsx",
        "src/components/ContactSection.tsx",
        "src/components/Footer.tsx",
      ];

      const existingFiles = deadFiles.filter((relPath) =>
        fs.existsSync(path.resolve(process.cwd(), relPath))
      );

      const passed = existingFiles.length === 0;

      record(
        "Dead Code Decommission",
        "6. All 9 identified dead single-tenant legacy files are completely eradicated",
        passed,
        existingFiles.length === 0
          ? "All 9 legacy files verified deleted."
          : `Remaining files: ${JSON.stringify(existingFiles)}`
      );
    }
  } finally {
    // -------------------------------------------------------------
    // Cleanup Test Fixtures
    // -------------------------------------------------------------
    console.log("\n--- Cleaning Up Temporary Phase 21 Test Records ---");
    if (userA) await User.deleteOne({ _id: userA._id });
    if (profileA) await Profile.deleteOne({ _id: profileA._id });
    if (userB) await User.deleteOne({ _id: userB._id });
    if (profileB) await Profile.deleteOne({ _id: profileB._id });
    if (userZero) await User.deleteOne({ _id: userZero._id });
    if (profileZero) await Profile.deleteOne({ _id: profileZero._id });
    console.log("✓ Cleanup completed.\n");
  }

  console.log("===============================================================");
  console.log("             TEST RESULTS SUMMARY — PHASE 21                  ");
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
    console.log("✓ ALL PHASE 21 MULTI-TENANT SEO PURITY TESTS PASSED!\n");
  } else {
    console.error(`✗ ${totalTests - totalPassed} tests failed!\n`);
  }

  await mongoose.disconnect();
  return { totalPassed, totalTests, allPassed: totalPassed === totalTests };
}

// Auto-execute if run directly
if (
  require.main === module ||
  process.argv[1]?.includes("test-seo-purity-phase21")
) {
  runPhase21SeoPurityTests()
    .then(({ allPassed }) => process.exit(allPassed ? 0 : 1))
    .catch((err) => {
      console.error("Test Suite Unhandled Exception:", err);
      process.exit(1);
    });
}
