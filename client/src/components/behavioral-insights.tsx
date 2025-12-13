import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Coffee, Film, Utensils, Music, Tv, Plane, ShoppingBag, Fuel } from "lucide-react";
import type { OpportunityCost } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface BehavioralInsightsProps {
  insights: OpportunityCost[] | undefined;
  isLoading: boolean;
}

const iconMap: Record<string, typeof Coffee> = {
  coffee: Coffee,
  film: Film,
  utensils: Utensils,
  music: Music,
  tv: Tv,
  plane: Plane,
  shopping: ShoppingBag,
  fuel: Fuel,
};

export function BehavioralInsights({ insights, isLoading }: BehavioralInsightsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/50">
              <Skeleton className="h-5 w-32 mb-3" />
              <div className="flex gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <Skeleton className="h-16 w-16 rounded-lg" />
                <Skeleton className="h-16 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          What Your Money Could Buy
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visualize the real value of your unused subscriptions
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights?.map((insight) => (
            <div
              key={insight.subscriptionId}
              className="p-4 rounded-lg bg-muted/30 border border-border"
              data-testid={`insight-${insight.subscriptionId}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">{insight.subscriptionName}</span>
                <span className="text-sm font-semibold text-chart-5">
                  {formatCurrency(insight.monthlyAmount)}/mo
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                This unused subscription equals:
              </p>
              <div className="flex flex-wrap gap-3">
                {insight.equivalents.map((equiv, idx) => {
                  const Icon = iconMap[equiv.icon] || Coffee;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-1/10">
                        <Icon className="h-4 w-4 text-chart-1" />
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">{equiv.count}</span>
                        <span className="text-muted-foreground ml-1">{equiv.item}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {(!insights || insights.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No unused subscriptions detected.</p>
            <p className="text-sm">Great job managing your subscriptions!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
