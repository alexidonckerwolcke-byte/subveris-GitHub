import { useQuery, useMutation } from "@tanstack/react-query";
import { MetricsCards } from "@/components/metrics-cards";
import { SpendingChart } from "@/components/spending-chart";
import { CostPerUse } from "@/components/cost-per-use";
import { BehavioralInsights } from "@/components/behavioral-insights";
import { AIRecommendations } from "@/components/ai-recommendations";
import { SavingsProjection } from "@/components/savings-projection";
import { SubscriptionCard } from "@/components/subscription-card";
import { PremiumGate } from "@/components/premium-gate";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/lib/subscription-context";
import type {
  DashboardMetrics,
  MonthlySpending,
  SpendingByCategory,
  CostPerUseAnalysis,
  OpportunityCost,
  AIRecommendation,
  Subscription,
  SubscriptionStatus,
} from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { limits } = useSubscription();

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/metrics"],
  });

  const { data: subscriptions, isLoading: subsLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  const { data: monthlySpending, isLoading: monthlyLoading } = useQuery<MonthlySpending[]>({
    queryKey: ["/api/spending/monthly"],
  });

  const { data: categorySpending, isLoading: categoryLoading } = useQuery<SpendingByCategory[]>({
    queryKey: ["/api/spending/category"],
  });

  const { data: costAnalysis, isLoading: analysisLoading } = useQuery<CostPerUseAnalysis[]>({
    queryKey: ["/api/analysis/cost-per-use"],
  });

  const { data: behavioralInsights, isLoading: insightsLoading } = useQuery<OpportunityCost[]>({
    queryKey: ["/api/insights/behavioral"],
  });

  const { data: recommendations, isLoading: recsLoading, refetch: refetchRecs } = useQuery<AIRecommendation[]>({
    queryKey: ["/api/recommendations"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SubscriptionStatus }) => {
      return apiRequest("PATCH", `/api/subscriptions/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/insights/behavioral"] });
      toast({
        title: "Status updated",
        description: "Subscription status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update subscription status.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/subscriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({
        title: "Subscription deleted",
        description: "The subscription has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete subscription.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: string, status: SubscriptionStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleRefreshRecommendations = () => {
    refetchRecs();
  };

  const activeSubscriptions = subscriptions?.filter((s) => s.status === "active") || [];
  const unusedCount = subscriptions?.filter((s) => s.status === "unused").length || 0;
  const toCancelCount = subscriptions?.filter((s) => s.status === "to-cancel").length || 0;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="mb-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your subscription spending at a glance
          </p>
        </div>

        <MetricsCards metrics={metrics} isLoading={metricsLoading} />

        <div className="grid gap-6 lg:grid-cols-2">
          <SpendingChart
            monthlyData={monthlySpending}
            categoryData={categorySpending}
            isLoading={monthlyLoading || categoryLoading}
          />
          {limits.hasSavingsProjections ? (
            <SavingsProjection
              potentialSavings={metrics?.potentialSavings || 0}
              currentSavings={metrics?.thisMonthSavings || 0}
              unusedCount={unusedCount}
              toCancelCount={toCancelCount}
              isLoading={metricsLoading}
            />
          ) : (
            <PremiumGate feature="Savings Projections" showBlurred={false}>
              <SavingsProjection
                potentialSavings={metrics?.potentialSavings ?? 0}
                currentSavings={metrics?.thisMonthSavings ?? 0}
                unusedCount={metrics?.unusedSubscriptions ?? 0}
                toCancelCount={0}
                isLoading={metricsLoading}
              />
            </PremiumGate>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {limits.hasCostPerUse ? (
            <CostPerUse analyses={costAnalysis} isLoading={analysisLoading} />
          ) : (
            <PremiumGate feature="Cost-per-use analytics" showBlurred={false}>
              <CostPerUse analyses={costAnalysis} isLoading={analysisLoading} />
            </PremiumGate>
          )}
          {limits.hasBehavioralInsights ? (
            <BehavioralInsights insights={behavioralInsights} isLoading={insightsLoading} />
          ) : (
            <PremiumGate feature="Behavioral insights" showBlurred={false}>
              <BehavioralInsights insights={insights} isLoading={insightsLoading} />
            </PremiumGate>
          )}
        </div>

        {limits.hasAIRecommendations ? (
          <AIRecommendations
            recommendations={recommendations}
            isLoading={recsLoading}
            onRefresh={handleRefreshRecommendations}
            isRefreshing={recsLoading}
          />
        ) : (
          <PremiumGate feature="AI-powered recommendations" showBlurred={false}>
            <AIRecommendations
              recommendations={recommendations}
              isLoading={recsLoading}
              onRefresh={handleRefreshRecommendations}
              isRefreshing={recsLoading}
            />
          </PremiumGate>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Active Subscriptions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
              ))
            ) : activeSubscriptions.length > 0 ? (
              activeSubscriptions.slice(0, 6).map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <p>No active subscriptions found.</p>
                <p className="text-sm">Connect your bank account to detect subscriptions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
