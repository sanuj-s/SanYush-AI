import { PlannerState } from "./types";
import { Plane, Mountain, Heart, User, Briefcase, Users } from "lucide-react";

interface Props {
  state: PlannerState;
  updateState: (s: Partial<PlannerState>) => void;
  onNext: () => void;
}

const intents = [
  { id: "Leisure", label: "Leisure & Relax", icon: Plane },
  { id: "Adventure", label: "Adventure", icon: Mountain },
  { id: "Honeymoon", label: "Honeymoon", icon: Heart },
  { id: "Solo", label: "Solo Travel", icon: User },
  { id: "Business", label: "Business Trip", icon: Briefcase },
  { id: "Family", label: "Family Vacay", icon: Users },
];

export default function StepIntent({ state, updateState, onNext }: Props) {
  return (
    <div className="w-full">
      <h2 className="text-3xl font-extrabold mb-2">What's the occasion?</h2>
      <p className="text-muted-foreground mb-8 text-lg">Select the primary reason for your trip.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {intents.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              updateState({ intent: id });
              // If Solo, automatically set travelers to Solo
              if (id === "Solo") updateState({ intent: id, travelers: "Solo" });
              setTimeout(onNext, 150);
            }}
            className={\`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all \${
              state.intent === id 
                ? "border-primary bg-primary/10 text-primary scale-[1.02]" 
                : "border-border bg-card/50 text-foreground hover:border-primary/50 hover:bg-secondary/80"
            }\`}
          >
            <Icon className="w-8 h-8" />
            <span className="font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
