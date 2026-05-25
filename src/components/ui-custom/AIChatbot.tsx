import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; message: string }[]>([
    { role: "assistant", message: "Hello! I'm NexusAI, your personal shopping assistant. I can help you find products, track orders, provide recommendations, and answer any questions. How can I help you today?" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setChatHistory((prev) => [...prev, { role: "assistant", message: data.response }]);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSend = () => {
    if (!message.trim()) return;

    setChatHistory((prev) => [...prev, { role: "user", message: message.trim() }]);
    chatMutation.mutate({
      message: message.trim(),
      sessionId,
      userId: user?.id,
    });
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <div className="relative">
            <MessageCircle size={24} className="text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0a0e1a]" />
          </div>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] rounded-2xl border border-white/[0.08] shadow-2xl shadow-purple-500/10 overflow-hidden"
            style={{ background: "rgba(12, 16, 30, 0.98)", backdropFilter: "blur(20px)" }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))" }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">NexusAI Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-gray-400">Online</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[360px] overflow-y-auto p-4 space-y-4">
              {chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "assistant"
                      ? "bg-gradient-to-br from-indigo-500 to-purple-500"
                      : "bg-gray-700"
                  }`}>
                    {msg.role === "assistant" ? <Bot size={14} className="text-white" /> : <User size={14} className="text-white" />}
                  </div>
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-white/[0.06] text-gray-200 rounded-tl-sm"
                      : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-tr-sm"
                  }`}>
                    {msg.message}
                  </div>
                </motion.div>
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="px-3.5 py-2.5 rounded-2xl bg-white/[0.06] rounded-tl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white/[0.06] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || chatMutation.isPending}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
