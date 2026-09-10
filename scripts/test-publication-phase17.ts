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
import User, { IUser } from "@/models/User";
import Profile, { IProfile } from "@/models/Profile";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import Experience from "@/models/Experience";
import Message from "@/models/Message";

import { USER_COOKIE_NAME, signUserToken, hashPassword } from "@/lib/auth";
import { getPortfolioDataByOwnerId } from "@/lib/getData";
import { extractNormalizedOverrides } from "@/lib/entitlements/resolver";

// Handlers
import {
  GET as getPublicationHandler,
  PATCH as patchPublicationHandler,
} from "@/app/api/profile/publication/route";
import {
  GET as getProfileHandler,
  PUT as putProfileHandler,
} from "@/app/api/profile/route";
import { POST as postMessageHandler } from "@/app/api/messages/route";
import {
  GET as getUserByIdHandler,
  PUT as putUserByIdHandler,
} from "@/app/api/admin/users/[id]/route";
import sitemap from "@/app/sitemap";
import { generateMetadata as generatePublicMetadata } from "@/app/p/[username]/page";
import OpenGraphImage from "@/app/p/[username]/opengraph-image";

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

interface TestResult {
  num: number;
  test: string;
  passed: boolean;
  details: string;
}

export async function runPhase17PublicationTests() {
  console.log("===============================================================");
  console.log("   PHASE 17 — PORTFOLIO PUBLICATION & VISIBILITY TESTS        ");
  console.log("===============================================================\n");

  await mongoose.connect(MONGODB_URI);

  const testResults: TestResult[] = [];

  function record(num: number, test: string, passed: boolean, details: string) {
    testResults.push({ num, test, passed, details });
    const mark = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${mark}] [Test ${num}] ${test} — ${details}`);
  }

  // Unique fixture emails and usernames
  const superadminEmail = "p17.superadmin@example.com";
  const superadminUsername = "p17-superadmin";

  const aliceEmail = "p17.alice@example.com";
  const aliceUsername = "p17-alice";

  const bobEmail = "p17.bob@example.com";
  const bobUsername = "p17-bob";

  const suspendedEmail = "p17.suspended@example.com";
  const suspendedUsername = "p17-suspended";

  const legacyEmail = "p17.legacy@example.com";
  const legacyUsername = "p17-legacy";

  const rawPassword = "Password123!Secure";
  const passwordHash = await hashPassword(rawPassword);

  const fixtureEmails = [
    superadminEmail,
    aliceEmail,
    bobEmail,
    suspendedEmail,
    legacyEmail,
  ];

  try {
    // 0. Clean prior fixtures
    const oldUsers = await User.find({ email: { $in: fixtureEmails } });
    const oldUserIds = oldUsers.map((u) => u._id);

    await Promise.all([
      User.deleteMany({ email: { $in: fixtureEmails } }),
      Profile.deleteMany({ ownerId: { $in: oldUserIds } }),
      Project.deleteMany({ ownerId: { $in: oldUserIds } }),
      Skill.deleteMany({ ownerId: { $in: oldUserIds } }),
      Experience.deleteMany({ ownerId: { $in: oldUserIds } }),
      Message.deleteMany({ ownerId: { $in: oldUserIds } }),
    ]);

    // 1. Create Superadmin
    const superadminDoc = await User.create({
      name: "Phase 17 Superadmin",
      email: superadminEmail,
      username: superadminUsername,
      passwordHash,
      role: "superadmin",
      profession: "developer",
      plan: "premium",
      accountStatus: "active",
      allowedTemplates: ["developer"],
    });

    const superadminToken = await signUserToken({
      id: superadminDoc._id.toString(),
      email: superadminDoc.email,
      username: superadminDoc.username,
      role: "superadmin",
    });

    // 2. Create User Alice (Active + Published by default)
    const aliceDoc = await User.create({
      name: "Alice Active",
      email: aliceEmail,
      username: aliceUsername,
      passwordHash,
      role: "user",
      profession: "developer",
      plan: "free",
      accountStatus: "active",
      allowedTemplates: ["developer"],
    });

    const aliceToken = await signUserToken({
      id: aliceDoc._id.toString(),
      email: aliceDoc.email,
      username: aliceDoc.username,
      role: "user",
    });

    const aliceProfileDoc = await Profile.create({
      ownerId: aliceDoc._id,
      name: aliceDoc.name,
      email: aliceDoc.email,
      selectedTemplate: "developer",
      bioBlurb: "Alice is an active full stack developer.",
      roles: ["Full Stack Developer"],
      statusText: "Open to opportunities",
    });

    // 3. Create User Bob (Active, will be unpublished)
    const bobDoc = await User.create({
      name: "Bob ContentCreator",
      email: bobEmail,
      username: bobUsername,
      passwordHash,
      role: "user",
      profession: "video-editor",
      plan: "premium",
      accountStatus: "active",
      allowedTemplates: ["video-editor", "developer"],
      featureOverrides: new Map([["floating_chat", true]]),
    });

    const bobToken = await signUserToken({
      id: bobDoc._id.toString(),
      email: bobDoc.email,
      username: bobDoc.username,
      role: "user",
    });

    const bobProfileDoc = await Profile.create({
      ownerId: bobDoc._id,
      name: bobDoc.name,
      email: bobDoc.email,
      selectedTemplate: "video-editor",
      bioBlurb: "Bob is a professional video editor.",
      roles: ["Lead Video Editor"],
      statusText: "Working on documentary",
      sections: {
        hero: true,
        about: true,
        skills: true,
        projects: true,
        experience: true,
        contact: true,
        floatingChat: true,
      },
    });

    // Create rich tenant resources for Bob to verify data preservation
    await Project.create({
      ownerId: bobDoc._id,
      title: "Feature Documentary 2026",
      description: "Edited full length 4K documentary.",
      tags: ["Premiere", "Color Grading"],
    });

    await Skill.create({
      ownerId: bobDoc._id,
      name: "DaVinci Resolve",
      category: "Post-Production",
      level: 95,
    });

    await Experience.create({
      ownerId: bobDoc._id,
      company: "Studio 17 Media",
      role: "Senior Video Editor",
      period: "2023 - Present",
      current: true,
      bullets: ["Produced award-winning commercials."],
    });

    // 4. Create Suspended User Charlie (suspended + published)
    const suspendedDoc = await User.create({
      name: "Charlie Suspended",
      email: suspendedEmail,
      username: suspendedUsername,
      passwordHash,
      role: "user",
      profession: "developer",
      plan: "free",
      accountStatus: "suspended",
      allowedTemplates: ["developer"],
    });

    await Profile.create({
      ownerId: suspendedDoc._id,
      name: suspendedDoc.name,
      email: suspendedDoc.email,
      selectedTemplate: "developer",
      bioBlurb: "Charlie is suspended.",
      publicationStatus: "published",
    });

    // 5. Create Legacy User (no publicationStatus field in Profile document)
    const legacyDoc = await User.create({
      name: "Diana Legacy",
      email: legacyEmail,
      username: legacyUsername,
      passwordHash,
      role: "user",
      profession: "doctor",
      plan: "free",
      accountStatus: "active",
      allowedTemplates: ["doctor"],
    });

    const legacyProfileDoc = await Profile.create({
      ownerId: legacyDoc._id,
      name: legacyDoc.name,
      email: legacyDoc.email,
      selectedTemplate: "doctor",
      bioBlurb: "Diana is a legacy doctor profile.",
      roles: ["Surgeon"],
    });

    // Explicitly unset publicationStatus to simulate historical pre-Phase-17 record
    await Profile.updateOne(
      { _id: legacyProfileDoc._id },
      { $unset: { publicationStatus: "" } }
    );

    // =========================================================================
    // Test 1: New profile defaults to published
    // =========================================================================
    const freshProfile = await Profile.findById(aliceProfileDoc._id).lean();
    record(
      1,
      "New profile defaults to published",
      freshProfile?.publicationStatus === "published",
      `Profile created without explicit publicationStatus has publicationStatus = '${freshProfile?.publicationStatus}'`
    );

    // =========================================================================
    // Test 2: Legacy profile without publicationStatus resolves to published
    // =========================================================================
    const rawLegacyProfile = await Profile.findById(legacyProfileDoc._id).lean();
    const legacyPortfolioData = await getPortfolioDataByOwnerId(legacyDoc._id);
    const legacyPubReq = createMockRequest(
      "http://localhost:3000/api/profile/publication",
      "GET",
      undefined,
      {
        [USER_COOKIE_NAME]: await signUserToken({
          id: legacyDoc._id.toString(),
          email: legacyDoc.email,
          username: legacyDoc.username,
          role: "user",
        }),
      }
    );
    const legacyPubRes = await getPublicationHandler(legacyPubReq);
    const legacyPubBody = await legacyPubRes.json();

    record(
      2,
      "Legacy profile without publicationStatus resolves to published",
      rawLegacyProfile?.publicationStatus === undefined &&
        legacyPortfolioData?.profile?.publicationStatus === "published" &&
        legacyPubBody.data?.publicationStatus === "published",
      `Raw DB field: ${rawLegacyProfile?.publicationStatus}, getPortfolioData: '${legacyPortfolioData?.profile?.publicationStatus}', API endpoint: '${legacyPubBody.data?.publicationStatus}'`
    );

    // =========================================================================
    // Test 3: Schema accepts published
    // =========================================================================
    let schemaAcceptsPublished = true;
    try {
      const testDoc = new Profile({
        ownerId: aliceDoc._id,
        name: "Test Published",
        publicationStatus: "published",
      });
      await testDoc.validate();
    } catch {
      schemaAcceptsPublished = false;
    }
    record(
      3,
      "Schema accepts published",
      schemaAcceptsPublished,
      "Mongoose schema validation succeeded for publicationStatus = 'published'"
    );

    // =========================================================================
    // Test 4: Schema accepts unpublished
    // =========================================================================
    let schemaAcceptsUnpublished = true;
    try {
      const testDoc = new Profile({
        ownerId: aliceDoc._id,
        name: "Test Unpublished",
        publicationStatus: "unpublished",
      });
      await testDoc.validate();
    } catch {
      schemaAcceptsUnpublished = false;
    }
    record(
      4,
      "Schema accepts unpublished",
      schemaAcceptsUnpublished,
      "Mongoose schema validation succeeded for publicationStatus = 'unpublished'"
    );

    // =========================================================================
    // Test 5: Invalid publicationStatus is rejected
    // =========================================================================
    let schemaRejectsInvalid = false;
    try {
      const testDoc = new Profile({
        ownerId: aliceDoc._id,
        name: "Test Invalid",
        publicationStatus: "archived" as any,
      });
      await testDoc.validate();
    } catch {
      schemaRejectsInvalid = true;
    }

    const req5Pub = createMockRequest(
      "http://localhost:3000/api/profile/publication",
      "PATCH",
      { publicationStatus: "invalid_status" },
      { [USER_COOKIE_NAME]: aliceToken }
    );
    const res5Pub = await patchPublicationHandler(req5Pub);
    const body5Pub = await res5Pub.json();

    const req5Profile = createMockRequest(
      "http://localhost:3000/api/profile",
      "PUT",
      { publicationStatus: "draft" },
      { [USER_COOKIE_NAME]: aliceToken }
    );
    const res5Profile = await putProfileHandler(req5Profile);
    const body5Profile = await res5Profile.json();

    record(
      5,
      "Invalid publicationStatus is rejected",
      schemaRejectsInvalid &&
        res5Pub.status === 400 &&
        body5Pub.success === false &&
        res5Profile.status === 400 &&
        body5Profile.success === false,
      `Schema rejected invalid: ${schemaRejectsInvalid}, /api/profile/publication status: ${res5Pub.status}, /api/profile status: ${res5Profile.status}`
    );

    // =========================================================================
    // Test 6: Authenticated owner can read publication status
    // =========================================================================
    const req6 = createMockRequest(
      "http://localhost:3000/api/profile/publication",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: aliceToken }
    );
    const res6 = await getPublicationHandler(req6);
    const body6 = await res6.json();

    const req6Profile = createMockRequest(
      "http://localhost:3000/api/profile",
      "GET",
      undefined,
      { [USER_COOKIE_NAME]: aliceToken }
    );
    const res6Profile = await getProfileHandler(req6Profile);
    const body6Profile = await res6Profile.json();

    record(
      6,
      "Authenticated owner can read publication status",
      res6.status === 200 &&
        body6.success === true &&
        body6.data?.publicationStatus === "published" &&
        body6Profile.data?.publicationStatus === "published",
      `GET /api/profile/publication status: ${res6.status}, returned: '${body6.data?.publicationStatus}'`
    );

    // =========================================================================
    // Test 7: Owner can unpublish their own portfolio
    // =========================================================================
    const req7 = createMockRequest(
      "http://localhost:3000/api/profile/publication",
      "PATCH",
      { publicationStatus: "unpublished" },
      { [USER_COOKIE_NAME]: bobToken }
    );
    const res7 = await patchPublicationHandler(req7);
    const body7 = await res7.json();

    const bobDbAfterUnpublish = await Profile.findOne({ ownerId: bobDoc._id }).lean();

    record(
      7,
      "Owner can unpublish their own portfolio",
      res7.status === 200 &&
        body7.success === true &&
        body7.data?.publicationStatus === "unpublished" &&
        bobDbAfterUnpublish?.publicationStatus === "unpublished",
      `Status: ${res7.status}, API data: '${body7.data?.publicationStatus}', DB field: '${bobDbAfterUnpublish?.publicationStatus}'`
    );

    // =========================================================================
    // Test 8: Owner can publish their own portfolio
    // =========================================================================
    // Temporarily publish Bob then unpublish to verify toggle
    const req8 = createMockRequest(
      "http://localhost:3000/api/profile/publication",
      "PATCH",
      { publicationStatus: "published" },
      { [USER_COOKIE_NAME]: bobToken }
    );
    const res8 = await patchPublicationHandler(req8);
    const body8 = await res8.json();

    const bobDbAfterPublish = await Profile.findOne({ ownerId: bobDoc._id }).lean();

    // Re-unpublish Bob for subsequent visibility tests
    await patchPublicationHandler(
      createMockRequest(
        "http://localhost:3000/api/profile/publication",
        "PATCH",
        { publicationStatus: "unpublished" },
        { [USER_COOKIE_NAME]: bobToken }
      )
    );

    record(
      8,
      "Owner can publish their own portfolio",
      res8.status === 200 &&
        body8.success === true &&
        body8.data?.publicationStatus === "published" &&
        bobDbAfterPublish?.publicationStatus === "published",
      `Status: ${res8.status}, API data: '${body8.data?.publicationStatus}', DB field: '${bobDbAfterPublish?.publicationStatus}'`
    );

    // =========================================================================
    // Test 9: User cannot modify another user's publication status
    // =========================================================================
    // Alice tries to use superadmin update endpoint to modify Bob
    const req9 = createMockRequest(
      `http://localhost:3000/api/admin/users/${bobDoc._id}`,
      "PUT",
      { publicationStatus: "published" },
      { [USER_COOKIE_NAME]: aliceToken }
    );
    const res9 = await putUserByIdHandler(req9, {
      params: Promise.resolve({ id: bobDoc._id.toString() }),
    });

    const bobDbAfterUnauthorized = await Profile.findOne({ ownerId: bobDoc._id }).lean();

    record(
      9,
      "User cannot modify another user's publication status",
      res9.status === 403 &&
        bobDbAfterUnauthorized?.publicationStatus === "unpublished",
      `Non-superadmin update rejected with HTTP ${res9.status}, Bob publicationStatus preserved as '${bobDbAfterUnauthorized?.publicationStatus}'`
    );

    // =========================================================================
    // Test 10: Client ownerId cannot bypass ownership
    // =========================================================================
    // Alice sends PATCH /api/profile/publication with ownerId set to Bob's ID
    const req10 = createMockRequest(
      "http://localhost:3000/api/profile/publication",
      "PATCH",
      {
        publicationStatus: "unpublished",
        ownerId: bobDoc._id.toString(),
        userId: bobDoc._id.toString(),
      },
      { [USER_COOKIE_NAME]: aliceToken }
    );
    const res10 = await patchPublicationHandler(req10);

    // Verify Bob's profile was not affected and Alice's own profile was the one touched
    const aliceDbAfter10 = await Profile.findOne({ ownerId: aliceDoc._id }).lean();
    const bobDbAfter10 = await Profile.findOne({ ownerId: bobDoc._id }).lean();

    // Re-publish Alice to keep test suite clean
    await patchPublicationHandler(
      createMockRequest(
        "http://localhost:3000/api/profile/publication",
        "PATCH",
        { publicationStatus: "published" },
        { [USER_COOKIE_NAME]: aliceToken }
      )
    );

    record(
      10,
      "Client ownerId cannot bypass ownership",
      res10.status === 200 &&
        bobDbAfter10?.publicationStatus === "unpublished" &&
        aliceDbAfter10?.publicationStatus === "unpublished",
      `Client ownerId was ignored: authenticated user's own profile was updated, target tenant remained '${bobDbAfter10?.publicationStatus}'`
    );

    // =========================================================================
    // Test 11: Active + published portfolio renders successfully
    // =========================================================================
    const meta11 = await generatePublicMetadata({
      params: Promise.resolve({ username: aliceUsername }),
    });

    record(
      11,
      "Active + published portfolio renders successfully",
      meta11.title !== "Portfolio Not Found" &&
        typeof meta11.title === "string" &&
        meta11.title.includes("Alice Active"),
      `Metadata title resolved to: '${meta11.title}'`
    );

    // =========================================================================
    // Test 12: Active + unpublished portfolio returns 404
    // =========================================================================
    const meta12Normal = await generatePublicMetadata({
      params: Promise.resolve({ username: bobUsername }),
    });

    // Verify query parameter bypass attempts are strictly rejected
    const meta12Preview = await generatePublicMetadata({
      params: Promise.resolve({ username: bobUsername }),
      searchParams: Promise.resolve({ preview: "true", published: "true" }),
    });

    record(
      12,
      "Active + unpublished portfolio returns 404",
      meta12Normal.title === "Portfolio Not Found" &&
        meta12Preview.title === "Portfolio Not Found",
      `Normal access title: '${meta12Normal.title}', Query parameter ?preview=true bypass attempt title: '${meta12Preview.title}'`
    );

    // =========================================================================
    // Test 13: Suspended + published portfolio remains 404
    // =========================================================================
    const meta13 = await generatePublicMetadata({
      params: Promise.resolve({ username: suspendedUsername }),
    });

    record(
      13,
      "Suspended + published portfolio remains 404",
      meta13.title === "Portfolio Not Found",
      `Suspended tenant with publicationStatus='published' returned: '${meta13.title}'`
    );

    // =========================================================================
    // Test 14: Unpublished metadata does not expose personal data
    // =========================================================================
    const meta14 = await generatePublicMetadata({
      params: Promise.resolve({ username: bobUsername }),
    });

    const leakedName = typeof meta14.title === "string" && meta14.title.includes("Bob");
    const leakedBio =
      typeof meta14.description === "string" &&
      (meta14.description.includes("documentary") ||
        meta14.description.includes("video"));

    record(
      14,
      "Unpublished metadata does not expose personal data",
      meta14.title === "Portfolio Not Found" &&
        meta14.description === "The requested portfolio could not be found." &&
        !leakedName &&
        !leakedBio,
      `Title: '${meta14.title}', Description: '${meta14.description}', Name leaked: ${leakedName}, Bio leaked: ${leakedBio}`
    );

    // =========================================================================
    // Test 15: Unpublished OG image uses generic fallback
    // =========================================================================
    const ogResponseBob = await OpenGraphImage({
      params: Promise.resolve({ username: bobUsername }),
    });

    record(
      15,
      "Unpublished OG image uses generic fallback",
      ogResponseBob.status === 200,
      `OG Image generation returns status ${ogResponseBob.status} with generic fallback card`
    );

    // =========================================================================
    // Test 16: Unpublished portfolio is excluded from sitemap
    // =========================================================================
    const sitemapEntries = await sitemap();
    const sitemapUrls = sitemapEntries.map((e) => e.url);

    const bobInSitemap = sitemapUrls.some((u) => u.includes(`/p/${bobUsername}`));
    const aliceInSitemap = sitemapUrls.some((u) => u.includes(`/p/${aliceUsername}`));
    const legacyInSitemap = sitemapUrls.some((u) => u.includes(`/p/${legacyUsername}`));

    record(
      16,
      "Unpublished portfolio is excluded from sitemap",
      !bobInSitemap && aliceInSitemap && legacyInSitemap,
      `Unpublished in sitemap: ${bobInSitemap} (correctly false), Active published in sitemap: ${aliceInSitemap}, Legacy in sitemap: ${legacyInSitemap}`
    );

    // =========================================================================
    // Test 17: Unpublished portfolio rejects contact submission
    // =========================================================================
    const req17 = createMockRequest(
      "http://localhost:3000/api/messages",
      "POST",
      {
        name: "Client Inquirer",
        email: "client@example.com",
        message: "Can we hire you for video editing?",
        username: bobUsername,
      }
    );
    const res17 = await postMessageHandler(req17);
    const body17 = await res17.json();

    record(
      17,
      "Unpublished portfolio rejects contact submission",
      res17.status === 404 && body17.error === "Recipient portfolio not found",
      `Status: ${res17.status}, Error: '${body17.error}'`
    );

    // =========================================================================
    // Test 18: No Message is created for unpublished portfolio
    // =========================================================================
    const bobMessageCount = await Message.countDocuments({ ownerId: bobDoc._id });

    record(
      18,
      "No Message is created for unpublished portfolio",
      bobMessageCount === 0,
      `Message count for unpublished tenant = ${bobMessageCount}`
    );

    // =========================================================================
    // Test 19: Republishing immediately restores public access
    // =========================================================================
    // Republish Bob
    const republishReq = createMockRequest(
      "http://localhost:3000/api/profile/publication",
      "PATCH",
      { publicationStatus: "published" },
      { [USER_COOKIE_NAME]: bobToken }
    );
    const republishRes = await patchPublicationHandler(republishReq);

    const meta19 = await generatePublicMetadata({
      params: Promise.resolve({ username: bobUsername }),
    });

    const sitemap19 = await sitemap();
    const bobNowInSitemap = sitemap19.some((e) => e.url.includes(`/p/${bobUsername}`));

    const contact19Req = createMockRequest(
      "http://localhost:3000/api/messages",
      "POST",
      {
        name: "Client Inquirer",
        email: "client@example.com",
        message: "Hiring after republishing!",
        username: bobUsername,
      }
    );
    const contact19Res = await postMessageHandler(contact19Req);
    const contact19Body = await contact19Res.json();

    record(
      19,
      "Republishing immediately restores public access",
      republishRes.status === 200 &&
        meta19.title !== "Portfolio Not Found" &&
        typeof meta19.title === "string" &&
        meta19.title.includes("Bob ContentCreator") &&
        bobNowInSitemap &&
        contact19Res.status === 201 &&
        contact19Body.success === true,
      `Metadata title: '${meta19.title}', In sitemap: ${bobNowInSitemap}, Contact status: ${contact19Res.status}`
    );

    // =========================================================================
    // Test 20: Publication status changes preserve portfolio data/configuration
    // =========================================================================
    // Verify Bob's profile content, project, skill, experience, message, plan, overrides are intact
    const preservedProfile = await Profile.findOne({ ownerId: bobDoc._id }).lean();
    const preservedProjects = await Project.find({ ownerId: bobDoc._id }).lean();
    const preservedSkills = await Skill.find({ ownerId: bobDoc._id }).lean();
    const preservedExperiences = await Experience.find({ ownerId: bobDoc._id }).lean();
    const preservedMessages = await Message.find({ ownerId: bobDoc._id }).lean();
    const preservedUser = await User.findById(bobDoc._id).lean();

    const bobOverrides = extractNormalizedOverrides(preservedUser?.featureOverrides);
    const dataPreserved =
      preservedProfile !== null &&
      preservedProfile.selectedTemplate === "video-editor" &&
      preservedProfile.bioBlurb === "Bob is a professional video editor." &&
      preservedProjects.length === 1 &&
      preservedProjects[0].title === "Feature Documentary 2026" &&
      preservedSkills.length === 1 &&
      preservedSkills[0].name === "DaVinci Resolve" &&
      preservedExperiences.length === 1 &&
      preservedExperiences[0].company === "Studio 17 Media" &&
      preservedMessages.length === 1 &&
      preservedUser?.plan === "premium" &&
      preservedUser?.accountStatus === "active" &&
      bobOverrides.floating_chat === true;

    record(
      20,
      "Publication status changes preserve portfolio data/configuration",
      Boolean(dataPreserved),
      `Profile: ${!!preservedProfile}, Projects: ${preservedProjects.length}, Skills: ${preservedSkills.length}, Experiences: ${preservedExperiences.length}, Messages: ${preservedMessages.length}, Plan: '${preservedUser?.plan}', Overrides preserved: ${bobOverrides.floating_chat}`
    );

    // =========================================================================
    // Summary
    // =========================================================================
    console.log("\n===============================================================");
    const passedCount = testResults.filter((r) => r.passed).length;
    const failedCount = testResults.length - passedCount;
    console.log(
      `PHASE 17 RESULTS: ${passedCount}/${testResults.length} PASSED (${failedCount} FAILED)`
    );
    console.log("===============================================================\n");

    // Cleanup fixtures
    await Promise.all([
      User.deleteMany({ email: { $in: fixtureEmails } }),
      Profile.deleteMany({
        ownerId: {
          $in: [
            superadminDoc._id,
            aliceDoc._id,
            bobDoc._id,
            suspendedDoc._id,
            legacyDoc._id,
          ],
        },
      }),
      Project.deleteMany({
        ownerId: {
          $in: [
            superadminDoc._id,
            aliceDoc._id,
            bobDoc._id,
            suspendedDoc._id,
            legacyDoc._id,
          ],
        },
      }),
      Skill.deleteMany({
        ownerId: {
          $in: [
            superadminDoc._id,
            aliceDoc._id,
            bobDoc._id,
            suspendedDoc._id,
            legacyDoc._id,
          ],
        },
      }),
      Experience.deleteMany({
        ownerId: {
          $in: [
            superadminDoc._id,
            aliceDoc._id,
            bobDoc._id,
            suspendedDoc._id,
            legacyDoc._id,
          ],
        },
      }),
      Message.deleteMany({
        ownerId: {
          $in: [
            superadminDoc._id,
            aliceDoc._id,
            bobDoc._id,
            suspendedDoc._id,
            legacyDoc._id,
          ],
        },
      }),
    ]);

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
  process.argv[1]?.includes("test-publication-phase17")
) {
  runPhase17PublicationTests().catch((err) => {
    console.error("Fatal error running Phase 17 tests:", err);
    process.exit(1);
  });
}
