import type { ItineraryDay } from "@/lib/travel-ai";
import { CheckCircle2, Navigation, MapPin } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ItineraryCardProps {
  itinerary: ItineraryDay[];
}

const ItineraryCard = ({ itinerary }: ItineraryCardProps) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  return (
    <div className="glass-card rounded-[1.5rem] p-5 mt-2 hover:border-primary/30 transition-all duration-300">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <span className="p-1.5 bg-accent/20 text-accent rounded-lg">
          <Navigation className="w-4 h-4" />
        </span>
        Generated Itinerary
      </h3>
      <div className="space-y-3">
        {itinerary.map((day) => {
          const isExpanded = expandedDay === day.day;
          return (
            <div 
              key={day.day} 
              className={`rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                isExpanded ? "bg-white/10 border border-white/10 shadow-lg" : "bg-black/20 hover:bg-black/40 border border-transparent hover:border-white/5"
              }`}
            >
              <div 
                className="px-4 py-3 flex items-center justify-between"
                onClick={() => setExpandedDay(isExpanded ? null : day.day)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    isExpanded ? "bg-primary text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-black/50 text-white/60"
                  }`}>
                    {day.day}
                  </div>
                  <span className={`font-medium text-sm transition-colors ${isExpanded ? "text-white" : "text-white/70"}`}>
                    {day.title}
                  </span>
                </div>
                <span className="text-xs font-semibold text-white/40">
                  ₹{day.estimatedCost.toLocaleString("en-IN")}
                </span>
              </div>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 pt-1"
                  >
                    <ul className="space-y-3 ml-4 relative">
                      <div className="absolute left-[3px] top-2 bottom-2 w-px bg-white/10" />
                      {day.activities.map((act, i) => (
                        <li key={i} className="flex items-start gap-3 relative z-10 group">
                          <MapPin className="w-3.5 h-3.5 text-primary mt-1 shrink-0 group-hover:scale-125 transition-transform" />
                          <span className="text-sm text-white/80 leading-relaxed group-hover:text-white transition-colors">{act}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItineraryCard;
