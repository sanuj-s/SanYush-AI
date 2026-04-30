import { PlannerState } from "./types";
import { User, Users, UsersRound, Baby } from "lucide-react";
import { motion } from "framer-motion";

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
  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-4xl font-extrabold mb-3 tracking-tight">Who's going?</h2>
        <p className="text-muted-foreground mb-10 text-lg">Select your travel companions.</p>
      </motion.div>
      
      <div className="grid grid-cols-2 gap-4">
        {options.map(({ id, label, desc, icon: Icon }, i) => {
          const isSelected = state.travelers === id;
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => {
                updateState({ travelers: id });
                setTimeout(onNext, 300);
              }}
              className={`step-card p-6 flex flex-col items-center text-center gap-4 \${isSelected ? 'step-card-selected' : ''}`}
            >
              <div className={`p-4 rounded-full transition-colors \${isSelected ? 'bg-primary text-primary-foreground glow-primary' : 'bg-secondary text-muted-foreground'}`}>
                <Icon className="w-8 h-8" />
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
