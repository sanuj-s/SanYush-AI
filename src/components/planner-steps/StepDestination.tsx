import { useState, useRef, useEffect } from "react";
import { PlannerState } from "./types";
import { MapPin, Compass, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  state: PlannerState;
  updateState: (s: Partial<PlannerState>) => void;
  onNext: () => void;
}

const POPULAR = ["Goa", "Bali", "Dubai", "Paris", "Tokyo"];

export default function StepDestination({ state, updateState, onNext }: Props) {
  const [dest, setDest] = useState(state.destination || "");
  const [activeMode, setActiveMode] = useState<"known" | "suggest" | null>(state.destinationMode || null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeMode === "known" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeMode]);

  const handleKnown = (destinationToSet = dest) => {
    if (destinationToSet.trim()) {
      updateState({ destinationMode: "known", destination: destinationToSet.trim() });
      setTimeout(onNext, 150);
    }
  };

  const handleSuggest = () => {
    setActiveMode("suggest");
    updateState({ destinationMode: "suggest", destination: "" });
    setTimeout(onNext, 300);
  };

  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-4xl font-extrabold mb-3 tracking-tight">Where to?</h2>
        <p className="text-muted-foreground mb-10 text-lg">Tell us where you want to go, or let AI suggest the perfect spot.</p>
      </motion.div>
      
      <div className="space-y-4">
        {/* Known Destination Option */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div 
            onClick={() => setActiveMode("known")}
            className={`step-card p-6 transition-all \${activeMode === "known" ? 'border-primary ring-1 ring-primary/30' : ''}`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl \${activeMode === "known" ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                <MapPin className="w-6 h-6" />
              </div>
              <div className="text-lg font-bold text-foreground">I know where I want to go</div>
            </div>

            <AnimatePresence>
              {activeMode === "known" && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-3 pt-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={dest}
                      onChange={(e) => setDest(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleKnown(); }}
                      placeholder="e.g. Tokyo, Paris, Bali..."
                      className="flex-1 bg-secondary text-foreground px-5 py-4 rounded-xl outline-none border border-border focus:border-primary/50 text-lg font-medium transition-all"
                    />
                    <button
                      onClick={() => handleKnown()}
                      disabled={!dest.trim()}
                      className="bg-primary text-primary-foreground px-6 rounded-xl font-bold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Popular</div>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR.map(p => (
                        <button
                          key={p}
                          onClick={(e) => { e.stopPropagation(); setDest(p); handleKnown(p); }}
                          className="chip-tag chip-tag-muted hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Suggest based on Budget */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <button
            onClick={handleSuggest}
            className={`w-full text-left step-card p-6 flex items-center justify-between group \${activeMode === "suggest" ? 'step-card-selected' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-colors \${activeMode === "suggest" ? 'bg-primary text-primary-foreground glow-primary' : 'bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">Suggest a destination</div>
                <div className="text-sm text-muted-foreground font-medium mt-1">Based on my budget & vibes</div>
              </div>
            </div>
            <ArrowRight className={`w-6 h-6 transition-colors \${activeMode === "suggest" ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
