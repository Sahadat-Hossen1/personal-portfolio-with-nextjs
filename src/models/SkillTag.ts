import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISkillTag extends Document {
  name: string;
  order: number;
}

const SkillTagSchema = new Schema<ISkillTag>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SkillTag: Model<ISkillTag> =
  mongoose.models.SkillTag || mongoose.model<ISkillTag>("SkillTag", SkillTagSchema);

export default SkillTag;
