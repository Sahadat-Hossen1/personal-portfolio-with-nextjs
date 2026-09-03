"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  MailOpen,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  User,
  Reply,
  Inbox,
} from "lucide-react";

interface MessageItem {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesAdminPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);
  const [alert, setAlert] = useState({ type: "", text: "" });

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (data.success && data.data) {
        setMessages(data.data);
        if (data.data.length > 0 && !selectedMessage) {
          setSelectedMessage(data.data[0]);
        }
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (msg: MessageItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const nextRead = !msg.read;
      const res = await fetch(`/api/messages/${msg._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: nextRead }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, read: nextRead } : m))
        );
        if (selectedMessage?._id === msg._id) {
          setSelectedMessage({ ...selectedMessage, read: nextRead });
        }
      }
    } catch {
      setAlert({ type: "error", text: "Failed to update read status" });
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
        if (selectedMessage?._id === id) {
          setSelectedMessage(null);
        }
        setAlert({ type: "success", text: "Message deleted" });
      }
    } catch {
      setAlert({ type: "error", text: "Error deleting message" });
    }
    setTimeout(() => setAlert({ type: "", text: "" }), 3000);
  };

  const handleSelectMessage = (msg: MessageItem) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      handleToggleRead(msg);
    }
  };

  const filtered = messages
    .filter((m) => (filter === "unread" ? !m.read : true))
    .filter((m) => {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject?.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    });

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Mail size={14} /> Contact Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Client Inquiries & <span className="gradient-text">Messages</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Read, respond to, and organize inquiries from prospective clients and collaborators.
          </p>
        </div>

        {unreadCount > 0 && (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-2 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            {unreadCount} Unread Inquiries
          </span>
        )}
      </div>

      {/* Alert */}
      {alert.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2 ${
            alert.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{alert.text}</span>
        </div>
      )}

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 rounded-2xl glass border border-white/10 self-start">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === "all"
                ? "bg-indigo-500/20 text-white border border-indigo-500/40"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            All Messages ({messages.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === "unread"
                ? "bg-indigo-500/20 text-white border border-indigo-500/40"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by sender or text..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl glass border border-white/10 text-xs text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500/60"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center text-muted-foreground">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
        </div>
      ) : messages.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center border border-white/10 space-y-3">
          <Inbox size={44} className="mx-auto text-muted-foreground/30" />
          <h3 className="text-base font-bold text-white">Your Inbox is Empty</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            When someone sends a message via the portfolio contact form, their name, email, and inquiry will show up here.
          </p>
        </div>
      ) : (
        /* Split view: List & Detail */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Messages list */}
          <div className="lg:col-span-2 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground glass rounded-2xl">
                No matching messages found
              </div>
            ) : (
              filtered.map((msg) => {
                const isSelected = selectedMessage?._id === msg._id;
                return (
                  <div
                    key={msg._id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-4 rounded-2xl glass border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-indigo-500/60 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                        : msg.read
                        ? "border-white/5 hover:border-white/15 bg-white/[0.01]"
                        : "border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-bold text-xs text-white truncate">
                        {msg.name}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!msg.read && (
                          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-indigo-300 truncate mb-1">
                      {msg.subject || "No Subject"}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {msg.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Detail Viewer */}
          <div className="lg:col-span-3 glass rounded-3xl p-6 sm:p-8 border border-white/10 sticky top-24 space-y-6">
            {selectedMessage ? (
              <>
                {/* Actions bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRead(selectedMessage)}
                      className="px-3 py-1.5 rounded-xl glass border border-white/10 hover:border-white/20 text-xs font-medium text-white flex items-center gap-1.5"
                    >
                      {selectedMessage.read ? (
                        <>
                          <Mail size={14} className="text-indigo-400" />
                          <span>Mark as Unread</span>
                        </>
                      ) : (
                        <>
                          <MailOpen size={14} className="text-emerald-400" />
                          <span>Mark as Read</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(selectedMessage._id)}
                      className="p-2 rounded-xl glass border border-white/10 hover:border-rose-500/40 text-muted-foreground hover:text-rose-400 transition-colors"
                      title="Delete message"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject || "Portfolio Inquiry"
                    )}`}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                  >
                    <Reply size={14} />
                    <span>Reply via Email</span>
                  </a>
                </div>

                {/* Sender details */}
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white">
                    {selectedMessage.subject || "No Subject Specified"}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1.5 text-white/90">
                      <User size={13} className="text-indigo-400" />
                      <span className="font-semibold">{selectedMessage.name}</span>
                    </div>
                    <div>
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="text-indigo-300 hover:underline flex items-center gap-1"
                      >
                        {selectedMessage.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock size={12} />
                      <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-sm text-white/90 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedMessage.message}
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-xs text-muted-foreground">
                Select an inquiry from the left list to read details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
