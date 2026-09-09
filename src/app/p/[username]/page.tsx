import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
import { getPortfolioDataByOwnerId } from "@/lib/getData";
import {
  TEMPLATE_MAP,
  DEFAULT_TEMPLATE_ID,
  resolveTemplateId,
} from "@/templates/index";
import type { TemplateId } from "@/types/portfolio";

export const dynamic = "force-dynamic";

interface PublicPortfolioPageProps {
  params: Promise<{ username: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}

export async function generateMetadata(
  props: PublicPortfolioPageProps
): Promise<Metadata> {
  const { username: rawUsername } = await props.params;
  if (!rawUsername || typeof rawUsername !== "string") {
    return {
      title: "Portfolio Not Found",
      description: "The requested portfolio could not be found.",
    };
  }

  const normalizedUsername = rawUsername.trim().toLowerCase();
  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}/p/${normalizedUsername}`;

  try {
    await connectToDatabase();
    const user = await User.findOne({ username: normalizedUsername })
      .select("name username profession")
      .lean();

    if (!user) {
      return {
        title: "Portfolio Not Found",
        description: "The requested portfolio could not be found.",
      };
    }

    const profile = await Profile.findOne({ ownerId: user._id })
      .select("bioBlurb roles avatarUrl")
      .lean();

    const professionFormatted = user.profession
      ? user.profession
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "Professional";

    const primaryRole =
      Array.isArray(profile?.roles) && profile.roles.length > 0
        ? profile.roles[0]
        : professionFormatted;

    const title = `${user.name} | ${primaryRole} Portfolio`;
    const description =
      profile?.bioBlurb && profile.bioBlurb.trim()
        ? profile.bioBlurb.trim()
        : `Explore the professional portfolio, projects, and skills of ${user.name}.`;

    const ogImageUrl = `${canonicalUrl}/opengraph-image`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "Portfolio Platform",
        locale: "en_US",
        type: "profile",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${user.name}'s Portfolio Preview`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating public portfolio metadata:", error);
    return {
      title: "Portfolio Not Found",
      description: "The requested portfolio could not be found.",
    };
  }
}

export default async function PublicPortfolioPage(
  props: PublicPortfolioPageProps
) {
  const { username: rawUsername } = await props.params;

  if (!rawUsername || typeof rawUsername !== "string") {
    notFound();
  }

  const normalizedUsername = rawUsername.trim().toLowerCase();
  await connectToDatabase();

  // 1. Resolve User safely using minimal projection (never expose credentials or auth fields)
  const user = await User.findOne({ username: normalizedUsername })
    .select("_id name username profession updatedAt")
    .lean();

  if (!user) {
    notFound();
  }

  // 2. Load owner-scoped portfolio data
  const data = await getPortfolioDataByOwnerId(user._id);

  if (!data || !data.profile) {
    notFound();
  }

  // 3. Resolve active template
  // Profile.selectedTemplate is authoritative.
  // Query parameters (?template=... or ?p=...) are strictly IGNORED on /p/[username].
  const requestedTemplate = data.profile.selectedTemplate;
  const activeTemplateId: TemplateId = resolveTemplateId(
    requestedTemplate,
    DEFAULT_TEMPLATE_ID
  );

  // 4. Retrieve presentation component from central template registry
  const SelectedTemplate =
    TEMPLATE_MAP[activeTemplateId] || TEMPLATE_MAP[DEFAULT_TEMPLATE_ID];

  // 5. Generate Schema.org JSON-LD structured data (Person & ProfilePage only)
  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}/p/${normalizedUsername}`;

  const primaryRole =
    Array.isArray(data.profile.roles) && data.profile.roles.length > 0
      ? data.profile.roles[0]
      : user.profession
      ? user.profession.replace(/-/g, " ")
      : "Professional";

  const sameAsLinks = Array.isArray(data.profile.socials)
    ? data.profile.socials
        .filter((s) => s.enabled !== false && s.href && s.href.startsWith("http"))
        .map((s) => s.href)
    : [];

  const jsonLdPerson: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: user.name,
    url: canonicalUrl,
    jobTitle: primaryRole,
  };

  if (data.profile.bioBlurb) {
    jsonLdPerson.description = data.profile.bioBlurb;
  }
  if (data.profile.avatarUrl && data.profile.avatarUrl.startsWith("http")) {
    jsonLdPerson.image = data.profile.avatarUrl;
  }
  if (data.profile.location) {
    jsonLdPerson.address = {
      "@type": "PostalAddress",
      addressLocality: data.profile.location,
    };
  }
  if (sameAsLinks.length > 0) {
    jsonLdPerson.sameAs = sameAsLinks;
  }

  const jsonLdProfilePage: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${user.name} | Portfolio`,
    url: canonicalUrl,
    mainEntity: {
      "@type": "Person",
      name: user.name,
      url: canonicalUrl,
    },
  };

  if (user.updatedAt) {
    jsonLdProfilePage.dateModified = new Date(user.updatedAt).toISOString();
  }

  const jsonLdStructuredData = [jsonLdPerson, jsonLdProfilePage];

  // 6. Render presentation component with decoupled public context and server-rendered JSON-LD
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdStructuredData),
        }}
      />
      <SelectedTemplate
        data={data}
        publicContext={{ username: normalizedUsername }}
      />
    </>
  );
}
