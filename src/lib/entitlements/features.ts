/**
 * Phase 15 — SaaS Central Feature Registry
 *
 * Single source of truth for supported platform product capabilities.
 *
 * Principles:
 * - DATA ≠ PRESENTATION
 * - Profession ≠ Template ≠ Feature ≠ Plan
 * - Templates are presentation concerns (managed via allowedTemplates)
 * - Features are product capabilities (managed via entitlements & featureOverrides)
 */

export const FEATURE_KEYS = [
  "projects",
  "skills",
  "experience",
  "messages",
  "custom_sections",
  "floating_chat",
  "advanced_seo",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export type FeatureCategory =
  | "core"
  | "customization"
  | "communication"
  | "growth";

export interface FeatureDefinition {
  key: FeatureKey;
  name: string;
  description: string;
  category: FeatureCategory;
  isCore: boolean; // Core capabilities are enabled on standard plans by default
}

export const FEATURE_DEFINITIONS: Record<FeatureKey, FeatureDefinition> = {
  projects: {
    key: "projects",
    name: "Projects & Showcase",
    description: "Showcase portfolio case studies, live links, and media galleries.",
    category: "core",
    isCore: true,
  },
  skills: {
    key: "skills",
    name: "Skills & Technical Tags",
    description: "Manage technical proficiencies, tools, and categorized skill tags.",
    category: "core",
    isCore: true,
  },
  experience: {
    key: "experience",
    name: "Experience Timeline",
    description: "Publish career milestones, employment history, and key achievements.",
    category: "core",
    isCore: true,
  },
  messages: {
    key: "messages",
    name: "Client Inquiries & Inbox",
    description: "Receive contact form submissions and manage client inquiries.",
    category: "core",
    isCore: true,
  },
  custom_sections: {
    key: "custom_sections",
    name: "Section Visibility Customization",
    description: "Customize which sections (Hero, About, Skills, Projects, Experience, Contact) appear on the portfolio.",
    category: "customization",
    isCore: false,
  },
  floating_chat: {
    key: "floating_chat",
    name: "Interactive Floating Chat Widget",
    description: "Enable WhatsApp and Messenger floating quick-contact trigger widget on the public portfolio.",
    category: "communication",
    isCore: false,
  },
  advanced_seo: {
    key: "advanced_seo",
    name: "Advanced SEO & Social Sharing",
    description: "Advanced social sharing cards, priority indexing, and custom OpenGraph metadata.",
    category: "growth",
    isCore: false,
  },
};

/**
 * Validates whether a given string is a recognized, strongly typed FeatureKey.
 */
export function isSupportedFeatureKey(key: string): key is FeatureKey {
  return (FEATURE_KEYS as readonly string[]).includes(key);
}

/**
 * Returns an array of all registered feature definitions.
 */
export function getAllFeatureDefinitions(): FeatureDefinition[] {
  return Object.values(FEATURE_DEFINITIONS);
}
