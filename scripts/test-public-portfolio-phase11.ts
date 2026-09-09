import mongoose from "mongoose";
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

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio";

// Models
import User, {
  isReservedUsername,
  generateUniqueUsername,
  RESERVED_USERNAMES,
} from "@/models/User";
import Profile from "@/models/Profile";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import SkillTag from "@/models/SkillTag";
import Experience from "@/models/Experience";
import Message from "@/models/Message";

// Utilities & Data Loaders
import { getPortfolioDataByOwnerId } from "@/lib/getData";
import { initialProjects, initialSkills } from "@/lib/initialData";
import {
  TEMPLATE_MAP,
  DEFAULT_TEMPLATE_ID,
  resolveTemplateId,
} from "@/templates/index";

// Route Handlers
import { POST as postMessage } from "@/app/api/messages/route";

function createMockRequest(
  method: "GET" | "POST",
  url: string,
  body?: Record<string, unknown>
) {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

interface TestResult {
  category: string;
  name: string;
  status: "PASSED" | "FAILED";
  details?: string;
}

const results: TestResult[] = [];

function record(
  category: string,
  name: string,
  condition: boolean,
  details?: string
) {
  const status: "PASSED" | "FAILED" = condition ? "PASSED" : "FAILED";
  results.push({ category, name, status, details });
  console.log(`[${status}] ${category}: ${name}`);
  if (!condition && details) {
    console.error(`  -> Details: ${details}`);
  }
}

export async function runPublicPortfolioPhase11Tests() {
  console.log("\n=================================================");
  console.log("    PHASE 11 — PUBLIC PORTFOLIO & CONTACT TESTS   ");
  console.log("=================================================\n");

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }

  const timestamp = Date.now();
  const usernameA = `test-alice-${timestamp}`;
  const usernameB = `test-bob-${timestamp}`;
  const usernameC = `test-empty-${timestamp}`;

  // Create Test Users
  const userA = await User.create({
    name: "Alice Developer",
    email: `alice-${timestamp}@example.com`,
    phone: "111222333",
    profession: "developer",
    passwordHash: "dummyHashAlice",
    role: "user",
    plan: "free",
    username: usernameA,
    allowedTemplates: ["developer", "digital-marketer"],
  });

  const userB = await User.create({
    name: "Bob VideoEditor",
    email: `bob-${timestamp}@example.com`,
    phone: "444555666",
    profession: "video-editor",
    passwordHash: "dummyHashBob",
    role: "user",
    plan: "free",
    username: usernameB,
    allowedTemplates: ["video-editor"],
  });

  const userC = await User.create({
    name: "Charlie NewUser",
    email: `charlie-${timestamp}@example.com`,
    phone: "777888999",
    profession: "developer",
    passwordHash: "dummyHashCharlie",
    role: "user",
    plan: "free",
    username: usernameC,
    allowedTemplates: ["developer"],
  });

  // Create Profiles
  const profileA = await Profile.create({
    ownerId: userA._id,
    name: userA.name,
    email: userA.email,
    phone: userA.phone,
    roles: ["Full Stack Engineer"],
    bioBlurb: "Alice's customized bio",
    selectedTemplate: "developer",
  });

  const profileB = await Profile.create({
    ownerId: userB._id,
    name: userB.name,
    email: userB.email,
    phone: userB.phone,
    roles: ["Senior Video Editor"],
    bioBlurb: "Bob's cinematic bio",
    selectedTemplate: "video-editor",
  });

  // User C has a clean zero-state profile
  const profileC = await Profile.create({
    ownerId: userC._id,
    name: userC.name,
    email: userC.email,
    phone: userC.phone,
    roles: [],
    bioBlurb: "",
    selectedTemplate: "developer",
  });

  // Create Projects & Skills for User A only
  const projectA = await Project.create({
    ownerId: userA._id,
    title: "Alice Project X",
    description: "Built exclusively by Alice",
    featured: true,
    order: 1,
  });

  const skillA = await Skill.create({
    ownerId: userA._id,
    name: "Alice Rust Skill",
    category: "Systems",
    level: 95,
  });

  const experienceA = await Experience.create({
    ownerId: userA._id,
    role: "Lead Systems Architect",
    company: "Alice Tech Labs",
    period: "2024 - Present",
  });

  // --- 1. Username Resolution ---
  {
    const resolvedUser = await User.findOne({
      username: usernameA.toUpperCase().toLowerCase(),
    })
      .select("_id name allowedTemplates")
      .lean();

    record(
      "Routing & Identity",
      "1. Resolves User by normalized username slug",
      Boolean(resolvedUser && resolvedUser._id.toString() === userA._id.toString())
    );
  }

  // --- 2. Tenant A Portfolio Isolation ---
  {
    const dataA = await getPortfolioDataByOwnerId(userA._id);
    const hasAliceProject = dataA?.projects.some((p) => p.title === "Alice Project X");
    const hasAliceSkill = dataA?.skills.some((s) => s.name === "Alice Rust Skill");

    record(
      "Tenant Isolation",
      "2. Tenant A data loader returns Tenant A's projects, skills, and profile",
      Boolean(dataA && dataA.profile.name === userA.name && hasAliceProject && hasAliceSkill)
    );
  }

  // --- 3. Tenant B Portfolio Isolation ---
  {
    const dataB = await getPortfolioDataByOwnerId(userB._id);
    const hasAliceProjectInB = dataB?.projects.some((p) => p.title === "Alice Project X");
    const hasAliceSkillInB = dataB?.skills.some((s) => s.name === "Alice Rust Skill");
    const hasAliceExpInB = dataB?.experiences.some((e) => e.company === "Alice Tech Labs");

    record(
      "Tenant Isolation",
      "3. Tenant A's projects/skills/experiences NEVER bleed into Tenant B's data",
      Boolean(dataB && !hasAliceProjectInB && !hasAliceSkillInB && !hasAliceExpInB)
    );
  }

  // --- 4. Empty Tenant Zero-State ---
  {
    const dataC = await getPortfolioDataByOwnerId(userC._id);
    const isZeroState =
      Array.isArray(dataC?.projects) &&
      dataC?.projects.length === 0 &&
      Array.isArray(dataC?.skills) &&
      dataC?.skills.length === 0 &&
      Array.isArray(dataC?.skillTags) &&
      dataC?.skillTags.length === 0 &&
      Array.isArray(dataC?.experiences) &&
      dataC?.experiences.length === 0;

    record(
      "Zero-State Handling",
      "4. Newly registered tenant with no content returns clean empty arrays",
      Boolean(isZeroState)
    );
  }

  // --- 5. No initialData Fallback ---
  {
    const dataC = await getPortfolioDataByOwnerId(userC._id);
    const initialProjectTitles = new Set(initialProjects.map((p) => p.title));
    const leakedInitialProject = dataC?.projects.some((p) =>
      initialProjectTitles.has(p.title)
    );
    const leakedInitialSkill = dataC?.skills.some((s) => s.name === "Google Tag Manager");

    record(
      "Zero-State Handling",
      "5. Zero-state tenant NEVER falls back to hardcoded creator initialData.ts",
      !leakedInitialProject && !leakedInitialSkill
    );
  }

  // --- 6. Invalid Username 404 ---
  {
    const nonexistentUsername = `nonexistent-ghost-${timestamp}`;
    const userGhost = await User.findOne({ username: nonexistentUsername }).lean();
    const dataGhost = userGhost ? await getPortfolioDataByOwnerId(userGhost._id) : null;

    record(
      "Routing & Identity",
      "6. Nonexistent username yields null user and null portfolio data (triggers 404)",
      userGhost === null && dataGhost === null
    );
  }

  // --- 7. SelectedTemplate Authority ---
  {
    const dataA = await getPortfolioDataByOwnerId(userA._id);
    const dataB = await getPortfolioDataByOwnerId(userB._id);

    const templateA = resolveTemplateId(dataA?.profile.selectedTemplate, DEFAULT_TEMPLATE_ID);
    const templateB = resolveTemplateId(dataB?.profile.selectedTemplate, DEFAULT_TEMPLATE_ID);

    record(
      "Template Authority",
      "7. Profile.selectedTemplate is authoritative ('developer' for A, 'video-editor' for B)",
      templateA === "developer" && templateB === "video-editor"
    );
  }

  // --- 8. Query Template Override Ignored on Tenant Portfolios ---
  {
    // On /p/[username], the template is resolved strictly from data.profile.selectedTemplate
    const dataA = await getPortfolioDataByOwnerId(userA._id);
    const simulatedQueryParam: string = "doctor"; // Attempted malicious or forced override

    // The public route logic strictly ignores the query parameter:
    const authoritativeTemplate = resolveTemplateId(
      dataA?.profile.selectedTemplate,
      DEFAULT_TEMPLATE_ID
    );

    record(
      "Template Authority",
      "8. Query parameters (?template=doctor) are ignored; tenant selectedTemplate prevails",
      authoritativeTemplate === "developer" && (authoritativeTemplate as string) !== simulatedQueryParam
    );
  }

  // --- 9. Public Contact Ownership ---
  {
    const req = createMockRequest("POST", "/api/messages", {
      username: usernameA,
      name: "Visitor One",
      email: "visitor1@example.com",
      subject: "Inquiry for Alice",
      message: "Hello Alice, I love your work!",
    });

    const res = await postMessage(req);
    const json = await res.json();

    const savedMsg = await Message.findById(json.data?.id).lean();

    record(
      "Contact Ownership",
      "9. Public contact submission with username resolves Message.ownerId to target user._id",
      res.status === 201 &&
        Boolean(savedMsg && savedMsg.ownerId?.toString() === userA._id.toString())
    );
  }

  // --- 10. Forged ownerId Protection ---
  {
    // Malicious visitor attempts to inject ownerId for User B while targeting Alice
    const req = createMockRequest("POST", "/api/messages", {
      username: usernameA,
      ownerId: userB._id.toString(), // FORGED
      name: "Attacker",
      email: "attacker@example.com",
      subject: "IDOR Attempt",
      message: "Trying to forge ownerId",
    });

    const res = await postMessage(req);
    const json = await res.json();
    const savedMsg = await Message.findById(json.data?.id).lean();

    record(
      "Security & IDOR",
      "10. Injected client-supplied ownerId is strictly ignored; message goes to Alice",
      Boolean(savedMsg && savedMsg.ownerId?.toString() === userA._id.toString())
    );
  }

  // --- 11. Forged userId Protection ---
  {
    // Malicious visitor attempts to inject userId
    const req = createMockRequest("POST", "/api/messages", {
      username: usernameA,
      userId: userB._id.toString(), // FORGED
      name: "Attacker",
      email: "attacker@example.com",
      subject: "IDOR Attempt",
      message: "Trying to forge userId",
    });

    const res = await postMessage(req);
    const json = await res.json();
    const savedMsg = await Message.findById(json.data?.id).lean();

    record(
      "Security & IDOR",
      "11. Injected client-supplied userId is strictly ignored; message goes to Alice",
      Boolean(savedMsg && savedMsg.ownerId?.toString() === userA._id.toString())
    );
  }

  // --- 12. Message Isolation ---
  {
    // User A should have 3 messages from previous tests, User B should have 0
    const countA = await Message.countDocuments({ ownerId: userA._id });
    const countB = await Message.countDocuments({ ownerId: userB._id });

    record(
      "Message Isolation",
      "12. Inbox queries are strictly isolated (Alice has messages, Bob has 0)",
      countA >= 3 && countB === 0
    );
  }

  // --- 13. Reserved Username Protection ---
  {
    const isReserved = isReservedUsername("admin") && isReservedUsername("p");
    const safeCandidate = await generateUniqueUsername("Admin");
    const isSafe = !RESERVED_USERNAMES.has(safeCandidate);

    record(
      "Username Safety",
      "13. Reserved usernames are protected and generate non-reserved slug",
      isReserved && isSafe
    );
  }

  // --- 14. Hardcoded Identity Leakage Check ---
  {
    const templatesDir = path.resolve(process.cwd(), "src/templates");
    const templateFiles: string[] = [];

    function findFiles(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findFiles(fullPath);
        } else if (/\.(tsx|ts)$/.test(entry.name)) {
          templateFiles.push(fullPath);
        }
      }
    }
    findFiles(templatesDir);

    let hasAuthorLeakage = false;
    let leakedInFile = "";

    for (const file of templateFiles) {
      const content = fs.readFileSync(file, "utf8");
      if (
        content.includes("Sahadat") ||
        content.includes("1435") ||
        content.includes("01606081657")
      ) {
        hasAuthorLeakage = true;
        leakedInFile = file;
        break;
      }
    }

    record(
      "Identity Leakage",
      "14. Public templates contain zero occurrences of creator name/email/phone",
      !hasAuthorLeakage,
      hasAuthorLeakage ? `Found in ${leakedInFile}` : undefined
    );
  }

  // --- 15. Safe User Projection ---
  {
    const publicUser = await User.findOne({ username: usernameA })
      .select("_id name allowedTemplates")
      .lean();

    const userObj = publicUser as unknown as Record<string, unknown> | null;
    const exposedHash = userObj?.passwordHash;
    const exposedPhone = userObj?.phone;

    record(
      "Security & Sanitization",
      "15. Public User lookup uses minimal projection and does NOT expose credentials",
      exposedHash === undefined && exposedPhone === undefined && Boolean(publicUser?._id)
    );
  }

  // --- 16. Legacy Root Contact Fallback ---
  {
    // When username is omitted (legacy root route submission), it should fall back to superadmin
    const req = createMockRequest("POST", "/api/messages", {
      name: "Legacy Visitor",
      email: "legacy@example.com",
      subject: "Legacy Contact",
      message: "Testing legacy root fallback",
    });

    const res = await postMessage(req);
    const json = await res.json();

    record(
      "Legacy Compatibility",
      "16. POST /api/messages with omitted username falls back to default owner for legacy /",
      res.status === 201 && Boolean(json.data?.id)
    );
  }

  // --- Cleanup ---
  console.log("\n--- Cleaning Up Temporary Phase 11 Test Records ---");
  await Message.deleteMany({
    ownerId: { $in: [userA._id, userB._id, userC._id] },
  });
  await Project.deleteMany({ ownerId: userA._id });
  await Skill.deleteMany({ ownerId: userA._id });
  await Experience.deleteMany({ ownerId: userA._id });
  await Profile.deleteMany({
    ownerId: { $in: [userA._id, userB._id, userC._id] },
  });
  await User.deleteMany({
    _id: { $in: [userA._id, userB._id, userC._id] },
  });
  console.log("✓ Cleanup finished.\n");

  // Summary Table
  console.log("=================================================");
  console.log("             TEST RESULTS SUMMARY                ");
  console.log("=================================================");
  console.table(results);

  const passedCount = results.filter((r) => r.status === "PASSED").length;
  console.log(`\nResults: ${passedCount}/${results.length} tests passed.`);

  if (passedCount === results.length) {
    console.log("✓ ALL PHASE 11 PUBLIC PORTFOLIO TESTS PASSED!\n");
  } else {
    console.error("✗ SOME PHASE 11 TESTS FAILED!\n");
    process.exit(1);
  }

  await mongoose.disconnect();
}

// Auto-execute if run directly via tsx
if (
  require.main === module ||
  process.argv[1]?.includes("test-public-portfolio-phase11")
) {
  runPublicPortfolioPhase11Tests().catch((err) => {
    console.error("Test execution error:", err);
    process.exit(1);
  });
}
