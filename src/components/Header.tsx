"use client";

import { Shield, Wifi, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import type { Protocol } from "@/types";

interface HeaderProps {
  protocol: Protocol;
}

export default function Header({ protocol }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      {/* شعار التطبيق */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Shield className="w-10 h-10 text-cyan-400" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold shimmer-text">
          محاكاة هجوم الرجل في المنتصف
        </h1>
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Shield className="w-10 h-10 text-purple-400" />
        </motion.div>
      </div>

      <p className="text-gray-400 text-lg mb-2">
        أداة تعليمية تفاعلية لفهم كيفية عمل هجمات MITM وطرق الحماية منها
      </p>

      {/* حالة البروتوكول الحالية */}
      <motion.div
        layout
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mt-2 ${
          protocol === "https"
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}
      >
        {protocol === "https" ? (
          <>
            <Shield className="w-4 h-4" />
            <span>الاتصال آمن - HTTPS</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4" />
            <span>الاتصال غير آمن - HTTP</span>
          </>
        )}
        <Wifi className="w-4 h-4" />
      </motion.div>
    </motion.header>
  );
}
