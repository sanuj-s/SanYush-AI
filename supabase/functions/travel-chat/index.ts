// SanYush AI Travel Planner — Gemini Edge Function
// Streams responses from Google Gemini 2.0 Flash via Supabase Edge Functions

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are SanYush AI, a premium travel planning assistant.

CRITICAL FORMATTING RULES — follow these exactly:

1. YOUR TEXT RESPONSE MUST BE EXTREMELY SHORT. Maximum 6-8 lines of text total.
   - Line 1-2: A warm, exciting greeting about the destination (1-2 sentences max).
   - Line 3-4: "Best time to visit" and one unique fun fact (1 line each).
   - Line 5-8: 3-4 quick pro tips as single-line bullets. Nothing more.

2. DO NOT write long paragraphs. DO NOT write day-by-day descriptions in text. DO NOT list budget breakdowns in text. Our app has visual widgets (cards, timelines, charts, maps, photo galleries) that render all of that from the JSON block automatically. Your job is ONLY to write a short, punchy intro and let the JSON do the rest.

3. ALWAYS append a JSON code block at the very end of your response inside \`\`\`json and \`\`\` tags. This JSON populates interactive UI widgets. Structure:
{
  "budgetCard": { "destination": "City Name", "days": number, "style": "budget|midRange|luxury", "travel": number, "hotel": number, "food": number, "activities": number, "miscellaneous": number, "total": number },
  "itinerary": [ { "day": 1, "title": "Short Day Title", "activities": ["Activity 1", "Activity 2", "Activity 3"], "estimatedCost": number } ]
}

4. All costs MUST be in INR (₹). Use realistic Indian pricing.
5. Each itinerary day should have 3-4 short activity strings (under 12 words each).
6. If destination/duration/style is missing, assume 5 days mid-range and state it.
7. For COMPARISONS, keep text to a 3-line summary per destination, then provide JSON for the first one.
8. NEVER repeat budget numbers or itinerary details in the text — the JSON handles that.

EXAMPLE of a good response (notice how short the text is):

"## 🌴 Kerala — God's Own Country!
Get ready for serene backwaters, misty tea gardens, and the freshest seafood you've ever tasted.

**Best time:** Sep–Mar · **Fun fact:** Kerala has 100% literacy rate — the only Indian state!

- 🚂 Trains from TN are cheapest (₹500–1,500)
- 🏡 Book homestays over hotels for authentic experiences
- 🛶 Try a canoe ride instead of a houseboat to save 70%
- 🌶️ Don't miss a traditional Sadya meal on a banana leaf"

Then the JSON block. That's it. Nothing else.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured. Set it in Supabase Dashboard → Edge Functions → Secrets.");
    }

    // Build Gemini-compatible message format
    const geminiContents = [];

    // System instruction is separate in Gemini API
    for (const msg of messages) {
      geminiContents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: geminiContents,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 4096,
          },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ error: "Gemini API error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Transform Gemini SSE stream into OpenAI-compatible SSE stream
    // so the frontend parser doesn't need to change
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") {
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            continue;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) {
              // Re-format as OpenAI-compatible SSE
              const oaiChunk = {
                choices: [{ delta: { content } }],
              };
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify(oaiChunk)}\n\n`),
              );
            }

            // Check if stream is finished
            const finishReason = parsed?.candidates?.[0]?.finishReason;
            if (finishReason && finishReason !== "STOP") {
              // still ok
            }
            if (finishReason === "STOP") {
              controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            }
          } catch {
            // skip unparseable lines
          }
        }
      },
    });

    const transformed = response.body!.pipeThrough(transformStream);

    return new Response(transformed, {
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
