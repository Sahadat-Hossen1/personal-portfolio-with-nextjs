import { getAuthenticatedUser } from "@/lib/authorization";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import LandingNavbar, { LandingAuthState } from "@/components/landing/LandingNavbar";
import LandingHero from "@/components/landing/LandingHero";
import TemplateShowcase from "@/components/landing/TemplateShowcase";
import FeatureGrid from "@/components/landing/FeatureGrid";
import PricingComparison from "@/components/landing/PricingComparison";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";
import JsonLd from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Determine authenticated state server-side without leaking JWT
  let authState: LandingAuthState = {
    isLoggedIn: false,
    isSuperadmin: false,
    isSuspended: false,
  };

  try {
    const authUser = await getAuthenticatedUser();
    if (authUser) {
      await connectToDatabase();
      const userDoc = await User.findById(authUser.userId)
        .select("accountStatus role username")
        .lean();

      if (userDoc) {
        const isSuspended = userDoc.accountStatus === "suspended";
        authState = {
          isLoggedIn: !isSuspended,
          isSuperadmin: userDoc.role === "superadmin" && !isSuspended,
          isSuspended,
          username: userDoc.username,
        };
      }
    }
  } catch (error) {
    // If auth resolution fails, gracefully default to guest experience
    console.error("HomePage auth state resolution error:", error);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-indigo-500/30">
      <JsonLd />
      {/* SaaS Landing Header */}
      <LandingNavbar authState={authState} />

      {/* Main Content Sections */}
      <main className="flex-1">
        <LandingHero authState={authState} />
        <TemplateShowcase />
        <FeatureGrid />
        <PricingComparison />
        <LandingCTA authState={authState} />
      </main>

      {/* SaaS Landing Footer */}
      <LandingFooter />
    </div>
  );
}