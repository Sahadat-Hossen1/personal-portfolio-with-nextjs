import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdmin extends Document {
  username: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

export const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
