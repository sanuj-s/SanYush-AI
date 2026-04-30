import { PlannerState } from "./types";
import { Wallet, Scale, Gem, Backpack } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  state: PlannerState;
  updateState: (s: Partial<PlannerState>) => void;
  onNext: () => void;
}

const options = [
  { id: "Budget", label: "Budget", desc: "Save money, use hostels & public transit", example: "Hostels, street food, buses", icon: Wallet },
  { id: "Balanced", label: "Balanced", desc: "Comfortable, mix of savings & splurges", example: "3-star hotels, nice cafes, trains", icon: Scale },
  { id: "Luxury", label: "Luxury", desc: "Premium hotels, flights & experiences", example: "5-star resorts, fine dining, flights", icon: Gem },
  { id: "Backpacking", label: "Backpacking", desc: "Adventure, raw local experience", example: "Guesthouses, local buses, trekking", icon: Backpack },
];

export default function StepStyle({ state, updateState, onNext }: Props) {
  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-4xl font-extrabold mb-3 tracking-tight">Travel Style</h2>
        <p className="text-muted-foreground mb-10 text-lg">How do you prefer to travel?</p>
      </motion.div>
      
      <div className="flex flex-col gap-4">
        {options.map(({ id, label, desc, example, icon: Icon }, i) => {
          const isSelected = state.style === id;
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => {
                updateState({ style: id });
                setTimeout(onNext, 300);
              }}
              className={`step-card p-5 flex items-center gap-5 text-left \${isSelected ? 'step-card-selected' : ''}`}
            >
              <div className={`p-4 rounded-xl shrink-0 transition-colors \${isSelected ? 'bg-primary text-primary-foreground glow-primary' : 'bg-secondary text-muted-foreground'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className={`font-bold text-lg transition-colors \${isSelected ? 'text-primary' : 'text-foreground'}`}>{label}</div>
                  <div className="hidden md:block text-xs font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    {example}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground font-medium">{desc}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
