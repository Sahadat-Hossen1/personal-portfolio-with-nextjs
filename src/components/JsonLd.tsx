import React from "react";

interface PlatformJsonLdProps {
  baseUrl?: string;
}

export default function JsonLd({ baseUrl = "http://localhost:3000" }: PlatformJsonLdProps) {
  const applicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${baseUrl}/#softwareapplication`,
    name: "PortfolioOS",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Multi-tenant SaaS portfolio platform designed for Software Developers, Video Editors, Digital Marketers, and Medical Doctors.",
    url: baseUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "PortfolioOS",
    description:
      "Build, customize, and publish your professional portfolio in minutes.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
