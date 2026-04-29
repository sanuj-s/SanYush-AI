import { PlannerState } from "./types";
import { Clock, Calendar, CalendarDays, CalendarRange } from "lucide-react";

interface Props {
  state: PlannerState;
  updateState: (s: Partial<PlannerState>) => void;
  onNext: () => void;
}

const options = [
  { id: "Weekend", label: "Weekend", desc: "2-3 days", icon: Clock },
  { id: "Short", label: "Short Trip", desc: "4-6 days", icon: Calendar },
  { id: "1 week", label: "1 Week", desc: "7-9 days", icon: CalendarDays },
  { id: "2 weeks+", label: "2 Weeks+", desc: "10+ days", icon: CalendarRange },
];

export default function StepDuration({ state, updateState, onNext }: Props) {
  return (
    <div className="w-full">
      <h2 className="text-3xl font-extrabold mb-2">How long?</h2>
      <p className="text-muted-foreground mb-8 text-lg">Select the duration of your trip.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map(({ id, label, desc, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              updateState({ duration: id });
              setTimeout(onNext, 150);
            }}
            className={`p-6 rounded-2xl border-2 flex items-center gap-4 transition-all text-left \${
              state.duration === id 
                ? "border-primary bg-primary/10 text-primary scale-[1.02]" 
                : "border-border bg-card/50 text-foreground hover:border-primary/50 hover:bg-secondary/80"
            }`}
          >
            <div className={`p-3 rounded-xl \${state.duration === id ? "bg-primary/20" : "bg-secondary"}`}>
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
