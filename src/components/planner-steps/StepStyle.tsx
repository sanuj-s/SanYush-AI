import { PlannerState } from "./types";
import { Wallet, Scale, Gem, Backpack } from "lucide-react";

interface Props {
  state: PlannerState;
  updateState: (s: Partial<PlannerState>) => void;
  onNext: () => void;
}

const options = [
  { id: "Budget", label: "Budget", desc: "Save money, use hostels & public transit", icon: Wallet },
  { id: "Balanced", label: "Balanced", desc: "Comfortable, mix of savings & splurges", icon: Scale },
  { id: "Luxury", label: "Luxury", desc: "Premium hotels, flights & experiences", icon: Gem },
  { id: "Backpacking", label: "Backpacking", desc: "Adventure, raw local experience", icon: Backpack },
];

export default function StepStyle({ state, updateState, onNext }: Props) {
  return (
    <div className="w-full">
      <h2 className="text-3xl font-extrabold mb-2">Travel Style</h2>
      <p className="text-muted-foreground mb-8 text-lg">How do you prefer to travel?</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map(({ id, label, desc, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              updateState({ style: id });
              setTimeout(onNext, 150);
            }}
            className={\`p-5 rounded-2xl border-2 flex items-start gap-4 transition-all text-left \${
              state.style === id 
                ? "border-primary bg-primary/10 text-primary scale-[1.02]" 
                : "border-border bg-card/50 text-foreground hover:border-primary/50 hover:bg-secondary/80"
            }\`}
          >
            <div className={\`p-3 rounded-xl shrink-0 \${state.style === id ? "bg-primary/20" : "bg-secondary"}\`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg">{label}</div>
              <div className="text-sm opacity-70 font-medium leading-tight mt-1">{desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
