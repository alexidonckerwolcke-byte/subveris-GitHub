import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubscription, type Currency } from "@/lib/subscription-context";

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "JPY", label: "Japanese Yen", symbol: "¥" },
  { value: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { value: "AUD", label: "Australian Dollar", symbol: "A$" },
  { value: "CHF", label: "Swiss Franc", symbol: "CHF" },
  { value: "CNY", label: "Chinese Yuan", symbol: "¥" },
];

export function CurrencySelector() {
  const { currency, setCurrency } = useSubscription();

  return (
    <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((curr) => (
          <SelectItem key={curr.value} value={curr.value}>
            {curr.symbol} {curr.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}