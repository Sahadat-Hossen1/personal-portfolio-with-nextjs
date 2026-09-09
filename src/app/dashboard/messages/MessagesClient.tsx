"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Mail,
  MailOpen,
  ArrowLeft,
  Trash2,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  AtSign,
  User,
  Copy,
  Check,
  Send,
} from "lucide-react";

export interface DashboardMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MessagesClientProps {
  initialMessages: DashboardMessage[];
}

export default function MessagesClient({
  initialMessages,
}: MessagesClientProps) {
  const [messages, setMessages] = useState<DashboardMessage[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<DashboardMessage | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<DashboardMessage | null>(
    null
  );

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "unread" | "read">(
    "all"
  );

  // Loading & Async states
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((current) => (current?.message === message ? null : current));
    }, 4500);
  };

  // Derived counts
  const totalCount = messages.length;
  const unreadCount = messages.filter((m) => !m.read).length;
  const readCount = totalCount - unreadCount;

  // Filter & Search computation
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      // 1. Status Filter
      if (filterMode === "unread" && m.read) return false;
      if (filterMode === "read" && !m.read) return false;

      // 2. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = m.name.toLowerCase().includes(query);
        const matchEmail = m.email.toLowerCase().includes(query);
        const matchSubject = (m.subject || "").toLowerCase().includes(query);
        const matchMessage = m.message.toLowerCase().includes(query);
        return matchName || matchEmail || matchSubject || matchMessage;
      }

      return true;
    });
  }, [messages, filterMode, searchQuery]);

  // Date formatter
  const formatDate = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch {
      return isoDate;
    }
  };

  // Toggle Read / Unread handler (AC-13, AC-14, AC-22)
  const handleToggleRead = async (
    messageId: string,
    currentRead: boolean,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    if (updatingIds.has(messageId)) return;

    setUpdatingIds((prev) => new Set(prev).add(messageId));
    const nextRead = !currentRead;

    try {
      // AC-22: Client PATCH payload hygiene - send strictly { read: boolean }
      const res = await fetch(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: nextRead }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update message status");
      }

      // Synchronize client state with server response
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, read: nextRead } : m))
      );

      if (selectedMessage?._id === messageId) {
        setSelectedMessage((prev) =>
          prev ? { ...prev, read: nextRead } : null
        );
      }

      showFeedback(
        "success",
        nextRead ? "Marked as read." : "Marked as unread."
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update message status.";
      showFeedback("error", msg);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
    }
  };

  // Delete message handler (AC-16, AC-17, AC-18)
  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);
    const targetId = deleteTarget._id;
    const targetName = deleteTarget.name;

    try {
      const res = await fetch(`/api/messages/${targetId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete message");
      }

      // Update state
      setMessages((prev) => prev.filter((m) => m._id !== targetId));

      if (selectedMessage?._id === targetId) {
        setSelectedMessage(null);
      }

      setDeleteTarget(null);
      showFeedback("success", `Message from "${targetName}" deleted.`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete message.";
      showFeedback("error", msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Refresh inbox
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.data)) {
        const mapped: DashboardMessage[] = data.data.map(
          (m: {
            _id: string;
            name: string;
            email: string;
            subject?: string;
            message: string;
            read: boolean;
            createdAt?: string;
            updatedAt?: string;
          }) => ({
            _id: m._id,
            name: m.name,
            email: m.email,
            subject: m.subject || "",
            message: m.message,
            read: Boolean(m.read),
            createdAt: m.createdAt || new Date().toISOString(),
            updatedAt: m.updatedAt || new Date().toISOString(),
          })
        );
        setMessages(mapped);
        showFeedback("success", "Inbox refreshed.");
      } else {
        throw new Error(data.error || "Failed to refresh messages");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to refresh messages.";
      showFeedback("error", msg);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Client Inquiries & Messages
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Inbox for inquiries submitted via your public portfolio contact
              form
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-all disabled:opacity-50"
            title="Refresh inbox"
            aria-label="Refresh inbox"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin text-purple-400" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Dismissible Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-fade-in ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle size={16} className="shrink-0 text-red-400" />
            )}
            <span className="font-medium leading-relaxed">
              {feedback.message}
            </span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Stats, Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/50 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === "all"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("unread")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === "unread"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("read")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === "read"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Read ({readCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by sender, email, subject, or content..."
            className="w-full pl-9 pr-9 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Messages List / Inbox Presentation */}
      {messages.length === 0 ? (
        /* Empty State: No messages in inbox */
        <div className="p-12 rounded-3xl bg-card border border-border text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
            <Mail size={30} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Your inbox is empty
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Messages and inquiries submitted by visitors through your public
              portfolio contact form will appear here.
            </p>
          </div>
        </div>
      ) : filteredMessages.length === 0 ? (
        /* Filter / Search yielded no results */
        <div className="p-10 rounded-3xl bg-card border border-border text-center space-y-3 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <Search size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              No matching messages
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              No inquiries match your current filter or search criteria.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterMode("all");
            }}
            className="px-3.5 py-1.5 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Message Cards */
        <div className="space-y-2.5">
          {filteredMessages.map((msg) => {
            const isUpdating = updatingIds.has(msg._id);

            return (
              <div
                key={msg._id}
                onClick={() => setSelectedMessage(msg)}
                className={`group relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                  !msg.read
                    ? "bg-purple-950/15 border-purple-500/30 hover:border-purple-500/50 shadow-sm"
                    : "bg-card border-border hover:border-border/80 hover:bg-card/80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: Indicator + Sender + Subject + Snippet */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Read / Unread Indicator Icon */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleRead(msg._id, msg.read, e)}
                      disabled={isUpdating}
                      className={`mt-0.5 p-1.5 rounded-lg border transition-all shrink-0 ${
                        !msg.read
                          ? "bg-purple-500/20 text-purple-400 border-purple-500/40 hover:bg-purple-500/30"
                          : "bg-muted text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/80"
                      }`}
                      title={msg.read ? "Mark as unread" : "Mark as read"}
                      aria-label={msg.read ? "Mark as unread" : "Mark as read"}
                    >
                      {isUpdating ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : msg.read ? (
                        <MailOpen size={14} />
                      ) : (
                        <Mail size={14} />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 space-y-1">
                      {/* Name, Email, and Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm tracking-tight ${
                            !msg.read
                              ? "font-bold text-foreground"
                              : "font-semibold text-foreground/90"
                          }`}
                        >
                          {msg.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          &lt;{msg.email}&gt;
                        </span>
                        {!msg.read && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Unread
                          </span>
                        )}
                      </div>

                      {/* Subject */}
                      <div className="text-xs font-semibold text-foreground/95 truncate">
                        {msg.subject ? msg.subject : "(No Subject)"}
                      </div>

                      {/* Message Preview Snippet (AC-10) */}
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  </div>

                  {/* Right: Date & Action buttons */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-1 sm:pt-0">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock size={11} />
                      {formatDate(msg.createdAt)}
                    </span>

                    <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(msg);
                        }}
                        className="p-1.5 rounded-lg border border-transparent hover:border-red-500/30 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                        title="Delete message"
                        aria-label={`Delete message from ${msg.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Message Detail Modal (AC-11) */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-start justify-between gap-4 bg-muted/20">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-foreground tracking-tight truncate">
                    {selectedMessage.subject || "(No Subject)"}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      selectedMessage.read
                        ? "bg-muted text-muted-foreground border-border"
                        : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    }`}
                  >
                    {selectedMessage.read ? "Read" : "Unread"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock size={12} />
                  <span>{formatDate(selectedMessage.createdAt)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label="Close message details"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sender Details Box */}
            <div className="p-6 border-b border-border/60 bg-muted/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-base border border-purple-500/20">
                    {selectedMessage.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <User size={13} className="text-muted-foreground" />
                      <span>{selectedMessage.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <AtSign size={12} />
                      <span>{selectedMessage.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(selectedMessage.email)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                  >
                    {copiedEmail ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                      "Re: " + (selectedMessage.subject || "Your Inquiry")
                    )}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Send size={12} />
                    <span>Reply</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Full Message Body (AC-11) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Message Content
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed select-text font-normal">
                {selectedMessage.message}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(selectedMessage)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleToggleRead(
                      selectedMessage._id,
                      selectedMessage.read
                    )
                  }
                  disabled={updatingIds.has(selectedMessage._id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {updatingIds.has(selectedMessage._id) ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : selectedMessage.read ? (
                    <>
                      <Mail size={14} />
                      <span>Mark as Unread</span>
                    </>
                  ) : (
                    <>
                      <MailOpen size={14} />
                      <span>Mark as Read</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (AC-17, AC-18) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-foreground">
                Delete Message?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to permanently delete this inquiry from{" "}
                <strong className="text-foreground">{deleteTarget.name}</strong>{" "}
                (&lt;{deleteTarget.email}&gt;)? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
