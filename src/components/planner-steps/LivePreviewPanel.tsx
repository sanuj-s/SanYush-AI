import { motion, AnimatePresence } from "framer-motion";
import { PlannerState } from "./types";
import { Plane, Compass, Wallet, Clock, Users, Gem, Check, MapPin } from "lucide-react";

interface Props {
  state: PlannerState;
}

import { PlanningEngine } from "../../lib/planning-engine";

export default function LivePreviewPanel({ state }: Props) {
  // Determine if we have enough data to show a preview
  const hasStarted = state.intent || state.destination || state.budget !== 50000 || state.duration;

  // Calculate live estimate based on what we know so far
  const days = state.duration ? (parseInt(state.duration.split(" ")[0]) || 3) : 3;
  const travelerCount = PlanningEngine.getTravelerCount(state.travelers || "Solo");
  
  // If we have a destination, calculate the real cost. Otherwise, show their max budget multiplied by travelers as a placeholder.
  let liveBudget = state.budget * travelerCount;
  if (state.destination && state.destinationMode === "known") {
    liveBudget = PlanningEngine.calculateEstimatedBudget(
      state.destination, 
      days, 
      travelerCount, 
      state.style || "Balanced", 
      state.budget
    ).total;
  }

  if (!hasStarted) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
          <Compass className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Your Trip Summary</h3>
        <p className="text-muted-foreground">Answer a few questions to see your live preview building up here.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto chat-scrollbar">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Your Journey So Far</h3>

      <div className="space-y-6 flex-1">
        
        {/* Intent Badge */}
        <AnimatePresence>
          {state.intent && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-secondary/50 p-4 rounded-xl border border-border"
            >
              <div className="p-2 bg-primary/20 rounded-lg">
                <Plane className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Trip Type</div>
                <div className="font-bold text-foreground">{state.intent}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Destination */}
        <AnimatePresence>
          {(state.destination || state.destinationMode === "suggest") && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-secondary/50 p-4 rounded-xl border border-border"
            >
              <div className="p-2 bg-accent/20 rounded-lg">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Destination</div>
                <div className="font-bold text-foreground">
                  {state.destinationMode === "suggest" ? "To be decided by AI ✨" : state.destination}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Budget */}
        <motion.div
          layout
          className="bg-card border border-border p-5 rounded-xl shadow-sm relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> Est. Trip Cost
              </div>
            </div>
            <motion.div 
              key={liveBudget}
              initial={{ scale: 1.1, color: "hsl(var(--primary))" }}
              animate={{ scale: 1, color: "hsl(var(--foreground))" }}
              className="text-3xl font-extrabold text-gradient-warm tracking-tight"
            >
              ₹{liveBudget.toLocaleString("en-IN")}
            </motion.div>
          </div>
        </motion.div>

        {/* Details Row */}
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {state.duration && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="chip-tag chip-tag-muted">
                <Clock className="w-3.5 h-3.5" /> {state.duration}
              </motion.div>
            )}
            {state.travelers && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="chip-tag chip-tag-muted">
                <Users className="w-3.5 h-3.5" /> {state.travelers}
              </motion.div>
            )}
            {state.style && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="chip-tag chip-tag-accent">
                <Gem className="w-3.5 h-3.5" /> {state.style}
              </motion.div>
            )}
            {state.dates && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="chip-tag chip-tag-muted">
                {state.dates}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preferences */}
        <AnimatePresence>
          {state.preferences.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Vibes</div>
              <div className="flex flex-wrap gap-2">
                {state.preferences.map(p => (
                  <motion.div key={p} initial={{ scale: 0 }} animate={{ scale: 1 }} className="chip-tag chip-tag-primary">
                    <Check className="w-3 h-3" /> {p}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
