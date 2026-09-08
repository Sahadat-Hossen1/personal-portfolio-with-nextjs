import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
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

const baseUrl = "https://sahadathossen.dev";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Sahadat Hossen — Full Stack MERN Developer",
    template: "%s | Sahadat Hossen",
  },
  description:
    "Full Stack MERN Developer specializing in building scalable web applications with MongoDB, Express.js, React, Node.js, Next.js, and TypeScript.",
  keywords: [
    "Sahadat Hossen",
    "Full Stack Developer",
    "MERN Stack Developer",
    "React Developer",
    "Next.js Developer",
    "Node.js Engineer",
    "MongoDB Architect",
    "TypeScript Developer",
    "Web Application Developer",
    "Freelance Developer Dhaka",
    "Remote MERN Stack Developer",
  ],
  authors: [{ name: "Sahadat Hossen", url: baseUrl }],
  creator: "Sahadat Hossen",
  publisher: "Sahadat Hossen",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Sahadat Hossen — Full Stack MERN Developer",
    description:
      "Building scalable, high-performance web applications with MongoDB, Express.js, React, Node.js, Next.js, and TypeScript.",
    url: baseUrl,
    siteName: "Sahadat Hossen Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sahadat Hossen — Full Stack MERN Developer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sahadat Hossen — Full Stack MERN Developer",
    description:
      "Building scalable, high-performance web applications with MongoDB, Express, React, Node.js, Next.js, and TypeScript.",
    images: ["/og-image.png"],
    creator: "@SahadatHossen",
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
      { url: "/profile.jpg", type: "image/jpeg" },
    ],
    shortcut: "/profile.jpg",
    apple: "/profile.jpg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <JsonLd />
      </head>
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


