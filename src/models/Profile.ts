import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type PortfolioPublicationStatus = "published" | "unpublished";

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

export type TemplateId = "developer" | "video-editor" | "digital-marketer" | "doctor";

export interface IProfile extends Document {
  ownerId?: Types.ObjectId;
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
  selectedTemplate?: TemplateId;

  // Phase 17: Portfolio publication control (portfolio/Profile domain, not User/auth domain)
  publicationStatus?: PortfolioPublicationStatus;

  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      sparse: true,
      unique: true,
    },
    name: { type: String, default: "" },
    roles: {
      type: [String],
      default: [],
    },
    bioBlurb: {
      type: String,
      default: "",
    },
    statusText: { type: String, default: "Available for opportunities" },
    statusAvailable: { type: Boolean, default: true },
    avatarUrl: { type: String, default: "" },
    cvUrl: { type: String, default: "" },
    floatingBadges: {
      type: [
        {
          label: { type: String, required: true },
          color: { type: String, default: "from-green-500 to-emerald-600" },
          delay: { type: String, default: "0s" },
          top: { type: String },
          left: { type: String },
          right: { type: String },
        },
      ],
      default: [],
    },

    aboutTitle: { type: String, default: "" },
    aboutP1: {
      type: String,
      default: "",
    },
    aboutP2: {
      type: String,
      default: "",
    },
    currentlyBuilding: { type: String, default: "" },
    stats: {
      type: [
        {
          iconName: { type: String, default: "Briefcase" },
          value: { type: String, default: "" },
          label: { type: String, default: "" },
        },
      ],
      default: [],
    },
    highlights: {
      type: [
        {
          emoji: { type: String, default: "" },
          text: { type: String, default: "" },
        },
      ],
      default: [],
    },

    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    whatsappMessage: {
      type: String,
      default: "",
    },
    messengerUrl: { type: String, default: "" },
    chatWhatsAppEnabled: { type: Boolean, default: false },
    chatMessengerEnabled: { type: Boolean, default: false },
    location: { type: String, default: "" },
    socials: {
      type: [
        {
          platform: { type: String, required: true },
          label: { type: String, required: true },
          value: { type: String, required: true },
          href: { type: String, required: true },
          enabled: { type: Boolean, default: true },
        },
      ],
      default: [],
    },
    sections: {
      hero: { type: Boolean, default: true },
      about: { type: Boolean, default: true },
      skills: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
      experience: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
      floatingChat: { type: Boolean, default: false },
    },
    selectedTemplate: {
      type: String,
      enum: ["developer", "video-editor", "digital-marketer", "doctor"],
      default: "developer",
    },
    // Phase 17: Independent portfolio publication status.
    // Default = "published" so legacy records without this field resolve correctly.
    publicationStatus: {
      type: String,
      enum: ["published", "unpublished"],
      default: "published",
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
