import type { TemplateProps } from "@/types/portfolio";
import MarketingNavbar from "./components/MarketingNavbar";
import MarketingHero from "./components/MarketingHero";
import MarketingProjects from "./components/MarketingProjects";
import MarketingSkills from "./components/MarketingSkills";
import MarketingExperience from "./components/MarketingExperience";
import MarketingAbout from "./components/MarketingAbout";
import MarketingContact from "./components/MarketingContact";
import MarketingFooter from "./components/MarketingFooter";
import FloatingChatWidget from "@/components/FloatingChatWidget";

/**
 * Digital Marketer Template
 *
 * Visual style: High-trust, analytical, executive aesthetic (Deep Navy, Emerald, Sky accents).
 * Focus: Marketing results, growth metrics, case studies (Challenge -> Execution -> Outcome),
 *        MarTech growth stack, strategic engagements timeline, consultative booking CTA.
 */
export default function DigitalMarketerTemplate({ data, publicContext }: TemplateProps) {
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

  const featuredProject = projects.find((p) => p.featured) || projects[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <MarketingNavbar
        name={profile?.name}
        avatar={profile?.avatarUrl}
        sections={sections}
        socials={profile?.socials}
      />

      <main className="flex-1">
        {sections.hero !== false && (
          <MarketingHero
            profile={profile}
            projectsCount={projects.length}
            skillsCount={skills.length}
            experienceCount={experiences.length}
            featuredProject={featuredProject}
          />
        )}

        {sections.projects !== false && (
          <MarketingProjects projects={projects} />
        )}

        {sections.skills !== false && (
          <MarketingSkills skills={skills} tags={skillTags} />
        )}

        {sections.experience !== false && (
          <MarketingExperience experiences={experiences} />
        )}

        {sections.about !== false && (
          <MarketingAbout profile={profile} />
        )}

        {sections.contact !== false && (
          <MarketingContact profile={profile} username={publicContext?.username} />
        )}
      </main>


      <MarketingFooter profile={profile} />

      {/* Shared Floating Chat Widget */}
      {sections.floatingChat !== false && (
        <FloatingChatWidget
          whatsappNumber={profile?.whatsappNumber}
          whatsappMessage={profile?.whatsappMessage}
          messengerUrl={profile?.messengerUrl}
          whatsappEnabled={profile?.chatWhatsAppEnabled !== false}
          messengerEnabled={profile?.chatMessengerEnabled !== false}
        />
      )}
    </div>
  );
}
