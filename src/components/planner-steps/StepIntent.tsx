import { PlannerState } from "./types";
import { Plane, Mountain, Heart, User, Briefcase, Users } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  state: PlannerState;
  updateState: (s: Partial<PlannerState>) => void;
  onNext: () => void;
}

const intents = [
  { id: "Leisure", label: "Leisure & Relax", desc: "Unwind and recharge", icon: Plane },
  { id: "Adventure", label: "Adventure", desc: "Thrill and exploration", icon: Mountain },
  { id: "Honeymoon", label: "Honeymoon", desc: "Romantic getaway", icon: Heart },
  { id: "Solo", label: "Solo Travel", desc: "Discover yourself", icon: User },
  { id: "Business", label: "Business Trip", desc: "Work and play", icon: Briefcase },
  { id: "Family", label: "Family Vacay", desc: "Memories together", icon: Users },
];

export default function StepIntent({ state, updateState, onNext }: Props) {
  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-4xl font-extrabold mb-3 tracking-tight">What's the occasion?</h2>
        <p className="text-muted-foreground mb-10 text-lg">Select the primary reason for your trip.</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {intents.map(({ id, label, desc, icon: Icon }, i) => {
          const isSelected = state.intent === id;
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => {
                updateState({ intent: id });
                if (id === "Solo") updateState({ intent: id, travelers: "Solo" });
                setTimeout(onNext, 300);
              }}
              className={`step-card p-6 flex items-start gap-5 text-left \${isSelected ? 'step-card-selected' : ''}`}
            >
              <div className={`p-4 rounded-xl shrink-0 transition-colors \${isSelected ? 'bg-primary text-primary-foreground glow-primary' : 'bg-secondary text-muted-foreground'}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <div className={`font-bold text-xl mb-1 transition-colors \${isSelected ? 'text-primary' : 'text-foreground'}`}>{label}</div>
                <div className="text-sm text-muted-foreground font-medium">{desc}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
