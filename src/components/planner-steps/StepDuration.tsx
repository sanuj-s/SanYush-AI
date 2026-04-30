import { PlannerState } from "./types";
import { Clock, Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  state: PlannerState;
  updateState: (s: Partial<PlannerState>) => void;
  onNext: () => void;
}

const options = [
  { id: "Weekend", label: "Weekend Break", desc: "2-3 days", icon: Clock },
  { id: "Short", label: "Short Trip", desc: "4-6 days", icon: Calendar },
  { id: "1 week", label: "1 Week", desc: "7-9 days", icon: CalendarDays },
  { id: "2 weeks+", label: "2 Weeks+", desc: "10+ days", icon: CalendarRange },
];

export default function StepDuration({ state, updateState, onNext }: Props) {
  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-4xl font-extrabold mb-3 tracking-tight">How long?</h2>
        <p className="text-muted-foreground mb-10 text-lg">Select the duration of your trip.</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map(({ id, label, desc, icon: Icon }, i) => {
          const isSelected = state.duration === id;
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => {
                updateState({ duration: id });
                setTimeout(onNext, 300);
              }}
              className={`step-card p-6 flex flex-col gap-4 text-left \${isSelected ? 'step-card-selected' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl shrink-0 transition-colors \${isSelected ? 'bg-primary text-primary-foreground glow-primary' : 'bg-secondary text-muted-foreground'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`text-sm font-bold px-3 py-1 rounded-full \${isSelected ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  {desc}
                </div>
              </div>
              <div>
                <div className={`font-bold text-xl mb-1 transition-colors \${isSelected ? 'text-primary' : 'text-foreground'}`}>{label}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
