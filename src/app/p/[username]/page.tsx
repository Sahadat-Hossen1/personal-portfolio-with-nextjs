import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
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

export async function generateMetadata(
  props: PublicPortfolioPageProps
): Promise<Metadata> {
  const { username: rawUsername } = await props.params;
  if (!rawUsername || typeof rawUsername !== "string") {
    return { title: "Portfolio Not Found" };
  }

  const normalizedUsername = rawUsername.trim().toLowerCase();

  try {
    await connectToDatabase();
    const user = await User.findOne({ username: normalizedUsername })
      .select("name")
      .lean();

    if (!user) {
      return { title: "Portfolio Not Found" };
    }

    return {
      title: `${user.name} | Portfolio`,
      description: `Public professional portfolio of ${user.name}.`,
    };
  } catch {
    return { title: "Portfolio Not Found" };
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

  // 1. Resolve User safely using a minimal projection (never expose credentials)
  const user = await User.findOne({ username: normalizedUsername })
    .select("_id name allowedTemplates")
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

  // 5. Render presentation component with decoupled public context
  return (
    <SelectedTemplate
      data={data}
      publicContext={{ username: normalizedUsername }}
    />
  );
}
