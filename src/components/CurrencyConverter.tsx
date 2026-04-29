import { useState, useEffect } from "react";
import { DollarSign, Euro, PoundSterling, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

interface CurrencyConverterProps {
  amountInr: number;
}

export default function CurrencyConverter({ amountInr }: CurrencyConverterProps) {
  const [rates, setRates] = useState<{ USD: number; EUR: number; GBP: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    setLoading(true);
    try {
      // Using a free open API
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/INR");
      const data = await res.json();
      if (data && data.rates) {
        setRates({
          USD: data.rates.USD,
          EUR: data.rates.EUR,
          GBP: data.rates.GBP,
        });
      }
    } catch (e) {
      console.error("Failed to fetch exchange rates", e);
      // Fallback static rates for demo purposes if API fails
      setRates({ USD: 0.012, EUR: 0.011, GBP: 0.0094 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <div className="glass-card rounded-[1.5rem] p-5 mt-2 group hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <DollarSign className="w-4 h-4" />
          </span>
          Live Currency Match
        </h3>
        <button onClick={fetchRates} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Refresh Rates">
          <RefreshCcw className={`w-3 h-3 text-white/50 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-black/30 p-3 rounded-xl flex flex-col items-center justify-center border border-white/5 hover:border-white/20 transition-all">
          <span className="text-xs text-white/50 mb-1 font-bold tracking-wider">USD</span>
          <span className="text-sm font-semibold text-white">
            {loading || !rates ? "..." : `$${(amountInr * rates.USD).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          </span>
        </div>
        <div className="bg-black/30 p-3 rounded-xl flex flex-col items-center justify-center border border-white/5 hover:border-white/20 transition-all">
          <span className="text-xs text-white/50 mb-1 font-bold tracking-wider">EUR</span>
          <span className="text-sm font-semibold text-white flex items-center">
            {loading || !rates ? "..." : `€${(amountInr * rates.EUR).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          </span>
        </div>
        <div className="bg-black/30 p-3 rounded-xl flex flex-col items-center justify-center border border-white/5 hover:border-white/20 transition-all">
          <span className="text-xs text-white/50 mb-1 font-bold tracking-wider">GBP</span>
          <span className="text-sm font-semibold text-white">
            {loading || !rates ? "..." : `£${(amountInr * rates.GBP).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          </span>
        </div>
      </div>
    </div>
  );
}
