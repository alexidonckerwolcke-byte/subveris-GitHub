import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SubscriptionProvider } from "@/lib/subscription-context";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Subscriptions from "@/pages/subscriptions";
import Insights from "@/pages/insights";
import Savings from "@/pages/savings";
import BankAccounts from "@/pages/bank-accounts";
import Settings from "@/pages/settings";
import Pricing from "@/pages/pricing";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/subscriptions" component={Subscriptions} />
      <Route path="/insights" component={Insights} />
      <Route path="/savings" component={Savings} />
      <Route path="/bank-accounts" component={BankAccounts} />
      <Route path="/settings" component={Settings} />
      <Route path="/pricing" component={Pricing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SubscriptionProvider>
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex h-14 items-center justify-between gap-4 border-b border-border px-4 shrink-0">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </SubscriptionProvider>
    </QueryClientProvider>
  );
}

export default App;
