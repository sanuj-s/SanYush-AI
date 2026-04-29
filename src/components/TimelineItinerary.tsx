import type { ItineraryDay } from "@/lib/travel-ai";
import { motion } from "framer-motion";
import { MapPin, Coffee, Camera, Utensils } from "lucide-react";

interface TimelineItineraryProps {
  itinerary: ItineraryDay[];
}

const dayIcons = [MapPin, Coffee, Camera, Utensils, MapPin, Coffee, Camera];

export default function TimelineItinerary({ itinerary }: TimelineItineraryProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-5">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <span className="label-xs">Your Itinerary</span>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-0">
          {itinerary.map((day, idx) => {
            const Icon = dayIcons[idx % dayIcons.length];
            return (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className="relative pl-10 pb-8 last:pb-0 group"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-1 w-[31px] h-[31px] rounded-full bg-card border-2 border-border flex items-center justify-center group-hover:border-primary/60 transition-colors z-10">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                {/* Content */}
                <div className="luxury-card-hover rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">Day {day.day}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-sm font-semibold text-foreground">{day.title}</span>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      ₹{day.estimatedCost.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <ul className="space-y-1.5 mt-3">
                    {day.activities.map((act, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground leading-relaxed">
                        <span className="w-1 h-1 rounded-full bg-primary/40 mt-2 shrink-0" />
                        {act}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
