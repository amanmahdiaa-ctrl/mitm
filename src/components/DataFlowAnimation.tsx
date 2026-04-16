"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Zap, Shield, Skull, Server } from "lucide-react";
import type { SimulationPhase, Protocol } from "@/types";

interface DataFlowAnimationProps {
  phase: SimulationPhase;
  protocol: Protocol;
}

// مكون السهم المتحرك بين اللوحات - SVG
function AnimatedArrow({
  active,
  color,
  label,
  reverse = false,
}: {
  active: boolean;
  color: string;
  label: string;
  reverse?: boolean;
}) {
  const gradId = `grad-${color}-${reverse ? "r" : "l"}`;
  const glowId = `glow-${color}-${reverse ? "r" : "l"}`;

  const colorMap: Record<string, { main: string; glow: string; bg: string }> = {
    red: { main: "#ef4444", glow: "rgba(239,68,68,0.6)", bg: "rgba(239,68,68,0.1)" },
    green: { main: "#22c55e", glow: "rgba(34,197,94,0.6)", bg: "rgba(34,197,94,0.1)" },
    blue: { main: "#3b82f6", glow: "rgba(59,130,246,0.6)", bg: "rgba(59,130,246,0.1)" },
    emerald: { main: "#10b981", glow: "rgba(16,185,129,0.6)", bg: "rgba(16,185,129,0.1)" },
    yellow: { main: "#eab308", glow: "rgba(234,179,8,0.6)", bg: "rgba(234,179,8,0.1)" },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="flex-1 relative">
      <svg width="100%" height="60" viewBox="0 0 200 60" preserveAspectRatio="none" className="overflow-visible">
        <defs>
          {/* تدرج لوني للسهم */}
          <linearGradient id={gradId} x1={reverse ? "100%" : "0%"} y1="0%" x2={reverse ? "0%" : "100%"} y2="0%">
            <stop offset="0%" stopColor={c.main} stopOpacity="0.1" />
            <stop offset="50%" stopColor={c.main} stopOpacity="0.8" />
            <stop offset="100%" stopColor={c.main} stopOpacity="0.1" />
          </linearGradient>
          {/* تأثير التوهج */}
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* خط السهم الأساسي */}
        <line x1="10" y1="30" x2="190" y2="30" stroke="#1f2937" strokeWidth="2" strokeDasharray="6,4" />

        {/* رأس السهم */}
        <polygon
          points={reverse ? "20,24 10,30 20,36" : "180,24 190,30 180,36"}
          fill="#374151"
        />

        {/* خط متحرك عند التفعيل */}
        {active && (
          <>
            <motion.line
              x1="10" y1="30" x2="190" y2="30"
              stroke={`url(#${gradId})`}
              strokeWidth="3"
              filter={`url(#${glowId})`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            {/* نقاط بيانات متحركة */}
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cy="30"
                r="3"
                fill={c.main}
                filter={`url(#${glowId})`}
                initial={{ cx: reverse ? 190 : 10 }}
                animate={{ cx: reverse ? 10 : 190 }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
            {/* رأس السهم المضيء */}
            <motion.polygon
              points={reverse ? "20,24 10,30 20,36" : "180,24 190,30 180,36"}
              fill={c.main}
              filter={`url(#${glowId})`}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </>
        )}
      </svg>

      {/* التسمية */}
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

// مكون حزمة البيانات المتحركة
function DataPacket({
  isSecure,
  type,
}: {
  isSecure: boolean;
  type: "sending" | "delivering";
}) {
  return (
    <motion.div
      initial={{ x: type === "sending" ? 80 : 0, opacity: 0, scale: 0.5 }}
      animate={{
        x: type === "sending" ? -80 : -80,
        opacity: [0, 1, 1, 1, 0],
        scale: [0.5, 1, 1, 1, 0.5],
      }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
    >
      <div
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap backdrop-blur-md shadow-lg ${
          type === "delivering"
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/20"
            : isSecure
            ? "bg-green-500/20 text-green-300 border border-green-500/40 shadow-green-500/20"
            : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-yellow-500/20"
        }`}
      >
        {type === "delivering" ? (
          <Zap className="w-3.5 h-3.5" />
        ) : isSecure ? (
          <Lock className="w-3.5 h-3.5" />
        ) : (
          <Unlock className="w-3.5 h-3.5" />
        )}
        <span>{type === "delivering" ? "تسليم" : isSecure ? "مشفّر" : "نص عادي"}</span>
      </div>
    </motion.div>
  );
}

export default function DataFlowAnimation({
  phase,
  protocol,
}: DataFlowAnimationProps) {
  const isSecure = protocol === "https";

  const leftArrowActive = phase === "sending" || phase === "intercepting";
  const rightArrowActive = phase === "delivering" || phase === "complete";

  return (
    <div className="relative w-full py-4 mb-4">
      <div className="flex items-center gap-0">
        {/* أيقونة الضحية */}
        <motion.div
          animate={phase === "sending" ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.8, repeat: phase === "sending" ? Infinity : 0 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
            phase === "sending"
              ? "bg-blue-500/30 border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
              : "bg-gray-800/50 border-2 border-gray-700/50"
          }`}
        >
          <Shield className={`w-5 h-5 ${phase === "sending" ? "text-blue-400" : "text-gray-600"}`} />
        </motion.div>

        {/* السهم الأول: الضحية → المهاجم */}
        <AnimatedArrow
          active={leftArrowActive}
          color={isSecure ? "green" : "red"}
          label="الضحية ← المهاجم"
        />

        {/* حزمة البيانات المتحركة الأولى */}
        <AnimatePresence>
          {phase === "sending" && (
            <DataPacket isSecure={isSecure} type="sending" />
          )}
        </AnimatePresence>

        {/* أيقونة المهاجم في المنتصف */}
        <motion.div
          animate={
            phase === "intercepting"
              ? { scale: [1, 1.3, 1], rotate: [0, 5, -5, 0] }
              : {}
          }
          transition={{
            duration: 0.6,
            repeat: phase === "intercepting" ? Infinity : 0,
          }}
          className={`
            relative z-10 w-14 h-14 rounded-full flex items-center justify-center shrink-0
            transition-all duration-500
            ${
              phase === "intercepting" && !isSecure
                ? "bg-red-500/30 border-2 border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.5)]"
                : phase === "intercepting" && isSecure
                ? "bg-green-500/20 border-2 border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                : "bg-gray-800/50 border-2 border-gray-700/50"
            }
          `}
        >
          <Skull
            className={`w-6 h-6 ${
              phase === "intercepting" && !isSecure
                ? "text-red-400"
                : phase === "intercepting" && isSecure
                ? "text-green-400"
                : "text-gray-600"
            }`}
          />

          {/* حلقات توهج متعددة عند الاعتراض */}
          {phase === "intercepting" && !isSecure && (
            <>
              <motion.div
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-red-400"
              />
              <motion.div
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1.5, delay: 0.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-red-500"
              />
            </>
          )}
          {phase === "intercepting" && isSecure && (
            <motion.div
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-green-500"
            />
          )}
        </motion.div>

        {/* السهم الثاني: المهاجم → الخادم */}
        <AnimatedArrow
          active={rightArrowActive}
          color="emerald"
          label="المهاجم ← الخادم"
        />

        {/* حزمة البيانات المتحركة الثانية */}
        <AnimatePresence>
          {phase === "delivering" && (
            <DataPacket isSecure={isSecure} type="delivering" />
          )}
        </AnimatePresence>

        {/* أيقونة الخادم */}
        <motion.div
          animate={phase === "delivering" ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.8, repeat: phase === "delivering" ? Infinity : 0 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
            phase === "delivering" || phase === "complete"
              ? "bg-emerald-500/30 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              : "bg-gray-800/50 border-2 border-gray-700/50"
          }`}
        >
          <Server
            className={`w-5 h-5 ${
              phase === "delivering" || phase === "complete"
                ? "text-emerald-400"
                : "text-gray-600"
            }`}
          />
        </motion.div>
      </div>

      {/* تسميات الأيقونات */}
      <div className="flex justify-between mt-2 px-1">
        <span className="text-[10px] text-gray-500 w-12 text-center">الضحية</span>
        <span className="text-[10px] text-gray-500 w-14 text-center">المهاجم</span>
        <span className="text-[10px] text-gray-500 w-12 text-center">الخادم</span>
      </div>

      {/* مؤشر حالة المحاكاة */}
      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mt-4"
          >
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${
                phase === "sending"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : phase === "intercepting" && !isSecure
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : phase === "intercepting" && isSecure
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : phase === "delivering"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
              }`}
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className={`w-2 h-2 rounded-full ${
                  phase === "sending"
                    ? "bg-blue-400"
                    : phase === "intercepting" && !isSecure
                    ? "bg-red-400"
                    : phase === "intercepting" && isSecure
                    ? "bg-green-400"
                    : phase === "delivering"
                    ? "bg-emerald-400"
                    : "bg-purple-400"
                }`}
              />
              {phase === "sending" && "جارٍ إرسال البيانات..."}
              {phase === "intercepting" && !isSecure && "⚠️ يتم اعتراض البيانات!"}
              {phase === "intercepting" && isSecure && "🔒 البيانات مشفرة - الاعتراض فاشل"}
              {phase === "delivering" && "جارٍ التوصيل للخادم..."}
              {phase === "complete" && "✓ اكتملت العملية"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
