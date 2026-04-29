import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Send, RotateCcw, MapPin, Wallet, Clock, Users, Sparkles, Star, Mountain, Umbrella, Music, Utensils, Briefcase, Backpack } from "lucide-react";
import { PlannerState, initialPlannerState } from "./planner-steps/types";
import OutputScreen from "./planner-steps/OutputScreen";

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  text: string;
  step?: string;
}

const STEPS = ["INTENT", "DESTINATION", "BUDGET", "DURATION", "TRAVELERS", "STYLE", "DATES", "PREFERENCES", "OUTPUT"];

const STEP_LABELS: Record<string, string> = {
  INTENT: "Trip Type",
  DESTINATION: "Destination",
  BUDGET: "Budget",
  DURATION: "Duration",
  TRAVELERS: "Travelers",
  STYLE: "Style",
  DATES: "Dates",
  PREFERENCES: "Interests",
  OUTPUT: "Your Plan",
};

const intentOptions = [
  { label: "Leisure", icon: Umbrella, color: "text-blue-400" },
  { label: "Honeymoon", icon: Star, color: "text-pink-400" },
  { label: "Adventure", icon: Mountain, color: "text-orange-400" },
  { label: "Business", icon: Briefcase, color: "text-slate-400" },
  { label: "Backpacking", icon: Backpack, color: "text-green-400" },
];

const preferenceOptions = [
  { label: "Beaches", icon: Umbrella, color: "text-cyan-400" },
  { label: "Mountains", icon: Mountain, color: "text-green-400" },
  { label: "Nightlife", icon: Music, color: "text-purple-400" },
  { label: "Culture", icon: MapPin, color: "text-amber-400" },
  { label: "Food", icon: Utensils, color: "text-red-400" },
];

