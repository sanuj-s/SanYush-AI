import { Info } from "lucide-react";
import { PlannerState } from "./types";

interface Props {
  state: PlannerState;
  plan: any;
}

export default function ExplainabilityWidget({ state, plan }: Props) {
  if (!plan?.budgetCard) return null;

  const dest = plan.budgetCard.destination;
  
  // Simple heuristic logic for the explainability text
  let explanation = `Chosen as the best fit for your ₹${state.budget.toLocaleString("en-IN")} budget. `;
  
  if (state.preferences.length > 0) {
    explanation += `${dest} strongly matches your preference for ${state.preferences[0]}. `;
  }
  
  if (state.intent === "Honeymoon") {
    explanation += `It offers excellent romantic experiences while keeping the hotel cost at roughly ${Math.round((plan.budgetCard.hotel / plan.budgetCard.total) * 100)}% of your budget.`;
  } else {
    explanation += `We optimized this ${plan.budgetCard.days}-day ${plan.budgetCard.style.toLowerCase()} itinerary to keep travel costs minimal.`;
  }

  return (
    <div className="w-full bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-4 mt-6">
      <div className="shrink-0 pt-1">
        <Info className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-foreground mb-1">Why this plan?</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {explanation}
        </p>
      </div>
    </div>
  );
}
