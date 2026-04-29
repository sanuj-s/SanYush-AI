import { useState, useEffect } from "react";
import { CheckSquare, Square, Luggage, Umbrella, Sun, Snowflake } from "lucide-react";
import { motion } from "framer-motion";

interface PackingListProps {
  destination: string;
}

export default function PackingList({ destination }: PackingListProps) {
  const [items, setItems] = useState<{ id: string; text: string; checked: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate smart items based on destination name (simulated logic)
    const baseItems = [
      "Passport & IDs",
      "Travel Insurance",
      "Phone Charger & Adapter",
      "Comfortable Walking Shoes",
      "Toiletries & Meds",
      "Cash & Credit Cards"
    ];

    const destLower = destination.toLowerCase();
    
    if (destLower.includes("beach") || destLower.includes("goa") || destLower.includes("bali") || destLower.includes("maldives")) {
      baseItems.push("Swimwear", "Sunscreen & Sunglasses", "Flip Flops", "Beach Towel");
    } else if (destLower.includes("mountain") || destLower.includes("himalaya") || destLower.includes("manali") || destLower.includes("leh")) {
      baseItems.push("Thermal Wear", "Heavy Jacket", "Trekking Shoes", "Gloves & Beanie");
    } else if (destLower.includes("paris") || destLower.includes("london") || destLower.includes("tokyo")) {
      baseItems.push("Smart Casual Outfits", "Universal Power Adapter", "City Map / Pass");
    } else {
      baseItems.push("Light Jacket", "Daypack", "Water Bottle");
    }

    setItems(baseItems.map((text, i) => ({ id: `item-${i}`, text, checked: false })));
    setLoading(false);
  }, [destination]);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const progress = items.length === 0 ? 0 : Math.round((items.filter(i => i.checked).length / items.length) * 100);

  if (loading) return null;

  return (
    <div className="glass-card rounded-[1.5rem] p-5 mt-2 group hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span className="p-1.5 bg-accent/20 text-accent rounded-lg">
            <Luggage className="w-4 h-4" />
          </span>
          Smart Packing List
        </h3>
        <span className="text-xs font-bold text-white/50 bg-black/30 px-2 py-0.5 rounded-full">
          {progress}% Packed
        </span>
      </div>

      <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto chat-scrollbar pr-2">
        {items.map(item => (
          <motion.div 
            key={item.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleItem(item.id)}
            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
              item.checked ? "bg-white/5" : "hover:bg-white/5"
            }`}
          >
            {item.checked ? (
              <CheckSquare className="w-5 h-5 text-primary shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-white/30 shrink-0" />
            )}
            <span className={`text-sm transition-all ${item.checked ? "text-white/40 line-through" : "text-white/90"}`}>
              {item.text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
