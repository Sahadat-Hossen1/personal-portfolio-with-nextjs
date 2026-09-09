import mongoose, { Types } from "mongoose";
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
import Skill from "@/models/Skill";
import SkillTag from "@/models/SkillTag";

// Auth & Authorization utilities
import {
  signUserToken,
  hashPassword,
  USER_COOKIE_NAME,
} from "@/lib/auth";

// Skills & Tags Route Handlers
import { GET as getSkills, POST as postSkill } from "@/app/api/skills/route";
import {
  GET as getSkillById,
  PUT as putSkillById,
  DELETE as deleteSkillById,
} from "@/app/api/skills/[id]/route";
import { GET as getTags, POST as postTag } from "@/app/api/skills/tags/route";
import { DELETE as deleteTagById } from "@/app/api/skills/tags/[id]/route";

function createMockRequest(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  options: {
    body?: Record<string, unknown>;
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

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

export async function runSkillsPhase7Tests() {
  console.log("=================================================");
  console.log("     PHASE 7: SKILLS & SKILLTAGS TEST SUITE      ");
  console.log("=================================================");

  await mongoose.connect(MONGODB_URI);

  const testEmailA = "test.usera.phase7@example.com";
  const testEmailB = "test.userb.phase7@example.com";
  const testPassword = "securePassword123";

  // Pre-cleanup of any previous test artifacts
  const existingUsers = await User.find({
    email: { $in: [testEmailA, testEmailB] },
  });
  const existingUserIds = existingUsers.map((u) => u._id);

  if (existingUserIds.length > 0) {
    await Skill.deleteMany({ ownerId: { $in: existingUserIds } });
    await SkillTag.deleteMany({ ownerId: { $in: existingUserIds } });
    await User.deleteMany({ _id: { $in: existingUserIds } });
  }

  // Create isolated Test User A (developer) & User B (video-editor)
  const hashedPassword = await hashPassword(testPassword);
  const userA = await User.create({
    name: "Alex DevP7",
    email: testEmailA,
    username: "alex-dev-p7",
    passwordHash: hashedPassword,
    role: "user",
    plan: "free",
    profession: "developer",
    allowedTemplates: ["developer"],
  });

  const userB = await User.create({
    name: "Sam VideoP7",
    email: testEmailB,
    username: "sam-video-p7",
    passwordHash: hashedPassword,
    role: "user",
    plan: "free",
    profession: "video-editor",
    allowedTemplates: ["video-editor"],
  });

  // Seed initial skills for User A & User B
  const skillA1 = await Skill.create({
    name: "TypeScript",
    icon: "📘",
    level: 90,
    color: "#3178c6",
    category: "Web Development",
    order: 1,
    ownerId: userA._id,
  });

  const skillB1 = await Skill.create({
    name: "After Effects",
    icon: "🎞️",
    level: 85,
    color: "#9999ff",
    category: "Video Editing",
    order: 1,
    ownerId: userB._id,
  });

  // Seed initial tags for User A & User B
  const tagA1 = await SkillTag.create({
    name: "Next.js",
    order: 1,
    ownerId: userA._id,
  });

  const tagB1 = await SkillTag.create({
    name: "Premiere Pro",
    order: 1,
    ownerId: userB._id,
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

  const cookiesA = { [USER_COOKIE_NAME]: tokenA };
  const cookiesB = { [USER_COOKIE_NAME]: tokenB };

  const testResults: {
    category: string;
    test: string;
    passed: boolean;
    details: string;
  }[] = [];

  function record(
    category: string,
    test: string,
    passed: boolean,
    details: string
  ) {
    testResults.push({ category, test, passed, details });
    const mark = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${mark}] ${category}: ${test} — ${details}`);
  }

  let createdSkillIdA: string | null = null;
  let createdTagIdA: string | null = null;

  // ----------------------------------------------------
  // SKILLS TESTS (1 to 10)
  // ----------------------------------------------------

  // 1. Unauthenticated GET /api/skills is rejected (401)
  {
    const req = createMockRequest("GET", "/api/skills");
    const res = await getSkills(req);
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;

    record(
      "Skills Auth",
      "1. Unauthenticated GET /api/skills is rejected",
      passed,
      `Status: ${res.status}, Error: "${json.error}"`
    );
  }

  // 2. Authenticated user can retrieve own skills
  {
    const req = createMockRequest("GET", "/api/skills", { cookies: cookiesA });
    const res = await getSkills(req);
    const json = await res.json();
    const passed =
      res.status === 200 &&
      json.success === true &&
      Array.isArray(json.data?.skills) &&
      json.data.skills.length === 1 &&
      json.data.skills[0].name === "TypeScript";

    record(
      "Skills Read",
      "2. Authenticated user can retrieve own skills",
      passed,
      `Status: ${res.status}, Retrieved ${json.data?.skills?.length} skill(s) for User A`
    );
  }

  // 3. User cannot retrieve another user's skills
  {
    const req = createMockRequest("GET", "/api/skills", { cookies: cookiesB });
    const res = await getSkills(req);
    const json = await res.json();
    const containsSkillA = (json.data?.skills || []).some(
      (s: { _id: string }) => s._id.toString() === skillA1._id.toString()
    );
    const passed =
      res.status === 200 &&
      json.success === true &&
      !containsSkillA &&
      json.data?.skills?.length === 1 &&
      json.data.skills[0].name === "After Effects";

    record(
      "Skills Isolation",
      "3. User cannot retrieve another user's skills",
      passed,
      `User B skills: ${json.data?.skills?.length} item(s). Contains User A skill: ${containsSkillA}`
    );
  }

  // 4. Authenticated user can create a skill
  {
    const req = createMockRequest("POST", "/api/skills", {
      cookies: cookiesA,
      body: {
        name: "React",
        icon: "⚛️",
        level: 95,
        color: "#61dafb",
        category: "Web Development",
        order: 2,
      },
    });
    const res = await postSkill(req);
    const json = await res.json();

    const createdInDb = await Skill.findById(json.data?._id);
    const passed =
      res.status === 201 &&
      json.success === true &&
      json.data?.name === "React" &&
      createdInDb !== null &&
      createdInDb.ownerId?.toString() === userA._id.toString();

    if (createdInDb) {
      createdSkillIdA = createdInDb._id.toString();
    }

    record(
      "Skills Create",
      "4. Authenticated user can create a skill",
      passed,
      `Created ID: ${json.data?._id}, ownerId matches User A: ${createdInDb?.ownerId?.toString() === userA._id.toString()}`
    );
  }

  // 5. Client-supplied ownerId cannot override ownership
  {
    const req = createMockRequest("POST", "/api/skills", {
      cookies: cookiesA,
      body: {
        name: "Malicious Skill",
        level: 50,
        ownerId: userB._id.toString(), // Attacker attempts to forge owner
      },
    });
    const res = await postSkill(req);
    const json = await res.json();

    const createdSkill = await Skill.findById(json.data?._id);
    const ownershipProtected =
      res.status === 201 &&
      createdSkill !== null &&
      createdSkill.ownerId?.toString() === userA._id.toString() &&
      createdSkill.ownerId?.toString() !== userB._id.toString();

    if (createdSkill) {
      await Skill.findByIdAndDelete(createdSkill._id);
    }

    record(
      "Skills Security",
      "5. Client-supplied ownerId cannot override ownership",
      ownershipProtected,
      `Assigned ownerId was forced server-side to User A (${createdSkill?.ownerId}), client value ignored`
    );
  }

  // 6. Authenticated user can update own skill
  {
    const req = createMockRequest("PUT", `/api/skills/${skillA1._id}`, {
      cookies: cookiesA,
      body: {
        name: "TypeScript (Advanced)",
        level: 98,
        color: "#235a97",
      },
    });
    const res = await putSkillById(req, {
      params: Promise.resolve({ id: skillA1._id.toString() }),
    });
    const json = await res.json();

    const updatedInDb = await Skill.findById(skillA1._id);
    const passed =
      res.status === 200 &&
      json.success === true &&
      updatedInDb?.name === "TypeScript (Advanced)" &&
      updatedInDb?.level === 98 &&
      updatedInDb?.ownerId?.toString() === userA._id.toString();

    record(
      "Skills Update",
      "6. Authenticated user can update own skill",
      passed,
      `Updated name: "${updatedInDb?.name}", level: ${updatedInDb?.level}%`
    );
  }

  // 7. Authenticated user cannot update another user's skill (404)
  {
    const req = createMockRequest("PUT", `/api/skills/${skillA1._id}`, {
      cookies: cookiesB,
      body: {
        name: "Hacked by User B",
      },
    });
    const res = await putSkillById(req, {
      params: Promise.resolve({ id: skillA1._id.toString() }),
    });
    const json = await res.json();

    const dbCheck = await Skill.findById(skillA1._id);
    const passed =
      res.status === 404 &&
      json.success === false &&
      dbCheck?.name === "TypeScript (Advanced)";

    record(
      "Skills IDOR",
      "7. Authenticated user cannot update another user's skill (404)",
      passed,
      `Status: ${res.status}, Skill name remained untouched: "${dbCheck?.name}"`
    );
  }

  // 8. Authenticated user can delete own skill
  {
    if (!createdSkillIdA) {
      throw new Error("Cannot run test 8: createdSkillIdA is not set");
    }

    const req = createMockRequest("DELETE", `/api/skills/${createdSkillIdA}`, {
      cookies: cookiesA,
    });
    const res = await deleteSkillById(req, {
      params: Promise.resolve({ id: createdSkillIdA }),
    });
    const json = await res.json();

    const dbCheck = await Skill.findById(createdSkillIdA);
    const passed =
      res.status === 200 &&
      json.success === true &&
      dbCheck === null;

    record(
      "Skills Delete",
      "8. Authenticated user can delete own skill",
      passed,
      `Deleted ID: ${createdSkillIdA}, exists in DB: ${dbCheck !== null}`
    );
  }

  // 9. Authenticated user cannot delete another user's skill (404)
  {
    const req = createMockRequest("DELETE", `/api/skills/${skillB1._id}`, {
      cookies: cookiesA,
    });
    const res = await deleteSkillById(req, {
      params: Promise.resolve({ id: skillB1._id.toString() }),
    });
    const json = await res.json();

    const dbCheck = await Skill.findById(skillB1._id);
    const passed =
      res.status === 404 &&
      json.success === false &&
      dbCheck !== null;

    record(
      "Skills IDOR",
      "9. Authenticated user cannot delete another user's skill (404)",
      passed,
      `Status: ${res.status}, User B's skill preserved in DB: ${dbCheck !== null}`
    );
  }

  // 10. Invalid skill ID returns safe 404 without crashing
  {
    const req = createMockRequest("GET", "/api/skills/invalid-hex-skill-id", {
      cookies: cookiesA,
    });
    const res = await getSkillById(req, {
      params: Promise.resolve({ id: "invalid-hex-skill-id" }),
    });
    const json = await res.json();

    const passed = res.status === 404 && json.success === false;

    record(
      "Skills Validation",
      "10. Invalid skill ID returns safe 404 without crashing",
      passed,
      `Status: ${res.status}, Error: "${json.error}"`
    );
  }

  // ----------------------------------------------------
  // SKILL TAGS TESTS (11 to 18)
  // ----------------------------------------------------

  // 11. Authenticated user can retrieve own tags
  {
    const req = createMockRequest("GET", "/api/skills/tags", { cookies: cookiesA });
    const res = await getTags(req);
    const json = await res.json();
    const passed =
      res.status === 200 &&
      json.success === true &&
      Array.isArray(json.data) &&
      json.data.length === 1 &&
      json.data[0].name === "Next.js";

    record(
      "Tags Read",
      "11. Authenticated user can retrieve own tags",
      passed,
      `Status: ${res.status}, Retrieved ${json.data?.length} tag(s) for User A`
    );
  }

  // 12. User cannot retrieve another user's tags
  {
    const req = createMockRequest("GET", "/api/skills/tags", { cookies: cookiesB });
    const res = await getTags(req);
    const json = await res.json();
    const containsTagA = (json.data || []).some(
      (t: { _id: string }) => t._id.toString() === tagA1._id.toString()
    );
    const passed =
      res.status === 200 &&
      json.success === true &&
      !containsTagA &&
      json.data.length === 1 &&
      json.data[0].name === "Premiere Pro";

    record(
      "Tags Isolation",
      "12. User cannot retrieve another user's tags",
      passed,
      `User B tags: ${json.data?.length} item(s). Contains User A tag: ${containsTagA}`
    );
  }

  // 13. Authenticated user can create own tag
  {
    const req = createMockRequest("POST", "/api/skills/tags", {
      cookies: cookiesA,
      body: { name: "Tailwind CSS" },
    });
    const res = await postTag(req);
    const json = await res.json();

    const createdInDb = await SkillTag.findById(json.data?._id);
    const passed =
      res.status === 201 &&
      json.success === true &&
      json.data?.name === "Tailwind CSS" &&
      createdInDb !== null &&
      createdInDb.ownerId?.toString() === userA._id.toString();

    if (createdInDb) {
      createdTagIdA = createdInDb._id.toString();
    }

    record(
      "Tags Create",
      "13. Authenticated user can create own tag",
      passed,
      `Created tag ID: ${json.data?._id}, ownerId matches User A: ${createdInDb?.ownerId?.toString() === userA._id.toString()}`
    );
  }

  // 14. Client-supplied ownerId cannot override tag ownership
  {
    const req = createMockRequest("POST", "/api/skills/tags", {
      cookies: cookiesA,
      body: {
        name: "Docker",
        ownerId: userB._id.toString(), // Attacker attempts to forge owner
      },
    });
    const res = await postTag(req);
    const json = await res.json();

    const createdTag = await SkillTag.findById(json.data?._id);
    const ownershipProtected =
      res.status === 201 &&
      createdTag !== null &&
      createdTag.ownerId?.toString() === userA._id.toString() &&
      createdTag.ownerId?.toString() !== userB._id.toString();

    if (createdTag) {
      await SkillTag.findByIdAndDelete(createdTag._id);
    }

    record(
      "Tags Security",
      "14. Client-supplied ownerId cannot override tag ownership",
      ownershipProtected,
      `Assigned ownerId was forced server-side to User A (${createdTag?.ownerId}), client value ignored`
    );
  }

  // 15. Tenant-scoped duplicate tag names are rejected (409 Conflict)
  {
    // Attempt to create duplicate "Next.js" for User A
    const req = createMockRequest("POST", "/api/skills/tags", {
      cookies: cookiesA,
      body: { name: "Next.js" },
    });
    const res = await postTag(req);
    const json = await res.json();

    const passed =
      res.status === 409 &&
      json.success === false &&
      json.error === "A tag with this name already exists";

    record(
      "Tags Uniqueness",
      "15. Tenant-scoped duplicate tag names are rejected with 409",
      passed,
      `Status: ${res.status}, Error: "${json.error}"`
    );
  }

  // 16. Authenticated user can delete own tag
  {
    if (!createdTagIdA) {
      throw new Error("Cannot run test 16: createdTagIdA is not set");
    }

    const req = createMockRequest("DELETE", `/api/skills/tags/${createdTagIdA}`, {
      cookies: cookiesA,
    });
    const res = await deleteTagById(req, {
      params: Promise.resolve({ id: createdTagIdA }),
    });
    const json = await res.json();

    const dbCheck = await SkillTag.findById(createdTagIdA);
    const passed =
      res.status === 200 &&
      json.success === true &&
      dbCheck === null;

    record(
      "Tags Delete",
      "16. Authenticated user can delete own tag",
      passed,
      `Deleted Tag ID: ${createdTagIdA}, exists in DB: ${dbCheck !== null}`
    );
  }

  // 17. Authenticated user cannot delete another user's tag (404)
  {
    const req = createMockRequest("DELETE", `/api/skills/tags/${tagB1._id}`, {
      cookies: cookiesA,
    });
    const res = await deleteTagById(req, {
      params: Promise.resolve({ id: tagB1._id.toString() }),
    });
    const json = await res.json();

    const dbCheck = await SkillTag.findById(tagB1._id);
    const passed =
      res.status === 404 &&
      json.success === false &&
      dbCheck !== null;

    record(
      "Tags IDOR",
      "17. Authenticated user cannot delete another user's tag (404)",
      passed,
      `Status: ${res.status}, User B's tag preserved in DB: ${dbCheck !== null}`
    );
  }

  // 18. Invalid tag ID returns safe 404 without crashing
  {
    const req = createMockRequest("DELETE", "/api/skills/tags/invalid-tag-id", {
      cookies: cookiesA,
    });
    const res = await deleteTagById(req, {
      params: Promise.resolve({ id: "invalid-tag-id" }),
    });
    const json = await res.json();

    const passed = res.status === 404 && json.success === false;

    record(
      "Tags Validation",
      "18. Invalid tag ID returns safe 404 without crashing",
      passed,
      `Status: ${res.status}, Error: "${json.error}"`
    );
  }

  // ----------------------------------------------------
  // SCOPED CLEANUP
  // ----------------------------------------------------
  console.log("\n--- Cleaning Up Phase 7 Test Records ---");
  await Skill.deleteMany({ ownerId: { $in: [userA._id, userB._id] } });
  await SkillTag.deleteMany({ ownerId: { $in: [userA._id, userB._id] } });
  await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
  console.log("✓ Cleanup finished. Real portfolio records remain untouched.\n");

  // ----------------------------------------------------
  // SUMMARY TABLE
  // ----------------------------------------------------
  console.log("=================================================");
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

  const totalPassed = testResults.filter((r) => r.passed).length;
  const totalTests = testResults.length;

  console.log(`\nResults: ${totalPassed}/${totalTests} tests passed.`);

  if (totalPassed === totalTests) {
    console.log(`✓ ALL ${totalTests} PHASE 7 SKILLS & TAGS TESTS PASSED!\n`);
  } else {
    console.error(`✗ ${totalTests - totalPassed} tests failed!\n`);
    process.exitCode = 1;
  }

  await mongoose.disconnect();
}

if (require.main === module || process.argv[1]?.includes("test-skills-phase7")) {
  runSkillsPhase7Tests().catch((err) => {
    console.error("Skills Test Suite Error:", err);
    process.exit(1);
  });
}
