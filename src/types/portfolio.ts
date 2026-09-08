/**
 * Normalized Portfolio Data Contract
 *
 * DATA ≠ PRESENTATION
 *
 * This contract defines the normalized data structures consumed by all portfolio templates.
 * Templates receive this data through props via `TemplateProps`.
 */

export type TemplateId = "developer" | "video-editor" | "digital-marketer";

export interface FloatingBadgeData {
  label: string;
  color: string;
  delay?: string;
  top?: string;
  left?: string;
  right?: string;
}

export interface StatItemData {
  iconName: string;
  value: string;
  label: string;
}

export interface HighlightItemData {
  emoji: string;
  text: string;
}

export interface SocialItemData {
  platform: string;
  label: string;
  value: string;
  href: string;
  enabled?: boolean;
}

export interface SectionVisibilityData {
  hero: boolean;
  about: boolean;
  skills: boolean;
  projects: boolean;
  experience: boolean;
  contact: boolean;
  floatingChat: boolean;
}

export interface ProfileData {
  // Hero section
  name: string;
  roles: string[];
  bioBlurb: string;
  statusText: string;
  statusAvailable: boolean;
  avatarUrl: string;
  cvUrl?: string;
  floatingBadges: FloatingBadgeData[];

  // About section
  aboutTitle: string;
  aboutP1: string;
  aboutP2: string;
  currentlyBuilding: string;
  stats: StatItemData[];
  highlights: HighlightItemData[];

  // Contact & Socials
  email: string;
  phone: string;
  whatsappNumber: string;
  whatsappMessage: string;
  messengerUrl: string;
  chatWhatsAppEnabled?: boolean;
  chatMessengerEnabled?: boolean;
  location: string;
  socials: SocialItemData[];
  sections: SectionVisibilityData;

  // Active template selection
  selectedTemplate: TemplateId;

  // Metadata
  _id?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ProjectData {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  longDesc: string;
  image: string;
  tags: string[];
  github: string;
  live: string;
  emoji?: string;
  featured: boolean;
  stars: number;
  order: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SkillData {
  _id?: string;
  id?: string;
  name: string;
  icon: string;
  level: number;
  color: string;
  category: string;
  order: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ExperienceData {
  _id?: string;
  id?: string;
  role: string;
  company: string;
  companyUrl: string;
  location: string;
  period: string;
  type: string;
  bullets: string[];
  tags: string[];
  current: boolean;
  order: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PortfolioData {
  profile: ProfileData;
  projects: ProjectData[];
  skills: SkillData[];
  skillTags: string[];
  experiences: ExperienceData[];
}

export interface TemplateProps {
  data: PortfolioData;
}
