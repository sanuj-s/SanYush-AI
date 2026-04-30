import { useState, useEffect } from "react";
import { PlannerState } from "./types";
import { Wallet, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  state: PlannerState;
  updateState: (s: Partial<PlannerState>) => void;
  onNext: () => void;
}

const PRESETS = [
  { label: "Budget", desc: "₹20k", val: 20000 },
  { label: "Mid-Range", desc: "₹55k", val: 55000 },
  { label: "Luxury", desc: "₹1.2L+", val: 120000 },
];

export default function StepBudget({ state, updateState, onNext }: Props) {
  const [val, setVal] = useState(state.budget || 50000);

  useEffect(() => {
    setVal(state.budget || 50000);
  }, [state.budget]);

  const getBudgetHint = () => {
    if (val < 30000) return "Great for domestic weekend getaways or backpacking.";
    if (val < 80000) return "Perfect for comfortable domestic trips or budget SE Asia.";
    if (val < 150000) return "Opens up premium domestic, Dubai, or standard Europe trips.";
    return "Ultra-premium experiences, long-haul flights, or luxury resorts.";
  };

  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-4xl font-extrabold mb-3 tracking-tight">What's your budget?</h2>
        <p className="text-muted-foreground mb-12 text-lg">Total budget per person (in INR).</p>
      </motion.div>
      
      <div className="space-y-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="text-center"
        >
          <motion.div 
            key={val}
            initial={{ scale: 1.1 }} animate={{ scale: 1 }}
            className="text-6xl font-extrabold text-gradient-warm tabular-nums tracking-tighter mb-4"
          >
            ₹{val.toLocaleString("en-IN")}
          </motion.div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm font-medium text-muted-foreground">
            <Sparkles className="w-4 h-4 text-accent" />
            {getBudgetHint()}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="px-2 mb-10">
            <input
              type="range"
              min="10000"
              max="300000"
              step="5000"
              value={val}
              onChange={(e) => {
                setVal(Number(e.target.value));
                updateState({ budget: Number(e.target.value) });
              }}
              className="w-full budget-slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-4 font-bold tracking-wider uppercase px-1">
              <span>₹10k</span>
              <span>₹3L+</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-10">
            {PRESETS.map((p) => {
              const isActive = Math.abs(val - p.val) < 15000;
              return (
                <button
                  key={p.label}
                  onClick={() => {
                    setVal(p.val);
                    updateState({ budget: p.val });
                  }}
                  className={`py-4 px-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all \${
                    isActive
                      ? "border-primary bg-primary/10 text-primary glow-primary transform -translate-y-1" 
                      : "border-border bg-card/50 text-foreground hover:border-primary/40 hover:bg-secondary"
                  }`}
                >
                  <span className="font-bold">{p.label}</span>
                  <span className="text-xs opacity-70 font-medium">{p.desc}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              updateState({ budget: val });
              onNext();
            }}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
