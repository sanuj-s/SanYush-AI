import { useEffect, useRef } from "react";

const TypingIndicator = () => {
  return (
    <div className="flex items-end gap-2 animate-fade-in-up">
      <div className="w-8 h-8 rounded-full travel-gradient flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
        AI
      </div>
      <div className="bg-chat-bot rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
          <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
          <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
