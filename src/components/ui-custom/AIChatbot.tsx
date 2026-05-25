import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

type Message = { role: "user" | "assistant"; text: string };

const INITIAL: Message[] = [
  { role: "assistant", text: "Hi! I can help you find products, check order status, or answer questions about the store." },
];

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Message[]>(INITIAL);
  const [sessionId] = useState(() => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const send = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setHistory((h) => [...h, { role: "assistant", text: data.response }]);
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, send.isPending]);

  const submit = () => {
    const text = input.trim();
    if (!text || send.isPending) return;
    setHistory((h) => [...h, { role: "user", text }]);
    send.mutate({ message: text, sessionId, userId: user?.id });
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-13 h-13 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/25 transition-transform hover:scale-105 active:scale-95"
        style={{ width: 52, height: 52, background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        aria-label="Open chat"
      >
        {open ? <X size={20} className="text-white" /> : <MessageCircle size={20} className="text-white" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-[76px] right-6 z-50 w-80 md:w-[360px] rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
            style={{ background: "rgba(10,14,26,0.97)", backdropFilter: "blur(20px)", maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <Sparkles size={15} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">NexusAI Assistant</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-white/35">Online</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
              {history.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "assistant" ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "bg-white/[0.08]"
                  }`}>
                    {msg.role === "assistant" ? <Bot size={12} className="text-white" /> : <User size={12} className="text-white/70" />}
                  </div>
                  <div className={`max-w-[76%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-white/[0.06] text-white/75 rounded-tl-sm"
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-tr-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {send.isPending && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Bot size={12} className="text-white" />
                  </div>
                  <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-white/[0.06] flex gap-1 items-center">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
                  placeholder="Ask anything…"
                  className="field flex-1 py-2 text-sm"
                />
                <button
                  onClick={submit}
                  disabled={!input.trim() || send.isPending}
                  className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-35"
                >
                  <Send size={15} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
