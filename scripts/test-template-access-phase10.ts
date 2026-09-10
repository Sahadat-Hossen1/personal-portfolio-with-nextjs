import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { NextRequest } from "next/server";

// Load environment variables from .env.local if present
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio";

// Models
import User from "@/models/User";
import Profile from "@/models/Profile";

// Auth utilities
import {
  signUserToken,
  hashPassword,
  USER_COOKIE_NAME,
} from "@/lib/auth";

// Template utilities
import {
  resolveTemplateId,
  DEFAULT_TEMPLATE_ID,
} from "@/templates/index";

// Route handlers
import {
  GET as getProfile,
  PUT as putProfile,
} from "@/app/api/profile/route";

function createMockRequest(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  options: {
    body?: Record<string, unknown>;
    rawBody?: string;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
  } = {}
) {
  const cookieHeader = Object.entries(options.cookies || {})
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  if (cookieHeader) {
    headers["Cookie"] = cookieHeader;
  }

  if (options.body || options.rawBody !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const bodyContent =
    options.rawBody !== undefined
      ? options.rawBody
      : options.body
      ? JSON.stringify(options.body)
      : undefined;

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers,
    body: bodyContent,
  });
}

export async function runTemplateAccessPhase10Tests() {
  console.log("=================================================");
  console.log("   PHASE 10: TEMPLATE ACCESS & SWITCHER TESTS    ");
  console.log("=================================================");

  await mongoose.connect(MONGODB_URI);

  const testEmailA = "test.usera.phase10@example.com";
  const testEmailB = "test.userb.phase10@example.com";
  const testPassword = "securePassword123";

  // Pre-cleanup of any previous test artifacts
  const existingUsers = await User.find({
    email: { $in: [testEmailA, testEmailB] },
  });
  const existingUserIds = existingUsers.map((u) => u._id);

  if (existingUserIds.length > 0) {
    await Profile.deleteMany({ ownerId: { $in: existingUserIds } });
    await User.deleteMany({ _id: { $in: existingUserIds } });
  }
  await User.deleteMany({ username: "admin_phase10" });

  const hashedPassword = await hashPassword(testPassword);

  // User A: developer profession, allowed templates: ["developer", "video-editor"]
  const userA = await User.create({
    name: "Tenant User A",
    email: testEmailA,
    username: "tenant-a-p10",
    passwordHash: hashedPassword,
    role: "user",
    plan: "free",
    profession: "developer",
    allowedTemplates: ["developer", "video-editor"],
  });

  // User B: video-editor profession, allowed templates strictly ["video-editor"]
  const userB = await User.create({
    name: "Tenant User B",
    email: testEmailB,
    username: "tenant-b-p10",
    passwordHash: hashedPassword,
    role: "user",
    plan: "free",
    profession: "video-editor",
    allowedTemplates: ["video-editor"],
  });

  // Isolated Superadmin (modern User model)
  const superadmin = await User.create({
    name: "Superadmin Phase 10",
    email: "admin_phase10@example.com",
    username: "admin_phase10",
    passwordHash: hashedPassword,
    role: "superadmin",
    profession: "developer",
  });

  // Generate tokens
  const tokenA = await signUserToken({
    id: userA._id.toString(),
    email: userA.email,
    role: userA.role,
    username: userA.username,
    profession: userA.profession,
  });

  const tokenB = await signUserToken({
    id: userB._id.toString(),
    email: userB.email,
    role: userB.role,
    username: userB.username,
    profession: userB.profession,
  });

  const adminToken = await signUserToken({
    id: superadmin._id.toString(),
    email: superadmin.email,
    role: "superadmin",
    username: superadmin.username,
    profession: "developer",
  });

  const cookiesA = { [USER_COOKIE_NAME]: tokenA };
  const cookiesB = { [USER_COOKIE_NAME]: tokenB };
  const cookiesAdmin = { [USER_COOKIE_NAME]: adminToken };

  // Seed Profiles
  await Profile.create({
    ownerId: userA._id,
    name: "Tenant User A",
    email: userA.email,
    selectedTemplate: "developer",
  });

  const profileB = await Profile.create({
    ownerId: userB._id,
    name: "Tenant User B",
    email: userB.email,
    selectedTemplate: "video-editor",
  });

  const results: { category: string; test: string; status: string; details: string }[] = [];

  function record(category: string, test: string, passed: boolean, details: string) {
    results.push({
      category,
      test,
      status: passed ? "PASSED ✓" : "FAILED ✗",
      details,
    });
    const indicator = passed ? "[✓ PASS]" : "[✗ FAIL]";
    console.log(`${indicator} ${category}: ${test} — ${details}`);
  }

  // --- 1. Unauthenticated template update rejected (401) ---
  {
    const req = createMockRequest("PUT", "/api/profile", {
      body: { selectedTemplate: "video-editor" },
    });
    const res = await putProfile(req);
    const json = await res.json();
    record(
      "Authentication",
      "1. Unauthenticated PUT /api/profile rejected with 401",
      res.status === 401 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // --- 2. Authenticated user can select an allowed template (200) ---
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: { selectedTemplate: "video-editor" },
    });
    const res = await putProfile(req);
    const json = await res.json();
    const dbProfile = await Profile.findOne({ ownerId: userA._id });

    record(
      "Template Authorization",
      "2. User A can select an allowed template ('video-editor')",
      res.status === 200 && json.success && dbProfile?.selectedTemplate === "video-editor",
      `HTTP ${res.status}, selectedTemplate: '${dbProfile?.selectedTemplate}'`
    );
  }

  // --- 3. Authenticated user cannot select unauthorized template (403) ---
  {
    // User A only has allowedTemplates: ["developer", "video-editor"], not "doctor"
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: { selectedTemplate: "doctor" },
    });
    const res = await putProfile(req);
    const json = await res.json();
    const dbProfile = await Profile.findOne({ ownerId: userA._id });

    record(
      "Template Authorization",
      "3. User A cannot select unauthorized template ('doctor' -> 403)",
      res.status === 403 && !json.success && dbProfile?.selectedTemplate === "video-editor",
      `HTTP ${res.status}: ${json.error}, DB selection unchanged: '${dbProfile?.selectedTemplate}'`
    );
  }

  // --- 4. Unsupported template rejected (400) ---
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: { selectedTemplate: "unsupported-template-xyz" },
    });
    const res = await putProfile(req);
    const json = await res.json();

    record(
      "Template Validation",
      "4. Unsupported template name safely rejected with 400",
      res.status === 400 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // --- 5. Arbitrary template string rejected (400) ---
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: { selectedTemplate: "'; DROP TABLE users; --" },
    });
    const res = await putProfile(req);
    const json = await res.json();

    record(
      "Template Validation",
      "5. Arbitrary malicious string safely rejected with 400",
      res.status === 400 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // --- 6. Empty or non-string template rejected (400) ---
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: { selectedTemplate: "" },
    });
    const res = await putProfile(req);
    const json = await res.json();

    record(
      "Template Validation",
      "6. Empty string template safely rejected with 400",
      res.status === 400 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // --- 7. Malformed JSON request body safely handled (400) ---
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      rawBody: "invalid-json-body-{{{",
    });
    const res = await putProfile(req);
    const json = await res.json();

    record(
      "Robustness",
      "7. Malformed JSON request body safely handled (400)",
      res.status === 400 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // --- 8. Client-supplied ownerId cannot bypass ownership ---
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: {
        selectedTemplate: "developer",
        ownerId: userB._id.toString(), // Attacker attempts to target User B's profile
      },
    });
    const res = await putProfile(req);
    const json = await res.json();

    const freshProfileA = await Profile.findOne({ ownerId: userA._id });
    const freshProfileB = await Profile.findOne({ ownerId: userB._id });

    // User A's profile was updated, User B's profile was untouched
    const aUpdated = freshProfileA?.selectedTemplate === "developer";
    const bUntouched = freshProfileB?.selectedTemplate === "video-editor";

    record(
      "Security Boundary",
      "8. Client-supplied ownerId cannot override ownership",
      res.status === 200 && json.success && aUpdated && bUntouched,
      `User A updated: ${aUpdated}, User B untouched: ${bUntouched}`
    );
  }

  // --- 9. Client-supplied userId / _id cannot bypass ownership ---
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: {
        _id: profileB._id.toString(),
        userId: userB._id.toString(),
        selectedTemplate: "developer",
      },
    });
    const res = await putProfile(req);
    const json = await res.json();

    const freshProfileB = await Profile.findOne({ ownerId: userB._id });
    const bStillUntouched = freshProfileB?.selectedTemplate === "video-editor";

    record(
      "Security Boundary",
      "9. Client-supplied _id/userId cannot bypass ownership",
      res.status === 200 && json.success && bStillUntouched,
      `User B template preserved as: '${freshProfileB?.selectedTemplate}'`
    );
  }

  // --- 10. Client-supplied role cannot bypass role authorization ---
  {
    // Attacker attempts to forge role: "superadmin" in the request body to select "doctor"
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: {
        role: "superadmin",
        selectedTemplate: "doctor",
      },
    });
    const res = await putProfile(req);
    const json = await res.json();

    record(
      "Privilege Escalation Prevention",
      "10. Client-supplied role='superadmin' cannot bypass template gating (403)",
      res.status === 403 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // --- 11. Client-supplied allowedTemplates cannot grant access ---
  {
    // Attacker attempts to send allowedTemplates: ["doctor"]
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: {
        allowedTemplates: ["doctor"],
        selectedTemplate: "doctor",
      },
    });
    const res = await putProfile(req);
    const json = await res.json();

    const freshUserA = await User.findById(userA._id);
    const userAllowedUnchanged =
      freshUserA?.allowedTemplates.length === 2 &&
      freshUserA?.allowedTemplates.includes("developer") &&
      freshUserA?.allowedTemplates.includes("video-editor");

    record(
      "Privilege Escalation Prevention",
      "11. Client-supplied allowedTemplates cannot grant access",
      res.status === 403 && !json.success && userAllowedUnchanged,
      `HTTP ${res.status}: ${json.error}, User A DB allowedTemplates untouched: ${JSON.stringify(freshUserA?.allowedTemplates)}`
    );
  }

  // --- 12. selectedTemplate persists correctly in MongoDB ---
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: { selectedTemplate: "video-editor" },
    });
    await putProfile(req);

    const freshDoc = await Profile.findOne({ ownerId: userA._id });
    record(
      "Persistence",
      "12. selectedTemplate correctly persists in database",
      freshDoc?.selectedTemplate === "video-editor",
      `Persisted template in MongoDB: '${freshDoc?.selectedTemplate}'`
    );
  }

  // --- 13. Response returns authoritative selectedTemplate ---
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: { selectedTemplate: "developer" },
    });
    const res = await putProfile(req);
    const json = await res.json();

    record(
      "Authoritative Response",
      "13. Response returns authoritative selectedTemplate",
      res.status === 200 && json.success && json.data?.selectedTemplate === "developer",
      `HTTP ${res.status}, response data selectedTemplate: '${json.data?.selectedTemplate}'`
    );
  }

  // --- 14. passwordHash not leaked in response ---
  {
    const req = createMockRequest("GET", "/api/profile", { cookies: cookiesA });
    const res = await getProfile(req);
    const json = await res.json();

    const hasPasswordHash = json.data && "passwordHash" in json.data;

    record(
      "Payload Hygiene",
      "14. Response does not leak passwordHash",
      !hasPasswordHash,
      `passwordHash present in profile response: ${hasPasswordHash}`
    );
  }

  // --- 15. Authentication secrets not leaked ---
  {
    const req = createMockRequest("GET", "/api/profile", { cookies: cookiesA });
    const res = await getProfile(req);
    const json = await res.json();

    const hasTokens =
      json.data &&
      ("jwt" in json.data || "token" in json.data || "secret" in json.data);

    record(
      "Payload Hygiene",
      "15. Response does not leak authentication tokens or secrets",
      !hasTokens,
      `Secrets or tokens present in response: ${hasTokens}`
    );
  }

  // --- 16. User A cannot modify User B's profile/template (IDOR protected) ---
  {
    // User B profile in DB has selectedTemplate: "video-editor"
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: {
        selectedTemplate: "developer",
      },
    });
    await putProfile(req);

    // Verify User B can retrieve their own profile with cookiesB
    const reqB = createMockRequest("GET", "/api/profile", { cookies: cookiesB });
    const resB = await getProfile(reqB);
    const jsonB = await resB.json();

    const freshProfileB = await Profile.findOne({ ownerId: userB._id });

    record(
      "Tenant Isolation",
      "16. User A cannot modify User B's profile/template (IDOR)",
      freshProfileB?.selectedTemplate === "video-editor" && jsonB.data?.selectedTemplate === "video-editor",
      `User B selectedTemplate preserved: '${freshProfileB?.selectedTemplate}', Self-retrieval: '${jsonB.data?.selectedTemplate}'`
    );
  }

  // --- 17. Profession / template independence preserved ---
  {
    // User A has profession="developer", but selects "video-editor"
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: { selectedTemplate: "video-editor" },
    });
    const res = await putProfile(req);
    const json = await res.json();

    const freshUserA = await User.findById(userA._id);
    const freshProfileA = await Profile.findOne({ ownerId: userA._id });

    const independencePreserved =
      freshUserA?.profession === "developer" &&
      freshProfileA?.selectedTemplate === "video-editor";

    record(
      "Architecture Axiom",
      "17. Profession and Template remain independent (profession ≠ template)",
      res.status === 200 && json.success && independencePreserved,
      `User profession: '${freshUserA?.profession}', Selected template: '${freshProfileA?.selectedTemplate}'`
    );
  }

  // --- 18. Existing template resolver (resolveTemplateId) functions correctly ---
  {
    const r1 = resolveTemplateId("video-editor", "developer");
    const r2 = resolveTemplateId("invalid-id", "digital-marketer");
    const r3 = resolveTemplateId(null, "doctor");
    const r4 = resolveTemplateId(null, null);

    const resolverValid =
      r1 === "video-editor" &&
      r2 === "digital-marketer" &&
      r3 === "doctor" &&
      r4 === DEFAULT_TEMPLATE_ID;

    record(
      "Resolver Integrity",
      "18. resolveTemplateId resolves valid IDs, fallbacks, and default",
      resolverValid,
      `r1='${r1}', r2='${r2}', r3='${r3}', r4='${r4}' (default: '${DEFAULT_TEMPLATE_ID}')`
    );
  }

  // --- 19. Existing profile API behavior remains compatible ---
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: {
        bioBlurb: "Updated bio for testing compatibility.",
        statusText: "Open to consulting",
      },
    });
    const res = await putProfile(req);
    const json = await res.json();

    const freshProfileA = await Profile.findOne({ ownerId: userA._id });
    const bioUpdated = freshProfileA?.bioBlurb === "Updated bio for testing compatibility.";

    record(
      "Compatibility",
      "19. Profile API continues supporting standard profile fields",
      res.status === 200 && json.success && bioUpdated,
      `HTTP ${res.status}, bio: '${freshProfileA?.bioBlurb}'`
    );
  }

  // --- 20. Superadmin compatibility preserved ---
  {
    // Superadmin has access to ALL supported templates, including "doctor"
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesAdmin,
      body: { selectedTemplate: "doctor" },
    });
    const res = await putProfile(req);
    const json = await res.json();

    record(
      "Superadmin Privileges",
      "20. Superadmin can select any supported template without restriction",
      res.status === 200 && json.success && json.data?.selectedTemplate === "doctor",
      `HTTP ${res.status}, Superadmin template: '${json.data?.selectedTemplate}'`
    );
  }

  // --- 21. Multi-template user can switch back and forth safely ---
  {
    // Switch to developer
    const req1 = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: { selectedTemplate: "developer" },
    });
    const res1 = await putProfile(req1);

    // Switch to video-editor
    const req2 = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: { selectedTemplate: "video-editor" },
    });
    const res2 = await putProfile(req2);

    const doc = await Profile.findOne({ ownerId: userA._id });

    record(
      "Template Switching",
      "21. User A can switch back and forth between allowed templates",
      res1.status === 200 && res2.status === 200 && doc?.selectedTemplate === "video-editor",
      `Final template state: '${doc?.selectedTemplate}'`
    );
  }

  // --- 22. Database internals not leaked in response ---
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: { selectedTemplate: "developer" },
    });
    const res = await putProfile(req);
    const json = await res.json();

    const hasV = json.data && "__v" in json.data;

    record(
      "Payload Hygiene",
      "22. Database internals (__v) not exposed in client projection",
      !hasV,
      `__v in client response: ${hasV}`
    );
  }

  // --- 23. User B's profile remains completely isolated and untouched ---
  {
    const profileBDoc = await Profile.findOne({ ownerId: userB._id });
    record(
      "Tenant Isolation",
      "23. User B's profile data preserved throughout User A's actions",
      profileBDoc?.selectedTemplate === "video-editor",
      `User B selectedTemplate: '${profileBDoc?.selectedTemplate}'`
    );
  }

  // --- 24. Clean Up Test Artifacts ---
  console.log("\n--- Cleaning Up Temporary Phase 10 Test Records ---");
  await Profile.deleteMany({ ownerId: { $in: [userA._id, userB._id, superadmin._id] } });
  await User.deleteMany({ _id: { $in: [userA._id, userB._id, superadmin._id] } });
  console.log("✓ Cleanup finished. Real portfolio records remain untouched.\n");

  record(
    "Cleanup",
    "24. Complete cleanup of test data performed",
    true,
    "All test users, test profiles, and test admin records pruned."
  );

  // Print Summary Table
  console.log("=================================================");
  console.log("             TEST RESULTS SUMMARY                ");
  console.log("=================================================");
  console.table(results);

  const passedCount = results.filter((r) => r.status.includes("PASSED")).length;
  console.log(`\nResults: ${passedCount}/${results.length} tests passed.`);

  if (passedCount === results.length) {
    console.log("✓ ALL PHASE 10 TEMPLATE ACCESS TESTS PASSED!\n");
  } else {
    console.error("✗ SOME PHASE 10 TEMPLATE ACCESS TESTS FAILED!\n");
    process.exit(1);
  }

  await mongoose.disconnect();
}

// Auto-execute if run directly via tsx
if (require.main === module || process.argv[1]?.includes("test-template-access-phase10")) {
  runTemplateAccessPhase10Tests().catch((err) => {
    console.error("Test execution error:", err);
    process.exit(1);
  });
}
