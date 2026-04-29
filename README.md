# SanYush AI — Premium Travel Architect

An AI-powered travel planning app built by **Piyush & Sanuj**.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Framer Motion
- **AI**: Google Gemini 2.0 Flash (via Supabase Edge Function)
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Charts**: Recharts
- **Maps**: React Leaflet + OpenStreetMap
- **Weather**: Open-Meteo API

## Features
- 🗺️ AI-powered trip planning with budgets, itineraries & local insights
- 📊 Interactive budget breakdown with pie charts & currency conversion
- 🗓️ Vertical timeline itineraries
- 📷 Destination photo galleries
- 🎒 Smart packing lists
- 🔗 One-click booking links (Skyscanner, Booking.com, Airbnb)
- 🌤️ Live weather forecasts
- 🗣️ Voice input
- 📄 PDF export
- 💾 Trip history (Supabase)

## Setup

1. Clone the repo
2. `npm install`
3. Create a `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```
4. Set `GEMINI_API_KEY` as a secret in your Supabase Edge Function settings
5. Deploy the edge function: `supabase functions deploy travel-chat --no-verify-jwt`
6. `npm run dev`
