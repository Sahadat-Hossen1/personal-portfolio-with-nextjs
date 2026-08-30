import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sahadat Hossen — Full Stack MERN Developer",
  description:
    "Personal portfolio of Sahadat Hossen, a Full Stack MERN Developer specializing in building scalable web applications with MongoDB, Express.js, React, and Node.js.",
  keywords: [
    "Full Stack Developer",
    "MERN Stack",
    "React Developer",
    "Node.js",
    "MongoDB",
    "Next.js",
    "Web Development",
  ],
  authors: [{ name: "Sahadat Hossen" }],
  openGraph: {
    title: "Sahadat Hossen — Full Stack MERN Developer",
    description:
      "Building scalable, beautiful web apps with the MERN stack and modern tooling.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
