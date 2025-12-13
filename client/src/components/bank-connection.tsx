import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  CheckCircle2,
  Plus,
  RefreshCw,
  Unlink,
  CreditCard,
  Wallet,
} from "lucide-react";
import type { BankConnection } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface BankConnectionProps {
  connections: BankConnection[] | undefined;
  isLoading: boolean;
  onConnect: () => void;
  onSync: (id: string) => void;
  onDisconnect: (id: string) => void;
}

export function BankConnectionCard({
  connections,
  isLoading,
  onConnect,
  onSync,
  onDisconnect,
}: BankConnectionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    );
  }

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-semibold">Connected Accounts</CardTitle>
          <p className="text-sm text-muted-foreground">
            Securely link your bank accounts to detect subscriptions
          </p>
        </div>
        <Button onClick={onConnect} data-testid="button-connect-bank">
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {connections?.map((connection) => {
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
                    onClick={() => onSync(connection.id)}
                    data-testid={`button-sync-${connection.id}`}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDisconnect(connection.id)}
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
        {(!connections || connections.length === 0) && (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium mb-1">No accounts connected</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your bank to automatically detect subscriptions
            </p>
            <Button onClick={onConnect} data-testid="button-connect-bank-empty">
              <Plus className="h-4 w-4 mr-2" />
              Connect Bank Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
