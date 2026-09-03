import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  longDesc: string;
  image: string;
  tags: string[];
  github: string;
  live: string;
  emoji: string;
  featured: boolean;
  stars: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    longDesc: { type: String, default: "" },
    image: { type: String, default: "/assets/images/projects/project-1.jpg" },
    tags: { type: [String], default: [] },
    github: { type: String, default: "https://github.com" },
    live: { type: String, default: "https://example.com" },
    emoji: { type: String, default: "🚀" },
    featured: { type: Boolean, default: false },
    stars: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
