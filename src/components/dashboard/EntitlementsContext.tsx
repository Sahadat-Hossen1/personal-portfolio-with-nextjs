"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { FeatureKey, FeatureDefinition } from "@/lib/entitlements/features";
import { UserPlan } from "@/models/User";
import UpgradeDiscoveryModal from "./UpgradeDiscoveryModal";

export interface EntitlementsData {
  plan: UserPlan;
  role: string;
  effectiveEntitlements: Record<FeatureKey, boolean>;
  features: FeatureDefinition[];
}

export interface EntitlementsContextValue {
  plan: UserPlan;
  role: string;
  effectiveEntitlements: Record<FeatureKey, boolean>;
  features: FeatureDefinition[];
  hasFeature: (feature: FeatureKey) => boolean;
  getFeature: (feature: FeatureKey) => FeatureDefinition | undefined;
  isUpgradeModalOpen: boolean;
  upgradeModalFeatureKey: FeatureKey | null;
  openUpgradeModal: (featureKey?: FeatureKey) => void;
  closeUpgradeModal: () => void;
  refreshEntitlements: () => Promise<void>;
}

const EntitlementsContext = createContext<EntitlementsContextValue | null>(null);

export function EntitlementsProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: EntitlementsData;
}) {
  const [data, setData] = useState<EntitlementsData>(initialData);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalFeatureKey, setUpgradeModalFeatureKey] =
    useState<FeatureKey | null>(null);

  const hasFeature = useCallback(
    (feature: FeatureKey): boolean => {
      return data.effectiveEntitlements[feature] === true;
    },
    [data.effectiveEntitlements]
  );

  const getFeature = useCallback(
    (feature: FeatureKey): FeatureDefinition | undefined => {
      return data.features.find((f) => f.key === feature);
    },
    [data.features]
  );

  const openUpgradeModal = useCallback((featureKey?: FeatureKey) => {
    setUpgradeModalFeatureKey(featureKey || null);
    setIsUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
    setUpgradeModalFeatureKey(null);
  }, []);

  const refreshEntitlements = useCallback(async () => {
    try {
      const res = await fetch("/api/entitlements");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData({
            plan: json.data.plan as UserPlan,
            role: json.data.role,
            effectiveEntitlements: json.data.effectiveEntitlements,
            features: json.data.features,
          });
        }
      }
    } catch (err) {
      console.error("Failed to refresh entitlements:", err);
    }
  }, []);

  const contextValue = useMemo<EntitlementsContextValue>(
    () => ({
      plan: data.plan,
      role: data.role,
      effectiveEntitlements: data.effectiveEntitlements,
      features: data.features,
      hasFeature,
      getFeature,
      isUpgradeModalOpen,
      upgradeModalFeatureKey,
      openUpgradeModal,
      closeUpgradeModal,
      refreshEntitlements,
    }),
    [
      data,
      hasFeature,
      getFeature,
      isUpgradeModalOpen,
      upgradeModalFeatureKey,
      openUpgradeModal,
      closeUpgradeModal,
      refreshEntitlements,
    ]
  );

  return (
    <EntitlementsContext.Provider value={contextValue}>
      {children}
      <UpgradeDiscoveryModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        currentPlan={data.plan}
        targetFeatureKey={upgradeModalFeatureKey}
        features={data.features}
      />
    </EntitlementsContext.Provider>
  );
}

export function useEntitlements(): EntitlementsContextValue {
  const context = useContext(EntitlementsContext);
  if (!context) {
    throw new Error(
      "useEntitlements must be used within an EntitlementsProvider"
    );
  }
  return context;
}
