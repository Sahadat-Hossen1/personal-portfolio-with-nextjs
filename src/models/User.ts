import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { TemplateId } from "@/types/portfolio";

export type UserRole = "superadmin" | "user";
export type UserPlan = "free" | "premium";
export type UserProfession = "developer" | "digital-marketer" | "video-editor";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  profession: UserProfession;
  passwordHash: string;
  role: UserRole;
  plan: UserPlan;
  username: string;
  allowedTemplates: TemplateId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, default: "", trim: true },
    profession: {
      type: String,
      required: true,
      enum: ["developer", "digital-marketer", "video-editor"],
      default: "developer",
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["superadmin", "user"],
      default: "user",
    },
    plan: {
      type: String,
      required: true,
      enum: ["free", "premium"],
      default: "free",
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    allowedTemplates: {
      type: [String],
      enum: ["developer", "video-editor", "digital-marketer", "doctor"],
      default: ["developer", "video-editor", "digital-marketer", "doctor"],
    },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models?.User) {
  delete (mongoose.models as Record<string, unknown>).User;
}

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

/**
 * Reserved system route names and keywords that cannot be used as tenant usernames.
 */
export const RESERVED_USERNAMES: ReadonlySet<string> = new Set([
  "admin",
  "api",
  "dashboard",
  "login",
  "register",
  "p",
  "settings",
  "profile",
  "explore",
  "terms",
  "privacy",
  "help",
  "support",
  "null",
  "undefined",
  "root",
  "superadmin",
]);

/**
 * Checks whether a given string is a reserved system keyword.
 */
export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.trim().toLowerCase());
}

/**
 * Normalizes a display name into a URL-friendly slug.
 */
export function slugifyName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "user";
}

/**
 * Deterministically generates a unique username slug based on a user's name,
 * safely resolving collisions and reserved keyword conflicts.
 */
export async function generateUniqueUsername(name: string): Promise<string> {
  let baseSlug = slugifyName(name);
  if (isReservedUsername(baseSlug)) {
    baseSlug = `${baseSlug}-user`;
  }

  let candidate = baseSlug;
  let counter = 1;

  while (isReservedUsername(candidate) || (await User.exists({ username: candidate }))) {
    counter++;
    candidate = `${baseSlug}-${counter}`;
  }

  return candidate;
}

export default User;

