import { PlannerState } from "../components/planner-steps/types";
import { PlanningEngine } from "./planning-engine";

export async function generatePlanWithGemini(state: PlannerState, targetDest: string) {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not configured in .env");
  }

  const days = PlanningEngine.getDaysFromDuration(state.duration);
  const dest = targetDest || state.destination || "Unknown Destination";
  const travelerCount = PlanningEngine.getTravelerCount(state.travelers);
  const style = state.style || "Balanced";
  const maxBudget = state.budget || 50000;

  const prompt = `Create a realistic travel budget and itinerary for ${travelerCount} travelers going to ${dest} for ${days} days.
The travel style is "${style}". 
The user's maximum total budget is ${maxBudget} INR. Try to keep the total cost realistic for this style.
If the budget is too low for the style/destination, provide a realistic minimum cost anyway.

CRITICAL INSTRUCTION: Respond ONLY with a valid JSON object in this EXACT format. Do NOT wrap it in markdown block quotes (e.g. \`\`\`json). Just the raw JSON object:
{
  "budgetCard": {
    "destination": "${dest}",
    "days": ${days},
    "style": "${style}",
    "travel": <number in INR for flights/transit>,
    "hotel": <number in INR>,
    "food": <number in INR>,
    "activities": <number in INR>,
    "miscellaneous": <number in INR>,
    "total": <number total INR>
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Short title",
      "activities": ["Activity 1", "Activity 2", "Activity 3"],
      "estimatedCost": <number in INR>
    }
  ],
  "confidenceScore": 95
}`;

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Gemini API error: ${resp.status} ${text}`);
  }

  const data = await resp.json();
  const contentText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!contentText) {
    throw new Error("Invalid response from Gemini API");
  }

  try {
    const cleanText = contentText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanText);
    return parsed;
  } catch (e) {
    console.error("Failed to parse Gemini JSON:", contentText);
    throw new Error("AI returned malformed JSON");
  }
}
