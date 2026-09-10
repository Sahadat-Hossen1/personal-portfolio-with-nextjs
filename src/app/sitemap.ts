import { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000";

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  try {
    await connectToDatabase();

    // Phase 17: Query unpublished profiles to exclude them from the sitemap.
    // Legacy profiles without publicationStatus resolve to "published" and are included.
    const unpublishedProfiles = await Profile.find({
      publicationStatus: "unpublished",
    })
      .select("ownerId")
      .lean();

    const unpublishedOwnerIds = new Set(
      unpublishedProfiles
        .map((p) => p.ownerId?.toString())
        .filter((id): id is string => Boolean(id))
    );

    const users = await User.find({
      accountStatus: { $ne: "suspended" },
    })
      .select("_id username updatedAt")
      .lean();

    for (const user of users) {
      if (user.username && !unpublishedOwnerIds.has(user._id.toString())) {
        entries.push({
          url: `${baseUrl}/p/${user.username}`,
          lastModified: user.updatedAt ? new Date(user.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
  }

  return entries;
}
