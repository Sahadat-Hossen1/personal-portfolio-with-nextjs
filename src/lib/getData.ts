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
import { PortfolioData, ProfileData, SocialItemData } from "@/types/portfolio";

export type { PortfolioData } from "@/types/portfolio";

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
