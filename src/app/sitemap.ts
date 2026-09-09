import { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

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
    const users = await User.find({})
      .select("username updatedAt")
      .lean();

    for (const user of users) {
      if (user.username) {
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
