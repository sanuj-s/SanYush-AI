// Lovable AI (Gemini) edge function for the AI Travel Planner
// Streams responses from the Lovable AI Gateway using google/gemini-2.5-flash

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert AI Travel Budget Planner.
You help users plan trips to ANY destination in the world.

When a user asks about a trip, produce a clear, well-structured plan including:
1. **Destination overview** (2-3 lines, vibe + best time to visit)
2. **Estimated total budget in INR** broken down into:
   - Flights / transport
   - Accommodation
   - Food
   - Local transport
   - Sightseeing & activities
   - Misc / shopping buffer
3. **Day-by-day itinerary** (morning / afternoon / evening) for the requested duration
4. **Smart travel tips** (3-5 bullet points: visa, currency, safety, packing, local etiquette)
5. **Money-saving suggestions** specific to that destination

Rules:
- Always give numbers in INR (₹) using Indian formatting (e.g. ₹1,25,000).
- Adapt to travel style: budget / mid-range / luxury.
- If the user asks to COMPARE destinations, return a side-by-side comparison with pros, cons, and approximate budget for each.
- Be concise but information-rich. Use markdown (headings, bold, bullets).
- Never invent flight prices as exact quotes — clearly say "approx".
- If destination/duration/budget is missing, make sensible assumptions and state them.
- IMPORTANT: ALWAYS append a JSON block at the very end of your response inside \`\`\`json and \`\`\` tags. The JSON must have the following structure:
  {
    "budgetCard": { "destination": string, "days": number, "style": string, "travel": number, "hotel": number, "food": number, "activities": number, "miscellaneous": number, "total": number },
    "itinerary": [ { "day": number, "title": string, "activities": [string], "estimatedCost": number } ]
  }
  Do not omit this JSON block if you are generating a trip plan.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "AI credits exhausted. Please add credits to your Lovable workspace.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const txt = await response.text();
      console.error("AI gateway error:", response.status, txt);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("travel-chat error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
