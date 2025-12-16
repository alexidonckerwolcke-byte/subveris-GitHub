import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Film,
  Cloud,
  Dumbbell,
  Newspaper,
  Gamepad2,
  Briefcase,
  GraduationCap,
  DollarSign,
  Package,
  Code,
} from "lucide-react";
import type { SubscriptionCategory, SubscriptionStatus } from "@shared/schema";
import { EXCHANGE_RATES, type Currency } from "./subscription-context";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCategoryIcon(category: SubscriptionCategory) {
  const icons: Record<SubscriptionCategory, typeof Film> = {
    streaming: Film,
    software: Code,
    fitness: Dumbbell,
    "cloud-storage": Cloud,
    news: Newspaper,
    gaming: Gamepad2,
    productivity: Briefcase,
    finance: DollarSign,
    education: GraduationCap,
    other: Package,
  };
  return icons[category] || Package;
}

export function getStatusColor(status: SubscriptionStatus): string {
  const colors: Record<SubscriptionStatus, string> = {
    active: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    unused: "bg-chart-4/10 text-chart-4 border-chart-4/20",
    "to-cancel": "bg-chart-5/10 text-chart-5 border-chart-5/20",
  };
  return colors[status];
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function convertAndFormatCurrency(amount: number, selectedCurrency: Currency): string {
  // Assume amount is in USD, convert to selected currency
  const convertedAmount = amount / EXCHANGE_RATES[selectedCurrency];
  return formatCurrency(convertedAmount, selectedCurrency);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getValueRating(costPerUse: number): "excellent" | "good" | "fair" | "poor" {
  if (costPerUse <= 2) return "excellent";
  if (costPerUse <= 5) return "good";
  if (costPerUse <= 10) return "fair";
  return "poor";
}

export function getValueRatingColor(rating: "excellent" | "good" | "fair" | "poor"): string {
  const colors = {
    excellent: "text-chart-2",
    good: "text-chart-2",
    fair: "text-chart-4",
    poor: "text-chart-5",
  };
  return colors[rating];
}

export function calculateMonthlyCost(amount: number, frequency: string): number {
  switch (frequency) {
    case "yearly":
      return amount / 12;
    case "quarterly":
      return amount / 3;
    case "weekly":
      return amount * 4;
    default:
      return amount;
  }
}

export function generateOpportunityCosts(monthlyAmount: number): { item: string; count: number; icon: string }[] {
  const items = [
    { item: "coffee drinks", unitCost: 5, icon: "coffee" },
    { item: "movie tickets", unitCost: 15, icon: "film" },
    { item: "lunch meals", unitCost: 12, icon: "utensils" },
    { item: "Spotify months", unitCost: 10.99, icon: "music" },
    { item: "Netflix months", unitCost: 15.49, icon: "tv" },
  ];

  return items
    .map((item) => ({
      item: item.item,
      count: Math.floor(monthlyAmount / item.unitCost),
      icon: item.icon,
    }))
    .filter((item) => item.count >= 1)
    .slice(0, 3);
}
