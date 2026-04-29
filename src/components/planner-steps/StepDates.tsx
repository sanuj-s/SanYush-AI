import { PlannerState } from "./types";
import { Calendar, CalendarCheck, CalendarSearch } from "lucide-react";

interface Props {
  state: PlannerState;
  updateState: (s: Partial<PlannerState>) => void;
  onNext: () => void;
}

const options = [
  { id: "Fixed", label: "Fixed Dates", desc: "I know exactly when I'm traveling", icon: CalendarCheck },
  { id: "Flexible", label: "Flexible (±7 days)", desc: "Find the best deals around my dates", icon: Calendar },
  { id: "Month", label: "Anytime in a Month", desc: "e.g. Sometime in October", icon: CalendarSearch },
];

export default function StepDates({ state, updateState, onNext }: Props) {
  return (
    <div className="w-full">
      <h2 className="text-3xl font-extrabold mb-2">When are you traveling?</h2>
      <p className="text-muted-foreground mb-8 text-lg">Select your date flexibility.</p>
      
      <div className="space-y-4">
        {options.map(({ id, label, desc, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              updateState({ dates: id });
              setTimeout(onNext, 150);
            }}
            className={\`w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all text-left \${
              state.dates === id 
                ? "border-primary bg-primary/10 text-primary scale-[1.02]" 
                : "border-border bg-card/50 text-foreground hover:border-primary/50 hover:bg-secondary/80"
            }\`}
          >
            <div className={\`p-3 rounded-xl shrink-0 \${state.dates === id ? "bg-primary/20" : "bg-secondary"}\`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg">{label}</div>
              <div className="text-sm opacity-70 font-medium">{desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
