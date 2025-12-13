import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  PiggyBank,
  TrendingUp,
  Target,
  Calendar,
  ChevronRight,
  Trophy,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardMetrics, MonthlySpending } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

export default function Savings() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/metrics"],
  });

  const { data: monthlySpending, isLoading: spendingLoading } = useQuery<MonthlySpending[]>({
    queryKey: ["/api/spending/monthly"],
  });

  const savingsGoal = 500;
  const currentSavings = metrics?.thisMonthSavings || 0;
  const potentialSavings = metrics?.potentialSavings || 0;
  const savingsProgress = savingsGoal > 0 ? Math.min((currentSavings / savingsGoal) * 100, 100) : 0;

  const projectedAnnualSavings = potentialSavings * 12;

  const savingsMilestones = [
    { amount: 100, label: "Weekend Trip", achieved: currentSavings >= 100 },
    { amount: 250, label: "New Gadget", achieved: currentSavings >= 250 },
    { amount: 500, label: "Emergency Fund", achieved: currentSavings >= 500 },
    { amount: 1000, label: "Vacation Fund", achieved: currentSavings >= 1000 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-popover-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-chart-1">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="mb-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Savings</h1>
          <p className="text-muted-foreground">
            Track your progress and achieve your savings goals
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-2/10">
                  <PiggyBank className="h-5 w-5 text-chart-2" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  This Month
                </span>
              </div>
              {metricsLoading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <span className="text-3xl font-bold text-chart-2" data-testid="text-current-savings">
                  {formatCurrency(currentSavings)}
                </span>
              )}
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-1/10">
                  <Zap className="h-5 w-5 text-chart-1" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Potential
                </span>
              </div>
              {metricsLoading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <span className="text-3xl font-bold" data-testid="text-potential-savings">
                  {formatCurrency(potentialSavings)}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </span>
              )}
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-4/10">
                  <Calendar className="h-5 w-5 text-chart-4" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Yearly Projection
                </span>
              </div>
              {metricsLoading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <span className="text-3xl font-bold" data-testid="text-yearly-projection">
                  {formatCurrency(projectedAnnualSavings)}
                </span>
              )}
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-3/10">
                  <Trophy className="h-5 w-5 text-chart-3" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Goal Progress
                </span>
              </div>
              {metricsLoading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <span className="text-3xl font-bold">
                  {Math.round(savingsProgress)}%
                </span>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5" />
                Savings Goal
              </CardTitle>
              <Badge variant="secondary">
                {formatCurrency(savingsGoal)}/mo target
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress this month</span>
                  <span className="font-medium">
                    {formatCurrency(currentSavings)} of {formatCurrency(savingsGoal)}
                  </span>
                </div>
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-chart-2 to-chart-1 transition-all duration-500 rounded-full"
                    style={{ width: `${savingsProgress}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-3">Milestones</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {savingsMilestones.map((milestone) => (
                    <div
                      key={milestone.amount}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        milestone.achieved
                          ? "border-chart-2/30 bg-chart-2/5"
                          : "border-border"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          milestone.achieved
                            ? "bg-chart-2/20 text-chart-2"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {milestone.achieved ? (
                          <Trophy className="h-4 w-4" />
                        ) : (
                          <Target className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{milestone.label}</p>
                        <p className={`font-medium ${milestone.achieved ? "text-chart-2" : ""}`}>
                          {formatCurrency(milestone.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Spending Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {spendingLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]" data-testid="chart-savings-trend">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlySpending}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                      tickFormatter={(value) => `$${value}`}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSpending)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
