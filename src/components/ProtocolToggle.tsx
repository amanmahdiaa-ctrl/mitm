"use client";

import { motion } from "framer-motion";
import { Lock, Unlock } from "lucide-react";
import type { Protocol } from "@/types";

interface ProtocolToggleProps {
  protocol: Protocol;
  onToggle: (protocol: Protocol) => void;
  disabled?: boolean;
}

export default function ProtocolToggle({
  protocol,
  onToggle,
  disabled = false,
}: ProtocolToggleProps) {
  const isHttps = protocol === "https";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3"
    >
      <h3 className="text-lg font-semibold text-gray-300">نوع البروتوكول</h3>

      <button
        onClick={() => onToggle(isHttps ? "http" : "https")}
        disabled={disabled}
        className={`
          relative w-64 h-14 rounded-full transition-all duration-500 cursor-pointer
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${isHttps
            ? "bg-green-900/50 border-2 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            : "bg-red-900/50 border-2 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          }
        `}
      >
        {/* المؤشر المتحرك */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`
            absolute top-1.5 w-28 h-10 rounded-full flex items-center justify-center gap-2
            font-bold text-sm
            ${isHttps
              ? "right-1.5 bg-green-500 text-white"
              : "left-1.5 bg-red-500 text-white"
            }
          `}
        >
          {isHttps ? (
            <>
              <Lock className="w-4 h-4" />
              <span>HTTPS</span>
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              <span>HTTP</span>
            </>
          )}
        </motion.div>

        {/* النص الخلفي */}
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <span
            className={`text-sm font-medium ${
              !isHttps ? "opacity-0" : "text-gray-400"
            }`}
          >
            غير آمن
          </span>
          <span
            className={`text-sm font-medium ${
              isHttps ? "opacity-0" : "text-gray-400"
            }`}
          >
            آمن
          </span>
        </div>
      </button>

      <p className="text-xs text-gray-500 text-center max-w-xs">
        {isHttps
          ? "البيانات مشفرة - المهاجم لا يستطيع قراءة المحتوى"
          : "البيانات غير مشفرة - المهاجم يستطيع قراءة كل شيء"}
      </p>
    </motion.div>
  );
}
