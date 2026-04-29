import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Download, RotateCcw, Plane, Moon, Sun } from "lucide-react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import {
  type Message,
  processMessage,
  getGreetingMessage,
  resetConversation,
  generateDownloadText,
} from "@/lib/travel-ai";

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([getGreetingMessage()]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, isTyping, scrollToBottom]);

  const streamFromGemini = async (history: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/travel-chat`;
    const payload = history.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: payload }),
    });

    if (resp.status === 429) throw new Error("Rate limit exceeded — please wait a moment.");
    if (resp.status === 402) throw new Error("AI credits exhausted. Add credits in Lovable workspace.");
    if (!resp.ok || !resp.body) throw new Error("Failed to reach AI service.");

    const assistantId = Math.random().toString(36).substring(2);
    const assistantMsg: Message = {
      id: assistantId,
      role: "bot",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMsg]);

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantText = "";
    let done = false;

    while (!done) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) break;
      buffer += decoder.decode(value, { stream: true });

      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { done = true; break; }
        try {
          const parsed = JSON.parse(json);
          const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (delta) {
            assistantText += delta;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: assistantText } : m)),
            );
          }
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
  };

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setIsTyping(true);

    streamFromGemini(nextHistory)
      .catch((err) => {
        const fallback = processMessage(text);
        setMessages((prev) => [
          ...prev,
          {
            ...fallback,
            content: `⚠️ ${err.message}\n\nFalling back to local engine:\n\n${fallback.content}`,
          },
        ]);
      })
      .finally(() => setIsTyping(false));
  }, [input, isTyping, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    resetConversation();
    setMessages([getGreetingMessage()]);
    setInput("");
  };

  const handleDownload = () => {
    const text = generateDownloadText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "travel-plan.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickPrompts = [
    "Plan a 5 day trip to Bhubaneswar",
    "3 days in Tokyo budget trip",
    "Compare Bali vs Bangkok",
    "Trip to Paris under ₹1,00,000",
  ];

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      {/* Header */}
      <header className="travel-gradient text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">AI Travel Planner</h1>
            <p className="text-xs opacity-80">Smart budget & itinerary assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
            title="Toggle dark mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
            title="Download trip plan"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
            title="New conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 chat-scrollbar bg-background">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts (show only at start) */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInput(prompt);
                setTimeout(() => {
                  setInput("");
                  const userMsg: Message = {
                    id: Math.random().toString(36).substring(2),
                    role: "user",
                    content: prompt,
                    timestamp: new Date(),
                  };
                  const next = [...messages, userMsg];
                  setMessages(next);
                  setIsTyping(true);
                  streamFromGemini(next)
                    .catch((err) => {
                      const fallback = processMessage(prompt);
                      setMessages((prev) => [
                        ...prev,
                        {
                          ...fallback,
                          content: `⚠️ ${err.message}\n\n${fallback.content}`,
                        },
                      ]);
                    })
                    .finally(() => setIsTyping(false));
                }, 50);
              }}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-card-foreground hover:bg-muted transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a destination, budget, or question..."
            className="flex-1 bg-muted text-foreground placeholder:text-muted-foreground rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-full travel-gradient text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
