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

  return (
    <>
      <Navbar sections={sections} />
      <main className="flex-1">
        {sections.hero !== false && <HeroSection profile={data.profile} />}
        {sections.about !== false && <AboutSection profile={data.profile} />}
        {sections.skills !== false && (
          <SkillsSection skills={data.skills} tags={data.skillTags} />
        )}
        {sections.projects !== false && (
          <ProjectsSection projects={data.projects} />
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