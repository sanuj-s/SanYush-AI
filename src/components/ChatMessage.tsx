import type { Message } from "@/lib/travel-ai";
import BudgetCard from "./BudgetCard";
import ComparisonCard from "./ComparisonCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import WeatherWidget from "./WeatherWidget";
import MapView from "./MapView";
import PackingList from "./PackingList";
import CurrencyConverter from "./CurrencyConverter";
import BookingLinks from "./BookingLinks";
import PhotoGallery from "./PhotoGallery";
import TimelineItinerary from "./TimelineItinerary";
import CultureWidget from "./CultureWidget";
import BudgetSplitter from "./BudgetSplitter";
import { Sparkles } from "lucide-react";

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

  // ── User message: minimal, right-aligned ──
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] bg-primary/10 border border-primary/10 text-foreground rounded-2xl rounded-br-md px-5 py-3 text-sm leading-relaxed">
          {message.content}
          <div className="text-[10px] text-muted-foreground mt-2 text-right">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    );
  }

  // ── AI message: full-width dashboard presentation ──
  const hasPlan = !!(dest || message.budgetCard || message.itinerary);

  return (
    <div className="space-y-0">
      {/* AI indicator */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="label-xs">SanYush AI</span>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* Hero destination image */}
      {dest && (
        <div className="relative rounded-2xl overflow-hidden mb-6 group">
          <img
            src={`https://loremflickr.com/1200/400/${encodeURIComponent(dest)}?random=${dest.length}`}
            alt={dest}
            className="w-full h-48 md:h-56 object-cover group-hover:scale-[1.02] transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">{dest}</h2>
            <p className="text-sm text-white/60 mt-1 font-medium">Your personalized travel plan</p>
          </div>
        </div>
      )}

      {/* Markdown content */}
      <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-p:text-muted-foreground prose-headings:text-foreground prose-headings:font-bold prose-strong:text-foreground prose-a:text-primary prose-li:text-muted-foreground prose-table:text-sm prose-th:text-foreground prose-td:text-muted-foreground">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>

      {/* Rich dashboard widgets — only when a plan exists */}
      {hasPlan && (
        <div className="mt-8 space-y-6">
          {/* Budget Row */}
          {message.budgetCard && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <BudgetCard budget={message.budgetCard} />
                <BudgetSplitter budget={message.budgetCard} />
                <CurrencyConverter amountInr={message.budgetCard.total} />
              </div>
            </>
          )}

          {/* Itinerary Timeline */}
          {message.itinerary && (
            <TimelineItinerary itinerary={message.itinerary} />
          )}

          {/* Destination widgets */}
          {dest && (
            <>
              <PhotoGallery destination={dest} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <CultureWidget destination={dest} />
                <BookingLinks destination={dest} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <WeatherWidget destination={dest} />
                <MapView destination={dest} />
              </div>

              <PackingList destination={dest} />
            </>
          )}
        </div>
      )}

      {/* Follow-up chips */}
      {onChipClick && (
        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border">
          {chips.map(chip => (
            <button
              key={chip}
              onClick={() => onChipClick(chip)}
              className="text-xs px-4 py-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all font-medium border border-border/50"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
