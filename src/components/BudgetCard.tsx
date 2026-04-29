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
          const value = budget[key] || 0;
          const safeTotal = total || 1;
          const pct = Math.round((value / safeTotal) * 100);

          return (
            <div key={key} className="space-y-2 group">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${color.split(' ')[0]}`} />
                  <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md">{pct}%</span>
                  <span className="font-semibold text-foreground tabular-nums">₹{(value || 0).toLocaleString("en-IN")}</span>
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
