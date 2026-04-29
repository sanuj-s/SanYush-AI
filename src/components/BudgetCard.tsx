import type { BudgetBreakdown } from "@/lib/travel-ai";
import { Plane, Hotel, UtensilsCrossed, Compass, Package } from "lucide-react";

interface BudgetCardProps {
  budget: BudgetBreakdown;
}

const items = [
  { key: "travel" as const, label: "Travel", icon: Plane, color: "text-blue-400" },
  { key: "hotel" as const, label: "Stay", icon: Hotel, color: "text-amber-400" },
  { key: "food" as const, label: "Food", icon: UtensilsCrossed, color: "text-orange-400" },
  { key: "activities" as const, label: "Activities", icon: Compass, color: "text-emerald-400" },
  { key: "miscellaneous" as const, label: "Misc", icon: Package, color: "text-slate-400" },
];

const BudgetCard = ({ budget }: BudgetCardProps) => {
  const total = budget.total;

  return (
    <div className="luxury-card-hover rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="label-xs">Budget Overview</span>
        <span className="ml-auto text-[10px] font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          {budget.days}d · {budget.style === "midRange" ? "Mid" : budget.style === "budget" ? "Budget" : "Luxury"}
        </span>
      </div>

      {/* Total */}
      <div className="mb-5">
        <span className="label-xs block mb-1">Total Estimated</span>
        <span className="text-3xl font-extrabold text-gradient-warm tabular-nums">
          ₹{total.toLocaleString("en-IN")}
        </span>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        {items.map(({ key, label, icon: Icon, color }) => {
          const value = budget[key];
          const pct = Math.round((value / total) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  {label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[10px]">{pct}%</span>
                  <span className="font-semibold text-foreground tabular-nums">₹{value.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-primary/60 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetCard;
