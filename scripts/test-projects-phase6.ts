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
import Project from "@/models/Project";

// Auth & Authorization utilities
import {
  signUserToken,
  hashPassword,
  USER_COOKIE_NAME,
} from "@/lib/auth";

// Projects Route Handlers
import { GET as getProjects, POST as postProject } from "@/app/api/projects/route";
import {
  GET as getProjectById,
  PUT as putProjectById,
  DELETE as deleteProjectById,
} from "@/app/api/projects/[id]/route";

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

export async function runProjectsPhase6Tests() {
  console.log("=================================================");
  console.log("        PHASE 6: PROJECTS CRUD TEST SUITE        ");
  console.log("=================================================");

  await mongoose.connect(MONGODB_URI);

  const testEmailA = "test.usera.phase6@example.com";
  const testEmailB = "test.userb.phase6@example.com";
  const testPassword = "securePassword123";

  // Pre-cleanup of any previous test artifacts
  const existingUsers = await User.find({
    email: { $in: [testEmailA, testEmailB] },
  });
  const existingUserIds = existingUsers.map((u) => u._id);

  if (existingUserIds.length > 0) {
    await Project.deleteMany({ ownerId: { $in: existingUserIds } });
    await User.deleteMany({ _id: { $in: existingUserIds } });
  }

  // Create isolated Test User A (developer) & User B (video-editor)
  const hashedPassword = await hashPassword(testPassword);
  const userA = await User.create({
    name: "Alice Developer",
    email: testEmailA,
    username: "alice-dev-p6",
    passwordHash: hashedPassword,
    role: "user",
    plan: "free",
    profession: "developer",
    allowedTemplates: ["developer"],
  });

  const userB = await User.create({
    name: "Bob Creator",
    email: testEmailB,
    username: "bob-creator-p6",
    passwordHash: hashedPassword,
    role: "user",
    plan: "free",
    profession: "video-editor",
    allowedTemplates: ["video-editor"],
  });

  // Seed 1 existing project for User A and 1 for User B
  const projectA1 = await Project.create({
    title: "Alice AI Assistant",
    description: "Intelligent assistant built with Next.js",
    longDesc: "Full-stack LLM orchestration application",
    image: "/assets/images/projects/alice-1.jpg",
    tags: ["Next.js", "TypeScript", "OpenAI"],
    github: "https://github.com/alice/ai-assistant",
    live: "https://ai-assistant.alice.dev",
    emoji: "🤖",
    featured: true,
    stars: 42,
    order: 1,
    ownerId: userA._id,
  });

  const projectB1 = await Project.create({
    title: "Bob Video Pipeline",
    description: "Automated video rendering tool",
    longDesc: "Node.js video rendering service",
    image: "/assets/images/projects/bob-1.jpg",
    tags: ["FFmpeg", "Node.js"],
    github: "https://github.com/bob/video-pipeline",
    live: "https://video.bob.dev",
    emoji: "🎬",
    featured: false,
    stars: 12,
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

  let createdProjectIdA: string | null = null;

  // ----------------------------------------------------
  // TEST CASES
  // ----------------------------------------------------

  // 1. Unauthenticated GET /api/projects is rejected (401)
  {
    const req = createMockRequest("GET", "/api/projects");
    const res = await getProjects(req);
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;

    record(
      "Authentication",
      "1. Unauthenticated GET /api/projects is rejected",
      passed,
      `Status: ${res.status}, Error: "${json.error}"`
    );
  }

  // 2. Authenticated user can GET own projects
  {
    const req = createMockRequest("GET", "/api/projects", { cookies: cookiesA });
    const res = await getProjects(req);
    const json = await res.json();
    const passed =
      res.status === 200 &&
      json.success === true &&
      Array.isArray(json.data) &&
      json.data.length === 1 &&
      json.data[0].title === "Alice AI Assistant";

    record(
      "Read Access",
      "2. Authenticated user can GET own projects",
      passed,
      `Status: ${res.status}, Retrieved ${json.data?.length} project(s) for User A`
    );
  }

  // 3. Authenticated user cannot see another user's project (Tenant Isolation)
  {
    const req = createMockRequest("GET", "/api/projects", { cookies: cookiesB });
    const res = await getProjects(req);
    const json = await res.json();
    const containsProjectA = (json.data || []).some(
      (p: { _id: string }) => p._id.toString() === projectA1._id.toString()
    );
    const passed =
      res.status === 200 &&
      json.success === true &&
      !containsProjectA &&
      json.data.length === 1 &&
      json.data[0].title === "Bob Video Pipeline";

    record(
      "Multi-Tenancy",
      "3. Authenticated user cannot see another user's project in list",
      passed,
      `User B projects list: ${json.data?.length} item(s). Contains User A project: ${containsProjectA}`
    );
  }

  // 4. Authenticated user can create a project
  {
    const req = createMockRequest("POST", "/api/projects", {
      cookies: cookiesA,
      body: {
        title: "Alice Real-Time Chat",
        description: "WebSocket chat application",
        longDesc: "Full-stack Socket.io implementation",
        tags: ["React", "Socket.io", "Node.js"],
        github: "https://github.com/alice/chat-app",
        live: "https://chat.alice.dev",
        emoji: "💬",
        featured: false,
        stars: 10,
        order: 2,
      },
    });
    const res = await postProject(req);
    const json = await res.json();

    const createdInDb = await Project.findById(json.data?._id);
    const passed =
      res.status === 201 &&
      json.success === true &&
      json.data?.title === "Alice Real-Time Chat" &&
      createdInDb !== null &&
      createdInDb.ownerId?.toString() === userA._id.toString();

    if (createdInDb) {
      createdProjectIdA = createdInDb._id.toString();
    }

    record(
      "Create CRUD",
      "4. Authenticated user can create a project",
      passed,
      `Created ID: ${json.data?._id}, ownerId matches User A: ${createdInDb?.ownerId?.toString() === userA._id.toString()}`
    );
  }

  // 5. Client-supplied ownerId cannot override ownership
  {
    const req = createMockRequest("POST", "/api/projects", {
      cookies: cookiesA,
      body: {
        title: "Malicious Ownership Injection",
        description: "Attempting to assign project to User B",
        ownerId: userB._id.toString(), // Malicious client injection
      },
    });
    const res = await postProject(req);
    const json = await res.json();

    const createdProject = await Project.findById(json.data?._id);
    const ownershipProtected =
      res.status === 201 &&
      createdProject !== null &&
      createdProject.ownerId?.toString() === userA._id.toString() &&
      createdProject.ownerId?.toString() !== userB._id.toString();

    // Clean up temporary injection project
    if (createdProject) {
      await Project.findByIdAndDelete(createdProject._id);
    }

    record(
      "Security / IDOR",
      "5. Client-supplied ownerId cannot override ownership",
      ownershipProtected,
      `Assigned ownerId was forced server-side to User A (${createdProject?.ownerId}), client value ignored`
    );
  }

  // 6. Authenticated user can update own project
  {
    const req = createMockRequest("PUT", `/api/projects/${projectA1._id}`, {
      cookies: cookiesA,
      body: {
        title: "Alice AI Assistant v2",
        description: "Updated description for v2",
        stars: 99,
        featured: true,
      },
    });
    const res = await putProjectById(req, {
      params: Promise.resolve({ id: projectA1._id.toString() }),
    });
    const json = await res.json();

    const updatedInDb = await Project.findById(projectA1._id);
    const passed =
      res.status === 200 &&
      json.success === true &&
      updatedInDb?.title === "Alice AI Assistant v2" &&
      updatedInDb?.stars === 99 &&
      updatedInDb?.ownerId?.toString() === userA._id.toString();

    record(
      "Update CRUD",
      "6. Authenticated user can update own project",
      passed,
      `Updated title: "${updatedInDb?.title}", stars: ${updatedInDb?.stars}`
    );
  }

  // 7. Authenticated user cannot update another user's project (IDOR -> 404)
  {
    // User B attempts to update User A's project
    const req = createMockRequest("PUT", `/api/projects/${projectA1._id}`, {
      cookies: cookiesB,
      body: {
        title: "Hacked by User B",
      },
    });
    const res = await putProjectById(req, {
      params: Promise.resolve({ id: projectA1._id.toString() }),
    });
    const json = await res.json();

    const dbCheck = await Project.findById(projectA1._id);
    const passed =
      res.status === 404 &&
      json.success === false &&
      dbCheck?.title === "Alice AI Assistant v2";

    record(
      "Security / IDOR",
      "7. Authenticated user cannot update another user's project (404)",
      passed,
      `Status: ${res.status}, Project title remained untouched: "${dbCheck?.title}"`
    );
  }

  // 8. Authenticated user can delete own project
  {
    if (!createdProjectIdA) {
      throw new Error("Cannot run test 8: createdProjectIdA is not set");
    }

    const req = createMockRequest("DELETE", `/api/projects/${createdProjectIdA}`, {
      cookies: cookiesA,
    });
    const res = await deleteProjectById(req, {
      params: Promise.resolve({ id: createdProjectIdA }),
    });
    const json = await res.json();

    const dbCheck = await Project.findById(createdProjectIdA);
    const passed =
      res.status === 200 &&
      json.success === true &&
      dbCheck === null;

    record(
      "Delete CRUD",
      "8. Authenticated user can delete own project",
      passed,
      `Deleted ID: ${createdProjectIdA}, exists in DB: ${dbCheck !== null}`
    );
  }

  // 9. Authenticated user cannot delete another user's project (IDOR -> 404)
  {
    // User A attempts to delete User B's project
    const req = createMockRequest("DELETE", `/api/projects/${projectB1._id}`, {
      cookies: cookiesA,
    });
    const res = await deleteProjectById(req, {
      params: Promise.resolve({ id: projectB1._id.toString() }),
    });
    const json = await res.json();

    const dbCheck = await Project.findById(projectB1._id);
    const passed =
      res.status === 404 &&
      json.success === false &&
      dbCheck !== null;

    record(
      "Security / IDOR",
      "9. Authenticated user cannot delete another user's project (404)",
      passed,
      `Status: ${res.status}, User B's project preserved in DB: ${dbCheck !== null}`
    );
  }

  // 10. Invalid project ID (non-ObjectId) is handled safely
  {
    const req = createMockRequest("GET", "/api/projects/not-a-valid-hex-id", {
      cookies: cookiesA,
    });
    const res = await getProjectById(req, {
      params: Promise.resolve({ id: "not-a-valid-hex-id" }),
    });
    const json = await res.json();

    const passed = res.status === 404 && json.success === false;

    record(
      "Validation",
      "10. Invalid project ID returns safe 404 without crashing",
      passed,
      `Status: ${res.status}, Error: "${json.error}"`
    );
  }

  // ----------------------------------------------------
  // SCOPED CLEANUP
  // ----------------------------------------------------
  console.log("\n--- Cleaning Up Phase 6 Test Records ---");
  await Project.deleteMany({ ownerId: { $in: [userA._id, userB._id] } });
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
    console.log(`✓ ALL ${totalTests} PHASE 6 PROJECTS TESTS PASSED!\n`);
  } else {
    console.error(`✗ ${totalTests - totalPassed} tests failed!\n`);
    process.exitCode = 1;
  }

  await mongoose.disconnect();
}

if (require.main === module || process.argv[1]?.includes("test-projects-phase6")) {
  runProjectsPhase6Tests().catch((err) => {
    console.error("Projects Test Suite Error:", err);
    process.exit(1);
  });
}
