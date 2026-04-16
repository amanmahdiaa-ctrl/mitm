"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, Sparkles, CircleAlert } from "lucide-react";
import PageShell from "@/components/PageShell";
import type { ChatMessage } from "@/types";

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "مرحباً! أنا مساعدك في الأمن السيبراني 🛡️\n\nيمكنك سؤالي عن أي موضوع يتعلق بأمن المعلومات مثل هجمات MITM، التصيد، ARP Spoofing، DNS Spoofing، التشفير، وغيرها.\n\nأنا مدعوم بالذكاء الاصطناعي وسأجيب على أسئلتك بشكل تفصيلي. كيف يمكنني مساعدتك؟",
  time: "",
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setError(null);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Build conversation history (exclude welcome message)
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "حدث خطأ في الاتصال");
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    "ما هو هجوم MITM؟",
    "كيف أحمي كلمة المرور؟",
    "ما هو التصيد الاحتيالي؟",
    "اشرح لي HTTPS",
  ];

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-2rem)]">
        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 shrink-0"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Bot className="w-8 h-8 text-violet-400" />
            <h1 className="text-3xl font-bold shimmer-text">المساعد الأمني</h1>
          </div>
          <p className="text-gray-500 text-sm">اسأل أي سؤال عن الأمن السيبراني</p>
        </motion.div>

        {/* الرسائل */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 mb-4 px-1 scrollbar-thin"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* الصورة الرمزية */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === "assistant"
                      ? "bg-violet-500/20 text-violet-400"
                      : "bg-cyan-500/20 text-cyan-400"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>

                {/* فقاعة الرسالة */}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "assistant"
                      ? "bg-gray-800/60 border border-gray-700/30 text-gray-300"
                      : "bg-violet-500/15 border border-violet-500/20 text-gray-200"
                  }`}
                >
                  {msg.content}
                  {msg.time && (
                    <div
                      className={`text-[10px] mt-1.5 ${
                        msg.role === "assistant" ? "text-gray-600" : "text-violet-500/50"
                      }`}
                    >
                      {msg.time}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* مؤشر الكتابة */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-gray-800/60 border border-gray-700/30 rounded-2xl px-4 py-3 flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full bg-violet-400"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* اقتراحات سريعة */}
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2 mb-3 justify-center shrink-0"
          >
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInput(s);
                  inputRef.current?.focus();
                }}
                className="px-3 py-1.5 rounded-full text-xs bg-gray-800/60 text-gray-400 border border-gray-700/30 hover:bg-gray-800 hover:text-gray-300 cursor-pointer transition-colors"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}

        {/* رسالة الخطأ */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0 flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
          >
            <CircleAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* حقل الإدخال */}
        <div className="shrink-0 flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="اكتب سؤالك هنا..."
            disabled={isTyping}
            className="flex-1 bg-gray-800/60 border border-gray-700/30 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/40 disabled:opacity-50"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="w-11 h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </PageShell>
  );
}
