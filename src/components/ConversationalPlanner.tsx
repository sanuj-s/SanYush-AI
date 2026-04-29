import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Sparkles, Send } from "lucide-react";
import { PlannerState, initialPlannerState } from "./planner-steps/types";
import OutputScreen from "./planner-steps/OutputScreen";

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  text: string;
  step?: string;
}

const STEPS = [
  "INTENT", "DESTINATION", "BUDGET", "DURATION", 
  "TRAVELERS", "STYLE", "DATES", "PREFERENCES", "OUTPUT"
];

export default function ConversationalPlanner() {
  const [state, setState] = useState<PlannerState>(initialPlannerState);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addMessage = (role: 'ai'|'user', text: string, step?: string) => {
    setMessages(prev => [...prev, { id: Math.random().toString(), role, text, step }]);
  };

  const currentStep = STEPS[currentStepIndex];

  // Initiate conversation
  useEffect(() => {
    if (messages.length === 0) {
      triggerAiMessage("Hi! I'm your AI travel agent. What kind of trip are you looking for?", "INTENT");
    }
  }, []);

  const triggerAiMessage = (text: string, step: string, delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      addMessage("ai", text, step);
      setIsTyping(false);
    }, delay);
  };

  const handleSelection = (key: keyof PlannerState, value: any, userText: string, aiReply: string, nextStep: string) => {
    setState(prev => ({ ...prev, [key]: value }));
    addMessage("user", userText);
    
    // Check if we reached OUTPUT
    const nextIdx = STEPS.indexOf(nextStep);
    setCurrentStepIndex(nextIdx);

    if (nextStep === "OUTPUT") {
      triggerAiMessage("Perfect. I'm building your personalized itinerary now...", "OUTPUT", 1000);
    } else {
      triggerAiMessage(aiReply, nextStep);
    }
  };

  // Render quick replies based on current step
  const renderQuickReplies = () => {
    if (isTyping) return null;

    // Only show quick replies if the LAST message is from AI and matches the current step
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== "ai" || lastMsg.step !== currentStep) return null;

    if (currentStep === "INTENT") {
      const options = ["Leisure", "Honeymoon", "Adventure", "Business", "Backpacking"];
      return (
        <div className="flex flex-wrap gap-2 mt-4">
          {options.map(opt => (
            <button key={opt} onClick={() => handleSelection("intent", opt, opt, `Great! ${opt} it is. Where do you want to go?`, "DESTINATION")} className="quick-reply">
              {opt}
            </button>
          ))}
        </div>
      );
    }

    if (currentStep === "DESTINATION") {
      return (
        <div className="flex flex-col gap-3 mt-4 w-full max-w-sm">
          <button onClick={() => {
            setState(prev => ({ ...prev, destinationMode: "suggest" }));
            handleSelection("destination", "", "Please suggest a destination", "Sure! I'll find the best options based on your budget. Speaking of, what's your budget?", "BUDGET");
          }} className="quick-reply text-primary border-primary/50 bg-primary/5">
            ✨ Suggest a destination for me
          </button>
          <div className="flex gap-2">
            {["Goa", "Dubai", "Bali"].map(dest => (
              <button key={dest} onClick={() => {
                setState(prev => ({ ...prev, destinationMode: "known" }));
                handleSelection("destination", dest, dest, `${dest} is amazing! What budget are you planning?`, "BUDGET");
              }} className="quick-reply">{dest}</button>
            ))}
          </div>
        </div>
      );
    }

    if (currentStep === "BUDGET") {
      const options = [
        { label: "Under ₹30,000", val: 30000, reply: "Tight budget, but workable! How many days?" },
        { label: "₹50,000", val: 50000, reply: "Solid budget. How many days?" },
        { label: "₹1,00,000+", val: 100000, reply: "Luxury tier! Excellent. How many days are you planning?" }
      ];
      return (
        <div className="flex flex-col gap-2 mt-4 w-full max-w-sm">
          {options.map(opt => (
            <button key={opt.label} onClick={() => handleSelection("budget", opt.val, opt.label, opt.reply, "DURATION")} className="quick-reply justify-start">
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    if (currentStep === "DURATION") {
      const options = ["3 Days", "5 Days", "1 Week", "10 Days"];
      return (
        <div className="flex flex-wrap gap-2 mt-4">
          {options.map(opt => (
            <button key={opt} onClick={() => handleSelection("duration", opt, opt, `${opt} is perfect. Who are you traveling with?`, "TRAVELERS")} className="quick-reply">
              {opt}
            </button>
          ))}
        </div>
      );
    }

    if (currentStep === "TRAVELERS") {
      const options = ["Solo", "Couple", "Family of 4", "Group of friends"];
      return (
        <div className="flex flex-wrap gap-2 mt-4">
          {options.map(opt => (
            <button key={opt} onClick={() => handleSelection("travelers", opt, opt, "Noted. What travel style do you prefer?", "STYLE")} className="quick-reply">
              {opt}
            </button>
          ))}
        </div>
      );
    }

    if (currentStep === "STYLE") {
      const options = ["Budget-friendly", "Balanced", "Luxury", "Premium Luxury"];
      return (
        <div className="flex flex-wrap gap-2 mt-4">
          {options.map(opt => (
            <button key={opt} onClick={() => handleSelection("style", opt, opt, "Got it. When are you planning to go?", "DATES")} className="quick-reply">
              {opt}
            </button>
          ))}
        </div>
      );
    }

    if (currentStep === "DATES") {
      const options = ["Next month", "In 3 months", "Decide later"];
      return (
        <div className="flex flex-wrap gap-2 mt-4">
          {options.map(opt => (
            <button key={opt} onClick={() => handleSelection("dates", opt, opt, "Almost done! Any specific preferences?", "PREFERENCES")} className="quick-reply">
              {opt}
            </button>
          ))}
        </div>
      );
    }

    if (currentStep === "PREFERENCES") {
      const options = ["Beaches", "Mountains", "Nightlife", "Culture", "Food"];
      return (
        <div className="flex flex-wrap gap-2 mt-4">
          {options.map(opt => (
            <button key={opt} onClick={() => handleSelection("preferences", [opt], opt, "Got everything I need.", "OUTPUT")} className="quick-reply">
              {opt}
            </button>
          ))}
          <button onClick={() => handleSelection("preferences", [], "No specific preference", "Got everything I need.", "OUTPUT")} className="quick-reply border-dashed">
            Skip
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      
      {/* LEFT PANEL: Chat Flow */}
      <div className={`w-full ${currentStep === "OUTPUT" ? 'md:w-1/3 border-r border-border bg-card/20' : 'md:w-full max-w-3xl mx-auto'} h-full flex flex-col transition-all duration-700 ease-in-out`}>
        
        <header className="shrink-0 px-6 py-4 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between z-10">
          <div>
            <h1 className="text-xl font-bold tracking-tight">SanYush <span className="text-primary">AI</span></h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Decision Engine</p>
          </div>
          {currentStep === "OUTPUT" && (
            <button onClick={() => window.location.reload()} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20">
              Start Over
            </button>
          )}
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 chat-scrollbar">
          <div className="space-y-6 max-w-2xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-secondary text-foreground rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>

                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-secondary flex items-center gap-1 rounded-tl-sm">
                    <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div className="pl-11 pr-4">
              {renderQuickReplies()}
            </div>
            
            <div className="h-4" /> {/* Bottom padding */}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Live Output Preview (Only shows when Output reached) */}
      {currentStep === "OUTPUT" && (
        <div className="w-full md:w-2/3 h-full overflow-y-auto chat-scrollbar bg-background">
          <div className="p-6 md:p-8">
            <OutputScreen state={state} onReset={() => window.location.reload()} />
          </div>
        </div>
      )}

      {/* Global CSS for this component */}
      <style dangerouslySetInnerHTML={{__html: `
        .quick-reply {
          padding: 0.5rem 1rem;
          background-color: transparent;
          border: 1px solid var(--border);
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--foreground);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          white-space: nowrap;
        }
        .quick-reply:hover {
          background-color: var(--secondary);
          border-color: var(--foreground);
        }
      `}} />
    </div>
  );
}