export default function ConversationalPlanner() {
  const [state, setState] = useState<PlannerState>(initialPlannerState);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const addMessage = (role: 'ai' | 'user', text: string, step?: string) => {
    setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, role, text, step }]);
  };

  const currentStep = STEPS[currentStepIndex];
  const currentStepDisplayIndex = currentStepIndex;

  useEffect(() => {
    if (messages.length === 0) {
      triggerAiMessage("Hey! I'm your AI travel agent 🌍 What kind of trip are you planning?", "INTENT", 600);
    }
  }, []);

  const triggerAiMessage = (text: string, step: string, delay = 900) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage("ai", text, step);
    }, delay);
  };

  const handleSelection = (key: keyof PlannerState, value: any, userText: string, aiReply: string, nextStep: string) => {
    // Flash the selection into the input bar for the illusion
    setInputValue(userText);
    setTimeout(() => setInputValue(""), 500);

    setState(prev => ({ ...prev, [key]: value }));
    addMessage("user", userText);
    const nextIdx = STEPS.indexOf(nextStep);
    setCurrentStepIndex(nextIdx);

    if (nextStep === "OUTPUT") {
      triggerAiMessage("Perfect — I have everything I need. Building your personalized plan now... ✨", "OUTPUT", 1200);
    } else {
      triggerAiMessage(aiReply, nextStep);
    }
  };

  const renderQuickReplies = () => {
    if (isTyping || currentStep === "OUTPUT") return null;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== "ai" || lastMsg.step !== currentStep) return null;

    if (currentStep === "INTENT") {
      return (
        <div className="flex flex-wrap gap-2 mt-3 pl-11">
          {intentOptions.map(({ label, icon: Icon, color }) => (
            <button key={label}
              onClick={() => handleSelection("intent", label, label, `Great choice! ${label} trips are amazing. Where are you thinking of heading?`, "DESTINATION")}
              className="chip-btn group">
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              {label}
            </button>
          ))}
        </div>
      );
    }

    if (currentStep === "DESTINATION") {
      return (
        <div className="flex flex-col gap-2 mt-3 pl-11">
          <button onClick={() => {
            setState(prev => ({ ...prev, destinationMode: "suggest" }));
            handleSelection("destination", "", "Suggest me something", "Smart move — let me find the best destinations within your budget. What's your total budget for this trip?", "BUDGET");
          }} className="chip-btn group w-fit border-primary/40 bg-primary/5 text-primary hover:bg-primary/10">
            <Sparkles className="w-3.5 h-3.5" /> Suggest me something
          </button>
          <div className="flex flex-wrap gap-2">
            {["Goa", "Dubai", "Bali", "Thailand", "Maldives"].map(dest => (
              <button key={dest}
                onClick={() => {
                  setState(prev => ({ ...prev, destinationMode: "known" }));
                  handleSelection("destination", dest, dest, `${dest} — excellent taste! What's your total budget for this trip?`, "BUDGET");
                }}
                className="chip-btn group">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {dest}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (currentStep === "BUDGET") {
      const budgets = [
        { label: "Under ₹30,000", val: 28000, reply: "Working with a tight budget — challenge accepted! How many days are you planning?" },
        { label: "₹50,000", val: 50000, reply: "₹50k gives you solid options across Southeast Asia and India. How many days?" },
        { label: "₹1,00,000", val: 100000, reply: "Great — that unlocks proper luxury options. How many days are you thinking?" },
        { label: "₹2,00,000+", val: 200000, reply: "Premium tier — we can build something truly special. How long is this trip?" },
      ];
      return (
        <div className="flex flex-col gap-2 mt-3 pl-11">
          {budgets.map(b => (
            <button key={b.label} onClick={() => handleSelection("budget", b.val, b.label, b.reply, "DURATION")} className="chip-btn group w-fit">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" /> {b.label}
            </button>
          ))}
        </div>
      );
    }

    if (currentStep === "DURATION") {
      const durations = ["3 Days", "5 Days", "1 Week", "10 Days", "2 Weeks"];
      return (
        <div className="flex flex-wrap gap-2 mt-3 pl-11">
          {durations.map(d => (
            <button key={d} onClick={() => handleSelection("duration", d, d, `${d} — that's a well-paced trip. Who are you traveling with?`, "TRAVELERS")} className="chip-btn group">
              <Clock className="w-3.5 h-3.5 text-violet-400" /> {d}
            </button>
          ))}
        </div>
      );
    }

    if (currentStep === "TRAVELERS") {
      const travelers = [
        { label: "Solo", emoji: "🧳" },
        { label: "Couple", emoji: "👫" },
        { label: "Family of 4", emoji: "👨‍👩‍👧‍👦" },
        { label: "Group of friends", emoji: "👥" },
      ];
      return (
        <div className="flex flex-wrap gap-2 mt-3 pl-11">
          {travelers.map(({ label, emoji }) => (
            <button key={label} onClick={() => handleSelection("travelers", label, `${emoji} ${label}`, "Noted! What travel style fits you best?", "STYLE")} className="chip-btn group">
              <Users className="w-3.5 h-3.5 text-blue-400" /> {emoji} {label}
            </button>
          ))}
        </div>
      );
    }

    if (currentStep === "STYLE") {
      const styles = [
        { label: "Budget-friendly", desc: "Hostels & street food", color: "text-green-400" },
        { label: "Balanced", desc: "Mid-range comfort", color: "text-blue-400" },
        { label: "Luxury", desc: "Premium hotels", color: "text-amber-400" },
        { label: "Premium Luxury", desc: "5-star everything", color: "text-rose-400" },
      ];
      return (
        <div className="flex flex-col gap-2 mt-3 pl-11">
          {styles.map(s => (
            <button key={s.label} onClick={() => handleSelection("style", s.label, s.label, "Got it. When are you looking to travel?", "DATES")} className="chip-btn group w-fit">
              <span className={`text-xs font-bold ${s.color}`}>■</span>
              <span>{s.label}</span>
              <span className="text-muted-foreground text-xs">— {s.desc}</span>
            </button>
          ))}
        </div>
      );
    }

    if (currentStep === "DATES") {
      const dates = ["Next month", "In 2–3 months", "In 6 months", "Flexible / TBD"];
      return (
        <div className="flex flex-wrap gap-2 mt-3 pl-11">
          {dates.map(d => (
            <button key={d} onClick={() => handleSelection("dates", d, d, "Almost there! Any specific interests or experiences you want on this trip?", "PREFERENCES")} className="chip-btn group">
              {d}
            </button>
          ))}
        </div>
      );
    }

    if (currentStep === "PREFERENCES") {
      return (
        <div className="flex flex-col gap-3 mt-3 pl-11">
          <div className="flex flex-wrap gap-2">
            {preferenceOptions.map(({ label, icon: Icon, color }) => (
              <button key={label} onClick={() => handleSelection("preferences", [label], label, "Perfect — I have everything I need. Building your personalized plan now... ✨", "OUTPUT")} className="chip-btn group">
                <Icon className={`w-3.5 h-3.5 ${color}`} /> {label}
              </button>
            ))}
          </div>
          <button onClick={() => handleSelection("preferences", [], "No specific preference", "Perfect — I have everything I need. Building your personalized plan now... ✨", "OUTPUT")} className="chip-btn group w-fit text-muted-foreground border-dashed text-sm">
            Skip — no preference
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* LEFT PANEL: Chat */}
      <div className={`flex flex-col transition-all duration-700 ease-in-out h-full ${currentStep === "OUTPUT" ? "w-full md:w-[380px] md:min-w-[380px] border-r border-border/60" : "w-full max-w-2xl mx-auto"}`}>

        {/* HEADER */}
        <header className="shrink-0 px-5 py-3 border-b border-border/60 bg-card/40 backdrop-blur-lg flex items-center gap-3 z-10">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-bold tracking-tight">SanYush <span className="text-primary">AI</span></h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold leading-none mt-0.5">AI Travel Planning Assistant</p>
          </div>
          <button onClick={() => window.location.reload()} title="Start over" className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all shrink-0">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </header>

        {/* STEP PROGRESS TRACKER */}
        <div className="shrink-0 px-4 py-2 border-b border-border/40 bg-card/20 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 min-w-max">
            {STEPS.filter(s => s !== "OUTPUT").map((step, i) => {
              const isDone = i < currentStepDisplayIndex;
              const isCurrent = i === currentStepDisplayIndex;
              return (
                <div key={step} className="flex items-center gap-1">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                    isDone ? "bg-primary/20 text-primary border border-primary/30" :
                    isCurrent ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(var(--primary)/0.4)]" :
                    "text-muted-foreground/50 border border-transparent"
                  }`}>
                    {isDone ? "✓" : <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[8px]">{i + 1}</span>}
                    <span className="uppercase tracking-wide">{STEP_LABELS[step]}</span>
                  </div>
                  {i < STEPS.length - 2 && <div className={`w-4 h-px ${i < currentStepDisplayIndex ? "bg-primary/40" : "bg-border/40"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* CHAT MESSAGES */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-5 no-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="flex flex-col gap-1 max-w-[85%]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 pl-11">SanYush AI</span>
                    <div className="flex items-end gap-2">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-card border border-border/60 shadow-sm text-[14px] leading-relaxed text-foreground font-medium">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                )}
                {msg.role === "user" && (
                  <div className="flex flex-col items-end gap-1 max-w-[80%]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 pr-10">You</span>
                    <div className="flex items-end gap-2 flex-row-reverse">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-primary flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl rounded-br-sm bg-primary text-primary-foreground text-[14px] leading-relaxed font-medium shadow-md">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* TYPING INDICATOR */}
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
              <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm bg-card border border-border/60 shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "160ms" }} />
                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "320ms" }} />
              </div>
            </motion.div>
          )}

          {/* QUICK REPLIES */}
          <AnimatePresence>
            {!isTyping && renderQuickReplies() && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                {renderQuickReplies()}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-2" />
        </div>

        {/* PINNED INPUT BAR */}
        <div className="shrink-0 px-4 py-3 border-t border-border/60 bg-card/40 backdrop-blur-lg">
          <div className="flex items-center gap-2 bg-secondary/60 border border-border/60 rounded-xl px-4 py-2.5 focus-within:border-primary/50 focus-within:bg-secondary/80 transition-all">
            <input
              ref={inputRef}
              value={inputValue}
              readOnly
              placeholder="Choose an option above to continue..."
              className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none select-none"
            />
            <button disabled className="w-8 h-8 rounded-lg bg-primary/30 flex items-center justify-center opacity-50 cursor-not-allowed">
              <Send className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/50">Powered by AI Engine v2.0 · Real-time constraints applied</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Output */}
      <AnimatePresence>
        {currentStep === "OUTPUT" && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="hidden md:block flex-1 h-full overflow-y-auto no-scrollbar bg-background"
          >
            <div className="p-8">
              <OutputScreen state={state} onReset={() => window.location.reload()} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .chip-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.8);
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 500;
          color: hsl(var(--foreground));
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          line-height: 1;
        }
        .chip-btn:hover {
          background: hsl(var(--secondary));
          border-color: hsl(var(--primary) / 0.5);
          color: hsl(var(--foreground));
          transform: translateY(-1px);
          box-shadow: 0 4px 12px hsl(var(--primary) / 0.12);
        }
        .chip-btn:active {
          transform: translateY(0);
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
