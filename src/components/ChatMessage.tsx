import type { Message } from "@/lib/travel-ai";
import BudgetCard from "./BudgetCard";
import ItineraryCard from "./ItineraryCard";
import ComparisonCard from "./ComparisonCard";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  // Simple markdown-ish rendering
  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Bold
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
      return (
        <span key={i}>
          {i > 0 && <br />}
          <span dangerouslySetInnerHTML={{ __html: processed }} />
        </span>
      );
    });
  };

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
      <div className={`max-w-[80%] min-w-0`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-chat-user text-chat-user-foreground rounded-br-md"
              : "bg-chat-bot text-chat-bot-foreground rounded-bl-md"
          }`}
        >
          {renderContent(message.content)}
        </div>
        {message.budgetCard && <BudgetCard budget={message.budgetCard} />}
        {message.itinerary && <ItineraryCard itinerary={message.itinerary} />}
        {message.comparison && <ComparisonCard data={message.comparison} />}
        <span className="text-[10px] text-muted-foreground mt-1 block px-1">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
