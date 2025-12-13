import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AIRecommendations } from "@/components/ai-recommendations";
import { BehavioralInsights } from "@/components/behavioral-insights";
import { CostPerUse } from "@/components/cost-per-use";
import {
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Target,
} from "lucide-react";
import type {
  AIRecommendation,
  OpportunityCost,
  CostPerUseAnalysis,
  Insight,
} from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

export default function Insights() {
  const { data: recommendations, isLoading: recsLoading, refetch: refetchRecs } = useQuery<AIRecommendation[]>({
    queryKey: ["/api/recommendations"],
  });

  const { data: behavioralInsights, isLoading: behavioralLoading } = useQuery<OpportunityCost[]>({
    queryKey: ["/api/insights/behavioral"],
  });

  const { data: costAnalysis, isLoading: analysisLoading } = useQuery<CostPerUseAnalysis[]>({
    queryKey: ["/api/analysis/cost-per-use"],
  });

  const { data: insights, isLoading: insightsLoading } = useQuery<Insight[]>({
    queryKey: ["/api/insights"],
  });

  const totalPotentialSavings = recommendations?.reduce((sum, rec) => sum + rec.savings, 0) || 0;
  const highPriorityCount = insights?.filter((i) => i.priority === 1).length || 0;

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "savings":
        return TrendingUp;
      case "warning":
        return AlertCircle;
      case "tip":
        return Lightbulb;
      default:
        return CheckCircle2;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "savings":
        return "bg-chart-2/10 text-chart-2";
      case "warning":
        return "bg-chart-5/10 text-chart-5";
      case "tip":
        return "bg-chart-3/10 text-chart-3";
      default:
        return "bg-chart-1/10 text-chart-1";
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="mb-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground">
            AI-powered analysis and recommendations for your subscriptions
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Potential Savings
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/10">
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-bold tracking-tight text-chart-2">
                  {formatCurrency(totalPotentialSavings)}
                </span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Recommendations
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-1/10">
                  <Lightbulb className="h-4 w-4 text-chart-1" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-bold tracking-tight">
                  {recommendations?.length || 0}
                </span>
                <span className="text-sm text-muted-foreground ml-2">available</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  High Priority
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-5/10">
                  <AlertCircle className="h-4 w-4 text-chart-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-bold tracking-tight">
                  {highPriorityCount}
                </span>
                <span className="text-sm text-muted-foreground ml-2">actions needed</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <AIRecommendations
          recommendations={recommendations}
          isLoading={recsLoading}
          onRefresh={() => refetchRecs()}
          isRefreshing={recsLoading}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <CostPerUse analyses={costAnalysis} isLoading={analysisLoading} />
          <BehavioralInsights insights={behavioralInsights} isLoading={behavioralLoading} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              All Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insightsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : insights && insights.length > 0 ? (
              <div className="space-y-3">
                {insights.map((insight) => {
                  const Icon = getInsightIcon(insight.type);
                  return (
                    <div
                      key={insight.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border border-border ${
                        insight.isRead ? "opacity-60" : ""
                      }`}
                      data-testid={`insight-item-${insight.id}`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getInsightColor(insight.type)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{insight.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {insight.type}
                          </Badge>
                          {insight.priority === 1 && (
                            <Badge className="bg-chart-5/10 text-chart-5 text-xs">
                              High Priority
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                        {insight.potentialSavings && (
                          <p className="text-sm font-medium text-chart-2 mt-1">
                            Potential savings: {formatCurrency(insight.potentialSavings)}/mo
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No insights available yet.</p>
                <p className="text-sm">Add more subscriptions to get personalized insights.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
