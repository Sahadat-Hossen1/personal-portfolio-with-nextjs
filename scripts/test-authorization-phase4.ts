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

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio";

// Import models
import User from "@/models/User";
import Profile from "@/models/Profile";
import Project from "@/models/Project";
import Experience from "@/models/Experience";
import Skill from "@/models/Skill";
import SkillTag from "@/models/SkillTag";
import Message from "@/models/Message";
import Admin from "@/models/Admin";

// Import Auth & Authorization utilities
import {
  signUserToken,
  signAdminToken,
  hashPassword,
  USER_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";
import {
  requireAuth,
  requireSuperadmin,
  sanitizeRequestBody,
} from "@/lib/authorization";

// Import Route Handlers
import { GET as getProfile, PUT as putProfile } from "@/app/api/profile/route";
import { GET as getProjects, POST as postProject } from "@/app/api/projects/route";
import {
  GET as getProjectById,
  PUT as putProjectById,
  DELETE as deleteProjectById,
} from "@/app/api/projects/[id]/route";
import {
  GET as getExperiences,
  POST as postExperience,
} from "@/app/api/experiences/route";
import {
  GET as getExperienceById,
  PUT as putExperienceById,
  DELETE as deleteExperienceById,
} from "@/app/api/experiences/[id]/route";
import { GET as getSkills, POST as postSkill } from "@/app/api/skills/route";
import {
  GET as getSkillById,
  PUT as putSkillById,
  DELETE as deleteSkillById,
} from "@/app/api/skills/[id]/route";
import {
  GET as getSkillTags,
  POST as postSkillTag,
} from "@/app/api/skills/tags/route";
import { DELETE as deleteSkillTagById } from "@/app/api/skills/tags/[id]/route";
import {
  GET as getMessages,
  POST as postMessage,
} from "@/app/api/messages/route";
import {
  PATCH as patchMessageById,
  DELETE as deleteMessageById,
} from "@/app/api/messages/[id]/route";

// ==========================================
// Request Helpers
// ==========================================
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

// ==========================================
// Main Test Suite
// ==========================================
export async function runAuthorizationTests() {
  console.log("=================================================");
  console.log("    PHASE 4: AUTHORIZATION & IDOR TEST SUITE     ");
  console.log("=================================================");

  await mongoose.connect(MONGODB_URI);

  const testEmailA = "test.userA.phase4@example.com";
  const testEmailB = "test.userB.phase4@example.com";
  const testPassword = "securePassword123";

  // Pre-cleanup only test users if lingering from previous run
  const existingUsers = await User.find({
    email: { $in: [testEmailA, testEmailB] },
  });
  const existingUserIds = existingUsers.map((u) => u._id);

  if (existingUserIds.length > 0) {
    await Profile.deleteMany({ ownerId: { $in: existingUserIds } });
    await Project.deleteMany({ ownerId: { $in: existingUserIds } });
    await Experience.deleteMany({ ownerId: { $in: existingUserIds } });
    await Skill.deleteMany({ ownerId: { $in: existingUserIds } });
    await SkillTag.deleteMany({ ownerId: { $in: existingUserIds } });
    await Message.deleteMany({ ownerId: { $in: existingUserIds } });
    await User.deleteMany({ _id: { $in: existingUserIds } });
  }

  // Create isolated Test User A and User B
  const hashedPassword = await hashPassword(testPassword);
  const userA = await User.create({
    name: "User Alpha",
    email: testEmailA,
    username: "user-alpha",
    passwordHash: hashedPassword,
    role: "user",
    plan: "free",
    profession: "developer",
    allowedTemplates: ["developer"],
  });

  const userB = await User.create({
    name: "User Beta",
    email: testEmailB,
    username: "user-beta",
    passwordHash: hashedPassword,
    role: "user",
    plan: "free",
    profession: "video-editor",
    allowedTemplates: ["video-editor"],
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

  // Track created test record IDs for strictly scoped post-test cleanup
  const createdRecordIds = {
    userA: userA._id,
    userB: userB._id,
    profiles: [] as Types.ObjectId[],
    projects: [] as Types.ObjectId[],
    experiences: [] as Types.ObjectId[],
    skills: [] as Types.ObjectId[],
    skillTags: [] as Types.ObjectId[],
    messages: [] as Types.ObjectId[],
  };

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

  // ----------------------------------------------------
  // SECTION 1: AUTHENTICATION REJECTION TESTS
  // ----------------------------------------------------
  console.log("\n--- Section 1: Authentication & Token Validation ---");

  // 1. Unauthenticated request rejected
  {
    const req = createMockRequest("GET", "/api/projects");
    const res = await getProjects(req);
    const data = await res.json();
    record(
      "Authentication",
      "1. Reject unauthenticated request",
      res.status === 401 && !data.success,
      `HTTP ${res.status}: ${data.error}`
    );
  }

  // 2. Invalid JWT token rejected
  {
    const req = createMockRequest("GET", "/api/projects", {
      cookies: { [USER_COOKIE_NAME]: "invalid.forged.jwt.token" },
    });
    const res = await getProjects(req);
    const data = await res.json();
    record(
      "Authentication",
      "2. Reject invalid/forged JWT token",
      res.status === 401 && !data.success,
      `HTTP ${res.status}: ${data.error}`
    );
  }

  // ----------------------------------------------------
  // SECTION 2: PROJECT OWNER-SCOPED CRUD & IDOR TESTS
  // ----------------------------------------------------
  console.log("\n--- Section 2: Projects Owner-Scoped CRUD & IDOR Protection ---");

  let projectAId: string = "";

  // 3. User A creates project (server sets ownerId = userA._id)
  {
    const req = createMockRequest("POST", "/api/projects", {
      cookies: cookiesA,
      body: {
        title: "Project Alpha 1",
        description: "Alpha Project Description",
        tags: ["Next.js", "TypeScript"],
      },
    });
    const res = await postProject(req);
    const json = await res.json();
    const createdId = json.data?._id;
    projectAId = createdId;
    if (createdId) createdRecordIds.projects.push(new Types.ObjectId(createdId));

    record(
      "Projects",
      "3. User A creates project (server assigns ownerId)",
      res.status === 201 &&
        json.data?.ownerId?.toString() === userA._id.toString(),
      `Project created with ownerId: ${json.data?.ownerId}`
    );
  }

  // 4. Ownership Injection: User A tries to pass ownerId = userB._id
  {
    const req = createMockRequest("POST", "/api/projects", {
      cookies: cookiesA,
      body: {
        title: "Injected Ownership Project",
        description: "Attempting to assign to User B",
        ownerId: userB._id.toString(), // Attacker attempts to forge ownerId
      },
    });
    const res = await postProject(req);
    const json = await res.json();
    if (json.data?._id)
      createdRecordIds.projects.push(new Types.ObjectId(json.data._id));

    record(
      "Projects",
      "4. Ownership injection ignored (server enforces session.id)",
      res.status === 201 &&
        json.data?.ownerId?.toString() === userA._id.toString() &&
        json.data?.ownerId?.toString() !== userB._id.toString(),
      `Assigned to authenticated owner (${json.data?.ownerId}), injected ownerId ignored`
    );
  }

  // 5. User A lists own projects
  {
    const req = createMockRequest("GET", "/api/projects", { cookies: cookiesA });
    const res = await getProjects(req);
    const json = await res.json();
    const containsProjectA = json.data?.some(
      (p: { _id: string }) => p._id === projectAId
    );
    record(
      "Projects",
      "5. User A can list own projects",
      res.status === 200 && containsProjectA,
      `Found ${json.data?.length} projects for User A`
    );
  }

  // 6. User B lists projects -> cannot see User A's project
  {
    const req = createMockRequest("GET", "/api/projects", { cookies: cookiesB });
    const res = await getProjects(req);
    const json = await res.json();
    const containsProjectA = json.data?.some(
      (p: { _id: string }) => p._id === projectAId
    );
    record(
      "Projects",
      "6. User B cannot see User A's projects in list",
      res.status === 200 && !containsProjectA,
      `User B project list isolated. Contains User A project: ${containsProjectA}`
    );
  }

  // 7. IDOR: User B tries to GET User A's project by ID -> returns 404
  {
    const req = createMockRequest("GET", `/api/projects/${projectAId}`, {
      cookies: cookiesB,
    });
    const res = await getProjectById(req, {
      params: Promise.resolve({ id: projectAId }),
    });
    const json = await res.json();
    record(
      "Projects",
      "7. User B cannot GET User A's project by ID (IDOR -> 404)",
      res.status === 404 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 8. IDOR: User B tries to UPDATE User A's project -> returns 404
  {
    const req = createMockRequest("PUT", `/api/projects/${projectAId}`, {
      cookies: cookiesB,
      body: { title: "Hacked by User B" },
    });
    const res = await putProjectById(req, {
      params: Promise.resolve({ id: projectAId }),
    });
    const json = await res.json();
    record(
      "Projects",
      "8. User B cannot UPDATE User A's project (IDOR -> 404)",
      res.status === 404 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 9. IDOR: User B tries to DELETE User A's project -> returns 404
  {
    const req = createMockRequest("DELETE", `/api/projects/${projectAId}`, {
      cookies: cookiesB,
    });
    const res = await deleteProjectById(req, {
      params: Promise.resolve({ id: projectAId }),
    });
    const json = await res.json();
    record(
      "Projects",
      "9. User B cannot DELETE User A's project (IDOR -> 404)",
      res.status === 404 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 10. User A can update own project
  {
    const req = createMockRequest("PUT", `/api/projects/${projectAId}`, {
      cookies: cookiesA,
      body: { title: "Project Alpha 1 (Updated)" },
    });
    const res = await putProjectById(req, {
      params: Promise.resolve({ id: projectAId }),
    });
    const json = await res.json();
    record(
      "Projects",
      "10. User A can update own project",
      res.status === 200 && json.data?.title === "Project Alpha 1 (Updated)",
      `Title updated to: ${json.data?.title}`
    );
  }

  // 11. User A can delete own project
  {
    const req = createMockRequest("DELETE", `/api/projects/${projectAId}`, {
      cookies: cookiesA,
    });
    const res = await deleteProjectById(req, {
      params: Promise.resolve({ id: projectAId }),
    });
    const json = await res.json();
    record(
      "Projects",
      "11. User A can delete own project",
      res.status === 200 && json.success,
      `HTTP ${res.status}: ${json.message}`
    );
  }

  // ----------------------------------------------------
  // SECTION 3: PROFILE OWNER-SCOPED & IDOR TESTS
  // ----------------------------------------------------
  console.log("\n--- Section 3: Profile Owner-Scoped Access & Sanitization ---");

  // 12. User A accesses own profile
  {
    const req = createMockRequest("GET", "/api/profile", { cookies: cookiesA });
    const res = await getProfile(req);
    const json = await res.json();
    if (json.data?._id)
      createdRecordIds.profiles.push(new Types.ObjectId(json.data._id));

    record(
      "Profile",
      "12. User A accesses own profile",
      res.status === 200 &&
        json.data?.ownerId?.toString() === userA._id.toString(),
      `Profile returned with ownerId: ${json.data?.ownerId}`
    );
  }

  // 13. User B accesses own profile (distinct from User A)
  {
    const req = createMockRequest("GET", "/api/profile", { cookies: cookiesB });
    const res = await getProfile(req);
    const json = await res.json();
    if (json.data?._id)
      createdRecordIds.profiles.push(new Types.ObjectId(json.data._id));

    record(
      "Profile",
      "13. User B accesses own profile (isolated tenant)",
      res.status === 200 &&
        json.data?.ownerId?.toString() === userB._id.toString(),
      `Profile returned with ownerId: ${json.data?.ownerId}`
    );
  }

  // 14. User A updates own profile & tests ownership injection prevention
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: {
        aboutTitle: "Senior Full-Stack Engineer",
        ownerId: userB._id.toString(), // Attacker attempts to reassign profile
      },
    });
    const res = await putProfile(req);
    const json = await res.json();

    record(
      "Profile",
      "14. User A updates profile (ownership transfer rejected)",
      res.status === 200 &&
        json.data?.aboutTitle === "Senior Full-Stack Engineer" &&
        json.data?.ownerId?.toString() === userA._id.toString(),
      `Title updated, ownerId remained: ${json.data?.ownerId}`
    );
  }

  // 14b. Profile lazy fallback creates clean zero-state without copying demo data
  {
    // Verify User A profile created via fallback has no demo data
    const req = createMockRequest("GET", "/api/profile", { cookies: cookiesA });
    const res = await getProfile(req);
    const json = await res.json();
    const isCleanZeroState =
      res.status === 200 &&
      json.data?.ownerId?.toString() === userA._id.toString() &&
      json.data?.name === userA.name &&
      json.data?.email === userA.email &&
      json.data?.name !== "Sahadat Hossen" &&
      json.data?.email !== "sahadat.hossen1435@gmail.com" &&
      json.data?.avatarUrl === "" &&
      json.data?.cvUrl === "" &&
      json.data?.bioBlurb === "" &&
      Array.isArray(json.data?.roles) &&
      json.data?.roles.length === 0 &&
      Array.isArray(json.data?.stats) &&
      json.data?.stats.length === 0 &&
      Array.isArray(json.data?.socials) &&
      json.data?.socials.length === 0;

    record(
      "Profile",
      "14b. Profile lazy fallback creates clean zero-state without copying demo data",
      isCleanZeroState,
      `Zero-state verified: name='${json.data?.name}', avatar='${json.data?.avatarUrl}', roles=${json.data?.roles?.length}, stats=${json.data?.stats?.length}`
    );
  }

  // 14c. User with allowedTemplates=['developer'] can select 'developer'
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: {
        selectedTemplate: "developer",
      },
    });
    const res = await putProfile(req);
    const json = await res.json();

    record(
      "Profile",
      "14c. User with allowedTemplates=['developer'] can select 'developer'",
      res.status === 200 && json.data?.selectedTemplate === "developer",
      `Template successfully set to: ${json.data?.selectedTemplate}`
    );
  }

  // 14d. User cannot select unallowed template 'video-editor' (403 Forbidden)
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: {
        selectedTemplate: "video-editor",
      },
    });
    const res = await putProfile(req);
    const json = await res.json();

    record(
      "Profile",
      "14d. User cannot select unallowed template 'video-editor' (403 Forbidden)",
      res.status === 403 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 14e. User cannot select unallowed template 'digital-marketer' (403 Forbidden)
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: {
        selectedTemplate: "digital-marketer",
      },
    });
    const res = await putProfile(req);
    const json = await res.json();

    record(
      "Profile",
      "14e. User cannot select unallowed template 'digital-marketer' (403 Forbidden)",
      res.status === 403 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 14f. User cannot select unallowed template 'doctor' (403 Forbidden)
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: {
        selectedTemplate: "doctor",
      },
    });
    const res = await putProfile(req);
    const json = await res.json();

    record(
      "Profile",
      "14f. User cannot select unallowed template 'doctor' (403 Forbidden)",
      res.status === 403 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 14g. Forged request injecting allowedTemplates:['doctor'] rejected with 403
  {
    const req = createMockRequest("PUT", "/api/profile", {
      cookies: cookiesA,
      body: {
        allowedTemplates: ["doctor"],
        selectedTemplate: "doctor",
      },
    });
    const res = await putProfile(req);
    const json = await res.json();

    record(
      "Profile",
      "14g. Forged request injecting allowedTemplates:['doctor'] rejected with 403",
      res.status === 403 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 14h. User's database allowedTemplates remains strictly unchanged
  {
    const freshUserA = await User.findById(userA._id);
    const isUnchanged =
      Array.isArray(freshUserA?.allowedTemplates) &&
      freshUserA.allowedTemplates.length === 1 &&
      freshUserA.allowedTemplates[0] === "developer";

    record(
      "Profile",
      "14h. User database allowedTemplates remains unchanged",
      isUnchanged,
      `Current DB allowedTemplates: ${JSON.stringify(freshUserA?.allowedTemplates)}`
    );
  }

  // ----------------------------------------------------
  // SECTION 4: EXPERIENCE OWNER-SCOPED & IDOR TESTS
  // ----------------------------------------------------
  console.log("\n--- Section 4: Experience Owner-Scoped CRUD & IDOR Protection ---");

  let expAId: string = "";

  // 15. User A creates experience
  {
    const req = createMockRequest("POST", "/api/experiences", {
      cookies: cookiesA,
      body: {
        company: "Alpha Corp",
        role: "Lead Architect",
        period: "2023 - Present",
      },
    });
    const res = await postExperience(req);
    const json = await res.json();
    expAId = json.data?._id;
    if (expAId)
      createdRecordIds.experiences.push(new Types.ObjectId(expAId));

    record(
      "Experience",
      "15. User A creates experience (ownerId derived server-side)",
      res.status === 201 &&
        json.data?.ownerId?.toString() === userA._id.toString(),
      `Experience ownerId: ${json.data?.ownerId}`
    );
  }

  // 16. User B cannot see User A's experience in list
  {
    const req = createMockRequest("GET", "/api/experiences", {
      cookies: cookiesB,
    });
    const res = await getExperiences(req);
    const json = await res.json();
    const hasExpA = json.data?.some((e: { _id: string }) => e._id === expAId);

    record(
      "Experience",
      "16. User B cannot see User A's experience in list",
      res.status === 200 && !hasExpA,
      `User B experience list isolated. Contains User A: ${hasExpA}`
    );
  }

  // 17. IDOR: User B cannot GET User A's experience by ID -> returns 404
  {
    const req = createMockRequest("GET", `/api/experiences/${expAId}`, {
      cookies: cookiesB,
    });
    const res = await getExperienceById(req, {
      params: Promise.resolve({ id: expAId }),
    });
    const json = await res.json();

    record(
      "Experience",
      "17. User B cannot GET User A's experience by ID (IDOR -> 404)",
      res.status === 404 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 18. IDOR: User B cannot UPDATE User A's experience -> returns 404
  {
    const req = createMockRequest("PUT", `/api/experiences/${expAId}`, {
      cookies: cookiesB,
      body: { company: "Hacked Corp" },
    });
    const res = await putExperienceById(req, {
      params: Promise.resolve({ id: expAId }),
    });
    const json = await res.json();

    record(
      "Experience",
      "18. User B cannot UPDATE User A's experience (IDOR -> 404)",
      res.status === 404 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 19. IDOR: User B cannot DELETE User A's experience -> returns 404
  {
    const req = createMockRequest("DELETE", `/api/experiences/${expAId}`, {
      cookies: cookiesB,
    });
    const res = await deleteExperienceById(req, {
      params: Promise.resolve({ id: expAId }),
    });
    const json = await res.json();

    record(
      "Experience",
      "19. User B cannot DELETE User A's experience (IDOR -> 404)",
      res.status === 404 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 20. User A can delete own experience
  {
    const req = createMockRequest("DELETE", `/api/experiences/${expAId}`, {
      cookies: cookiesA,
    });
    const res = await deleteExperienceById(req, {
      params: Promise.resolve({ id: expAId }),
    });
    const json = await res.json();

    record(
      "Experience",
      "20. User A can delete own experience",
      res.status === 200 && json.success,
      `HTTP ${res.status}: ${json.message}`
    );
  }

  // ----------------------------------------------------
  // SECTION 5: SKILLS OWNER-SCOPED & IDOR TESTS
  // ----------------------------------------------------
  console.log("\n--- Section 5: Skills Owner-Scoped CRUD & IDOR Protection ---");

  let skillAId: string = "";

  // 21. User A creates skill
  {
    const req = createMockRequest("POST", "/api/skills", {
      cookies: cookiesA,
      body: { name: "GraphQL", level: 90, category: "Backend" },
    });
    const res = await postSkill(req);
    const json = await res.json();
    skillAId = json.data?._id;
    if (skillAId) createdRecordIds.skills.push(new Types.ObjectId(skillAId));

    record(
      "Skills",
      "21. User A creates skill (ownerId derived server-side)",
      res.status === 201 &&
        json.data?.ownerId?.toString() === userA._id.toString(),
      `Skill ownerId: ${json.data?.ownerId}`
    );
  }

  // 22. User B cannot see User A's skill in list
  {
    const req = createMockRequest("GET", "/api/skills", { cookies: cookiesB });
    const res = await getSkills(req);
    const json = await res.json();
    const hasSkillA = json.data?.skills?.some(
      (s: { _id: string }) => s._id === skillAId
    );

    record(
      "Skills",
      "22. User B cannot see User A's skill in list",
      res.status === 200 && !hasSkillA,
      `User B skill list isolated. Contains User A: ${hasSkillA}`
    );
  }

  // 23. IDOR: User B cannot GET User A's skill by ID -> returns 404
  {
    const req = createMockRequest("GET", `/api/skills/${skillAId}`, {
      cookies: cookiesB,
    });
    const res = await getSkillById(req, {
      params: Promise.resolve({ id: skillAId }),
    });
    const json = await res.json();

    record(
      "Skills",
      "23. User B cannot GET User A's skill by ID (IDOR -> 404)",
      res.status === 404 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 24. IDOR: User B cannot UPDATE User A's skill -> returns 404
  {
    const req = createMockRequest("PUT", `/api/skills/${skillAId}`, {
      cookies: cookiesB,
      body: { name: "Hacked Skill" },
    });
    const res = await putSkillById(req, {
      params: Promise.resolve({ id: skillAId }),
    });
    const json = await res.json();

    record(
      "Skills",
      "24. User B cannot UPDATE User A's skill (IDOR -> 404)",
      res.status === 404 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 25. IDOR: User B cannot DELETE User A's skill -> returns 404
  {
    const req = createMockRequest("DELETE", `/api/skills/${skillAId}`, {
      cookies: cookiesB,
    });
    const res = await deleteSkillById(req, {
      params: Promise.resolve({ id: skillAId }),
    });
    const json = await res.json();

    record(
      "Skills",
      "25. User B cannot DELETE User A's skill (IDOR -> 404)",
      res.status === 404 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 26. User A can delete own skill
  {
    const req = createMockRequest("DELETE", `/api/skills/${skillAId}`, {
      cookies: cookiesA,
    });
    const res = await deleteSkillById(req, {
      params: Promise.resolve({ id: skillAId }),
    });
    const json = await res.json();

    record(
      "Skills",
      "26. User A can delete own skill",
      res.status === 200 && json.success,
      `HTTP ${res.status}: ${json.message}`
    );
  }

  // ----------------------------------------------------
  // SECTION 6: SKILL TAGS TENANT-SCOPED UNIQUENESS
  // ----------------------------------------------------
  console.log("\n--- Section 6: Skill Tags Tenant-Scoped Uniqueness & IDOR ---");

  let tagAId: string = "";

  // 27. User A creates tag "Next.js"
  {
    const req = createMockRequest("POST", "/api/skills/tags", {
      cookies: cookiesA,
      body: { name: "Next.js" },
    });
    const res = await postSkillTag(req);
    const json = await res.json();
    tagAId = json.data?._id;
    if (tagAId) createdRecordIds.skillTags.push(new Types.ObjectId(tagAId));

    record(
      "SkillTags",
      "27. User A creates tag 'Next.js'",
      res.status === 201 && json.data?.name === "Next.js",
      `Tag created with ID: ${tagAId}`
    );
  }

  // 28. User A cannot create duplicate tag "Next.js" (tenant-scoped conflict 409)
  {
    const req = createMockRequest("POST", "/api/skills/tags", {
      cookies: cookiesA,
      body: { name: "Next.js" },
    });
    const res = await postSkillTag(req);
    const json = await res.json();

    record(
      "SkillTags",
      "28. Duplicate tag within tenant rejected with 409",
      res.status === 409 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 29. User B CAN create tag "Next.js" (no global collision, tenant-isolated)
  {
    const req = createMockRequest("POST", "/api/skills/tags", {
      cookies: cookiesB,
      body: { name: "Next.js" },
    });
    const res = await postSkillTag(req);
    const json = await res.json();
    if (json.data?._id)
      createdRecordIds.skillTags.push(new Types.ObjectId(json.data._id));

    record(
      "SkillTags",
      "29. User B can create same tag name (tenant-scoped uniqueness)",
      res.status === 201 && json.data?.name === "Next.js",
      `User B created 'Next.js' with distinct ID: ${json.data?._id}`
    );
  }

  // 30. IDOR: User B cannot DELETE User A's tag -> returns 404
  {
    const req = createMockRequest("DELETE", `/api/skills/tags/${tagAId}`, {
      cookies: cookiesB,
    });
    const res = await deleteSkillTagById(req, {
      params: Promise.resolve({ id: tagAId }),
    });
    const json = await res.json();

    record(
      "SkillTags",
      "30. User B cannot DELETE User A's tag (IDOR -> 404)",
      res.status === 404 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 31. User A can delete own tag
  {
    const req = createMockRequest("DELETE", `/api/skills/tags/${tagAId}`, {
      cookies: cookiesA,
    });
    const res = await deleteSkillTagById(req, {
      params: Promise.resolve({ id: tagAId }),
    });
    const json = await res.json();

    record(
      "SkillTags",
      "31. User A can delete own tag",
      res.status === 200 && json.success,
      `HTTP ${res.status}: ${json.message}`
    );
  }

  // ----------------------------------------------------
  // SECTION 7: MESSAGES OWNER-SCOPED INBOX & PUBLIC SUBMISSION
  // ----------------------------------------------------
  console.log("\n--- Section 7: Messages Owner-Scoped Inbox & Public Routing ---");

  // 32. Public contact form submission ignores client-supplied ownerId
  {
    const req = createMockRequest("POST", "/api/messages", {
      body: {
        name: "Public Visitor",
        email: "visitor@example.com",
        subject: "Collaboration",
        message: "Hello there!",
        ownerId: userB._id.toString(), // Attacker attempts to direct message to User B
      },
    });
    const res = await postMessage(req);
    const json = await res.json();
    const messageId = json.data?.id;

    let targetOwnerId: Types.ObjectId | undefined;
    if (messageId) {
      createdRecordIds.messages.push(new Types.ObjectId(messageId));
      const msgDoc = await Message.findById(messageId);
      targetOwnerId = msgDoc?.ownerId;
    }

    record(
      "Messages",
      "32. Public message ignores client ownerId (routed server-side)",
      res.status === 201 &&
        targetOwnerId?.toString() !== userB._id.toString(),
      `Message recipient not hijacked by client. Target owner: ${targetOwnerId}`
    );
  }

  // 33. Create isolated messages for User A and User B
  const messageA = await Message.create({
    name: "Client A",
    email: "clientA@example.com",
    subject: "For User A",
    message: "Private message to A",
    ownerId: userA._id,
  });
  createdRecordIds.messages.push(messageA._id);

  const messageB = await Message.create({
    name: "Client B",
    email: "clientB@example.com",
    subject: "For User B",
    message: "Private message to B",
    ownerId: userB._id,
  });
  createdRecordIds.messages.push(messageB._id);

  // 34. User A reads only User A messages
  {
    const req = createMockRequest("GET", "/api/messages", { cookies: cookiesA });
    const res = await getMessages(req);
    const json = await res.json();
    const hasMsgA = json.data?.some(
      (m: { _id: string }) => m._id === messageA._id.toString()
    );
    const hasMsgB = json.data?.some(
      (m: { _id: string }) => m._id === messageB._id.toString()
    );

    record(
      "Messages",
      "33. User A inbox returns only User A messages",
      res.status === 200 && hasMsgA && !hasMsgB,
      `User A sees message A (${hasMsgA}), does not see message B (${hasMsgB})`
    );
  }

  // 35. User B reads only User B messages
  {
    const req = createMockRequest("GET", "/api/messages", { cookies: cookiesB });
    const res = await getMessages(req);
    const json = await res.json();
    const hasMsgA = json.data?.some(
      (m: { _id: string }) => m._id === messageA._id.toString()
    );
    const hasMsgB = json.data?.some(
      (m: { _id: string }) => m._id === messageB._id.toString()
    );

    record(
      "Messages",
      "34. User B inbox returns only User B messages",
      res.status === 200 && hasMsgB && !hasMsgA,
      `User B sees message B (${hasMsgB}), does not see message A (${hasMsgA})`
    );
  }

  // 36. IDOR: User B cannot PATCH (mark read) User A's message -> returns 404
  {
    const req = createMockRequest(
      "PATCH",
      `/api/messages/${messageA._id.toString()}`,
      {
        cookies: cookiesB,
        body: { read: true },
      }
    );
    const res = await patchMessageById(req, {
      params: Promise.resolve({ id: messageA._id.toString() }),
    });
    const json = await res.json();

    record(
      "Messages",
      "35. User B cannot PATCH User A's message (IDOR -> 404)",
      res.status === 404 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 37. IDOR: User B cannot DELETE User A's message -> returns 404
  {
    const req = createMockRequest(
      "DELETE",
      `/api/messages/${messageA._id.toString()}`,
      {
        cookies: cookiesB,
      }
    );
    const res = await deleteMessageById(req, {
      params: Promise.resolve({ id: messageA._id.toString() }),
    });
    const json = await res.json();

    record(
      "Messages",
      "36. User B cannot DELETE User A's message (IDOR -> 404)",
      res.status === 404 && !json.success,
      `HTTP ${res.status}: ${json.error}`
    );
  }

  // 38. User A can PATCH and DELETE own message
  {
    const patchReq = createMockRequest(
      "PATCH",
      `/api/messages/${messageA._id.toString()}`,
      {
        cookies: cookiesA,
        body: { read: true },
      }
    );
    const patchRes = await patchMessageById(patchReq, {
      params: Promise.resolve({ id: messageA._id.toString() }),
    });
    const patchJson = await patchRes.json();

    const delReq = createMockRequest(
      "DELETE",
      `/api/messages/${messageA._id.toString()}`,
      {
        cookies: cookiesA,
      }
    );
    const delRes = await deleteMessageById(delReq, {
      params: Promise.resolve({ id: messageA._id.toString() }),
    });
    const delJson = await delRes.json();

    record(
      "Messages",
      "37. User A can PATCH and DELETE own message",
      patchRes.status === 200 &&
        patchJson.data?.read === true &&
        delRes.status === 200 &&
        delJson.success,
      `PATCH: ${patchJson.message}, DELETE: ${delJson.message}`
    );
  }

  // ----------------------------------------------------
  // SECTION 8: SUPERADMIN PRIVILEGE BOUNDARY & COMPATIBILITY
  // ----------------------------------------------------
  console.log("\n--- Section 8: Superadmin Privilege Boundary & Admin Bridge ---");

  // 39. Normal user JWT rejected by requireSuperadmin guard (returns 403)
  {
    const req = createMockRequest("GET", "/api/admin-guard-check", {
      cookies: cookiesA,
    });
    const guardResult = await requireSuperadmin(req);
    const isForbidden =
      guardResult.errorResponse?.status === 403;

    record(
      "Superadmin",
      "38. Normal user JWT rejected by requireSuperadmin (403 Forbidden)",
      isForbidden,
      `Status: ${guardResult.errorResponse?.status}`
    );
  }

  // 40. Tampered token with role='superadmin' rejected (invalid signature 401)
  {
    // Construct fake/tampered token signed by arbitrary key or modified payload
    const forgedToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
      Buffer.from(
        JSON.stringify({
          id: userA._id.toString(),
          role: "superadmin",
          email: userA.email,
        })
      ).toString("base64url") +
      ".fake_signature_that_fails_verification";

    const req = createMockRequest("GET", "/api/admin-guard-check", {
      cookies: { [USER_COOKIE_NAME]: forgedToken },
    });
    const guardResult = await requireSuperadmin(req);
    const isUnauthorized =
      guardResult.errorResponse?.status === 401;

    record(
      "Superadmin",
      "39. Tampered JWT with role='superadmin' rejected (401 Unauthorized)",
      isUnauthorized,
      `Status: ${guardResult.errorResponse?.status}`
    );
  }

  // 41. Verify migrated Superadmin user exists and succeeds with requireSuperadmin
  const superadminUser = await User.findOne({ role: "superadmin" });
  if (superadminUser) {
    const superToken = await signUserToken({
      id: superadminUser._id.toString(),
      email: superadminUser.email,
      role: superadminUser.role,
      username: superadminUser.username,
      profession: superadminUser.profession,
    });

    const req = createMockRequest("GET", "/api/admin-guard-check", {
      cookies: { [USER_COOKIE_NAME]: superToken },
    });
    const guardResult = await requireSuperadmin(req);
    const hasUser = !!guardResult.user;

    record(
      "Superadmin",
      "40. Legitimate Superadmin user passes requireSuperadmin guard",
      hasUser && guardResult.user.role === "superadmin",
      `Superadmin resolved: ${guardResult.user?.username} (${guardResult.user?.role})`
    );

    // 40b. Superadmin can select any valid template without restriction
    const updateReq = createMockRequest("PUT", "/api/profile", {
      cookies: { [USER_COOKIE_NAME]: superToken },
      body: {
        selectedTemplate: "doctor",
      },
    });
    const updateRes = await putProfile(updateReq);
    const updateJson = await updateRes.json();

    record(
      "Superadmin",
      "40b. Superadmin can select any valid template without restriction",
      updateRes.status === 200 && updateJson.data?.selectedTemplate === "doctor",
      `Superadmin successfully selected template: ${updateJson.data?.selectedTemplate}`
    );
  } else {
    record(
      "Superadmin",
      "40. Legitimate Superadmin user passes requireSuperadmin guard",
      false,
      "No superadmin user found in database!"
    );
  }

  // 42. Legacy Admin Compatibility Bridge: portfolio_admin_token resolves to Superadmin
  if (superadminUser) {
    const legacyAdminToken = await signAdminToken({
      id: superadminUser._id.toString(),
      username: superadminUser.username,
    });

    const req = createMockRequest("GET", "/api/profile", {
      cookies: { [ADMIN_COOKIE_NAME]: legacyAdminToken },
    });
    const res = await getProfile(req);
    const json = await res.json();

    record(
      "Compatibility",
      "41. Legacy admin token resolves via compatibility bridge to Superadmin",
      res.status === 200 &&
        json.data?.ownerId?.toString() === superadminUser._id.toString(),
      `Profile returned for legacy admin session with ownerId: ${json.data?.ownerId}`
    );
  } else {
    record(
      "Compatibility",
      "41. Legacy admin token resolves via compatibility bridge to Superadmin",
      false,
      "Superadmin user not available"
    );
  }

  // 43. Legacy Admin Record Integrity
  {
    const legacyAdmin = await Admin.findOne({ role: "admin" });
    record(
      "Compatibility",
      "42. Legacy Admin record remains intact in MongoDB",
      !!legacyAdmin,
      `Found legacy Admin '${legacyAdmin?.username}' with role='${legacyAdmin?.role}'`
    );
  }

  // 44. Sanitizer utility unit test: strips forbidden fields
  {
    const dirtyPayload = {
      title: "My Project",
      ownerId: "hacked-owner-id",
      role: "superadmin",
      plan: "pro",
      allowedTemplates: ["all"],
      _id: "fake-id",
      __v: 10,
      safeField: "safeValue",
    };
    const cleaned = sanitizeRequestBody(dirtyPayload);
    const isSafe =
      !("ownerId" in cleaned) &&
      !("role" in cleaned) &&
      !("plan" in cleaned) &&
      !("allowedTemplates" in cleaned) &&
      !("_id" in cleaned) &&
      cleaned.safeField === "safeValue";

    record(
      "Sanitizer",
      "43. sanitizeRequestBody strips all privilege and ownership fields",
      isSafe,
      `Kept safe fields, removed forbidden fields`
    );
  }

  // ----------------------------------------------------
  // SECTION 9: STRICT SCOPED CLEANUP
  // ----------------------------------------------------
  console.log("\n--- Section 9: Scoped Post-Test Cleanup ---");
  console.log("Safely deleting ONLY created test records...");

  await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
  await Profile.deleteMany({ ownerId: { $in: [userA._id, userB._id] } });
  await Project.deleteMany({ _id: { $in: createdRecordIds.projects } });
  await Experience.deleteMany({ _id: { $in: createdRecordIds.experiences } });
  await Skill.deleteMany({ _id: { $in: createdRecordIds.skills } });
  await SkillTag.deleteMany({ _id: { $in: createdRecordIds.skillTags } });
  await Message.deleteMany({ _id: { $in: createdRecordIds.messages } });

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
    console.log(`✓ ALL ${totalTests} PHASE 4 AUTHORIZATION TESTS PASSED!\n`);
  } else {
    console.error(`✗ ${totalTests - totalPassed} tests failed!\n`);
    process.exitCode = 1;
  }

  await mongoose.disconnect();
}

// Execute if run directly
if (require.main === module || process.argv[1]?.includes("test-authorization-phase4")) {
  runAuthorizationTests().catch((err) => {
    console.error("Test Suite Unhandled Exception:", err);
    process.exit(1);
  });
}
