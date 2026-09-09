import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISkillTag extends Document {
  ownerId?: Types.ObjectId;
  name: string;
  order: number;
}

const SkillTagSchema = new Schema<ISkillTag>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index for tenant-scoped uniqueness: (ownerId, name)
SkillTagSchema.index({ ownerId: 1, name: 1 }, { unique: true, sparse: true });

if (process.env.NODE_ENV !== "production" && mongoose.models?.SkillTag) {
  delete (mongoose.models as Record<string, unknown>).SkillTag;
}

export const SkillTag: Model<ISkillTag> =
  mongoose.models.SkillTag || mongoose.model<ISkillTag>("SkillTag", SkillTagSchema);

export default SkillTag;
