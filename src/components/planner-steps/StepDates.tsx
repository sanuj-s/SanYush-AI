import { useState } from "react";
import { PlannerState } from "./types";
import { Calendar, CalendarCheck, CalendarSearch, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  state: PlannerState;
  updateState: (s: Partial<PlannerState>) => void;
  onNext: () => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const options = [
  { id: "Fixed", label: "Fixed Dates", desc: "I know exactly when I'm traveling", icon: CalendarCheck },
  { id: "Flexible", label: "Flexible (±7 days)", desc: "Find the best deals around my dates", icon: Calendar },
  { id: "Month", label: "Anytime in a Month", desc: "e.g. Sometime in October", icon: CalendarSearch },
];

export default function StepDates({ state, updateState, onNext }: Props) {
  const [activeMode, setActiveMode] = useState<string | null>(
    state.dates === "Flexible" || state.dates?.startsWith("Anytime") ? (state.dates.startsWith("Anytime") ? "Month" : state.dates) : state.dates ? "Fixed" : null
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const formatDateRange = (start: string, end: string) => {
    if (!start) return "";
    const s = new Date(start);
    const startStr = s.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    if (!end) return startStr;
    const e = new Date(end);
    const endStr = e.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    return `${startStr} – ${endStr}`;
  };

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
                  if (id === "Flexible") {
                    updateState({ dates: "Flexible" });
                    setTimeout(onNext, 300);
                  }
                }}
                className={`w-full text-left step-card p-6 transition-all ${isSelected ? 'border-primary ring-1 ring-primary/30' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isSelected ? 'bg-primary/20 text-primary glow-primary' : 'bg-secondary text-muted-foreground'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{label}</div>
                    <div className="text-sm text-muted-foreground font-medium">{desc}</div>
                  </div>
                </div>

                {/* Fixed Dates: inline date pickers */}
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
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full bg-secondary text-foreground px-4 py-3 rounded-xl outline-none border border-border focus:border-primary/50 text-sm font-medium transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">End Date</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || new Date().toISOString().split("T")[0]}
                            className="w-full bg-secondary text-foreground px-4 py-3 rounded-xl outline-none border border-border focus:border-primary/50 text-sm font-medium transition-all"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const dateStr = formatDateRange(startDate, endDate) || "Fixed Dates";
                          updateState({ dates: dateStr });
                          onNext();
                        }}
                        disabled={!startDate}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Confirm Dates <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Month picker */}
                <AnimatePresence>
                  {id === "Month" && isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-4 pt-4 border-t border-border/50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                        {MONTHS.map((month) => (
                          <button
                            key={month}
                            onClick={() => setSelectedMonth(month)}
                            className={`py-2.5 px-2 rounded-xl text-sm font-semibold transition-all ${
                              selectedMonth === month
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border"
                            }`}
                          >
                            {month.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          updateState({ dates: `Anytime in ${selectedMonth}` });
                          onNext();
                        }}
                        disabled={!selectedMonth}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Confirm Month <ArrowRight className="w-4 h-4" />
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
