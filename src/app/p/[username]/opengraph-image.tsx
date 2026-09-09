import { ImageResponse } from "next/og";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Portfolio Social Preview Card";

interface OpenGraphImageProps {
  params: Promise<{ username: string }>;
}

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { username: rawUsername } = await params;
  const normalizedUsername = rawUsername ? rawUsername.trim().toLowerCase() : "";

  let name = "Professional Portfolio";
  let profession = "Creator & Specialist";
  let primaryRole = "";
  let bio = "Explore verified projects, skills, milestones, and experience.";
  let statusText = "Available for opportunities";

  if (normalizedUsername) {
    try {
      await connectToDatabase();
      const user = await User.findOne({ username: normalizedUsername })
        .select("name username profession")
        .lean();

      if (user) {
        name = user.name || name;
        profession = user.profession
          ? user.profession.replace(/-/g, " ")
          : profession;

        const profile = await Profile.findOne({ ownerId: user._id })
          .select("bioBlurb roles statusText")
          .lean();

        if (profile) {
          if (Array.isArray(profile.roles) && profile.roles.length > 0) {
            primaryRole = profile.roles[0];
          }
          if (profile.bioBlurb && profile.bioBlurb.trim()) {
            bio = profile.bioBlurb.trim();
          }
          if (profile.statusText && profile.statusText.trim()) {
            statusText = profile.statusText.trim();
          }
        }
      }
    } catch (error) {
      console.error("Error generating dynamic OG Image for tenant:", error);
    }
  }

  // Truncate bio for visual balance if overly long
  const displayBio = bio.length > 140 ? `${bio.slice(0, 137)}...` : bio;
  const badgeTitle = primaryRole || profession;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 70px",
          background: "linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Ambient background glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            left: "-120px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)",
          }}
        />

        {/* Top Bar: Brand & Availability Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px rgba(99, 102, 241, 0.35)",
                fontSize: "22px",
                fontWeight: "bold",
                color: "#ffffff",
              }}
            >
              ✦
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  color: "#f3f4f6",
                }}
              >
                Portfolio Platform
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: "#818cf8",
                  fontWeight: 600,
                }}
              >
                /p/{normalizedUsername || "portfolio"}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "9999px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
              }}
            />
            <span>{statusText}</span>
          </div>
        </div>

        {/* Center: Main Identity & Bio */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "960px",
          }}
        >
          {/* Profession Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "6px 16px",
                borderRadius: "10px",
                background: "rgba(99, 102, 241, 0.18)",
                border: "1px solid rgba(99, 102, 241, 0.35)",
                color: "#a5b4fc",
                fontSize: "15px",
                fontWeight: 700,
                textTransform: "capitalize",
                letterSpacing: "0.5px",
              }}
            >
              {badgeTitle}
            </span>
          </div>

          {/* Tenant Name */}
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              margin: 0,
              color: "#ffffff",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {name}
          </h1>

          {/* Bio Headline */}
          <p
            style={{
              fontSize: "24px",
              color: "#9ca3af",
              lineHeight: 1.4,
              margin: 0,
              fontWeight: 400,
            }}
          >
            {displayBio}
          </p>
        </div>

        {/* Bottom Bar: Action Pill & URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#94a3b8",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            <span>Verified Projects</span>
            <span>•</span>
            <span>Skills Matrix</span>
            <span>•</span>
            <span>Direct Inquiries</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 22px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              boxShadow: "0 8px 20px rgba(79, 70, 229, 0.3)",
            }}
          >
            <span>View Full Portfolio →</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
