import type { TemplateProps } from "@/types/portfolio";
import VideoNavbar from "./components/VideoNavbar";
import VideoHero from "./components/VideoHero";
import VideoProjects from "./components/VideoProjects";
import VideoSkills from "./components/VideoSkills";
import VideoExperience from "./components/VideoExperience";
import VideoAbout from "./components/VideoAbout";
import VideoContact from "./components/VideoContact";
import VideoFooter from "./components/VideoFooter";
import FloatingChatWidget from "@/components/FloatingChatWidget";

/**
 * Video Editor Template
 *
 * Visual style: Cinematic, visual-first, media-heavy, minimal unnecessary text.
 * Focus: Showreel, Video portfolio, 16:9 thumbnails, Editing tools, Credits, Direct CTA.
 */
export default function VideoEditorTemplate({ data, publicContext }: TemplateProps) {
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

  // Find featured project or use the first project for the hero showreel banner
  const featuredProject = projects.find((p) => p.featured) || projects[0];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-red-600 selection:text-white">
      <VideoNavbar
        name={profile?.name}
        avatar={profile?.avatarUrl}
        sections={sections}
        socials={profile?.socials}
      />
      <main className="flex-1">
        {sections.hero !== false && (
          <VideoHero
            profile={profile}
            featuredProject={featuredProject}
          />
        )}
        {sections.projects !== false && (
          <VideoProjects projects={projects} />
        )}
        {sections.skills !== false && (
          <VideoSkills skills={skills} tags={skillTags} />
        )}
        {sections.experience !== false && (
          <VideoExperience experiences={experiences} />
        )}
        {sections.about !== false && (
          <VideoAbout profile={profile} />
        )}
        {sections.contact !== false && (
          <VideoContact profile={profile} username={publicContext?.username} />
        )}
      </main>
      <VideoFooter profile={profile} />


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
