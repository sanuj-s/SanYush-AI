import { useState, useEffect } from "react";
import { PlannerState } from "./types";
import { Wallet, ArrowRight } from "lucide-react";

interface Props {
  state: PlannerState;
  updateState: (s: Partial<PlannerState>) => void;
  onNext: () => void;
}

const PRESETS = [
  { label: "Budget", desc: "₹10k - 30k", val: 20000 },
  { label: "Mid-Range", desc: "₹30k - 80k", val: 55000 },
  { label: "Luxury", desc: "₹80k+", val: 120000 },
];

export default function StepBudget({ state, updateState, onNext }: Props) {
  const [val, setVal] = useState(state.budget || 50000);

  useEffect(() => {
    setVal(state.budget || 50000);
  }, [state.budget]);

  return (
    <div className="w-full">
      <h2 className="text-3xl font-extrabold mb-2">What's your budget?</h2>
      <p className="text-muted-foreground mb-8 text-lg">Total budget per person (in INR).</p>
      
      <div className="space-y-10">
        <div className="text-center">
          <div className="text-5xl font-extrabold text-gradient-warm tabular-nums tracking-tight">
            ₹{val.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="px-2">
          <input
            type="range"
            min="10000"
            max="300000"
            step="5000"
            value={val}
            onChange={(e) => setVal(Number(e.target.value))}
            className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-3 font-medium px-1">
            <span>₹10,000</span>
            <span>₹3,00,000+</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setVal(p.val);
              }}
              className={\`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all \${
                Math.abs(val - p.val) < 15000
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border bg-card/50 text-foreground hover:border-primary/50 hover:bg-secondary/80"
              }\`}
            >
              <span className="font-bold">{p.label}</span>
              <span className="text-xs opacity-70 font-medium">{p.desc}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            updateState({ budget: val });
            onNext();
          }}
          className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-8"
        >
          Continue <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
