import { useState } from "react";
import { Users, User, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BudgetBreakdown } from "@/lib/travel-ai";

interface BudgetSplitterProps {
  budget: BudgetBreakdown;
}

const modes = [
  { key: "solo", label: "Solo", icon: User, divisor: 1 },
  { key: "couple", label: "Couple", icon: Heart, divisor: 2 },
  { key: "group", label: "Group of 4", icon: Users, divisor: 4 },
] as const;

export default function BudgetSplitter({ budget }: BudgetSplitterProps) {
  const [active, setActive] = useState<string>("solo");
  const divisor = modes.find(m => m.key === active)?.divisor ?? 1;

  const perPerson = Math.round(budget.total / divisor);

  const items = [
    { label: "Travel", value: Math.round(budget.travel / divisor) },
    { label: "Hotel", value: Math.round(budget.hotel / divisor) },
    { label: "Food", value: Math.round(budget.food / divisor) },
    { label: "Activities", value: Math.round(budget.activities / divisor) },
    { label: "Misc", value: Math.round(budget.miscellaneous / divisor) },
  ];

  return (
    <div className="luxury-card-hover rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="label-xs">Budget Splitter</span>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-5 p-1 bg-secondary rounded-lg">
        {modes.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all ${
              active === key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Per Person Total */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="text-center mb-5"
        >
          <span className="label-xs block mb-1">Cost Per Person</span>
          <span className="text-3xl font-extrabold text-gradient-warm">
            ₹{perPerson.toLocaleString("en-IN")}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Breakdown */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active + "-items"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-2"
        >
          {items.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-semibold text-foreground tabular-nums">₹{value.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
