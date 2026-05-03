import { PlannerState } from "./types";
import { ArrowRight, Waves, Mountain, Music, Camera, Utensils, ShoppingBag, Trees, Sparkles, Coffee, Palmtree, Tent } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  state: PlannerState;
  updateState: (s: Partial<PlannerState>) => void;
  onNext: () => void;
}

const prefs = [
  { id: "Beaches", icon: Waves },
  { id: "Mountains", icon: Mountain },
  { id: "Nightlife", icon: Music },
  { id: "Culture", icon: Camera },
  { id: "Food", icon: Utensils },
  { id: "Shopping", icon: ShoppingBag },
  { id: "Nature", icon: Trees },
  { id: "Wellness", icon: Sparkles },
  { id: "Cafes", icon: Coffee },
  { id: "Resorts", icon: Palmtree },
  { id: "Camping", icon: Tent },
];

export default function StepPreferences({ state, updateState, onNext }: Props) {
  const togglePref = (id: string) => {
    const current = state.preferences || [];
    if (current.includes(id)) {
      updateState({ preferences: current.filter((p) => p !== id) });
    } else {
      updateState({ preferences: [...current, id] });
    }
  };

  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-4xl font-extrabold mb-3 tracking-tight">What do you love?</h2>
        <p className="text-muted-foreground mb-10 text-lg">Select all the vibes you want on this trip. (Select at least 1)</p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-3 mb-12"
      >
        {prefs.map(({ id, icon: Icon }) => {
          const isSelected = state.preferences.includes(id);
          return (
            <button
              key={id}
              onClick={() => togglePref(id)}
              className={`px-5 py-3.5 rounded-full border-2 flex items-center gap-2.5 transition-all font-semibold ${
                isSelected 
                  ? "border-primary bg-primary text-primary-foreground scale-105 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]" 
                  : "border-border bg-card/50 text-foreground hover:border-primary/40 hover:bg-secondary/80"
              }`}
            >
              <Icon className="w-4 h-4" />
              {id}
            </button>
          );
        })}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <button
          onClick={onNext}
          disabled={state.preferences.length === 0}
          className="w-full bg-primary text-primary-foreground py-5 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3 disabled:opacity-30 disabled:hover:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
        >
          Generate My Plan <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
