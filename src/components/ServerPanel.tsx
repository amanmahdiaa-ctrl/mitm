"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Server, CheckCircle, Database, Wifi } from "lucide-react";
import type { LoginData, SimulationPhase } from "@/types";

interface ServerPanelProps {
  phase: SimulationPhase;
  serverData: LoginData | null;
}

export default function ServerPanel({ phase, serverData }: ServerPanelProps) {
  const isReceived = phase === "complete" && serverData;

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className={`
        relative rounded-2xl p-6 border backdrop-blur-xl
        bg-emerald-950/30 border-emerald-500/30
        shadow-[0_0_30px_rgba(16,185,129,0.15)]
        transition-all duration-500
        ${phase === "delivering"
          ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-gray-950"
          : ""
        }
      `}
    >
      {/* رأس البطاقة */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Server className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-emerald-400">الخادم</h2>
          <p className="text-xs text-gray-500">خادم الويب</p>
        </div>
        <div className="mr-auto">
          <Database className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* حالة الخادم */}
      <div className="rounded-xl p-4 bg-gray-900/50 border border-emerald-900/30">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-800">
          <Wifi className="w-4 h-4 text-emerald-500" />
          <span className="text-gray-500 text-xs">server-status</span>
          <span className="mr-auto flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs">متصل</span>
          </span>
        </div>

        <AnimatePresence mode="wait">
          {!isReceived ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6 text-gray-600"
            >
              <Server className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>في انتظار الاتصال...</p>
              <p className="text-xs mt-1">port 443 | SSL active</p>
            </motion.div>
          ) : (
            <motion.div
              key="received"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* رسالة النجاح */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-emerald-400"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold">تم تسجيل الدخول بنجاح</span>
              </motion.div>

              {/* البيانات المستلمة */}
              <div className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-500/20">
                <p className="text-gray-500 text-xs mb-1">المستخدم:</p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-emerald-400 font-mono"
                >
                  {serverData.username}
                </motion.p>
              </div>

              <div className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-500/20">
                <p className="text-gray-500 text-xs mb-1">الحالة:</p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-emerald-400 text-sm"
                >
                  ✓ تم التحقق وقبول الجلسة
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* مؤشر الاستقبال */}
      {phase === "delivering" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-3 left-1/2 -translate-x-1/2"
        >
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-emerald-400"
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
