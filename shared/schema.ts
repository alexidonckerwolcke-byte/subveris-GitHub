import { pgTable, text, varchar, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Subscription status types
export type SubscriptionStatus = "active" | "unused" | "to-cancel";

// Subscription categories
export type SubscriptionCategory = 
  | "streaming" 
  | "software" 
  | "fitness" 
  | "cloud-storage" 
  | "news" 
  | "gaming" 
  | "productivity" 
  | "finance" 
  | "education"
  | "other";

// Billing frequency
export type BillingFrequency = "monthly" | "yearly" | "weekly" | "quarterly";

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().$type<SubscriptionCategory>(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  frequency: text("frequency").notNull().$type<BillingFrequency>(),
  nextBillingDate: text("next_billing_date").notNull(),
  status: text("status").notNull().$type<SubscriptionStatus>().default("active"),
  usageCount: integer("usage_count").notNull().default(0),
  lastUsedDate: text("last_used_date"),
  logoUrl: text("logo_url"),
  description: text("description"),
  isDetected: boolean("is_detected").notNull().default(true),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Transactions table (for bank connection simulation)
export const transactions = pgTable("transactions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  date: text("date").notNull(),
  category: text("category"),
  isRecurring: boolean("is_recurring").notNull().default(false),
  merchantName: text("merchant_name"),
  subscriptionId: varchar("subscription_id", { length: 36 }),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// AI Insights/Recommendations
export const insights = pgTable("insights", {
  id: varchar("id", { length: 36 }).primaryKey(),
  type: text("type").notNull(), // "savings" | "alternative" | "warning" | "tip"
  title: text("title").notNull(),
  description: text("description").notNull(),
  potentialSavings: real("potential_savings"),
  subscriptionId: varchar("subscription_id", { length: 36 }),
  priority: integer("priority").notNull().default(1), // 1 = high, 2 = medium, 3 = low
  isRead: boolean("is_read").notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
});

export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type Insight = typeof insights.$inferSelect;

// User settings for bank connection
export const bankConnections = pgTable("bank_connections", {
  id: varchar("id", { length: 36 }).primaryKey(),
  bankName: text("bank_name").notNull(),
  accountType: text("account_type").notNull(), // "checking" | "savings" | "credit"
  lastSync: text("last_sync").notNull(),
  isConnected: boolean("is_connected").notNull().default(true),
  accountMask: text("account_mask"), // Last 4 digits
});

export const insertBankConnectionSchema = createInsertSchema(bankConnections).omit({
  id: true,
});

export type InsertBankConnection = z.infer<typeof insertBankConnectionSchema>;
export type BankConnection = typeof bankConnections.$inferSelect;

// Dashboard metrics summary type
export interface DashboardMetrics {
  totalMonthlySpend: number;
  activeSubscriptions: number;
  potentialSavings: number;
  thisMonthSavings: number;
  unusedSubscriptions: number;
  averageCostPerUse: number;
}

// Spending by category type
export interface SpendingByCategory {
  category: SubscriptionCategory;
  amount: number;
  percentage: number;
  count: number;
}

// Monthly spending trend
export interface MonthlySpending {
  month: string;
  amount: number;
}

// Cost per use analysis
export interface CostPerUseAnalysis {
  subscriptionId: string;
  name: string;
  monthlyAmount: number;
  usageCount: number;
  costPerUse: number;
  valueRating: "excellent" | "good" | "fair" | "poor";
}

// Behavioral insight (opportunity cost)
export interface OpportunityCost {
  subscriptionId: string;
  subscriptionName: string;
  monthlyAmount: number;
  equivalents: {
    item: string;
    count: number;
    icon: string;
  }[];
}

// AI Recommendation
export interface AIRecommendation {
  id: string;
  type: "alternative" | "cancel" | "negotiate" | "downgrade";
  title: string;
  description: string;
  currentCost: number;
  suggestedCost: number;
  savings: number;
  subscriptionId: string;
  alternativeName?: string;
  confidence: number;
}

// Users table (keeping the existing one)
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
