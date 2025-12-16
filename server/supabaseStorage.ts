import { randomUUID } from "crypto";
import { supabase } from "./supabase";
import type {
  User,
  InsertUser,
  Subscription,
  InsertSubscription,
  Transaction,
  InsertTransaction,
  Insight,
  InsertInsight,
  BankConnection,
  InsertBankConnection,
  DashboardMetrics,
  MonthlySpending,
  SpendingByCategory,
  CostPerUseAnalysis,
  OpportunityCost,
  AIRecommendation,
  SubscriptionStatus,
  SubscriptionCategory,
} from "@shared/schema";
import type { IStorage } from "./storage";

function calculateMonthlyCost(amount: number, frequency: string): number {
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

function generateOpportunityCosts(monthlyAmount: number): { item: string; count: number; icon: string }[] {
  const items = [
    { item: "coffee drinks", unitCost: 5, icon: "coffee" },
    { item: "movie tickets", unitCost: 15, icon: "film" },
    { item: "lunch meals", unitCost: 12, icon: "utensils" },
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

export class SupabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user = { ...insertUser, id };
    
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data as User;
  }

  async updateUserEmail(id: string, email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .update({ email })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async updateUserPassword(id: string, password: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .update({ password })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getSubscriptions(): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*');
    
    if (error) throw new Error(`Failed to get subscriptions: ${error.message}`);
    return (data || []).map(this.mapSubscription);
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return this.mapSubscription(data);
  }

  private mapSubscription(data: any): Subscription {
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      amount: data.amount,
      currency: data.currency,
      frequency: data.frequency,
      nextBillingDate: data.next_billing_date,
      status: data.status,
      usageCount: data.usage_count,
      lastUsedDate: data.last_used_date,
      logoUrl: data.logo_url,
      description: data.description,
      isDetected: data.is_detected,
    };
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const subscription = {
      id,
      name: insertSubscription.name,
      category: insertSubscription.category,
      amount: insertSubscription.amount,
      currency: insertSubscription.currency || "USD",
      frequency: insertSubscription.frequency,
      next_billing_date: insertSubscription.nextBillingDate,
      status: insertSubscription.status || "active",
      usage_count: insertSubscription.usageCount || 0,
      last_used_date: insertSubscription.lastUsedDate || null,
      logo_url: insertSubscription.logoUrl || null,
      description: insertSubscription.description || null,
      is_detected: insertSubscription.isDetected ?? false,
    };
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create subscription: ${error.message}`);
    return this.mapSubscription(data);
  }

  async updateSubscriptionStatus(id: string, status: SubscriptionStatus): Promise<Subscription | undefined> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return this.mapSubscription(data);
  }

  async updateSubscriptionUsage(id: string, usageCount: number): Promise<Subscription | undefined> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ 
        usage_count: usageCount,
        last_used_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return this.mapSubscription(data);
  }

  async recordSubscriptionUsage(id: string): Promise<Subscription | undefined> {
    const subscription = await this.getSubscription(id);
    if (!subscription) return undefined;
    
    const newUsageCount = subscription.usageCount + 1;
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ 
        usage_count: newUsageCount,
        last_used_date: new Date().toISOString().split('T')[0],
        status: newUsageCount > 0 ? "active" : subscription.status
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return this.mapSubscription(data);
  }

  async deleteSubscription(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*');
    
    if (error) throw new Error(`Failed to get transactions: ${error.message}`);
    return (data || []).map(this.mapTransaction);
  }

  private mapTransaction(data: any): Transaction {
    return {
      id: data.id,
      description: data.description,
      amount: data.amount,
      date: data.date,
      category: data.category,
      isRecurring: data.is_recurring,
      merchantName: data.merchant_name,
      subscriptionId: data.subscription_id,
    };
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction = {
      id,
      description: insertTransaction.description,
      amount: insertTransaction.amount,
      date: insertTransaction.date,
      category: insertTransaction.category || null,
      is_recurring: insertTransaction.isRecurring,
      merchant_name: insertTransaction.merchantName || null,
      subscription_id: insertTransaction.subscriptionId || null,
    };
    
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create transaction: ${error.message}`);
    return this.mapTransaction(data);
  }

  async getInsights(): Promise<Insight[]> {
    const { data, error } = await supabase
      .from('insights')
      .select('*');
    
    if (error) throw new Error(`Failed to get insights: ${error.message}`);
    return (data || []).map(this.mapInsight);
  }

  private mapInsight(data: any): Insight {
    return {
      id: data.id,
      type: data.type,
      title: data.title,
      description: data.description,
      potentialSavings: data.potential_savings,
      subscriptionId: data.subscription_id,
      priority: data.priority,
      isRead: data.is_read,
      createdAt: data.created_at,
    };
  }

  async createInsight(insertInsight: InsertInsight): Promise<Insight> {
    const id = randomUUID();
    const insight = {
      id,
      type: insertInsight.type,
      title: insertInsight.title,
      description: insertInsight.description,
      potential_savings: insertInsight.potentialSavings || null,
      subscription_id: insertInsight.subscriptionId || null,
      priority: insertInsight.priority,
      is_read: insertInsight.isRead,
      created_at: insertInsight.createdAt,
    };
    
    const { data, error } = await supabase
      .from('insights')
      .insert(insight)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create insight: ${error.message}`);
    return this.mapInsight(data);
  }

  async getBankConnections(): Promise<BankConnection[]> {
    const { data, error } = await supabase
      .from('bank_connections')
      .select('*');
    
    if (error) throw new Error(`Failed to get bank connections: ${error.message}`);
    return (data || []).map(this.mapBankConnection);
  }

  async getBankConnection(id: string): Promise<BankConnection | undefined> {
    const { data, error } = await supabase
      .from('bank_connections')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return this.mapBankConnection(data);
  }

  private mapBankConnection(data: any): BankConnection {
    return {
      id: data.id,
      bankName: data.bank_name,
      accountType: data.account_type,
      lastSync: data.last_sync,
      isConnected: data.is_connected,
      accountMask: data.account_mask,
    };
  }

  async createBankConnection(insertConnection: InsertBankConnection): Promise<BankConnection> {
    const id = randomUUID();
    const connection = {
      id,
      bank_name: insertConnection.bankName,
      account_type: insertConnection.accountType,
      last_sync: insertConnection.lastSync,
      is_connected: insertConnection.isConnected,
      account_mask: insertConnection.accountMask || null,
    };
    
    const { data, error } = await supabase
      .from('bank_connections')
      .insert(connection)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create bank connection: ${error.message}`);
    return this.mapBankConnection(data);
  }

  async updateBankConnectionSync(id: string): Promise<BankConnection | undefined> {
    const { data, error } = await supabase
      .from('bank_connections')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return this.mapBankConnection(data);
  }

  async deleteBankConnection(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('bank_connections')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async getMetrics(): Promise<DashboardMetrics> {
    const subscriptions = await this.getSubscriptions();
    
    const totalMonthlySpend = subscriptions.reduce((sum, sub) => {
      if (sub.status === "to-cancel") return sum;
      return sum + calculateMonthlyCost(sub.amount, sub.frequency);
    }, 0);

    const activeSubscriptions = subscriptions.filter(s => s.status === "active").length;
    const unusedSubscriptions = subscriptions.filter(s => s.status === "unused").length;
    
    const potentialSavings = subscriptions
      .filter(s => s.status === "unused" || s.status === "to-cancel")
      .reduce((sum, sub) => sum + calculateMonthlyCost(sub.amount, sub.frequency), 0);

    const totalUsage = subscriptions.reduce((sum, sub) => sum + sub.usageCount, 0);
    const averageCostPerUse = totalUsage > 0 ? totalMonthlySpend / totalUsage : 0;

    return {
      totalMonthlySpend,
      activeSubscriptions,
      potentialSavings,
      thisMonthSavings: potentialSavings,
      unusedSubscriptions,
      averageCostPerUse,
    };
  }

  async getMonthlySpending(): Promise<MonthlySpending[]> {
    return [
      { month: "Aug", amount: 245.50 },
      { month: "Sep", amount: 232.80 },
      { month: "Oct", amount: 258.20 },
      { month: "Nov", amount: 221.40 },
      { month: "Dec", amount: 198.90 },
      { month: "Jan", amount: 180.92 },
    ];
  }

  async getSpendingByCategory(): Promise<SpendingByCategory[]> {
    const subscriptions = await this.getSubscriptions();
    const categoryMap = new Map<SubscriptionCategory, { amount: number; count: number }>();

    for (const sub of subscriptions) {
      if (sub.status === "to-cancel") continue;
      const monthlyAmount = calculateMonthlyCost(sub.amount, sub.frequency);
      const existing = categoryMap.get(sub.category) || { amount: 0, count: 0 };
      categoryMap.set(sub.category, {
        amount: existing.amount + monthlyAmount,
        count: existing.count + 1,
      });
    }

    const totalAmount = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0);

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      count: data.count,
    }));
  }

  async getCostPerUseAnalysis(): Promise<CostPerUseAnalysis[]> {
    const subscriptions = await this.getSubscriptions();
    
    return subscriptions
      .filter(sub => sub.status !== "to-cancel")
      .map(sub => {
        const monthlyAmount = calculateMonthlyCost(sub.amount, sub.frequency);
        const costPerUse = sub.usageCount > 0 ? monthlyAmount / sub.usageCount : monthlyAmount;
        
        let valueRating: "excellent" | "good" | "fair" | "poor";
        if (costPerUse <= 2) valueRating = "excellent";
        else if (costPerUse <= 5) valueRating = "good";
        else if (costPerUse <= 10) valueRating = "fair";
        else valueRating = "poor";

        return {
          subscriptionId: sub.id,
          name: sub.name,
          monthlyAmount,
          usageCount: sub.usageCount,
          costPerUse,
          valueRating,
        };
      })
      .sort((a, b) => b.costPerUse - a.costPerUse)
      .slice(0, 5);
  }

  async getBehavioralInsights(): Promise<OpportunityCost[]> {
    const subscriptions = await this.getSubscriptions();
    
    return subscriptions
      .filter(sub => sub.status === "unused")
      .map(sub => {
        const monthlyAmount = calculateMonthlyCost(sub.amount, sub.frequency);
        return {
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          monthlyAmount,
          equivalents: generateOpportunityCosts(monthlyAmount),
        };
      });
  }

  async getRecommendations(): Promise<AIRecommendation[]> {
    const subscriptions = await this.getSubscriptions();
    const recommendations: AIRecommendation[] = [];

    const adobeSub = subscriptions.find(s => s.name.toLowerCase().includes("adobe"));
    if (adobeSub) {
      recommendations.push({
        id: randomUUID(),
        type: "alternative",
        title: "Switch from Adobe to Affinity",
        description: "Affinity offers similar professional design tools with a one-time purchase instead of monthly fees.",
        currentCost: calculateMonthlyCost(adobeSub.amount, adobeSub.frequency),
        suggestedCost: 0,
        savings: calculateMonthlyCost(adobeSub.amount, adobeSub.frequency),
        subscriptionId: adobeSub.id,
        alternativeName: "Affinity Suite",
        confidence: 0.85,
      });
    }

    const unusedSubs = subscriptions.filter(s => s.status === "unused");
    for (const sub of unusedSubs) {
      recommendations.push({
        id: randomUUID(),
        type: "cancel",
        title: `Cancel ${sub.name}`,
        description: `You've barely used ${sub.name} this month. Consider cancelling to save money.`,
        currentCost: calculateMonthlyCost(sub.amount, sub.frequency),
        suggestedCost: 0,
        savings: calculateMonthlyCost(sub.amount, sub.frequency),
        subscriptionId: sub.id,
        confidence: 0.92,
      });
    }

    const streamingSubs = subscriptions.filter(s => s.category === "streaming" && s.status === "active");
    if (streamingSubs.length > 1) {
      const totalStreaming = streamingSubs.reduce((sum, s) => sum + calculateMonthlyCost(s.amount, s.frequency), 0);
      if (totalStreaming > 25) {
        recommendations.push({
          id: randomUUID(),
          type: "negotiate",
          title: "Rotate streaming services",
          description: "Consider subscribing to one streaming service at a time and rotating monthly based on what you want to watch.",
          currentCost: totalStreaming,
          suggestedCost: 15.99,
          savings: totalStreaming - 15.99,
          subscriptionId: streamingSubs[0].id,
          confidence: 0.78,
        });
      }
    }

    return recommendations;
  }
}

export const supabaseStorage = new SupabaseStorage();
