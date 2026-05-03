import { useState, useEffect, useRef } from "react";

const cache = new Map<string, number>();

/** Clear the AI estimate cache (call on planner reset) */
export function clearAIEstimateCache() {
  cache.clear();
}

export function useAIEstimate(
  destination: string | null,
  days: number,
  travelers: string,
  style: string,
  maxBudget: number,
  fallbackTotal: number
) {
  const [estimate, setEstimate] = useState<number>(fallbackTotal);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Always show the deterministic fallback immediately
    setEstimate(fallbackTotal);

    // Don't call AI if no destination is provided
    if (!destination || !destination.trim()) return;

    // Build a cache key that includes ALL variables
    const cacheKey = `${destination.toLowerCase()}-${days}-${travelers}-${style}-${maxBudget}`;
    if (cache.has(cacheKey)) {
      setEstimate(cache.get(cacheKey)!);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        if (!GEMINI_API_KEY) throw new Error("No API key");

        const prompt = `Estimate the total travel budget in INR for ${travelers} traveling to ${destination} for ${days} days with a ${style} style. The user's max budget is ${maxBudget} INR.
        Respond ONLY with a valid JSON object in this exact format:
        { "total": 125000 }
        Do not include markdown blocks or any other text.`;

        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (!resp.ok) throw new Error("API Error");

        const data = await resp.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const cleanText = text
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();
          try {
            const parsed = JSON.parse(cleanText);
            if (parsed.total && typeof parsed.total === "number") {
              cache.set(cacheKey, parsed.total);
              setEstimate(parsed.total);
            }
          } catch (parseError) {
            console.error("JSON parse error:", text);
          }
        }
      } catch (e) {
        console.error("AI Estimate error:", e);
        // Keep showing the fallback — no action needed
      } finally {
        setLoading(false);
      }
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [destination, days, travelers, style, maxBudget, fallbackTotal]);

  return { estimate, loading };
}
