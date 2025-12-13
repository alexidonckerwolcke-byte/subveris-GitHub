import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  CheckCircle2,
  Plus,
  RefreshCw,
  Unlink,
  CreditCard,
  Wallet,
  Shield,
  Lock,
  Sparkles,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { BankConnection } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { useSubscription } from "@/lib/subscription-context";
import { Link } from "wouter";

export default function BankAccounts() {
  const { toast } = useToast();
  const { limits } = useSubscription();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBankName, setNewBankName] = useState("");
  const [newAccountType, setNewAccountType] = useState("checking");

  const { data: connections, isLoading } = useQuery<BankConnection[]>({
    queryKey: ["/api/bank-connections"],
    enabled: limits.hasBankIntegration,
  });

  const connectMutation = useMutation({
    mutationFn: async (data: { bankName: string; accountType: string }) => {
      return apiRequest("POST", "/api/bank-connections", {
        ...data,
        lastSync: new Date().toISOString(),
        isConnected: true,
        accountMask: Math.floor(1000 + Math.random() * 9000).toString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-connections"] });
      setDialogOpen(false);
      setNewBankName("");
      setNewAccountType("checking");
      toast({
        title: "Account connected",
        description: "Your bank account has been connected successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to connect bank account.",
        variant: "destructive",
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/bank-connections/${id}/sync`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "Sync complete",
        description: "Your transactions have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sync bank account.",
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/bank-connections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-connections"] });
      toast({
        title: "Account disconnected",
        description: "The bank account has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to disconnect bank account.",
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    if (!newBankName.trim()) return;
    connectMutation.mutate({
      bankName: newBankName,
      accountType: newAccountType,
    });
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "checking":
        return Wallet;
      case "credit":
        return CreditCard;
      default:
        return Building2;
    }
  };

  if (!limits.hasBankIntegration) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bank Accounts</h1>
            <p className="text-muted-foreground">
              Connect your accounts to automatically detect subscriptions
            </p>
          </div>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-6">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">Premium Feature</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Bank account integration is available on the Premium plan. Upgrade to automatically detect and track your subscriptions.
              </p>
              <Link href="/pricing">
                <Button size="lg">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bank Accounts</h1>
            <p className="text-muted-foreground">
              Connect your accounts to automatically detect subscriptions
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-connect-bank">
                <Plus className="h-4 w-4 mr-2" />
                Connect Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect Bank Account</DialogTitle>
                <DialogDescription>
                  Securely link your bank account to automatically detect recurring payments.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="e.g., Chase, Bank of America"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    data-testid="input-bank-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select value={newAccountType} onValueChange={setNewAccountType}>
                    <SelectTrigger id="accountType" data-testid="select-account-type">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="credit">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 shrink-0" />
                  <p>Your credentials are encrypted and never stored on our servers.</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConnect}
                  disabled={!newBankName.trim() || connectMutation.isPending}
                  data-testid="button-submit-connect"
                >
                  {connectMutation.isPending ? "Connecting..." : "Connect"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-2/10">
                  <CheckCircle2 className="h-5 w-5 text-chart-2" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Connected Accounts
                </span>
              </div>
              <span className="text-3xl font-bold">
                {connections?.filter((c) => c.isConnected).length || 0}
              </span>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-1/10">
                  <RefreshCw className="h-5 w-5 text-chart-1" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Last Sync
                </span>
              </div>
              <span className="text-lg font-medium">
                {connections && connections.length > 0
                  ? formatDate(connections[0].lastSync)
                  : "Never"}
              </span>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-3/10">
                  <Shield className="h-5 w-5 text-chart-3" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Security
                </span>
              </div>
              <span className="text-lg font-medium text-chart-2">Bank-level encryption</span>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Connected Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                ))}
              </div>
            ) : connections && connections.length > 0 ? (
              <div className="space-y-3">
                {connections.map((connection) => {
                  const Icon = getAccountIcon(connection.accountType);
                  return (
                    <div
                      key={connection.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover-elevate"
                      data-testid={`bank-connection-${connection.id}`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{connection.bankName}</h4>
                          {connection.isConnected && (
                            <Badge className="bg-chart-2/10 text-chart-2">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {connection.accountType.charAt(0).toUpperCase() + connection.accountType.slice(1)}
                          {connection.accountMask && ` ••••${connection.accountMask}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last synced: {formatDate(connection.lastSync)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => syncMutation.mutate(connection.id)}
                          disabled={syncMutation.isPending}
                          data-testid={`button-sync-${connection.id}`}
                        >
                          <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => disconnectMutation.mutate(connection.id)}
                          className="text-muted-foreground hover:text-destructive"
                          data-testid={`button-disconnect-${connection.id}`}
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium mb-1">No accounts connected</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your bank to automatically detect subscriptions
                </p>
                <Button onClick={() => setDialogOpen(true)} data-testid="button-connect-bank-empty">
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Bank Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Lock className="h-5 w-5 text-chart-2 mt-0.5" />
                <div>
                  <h4 className="font-medium">Bank-Level Encryption</h4>
                  <p className="text-sm text-muted-foreground">
                    All data is encrypted with 256-bit AES encryption, the same standard used by major banks.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 text-chart-2 mt-0.5" />
                <div>
                  <h4 className="font-medium">Read-Only Access</h4>
                  <p className="text-sm text-muted-foreground">
                    We only read your transaction data. We can never move money or make changes to your accounts.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
