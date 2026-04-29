import { useState } from "react";
import { PlannerState } from "./types";
import { MapPin, Compass, ArrowRight } from "lucide-react";

interface Props {
  state: PlannerState;
  updateState: (s: Partial<PlannerState>) => void;
  onNext: () => void;
}

export default function StepDestination({ state, updateState, onNext }: Props) {
  const [dest, setDest] = useState(state.destination || "");

  const handleKnown = () => {
    if (dest.trim()) {
      updateState({ destinationMode: "known", destination: dest.trim() });
      onNext();
    }
  };

  const handleSuggest = () => {
    updateState({ destinationMode: "suggest", destination: "" });
    onNext();
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-extrabold mb-2">Where to?</h2>
      <p className="text-muted-foreground mb-8 text-lg">Tell us where you want to go, or let us suggest based on your budget.</p>
      
      <div className="space-y-6">
        {/* Known Destination */}
        <div className="bg-card/50 border border-border p-6 rounded-2xl relative focus-within:ring-2 focus-within:ring-primary/50 transition-all">
          <label className="text-sm font-semibold flex items-center gap-2 mb-4 text-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            I know where I want to go
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleKnown(); }}
              placeholder="e.g. Tokyo, Paris, Bali..."
              className="flex-1 bg-secondary text-foreground px-4 py-3 rounded-xl outline-none"
            />
            <button
              onClick={handleKnown}
              disabled={!dest.trim()}
              className="bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground text-sm font-medium">
          <div className="flex-1 h-px bg-border" />
          OR
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Suggest based on Budget */}
        <button
          onClick={handleSuggest}
          className="w-full bg-card/50 border border-border hover:border-primary/50 hover:bg-secondary/80 p-6 rounded-2xl flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Compass className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">Suggest a destination</div>
              <div className="text-sm text-muted-foreground">Based on my upcoming budget & preferences</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>
    </div>
  );
}
