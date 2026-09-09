/**
 * Phase 15 — SaaS Central Entitlement Resolver
 *
 * Deterministically resolves effective feature access based on:
 * User Override > Plan Default
 *
 * Principles:
 * - Deterministic: The same user state always produces the same effective access.
 * - Server as source of truth.
 * - Non-breaking: Absence of overrides falls back gracefully to plan defaults.
 */

import { FEATURE_KEYS, FeatureKey, isSupportedFeatureKey } from "./features";
import { getPlanDefaultEntitlements } from "./plans";

export type EffectiveEntitlements = Record<FeatureKey, boolean>;

export interface EntitlementSubject {
  plan?: string | null;
  role?: string | null;
  featureOverrides?:
    | Record<string, boolean | null | undefined>
    | Map<string, boolean | null | undefined>
    | null;
}

/**
 * Safely extracts normalized override values from hydrated Mongoose Maps,
 * plain JSON objects, or undefined/null records.
 */
export function extractNormalizedOverrides(
  rawOverrides: EntitlementSubject["featureOverrides"]
): Partial<Record<FeatureKey, boolean>> {
  if (!rawOverrides) return {};

  const result: Partial<Record<FeatureKey, boolean>> = {};

  if (
    rawOverrides instanceof Map ||
    (typeof rawOverrides === "object" &&
      rawOverrides !== null &&
      "forEach" in rawOverrides &&
      typeof (rawOverrides as unknown as Map<string, unknown>).forEach ===
        "function")
  ) {
    // Mongoose Map instance
    (rawOverrides as unknown as Map<string, unknown>).forEach((val, key) => {
      if (isSupportedFeatureKey(key) && typeof val === "boolean") {
        result[key] = val;
      }
    });
  } else if (typeof rawOverrides === "object" && rawOverrides !== null) {
    // Plain JS object from lean() or JSON
    for (const [key, val] of Object.entries(rawOverrides)) {
      if (isSupportedFeatureKey(key) && typeof val === "boolean") {
        result[key] = val;
      }
    }
  }

  return result;
}

/**
 * Resolves the complete, deterministic map of effective feature entitlements.
 *
 * Precedence:
 * 1. User Override (if explicitly boolean true or false) takes absolute precedence.
 * 2. If user role is "superadmin" and no override is present, defaults to true.
 * 3. Plan Default (User.plan or fallback to "free") is applied when no override exists.
 */
export function resolveEffectiveEntitlements(
  user?: EntitlementSubject | null
): EffectiveEntitlements {
  // 1. Resolve base defaults
  const isSuperadmin = user?.role === "superadmin";
  const planDefaults = getPlanDefaultEntitlements(user?.plan);

  const baseEntitlements: EffectiveEntitlements = { ...planDefaults };

  // If superadmin, default every feature to true unless explicitly overridden
  if (isSuperadmin) {
    for (const key of FEATURE_KEYS) {
      baseEntitlements[key] = true;
    }
  }

  // 2. Extract and apply explicit user overrides (User Override > Plan Default)
  const normalizedOverrides = extractNormalizedOverrides(user?.featureOverrides);

  for (const key of FEATURE_KEYS) {
    if (key in normalizedOverrides && typeof normalizedOverrides[key] === "boolean") {
      baseEntitlements[key] = normalizedOverrides[key] as boolean;
    }
  }

  return baseEntitlements;
}

/**
 * Checks whether a user has access to a specific feature capability.
 */
export function hasFeatureAccess(
  user: EntitlementSubject | null | undefined,
  feature: FeatureKey
): boolean {
  const effective = resolveEffectiveEntitlements(user);
  return effective[feature] === true;
}
