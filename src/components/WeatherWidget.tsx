import { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, Loader2 } from "lucide-react";

interface WeatherWidgetProps {
  destination: string;
}

interface DailyWeather {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
}

export default function WeatherWidget({ destination }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<DailyWeather | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);
        // Geocoding
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`);
        const geoData = await geoRes.json();
        if (!geoData || geoData.length === 0) {
          setLoading(false);
          return;
        }
        
        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
        
        // Open-Meteo
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`);
        const weatherData = await weatherRes.json();
        
        if (weatherData && weatherData.daily) {
          setWeather(weatherData.daily);
        }
      } catch (e) {
        console.error("Failed to fetch weather", e);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [destination]);

  if (loading) {
    return <div className="animate-pulse bg-muted rounded-xl p-4 mt-2 h-24 flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  if (!weather) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 mt-2 shadow-sm animate-fade-in-up">
      <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
        <Sun className="w-4 h-4 text-travel-gold" />
        7-Day Forecast: {destination}
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2 chat-scrollbar">
        {weather.time.slice(0, 7).map((date, i) => {
          const code = weather.weather_code[i];
          const isRain = code >= 50;
          const isCloud = code >= 1 && code < 50;
          return (
            <div key={date} className="flex flex-col items-center min-w-[70px] p-2 bg-muted/50 rounded-lg shrink-0">
              <span className="text-xs text-muted-foreground">{new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
              <div className="my-1">
                {isRain ? <CloudRain className="w-5 h-5 text-blue-400" /> : isCloud ? <Cloud className="w-5 h-5 text-gray-400" /> : <Sun className="w-5 h-5 text-travel-gold" />}
              </div>
              <div className="text-xs font-semibold">
                {Math.round(weather.temperature_2m_max[i])}° <span className="text-[10px] text-muted-foreground font-normal">{Math.round(weather.temperature_2m_min[i])}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
