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

export async function runVerification() {
  console.log("=================================================");
  console.log("  PHASE 2: MIGRATION DATA INTEGRITY VERIFICATION ");
  console.log("=================================================");

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Failed to connect to MongoDB.");
  }

  const results: { check: string; passed: boolean; details: string }[] = [];

  // Check 1: Superadmin User exists in 'users' collection
  const userCol = db.collection("users");
  const superadmin = await userCol.findOne({ role: "superadmin" });
  if (superadmin) {
    results.push({
      check: "1. Superadmin User exists in 'users'",
      passed: true,
      details: `Found user '${superadmin.username}' (${superadmin._id}) with role '${superadmin.role}'`,
    });
  } else {
    results.push({
      check: "1. Superadmin User exists in 'users'",
      passed: false,
      details: "No user with role 'superadmin' found in 'users' collection.",
    });
  }

  // Check 2: Every portfolio document has an ownerId and points to an existing user
  const collections = ["profiles", "projects", "skills", "skilltags", "experiences", "messages"];
  for (const colName of collections) {
    const col = db.collection(colName);
    const total = await col.countDocuments();
    const unowned = await col.countDocuments({
      $or: [{ ownerId: { $exists: false } }, { ownerId: null }],
    });

    if (total === 0) {
      results.push({
        check: `2. Ownership in '${colName}'`,
        passed: true,
        details: `0 total documents (empty collection)`,
      });
      continue;
    }

    if (unowned === 0) {
      // Check if all ownerIds correspond to a valid user
      const distinctOwners = await col.distinct("ownerId");
      const validUsersCount = await userCol.countDocuments({ _id: { $in: distinctOwners } });
      const allValid = validUsersCount === distinctOwners.length;

      results.push({
        check: `2. Ownership in '${colName}'`,
        passed: allValid,
        details: allValid
          ? `All ${total} documents owned by valid User(s)`
          : `${total} docs owned, but some ownerIds do not match a User document`,
      });
    } else {
      results.push({
        check: `2. Ownership in '${colName}'`,
        passed: false,
        details: `${unowned} of ${total} documents are missing ownerId`,
      });
    }
  }

  // Check 3: Content preservation (no content dropped)
  const profile = await db.collection("profiles").findOne({});
  const projectCount = await db.collection("projects").countDocuments();
  const skillCount = await db.collection("skills").countDocuments();
  const expCount = await db.collection("experiences").countDocuments();

  const contentPreserved = !!profile && projectCount > 0 && skillCount > 0 && expCount > 0;
  results.push({
    check: "3. Existing portfolio content preservation",
    passed: contentPreserved,
    details: `Profile: ${profile?.name || "none"}, Projects: ${projectCount}, Skills: ${skillCount}, Experiences: ${expCount}`,
  });

  // Check 4: SkillTag index tenant-scoping
  const skillTagCol = db.collection("skilltags");
  const indexes = await skillTagCol.indexes();
  const hasOldUnique = indexes.some((idx) => idx.name === "name_1");
  const hasCompoundIndex = indexes.some(
    (idx) => idx.key && idx.key.ownerId === 1 && idx.key.name === 1
  );

  const indexCorrect = !hasOldUnique && hasCompoundIndex;
  results.push({
    check: "4. SkillTag tenant-scoped uniqueness",
    passed: indexCorrect,
    details: indexCorrect
      ? "Legacy 'name_1' unique index removed; 'ownerId_1_name_1' compound index active"
      : `Legacy unique: ${hasOldUnique}, Compound index: ${hasCompoundIndex}`,
  });

  // Check 5: Admin compatibility
  const adminCol = db.collection("admins");
  const admin = await adminCol.findOne({});
  const adminIntact = !!admin && !!admin.passwordHash;
  const hashMatchesUser =
    adminIntact && superadmin ? admin.passwordHash === superadmin.passwordHash : false;

  results.push({
    check: "5. Existing Admin credentials compatibility",
    passed: adminIntact && hashMatchesUser,
    details: adminIntact
      ? `Admin record '${admin.username}' preserved; hash matches Superadmin: ${hashMatchesUser}`
      : "Admin record missing or incomplete",
  });

  // Print results table
  console.log("\nVerification Results Summary:");
  console.table(
    results.map((r) => ({
      Check: r.check,
      Status: r.passed ? "PASSED ✓" : "FAILED ✗",
      Details: r.details,
    }))
  );

  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log("\n✓ ALL INTEGRITY CHECKS PASSED SUCCESSFULLY!");
  } else {
    console.error("\n❌ SOME VERIFICATION CHECKS FAILED!");
  }

  await mongoose.disconnect();
  return { allPassed, results };
}

// Allow direct execution
if (require.main === module) {
  runVerification()
    .then(({ allPassed }) => process.exit(allPassed ? 0 : 1))
    .catch((err) => {
      console.error("Verification error:", err);
      process.exit(1);
    });
}
