"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skull, AlertTriangle, Lock, Terminal, Eye } from "lucide-react";
import type { LoginData, SimulationPhase, Protocol } from "@/types";

interface AttackerPanelProps {
  phase: SimulationPhase;
  interceptedData: LoginData | null;
  protocol: Protocol;
}

// تأثير الكتابة التدريجية
function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 60);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-1.5 h-4 bg-red-400 mr-0.5 align-middle"
        />
      )}
    </span>
  );
}

export default function AttackerPanel({
  phase,
  interceptedData,
  protocol,
}: AttackerPanelProps) {
  const isSecure = protocol === "https";
  const isIntercepting = phase === "intercepting" || phase === "delivering" || phase === "complete";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`
        relative rounded-2xl p-6 border backdrop-blur-xl
        ${isSecure
          ? "bg-gray-900/30 border-gray-600/30"
          : "bg-red-950/30 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
        }
        transition-all duration-500
        ${phase === "intercepting" && !isSecure
          ? "ring-2 ring-red-400 ring-offset-2 ring-offset-gray-950 animate-pulse"
          : ""
        }
      `}
    >
      {/* رأس البطاقة */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isSecure ? "bg-gray-700/30" : "bg-red-500/20"
          }`}
        >
          <Skull
            className={`w-6 h-6 ${isSecure ? "text-gray-500" : "text-red-400"}`}
          />
        </div>
        <div>
          <h2
            className={`text-xl font-bold ${
              isSecure ? "text-gray-500" : "text-red-400"
            }`}
          >
            المهاجم
          </h2>
          <p className="text-xs text-gray-500">الرجل في المنتصف</p>
        </div>
        <div className="mr-auto">
          <Eye
            className={`w-5 h-5 ${
              isSecure ? "text-gray-600" : "text-red-500/50"
            }`}
          />
        </div>
      </div>

      {/* محتوى الاعتراض */}
      <div
        className={`rounded-xl p-4 font-mono text-sm ${
          isSecure
            ? "bg-gray-900/50 border border-gray-700/30"
            : "bg-black/50 border border-red-900/50"
        }`}
      >
        {/* شريط طرفية المهاجم */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-800">
          <Terminal className="w-4 h-4 text-gray-500" />
          <span className="text-gray-500 text-xs">
            interceptor@mitm:~$
          </span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="w-2 h-4 bg-green-400 inline-block"
          />
        </div>

        <AnimatePresence mode="wait">
          {!isIntercepting ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-600 text-center py-4"
            >
              <p>في انتظار البيانات...</p>
              <p className="text-xs mt-1">listening on port 8080</p>
            </motion.div>
          ) : isSecure ? (
            <motion.div
              key="encrypted"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <Lock className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-400 font-bold mb-1">البيانات مشفرة!</p>
              <div className="bg-green-900/20 rounded-lg p-3 mt-2 border border-green-500/20">
                <p className="text-green-500/70 text-xs break-all leading-relaxed" dir="ltr">
                  TLS 1.3 Encrypted
                  <br />
                  {`{data: "x7&$kL9#mP2@...", iv: "a3f8..."}`}
                </p>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                لا يمكن فك التشفير بدون المفتاح الخاص
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="intercepted"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* تحذير الاعتراض */}
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-2 text-red-400 mb-3"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold">تم اعتراض البيانات!</span>
              </motion.div>

              {interceptedData && (
                <>
                  <div className="bg-red-900/20 rounded-lg p-3 border border-red-500/20">
                    <p className="text-gray-500 text-xs mb-1"># اسم المستخدم:</p>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-red-400 font-bold"
                    >
                      <TypingText text={interceptedData.username} delay={200} />
                    </motion.p>
                  </div>

                  <div className="bg-red-900/20 rounded-lg p-3 border border-red-500/20">
                    <p className="text-gray-500 text-xs mb-1"># كلمة المرور:</p>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-red-400 font-bold"
                    >
                      <TypingText text={interceptedData.password} delay={800} />
                    </motion.p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
