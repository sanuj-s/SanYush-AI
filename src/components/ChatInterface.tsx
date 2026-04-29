import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Download, RotateCcw, Plane, Moon, Sun, Mic, Save, FolderOpen, PieChart as PieChartIcon } from "lucide-react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";

import {
  type Message,
  processMessage,
  getGreetingMessage,
  resetConversation,
} from "@/lib/travel-ai";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#64748b"];

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([getGreetingMessage()]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [isListening, setIsListening] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);

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

  // Load Trips
  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase.from('trips').select('*').order('created_at', { ascending: false });
      if (!error && data) setTrips(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const saveTrip = async () => {
    const name = prompt("Enter a name for this trip:");
    if (!name) return;
    try {
      await supabase.from('trips').insert([{ name, history: messages }]);
      fetchTrips();
    } catch (e) {
      console.error(e);
      alert("Failed to save. Make sure the 'trips' table exists in Supabase.");
    }
  };

  const loadTrip = (trip: any) => {
    if (!trip.history) return;
    const parsed = trip.history.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
    setMessages(parsed);
  };

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
            // Hide the JSON block during streaming
            let cleanText = assistantText.replace(/```json[\s\S]*?(```)?/g, "").trim();
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: cleanText } : m)),
            );
          }
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    // After streaming, parse the JSON block if it exists
    let finalContent = assistantText;
    let budgetCard = undefined;
    let itinerary = undefined;
    const jsonMatch = assistantText.match(/```json\s+([\s\S]+?)\s+```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        budgetCard = parsed.budgetCard;
        itinerary = parsed.itinerary;
        finalContent = assistantText.replace(jsonMatch[0], "").trim();
      } catch (e) {
        console.error("Failed to parse JSON block", e);
      }
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId
          ? { ...m, content: finalContent, budgetCard, itinerary }
          : m
      )
    );
  };

  const handleSend = useCallback((overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!overrideText) setInput("");
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

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev ? prev + " " + transcript : transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleDownload = () => {
    const activePlan = messages.slice().reverse().find(m => m.budgetCard);
    if (!activePlan || !activePlan.budgetCard) {
      alert("No trip plan to export. Generate a plan first!");
      return;
    }

    const doc = new jsPDF();
    const { destination, days, style, total, travel, hotel, food, activities, miscellaneous } = activePlan.budgetCard;

    doc.setFontSize(20);
    doc.text(`AI Travel Plan: ${destination}`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Duration: ${days} days | Style: ${style} | Total Budget: INR ${total.toLocaleString()}`, 14, 30);

    // Budget Table
    (doc as any).autoTable({
      startY: 40,
      head: [['Category', 'Estimated Cost (INR)']],
      body: [
        ['Flights/Travel', travel],
        ['Accommodation', hotel],
        ['Food', food],
        ['Activities', activities],
        ['Miscellaneous', miscellaneous],
      ],
    });

    if (activePlan.itinerary && activePlan.itinerary.length > 0) {
      let startY = (doc as any).lastAutoTable.finalY + 10;
      doc.text("Day-wise Itinerary", 14, startY);
      
      const itineraryBody = activePlan.itinerary.map((day: any) => [
        `Day ${day.day}: ${day.title}`,
        day.activities.join('\n'),
        day.estimatedCost
      ]);

      (doc as any).autoTable({
        startY: startY + 5,
        head: [['Day', 'Activities', 'Cost (INR)']],
        body: itineraryBody,
      });
    }

    doc.save(`travel-plan-${destination.replace(/\s+/g, '-')}.pdf`);
  };

  const quickPrompts = [
    "Plan a 5 day trip to Bhubaneswar",
    "3 days in Tokyo budget trip",
    "Compare Bali vs Bangkok",
    "Trip to Paris under ₹1,00,000",
  ];

  // Pie chart data
  const latestBudgetMsg = messages.slice().reverse().find(m => m.budgetCard);
  const latestBudget = latestBudgetMsg?.budgetCard;
  const pieData = latestBudget ? [
    { name: 'Travel', value: latestBudget.travel },
    { name: 'Hotel', value: latestBudget.hotel },
    { name: 'Food', value: latestBudget.food },
    { name: 'Activities', value: latestBudget.activities },
    { name: 'Misc', value: latestBudget.miscellaneous },
  ] : [];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <PanelGroup direction="horizontal" className="h-full w-full">
        {/* Left Sidebar - History */}
        <Panel defaultSize={20} minSize={15} maxSize={30} className="hidden md:flex flex-col bg-sidebar border-r border-border">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Trip History</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 chat-scrollbar">
            {trips.length === 0 ? (
              <p className="text-xs text-muted-foreground">No saved trips yet.</p>
            ) : (
              trips.map(t => (
                <button
                  key={t.id || t.name}
                  onClick={() => loadTrip(t)}
                  className="w-full text-left p-3 rounded-lg bg-card border border-border hover:bg-muted transition-colors text-sm"
                >
                  <div className="font-medium truncate">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {new Date(t.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-border hidden md:block" />

        {/* Main Chat Area */}
        <Panel className="flex flex-col h-full bg-background relative">
          {/* Header */}
          <header className="travel-gradient text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
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
                onClick={saveTrip}
                className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                title="Save Trip to DB"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                title="Download PDF"
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
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 chat-scrollbar">
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                onChipClick={(text) => handleSend(text)} 
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-card-foreground hover:bg-muted transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-border bg-card shrink-0">
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
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
                onClick={startListening}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  isListening ? "bg-red-500 text-white animate-pulse" : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-full travel-gradient text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-border hidden xl:block" />

        {/* Right Sidebar - Pie Chart */}
        <Panel defaultSize={20} minSize={15} maxSize={30} className="hidden xl:flex flex-col bg-sidebar border-l border-border">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Budget Chart</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center">Generate a trip plan to see the budget breakdown.</p>
            ) : (
              <div className="w-full h-64 flex flex-col items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {latestBudget && (
              <div className="mt-4 w-full bg-muted p-3 rounded-lg text-center shadow-inner">
                <div className="text-xs text-muted-foreground uppercase tracking-widest">Total Estimated</div>
                <div className="text-xl font-bold text-primary">₹{latestBudget.total.toLocaleString()}</div>
              </div>
            )}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default ChatInterface;
