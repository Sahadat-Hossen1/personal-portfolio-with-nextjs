import Link from "next/link";
import { Mail, ArrowLeft, Clock } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/authorization";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import { redirect } from "next/navigation";

export default async function DashboardMessagesPage() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) redirect("/login");

  await connectToDatabase();
  const [totalMessages, unreadMessages] = await Promise.all([
    Message.countDocuments({ ownerId: authUser.ownerId }),
    Message.countDocuments({ ownerId: authUser.ownerId, read: false }),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Client Inquiries & Messages
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inbox for inquiries submitted via your public portfolio contact form
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
          <Mail size={32} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Tenant Inbox Foundation
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            You have <span className="font-semibold text-purple-400">{totalMessages}</span>{" "}
            total message{totalMessages === 1 ? "" : "s"} (
            <span className="font-semibold text-rose-400">{unreadMessages} unread</span>
            ). The full interactive inbox viewer and reply workflow will arrive in Phase 6.
          </p>
        </div>
        <div className="pt-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
            <Clock size={12} />
            <span>Interactive inbox coming in Phase 6</span>
          </span>
        </div>
      </div>
    </div>
  );
}
