import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type SubscriptionTier = "free" | "premium";

interface SubscriptionContextType {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  limits: {
    maxSubscriptions: number;
    hasAIRecommendations: boolean;
    hasBankIntegration: boolean;
    hasCostPerUse: boolean;
    hasBehavioralInsights: boolean;
    hasSavingsProjections: boolean;
    hasExportReports: boolean;
  };
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const TIER_LIMITS = {
  free: {
    maxSubscriptions: 5,
    hasAIRecommendations: false,
    hasBankIntegration: false,
    hasCostPerUse: false,
    hasBehavioralInsights: false,
    hasSavingsProjections: false,
    hasExportReports: false,
  },
  premium: {
    maxSubscriptions: Infinity,
    hasAIRecommendations: true,
    hasBankIntegration: true,
    hasCostPerUse: true,
    hasBehavioralInsights: true,
    hasSavingsProjections: true,
    hasExportReports: true,
  },
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<SubscriptionTier>(() => {
    const saved = localStorage.getItem("subscriptionTier");
    return (saved as SubscriptionTier) || "free";
  });

  const setTier = (newTier: SubscriptionTier) => {
    setTierState(newTier);
    localStorage.setItem("subscriptionTier", newTier);
  };

  useEffect(() => {
    localStorage.setItem("subscriptionTier", tier);
  }, [tier]);

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        setTier,
        limits: TIER_LIMITS[tier],
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
