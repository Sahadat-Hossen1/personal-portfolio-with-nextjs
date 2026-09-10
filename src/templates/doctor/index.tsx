import type { TemplateProps } from "@/types/portfolio";
import DoctorNavbar from "./components/DoctorNavbar";
import DoctorHero from "./components/DoctorHero";
import DoctorAbout from "./components/DoctorAbout";
import DoctorSkills from "./components/DoctorSkills";
import DoctorProjects from "./components/DoctorProjects";
import DoctorExperience from "./components/DoctorExperience";
import DoctorContact from "./components/DoctorContact";
import DoctorFooter from "./components/DoctorFooter";
import FloatingChatWidget from "@/components/FloatingChatWidget";

/**
 * Doctor Template
 *
 * Visual style: High-trust, clinical, clean, sophisticated medical aesthetic (Teal, Cyan, Slate).
 * Focus: Professional credentials, clinical competencies, research & featured initiatives,
 *        career appointments journey, direct consultation inquiries.
 */
export default function DoctorTemplate({ data, publicContext }: TemplateProps) {
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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 selection:bg-teal-500 selection:text-white">
      <DoctorNavbar
        name={profile?.name}
        avatar={profile?.avatarUrl}
        sections={sections}
        socials={profile?.socials}
      />

      <main className="flex-1">
        {sections.hero !== false && <DoctorHero profile={profile} />}
        {sections.about !== false && <DoctorAbout profile={profile} />}
        {sections.skills !== false && (
          <DoctorSkills skills={skills} tags={skillTags} />
        )}
        {sections.projects !== false && (
          <DoctorProjects projects={projects} />
        )}
        {sections.experience !== false && (
          <DoctorExperience experiences={experiences} />
        )}
        {sections.contact !== false && (
          <DoctorContact profile={profile} username={publicContext?.username} />
        )}
      </main>


      <DoctorFooter profile={profile} sections={sections} />

      {/* Shared Floating Chat Widget */}
      {sections.floatingChat !== false && (
        <FloatingChatWidget
          name={profile?.name}
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
