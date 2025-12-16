import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  Lightbulb,
  Settings,
  Wallet,
  PiggyBank,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import type { DashboardMetrics } from "@shared/schema";
import { useSubscription } from "@/lib/subscription-context";
import { convertAndFormatCurrency } from "@/lib/utils";

const mainNavItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Subscriptions",
    url: "/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Insights",
    url: "/insights",
    icon: Lightbulb,
  },
  {
    title: "Savings",
    url: "/savings",
    icon: PiggyBank,
  },
];

const settingsItems = [
  {
    title: "Bank Accounts",
    url: "/bank-accounts",
    icon: Wallet,
  },
  {
    title: "Pricing",
    url: "/pricing",
    icon: Sparkles,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { currency } = useSubscription();
  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ["/api/metrics"],
  });

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">Subveris</span>
            <span className="text-xs text-muted-foreground">Smart Savings</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(" ", "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PiggyBank className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium">This Month</span>
            <span className="text-sm font-semibold text-chart-2">
              +{convertAndFormatCurrency(metrics?.thisMonthSavings || 0, currency)} Saved
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
