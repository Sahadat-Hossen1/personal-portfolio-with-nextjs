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

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection profile={data.profile} />
        <AboutSection profile={data.profile} />
        <SkillsSection skills={data.skills} tags={data.skillTags} />
        <ProjectsSection projects={data.projects} />
        <ExperienceSection experiences={data.experiences} />
        <ContactSection profile={data.profile} />
      </main>
      <Footer profile={data.profile} />
      <FloatingChatWidget
        whatsappNumber={data.profile?.whatsappNumber}
        whatsappMessage={data.profile?.whatsappMessage}
        messengerUrl={data.profile?.messengerUrl}
      />
    </>
  );
}