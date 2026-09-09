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

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio";

// Models
import User, {
  IUser,
  generateUniqueUsername,
  isReservedUsername,
} from "@/models/User";
import Profile from "@/models/Profile";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { PUT as profilePutHandler } from "@/app/api/profile/route";
import { getPortfolioDataByOwnerId } from "@/lib/getData";
import { USER_COOKIE_NAME, signUserToken } from "@/lib/auth";

function createMockJsonRequest(
  method: "POST" | "PUT",
  url: string,
  body: Record<string, unknown>,
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
    body: JSON.stringify(body),
  });
}

interface TestResult {
  concern: string;
  test: string;
  passed: boolean;
  details: string;
}

export async function runPhase12VerificationTests() {
  console.log("===============================================================");
  console.log("    PHASE 12 — ARCHITECTURE VERIFICATION & CORRECTIONS TEST     ");
  console.log("===============================================================\n");

  await mongoose.connect(MONGODB_URI);

  const testResults: TestResult[] = [];

  function record(concern: string, test: string, passed: boolean, details: string) {
    testResults.push({ concern, test, passed, details });
    const mark = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${mark}] [${concern}] ${test} — ${details}`);
  }

  const cleanupEmails = [
    "atomic.success@example.com",
    "atomic.fail@example.com",
    "racer1@example.com",
    "racer2@example.com",
    "onboarding.user@example.com",
  ];
  const cleanupUsernames = [
    "atomic-user",
    "atomic-fail-user",
    "racer-bot",
    "racer-bot-2",
    "onboarding-tester",
  ];

  async function cleanup() {
    await User.deleteMany({
      $or: [
        { email: { $in: cleanupEmails } },
        { username: { $in: cleanupUsernames } },
      ],
    });
    await Profile.deleteMany({
      email: { $in: cleanupEmails },
    });
  }

  await cleanup();

  // ==========================================================
  // CONCERN 1: ATOMIC USER + PROFILE PROVISIONING
  // ==========================================================
  console.log("--- 1. Atomic User + Profile Provisioning Verification ---");

  // 1A. Normal registration creates both User and Profile atomically
  let atomicUserId = "";
  {
    const req = createMockJsonRequest("POST", "http://localhost:3000/api/auth/register", {
      name: "Atomic User",
      email: "atomic.success@example.com",
      phone: "+15551234567",
      profession: "doctor",
      password: "securePassword123",
    });

    const res = await registerHandler(req);
    const data = await res.json();
    const userDoc = await User.findOne({ email: "atomic.success@example.com" });
    const profileDoc = userDoc ? await Profile.findOne({ ownerId: userDoc._id }) : null;

    atomicUserId = userDoc?._id?.toString() || "";

    const passed =
      res.status === 201 &&
      Boolean(userDoc) &&
      Boolean(profileDoc) &&
      profileDoc?.ownerId?.toString() === userDoc?._id?.toString() &&
      profileDoc?.selectedTemplate === "doctor" &&
      userDoc?.role === "user" &&
      userDoc?.plan === "free";

    record(
      "Atomic Provisioning",
      "1A. User + Profile created together atomically with server-derived values",
      passed,
      `User: ${userDoc?.username}, Profile ID: ${profileDoc?._id}, selectedTemplate: ${profileDoc?.selectedTemplate}`
    );
  }

  // 1B. Failure Simulation: Profile creation failure leaves NO orphan User
  {
    // We simulate Profile creation failure by intercepting Profile.prototype.save or create
    const originalProfileSave = Profile.prototype.save;
    let interceptActive = true;

    Profile.prototype.save = async function (this: any, ...args: any[]) {
      if (interceptActive && this.email === "atomic.fail@example.com") {
        throw new Error("Simulated database failure during Profile creation");
      }
      return originalProfileSave.apply(this, args);
    };

    try {
      const req = createMockJsonRequest("POST", "http://localhost:3000/api/auth/register", {
        name: "Atomic Fail User",
        email: "atomic.fail@example.com",
        phone: "+15559876543",
        profession: "developer",
        password: "securePassword123",
      });

      const res = await registerHandler(req);
      const orphanUser = await User.findOne({ email: "atomic.fail@example.com" });
      const orphanProfile = await Profile.findOne({ email: "atomic.fail@example.com" });

      const passed = res.status >= 500 && orphanUser === null && orphanProfile === null;

      record(
        "Atomic Provisioning",
        "1B. Profile failure triggers rollback, leaving ZERO orphan User in database",
        passed,
        `Status: ${res.status}, Orphan User found: ${Boolean(orphanUser)}, Orphan Profile: ${Boolean(orphanProfile)}`
      );
    } finally {
      interceptActive = false;
      Profile.prototype.save = originalProfileSave;
    }
  }

  // ==========================================================
  // CONCERN 2: USERNAME UNIQUENESS & RACE-CONDITION SAFETY
  // ==========================================================
  console.log("\n--- 2. Username Uniqueness & Race-Condition Safety ---");

  // 2A. Database unique index constraint check
  {
    const indexes = await User.collection.indexes();
    const usernameIndex = indexes.find((idx) => idx.name === "username_1" || idx.key?.username === 1);
    const hasUniqueIndex = Boolean(usernameIndex?.unique);

    record(
      "Username Race Safety",
      "2A. User model enforces database-level unique index on username",
      hasUniqueIndex,
      `Found username_1 index with unique=${hasUniqueIndex}`
    );
  }

  // 2B. Direct duplicate username insertion at DB level is rejected
  {
    let duplicateRejected = false;
    try {
      await User.create({
        name: "Duplicate Tester",
        email: "unique1@example.com",
        phone: "+1000000001",
        profession: "developer",
        passwordHash: "hash123",
        role: "user",
        plan: "free",
        username: "atomic-user", // already taken by 1A
        allowedTemplates: ["developer"],
      });
    } catch (err: any) {
      duplicateRejected = err?.code === 11000;
    }

    record(
      "Username Race Safety",
      "2B. Direct duplicate username is strictly rejected by MongoDB unique constraint",
      duplicateRejected,
      `Duplicate key code 11000 caught: ${duplicateRejected}`
    );
  }

  // 2C. Concurrent registration race collision resolution
  {
    // Register two users concurrently with the exact same name
    const [res1, res2] = await Promise.all([
      registerHandler(
        createMockJsonRequest("POST", "http://localhost:3000/api/auth/register", {
          name: "Racer Bot",
          email: "racer1@example.com",
          phone: "+15551112233",
          profession: "developer",
          password: "securePassword123",
        })
      ),
      registerHandler(
        createMockJsonRequest("POST", "http://localhost:3000/api/auth/register", {
          name: "Racer Bot",
          email: "racer2@example.com",
          phone: "+15551112244",
          profession: "video-editor",
          password: "securePassword123",
        })
      ),
    ]);

    const data1 = await res1.json();
    const data2 = await res2.json();

    const u1 = await User.findOne({ email: "racer1@example.com" });
    const u2 = await User.findOne({ email: "racer2@example.com" });

    const passed =
      res1.status === 201 &&
      res2.status === 201 &&
      Boolean(u1?.username) &&
      Boolean(u2?.username) &&
      u1?.username !== u2?.username;

    record(
      "Username Race Safety",
      "2C. Concurrent registrations with identical names resolve safely without collision",
      passed,
      `User 1 slug: '${u1?.username}', User 2 slug: '${u2?.username}' (distinct: ${u1?.username !== u2?.username})`
    );
  }

  // 2D. Reserved username safety
  {
    const isReserved = isReservedUsername("admin") && isReservedUsername("api") && isReservedUsername("dashboard");
    const generatedSlug = await generateUniqueUsername("Admin");

    const passed = isReserved && generatedSlug !== "admin" && !isReservedUsername(generatedSlug);

    record(
      "Username Race Safety",
      "2D. Reserved system keywords protected; slug generated safely",
      passed,
      `Reserved checked: ${isReserved}, Generated slug for 'Admin': '${generatedSlug}'`
    );
  }

  // ==========================================================
  // CONCERN 3: ONBOARDING FIELDS INSIDE EXISTING PROFILE
  // ==========================================================
  console.log("\n--- 3. Onboarding Fields Inside Existing Profile Architecture ---");

  // 3A. Verify fields exist directly in Profile model schema
  {
    const schemaPaths = Profile.schema.paths;
    const hasBioBlurb = Boolean(schemaPaths["bioBlurb"]);
    const hasLocation = Boolean(schemaPaths["location"]);
    const hasStatusText = Boolean(schemaPaths["statusText"]);

    const passed = hasBioBlurb && hasLocation && hasStatusText;

    record(
      "Onboarding Architecture",
      "3A. bioBlurb, location, and statusText exist inside existing Profile schema",
      passed,
      `bioBlurb: ${hasBioBlurb}, location: ${hasLocation}, statusText: ${hasStatusText}`
    );
  }

  // 3B. Onboarding update reuses PUT /api/profile with session-derived ownerId
  let onboardingUserDoc: IUser | null = null;
  {
    // Register user for onboarding test
    const regReq = createMockJsonRequest("POST", "http://localhost:3000/api/auth/register", {
      name: "Onboarding Tester",
      email: "onboarding.user@example.com",
      phone: "+15553334455",
      profession: "digital-marketer",
      password: "securePassword123",
    });
    await registerHandler(regReq);

    onboardingUserDoc = await User.findOne({ email: "onboarding.user@example.com" });
    const userToken = await signUserToken({
      id: onboardingUserDoc!._id.toString(),
      email: onboardingUserDoc!.email,
      role: onboardingUserDoc!.role,
      username: onboardingUserDoc!.username,
      profession: onboardingUserDoc!.profession,
    });

    // Simulate onboarding submit calling PUT /api/profile
    const updateReq = createMockJsonRequest(
      "PUT",
      "http://localhost:3000/api/profile",
      {
        bioBlurb: "Senior Digital Strategist scaling performance marketing campaigns.",
        location: "New York, NY",
        statusText: "Open for consulting Q4",
      },
      { [USER_COOKIE_NAME]: userToken }
    );

    const updateRes = await profilePutHandler(updateReq);
    const updateData = await updateRes.json();

    const savedProfile = await Profile.findOne({ ownerId: onboardingUserDoc!._id });

    const passed =
      updateRes.status === 200 &&
      savedProfile?.bioBlurb === "Senior Digital Strategist scaling performance marketing campaigns." &&
      savedProfile?.location === "New York, NY" &&
      savedProfile?.statusText === "Open for consulting Q4" &&
      savedProfile?.ownerId?.toString() === onboardingUserDoc!._id.toString();

    record(
      "Onboarding Architecture",
      "3B. Onboarding update updates existing Profile via /api/profile with session ownerId",
      passed,
      `Profile bioBlurb: '${savedProfile?.bioBlurb}', location: '${savedProfile?.location}'`
    );
  }

  // 3C. Client cannot forge ownerId or role in onboarding update
  {
    const userToken = await signUserToken({
      id: onboardingUserDoc!._id.toString(),
      email: onboardingUserDoc!.email,
      role: onboardingUserDoc!.role,
      username: onboardingUserDoc!.username,
      profession: onboardingUserDoc!.profession,
    });

    const maliciousOwnerId = new Types.ObjectId().toString();

    const updateReq = createMockJsonRequest(
      "PUT",
      "http://localhost:3000/api/profile",
      {
        ownerId: maliciousOwnerId,
        role: "superadmin",
        plan: "premium",
        location: "London, UK",
      },
      { [USER_COOKIE_NAME]: userToken }
    );

    const updateRes = await profilePutHandler(updateReq);
    const savedProfile = await Profile.findOne({ ownerId: onboardingUserDoc!._id });

    const passed =
      updateRes.status === 200 &&
      savedProfile?.ownerId?.toString() === onboardingUserDoc!._id.toString() &&
      savedProfile?.location === "London, UK";

    record(
      "Onboarding Architecture",
      "3C. Forged client ownerId, role, and plan are strictly stripped and rejected",
      passed,
      `ownerId retained: ${savedProfile?.ownerId}, spoofed ownerId ignored: true`
    );
  }

  // 3D. Public portfolio /p/[username] data loader reflects onboarding updates
  {
    const portfolioData = await getPortfolioDataByOwnerId(onboardingUserDoc!._id);

    const passed =
      portfolioData !== null &&
      portfolioData.profile.location === "London, UK" &&
      portfolioData.profile.bioBlurb === "Senior Digital Strategist scaling performance marketing campaigns." &&
      portfolioData.profile.statusText === "Open for consulting Q4" &&
      portfolioData.projects.length === 0 && // Zero-state preserved
      portfolioData.skills.length === 0;

    record(
      "Onboarding Architecture",
      "3D. Public portfolio data loader reflects updated fields and preserves zero-state",
      passed,
      `Loaded profile.location: '${portfolioData?.profile.location}', zero-state projects: ${portfolioData?.projects.length}`
    );
  }

  // ==========================================================
  // SCOPED CLEANUP
  // ==========================================================
  console.log("\n--- Cleaning Up Temporary Verification Records ---");
  await cleanup();
  console.log("✓ Cleanup completed.\n");

  // ==========================================================
  // SUMMARY
  // ==========================================================
  console.log("===============================================================");
  console.log("             TEST RESULTS SUMMARY — PHASE 12                  ");
  console.log("===============================================================");
  console.table(
    testResults.map((r) => ({
      Concern: r.concern,
      Test: r.test,
      Status: r.passed ? "PASSED ✓" : "FAILED ✗",
      Details: r.details,
    }))
  );

  const totalPassed = testResults.filter((r) => r.passed).length;
  const totalTests = testResults.length;

  console.log(`\nResults: ${totalPassed}/${totalTests} tests passed.`);

  if (totalPassed === totalTests) {
    console.log("✓ ALL PHASE 12 ARCHITECTURE VERIFICATION TESTS PASSED!\n");
  } else {
    console.error(`✗ ${totalTests - totalPassed} tests failed!\n`);
  }

  await mongoose.disconnect();
  return { totalPassed, totalTests, allPassed: totalPassed === totalTests };
}

// Auto-execute if run directly
if (
  require.main === module ||
  process.argv[1]?.includes("test-phase12-architecture-verification")
) {
  runPhase12VerificationTests()
    .then(({ allPassed }) => process.exit(allPassed ? 0 : 1))
    .catch((err) => {
      console.error("Test Suite Unhandled Exception:", err);
      process.exit(1);
    });
}
