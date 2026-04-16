"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldAlert, X, Siren } from "lucide-react";
import { useState, useEffect } from "react";
import type { DetectionAlert } from "@/types";

interface DetectionBannerProps {
  alerts: DetectionAlert[];
}

const severityConfig = {
  low: {
    bg: "bg-yellow-500/10 border-yellow-500/30",
    text: "text-yellow-400",
    icon: AlertTriangle,
  },
  medium: {
    bg: "bg-orange-500/10 border-orange-500/30",
    text: "text-orange-400",
    icon: AlertTriangle,
  },
  high: {
    bg: "bg-red-500/10 border-red-500/30",
    text: "text-red-400",
    icon: ShieldAlert,
  },
  critical: {
    bg: "bg-red-500/20 border-red-400/50",
    text: "text-red-300",
    icon: Siren,
  },
};

export default function DetectionBanner({ alerts }: DetectionBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState<DetectionAlert[]>([]);

  useEffect(() => {
    setVisible(alerts.filter((a) => !dismissed.has(a.id)).slice(0, 3));
  }, [alerts, dismissed]);

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  if (visible.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {visible.map((alert) => {
          const cfg = severityConfig[alert.severity];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.9 }}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl pointer-events-auto ${cfg.bg}`}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cfg.text}`} />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${cfg.text}`}>تم اكتشاف نشاط مشبوه!</p>
                <p className="text-xs text-gray-400 mt-0.5">{alert.message}</p>
                <p className="text-[10px] text-gray-600 mt-1">{alert.time}</p>
              </div>
              <button
                onClick={() => dismiss(alert.id)}
                className="text-gray-600 hover:text-gray-300 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
