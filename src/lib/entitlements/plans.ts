/**
 * Phase 15 — SaaS Plan Default Entitlements Policy
 *
 * Defines default feature access for each supported UserPlan.
 *
 * Existing Plan Source of Truth: User.plan ("free" | "premium")
 */

import { FeatureKey } from "./features";
import type { UserPlan } from "@/models/User";

export type PlanEntitlementMap = Record<FeatureKey, boolean>;

export const PLAN_DEFAULT_ENTITLEMENTS: Record<UserPlan, PlanEntitlementMap> = {
  free: {
    // Core capabilities: always enabled for basic portfolio functionality
    projects: true,
    skills: true,
    experience: true,
    messages: true,
    // Gated/Premium capabilities: disabled on standard free tier
    custom_sections: false,
    floating_chat: false,
    advanced_seo: false,
  },
  premium: {
    // Premium tier: unlocks all platform features
    projects: true,
    skills: true,
    experience: true,
    messages: true,
    custom_sections: true,
    floating_chat: true,
    advanced_seo: true,
  },
};

/**
 * Resolves default feature entitlements for a given plan identifier.
 * Safely falls back to "free" defaults if an unknown or null plan is provided.
 */
export function getPlanDefaultEntitlements(
  plan?: string | null
): PlanEntitlementMap {
  if (plan === "premium") {
    return { ...PLAN_DEFAULT_ENTITLEMENTS.premium };
  }
  return { ...PLAN_DEFAULT_ENTITLEMENTS.free };
}
