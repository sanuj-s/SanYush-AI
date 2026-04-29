import { useState, useEffect } from "react";
import { PlannerState } from "./types";
import { Loader2, RefreshCcw, Home } from "lucide-react";
import BudgetCard from "../BudgetCard";
import BudgetSplitter from "../BudgetSplitter";
import CurrencyConverter from "../CurrencyConverter";
import TimelineItinerary from "../TimelineItinerary";
import PhotoGallery from "../PhotoGallery";
import CultureWidget from "../CultureWidget";
import BookingLinks from "../BookingLinks";
import WeatherWidget from "../WeatherWidget";
import MapView from "../MapView";
import PackingList from "../PackingList";

interface Props {
  state: PlannerState;
  onReset: () => void;
}

export default function OutputScreen({ state, onReset }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<any | null>(null);

  useEffect(() => {
    generatePlan();
  }, []);

  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing VITE_GEMINI_API_KEY in environment variables.");
      }

      const destText = state.destinationMode === "known" ? \`Destination: \${state.destination}\` : "Destination: Please suggest a destination based on budget and preferences.";

      const prompt = \`
You are a master travel planner. I need a highly structured JSON plan based on the following exact constraints.
DO NOT output any markdown blocks, only pure JSON.

Constraints:
- Intent: \${state.intent}
- \${destText}
- Budget: ₹\${state.budget} total (must be strictly respected)
- Duration: \${state.duration}
- Travelers: \${state.travelers}
- Style: \${state.style}
- Dates: \${state.dates}
- Preferences: \${state.preferences.join(", ")}

Output EXACTLY this JSON structure:
{
  "budgetCard": {
    "destination": "Name of the destination you chose or was given",
    "days": <number of days based on duration>,
    "style": "\${state.style}",
    "travel": <number>,
    "hotel": <number>,
    "food": <number>,
    "activities": <number>,
    "miscellaneous": <number>,
    "total": <number matching the budget as closely as possible>
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Short catchy title",
      "activities": ["Activity 1", "Activity 2"],
      "estimatedCost": <number>
    }
  ]
}
\`;

      const res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${apiKey}\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          }
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch plan from AI.");

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) throw new Error("Empty response from AI.");

      const parsed = JSON.parse(text);
      setPlan(parsed);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <Loader2 className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground">Crafting your perfect trip...</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Analyzing {state.destinationMode === "known" ? state.destination : "destinations"} for {state.travelers} within ₹{state.budget.toLocaleString("en-IN")}.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-xl font-bold">Plan Generation Failed</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">{error}</p>
        <button onClick={generatePlan} className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold flex items-center gap-2 mx-auto">
          <RefreshCcw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  const dest = plan?.budgetCard?.destination;

  return (
    <div className="w-full pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground">Your Plan is Ready!</h2>
          <p className="text-muted-foreground">Tailored for {state.intent} in {dest}.</p>
        </div>
        <button onClick={onReset} className="p-3 bg-secondary rounded-full hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground" title="Start Over">
          <Home className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-8">
        {/* Budget Row */}
        {plan?.budgetCard && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BudgetCard budget={plan.budgetCard} />
            <BudgetSplitter budget={plan.budgetCard} />
            <CurrencyConverter amountInr={plan.budgetCard.total} />
          </div>
        )}

        {/* Itinerary Timeline */}
        {plan?.itinerary && (
          <TimelineItinerary itinerary={plan.itinerary} />
        )}

        {/* Destination widgets */}
        {dest && (
          <>
            <PhotoGallery destination={dest} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <CultureWidget destination={dest} />
              <BookingLinks destination={dest} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <WeatherWidget destination={dest} />
              <MapView destination={dest} />
            </div>

            <PackingList destination={dest} />
          </>
        )}
      </div>
    </div>
  );
}
