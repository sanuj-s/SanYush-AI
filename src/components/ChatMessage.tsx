import type { Message } from "@/lib/travel-ai";
import BudgetCard from "./BudgetCard";
import ItineraryCard from "./ItineraryCard";
import ComparisonCard from "./ComparisonCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import WeatherWidget from "./WeatherWidget";
import MapView from "./MapView";

interface ChatMessageProps {
  message: Message;
  onChipClick?: (text: string) => void;
}

const ChatMessage = ({ message, onChipClick }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const dest = message.budgetCard?.destination;

  // Generate chips dynamically based on content
  const getChips = () => {
    if (isUser) return [];
    if (message.itinerary) return ["Add a day trip", "Cheaper alternatives", "Food recommendations"];
    if (message.budgetCard) return ["Show itinerary", "Make it cheaper", "Upgrade to luxury"];
    if (message.comparison && message.comparison.destinations.length > 0) return ["Plan for " + message.comparison.destinations[0].name, "Show more details", "Compare with another"];
    return ["Tell me more", "Give me tips", "Best time to visit"];
  };
  const chips = getChips();

  return (
    <div className={`flex items-end gap-2 animate-fade-in-up ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
          isUser ? "bg-primary text-primary-foreground" : "travel-gradient text-primary-foreground"
        }`}
      >
        {isUser ? "You" : "AI"}
      </div>
      {/* Bubble */}
      <div className={`max-w-[80%] min-w-0 space-y-2`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed overflow-hidden ${
            isUser
              ? "bg-chat-user text-chat-user-foreground rounded-br-md"
              : "bg-chat-bot text-chat-bot-foreground rounded-bl-md"
          }`}
        >
          {!isUser && dest && (
            <div className="-mx-4 -mt-3 mb-3 h-32 bg-muted relative overflow-hidden">
              <img src={`https://source.unsplash.com/800x300/?travel,${encodeURIComponent(dest)}`} alt={dest} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        
        {message.budgetCard && <BudgetCard budget={message.budgetCard} />}
        {message.itinerary && <ItineraryCard itinerary={message.itinerary} />}
        {message.comparison && <ComparisonCard data={message.comparison} />}
        
        {!isUser && dest && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            <WeatherWidget destination={dest} />
            <MapView destination={dest} />
          </div>
        )}

        {/* Follow up chips */}
        {!isUser && onChipClick && (
          <div className="flex flex-wrap gap-2 mt-2">
            {chips.map(chip => (
              <button 
                key={chip}
                onClick={() => onChipClick(chip)}
                className="text-xs px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
        
        <span className="text-[10px] text-muted-foreground mt-1 block px-1 text-right">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
