import type { TemplateProps } from "@/types/portfolio";
import DevNavbar from "./components/DevNavbar";
import DevHero from "./components/DevHero";
import DevAbout from "./components/DevAbout";
import DevSkills from "./components/DevSkills";
import DevProjects from "./components/DevProjects";
import DevExperience from "./components/DevExperience";
import DevContact from "./components/DevContact";
import DevFooter from "./components/DevFooter";
import FloatingChatWidget from "@/components/FloatingChatWidget";

/**
 * Developer Template
 *
 * Visual style: Modern, clean, technical, professional SaaS/developer aesthetic.
 * Focus: Technical skills, Projects, Technologies, Experience, GitHub/live demos.
 */
export default function DeveloperTemplate({ data, publicContext }: TemplateProps) {
  const { profile, projects, skills, skillTags, experiences } = data;

  const sections = profile?.sections || {
    hero: true,
    about: true,
    skills: true,
    projects: true,
    experience: true,
    contact: true,
    floatingChat: true,
  };

  const githubItem = profile?.socials?.find((s) => s.platform === "github");
  const isGithubEnabled = githubItem ? githubItem.enabled !== false : false;
  const githubUrl = githubItem?.href || "";

  return (
    <>
      <DevNavbar sections={sections} socials={profile?.socials} />
      <main className="flex-1">
        {sections.hero !== false && <DevHero profile={profile} />}
        {sections.about !== false && <DevAbout profile={profile} />}
        {sections.skills !== false && (
          <DevSkills skills={skills} tags={skillTags} />
        )}
        {sections.projects !== false && (
          <DevProjects
            projects={projects}
            githubEnabled={isGithubEnabled}
            githubUrl={githubUrl}
          />
        )}
        {sections.experience !== false && (
          <DevExperience experiences={experiences} />
        )}
        {sections.contact !== false && (
          <DevContact profile={profile} username={publicContext?.username} />
        )}
      </main>
      <DevFooter profile={profile} sections={sections} />

      {sections.floatingChat !== false && (
        <FloatingChatWidget
          whatsappNumber={profile?.whatsappNumber}
          whatsappMessage={profile?.whatsappMessage}
          messengerUrl={profile?.messengerUrl}
          whatsappEnabled={profile?.chatWhatsAppEnabled !== false}
          messengerEnabled={profile?.chatMessengerEnabled !== false}
        />
      )}
    </>
  );
}
