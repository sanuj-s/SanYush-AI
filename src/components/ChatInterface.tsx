import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Download, RotateCcw, Mic, Save, FolderOpen, PieChart as PieChartIcon, X, Compass, BarChart3, Clock } from "lucide-react";
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

const COLORS = ["#c2956a", "#a3c4a3", "#d4a85c", "#7da3b5", "#8a8a8a"];

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([getGreetingMessage()]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

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
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchTrips(); }, []);

  const saveTrip = async () => {
    if (!saveName.trim()) return;
    try {
      await supabase.from('trips').insert([{ name: saveName.trim(), history: messages }]);
      setSaveName("");
      setShowSaveModal(false);
      fetchTrips();
    } catch (e) { console.error(e); }
  };

  const loadTrip = (trip: any) => {
    if (!trip.history) return;
    setMessages(trip.history.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
    setShowHistory(false);
  };

  const streamFromGemini = async (history: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/travel-chat`;
    const payload = history.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

    // Inject formatting instructions as a system-level prefix (clean, non-polluting)
    const systemNote = `\n\n[SYSTEM: Respond concisely. Max 3-5 lines of text. Output a single \`\`\`json block for any plan data. Do NOT repeat plan data in text.]`;
    if (payload.length > 0 && payload[payload.length - 1].role === "user") {
      payload[payload.length - 1].content += systemNote;
    }

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: payload }),
    });

    if (resp.status === 429) throw new Error("Rate limit exceeded — please wait.");
    if (resp.status === 402) throw new Error("AI credits exhausted.");
    if (!resp.ok || !resp.body) throw new Error("Failed to reach AI service.");

    const assistantId = Math.random().toString(36).substring(2);
    const assistantMsg: Message = { id: assistantId, role: "bot", content: "", timestamp: new Date() };
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
            setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: cleanText } : m)));
          }
        } catch { buffer = line + "\n" + buffer; break; }
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
      } catch (e) { console.error("Failed to parse JSON block", e); }
    }

    setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: finalContent, budgetCard, itinerary } : m));
  };

  const handleSend = useCallback((overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || isTyping) return;

    const userMsg: Message = { id: Math.random().toString(36).substring(2), role: "user", content: text, timestamp: new Date() };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!overrideText) setInput("");
    setIsTyping(true);

    streamFromGemini(nextHistory)
      .catch((err) => {
        const fallback = processMessage(text);
        setMessages((prev) => [...prev, { ...fallback, content: `⚠️ ${err.message}\n\n${fallback.content}` }]);
      })
      .finally(() => setIsTyping(false));
  }, [input, isTyping, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleReset = () => { resetConversation(); setMessages([getGreetingMessage()]); setInput(""); };

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Voice input not supported."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => { setInput((prev) => prev ? prev + " " + event.results[0][0].transcript : event.results[0][0].transcript); };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleDownload = () => {
    const plan = messages.slice().reverse().find(m => m.budgetCard);
    if (!plan?.budgetCard) { alert("No plan to export yet."); return; }
    const doc = new jsPDF();
    const b = plan.budgetCard;
    doc.setFontSize(20); doc.text(`Travel Plan: ${b.destination}`, 14, 22);
    doc.setFontSize(11); doc.text(`${b.days} days · ${b.style} · ₹${b.total.toLocaleString()}`, 14, 30);
    (doc as any).autoTable({ startY: 38, head: [['Category', 'Cost (₹)']], body: [['Travel', b.travel], ['Hotel', b.hotel], ['Food', b.food], ['Activities', b.activities], ['Misc', b.miscellaneous]] });
    if (plan.itinerary?.length) {
      const sy = (doc as any).lastAutoTable.finalY + 10;
      doc.text("Itinerary", 14, sy);
      (doc as any).autoTable({ startY: sy + 5, head: [['Day', 'Activities', '₹']], body: plan.itinerary.map((d: any) => [`Day ${d.day}: ${d.title}`, d.activities.join(', '), d.estimatedCost]) });
    }
    doc.save(`${b.destination.replace(/\s+/g, '-')}-plan.pdf`);
  };

  const quickPrompts = [
    "Plan 5 days in Bhubaneswar",
    "Budget trip to Tokyo",
    "Compare Bali vs Bangkok",
    "Paris under ₹1,00,000",
  ];

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
    <div className="relative w-screen h-screen overflow-hidden bg-background flex flex-col">

      {/* ── Top Navigation Bar ── */}
      <header className="shrink-0 border-b border-border bg-card/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground tracking-tight leading-none">
              SanYush <span className="text-gradient-warm">AI</span>
            </h1>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mt-0.5">By Piyush & Sanuj</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowHistory(true)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="History">
            <Clock className="w-4 h-4" />
          </button>
          <button onClick={() => setShowChart(true)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Analytics">
            <BarChart3 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button onClick={() => setShowSaveModal(true)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Save">
            <Save className="w-4 h-4" />
          </button>
          <button onClick={handleDownload} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Export PDF">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={handleReset} className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors" title="Reset">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-y-auto chat-scrollbar">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-10">

          {/* Welcome state */}
          {messages.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16 md:py-24"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Compass className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-3">
                Where to next?
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
                Plan complete trips with AI-powered budgets, itineraries, bookings, and local insights.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-8">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="text-sm px-5 py-2.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all font-medium"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence initial={false}>
            {messages.slice(messages.length <= 1 ? 0 : 0).map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <ChatMessage message={msg} onChipClick={(text) => handleSend(text)} />
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TypingIndicator />
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-6" />
        </div>
      </div>

      {/* ── Bottom Input Bar ── */}
      <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <div className="flex-1 flex items-center bg-secondary rounded-xl px-4 py-2.5 gap-2 focus-within:ring-1 focus-within:ring-primary/30 transition-all">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any destination, budget, or itinerary..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
              disabled={isTyping}
            />
            <button
              onClick={startListening}
              className={`p-1.5 rounded-lg transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : "hover:bg-card text-muted-foreground hover:text-foreground"}`}
              title="Voice"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-opacity shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── History Drawer ── */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed left-0 top-0 bottom-0 w-80 bg-card border-r border-border z-50 flex flex-col">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-foreground">Trip History</h2>
                <button onClick={() => setShowHistory(false)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 chat-scrollbar">
                {trips.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center mt-10">No saved trips.</p>
                ) : (
                  trips.map(t => (
                    <button key={t.id || t.name} onClick={() => loadTrip(t)} className="w-full text-left p-3 rounded-xl hover:bg-secondary transition-colors group">
                      <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{new Date(t.created_at).toLocaleDateString()}</div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Analytics Drawer ── */}
      <AnimatePresence>
        {showChart && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowChart(false)} className="fixed inset-0 bg-black/50 z-40" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 bottom-0 w-96 bg-card border-l border-border z-50 flex flex-col">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-foreground">Budget Analytics</h2>
                <button onClick={() => setShowChart(false)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="flex-1 p-6 flex flex-col items-center justify-center">
                {pieData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">Plan a trip to see analytics.</p>
                ) : (
                  <>
                    <div className="w-full h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 14%)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} formatter={(value: number) => `₹${value.toLocaleString()}`} />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {latestBudget && (
                      <div className="mt-6 w-full luxury-card rounded-xl p-5 text-center">
                        <span className="label-xs block mb-1">Total Budget</span>
                        <span className="text-3xl font-extrabold text-gradient-warm">₹{latestBudget.total.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Save Trip Modal ── */}
      <AnimatePresence>
        {showSaveModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSaveModal(false)} className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", damping: 22, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-card border border-border rounded-2xl p-6 z-50 shadow-2xl">
              <h3 className="font-bold text-foreground text-base mb-1">Save this trip</h3>
              <p className="text-sm text-muted-foreground mb-4">Give this plan a name to find it later.</p>
              <input
                autoFocus
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveTrip()}
                placeholder="e.g. Goa trip July 2025"
                className="w-full bg-secondary text-foreground text-sm px-4 py-2.5 rounded-xl outline-none border border-border focus:border-primary/50 transition-all mb-3"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowSaveModal(false)} className="flex-1 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
                  Cancel
                </button>
                <button onClick={saveTrip} disabled={!saveName.trim()} className="flex-1 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40">
                  Save
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInterface;
