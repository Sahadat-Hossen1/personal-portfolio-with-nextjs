import {
  Eye,
  Mail,
  Sliders,
  ShieldCheck,
  Globe2,
  Sparkles,
  Layers,
} from "lucide-react";

const PLATFORM_FEATURES = [
  {
    title: "Isolated Tenant Ownership",
    description:
      "Every creator receives dedicated, owner-scoped storage for projects, skills, and career timelines. Content is strictly protected by server-side authorization.",
    icon: ShieldCheck,
    color: "from-blue-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/30",
  },
  {
    title: "Instant Publication Control",
    description:
      "Take your portfolio offline or publish it live with one click. Unpublishing preserves 100% of your projects, skills, and configuration with zero data loss.",
    icon: Eye,
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    title: "Clean Normalized Data Contract",
    description:
      "DATA ≠ PRESENTATION. Enter your achievements once; our template engine cleanly projects them into specialized Developer, Video Editor, Marketer, or Doctor designs.",
    icon: Layers,
    color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
  },
  {
    title: "Direct Client Inquiries Inbox",
    description:
      "Built-in contact form on your public link routing messages straight to your private dashboard. No third-party forms or email routing scripts required.",
    icon: Mail,
    color: "from-rose-500/20 to-amber-500/20 text-rose-400 border-rose-500/30",
  },
  {
    title: "Section Visibility Manager",
    description:
      "Fine-tune exactly what prospective clients and recruiters see. Toggle Hero, About, Skills, Projects, Experience, and Contact sections on or off anytime.",
    icon: Sliders,
    color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
  },
  {
    title: "Automated SEO & Social Cards",
    description:
      "Every published portfolio generates dynamic OpenGraph preview cards, verified metadata, and sitemap entries so your work looks stunning when shared.",
    icon: Globe2,
    color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="py-20 border-t border-border/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles size={13} />
            <span>Real Platform Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Everything You Need to{" "}
            <span className="gradient-text">Showcase Your Work</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Built from the database to presentation layer for speed, security, and
            professional credibility.
          </p>
        </div>

        {/* Features 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORM_FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl bg-card/60 border border-border hover:border-indigo-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 group flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
