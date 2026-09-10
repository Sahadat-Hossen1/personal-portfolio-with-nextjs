"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, EyeOff, Loader2, Check, AlertCircle, ExternalLink } from "lucide-react";

interface PublicationControlProps {
  initialStatus?: "published" | "unpublished";
  username: string;
}

export default function PublicationControl({
  initialStatus = "published",
  username,
}: PublicationControlProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"published" | "unpublished">(initialStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isPublished = status === "published";

  const handleToggle = async () => {
    const nextStatus = isPublished ? "unpublished" : "published";
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile/publication", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicationStatus: nextStatus }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update publication status.");
      }

      setStatus(nextStatus);
      setMessage({
        type: "success",
        text:
          nextStatus === "published"
            ? "Portfolio is now published and live."
            : "Portfolio is now unpublished and hidden from public access.",
      });

      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: (err as Error).message || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
              isPublished
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}
          >
            {isPublished ? <Globe size={20} /> : <EyeOff size={20} />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Portfolio Visibility
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isPublished
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPublished ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
                />
                {isPublished ? "Published" : "Unpublished"}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-0.5 max-w-lg">
              {isPublished ? (
                <>
                  Your portfolio is publicly accessible at{" "}
                  <a
                    href={`/p/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-0.5 underline decoration-indigo-500/40 underline-offset-2"
                  >
                    /p/{username}
                    <ExternalLink size={11} className="ml-0.5" />
                  </a>
                  .
                </>
              ) : (
                "Your portfolio is unpublished and hidden from the public (returns 404). All your content and settings remain fully editable in this dashboard."
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            type="button"
            onClick={handleToggle}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm ${
              isPublished
                ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/50"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Updating...</span>
              </>
            ) : isPublished ? (
              <span>Unpublish Portfolio</span>
            ) : (
              <span>Publish Portfolio</span>
            )}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-fade-in ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <Check size={14} />
          ) : (
            <AlertCircle size={14} />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
