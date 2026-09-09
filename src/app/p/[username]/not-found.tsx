import Link from "next/link";
import { UserX, ArrowLeft } from "lucide-react";

export default function TenantNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground shadow-sm">
          <UserX size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Portfolio Not Found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The portfolio you are looking for does not exist or may have been moved.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
