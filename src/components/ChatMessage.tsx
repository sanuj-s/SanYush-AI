import type { Message } from "@/lib/travel-ai";
import BudgetCard from "./BudgetCard";
import ItineraryCard from "./ItineraryCard";
import ComparisonCard from "./ComparisonCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import WeatherWidget from "./WeatherWidget";
import MapView from "./MapView";
import PackingList from "./PackingList";
import CurrencyConverter from "./CurrencyConverter";
import BookingLinks from "./BookingLinks";
import { Sparkles, User } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  onChipClick?: (text: string) => void;
}

const ChatMessage = ({ message, onChipClick }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const dest = message.budgetCard?.destination;

  const getChips = () => {
    if (isUser) return [];
    if (message.itinerary) return ["Add a day trip", "Cheaper alternatives", "Food recommendations"];
    if (message.budgetCard) return ["Show itinerary", "Make it cheaper", "Upgrade to luxury"];
    if (message.comparison && message.comparison.destinations.length > 0) return ["Plan for " + message.comparison.destinations[0].name, "Show more details", "Compare with another"];
    return ["Tell me more", "Give me tips", "Best time to visit"];
  };
  const chips = getChips();

  return (
    <div className={`flex items-end gap-3 md:gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
          isUser 
            ? "bg-gradient-to-br from-primary to-accent text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
            : "bg-black/40 border border-white/10 text-primary backdrop-blur-md"
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
      </div>
      
      {/* Bubble Container */}
      <div className={`max-w-[85%] md:max-w-[75%] space-y-3`}>
        <div
          className={`rounded-[1.5rem] px-5 py-4 text-[15px] leading-relaxed overflow-hidden relative shadow-xl backdrop-blur-xl border ${
            isUser
              ? "bg-gradient-to-br from-primary/90 to-blue-600/90 text-white rounded-br-md border-white/20"
              : "bg-black/40 text-white/90 rounded-bl-md border-white/10"
          }`}
        >
          {/* Destination Header Image for AI */}
          {!isUser && dest && (
            <div className="-mx-5 -mt-4 mb-4 h-40 bg-black/50 relative overflow-hidden group">
              <img 
                src={`https://source.unsplash.com/800x400/?travel,${encodeURIComponent(dest)}`} 
                alt={dest} 
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <h3 className="absolute bottom-3 left-4 text-2xl font-black text-white tracking-tight drop-shadow-md">
                {dest}
              </h3>
            </div>
          )}

          <div className={`prose prose-sm max-w-none ${isUser ? "prose-invert" : "dark:prose-invert prose-p:leading-relaxed prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-white"}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        
        {/* Rich Components */}
        {message.budgetCard && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <BudgetCard budget={message.budgetCard} />
            <CurrencyConverter amountInr={message.budgetCard.total} />
          </div>
        )}
        {message.itinerary && <ItineraryCard itinerary={message.itinerary} />}
        {message.comparison && <ComparisonCard data={message.comparison} />}
        
        {!isUser && dest && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <WeatherWidget destination={dest} />
            <MapView destination={dest} />
            <PackingList destination={dest} />
            <BookingLinks destination={dest} />
          </div>
        )}

        {/* Follow up chips */}
        {!isUser && onChipClick && (
          <div className="flex flex-wrap gap-2 pt-2">
            {chips.map(chip => (
              <button 
                key={chip}
                onClick={() => onChipClick(chip)}
                className="text-xs px-4 py-2 rounded-full glass-card text-white hover:bg-white/20 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm border-white/10 font-medium"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
        
        <span className={`text-[10px] text-white/40 block px-2 ${isUser ? "text-right" : "text-left"}`}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
