import type { BudgetBreakdown } from "@/lib/travel-ai";
import { Plane, Hotel, UtensilsCrossed, Compass, Package } from "lucide-react";

interface BudgetCardProps {
  budget: BudgetBreakdown;
}

const items = [
  { key: "travel" as const, label: "Travel (Flights)", icon: Plane, colorClass: "text-primary" },
  { key: "hotel" as const, label: "Accommodation", icon: Hotel, colorClass: "text-travel-warm" },
  { key: "food" as const, label: "Food & Dining", icon: UtensilsCrossed, colorClass: "text-travel-gold" },
  { key: "activities" as const, label: "Activities", icon: Compass, colorClass: "text-travel-green" },
  { key: "miscellaneous" as const, label: "Miscellaneous", icon: Package, colorClass: "text-muted-foreground" },
];

const BudgetCard = ({ budget }: BudgetCardProps) => {
  const total = budget.total;

  return (
    <div className="bg-card border border-border rounded-xl p-4 mt-2 animate-fade-in-up shadow-sm">
      <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
        💰 Budget Breakdown
        <span className="text-xs font-normal text-muted-foreground">
          ({budget.days} days, {budget.style === "midRange" ? "Mid-Range" : budget.style === "budget" ? "Budget" : "Luxury"})
        </span>
      </h3>
      <div className="space-y-2.5">
        {items.map(({ key, label, icon: Icon, colorClass }) => {
          const value = budget[key];
          const pct = Math.round((value / total) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-2 text-card-foreground">
                  <Icon className={`w-4 h-4 ${colorClass}`} />
                  {label}
                </span>
                <span className="font-medium text-card-foreground">₹{value.toLocaleString("en-IN")}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full travel-gradient transition-all duration-700"
                  style={{ width: `${pct}%`, opacity: 0.6 + pct / 200 }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
        <span className="font-semibold text-card-foreground">Total Estimated Cost</span>
        <span className="text-lg font-bold text-primary">₹{total.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
};

export default BudgetCard;
