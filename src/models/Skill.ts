import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISkill extends Document {
  name: string;
  icon: string;
  level: number;
  color: string;
  category: "Web Development" | "Analytics & Tracking" | string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "⚡" },
    level: { type: Number, required: true, min: 0, max: 100, default: 80 },
    color: { type: String, default: "#38bdf8" },
    category: { type: String, required: true, default: "Web Development" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Skill: Model<ISkill> =
  mongoose.models.Skill || mongoose.model<ISkill>("Skill", SkillSchema);

export default Skill;
