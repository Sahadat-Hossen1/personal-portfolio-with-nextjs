import { getPortfolioData } from "@/lib/getData";
import {
  resolveTemplateId,
  TEMPLATE_MAP,
  DEFAULT_TEMPLATE_ID,
} from "@/templates/index";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams?: Promise<{ template?: string }>;
}

export default async function HomePage(props: HomePageProps) {
  const [data, searchParams] = await Promise.all([
    getPortfolioData(),
    props.searchParams,
  ]);

  const activeTemplateId = resolveTemplateId(
    searchParams?.template,
    data.profile?.selectedTemplate
  );

  const SelectedTemplate =
    TEMPLATE_MAP[activeTemplateId] || TEMPLATE_MAP[DEFAULT_TEMPLATE_ID];

  return <SelectedTemplate data={data} />;
}