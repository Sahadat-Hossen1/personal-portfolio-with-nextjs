import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFloatingBadge {
  label: string;
  color: string;
  delay?: string;
  top?: string;
  left?: string;
  right?: string;
}

export interface IStatItem {
  iconName: string; // 'Briefcase' | 'Star' | 'Coffee' | 'MapPin'
  value: string;
  label: string;
}

export interface IHighlightItem {
  emoji: string;
  text: string;
}

export interface ISocialItem {
  platform: string;
  label: string;
  value: string;
  href: string;
  enabled?: boolean;
}

export interface ISectionVisibility {
  hero: boolean;
  about: boolean;
  skills: boolean;
  projects: boolean;
  experience: boolean;
  contact: boolean;
  floatingChat: boolean;
}

export interface IProfile extends Document {
  // Hero section
  name: string;
  roles: string[];
  bioBlurb: string;
  statusText: string;
  statusAvailable: boolean;
  avatarUrl: string;
  cvUrl?: string;
  floatingBadges: IFloatingBadge[];

  // About section
  aboutTitle: string;
  aboutP1: string;
  aboutP2: string;
  currentlyBuilding: string;
  stats: IStatItem[];
  highlights: IHighlightItem[];

  // Contact & Socials
  email: string;
  phone: string;
  whatsappNumber: string;
  whatsappMessage: string;
  messengerUrl: string;
  chatWhatsAppEnabled?: boolean;
  chatMessengerEnabled?: boolean;
  location: string;
  socials: ISocialItem[];
  sections: ISectionVisibility;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    name: { type: String, required: true, default: "Sahadat Hossen" },
    roles: {
      type: [String],
      default: [
        "Full Stack MERN Developer",
        "React Specialist",
        "Node.js Engineer",
        "MongoDB Architect",
        "API Designer",
      ],
    },
    bioBlurb: {
      type: String,
      default:
        "I build scalable, performant web applications from database to deployment. Passionate about clean code, great UX, and the MERN stack.",
    },
    statusText: { type: String, default: "Available for new opportunities" },
    statusAvailable: { type: Boolean, default: true },
    avatarUrl: { type: String, default: "/profile.jpg" },
    cvUrl: { type: String, default: "/resume.pdf" },
    floatingBadges: [
      {
        label: { type: String, required: true },
        color: { type: String, default: "from-green-500 to-emerald-600" },
        delay: { type: String, default: "0s" },
        top: { type: String },
        left: { type: String },
        right: { type: String },
      },
    ],

    aboutTitle: { type: String, default: "Crafting digital experiences" },
    aboutP1: {
      type: String,
      default:
        "I'm a full-stack developer with 1+ years of experience building modern web applications. My core stack centers on MongoDB, Express, React, and Node.js (MERN), supplemented with TypeScript and Next.js.",
    },
    aboutP2: {
      type: String,
      default:
        "Beyond code, I specialize in web analytics, conversion tracking (GA4, GTM, Meta Pixel), and technical SEO. I love building things that look stunning, perform flawlessly, and deliver measurable business value.",
    },
    currentlyBuilding: { type: String, default: "SaaS Dashboard App" },
    stats: [
      {
        iconName: { type: String, default: "Briefcase" },
        value: { type: String, default: "1+" },
        label: { type: String, default: "Years of Experience" },
      },
    ],
    highlights: [
      {
        emoji: { type: String, default: "⚡" },
        text: { type: String, default: "Building real-time apps" },
      },
    ],

    email: { type: String, default: "sahadat.hossen1435@gmail.com" },
    phone: { type: String, default: "+8801606081657" },
    whatsappNumber: { type: String, default: "8801606081657" },
    whatsappMessage: {
      type: String,
      default: "Hi Sahadat, I visited your portfolio and would like to connect!",
    },
    messengerUrl: { type: String, default: "https://m.me/sahadat.hossen.1435" },
    chatWhatsAppEnabled: { type: Boolean, default: true },
    chatMessengerEnabled: { type: Boolean, default: true },
    location: { type: String, default: "Dhaka, Bangladesh" },
    socials: [
      {
        platform: { type: String, required: true },
        label: { type: String, required: true },
        value: { type: String, required: true },
        href: { type: String, required: true },
        enabled: { type: Boolean, default: true },
      },
    ],
    sections: {
      hero: { type: Boolean, default: true },
      about: { type: Boolean, default: true },
      skills: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
      experience: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
      floatingChat: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models?.Profile) {
  delete (mongoose.models as Record<string, unknown>).Profile;
}

export const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);

export default Profile;
