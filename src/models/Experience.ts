import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IExperience extends Document {
  ownerId?: Types.ObjectId;
  role: string;
  company: string;
  companyUrl: string;
  location: string;
  period: string;
  type: "Full-time" | "Contract" | "Part-time" | "Freelance" | string;
  bullets: string[];
  tags: string[];
  current: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    companyUrl: { type: String, default: "" },
    location: { type: String, default: "Remote" },
    period: { type: String, required: true },
    type: { type: String, default: "Full-time" },
    bullets: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    current: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Experience: Model<IExperience> =
  mongoose.models.Experience || mongoose.model<IExperience>("Experience", ExperienceSchema);

export default Experience;
