import { PlannerState } from "./types";
import { ArrowRight, Waves, Mountain, Music, Camera, Utensils, ShoppingBag, Trees } from "lucide-react";

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
      <h2 className="text-3xl font-extrabold mb-2">What do you love?</h2>
      <p className="text-muted-foreground mb-8 text-lg">Select all the vibes you want on this trip.</p>
      
      <div className="flex flex-wrap gap-3 mb-10">
        {prefs.map(({ id, icon: Icon }) => {
          const isSelected = state.preferences.includes(id);
          return (
            <button
              key={id}
              onClick={() => togglePref(id)}
              className={\`px-5 py-3 rounded-full border-2 flex items-center gap-2 transition-all font-semibold \${
                isSelected 
                  ? "border-primary bg-primary text-primary-foreground scale-105" 
                  : "border-border bg-card/50 text-foreground hover:border-primary/50"
              }\`}
            >
              <Icon className="w-4 h-4" />
              {id}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={state.preferences.length === 0}
        className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        Generate My Plan <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
