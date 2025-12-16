import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type SubscriptionTier = "free" | "premium";
export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY";

interface SubscriptionContextType {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
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

// Exchange rates to USD (as of Dec 2025, approximate)
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 150,
  CAD: 1.35,
  AUD: 1.50,
  CHF: 0.92,
  CNY: 7.20,
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<SubscriptionTier>(() => {
    const saved = localStorage.getItem("subscriptionTier");
    return (saved as SubscriptionTier) || "free";
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem("currency");
    return (saved as Currency) || "USD";
  });

  const setTier = (newTier: SubscriptionTier) => {
    setTierState(newTier);
    localStorage.setItem("subscriptionTier", newTier);
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("currency", newCurrency);
  };

  useEffect(() => {
    localStorage.setItem("subscriptionTier", tier);
  }, [tier]);

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        setTier,
        currency,
        setCurrency,
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
