import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Profile from "@/models/Profile";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import SkillTag from "@/models/SkillTag";
import Experience from "@/models/Experience";
import {
  initialProfile,
  initialProjects,
  initialSkills,
  initialSkillTags,
  initialExperiences,
} from "@/lib/initialData";
import {
  PortfolioData,
  ProfileData,
  ProjectData,
  SkillData,
  ExperienceData,
  SocialItemData,
} from "@/types/portfolio";

export type { PortfolioData } from "@/types/portfolio";

/**
 * Loads owner-scoped portfolio data strictly belonging to the specified user/owner ID.
 *
 * All collections (Profile, Project, Skill, SkillTag, Experience) are queried strictly with `{ ownerId }`.
 * For newly registered users or empty profiles, clean zero-state empty arrays are returned.
 * It NEVER falls back to legacy single-tenant initialData.ts.
 *
 * Returns null if the owner ID is invalid or no profile document exists for this owner.
 */
export async function getPortfolioDataByOwnerId(
  ownerId: Types.ObjectId | string
): Promise<PortfolioData | null> {
  try {
    const rawId = String(ownerId);
    if (!Types.ObjectId.isValid(rawId) || new Types.ObjectId(rawId).toString() !== rawId) {
      return null;
    }

    const cleanOwnerId = new Types.ObjectId(rawId);
    await connectToDatabase();

    const [profileDoc, projectDocs, skillDocs, tagDocs, experienceDocs] =
      await Promise.all([
        Profile.findOne({ ownerId: cleanOwnerId }).lean(),
        Project.find({ ownerId: cleanOwnerId }).sort({ order: 1, createdAt: -1 }).lean(),
        Skill.find({ ownerId: cleanOwnerId }).sort({ order: 1, createdAt: 1 }).lean(),
        SkillTag.find({ ownerId: cleanOwnerId }).sort({ order: 1, createdAt: 1 }).lean(),
        Experience.find({ ownerId: cleanOwnerId }).sort({ order: 1, createdAt: -1 }).lean(),
      ]);

    if (!profileDoc) {
      return null;
    }

    const parsedProfile = JSON.parse(JSON.stringify(profileDoc));

    const profile: ProfileData = {
      _id: parsedProfile._id?.toString(),
      ownerId: parsedProfile.ownerId?.toString(),
      name: parsedProfile.name || "Portfolio",
      roles: Array.isArray(parsedProfile.roles) ? parsedProfile.roles : [],
      bioBlurb: parsedProfile.bioBlurb || "",
      statusText: parsedProfile.statusText || "",
      statusAvailable: parsedProfile.statusAvailable ?? true,
      avatarUrl: parsedProfile.avatarUrl || "",
      cvUrl: parsedProfile.cvUrl || "",
      floatingBadges: Array.isArray(parsedProfile.floatingBadges)
        ? parsedProfile.floatingBadges
        : [],
      aboutTitle: parsedProfile.aboutTitle || "",
      aboutP1: parsedProfile.aboutP1 || "",
      aboutP2: parsedProfile.aboutP2 || "",
      currentlyBuilding: parsedProfile.currentlyBuilding || "",
      stats: Array.isArray(parsedProfile.stats) ? parsedProfile.stats : [],
      highlights: Array.isArray(parsedProfile.highlights)
        ? parsedProfile.highlights
        : [],
      email: parsedProfile.email || "",
      phone: parsedProfile.phone || "",
      whatsappNumber: parsedProfile.whatsappNumber || "",
      whatsappMessage: parsedProfile.whatsappMessage || "",
      messengerUrl: parsedProfile.messengerUrl || "",
      chatWhatsAppEnabled: parsedProfile.chatWhatsAppEnabled !== false,
      chatMessengerEnabled: parsedProfile.chatMessengerEnabled !== false,
      location: parsedProfile.location || "",
      socials: Array.isArray(parsedProfile.socials)
        ? parsedProfile.socials.map((s: SocialItemData) => ({
            ...s,
            enabled: s.enabled !== false,
          }))
        : [],
      sections: {
        hero: parsedProfile.sections?.hero !== false,
        about: parsedProfile.sections?.about !== false,
        skills: parsedProfile.sections?.skills !== false,
        projects: parsedProfile.sections?.projects !== false,
        experience: parsedProfile.sections?.experience !== false,
        contact: parsedProfile.sections?.contact !== false,
        floatingChat: parsedProfile.sections?.floatingChat === true,
      },
      selectedTemplate: parsedProfile.selectedTemplate || "developer",
      // Phase 17: Safely resolve legacy records (missing field) to "published"
      publicationStatus:
        parsedProfile.publicationStatus === "unpublished"
          ? "unpublished"
          : "published",
      createdAt: parsedProfile.createdAt,
      updatedAt: parsedProfile.updatedAt,
    };

    const projects: ProjectData[] =
      projectDocs && projectDocs.length > 0
        ? JSON.parse(JSON.stringify(projectDocs))
        : [];

    const skills: SkillData[] =
      skillDocs && skillDocs.length > 0
        ? JSON.parse(JSON.stringify(skillDocs))
        : [];

    const skillTags: string[] =
      tagDocs && tagDocs.length > 0
        ? tagDocs.map((t: { name: string }) => t.name)
        : [];

    const experiences: ExperienceData[] =
      experienceDocs && experienceDocs.length > 0
        ? JSON.parse(JSON.stringify(experienceDocs))
        : [];

    return {
      profile,
      projects,
      skills,
      skillTags,
      experiences,
    };
  } catch (error) {
    console.error("Error in getPortfolioDataByOwnerId:", error);
    return null;
  }
}


