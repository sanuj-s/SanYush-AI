import type { ItineraryDay } from "@/lib/travel-ai";
import { MapPin } from "lucide-react";

interface ItineraryCardProps {
  itinerary: ItineraryDay[];
}

const ItineraryCard = ({ itinerary }: ItineraryCardProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 mt-2 animate-fade-in-up shadow-sm">
      <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
        📅 Day-wise Itinerary
      </h3>
      <div className="space-y-3">
        {itinerary.map((day) => (
          <div key={day.day} className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm text-primary flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Day {day.day}: {day.title}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                ~₹{day.estimatedCost.toLocaleString("en-IN")}
              </span>
            </div>
            <ul className="space-y-1">
              {day.activities.map((act, i) => (
                <li key={i} className="text-sm text-muted-foreground pl-2">
                  {act}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryCard;
