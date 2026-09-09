import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/authorization";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import MessagesClient, { DashboardMessage } from "./MessagesClient";

export default async function DashboardMessagesPage() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    redirect("/login");
  }

  await connectToDatabase();

  // Query only messages belonging to the authenticated tenant owner, newest first
  const messages = await Message.find({ ownerId: authUser.ownerId })
    .sort({ createdAt: -1 })
    .lean();

  // Serialize Mongoose docs into plain JSON-safe objects (strictly omitting ownerId, credentials, internals)
  const serializedMessages: DashboardMessage[] = messages.map((m) => ({
    _id: m._id.toString(),
    name: m.name,
    email: m.email,
    subject: m.subject || "",
    message: m.message,
    read: Boolean(m.read),
    createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: m.updatedAt ? new Date(m.updatedAt).toISOString() : new Date().toISOString(),
  }));

  return <MessagesClient initialMessages={serializedMessages} />;
}
