import React from "react";

export default function JsonLd() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://sahadathossen.dev/#person",
    name: "Sahadat Hossen",
    alternateName: "Sahadat",
    jobTitle: "Full Stack MERN Developer",
    description:
      "Full Stack MERN Developer specializing in building scalable web applications with MongoDB, Express.js, React, Node.js, Next.js, and TypeScript.",
    url: "https://sahadathossen.dev",
    image: "https://sahadathossen.dev/profile.jpg",
    email: "mailto:sahadat.hossen1435@gmai.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dhaka",
      addressCountry: "Bangladesh",
    },
    knowsAbout: [
      "JavaScript",
      "TypeScript",
      "React.js",
      "Next.js",
      "Node.js",
      "Express.js",
      "MongoDB",
      "RESTful APIs",
      "Tailwind CSS",
      "Full Stack Development",
      "MERN Stack",
      "Web Application Development",
    ],
    sameAs: [
      "https://github.com/Sahadat-Hossen1",
      "https://linkedin.com",
      "https://wa.me/8801606081657",
      "https://m.me/sahadat.hossen.1435",
    ],
  };

  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": "https://sahadathossen.dev/#profilepage",
    url: "https://sahadathossen.dev",
    name: "Sahadat Hossen — Full Stack MERN Developer Portfolio",
    description:
      "Official portfolio website of Sahadat Hossen showcasing MERN stack web applications, skills, projects, and contact channels.",
    mainEntity: {
      "@id": "https://sahadathossen.dev/#person",
    },
    inLanguage: "en-US",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://sahadathossen.dev/#website",
    url: "https://sahadathossen.dev",
    name: "Sahadat Hossen Portfolio",
    description:
      "Personal portfolio of Sahadat Hossen, a Full Stack MERN Developer.",
    publisher: {
      "@id": "https://sahadathossen.dev/#person",
    },
    inLanguage: "en-US",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
