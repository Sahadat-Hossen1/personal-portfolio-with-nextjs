import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMessage extends Document {
  /** Portfolio owner / message recipient reference (User._id) */
  ownerId?: Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models?.Message) {
  delete (mongoose.models as Record<string, unknown>).Message;
}

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
