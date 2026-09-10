/**
 * Phase 18 — SaaS Landing Page Demo Data Fixtures
 *
 * Isolated, static presentation fixtures for the 4 supported profession templates.
 *
 * Principles:
 * - DATA ≠ PRESENTATION
 * - Zero MongoDB dependencies
 * - No real tenant data
 * - Purely client/server-safe constant data
 */

export interface TemplateDemoFixture {
  id: "developer" | "video-editor" | "digital-marketer" | "doctor";
  name: string;
  badge: string;
  tagline: string;
  description: string;
  accentColor: string;
  gradient: string;
  badgeBg: string;
  borderActive: string;
  demoProfile: {
    name: string;
    role: string;
    avatarUrl: string;
    location: string;
    statusText: string;
    bio: string;
    stats: Array<{ label: string; value: string }>;
    skills: string[];
    sampleWorks: Array<{
      title: string;
      category: string;
      metricOrTag: string;
      description: string;
    }>;
  };
  features: string[];
}

export const TEMPLATE_DEMO_FIXTURES: Record<
  "developer" | "video-editor" | "digital-marketer" | "doctor",
  TemplateDemoFixture
> = {
  developer: {
    id: "developer",
    name: "Software Developer",
    badge: "Tech & Engineering",
    tagline: "High-performance tech showcase for software engineers",
    description:
      "Engineered with a sleek developer aesthetic, code syntax highlights, technical stack tags, and GitHub project showcase.",
    accentColor: "indigo",
    gradient: "from-blue-600/20 via-indigo-600/15 to-purple-600/20",
    badgeBg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    borderActive: "border-indigo-500/50 shadow-indigo-500/20",
    demoProfile: {
      name: "Alex Morgan",
      role: "Senior Full-Stack Engineer",
      avatarUrl: "/assets/images/avatar.jpg",
      location: "San Francisco, CA (Remote)",
      statusText: "Available for new architecture roles",
      bio: "Crafting resilient distributed systems, real-time architectures, and cloud-native applications with TypeScript, Next.js, Go, and PostgreSQL.",
      stats: [
        { label: "Years Exp", value: "6+" },
        { label: "OSS Repos", value: "45+" },
        { label: "PRs Merged", value: "1.2k" },
      ],
      skills: ["React", "TypeScript", "Node.js", "GraphQL", "Next.js", "Docker", "Kubernetes", "PostgreSQL"],
      sampleWorks: [
        {
          title: "CloudScale Engine",
          category: "Infrastructure",
          metricOrTag: "Go & K8s",
          description: "High-throughput telemetry ingestion pipeline handling 50k events/sec.",
        },
        {
          title: "DevFlow Studio",
          category: "Developer Tooling",
          metricOrTag: "React & TS",
          description: "Visual workflow orchestrator for microservices and API gateways.",
        },
      ],
    },
    features: [
      "Syntax-highlighted code showcase",
      "Interactive tech stack filtering",
      "Repository & live demo link badges",
      "Milestone career timeline",
    ],
  },
  "video-editor": {
    id: "video-editor",
    name: "Video Editor & Colorist",
    badge: "Cinematic & Motion",
    tagline: "Dynamic visual showcase for motion designers & editors",
    description:
      "A dark cinematic canvas designed for video editors, VFX artists, and colorists to feature showreels, client cuts, and visual craft.",
    accentColor: "rose",
    gradient: "from-amber-600/20 via-rose-600/15 to-purple-600/20",
    badgeBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    borderActive: "border-rose-500/50 shadow-rose-500/20",
    demoProfile: {
      name: "Elena Rostova",
      role: "Lead Commercial Editor & Colorist",
      avatarUrl: "/assets/images/avatar.jpg",
      location: "London, UK & Worldwide",
      statusText: "Booking commercial spots for Q3",
      bio: "Transforming raw footage into evocative visual narratives. Specializing in commercial spots, music videos, and DaVinci Resolve color grading.",
      stats: [
        { label: "Commercials", value: "80+" },
        { label: "Brand Clients", value: "35+" },
        { label: "Awards Won", value: "7" },
      ],
      skills: ["Premiere Pro", "DaVinci Resolve", "After Effects", "Color Grading", "Sound Design", "Cinema 4D"],
      sampleWorks: [
        {
          title: "Apex Horizon Campaign",
          category: "Commercial",
          metricOrTag: "4K Color Grade",
          description: "Global brand campaign cut for broadcast television and social.",
        },
        {
          title: "Neon Echoes Music Video",
          category: "Music & Motion",
          metricOrTag: "VFX & Edit",
          description: "Fast-paced kinetic typography and retrofuturistic visual styling.",
        },
      ],
    },
    features: [
      "16:9 cinematic media cards",
      "Featured showreel highlight hero",
      "Client brand logo showcase",
      "Visual equipment & software proficiencies",
    ],
  },
  "digital-marketer": {
    id: "digital-marketer",
    name: "Digital Marketer",
    badge: "Growth & Analytics",
    tagline: "Conversion & KPI-oriented layout for growth leaders",
    description:
      "Performance-focused layout emphasizing measurable business impact, campaign ROIs, ad spend scale, and conversion optimization.",
    accentColor: "emerald",
    gradient: "from-emerald-600/20 via-teal-600/15 to-cyan-600/20",
    badgeBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    borderActive: "border-emerald-500/50 shadow-emerald-500/20",
    demoProfile: {
      name: "Marcus Vance",
      role: "Director of Performance Marketing",
      avatarUrl: "/assets/images/avatar.jpg",
      location: "New York, NY",
      statusText: "Advising seed-to-series A startups",
      bio: "Scaling customer acquisition through full-funnel paid media, CRO, and rigorous marketing analytics across Google, Meta, and TikTok.",
      stats: [
        { label: "Ad Spend Managed", value: "$4.5M+" },
        { label: "Avg ROAS", value: "3.8x" },
        { label: "CAC Reduction", value: "-34%" },
      ],
      skills: ["Google Ads", "Meta Ads", "GA4", "Conversion Rate (CRO)", "Retention", "Funnel Tracking", "SEO"],
      sampleWorks: [
        {
          title: "SaaS Scale-Up Growth Engine",
          category: "Paid Acquisition",
          metricOrTag: "+310% ARR",
          description: "Scaled inbound pipeline from $50k to $200k MRR in 9 months.",
        },
        {
          title: "DTC Brand Omnichannel Launch",
          category: "E-Commerce",
          metricOrTag: "4.2x ROAS",
          description: "Multi-channel launch strategy driving 12,000 first-time buyers.",
        },
      ],
    },
    features: [
      "ROI & CAC KPI highlight badges",
      "Campaign case study metrics",
      "Conversion tracking tech stack",
      "Performance growth timeline",
    ],
  },
  doctor: {
    id: "doctor",
    name: "Medical Doctor",
    badge: "Clinical & Healthcare",
    tagline: "Reassuring, trust-centered profile for healthcare specialists",
    description:
      "Clean clinical design tailored for physicians, surgeons, and healthcare consultants emphasizing credentials, specialties, and patient trust.",
    accentColor: "cyan",
    gradient: "from-cyan-600/20 via-blue-600/15 to-teal-600/20",
    badgeBg: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    borderActive: "border-cyan-500/50 shadow-cyan-500/20",
    demoProfile: {
      name: "Dr. Sarah Jenkins, MD",
      role: "Consultant Cardiologist & Clinical Researcher",
      avatarUrl: "/assets/images/avatar.jpg",
      location: "Boston, MA",
      statusText: "Consultations by appointment",
      bio: "Board-certified cardiologist dedicated to preventive cardiology, non-invasive imaging, and cardiovascular clinical research.",
      stats: [
        { label: "Years Practice", value: "12+" },
        { label: "Peer-Reviewed Papers", value: "28" },
        { label: "Patients Treated", value: "4.8k+" },
      ],
      skills: ["Preventive Cardiology", "Echocardiography", "Clinical Research", "Heart Failure Management", "Medical Education"],
      sampleWorks: [
        {
          title: "Early Detection Biomarker Study",
          category: "Clinical Research",
          metricOrTag: "Lancet Pub",
          description: "Principal investigator on multicenter prospective cardiac screening trial.",
        },
        {
          title: "Community Heart Health Initiative",
          category: "Public Health",
          metricOrTag: "5,000+ Screened",
          description: "Preventive community outreach program reducing hospital readmission.",
        },
      ],
    },
    features: [
      "Board credentials & qualifications display",
      "Clinical specialties & hospital affiliations",
      "Publications & research highlights",
      "Patient consultation inquiry pathway",
    ],
  },
};
