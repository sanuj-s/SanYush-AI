import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Download, RotateCcw, Plane, Mic, Save, FolderOpen, PieChart as PieChartIcon, X, Compass } from "lucide-react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isListening, setIsListening] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);

  // Drawer states
  const [showHistory, setShowHistory] = useState(false);
  const [showChart, setShowChart] = useState(false);

  // Force dark mode for premium look
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, isTyping, scrollToBottom]);

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
      alert("Trip saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save. Make sure the 'trips' table exists in Supabase.");
    }
  };

  const loadTrip = (trip: any) => {
    if (!trip.history) return;
    const parsed = trip.history.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
    setMessages(parsed);
    setShowHistory(false);
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

  // Derive dynamic background and chart data
  const latestBudgetMsg = messages.slice().reverse().find(m => m.budgetCard);
  const activeDest = latestBudgetMsg?.budgetCard?.destination;
  const latestBudget = latestBudgetMsg?.budgetCard;
  
  const pieData = latestBudget ? [
    { name: 'Travel', value: latestBudget.travel },
    { name: 'Hotel', value: latestBudget.hotel },
    { name: 'Food', value: latestBudget.food },
    { name: 'Activities', value: latestBudget.activities },
    { name: 'Misc', value: latestBudget.miscellaneous },
  ] : [];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-foreground font-sans">
      
      {/* Immersive Dynamic Background */}
      <AnimatePresence mode="wait">
        {activeDest ? (
          <motion.img 
            key={activeDest}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.3 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            src={`https://source.unsplash.com/1600x900/?travel,${encodeURIComponent(activeDest)}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <motion.div 
            key="gradient"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-black"
          />
        )}
      </AnimatePresence>
      <div className="absolute inset-0 backdrop-blur-[60px] bg-black/40 pointer-events-none" />

      {/* Main Glass Interface */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-2 md:p-6 lg:p-10">
        
        <div className="w-full max-w-6xl h-full flex flex-col glass-panel rounded-[2.5rem] overflow-hidden relative shadow-2xl ring-1 ring-white/10">
          
          {/* Header */}
          <header className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 text-primary rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] ring-1 ring-white/10">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="font-bold text-2xl tracking-tight text-white">SanYush <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">AI</span></h1>
                <p className="text-[10px] text-white/50 font-bold tracking-[0.2em] uppercase mt-0.5">By Piyush & Sanuj</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => setShowHistory(true)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all shadow-sm">
                <FolderOpen className="w-4 h-4" />
              </button>
              <button onClick={() => setShowChart(true)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all shadow-sm">
                <PieChartIcon className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <button onClick={saveTrip} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all shadow-sm" title="Save Trip">
                <Save className="w-4 h-4" />
              </button>
              <button onClick={handleDownload} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all shadow-sm" title="Download PDF">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={handleReset} className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all shadow-sm" title="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 chat-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <ChatMessage 
                    message={msg} 
                    onChipClick={(text) => handleSend(text)} 
                  />
                </motion.div>
              ))}
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex"
                >
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="px-8 pb-4 flex flex-wrap gap-2 justify-center"
            >
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-xs px-4 py-2 rounded-full glass-card hover:bg-white/10 text-white/80 hover:text-white transition-all hover:scale-105 active:scale-95"
                >
                  {prompt}
                </button>
              ))}
            </motion.div>
          )}

          {/* Floating Input Dock */}
          <div className="p-4 md:p-6 shrink-0 bg-gradient-to-t from-black/60 to-transparent">
            <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-2xl rounded-full p-2 flex items-center gap-2 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Where to next?..."
                className="flex-1 bg-transparent text-white placeholder:text-white/40 rounded-full px-6 py-3 text-sm md:text-base outline-none"
                disabled={isTyping}
              />
              <button
                onClick={startListening}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  isListening ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse" : "bg-white/5 hover:bg-white/10 text-white"
                }`}
                title="Voice Input"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center disabled:opacity-40 transition-all shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Side Drawers */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-80 glass-panel z-50 flex flex-col border-r border-white/10"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-bold text-xl text-white">Trip History</h2>
                <button onClick={() => setShowHistory(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-scrollbar">
                {trips.length === 0 ? (
                  <p className="text-sm text-white/50 text-center mt-10">No saved trips yet.</p>
                ) : (
                  trips.map(t => (
                    <button
                      key={t.id || t.name}
                      onClick={() => loadTrip(t)}
                      className="w-full text-left p-4 rounded-2xl glass-card hover:bg-white/10 transition-all text-sm group"
                    >
                      <div className="font-semibold text-white group-hover:text-primary transition-colors">{t.name}</div>
                      <div className="text-[11px] text-white/40 mt-1 uppercase tracking-wider">
                        {new Date(t.created_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}

        {showChart && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setShowChart(false)}
              className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-96 glass-panel z-50 flex flex-col border-l border-white/10"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-bold text-xl text-white">Budget Chart</h2>
                <button onClick={() => setShowChart(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 p-6 flex flex-col items-center justify-center">
                {pieData.length === 0 ? (
                  <p className="text-sm text-white/50 text-center">Generate a trip plan to see the budget breakdown.</p>
                ) : (
                  <>
                    <div className="w-full h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} 
                            itemStyle={{ color: '#fff' }} 
                            formatter={(value: number) => `₹${value.toLocaleString()}`} 
                          />
                          <Legend wrapperStyle={{ fontSize: '13px', color: '#fff' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {latestBudget && (
                      <div className="mt-8 w-full glass-card p-6 rounded-3xl text-center">
                        <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Total Estimated</div>
                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                          ₹{latestBudget.total.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ChatInterface;
