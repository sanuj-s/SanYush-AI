import { PlannerState } from "./types";
import { User, Users, UsersRound, Baby } from "lucide-react";

interface Props {
  state: PlannerState;
  updateState: (s: Partial<PlannerState>) => void;
  onNext: () => void;
}

const options = [
  { id: "Solo", label: "Solo", desc: "Just me", icon: User },
  { id: "Couple", label: "Couple", desc: "Romantic getaway", icon: Users },
  { id: "Friends", label: "Friends", desc: "Group trip", icon: UsersRound },
  { id: "Family", label: "Family", desc: "With kids", icon: Baby },
];

export default function StepTravelers({ state, updateState, onNext }: Props) {
  // If intent was Solo, we might have skipped this, but just in case it renders
  return (
    <div className="w-full">
      <h2 className="text-3xl font-extrabold mb-2">Who's going?</h2>
      <p className="text-muted-foreground mb-8 text-lg">Select your travel companions.</p>
      
      <div className="grid grid-cols-2 gap-4">
        {options.map(({ id, label, desc, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              updateState({ travelers: id });
              setTimeout(onNext, 150);
            }}
            className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all \${
              state.travelers === id 
                ? "border-primary bg-primary/10 text-primary scale-[1.02]" 
                : "border-border bg-card/50 text-foreground hover:border-primary/50 hover:bg-secondary/80"
            }`}
          >
            <Icon className="w-8 h-8" />
            <span className="font-bold text-lg">{label}</span>
            <span className="text-xs opacity-70 font-medium text-center">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
