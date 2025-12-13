import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SubscriptionCard } from "@/components/subscription-card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Filter } from "lucide-react";
import type { Subscription, SubscriptionStatus, SubscriptionCategory, BillingFrequency } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const addSubscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required").transform((val) => parseFloat(val)),
  frequency: z.string().min(1, "Frequency is required"),
  nextBillingDate: z.string().min(1, "Next billing date is required"),
});

type AddSubscriptionForm = z.infer<typeof addSubscriptionSchema>;

export default function Subscriptions() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const tabFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    return params.get("tab") || "active";
  }, [location]);

  const form = useForm<AddSubscriptionForm>({
    resolver: zodResolver(addSubscriptionSchema),
    defaultValues: {
      name: "",
      category: "",
      amount: "" as any,
      frequency: "monthly",
      nextBillingDate: new Date().toISOString().split("T")[0],
    },
  });

  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: AddSubscriptionForm) => {
      return apiRequest("POST", "/api/subscriptions", {
        ...data,
        status: "active",
        usageCount: 0,
        isDetected: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Subscription added",
        description: "Your subscription has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add subscription.",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SubscriptionStatus }) => {
      return apiRequest("PATCH", `/api/subscriptions/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({
        title: "Status updated",
        description: "Subscription status has been updated.",
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
  });

  const handleStatusChange = (id: string, status: SubscriptionStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const onSubmit = (data: AddSubscriptionForm) => {
    addMutation.mutate(data);
  };

  const filteredSubscriptions = subscriptions?.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || sub.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeSubscriptions = filteredSubscriptions?.filter((s) => s.status === "active") || [];
  const unusedSubscriptions = filteredSubscriptions?.filter((s) => s.status === "unused") || [];
  const toCancelSubscriptions = filteredSubscriptions?.filter((s) => s.status === "to-cancel") || [];

  const categories: SubscriptionCategory[] = [
    "streaming", "software", "fitness", "cloud-storage", "news",
    "gaming", "productivity", "finance", "education", "other"
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Subscriptions</h1>
            <p className="text-muted-foreground">
              Manage and track all your recurring payments
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-subscription">
                <Plus className="h-4 w-4 mr-2" />
                Add Subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subscription</DialogTitle>
                <DialogDescription>
                  Manually add a subscription that wasn't automatically detected.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Netflix, Spotify, etc." {...field} data-testid="input-sub-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="9.99" {...field} data-testid="input-amount" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-frequency">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="nextBillingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next Billing Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-billing-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addMutation.isPending} data-testid="button-submit-subscription">
                      {addMutation.isPending ? "Adding..." : "Add Subscription"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48" data-testid="filter-category">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={tabFromUrl} className="w-full">
          <TabsList>
            <TabsTrigger value="active" data-testid="tab-active">
              Active ({activeSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="unused" data-testid="tab-unused">
              Unused ({unusedSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="to-cancel" data-testid="tab-to-cancel">
              To Cancel ({toCancelSubscriptions.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
                ))
              ) : activeSubscriptions.length > 0 ? (
                activeSubscriptions.map((sub) => (
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
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="unused" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {unusedSubscriptions.length > 0 ? (
                unusedSubscriptions.map((sub) => (
                  <SubscriptionCard
                    key={sub.id}
                    subscription={sub}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <p>No unused subscriptions.</p>
                  <p className="text-sm">Great job staying on top of your subscriptions!</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="to-cancel" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {toCancelSubscriptions.length > 0 ? (
                toCancelSubscriptions.map((sub) => (
                  <SubscriptionCard
                    key={sub.id}
                    subscription={sub}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <p>No subscriptions marked for cancellation.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
