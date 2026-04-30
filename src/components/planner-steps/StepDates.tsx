import { useState } from "react";
import { PlannerState } from "./types";
import { Calendar, CalendarCheck, CalendarSearch, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [activeMode, setActiveMode] = useState<string | null>(
    state.dates === "Flexible" || state.dates === "Month" ? state.dates : state.dates ? "Fixed" : null
  );

  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-4xl font-extrabold mb-3 tracking-tight">When are you traveling?</h2>
        <p className="text-muted-foreground mb-10 text-lg">Select your date flexibility.</p>
      </motion.div>
      
      <div className="space-y-4">
        {options.map(({ id, label, desc, icon: Icon }, i) => {
          const isSelected = activeMode === id;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <button
                onClick={() => {
                  setActiveMode(id);
                  if (id !== "Fixed") {
                    updateState({ dates: id });
                    setTimeout(onNext, 300);
                  }
                }}
                className={`w-full text-left step-card p-6 transition-all \${isSelected ? 'border-primary ring-1 ring-primary/30' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl \${isSelected ? 'bg-primary/20 text-primary glow-primary' : 'bg-secondary text-muted-foreground'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{label}</div>
                    <div className="text-sm text-muted-foreground font-medium">{desc}</div>
                  </div>
                </div>

                {/* Inline Date Picker for Fixed Mode */}
                <AnimatePresence>
                  {id === "Fixed" && isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-4 pt-4 border-t border-border/50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Start Date</label>
                          <input type="date" className="w-full bg-secondary text-foreground px-4 py-3 rounded-xl outline-none border border-border focus:border-primary/50 text-sm font-medium transition-all" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">End Date</label>
                          <input type="date" className="w-full bg-secondary text-foreground px-4 py-3 rounded-xl outline-none border border-border focus:border-primary/50 text-sm font-medium transition-all" />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateState({ dates: "Fixed Dates" });
                          onNext();
                        }}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        Confirm Dates <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
