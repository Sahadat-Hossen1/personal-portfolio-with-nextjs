import type { ComponentType } from "react";
import type { TemplateId, TemplateProps } from "@/types/portfolio";
import DeveloperTemplate from "./developer/index";
import VideoEditorTemplate from "./video-editor/index";
import DigitalMarketerTemplate from "./digital-marketer/index";
import DoctorTemplate from "./doctor/index";

export type { TemplateId, TemplateProps };

/**
 * Default fallback template when requested ID is missing, invalid, or unsupported.
 */
export const DEFAULT_TEMPLATE_ID: TemplateId = "developer";

/**
 * List of all supported template identifiers.
 */
export const SUPPORTED_TEMPLATE_IDS: readonly TemplateId[] = [
  "developer",
  "video-editor",
  "digital-marketer",
  "doctor",
] as const;

/**
 * Central Template Registry mapping template IDs to their presentation components.
 */
export const TEMPLATE_MAP: Record<TemplateId, ComponentType<TemplateProps>> = {
  developer: DeveloperTemplate,
  "video-editor": VideoEditorTemplate,
  "digital-marketer": DigitalMarketerTemplate,
  doctor: DoctorTemplate,
};

/**
 * Type guard to check if an unknown value is a supported TemplateId.
 */
export function isSupportedTemplateId(id: unknown): id is TemplateId {
  if (typeof id !== "string") return false;
  const normalized = id.trim().toLowerCase();
  return (SUPPORTED_TEMPLATE_IDS as readonly string[]).includes(normalized);
}

/**
 * Resolves a template ID safely.
 *
 * Checks `requestedId` first; if invalid or missing, falls back to `fallbackId`.
 * If `fallbackId` is also invalid, safely falls back to `DEFAULT_TEMPLATE_ID` ("developer").
 *
 * @param requestedId - Raw template ID from URL query, user selection, or header
 * @param fallbackId - Secondary fallback ID (typically from saved Profile in DB)
 * @returns A validated TemplateId guaranteed to exist in TEMPLATE_MAP
 */
export function resolveTemplateId(
  requestedId?: string | null,
  fallbackId?: string | null
): TemplateId {
  if (typeof requestedId === "string") {
    const normalized = requestedId.trim().toLowerCase();
    if (isSupportedTemplateId(normalized)) {
      return normalized as TemplateId;
    }
  }

  if (typeof fallbackId === "string") {
    const normalized = fallbackId.trim().toLowerCase();
    if (isSupportedTemplateId(normalized)) {
      return normalized as TemplateId;
    }
  }

  return DEFAULT_TEMPLATE_ID;
}

/**
 * Retrieves the corresponding React component for a template ID safely.
 */
export function getTemplateComponent(
  requestedId?: string | null,
  fallbackId?: string | null
): ComponentType<TemplateProps> {
  const resolvedId = resolveTemplateId(requestedId, fallbackId);
  return TEMPLATE_MAP[resolvedId] || TEMPLATE_MAP[DEFAULT_TEMPLATE_ID];
}
