import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GTMProvider from "@/components/GTMProvider";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "PortfolioOS — Multi-Tenant SaaS Portfolio Platform",
    template: "%s | PortfolioOS",
  },
  description:
    "Build, customize, and publish your professional portfolio in minutes. Purpose-built presentation templates for Software Developers, Video Editors, Digital Marketers, and Medical Doctors.",
  keywords: [
    "Portfolio Platform",
    "SaaS Portfolio",
    "Multi-Tenant Portfolio",
    "Developer Portfolio",
    "Video Editor Portfolio",
    "Digital Marketer Portfolio",
    "Doctor Portfolio",
    "Professional Showcase",
    "Online Portfolio Builder",
  ],
  authors: [{ name: "PortfolioOS Platform", url: baseUrl }],
  creator: "PortfolioOS",
  publisher: "PortfolioOS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PortfolioOS — Multi-Tenant SaaS Portfolio Platform",
    description:
      "Build, customize, and publish your professional portfolio in minutes. Purpose-built presentation templates for Software Developers, Video Editors, Digital Marketers, and Medical Doctors.",
    url: baseUrl,
    siteName: "PortfolioOS",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PortfolioOS — Multi-Tenant SaaS Portfolio Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PortfolioOS — Multi-Tenant SaaS Portfolio Platform",
    description:
      "Build, customize, and publish your professional portfolio in minutes. Purpose-built presentation templates for Software Developers, Video Editors, Digital Marketers, and Medical Doctors.",
    images: ["/og-image.png"],
    creator: "@PortfolioOS",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.jpg", type: "image/jpeg" },
    ],
    shortcut: "/icon.jpg",
    apple: "/icon.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <GTMProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}


