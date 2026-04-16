"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ShieldAlert,
  ShieldCheck,
  Database,
  TrendingUp,
  Activity,
  Wifi,
  Fish,
  KeyRound,
} from "lucide-react";
import PageShell from "@/components/PageShell";

// بيانات تجريبية للرسوم البيانية
const weeklyData = [
  { day: "السبت", mitm: 4, phishing: 2, bruteforce: 1 },
  { day: "الأحد", mitm: 6, phishing: 3, bruteforce: 2 },
  { day: "الإثنين", mitm: 3, phishing: 5, bruteforce: 4 },
  { day: "الثلاثاء", mitm: 7, phishing: 1, bruteforce: 3 },
  { day: "الأربعاء", mitm: 2, phishing: 4, bruteforce: 6 },
  { day: "الخميس", mitm: 5, phishing: 3, bruteforce: 2 },
  { day: "الجمعة", mitm: 8, phishing: 6, bruteforce: 5 },
];

const securityTrend = [
  { month: "يناير", score: 45 },
  { month: "فبراير", score: 52 },
  { month: "مارس", score: 60 },
  { month: "أبريل", score: 55 },
  { month: "مايو", score: 70 },
  { month: "يونيو", score: 78 },
  { month: "يوليو", score: 85 },
];

const pieData = [
  { name: "MITM", value: 35, color: "#3b82f6" },
  { name: "تصيد", value: 40, color: "#f59e0b" },
  { name: "قوة غاشمة", value: 25, color: "#ef4444" },
];

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change: string;
  color: string;
  delay: number;
}) {
  const colorMap: Record<string, string> = {
    red: "bg-red-500/15 border-red-500/30 text-red-400",
    green: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    blue: "bg-blue-500/15 border-blue-500/30 text-blue-400",
    yellow: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl p-5 border backdrop-blur-xl ${colorMap[color]}`}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-6 h-6" />
        <span className="text-xs opacity-60">{change}</span>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm opacity-70">{label}</p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold shimmer-text mb-2">لوحة التحكم</h1>
          <p className="text-gray-500">نظرة شاملة على حالة الأمن السيبراني</p>
        </motion.div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={ShieldAlert} label="إجمالي الهجمات" value={127} change="+12%" color="red" delay={0.1} />
          <StatCard icon={Database} label="بيانات مسروقة" value={43} change="+5%" color="yellow" delay={0.15} />
          <StatCard icon={ShieldCheck} label="نسبة الأمان" value="78%" change="+8%" color="green" delay={0.2} />
          <StatCard icon={TrendingUp} label="هجمات محجوبة" value={84} change="+15%" color="blue" delay={0.25} />
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* رسم بياني - الهجمات الأسبوعية */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-6 border backdrop-blur-xl bg-gray-900/40 border-gray-700/30"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-gray-200">الهجمات الأسبوعية</h3>
            </div>
            {mounted && (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "12px",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="mitm" fill="#3b82f6" radius={[4, 4, 0, 0]} name="MITM" />
                  <Bar dataKey="phishing" fill="#f59e0b" radius={[4, 4, 0, 0]} name="تصيد" />
                  <Bar dataKey="bruteforce" fill="#ef4444" radius={[4, 4, 0, 0]} name="قوة غاشمة" />
                </BarChart>
              </ResponsiveContainer>
            )}
            {/* دلالة الألوان */}
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><Wifi className="w-3 h-3 text-blue-400" />MITM</span>
              <span className="flex items-center gap-1.5"><Fish className="w-3 h-3 text-yellow-400" />تصيد</span>
              <span className="flex items-center gap-1.5"><KeyRound className="w-3 h-3 text-red-400" />قوة غاشمة</span>
            </div>
          </motion.div>

          {/* رسم بياني - اتجاه الأمان */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl p-6 border backdrop-blur-xl bg-gray-900/40 border-gray-700/30"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-gray-200">اتجاه نسبة الأمان</h3>
            </div>
            {mounted && (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={securityTrend}>
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "12px",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 5 }}
                    name="نسبة الأمان %"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* الصف السفلي */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* توزيع أنواع الهجمات */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-6 border backdrop-blur-xl bg-gray-900/40 border-gray-700/30"
          >
            <h3 className="font-bold text-gray-200 mb-4">توزيع الهجمات</h3>
            {mounted && (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "12px",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="flex justify-center gap-4 text-xs text-gray-500 mt-2">
              {pieData.map((d) => (
                <span key={d.name} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </span>
              ))}
            </div>
          </motion.div>

          {/* آخر الأحداث */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="lg:col-span-2 rounded-2xl p-6 border backdrop-blur-xl bg-gray-900/40 border-gray-700/30"
          >
            <h3 className="font-bold text-gray-200 mb-4">آخر الأحداث</h3>
            <div className="space-y-3">
              {[
                { msg: "محاولة اعتراض MITM على اتصال HTTP", severity: "high" as const, time: "منذ 2 دقيقة" },
                { msg: "صفحة تصيد تم اكتشافها وحجبها", severity: "medium" as const, time: "منذ 15 دقيقة" },
                { msg: "محاولة تسجيل دخول بالقوة الغاشمة (23 محاولة)", severity: "critical" as const, time: "منذ 30 دقيقة" },
                { msg: "شهادة SSL تم التحقق منها بنجاح", severity: "low" as const, time: "منذ ساعة" },
                { msg: "تحديث قاعدة بيانات التهديدات", severity: "low" as const, time: "منذ ساعتين" },
              ].map((evt, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-800/30 border border-gray-800/50"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      evt.severity === "critical"
                        ? "bg-red-400 animate-pulse"
                        : evt.severity === "high"
                        ? "bg-orange-400"
                        : evt.severity === "medium"
                        ? "bg-yellow-400"
                        : "bg-green-400"
                    }`}
                  />
                  <span className="text-sm text-gray-300 flex-1">{evt.msg}</span>
                  <span className="text-xs text-gray-600 whitespace-nowrap">{evt.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
}
