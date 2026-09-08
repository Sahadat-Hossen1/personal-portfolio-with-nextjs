import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectsSection from "@/components/ProjectsSection";
import ExperienceSection from "@/components/ExperienceSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import { getPortfolioData } from "@/lib/getData";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getPortfolioData();
  const sections = data.profile?.sections || {
    hero: true,
    about: true,
    skills: true,
    projects: true,
    experience: true,
    contact: true,
    floatingChat: true,
  };

  const githubItem = data.profile?.socials?.find((s) => s.platform === "github");
  const isGithubEnabled = githubItem ? githubItem.enabled !== false : true;
  const githubUrl = githubItem?.href || "https://github.com/Sahadat-Hossen1";

  return (
    <>
      <Navbar sections={sections} socials={data.profile?.socials} />
      <main className="flex-1">
        {sections.hero !== false && <HeroSection profile={data.profile} />}
        {sections.about !== false && <AboutSection profile={data.profile} />}
        {sections.skills !== false && (
          <SkillsSection skills={data.skills} tags={data.skillTags} />
        )}
        {sections.projects !== false && (
          <ProjectsSection
            projects={data.projects}
            githubEnabled={isGithubEnabled}
            githubUrl={githubUrl}
          />
        )}
        {sections.experience !== false && (
          <ExperienceSection experiences={data.experiences} />
        )}
        {sections.contact !== false && (
          <ContactSection profile={data.profile} />
        )}
      </main>
      <Footer profile={data.profile} sections={sections} />
      {sections.floatingChat !== false && (
        <FloatingChatWidget
          whatsappNumber={data.profile?.whatsappNumber}
          whatsappMessage={data.profile?.whatsappMessage}
          messengerUrl={data.profile?.messengerUrl}
        />
      )}
    </>
  );
}