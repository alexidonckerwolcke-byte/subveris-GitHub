import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { CostPerUseAnalysis } from "@shared/schema";
import { formatCurrency, getValueRatingColor } from "@/lib/utils";

interface CostPerUseProps {
  analyses: CostPerUseAnalysis[] | undefined;
  isLoading: boolean;
}

export function CostPerUse({ analyses, isLoading }: CostPerUseProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getRatingBadge = (rating: CostPerUseAnalysis["valueRating"]) => {
    const config = {
      excellent: { label: "Excellent Value", className: "bg-chart-2/10 text-chart-2" },
      good: { label: "Good Value", className: "bg-chart-2/10 text-chart-2" },
      fair: { label: "Fair Value", className: "bg-chart-4/10 text-chart-4" },
      poor: { label: "Poor Value", className: "bg-chart-5/10 text-chart-5" },
    };
    return config[rating];
  };

  const getProgressValue = (rating: CostPerUseAnalysis["valueRating"]) => {
    const values = { excellent: 100, good: 75, fair: 50, poor: 25 };
    return values[rating];
  };

  const getProgressColor = (rating: CostPerUseAnalysis["valueRating"]) => {
    const colors = {
      excellent: "bg-chart-2",
      good: "bg-chart-2",
      fair: "bg-chart-4",
      poor: "bg-chart-5",
    };
    return colors[rating];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Cost Per Use Analysis
          <Badge variant="secondary" className="text-xs font-normal">
            Value Score
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {analyses?.map((analysis) => {
            const ratingConfig = getRatingBadge(analysis.valueRating);
            return (
              <div
                key={analysis.subscriptionId}
                className="space-y-2"
                data-testid={`cost-analysis-${analysis.subscriptionId}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{analysis.name}</span>
                    <Badge className={ratingConfig.className}>
                      {ratingConfig.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${getValueRatingColor(analysis.valueRating)}`}>
                      {formatCurrency(analysis.costPerUse)}
                    </span>
                    <span className="text-xs text-muted-foreground">/use</span>
                    {analysis.valueRating === "excellent" || analysis.valueRating === "good" ? (
                      <TrendingUp className="h-4 w-4 text-chart-2" />
                    ) : analysis.valueRating === "fair" ? (
                      <Minus className="h-4 w-4 text-chart-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-chart-5" />
                    )}
                  </div>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`absolute left-0 top-0 h-full transition-all duration-500 rounded-full ${getProgressColor(analysis.valueRating)}`}
                    style={{ width: `${getProgressValue(analysis.valueRating)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {formatCurrency(analysis.monthlyAmount)}/mo
                  </span>
                  <span>
                    {analysis.usageCount} uses this month
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {(!analyses || analyses.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No usage data available yet.</p>
            <p className="text-sm">Connect your accounts to start tracking.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
