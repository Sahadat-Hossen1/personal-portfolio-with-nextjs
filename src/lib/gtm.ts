"use client";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

/**
 * Helper to safely push events to Google Tag Manager dataLayer
 */
export function pushToDataLayer(event: string, payload?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }
}

/**
 * Event Tracker: Page View
 */
export function trackPageView(pageTitle?: string, pageLocation?: string, sectionId?: string) {
  pushToDataLayer("page_view", {
    page_title: pageTitle || (typeof document !== "undefined" ? document.title : ""),
    page_location: pageLocation || (typeof window !== "undefined" ? window.location.href : ""),
    section_id: sectionId || "home",
  });
}

/**
 * Event Tracker: Contact Form Submission
 */
export function trackContactSubmit(formData: { name: string; email: string; subject?: string }) {
  pushToDataLayer("contact_form_submit", {
    form_id: "contact-form",
    user_name: formData.name,
    user_email: formData.email,
    subject: formData.subject || "General Inquiry",
  });
}

/**
 * Event Tracker: Project Click
 */
export function trackProjectClick(projectTitle: string, actionType: "live_demo" | "github", destinationUrl: string) {
  pushToDataLayer("project_click", {
    project_title: projectTitle,
    action: actionType,
    destination_url: destinationUrl,
  });
}

/**
 * Event Tracker: Skill Click
 */
export function trackSkillClick(skillName: string, category?: string) {
  pushToDataLayer("skill_click", {
    skill_name: skillName,
    category: category || "general",
  });
}

/**
 * Event Tracker: Social & Messenger Link Clicks
 */
export function trackSocialClick(
  platform: "github" | "linkedin" | "whatsapp" | "messenger" | "twitter" | "email",
  location: "navbar" | "hero" | "contact_section" | "footer" | "floating_widget",
  linkUrl?: string
) {
  pushToDataLayer("social_link_click", {
    platform,
    location,
    destination_url: linkUrl || "",
  });
}

/**
 * Event Tracker: Download CV
 */
export function trackDownloadCV(
  location: "hero_section" | "navbar" | "footer" = "hero_section",
  fileName: string = "resume.pdf"
) {
  pushToDataLayer("download_cv", {
    file_name: fileName,
    location,
  });
}
