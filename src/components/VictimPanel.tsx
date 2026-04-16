"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Eye, EyeOff, LogIn, Monitor } from "lucide-react";
import type { LoginData, SimulationPhase } from "@/types";

interface VictimPanelProps {
  phase: SimulationPhase;
  onSubmit: (data: LoginData) => void;
}

export default function VictimPanel({ phase, onSubmit }: VictimPanelProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isActive = phase !== "idle" && phase !== "complete";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || isActive) return;
    onSubmit({ username: username.trim(), password: password.trim() });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className={`
        relative rounded-2xl p-6 border backdrop-blur-xl
        bg-blue-950/30 border-blue-500/30
        shadow-[0_0_30px_rgba(59,130,246,0.15)]
        transition-all duration-500
        ${phase === "sending" ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-950" : ""}
      `}
    >
      {/* رأس البطاقة */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Monitor className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-blue-400">الضحية</h2>
          <p className="text-xs text-gray-500">جهاز المستخدم</p>
        </div>
        <div className="mr-auto">
          <User className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* نموذج تسجيل الدخول */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* حقل اسم المستخدم */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            اسم المستخدم
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
              disabled={isActive}
              className="
                w-full px-4 py-3 pr-10 rounded-xl
                bg-gray-900/60 border border-gray-700/50
                text-white placeholder-gray-600
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                disabled:opacity-50 transition-all
              "
              autoComplete="off"
            />
            <User className="absolute top-3.5 right-3 w-4 h-4 text-gray-600" />
          </div>
        </div>

        {/* حقل كلمة المرور */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            كلمة المرور
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              disabled={isActive}
              className="
                w-full px-4 py-3 pr-10 pl-10 rounded-xl
                bg-gray-900/60 border border-gray-700/50
                text-white placeholder-gray-600
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                disabled:opacity-50 transition-all
              "
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3.5 left-3 text-gray-600 hover:text-gray-400 cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={isActive || !username.trim() || !password.trim()}
          className="
            w-full py-3 rounded-xl font-bold text-white cursor-pointer
            bg-linear-to-l from-blue-600 to-blue-500
            hover:from-blue-500 hover:to-blue-400
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2
            shadow-lg shadow-blue-500/25
            transition-all duration-150
            hover:scale-[1.02] active:scale-[0.98]
          "
        >
          <LogIn className="w-5 h-5" />
          <span>تسجيل الدخول</span>
        </button>
      </form>

      {/* مؤشر الإرسال */}
      {phase === "sending" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2"
        >
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-blue-400"
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* شريط حالة المحاكاة */}
      {phase !== "idle" && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2 }}
          className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl origin-right ${
            phase === "sending"
              ? "bg-blue-400"
              : phase === "complete"
              ? "bg-emerald-400"
              : "bg-yellow-400"
          }`}
        />
      )}
    </motion.div>
  );
}
