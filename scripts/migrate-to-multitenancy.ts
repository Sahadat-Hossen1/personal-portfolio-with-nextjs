import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables from .env.local if present
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio";

export async function runMigration() {
  console.log("=================================================");
  console.log("  PHASE 2: MULTI-TENANT DATA OWNERSHIP MIGRATION ");
  console.log("=================================================");
  console.log(`Connecting to MongoDB at: ${MONGODB_URI.replace(/\/\/.*@/, "//<credentials>@")}`);

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Failed to access database instance.");
  }

  console.log("✓ Connected to MongoDB successfully.\n");

  // Step 1: Inspect existing Admin record
  console.log("--- Step 1: Inspecting Existing Admin Account ---");
  const adminCol = db.collection("admins");
  const existingAdmin = await adminCol.findOne({});

  if (!existingAdmin) {
    console.warn("⚠ No Admin document found in 'admins' collection.");
  } else {
    console.log(`✓ Found existing admin: "${existingAdmin.username}" (role: "${existingAdmin.role || 'admin'}")`);
  }

  // Step 2: Inspect existing Profile for owner identity attributes
  const profileCol = db.collection("profiles");
  const existingProfile = await profileCol.findOne({});
  const ownerName = existingProfile?.name || "Sahadat Hossen";
  const ownerEmail = (existingProfile?.email || "sahadat.hossen1435@gmail.com").toLowerCase().trim();
  const ownerPhone = existingProfile?.phone || "+8801606081657";
  const ownerUsername = (existingAdmin?.username || "admin").toLowerCase().trim();

  // Step 3: Create or identify the initial Superadmin User in 'users' collection
  console.log("\n--- Step 2: Identifying or Creating Superadmin User ---");
  const userCol = db.collection("users");

  let superadmin = await userCol.findOne({
    $or: [{ role: "superadmin" }, { username: ownerUsername }, { email: ownerEmail }],
  });

  if (!superadmin) {
    if (!existingAdmin?.passwordHash) {
      throw new Error(
        "Cannot create initial Superadmin: neither an existing superadmin user nor an admin passwordHash was found."
      );
    }

    const newUserData = {
      name: ownerName,
      email: ownerEmail,
      phone: ownerPhone,
      profession: "developer",
      passwordHash: existingAdmin.passwordHash, // Preserving existing bcrypt hash without needing plaintext
      role: "superadmin",
      plan: "free",
      username: ownerUsername,
      allowedTemplates: ["developer", "video-editor", "digital-marketer", "doctor"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await userCol.insertOne(newUserData);
    superadmin = await userCol.findOne({ _id: insertResult.insertedId });
    console.log(`✓ Created new Superadmin User:`);
    console.log(`   - ID: ${superadmin?._id}`);
    console.log(`   - Username: "${superadmin?.username}"`);
    console.log(`   - Email: "${superadmin?.email}"`);
    console.log(`   - Role: "${superadmin?.role}"`);
    console.log(`   - Password Hash: Preserved from existing Admin record`);
  } else {
    console.log(`✓ Existing Superadmin User identified:`);
    console.log(`   - ID: ${superadmin._id}`);
    console.log(`   - Username: "${superadmin.username}"`);
    console.log(`   - Role: "${superadmin.role}"`);

    // Ensure role is superadmin
    if (superadmin.role !== "superadmin") {
      await userCol.updateOne({ _id: superadmin._id }, { $set: { role: "superadmin" } });
      console.log(`   - Updated role to "superadmin".`);
    }
  }

  const superadminId = superadmin!._id;

  // Step 4: Handle SkillTag index migration
  console.log("\n--- Step 3: Migrating SkillTag Indexes ---");
  const skillTagCol = db.collection("skilltags");
  const existingIndexes = await skillTagCol.indexes();
  const hasOldGlobalUnique = existingIndexes.some((idx) => idx.name === "name_1");

  if (hasOldGlobalUnique) {
    console.log("   Dropping legacy global unique index 'name_1' on skilltags...");
    await skillTagCol.dropIndex("name_1");
    console.log("   ✓ Legacy global unique index 'name_1' dropped.");
  } else {
    console.log("   ✓ No legacy 'name_1' index detected.");
  }

  // Create compound index { ownerId: 1, name: 1 } (sparse & unique)
  await skillTagCol.createIndex(
    { ownerId: 1, name: 1 },
    { unique: true, sparse: true, name: "ownerId_1_name_1" }
  );
  console.log("   ✓ Tenant-scoped compound index 'ownerId_1_name_1' verified/created.");

  // Step 5: Assign existing portfolio documents to the superadmin ownerId
  console.log("\n--- Step 4: Assigning ownerId to Existing Portfolio Collections ---");

  const collectionsToMigrate = [
    { name: "profiles", collection: db.collection("profiles") },
    { name: "projects", collection: db.collection("projects") },
    { name: "skills", collection: db.collection("skills") },
    { name: "skilltags", collection: db.collection("skilltags") },
    { name: "experiences", collection: db.collection("experiences") },
    { name: "messages", collection: db.collection("messages") },
  ];

  const migrationStats: Record<string, { total: number; newlyAssigned: number; alreadyOwned: number }> = {};

  for (const { name, collection } of collectionsToMigrate) {
    const totalCount = await collection.countDocuments();
    const unassignedCount = await collection.countDocuments({
      $or: [{ ownerId: { $exists: false } }, { ownerId: null }],
    });

    if (unassignedCount > 0) {
      const updateResult = await collection.updateMany(
        { $or: [{ ownerId: { $exists: false } }, { ownerId: null }] },
        { $set: { ownerId: superadminId } }
      );
      migrationStats[name] = {
        total: totalCount,
        newlyAssigned: updateResult.modifiedCount,
        alreadyOwned: totalCount - unassignedCount,
      };
      console.log(`✓ ${name.padEnd(12)}: ${updateResult.modifiedCount} updated (out of ${totalCount} total)`);
    } else {
      migrationStats[name] = {
        total: totalCount,
        newlyAssigned: 0,
        alreadyOwned: totalCount,
      };
      console.log(`✓ ${name.padEnd(12)}: All ${totalCount} documents already have ownerId`);
    }
  }

  // Step 6: Final Verification Check
  console.log("\n--- Step 5: Final Integrity Verification ---");
  let anyUnassigned = false;
  for (const { name, collection } of collectionsToMigrate) {
    const remaining = await collection.countDocuments({
      $or: [{ ownerId: { $exists: false } }, { ownerId: null }],
    });
    if (remaining > 0) {
      anyUnassigned = true;
      console.error(`❌ ERROR: Collection '${name}' still contains ${remaining} unassigned documents!`);
    }
  }

  if (!anyUnassigned) {
    console.log("✓ All portfolio collections are 100% owner-scoped to Superadmin.");
  }

  console.log("\n=================================================");
  console.log("         MIGRATION COMPLETED SUCCESSFULLY        ");
  console.log("=================================================");
  console.log(`Superadmin User: ${superadmin?.username} (${superadmin?._id})`);
  console.table(migrationStats);

  await mongoose.disconnect();
  return { superadmin, stats: migrationStats };
}

// Allow direct execution
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("\n❌ Migration failed with error:", err);
      process.exit(1);
    });
}
