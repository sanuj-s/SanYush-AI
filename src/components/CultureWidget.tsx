import { Utensils, Globe, Clock, Languages } from "lucide-react";

interface CultureWidgetProps {
  destination: string;
}

// Knowledge base for popular destinations
const cultureData: Record<string, { foods: string[]; tip: string; lang: string; bestTime: string }> = {
  paris: { foods: ["Croissants", "Crêpes", "Coq au Vin"], tip: "Tipping is not mandatory but rounding up is appreciated.", lang: "French", bestTime: "Apr–Jun, Sep–Oct" },
  tokyo: { foods: ["Ramen", "Sushi", "Tempura"], tip: "Bowing is a sign of respect. Never tip at restaurants.", lang: "Japanese", bestTime: "Mar–May, Sep–Nov" },
  bali: { foods: ["Nasi Goreng", "Satay", "Babi Guling"], tip: "Dress modestly when visiting temples.", lang: "Indonesian", bestTime: "Apr–Oct" },
  bangkok: { foods: ["Pad Thai", "Tom Yum", "Mango Sticky Rice"], tip: "Remove shoes before entering homes and temples.", lang: "Thai", bestTime: "Nov–Feb" },
  london: { foods: ["Fish & Chips", "Full English Breakfast", "Afternoon Tea"], tip: "Queue etiquette is taken very seriously.", lang: "English", bestTime: "Jun–Aug" },
  dubai: { foods: ["Shawarma", "Al Harees", "Luqaimat"], tip: "Dress conservatively in public areas.", lang: "Arabic", bestTime: "Nov–Mar" },
  goa: { foods: ["Fish Curry Rice", "Bebinca", "Vindaloo"], tip: "Bargain at local markets but respect the sellers.", lang: "Konkani", bestTime: "Nov–Feb" },
  bhubaneswar: { foods: ["Dalma", "Chhena Poda", "Pakhala Bhata"], tip: "Visit temples early morning to avoid crowds.", lang: "Odia", bestTime: "Oct–Mar" },
  manali: { foods: ["Siddu", "Trout Fish", "Babru"], tip: "Acclimatize for a day before trekking to high altitude.", lang: "Hindi / Pahari", bestTime: "Mar–Jun, Sep–Nov" },
  mumbai: { foods: ["Vada Pav", "Pav Bhaji", "Bhel Puri"], tip: "Use local trains during non-peak hours.", lang: "Marathi / Hindi", bestTime: "Nov–Feb" },
  jaipur: { foods: ["Dal Baati Churma", "Laal Maas", "Ghewar"], tip: "Carry a scarf for sudden temple visits.", lang: "Hindi / Rajasthani", bestTime: "Oct–Mar" },
  singapore: { foods: ["Chili Crab", "Hainanese Chicken Rice", "Laksa"], tip: "Chewing gum is banned; keep the city clean!", lang: "English / Mandarin / Malay / Tamil", bestTime: "Feb–Apr" },
  maldives: { foods: ["Garudhiya", "Mas Huni", "Fihunu Mas"], tip: "Alcohol is only permitted in resorts, not local islands.", lang: "Dhivehi", bestTime: "Nov–Apr" },
  rome: { foods: ["Carbonara", "Supplì", "Gelato"], tip: "Many sites are closed on Mondays.", lang: "Italian", bestTime: "Apr–Jun, Sep–Oct" },
  new_york: { foods: ["NY Pizza", "Bagels", "Cheesecake"], tip: "Tip 18-20% at restaurants.", lang: "English", bestTime: "Apr–Jun, Sep–Nov" },
};

function findCulture(dest: string) {
  const lower = dest.toLowerCase();
  for (const key in cultureData) {
    if (lower.includes(key)) return cultureData[key];
  }
  // Fallback
  return {
    foods: ["Local Street Food", "Regional Cuisine", "Traditional Dessert"],
    tip: "Always carry local currency for small purchases.",
    lang: "Local Language",
    bestTime: "Year-round (check weather)",
  };
}

export default function CultureWidget({ destination }: CultureWidgetProps) {
  const data = findCulture(destination);

  return (
    <div className="luxury-card-hover rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="label-xs">Local Culture & Tips</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Must-Try Foods */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Must-Try Foods</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.foods.map((food) => (
              <span
                key={food}
                className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/10"
              >
                {food}
              </span>
            ))}
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Languages className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Language:</span>
            <span className="text-xs font-semibold text-foreground">{data.lang}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Best Time:</span>
            <span className="text-xs font-semibold text-foreground">{data.bestTime}</span>
          </div>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/10">
        <p className="text-xs text-accent leading-relaxed">
          <span className="font-bold">Pro Tip:</span> {data.tip}
        </p>
      </div>
    </div>
  );
}
