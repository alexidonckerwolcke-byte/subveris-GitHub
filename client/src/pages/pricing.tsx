import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription, SubscriptionTier } from "@/lib/subscription-context";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  name: string;
  tier: SubscriptionTier;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
}

const plans: Plan[] = [
  {
    name: "Free",
    tier: "free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with subscription tracking",
    features: [
      "Track up to 5 subscriptions",
      "Basic spending overview",
      "Monthly spending reports",
      "Manual subscription entry",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Premium",
    tier: "premium",
    price: "$9.99",
    period: "per month",
    description: "Unlock powerful insights and automation features",
    features: [
      "Unlimited subscriptions",
      "AI-powered recommendations",
      "Bank account integration",
      "Cost-per-use analytics",
      "Behavioral insights",
      "Savings projections",
      "Priority support",
      "Export reports (CSV/PDF)",
    ],
    popular: true,
  },
];

export default function Pricing() {
  const { tier: currentTier, setTier } = useSubscription();
  const { toast } = useToast();

  const handleSelectPlan = (plan: Plan) => {
    if (plan.tier === currentTier) return;
    
    setTier(plan.tier);
    toast({
      title: plan.tier === "premium" ? "Upgraded to Premium!" : "Switched to Free",
      description: plan.tier === "premium" 
        ? "You now have access to all premium features."
        : "You're now on the Free plan with limited features.",
    });
  };

  const getButtonText = (plan: Plan) => {
    if (plan.tier === currentTier) {
      return "Current Plan";
    }
    return plan.tier === "premium" ? "Upgrade to Premium" : "Switch to Free";
  };

  return (
    <div className="container max-w-5xl py-8 px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          Simple, Transparent Pricing
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose the plan that fits your needs. Upgrade anytime to unlock powerful features.
        </p>
        {currentTier === "premium" && (
          <Badge variant="secondary" className="mt-4">
            <Sparkles className="h-3 w-3 mr-1" />
            You're on Premium
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col transition-all ${
              plan.tier === currentTier
                ? "border-primary shadow-lg ring-2 ring-primary"
                : plan.popular
                ? "border-primary/50 shadow-lg scale-[1.02]"
                : "border-border"
            }`}
          >
            {plan.popular && plan.tier !== currentTier && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            )}
            {plan.tier === currentTier && (
              <Badge variant="secondary" className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1">
                <Check className="h-3 w-3 mr-1" />
                Current Plan
              </Badge>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-2">/{plan.period}</span>
              </div>
              <CardDescription className="mt-3">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.tier === currentTier ? "outline" : "default"}
                size="lg"
                onClick={() => handleSelectPlan(plan)}
                disabled={plan.tier === currentTier}
              >
                {getButtonText(plan)}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          All plans include a 14-day money-back guarantee. No questions asked.
        </p>
      </div>
    </div>
  );
}
