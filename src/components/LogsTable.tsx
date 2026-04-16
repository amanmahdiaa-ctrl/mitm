"use client";

import { motion, AnimatePresence } from "framer-motion";
import { List, ShieldAlert, ShieldCheck, Clock, Trash2 } from "lucide-react";
import type { LogEntry } from "@/types";

interface LogsTableProps {
  logs: LogEntry[];
}

export default function LogsTable({ logs }: LogsTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl p-6 border backdrop-blur-xl bg-gray-900/40 border-gray-700/30"
    >
      {/* رأس الجدول */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <List className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-purple-400">سجل المحاولات</h2>
          <p className="text-xs text-gray-500">
            {logs.length} محاولة مسجلة
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>لا توجد محاولات مسجلة بعد</p>
          <p className="text-xs mt-1">أرسل نموذج تسجيل الدخول لبدء المحاكاة</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-right py-3 px-3 font-medium">الوقت</th>
                <th className="text-right py-3 px-3 font-medium">
                  اسم المستخدم
                </th>
                <th className="text-right py-3 px-3 font-medium">
                  كلمة المرور
                </th>
                <th className="text-right py-3 px-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {logs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-b border-gray-800/50 ${
                      log.status === "intercepted"
                        ? "bg-red-950/10"
                        : "bg-green-950/10"
                    }`}
                  >
                    <td className="py-3 px-3 text-gray-400 font-mono text-xs">
                      {log.time}
                    </td>
                    <td
                      className={`py-3 px-3 font-mono ${
                        log.status === "intercepted"
                          ? "text-red-400"
                          : "text-gray-500"
                      }`}
                    >
                      {log.username}
                    </td>
                    <td
                      className={`py-3 px-3 font-mono ${
                        log.status === "intercepted"
                          ? "text-red-400"
                          : "text-gray-500"
                      }`}
                    >
                      {log.password}
                    </td>
                    <td className="py-3 px-3">
                      {log.status === "intercepted" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/20">
                          <ShieldAlert className="w-3 h-3" />
                          تم الاختراق
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          آمن
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