export async function getPortfolioData(): Promise<PortfolioData> {
  try {
    await connectToDatabase();

    const [profileDoc, projectDocs, skillDocs, tagDocs, experienceDocs] =
      await Promise.all([
        Profile.findOne().lean(),
        Project.find().sort({ order: 1, createdAt: -1 }).lean(),
        Skill.find().sort({ order: 1, createdAt: 1 }).lean(),
        SkillTag.find().sort({ order: 1, createdAt: 1 }).lean(),
        Experience.find().sort({ order: 1, createdAt: -1 }).lean(),
      ]);

    const parsedProfile = profileDoc
      ? JSON.parse(JSON.stringify(profileDoc))
      : null;

    const profile: ProfileData = parsedProfile
      ? {
          ...initialProfile,
          ...parsedProfile,
          selectedTemplate: parsedProfile.selectedTemplate || "developer",
          publicationStatus:
            parsedProfile.publicationStatus === "unpublished"
              ? "unpublished"
              : "published",
          sections: {
            ...initialProfile.sections,
            ...(parsedProfile.sections || {}),
          },
          chatWhatsAppEnabled: parsedProfile.chatWhatsAppEnabled !== false,
          chatMessengerEnabled: parsedProfile.chatMessengerEnabled !== false,
          socials:
            parsedProfile.socials && parsedProfile.socials.length > 0
              ? parsedProfile.socials.map((s: SocialItemData) => ({
                  ...s,
                  enabled: s.enabled !== false,
                }))
              : initialProfile.socials,
        }
      : initialProfile;

    const projects =
      projectDocs && projectDocs.length > 0
        ? JSON.parse(JSON.stringify(projectDocs))
        : initialProjects;

    const skills =
      skillDocs && skillDocs.length > 0
        ? JSON.parse(JSON.stringify(skillDocs))
        : initialSkills;

    const skillTags =
      tagDocs && tagDocs.length > 0
        ? tagDocs.map((t: { name: string }) => t.name)
        : initialSkillTags;

    const experiences =
      experienceDocs && experienceDocs.length > 0
        ? JSON.parse(JSON.stringify(experienceDocs))
        : initialExperiences;

    return {
      profile,
      projects,
      skills,
      skillTags,
      experiences,
    };
  } catch (error) {
    console.warn("Could not query MongoDB for portfolio data, using fallback data:", error);
    return {
      profile: initialProfile,
      projects: initialProjects,
      skills: initialSkills,
      skillTags: initialSkillTags,
      experiences: initialExperiences,
    };
  }
}
