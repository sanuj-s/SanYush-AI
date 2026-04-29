import type { BudgetBreakdown } from "@/lib/travel-ai";
import { Plane, Hotel, UtensilsCrossed, Compass, Package } from "lucide-react";

interface BudgetCardProps {
  budget: BudgetBreakdown;
}

const items = [
  { key: "travel" as const, label: "Travel (Flights)", icon: Plane, colorClass: "text-blue-400" },
  { key: "hotel" as const, label: "Accommodation", icon: Hotel, colorClass: "text-amber-400" },
  { key: "food" as const, label: "Food & Dining", icon: UtensilsCrossed, colorClass: "text-orange-400" },
  { key: "activities" as const, label: "Activities", icon: Compass, colorClass: "text-emerald-400" },
  { key: "miscellaneous" as const, label: "Miscellaneous", icon: Package, colorClass: "text-slate-400" },
];

const BudgetCard = ({ budget }: BudgetCardProps) => {
  const total = budget.total;

  return (
    <div className="glass-card rounded-[1.5rem] p-5 mt-2 group hover:border-primary/30 transition-all duration-300">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <span className="p-1.5 bg-primary/20 rounded-lg">
          💰
        </span>
        Budget Breakdown
        <span className="text-xs font-normal text-white/50 bg-black/30 px-2 py-0.5 rounded-full ml-auto">
          {budget.days} days • {budget.style === "midRange" ? "Mid-Range" : budget.style === "budget" ? "Budget" : "Luxury"}
        </span>
      </h3>
      <div className="space-y-3">
        {items.map(({ key, label, icon: Icon, colorClass }) => {
          const value = budget[key];
          const pct = Math.round((value / total) * 100);
          return (
            <div key={key} className="group/item">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="flex items-center gap-2 text-white/80 group-hover/item:text-white transition-colors">
                  <Icon className={`w-4 h-4 ${colorClass}`} />
                  {label}
                </span>
                <span className="font-medium text-white group-hover/item:text-primary transition-colors">₹{value.toLocaleString("en-IN")}</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
        <span className="font-semibold text-white/80">Total Estimated</span>
        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          ₹{total.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
};

export default BudgetCard;
