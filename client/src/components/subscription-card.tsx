import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  TrendingDown,
  TrendingUp,
  ActivitySquare,
} from "lucide-react";
import { UsageLoggerModal } from "@/components/usage-logger-modal";
import { queryClient } from "@/lib/queryClient";
import type { Subscription, SubscriptionStatus } from "@shared/schema";
import { getCategoryIcon, getStatusColor, formatCurrency, convertAndFormatCurrency } from "@/lib/utils";
import { useSubscription } from "@/lib/subscription-context";

interface SubscriptionCardProps {
  subscription: Subscription;
  onStatusChange: (id: string, status: SubscriptionStatus) => void;
  onDelete: (id: string) => void;
}

export function SubscriptionCard({
  subscription,
  onStatusChange,
  onDelete,
}: SubscriptionCardProps) {
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const { currency } = useSubscription();
  
  const handleUsageUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
    queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
    queryClient.invalidateQueries({ queryKey: ["/api/analysis/cost-per-use"] });
  };
  const CategoryIcon = getCategoryIcon(subscription.category);
  const statusColors = getStatusColor(subscription.status);
  
  const monthlyAmount = subscription.frequency === "yearly" 
    ? subscription.amount / 12 
    : subscription.frequency === "quarterly"
    ? subscription.amount / 3
    : subscription.frequency === "weekly"
    ? subscription.amount * 4
    : subscription.amount;

  const costPerUse = subscription.usageCount > 0 
    ? monthlyAmount / subscription.usageCount 
    : monthlyAmount;

  const valueRating = costPerUse <= 2 ? "excellent" : costPerUse <= 5 ? "good" : costPerUse <= 10 ? "fair" : "poor";

  return (
    <>
      <Card 
        className="hover-elevate group"
        data-testid={`subscription-card-${subscription.id}`}
      >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <CategoryIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">{subscription.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {subscription.category.replace("-", " ")}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid={`subscription-menu-${subscription.id}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setUsageModalOpen(true)}
                data-testid={`action-log-usage-${subscription.id}`}
              >
                <ActivitySquare className="mr-2 h-4 w-4" />
                Log Usage
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {subscription.status !== "active" && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(subscription.id, "active")}
                  data-testid={`action-activate-${subscription.id}`}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Mark as Active
                </DropdownMenuItem>
              )}
              {subscription.status !== "unused" && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(subscription.id, "unused")}
                  data-testid={`action-unused-${subscription.id}`}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Mark as Unused
                </DropdownMenuItem>
              )}
              {subscription.status !== "to-cancel" && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(subscription.id, "to-cancel")}
                  data-testid={`action-cancel-${subscription.id}`}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Mark to Cancel
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(subscription.id)}
                className="text-destructive focus:text-destructive"
                data-testid={`action-delete-${subscription.id}`}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">
              {convertAndFormatCurrency(subscription.amount, currency)}
              <span className="text-sm font-normal text-muted-foreground">
                /{subscription.frequency === "yearly" ? "yr" : subscription.frequency === "monthly" ? "mo" : subscription.frequency === "quarterly" ? "qtr" : "wk"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
            </p>
          </div>
          <Badge className={statusColors}>
            {subscription.status === "to-cancel" ? "To Cancel" : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </Badge>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Usage:</span>
              <span className="font-medium">{subscription.usageCount}x this month</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Cost/use:</span>
              <span className={`font-medium ${
                valueRating === "excellent" || valueRating === "good" 
                  ? "text-chart-2" 
                  : valueRating === "fair" 
                  ? "text-chart-4" 
                  : "text-chart-5"
              }`}>
                {convertAndFormatCurrency(costPerUse, currency)}
              </span>
              {valueRating === "poor" && (
                <TrendingDown className="h-3 w-3 text-chart-5" />
              )}
              {(valueRating === "excellent" || valueRating === "good") && (
                <TrendingUp className="h-3 w-3 text-chart-2" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    <UsageLoggerModal
      subscription={subscription}
      isOpen={usageModalOpen}
      onOpenChange={setUsageModalOpen}
      onUsageUpdated={handleUsageUpdated}
    />
    </>
  );
}
